from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from ..transliteration.gurmukhi_iso15919 import GurmukhiISO15919
from ..transliteration.gurmukhi_practical import GurmukhiPractical
from ..transliteration.gurmukhi_legacy import GurmukhiLegacy
import speech_recognition as sr
import io
import wave
import tempfile
import os
from src.voice.main import process_audio
from src.embeddings.audio_processor import AudioEmbeddingGenerator
import soundfile as sf
import logging
import librosa
import numpy as np
from pydub import AudioSegment
import time

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TransliterationRequest(BaseModel):
    text: str = Field(..., max_length=10000)  # Limit text length
    style: str = "iso15919"

@app.post("/transliterate")
async def transliterate(request: TransliterationRequest):
    try:
        # If empty or whitespace-only string, return empty result
        if not request.text or not request.text.strip():
            logger.debug("Received empty input, returning empty result")
            return {"result": ""}
            
        logger.debug(f"Received text: '{request.text}' with style: {request.style}")
        
        if request.style == "practical":
            result = GurmukhiPractical.to_practical(request.text)
        elif request.style == "legacy":
            logger.debug("Starting legacy conversion...")
            result = GurmukhiLegacy.to_unicode(request.text, 'anmollipi')
            logger.debug(f"Completed legacy conversion: '{result}'")
        else:  # default to ISO 15919
            result = GurmukhiISO15919.to_phonetic(request.text)
        
        return {"result": result}
    except Exception as e:
        logger.error(f"Error during transliteration: {str(e)}", exc_info=True)
        return {"result": ""}  # Return empty on error

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
# Sample sentences to search through
SAMPLE_SENTENCES = [
    "This is a test sentence",
    "Another example phrase",
    "Something completely different",
    "Testing voice recognition",
    "Final test sentence"
]

audio_embedder = AudioEmbeddingGenerator()

@app.post("/process_audio")
async def process_audio(file: UploadFile = File(...)):
    try:
        logger.info(f"Received file: {file.filename}, content_type: {file.content_type}")
        contents = await file.read()
        
        # Save webm to temporary file
        with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as temp_webm:
            temp_webm.write(contents)
            temp_webm_path = temp_webm.name

        try:
            # Convert webm to wav using pydub
            audio = AudioSegment.from_file(temp_webm_path, format="webm")
            
            # Save as WAV temporarily
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_wav:
                audio.export(temp_wav.name, format='wav')
                
                # Load with librosa
                audio_data, sample_rate = librosa.load(
                    temp_wav.name,
                    sr=16000,  # Wav2Vec2 expects 16kHz
                    mono=True
                )

            # Clean up temporary files
            os.unlink(temp_webm_path)
            os.unlink(temp_wav.name)

            logger.info(f"Successfully processed audio: shape={audio_data.shape}, sample_rate={sample_rate}")
            
            # Generate embedding
            embedding = audio_embedder.generate_embedding(audio_data)
            
            return {
                "status": "success",
                "message": "Audio processed successfully",
                "audio_stats": {
                    "duration_seconds": len(audio_data) / sample_rate,
                    "sample_rate": sample_rate
                },
                "embedding_info": {
                    "shape": embedding.shape,
                    "sample": embedding[0][:10].tolist(),
                    "statistics": {
                        "mean": float(embedding.mean()),
                        "std": float(embedding.std()),
                        "min": float(embedding.min()),
                        "max": float(embedding.max())
                    }
                }
            }

        except Exception as e:
            logger.error(f"Error processing audio: {str(e)}")
            raise HTTPException(status_code=422, detail=f"Error processing audio: {str(e)}")

    except Exception as e:
        logger.error(f"Error in process_audio: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

"""
TODO: API Enhancements
- Add endpoint for custom transliteration rules
- Add endpoint for IPA conversion
- Add endpoint to retrieve complete mapping documentation
- Add support for non-unicode input processing
- Add validation for custom rule specifications
"""

