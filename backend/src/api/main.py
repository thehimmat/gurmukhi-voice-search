from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from ..transliteration.gurmukhi_iso15919 import GurmukhiISO15919
from ..transliteration.gurmukhi_practical import GurmukhiPractical
import speech_recognition as sr
import io
import wave
import tempfile
import os
from src.voice.main import process_audio

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TransliterationRequest(BaseModel):
    text: str
    style: str = "iso15919"  # Default to ISO 15919

@app.post("/transliterate")
async def transliterate(request: TransliterationRequest):
    try:
        if request.style == "practical":
            result = GurmukhiPractical.to_practical(request.text)
        else:  # default to ISO 15919
            result = GurmukhiISO15919.to_phonetic(request.text)
        
        return {"result": result}
    except Exception as e:
        return {"error": str(e)}

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

@app.post("/process_audio")
async def handle_audio(audio: UploadFile = File(...)):
    try:
        print("Receiving audio file...")
        contents = await audio.read()
        print(f"Received audio size: {len(contents)} bytes")

        # Save the audio file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            temp_file.write(contents)
            temp_path = temp_file.name
            print(f"Saved temporary file: {temp_path}")

        try:
            # Process the audio using your existing function
            print("Processing audio with wav2vec2...")
            result = process_audio(temp_path)
            print(f"Processing complete. Transcription: {result['transcription']}")
            
            # Clean up the temporary file
            os.unlink(temp_path)
            
            return result
        except Exception as e:
            print(f"Error during audio processing: {e}")
            return {"error": f"Audio processing failed: {str(e)}"}
        finally:
            # Ensure temp file is removed even if processing fails
            if os.path.exists(temp_path):
                os.unlink(temp_path)
                
    except Exception as e:
        print(f"Error handling upload: {e}")
        return {"error": str(e)}

"""
TODO: API Enhancements
- Add endpoint for custom transliteration rules
- Add endpoint for IPA conversion
- Add endpoint to retrieve complete mapping documentation
- Add support for non-unicode input processing
- Add validation for custom rule specifications
"""
