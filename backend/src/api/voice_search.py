from fastapi import APIRouter
from src.voice.main import process_audio  # Import your existing voice search function

router = APIRouter()

@router.post("/process")
async def process_voice_search(audio_file: str):  # You'll need to handle file upload
    result = process_audio(audio_file)
    return result 