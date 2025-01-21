"""Main FastAPI application."""

from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from ..transliteration.gurmukhi_iso15919 import GurmukhiISO15919
from ..transliteration.gurmukhi_practical import GurmukhiPractical
from ..transliteration.gurmukhi_legacy import GurmukhiLegacy
from ..core.exceptions import TransliterationError
from ..core.validators import (
    validate_gurmukhi_text,
    validate_legacy_text,
    validate_style,
    SUPPORTED_STYLES
)
from ..core.middleware import error_handler_middleware
import logging
from anvaad_py import unicode as anvaad_unicode
import httpx

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Gurmukhi Transliterator API",
    description="API for converting between different Gurmukhi text formats",
    version="1.0.0"
)

# Add middleware
app.middleware("http")(error_handler_middleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TransliterationRequest(BaseModel):
    text: str
    inputFormat: str
    outputFormat: str

# Format mapping
FORMAT_MAP = {
    "anvaad": "english",
    "ipa": "ipa",
    "devnagri": "devnagri",
    "shahmukhi": "shahmukhi"
}

@app.post("/api/v1/transliterate")
async def transliterate(request: TransliterationRequest):
    """Convert text between different Gurmukhi formats."""
    try:
        text = request.text
        logger.debug(f"Initial request - Text: '{text}', Input Format: {request.inputFormat}, Output Format: {request.outputFormat}")
        
        # Convert to Unicode if needed
        unicode_text = text
        if request.inputFormat != "unicode":
            try:
                # Use our legacy converter for all non-Unicode input
                try:
                    unicode_text = GurmukhiLegacy.to_unicode(text)
                    logger.debug(f"Converted legacy to Unicode: {unicode_text}")
                except Exception as e:
                    logger.warning(f"Legacy conversion failed, trying Anvaad: {str(e)}")
                    # Fallback to Anvaad if our converter fails
                    async with httpx.AsyncClient() as client:
                        response = await client.post(
                            'http://localhost:3001/transliterate',
                            json={'text': text, 'format': 'unicode'},
                            timeout=10.0
                        )
                        if response.status_code == 200:
                            unicode_text = response.json()['result']
                            logger.debug(f"Converted ASCII to Unicode using Anvaad: {unicode_text}")
                        else:
                            raise HTTPException(
                                status_code=response.status_code,
                                detail=f"Unicode conversion error: {response.text}"
                            )
            except Exception as e:
                logger.error(f"Error converting to Unicode: {str(e)}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Error converting to Unicode: {str(e)}"
                )

        # Handle output formats
        if request.outputFormat == "unicode":
            return {"result": unicode_text}
        elif request.outputFormat == "iso15919":
            result = GurmukhiISO15919.to_phonetic(unicode_text)
            return {"result": result}
        elif request.outputFormat == "practical":
            result = GurmukhiPractical.to_practical(unicode_text)
            return {"result": result}
            
        # For all other formats (anvaad, ipa, devnagri, shahmukhi)
        # use Node.js service with Unicode input
        nodejs_format = "english" if request.outputFormat == "anvaad" else request.outputFormat
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    'http://localhost:3001/transliterate',
                    json={'text': unicode_text, 'format': nodejs_format},
                    timeout=10.0
                )
                if response.status_code == 200:
                    return response.json()
                else:
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Transliteration service error: {response.text}"
                    )
            except httpx.RequestError as e:
                logger.error(f"Error calling Node.js service: {str(e)}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Error communicating with transliteration service: {str(e)}"
                )
    except Exception as e:
        logger.error(f"Error during transliteration: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/styles")
async def get_styles():
    """Get list of supported transliteration styles."""
    return {"styles": list(FORMAT_MAP.keys())}

@app.get("/api/v1/health")
async def health_check():
    """Simple health check endpoint."""
    return {"status": "healthy"}

@app.get("/api/v1/legacy-characters")
async def get_legacy_characters():
    """Return all valid legacy special characters."""
    try:
        special_chars = set()
        
        # Add ALL characters from SPECIAL_COMBINATIONS
        for combo in GurmukhiLegacy.SPECIAL_COMBINATIONS.keys():
            special_chars.update(combo)
            logger.debug(f"Added from SPECIAL_COMBINATIONS: {combo}")
        
        # Add ALL characters from ANMOLLIPI_MAP
        for char in GurmukhiLegacy.ANMOLLIPI_MAP.keys():
            special_chars.add(char)  # Include all characters, not just non-ASCII
            logger.debug(f"Added from ANMOLLIPI_MAP: {char}")
                
        # Add ALL characters from SUBJOINED_MAP
        for char in GurmukhiLegacy.SUBJOINED_MAP.keys():
            special_chars.add(char)  # Include all characters, not just non-ASCII
            logger.debug(f"Added from SUBJOINED_MAP: {char}")

        result = sorted(list(special_chars))
        logger.info(f"Successfully generated legacy characters list with {len(result)} characters")
        
        # Debug output to verify all mappings are included
        logger.debug("Special combinations keys:", GurmukhiLegacy.SPECIAL_COMBINATIONS.keys())
        logger.debug("AnmolLipi map keys:", GurmukhiLegacy.ANMOLLIPI_MAP.keys())
        logger.debug("Subjoined map keys:", GurmukhiLegacy.SUBJOINED_MAP.keys())
        
        return {"characters": result}
    except Exception as e:
        logger.error(f"Error generating legacy characters: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Add CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
) 