from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .transliteration import router as transliteration_router
from .voice_search import router as voice_search_router

app = FastAPI(title="Gurmukhi Voice Search API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount both routers
app.include_router(transliteration_router, prefix="/api/transliteration", tags=["transliteration"])
app.include_router(voice_search_router, prefix="/api/voice-search", tags=["voice-search"])
