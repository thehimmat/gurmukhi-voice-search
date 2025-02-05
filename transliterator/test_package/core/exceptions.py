"""Custom exceptions for the application."""

class TransliterationError(Exception):
    """Base class for transliteration errors."""
    def __init__(self, message: str, details: dict = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)

class InvalidInputError(TransliterationError):
    """Raised when input text is invalid."""
    pass

class UnsupportedStyleError(TransliterationError):
    """Raised when an unsupported transliteration style is requested."""
    pass

class LegacyConversionError(TransliterationError):
    """Raised when legacy font conversion fails."""
    pass 