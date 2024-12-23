# Gurmukhi Transliterator Backend

This is the backend for the Gurmukhi Transliterator application, built with FastAPI.

## Setup Instructions

1. Make sure you have Python 3.8 or higher installed
2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```
3. Install dependencies:
```bash
pip install -r requirements.txt
```
   Required packages:
   - fastapi==0.109.0
   - uvicorn==0.27.0
   - pydantic==2.5.3

4. Start the development server:
```bash
PYTHONPATH=$PYTHONPATH:. uvicorn src.api.main:app --reload --port 8000
```

The API will be available at http://localhost:8000

## Troubleshooting

1. If PYTHONPATH is not set correctly, you might see import errors
2. Make sure all dependencies are installed correctly
3. Check that port 8000 is available
4. If you see version conflicts, try creating a fresh virtual environment 