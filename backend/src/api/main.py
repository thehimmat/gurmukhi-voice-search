from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from ..transliteration.gurmukhi_iso15919 import GurmukhiISO15919
from ..transliteration.gurmukhi_practical import GurmukhiPractical

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
