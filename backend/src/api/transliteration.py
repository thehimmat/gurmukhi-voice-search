from fastapi import APIRouter
from pydantic import BaseModel
from src.transliteration.gurmukhi_iso15919 import GurmukhiISO15919

router = APIRouter()

class TransliterationRequest(BaseModel):
    text: str

@router.post("/convert")
async def transliterate(request: TransliterationRequest):
    print("Received text:", request.text)
    result = GurmukhiISO15919.to_phonetic(request.text)
    print("Converted to:", result)
    return {"result": result} 