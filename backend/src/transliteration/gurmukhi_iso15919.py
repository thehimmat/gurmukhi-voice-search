"""
ISO 15919 transliteration system for Gurmukhi script.

This implementation strictly follows the ISO 15919 standard for scholarly transliteration.
For more practical/accessible transliteration, see gurmukhi_practical.py (TODO).

Use cases:
- Academic/scholarly work requiring strict ISO 15919 compliance
- Search functionality requiring exact phonetic matching
- Integration with Grimoire key voice search functionality

TODO: Create gurmukhi_practical.py for a more accessible transliteration system
with intuitive phonetic mappings (e.g., 'w' instead of 'v', 'aa' instead of 'ā')
"""

from typing import Dict, Set

class GurmukhiISO15919:
    """
    Gurmukhi to ISO 15919 transliteration system.
    Implements strict ISO 15919 standard for scholarly transliteration.
    """
    
    # Special religious/sacred symbols
    SPECIAL_SYMBOLS = {
        'ੴ': 'ika oaṁkāra'
    }

    # Punctuation
    PUNCTUATION = {
        '॥': '||',    # Double Danda to double pipe
        '।': '|',     # Single Danda to single pipe
        ' ': ' ',     # Space
        '.': '.',     # Western full stop
        ',': ',',     # Comma
        '?': '?',     # Question mark
        '!': '!',     # Exclamation
        '"': '"',     # Double quote
        "'": "'",     # Single quote
        '\n': '\n',   # Preserve line breaks
    }

    # Independent vowels
    VOWELS: Dict[str, str] = {
        'ਅ': 'a', 'ਆ': 'ā', 'ਇ': 'i', 'ਈ': 'ī',
        'ਉ': 'u', 'ਊ': 'ū', 'ਏ': 'ē', 'ਐ': 'ai',
        'ਓ': 'ō', 'ਔ': 'au'
    }

    # Dependent vowel signs (matras)
    VOWEL_DIACRITICS = {
        'ਾ': 'ā', 'ਿ': 'i', 'ੀ': 'ī',
        'ੁ': 'u', 'ੂ': 'ū', 'ੇ': 'ē',
        'ੈ': 'ai', 'ੋ': 'ō', 'ੌ': 'au'
    }

    # Complete consonant mapping
    CONSONANTS = {
        'ਕ': 'k', 'ਖ': 'kh', 'ਗ': 'g', 'ਘ': 'gh', 'ਙ': 'ṅ',
        'ਚ': 'c', 'ਛ': 'ch', 'ਜ': 'j', 'ਝ': 'jh', 'ਞ': 'ñ',
        'ਟ': 'ṭ', 'ਠ': 'ṭh', 'ਡ': 'ḍ', 'ਢ': 'ḍh', 'ਣ': 'ṇ',
        'ਤ': 't', 'ਥ': 'th', 'ਦ': 'd', 'ਧ': 'dh', 'ਨ': 'n',
        'ਪ': 'p', 'ਫ': 'ph', 'ਬ': 'b', 'ਭ': 'bh', 'ਮ': 'm',
        'ਯ': 'y', 'ਰ': 'r', 'ਲ': 'l', 'ਵ': 'v', 
        'ਸ': 's', 'ਸ਼': 'ś', 'ਹ': 'h',
        'ੜ': 'ṛ', 'ਲ਼': 'ḷ'
    }

    # Numbers
    NUMBERS = {
        '੦': '0',
        '੧': '1',
        '੨': '2',
        '੩': '3',
        '੪': '4',
        '੫': '5',
        '੬': '6',
        '੭': '7',
        '੮': '8',
        '੯': '9'
    }

    MODIFIERS = {
        '੍': '',    # virama/halant
        'ੰ': 'ṁ',   # tippi
        'ਂ': 'ṃ',   # bindi
        'ੱ': '',    # addak
        '਼': '',    # nukta
    }

    @staticmethod
    def to_phonetic(text: str) -> str:
        """Convert Gurmukhi text to ISO 15919 phonetic representation.

        Nasalization marks are handled as follows:
        - ੰ (tippi) → ṁ (dot above) - Used within words
        - ਂ (bindi) → ṃ (dot below) - Used typically word-finally

        Note: For tippi (ੰ) followed by ਮ, we explicitly mark the nasalization (ṁ)
        on the first m. This may deviate from ISO 15919 standard (needs verification)
        but maintains the distinction between tippi and addak cases.
        """
        # Debugging: print character codes
        print("Character codes:")
        for char in text:
            print(f"'{char}': {ord(char)}")
        
        result = ''
        
        i = 0
        while i < len(text):
            # Check for special symbols first
            if text[i] in GurmukhiISO15919.SPECIAL_SYMBOLS:
                result += GurmukhiISO15919.SPECIAL_SYMBOLS[text[i]]
                i += 1
                continue
            
            # Check for punctuation (including line breaks)
            if text[i] in GurmukhiISO15919.PUNCTUATION:
                result += GurmukhiISO15919.PUNCTUATION[text[i]]
                i += 1
                continue
                
            # Check for numbers
            if text[i] in GurmukhiISO15919.NUMBERS:
                result += GurmukhiISO15919.NUMBERS[text[i]]
                i += 1
                continue
                
            char = text[i]
            next_char = text[i + 1] if i + 1 < len(text) else None
            next_next_char = text[i + 2] if i + 2 < len(text) else None
            
            # Handle gemination (addak)
            if next_char == 'ੱ':
                if i + 2 < len(text):
                    doubled_char = text[i + 2]
                    if doubled_char in GurmukhiISO15919.CONSONANTS:
                        if char in GurmukhiISO15919.CONSONANTS:
                            # Add current consonant plus mukta 'a'
                            result += GurmukhiISO15919.CONSONANTS[char] + 'a'
                        elif char in GurmukhiISO15919.VOWEL_DIACRITICS:
                            # add current vowel diacritic
                            result += GurmukhiISO15919.VOWEL_DIACRITICS[char]
                        else:
                            # add current vowel
                            result += GurmukhiISO15919.VOWELS[char]  
                            
                        # check if the consonant is aspirated
                        if doubled_char in GurmukhiISO15919.CONSONANTS and len(GurmukhiISO15919.CONSONANTS[doubled_char]) > 1 and GurmukhiISO15919.CONSONANTS[doubled_char][1] == 'h':
                            result += GurmukhiISO15919.CONSONANTS[doubled_char][0] + GurmukhiISO15919.CONSONANTS[doubled_char]
                        else:
                            result += GurmukhiISO15919.CONSONANTS[doubled_char] + GurmukhiISO15919.CONSONANTS[doubled_char]
                        i += 3
                        if text[i] not in GurmukhiISO15919.VOWEL_DIACRITICS:
                            result += 'a'
                        continue

            # Handle nasalization
            if next_char == 'ੰ':  # tippi
                if char in GurmukhiISO15919.CONSONANTS:
                    # Add current consonant 
                    result += GurmukhiISO15919.CONSONANTS[char] + 'a'
                elif char in GurmukhiISO15919.VOWEL_DIACRITICS:
                    # Add current vowel diacritic
                    result += GurmukhiISO15919.VOWEL_DIACRITICS[char]
                else:
                    # add current vowel
                    result += GurmukhiISO15919.VOWELS[char]  
                
                result += "ṁ"
                i += 2
                continue
            elif next_char == 'ਂ':  # bindi
                if char in GurmukhiISO15919.CONSONANTS:
                    result += GurmukhiISO15919.CONSONANTS[char]
                elif char in GurmukhiISO15919.VOWEL_DIACRITICS:
                    result += GurmukhiISO15919.VOWEL_DIACRITICS[char]
                else:
                    result += GurmukhiISO15919.VOWELS[char]
                result += "ṃ"
                i += 2
                continue

            # Handle vowel sequences
            if i > 0 and result[-1] =='a' and char in GurmukhiISO15919.VOWELS:
                result += "'" + GurmukhiISO15919.VOWELS[char]
                i += 1
                continue

            # Process regular characters
            if char in GurmukhiISO15919.CONSONANTS:
                result += GurmukhiISO15919.CONSONANTS[char]
                if next_char not in GurmukhiISO15919.VOWEL_DIACRITICS and next_char != '੍':
                    result += 'a'
            elif char in GurmukhiISO15919.VOWEL_DIACRITICS:
                result += GurmukhiISO15919.VOWEL_DIACRITICS[char]
            elif char in GurmukhiISO15919.VOWELS:
                result += GurmukhiISO15919.VOWELS[char]

            i += 1

        return result