#!/bin/bash

# Start backend
cd backend
source venv/bin/activate
uvicorn src.api.main:app --reload --port 8000 &

# Start transliteration service
cd ../transliteration-service
npm start &

# Start frontend
cd ../frontend
npm start &

# Wait for all background processes
wait 