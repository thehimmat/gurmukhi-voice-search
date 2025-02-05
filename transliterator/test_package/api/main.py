"""Main FastAPI application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
import logging
import sys

# Enhanced logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Log Python path and current directory
logger.debug(f"Python path: {sys.path}")
logger.debug(f"Current working directory: {sys.path[0]}")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://gurmukhitransliterator.com.s3-website-us-east-1.amazonaws.com",
        "https://d2c3zvdre9p3i0.cloudfront.net",
        "https://gurmukhitransliterator.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    logger.debug("Root endpoint called")
    return {"status": "healthy"}

# Log when handler is created
logger.debug("Creating Mangum handler")
handler = Mangum(app, lifespan="auto")
logger.debug("Mangum handler created successfully")