import torch
import torchaudio
from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC
from sentence_transformers import SentenceTransformer
from scipy.spatial.distance import cosine
import numpy as np
import jellyfish
from src.transliteration.gurmukhi_phonetics import GurmukhiPhonetics

# Load Models
processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-base-960h")
wav2vec_model = Wav2Vec2ForCTC.from_pretrained("facebook/wav2vec2-base-960h")
embedding_model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

# Example Text Dataset
texts = [
    "The rain kept falling all afternoon while we watched from inside.",
    "Two children sat bored by the window, wondering what games they could play.",
    "Their mother was away, and the house was quiet and still.",
    "Suddenly there was a loud knock at the front door.",
    "The living room was a mess, with toys scattered everywhere.",
    "They knew they should clean up before their mother returned home.",
    "Games and fun are great, but responsibility matters too.",
    "The fish in the bowl watched everything with interest.",
    "Outside, the rain continued to tap against the windows.",
    "They promised to put everything back exactly where it belonged.",
    "Sometimes the best adventures happen on the rainiest days.",
    "The clock on the wall showed it was almost time.",
]

# Precompute Embeddings for the Dataset
text_embeddings = embedding_model.encode(texts)

def process_audio(audio_path):
    # Load and preprocess audio
    audio_tensor, sample_rate = torchaudio.load(audio_path)
    if audio_tensor.dim() > 1:
        audio_tensor = audio_tensor.squeeze(0)
    
    # Resample if needed (wav2vec2 expects 16kHz)
    if sample_rate != 16000:
        resampler = torchaudio.transforms.Resample(sample_rate, 16000)
        audio_tensor = resampler(audio_tensor)
    
    # Transcribe audio
    input_values = processor(audio_tensor, sampling_rate=16000, return_tensors="pt").input_values
    logits = wav2vec_model(input_values).logits
    predicted_ids = logits.argmax(dim=-1)
    transcription = processor.decode(predicted_ids[0])
    
    # Generate embedding and find best matches
    query_embedding = embedding_model.encode(transcription)
    similarities = [1 - cosine(query_embedding, emb) for emb in text_embeddings]
    
    # Get indices of top 3 matches
    top_3_indices = np.argsort(similarities)[-3:][::-1]
    
    def analyze_similarity(text1, text2):
        # Convert to phonetic representation before comparison
        phonetic1 = GurmukhiPhonetics.to_phonetic(text1)
        phonetic2 = GurmukhiPhonetics.to_phonetic(text2)
        
        # Convert to lowercase and split into words
        words1 = set(phonetic1.lower().split())
        words2 = set(phonetic2.lower().split())
        
        # TODO: These English stop words will need to be replaced or handled differently
        # when adding support for other languages. Consider using a language-specific
        # stop words library like NLTK or spaCy
        exact_matches = words1 & words2 - {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
        
        # Find similar sounding words
        sound_matches = []
        for word1 in words1:
            for word2 in words2:
                if word1 != word2:  # Skip exact matches as we handled them above
                    # Use metaphone instead of double_metaphone
                    m1 = jellyfish.metaphone(word1)
                    m2 = jellyfish.metaphone(word2)
                    
                    # Also check Levenshtein distance for similar spellings
                    lev_dist = jellyfish.levenshtein_distance(word1, word2)
                    
                    if (m1 == m2) or (lev_dist <= 2 and len(word1) > 3):
                        sound_matches.append(f"{word1}≈{word2}")

        reasons = []
        if exact_matches:
            reasons.append(f"Exact matches: {', '.join(exact_matches)}")
        if sound_matches:
            reasons.append(f"Similar sounding: {', '.join(sound_matches)}")
            
        return " | ".join(reasons) if reasons else "No direct word matches found"

    top_3_matches = [
        {
            "text": texts[idx],
            "similarity_score": similarities[idx],
            "reason": analyze_similarity(transcription, texts[idx])
        }
        for idx in top_3_indices
    ]
    
    return {
        "transcription": transcription,
        "top_matches": top_3_matches
    }

# Usage example:
if __name__ == "__main__":
    wav_file = "/Users/himmat/voice_search_poc/query.wav"
    result = process_audio(wav_file)
    print("Transcription:", result["transcription"])
    print("\nTop 3 Matches:")
    for i, match in enumerate(result["top_matches"], 1):
        print(f"\n{i}. Text: {match['text']}")
        print(f"   Similarity: {match['similarity_score']:.3f}")
        print(f"   Reason: {match['reason']}")
