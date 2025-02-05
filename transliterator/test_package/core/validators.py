"""Validation functions for transliteration inputs."""

import re
from .exceptions import InvalidInputError
from ..core.exceptions import UnsupportedStyleError

def validate_gurmukhi_text(text: str) -> bool:
    """
    Validate that text contains Gurmukhi characters.
    Raises InvalidInputError if validation fails.
    """
    if not text.strip():
        raise InvalidInputError("Empty text provided")
    
    # Basic Gurmukhi Unicode range check
    gurmukhi_pattern = re.compile(r'[\u0A00-\u0A7F]')
    if not gurmukhi_pattern.search(text):
        raise InvalidInputError(
            "Text does not contain Gurmukhi characters",
            {"text": text}
        )
    
    return True

def validate_legacy_text(text: str) -> bool:
    """
    Validate text appears to be in legacy font format.
    Raises InvalidInputError if validation fails.
    """
    # Add specific legacy font validation logic here
    return True

SUPPORTED_STYLES = {
    "iso15919": "ISO 15919 transliteration",
    "practical": "Practical phonetic system",
    "legacy": "Legacy font conversion"
}

def validate_style(style: str) -> None:
    """Validate the transliteration style."""
    valid_styles = [
        'unicode',
        'ascii',
        'legacy',
        'anvaad',
        'practical',
        'iso15919',
        'ipa',
        'devnagri',
        'shahmukhi'
    ]
    
    if style not in valid_styles:
        raise UnsupportedStyleError(
            f"Unsupported style: {style}. Valid styles are: {', '.join(valid_styles)}"
        )
    return True 