# Gurmukhi Transliterator Backend

FastAPI backend for the Gurmukhi Transliterator application.

## Setup

1. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start the server:
```bash
uvicorn src.api.main:app --reload --port 8000
```

## API Documentation

Once running, visit:
- http://localhost:8000/docs for Swagger UI
- http://localhost:8000/redoc for ReDoc

## Testing

Run tests with:
```bash
pytest
```

## Environment Variables

Create a `.env` file:
```
CORS_ORIGINS=http://localhost:3000
LOG_LEVEL=INFO
```

## Development

1. Follow PEP 8 style guide
2. Add tests for new features
3. Update documentation as needed
4. Use meaningful commit messages 