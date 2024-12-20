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

    # Special characters and modifiers
    NUMBERS = {
        '੦': '0', '੧': '1', '੨': '2', '੩': '3', '੪': '4',
        '੫': '5', '੬': '6', '੭': '7', '੮': '8', '੯': '9'
    }

    MODIFIERS = {
        '੍': '',    # virama/halant
        'ੰ': 'ṁ',   # tippi
        'ਂ': 'ṃ',   # bindi
        'ੱ': '',    # addak
        '਼': '',    # nukta
    }

    @classmethod
    def to_phonetic(cls, text: str) -> str:
        """Convert Gurmukhi text to ISO 15919 phonetic representation.

        Nasalization marks are handled as follows:
        - ੰ (tippi) → ṁ (dot above) - Used within words
        - ਂ (bindi) → ṃ (dot below) - Used typically word-finally

        Note: For tippi (ੰ) followed by ਮ, we explicitly mark the nasalization (ṁ)
        on the first m. This may deviate from ISO 15919 standard (needs verification)
        but maintains the distinction between tippi and addak cases.
        """
        result = ""
        i = 0
        while i < len(text):
            char = text[i]
            next_char = text[i + 1] if i + 1 < len(text) else None
            next_next_char = text[i + 2] if i + 2 < len(text) else None
            
            # Handle gemination (addak)
            if next_char == 'ੱ':
                if i + 2 < len(text):
                    doubled_char = text[i + 2]
                    if doubled_char in cls.CONSONANTS:
                        if char in cls.CONSONANTS:
                            # Add current consonant plus mukta 'a'
                            result += cls.CONSONANTS[char] + 'a'
                        elif char in cls.VOWEL_DIACRITICS:
                            # add current vowel diacritic
                            result += cls.VOWEL_DIACRITICS[char]
                        else:
                            # add current vowel
                            result += cls.VOWELS[char]  
                            
                        # check if the consonant is aspirated
                        if doubled_char in cls.CONSONANTS and len(cls.CONSONANTS[doubled_char]) > 1 and cls.CONSONANTS[doubled_char][1] == 'h':
                            result += cls.CONSONANTS[doubled_char][0] + cls.CONSONANTS[doubled_char]
                        else:
                            result += cls.CONSONANTS[doubled_char] + cls.CONSONANTS[doubled_char]
                        i += 3
                        if text[i] not in cls.VOWEL_DIACRITICS:
                            result += 'a'
                        continue

            # Handle nasalization
            if next_char == 'ੰ':  # tippi
                if char in cls.CONSONANTS:
                    # Add current consonant 
                    result += cls.CONSONANTS[char] + 'a'
                elif char in cls.VOWEL_DIACRITICS:
                    # Add current vowel diacritic
                    result += cls.VOWEL_DIACRITICS[char]
                else:
                    # add current vowel
                    result += cls.VOWELS[char]  
                
                result += "ṁ"
                i += 2
                continue
            elif next_char == 'ਂ':  # bindi
                if char in cls.CONSONANTS:
                    result += cls.CONSONANTS[char]
                elif char in cls.VOWEL_DIACRITICS:
                    result += cls.VOWEL_DIACRITICS[char]
                else:
                    result += cls.VOWELS[char]
                result += "ṃ"
                i += 2
                continue

            # Handle vowel sequences
            if i > 0 and result[-1] =='a' and char in cls.VOWELS:
                result += "'" + cls.VOWELS[char]
                i += 1
                continue

            # Process regular characters
            if char in cls.CONSONANTS:
                result += cls.CONSONANTS[char]
                if next_char not in cls.VOWEL_DIACRITICS and next_char != '੍':
                    result += 'a'
            elif char in cls.VOWEL_DIACRITICS:
                result += cls.VOWEL_DIACRITICS[char]
            elif char in cls.VOWELS:
                result += cls.VOWELS[char]

            i += 1

        return result