# Gurmukhi Transliterator

Convert between different Gurmukhi text formats and transliteration systems.

## Features
- Convert legacy Gurmukhi fonts to Unicode
- Transliterate using multiple systems:
  - ISO 15919
  - Sant Singh Khalsa style
  - Practical phonetic system
- Clean and normalize Unicode Gurmukhi text
- Handle malformed Unicode text
- Batch processing support

## Quick Start
```bash
# Start the backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.api.main:app --reload --port 8000

# In another terminal, start the frontend
cd frontend
npm install
npm start
```

## API Usage
```python
# Convert legacy to Unicode
POST /api/v1/transliterate
{
    "text": "your_text_here",
    "style": "legacy"
}

# Convert to ISO 15919
POST /api/v1/transliterate
{
    "text": "your_text_here",
    "style": "iso15919"
}
```

## Development
- Backend: FastAPI + Python
- Frontend: React
- Testing: pytest + React Testing Library

## License
MIT License - See LICENSE file for details 