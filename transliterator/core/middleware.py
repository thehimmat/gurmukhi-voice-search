"""Middleware for handling errors and logging."""

from fastapi import Request
from fastapi.responses import JSONResponse
from .exceptions import TransliterationError
import logging
import time
from typing import Callable

logger = logging.getLogger(__name__)

async def error_handler_middleware(request: Request, call_next: Callable):
    """Handle errors and add request timing."""
    start_time = time.time()
    
    try:
        response = await call_next(request)
        
    except TransliterationError as e:
        logger.warning(f"Transliteration error: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=400,
            content={
                "error": e.message,
                "details": e.details,
                "type": e.__class__.__name__
            }
        )
        
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal server error",
                "type": "UnexpectedError"
            }
        )
    
    # Add processing time header
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    
    return response 