from transformers import Wav2Vec2Processor, Wav2Vec2Model
import torch
import numpy as np

class AudioEmbeddingGenerator:
    def __init__(self):
        self.processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-base")
        self.model = Wav2Vec2Model.from_pretrained("facebook/wav2vec2-base")
        self.sample_rate = 16000  # Wav2Vec2 expects 16kHz

    def preprocess_audio(self, audio_array: np.ndarray) -> torch.Tensor:
        """Convert audio array to model inputs"""
        # Ensure audio is mono and at correct sample rate
        if len(audio_array.shape) > 1:
            audio_array = audio_array.mean(axis=1)
        
        # Normalize
        audio_array = audio_array / np.max(np.abs(audio_array))
        
        # Convert to model inputs
        inputs = self.processor(
            audio_array,
            sampling_rate=self.sample_rate,
            return_tensors="pt"
        )
        return inputs.input_values

    def generate_embedding(self, audio_array: np.ndarray) -> np.ndarray:
        """Generate embedding from audio array"""
        inputs = self.preprocess_audio(audio_array)
        
        with torch.no_grad():
            outputs = self.model(inputs)
            # Use mean pooling to get fixed-size embedding
            embedding = outputs.last_hidden_state.mean(dim=1)
        
        return embedding.numpy()
