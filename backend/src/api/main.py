from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from ..transliteration.gurmukhi_iso15919 import GurmukhiISO15919
from ..transliteration.gurmukhi_practical import GurmukhiPractical
import speech_recognition as sr
import io
import wave

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
async def process_audio(audio: UploadFile = File(...)):
    try:
        # Read the uploaded file
        contents = await audio.read()
        audio_bytes = io.BytesIO(contents)

        # Initialize recognizer
        recognizer = sr.Recognizer()
        
        # Convert to AudioFile
        with sr.AudioFile(audio_bytes) as source:
            audio_data = recognizer.record(source)
            
            try:
                # Convert speech to text
                text = recognizer.recognize_google(audio_data)
                print(f"Recognized text: {text}")

                # Simple matching logic
                matches = []
                for sentence in SAMPLE_SENTENCES:
                    # Calculate simple similarity
                    similarity = sum(1 for a, b in zip(text.lower(), sentence.lower()) if a == b)
                    matches.append({
                        "text": sentence,
                        "similarity_score": similarity,
                        "reason": f"Matched {similarity} characters"
                    })

                # Sort by similarity score
                matches.sort(key=lambda x: x["similarity_score"], reverse=True)
                top_matches = matches[:3]

                return {"top_matches": top_matches}
            except sr.UnknownValueError:
                return {"error": "Could not understand audio"}
            except sr.RequestError as e:
                return {"error": f"Could not request results; {str(e)}"}

    except Exception as e:
        print(f"Error processing audio: {e}")
        return {"error": str(e)}

"""
TODO: API Enhancements
- Add endpoint for custom transliteration rules
- Add endpoint for IPA conversion
- Add endpoint to retrieve complete mapping documentation
- Add support for non-unicode input processing
- Add validation for custom rule specifications
"""
