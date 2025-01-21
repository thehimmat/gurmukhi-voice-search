"""
PDF processing module for legacy Gurmukhi text.

TODO:
1. Implement PDF text extraction
2. Add cleaning for ang numbers and formatting artifacts
3. Implement ang/verse structure detection
4. Add validation for character encodings
5. Consider handling different PDF formats/sources
"""

def extract_text(pdf_path: str) -> str:
    """Extract text from PDF file."""
    raise NotImplementedError("TODO: Implement PDF extraction")

def clean_text(text: str) -> str:
    """Clean extracted text of artifacts."""
    raise NotImplementedError("TODO: Implement text cleaning")
