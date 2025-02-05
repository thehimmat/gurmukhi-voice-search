"""
TODO: Implement practical transliteration system for Gurmukhi script.

This system will provide more intuitive phonetic mappings for general use cases:
- More intuitive consonant mappings (e.g., 'w' for ਵ)
- Simplified diacritic handling
- Optional roman numerals instead of ISO marks
- Easier to read and type on standard keyboards

Use cases:
- General text display
- User-friendly searching
- Casual transliteration needs
"""

class GurmukhiPractical:
    """
    TODO: Transliteration System Improvements
    - Improve handling of implied 'a' vowel based on context and pronunciation rules
    - Add support for non-unicode Gurmukhi input (e.g., ASCII-based input)
    - Implement IPA (International Phonetic Alphabet) output option
    - Add support for custom transliteration rules specified by user
    - Document and display complete mapping rules for practical system
    """

    # Practical transliteration mappings with more intuitive phonetics
    # Special religious/sacred symbols
    SPECIAL_SYMBOLS = {
        'ੴ': 'ik oankaar'
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

    VOWELS = {
        'ਅ': 'a', 
        'ਆ': 'aa', 
        'ਇ': 'i', 
        'ਈ': 'ee',
        'ਉ': 'u', 
        'ਊ': 'oo', 
        'ਏ': 'e', 
        'ਐ': 'ai',
        'ਓ': 'o', 
        'ਔ': 'au'
    }

    # Independent vowels
    VOWEL_DIACRITICS = {
        'ਾ': 'aa',
        'ਿ': 'i',
        'ੀ': 'ee',
        'ੁ': 'u',
        'ੂ': 'oo',
        'ੇ': 'e',
        'ੈ': 'ai',
        'ੋ': 'o',
        'ੌ': 'au',
    }

    CONSONANTS = {
        'ਸ': 's',
        'ਹ': 'h',
        'ਕ': 'k',
        'ਖ': 'kh',
        'ਗ': 'g',
        'ਘ': 'gh',
        'ਙ': 'ng',
        'ਚ': 'ch',
        'ਛ': 'chh',
        'ਜ': 'j',
        'ਝ': 'jh',
        'ਞ': 'ny',
        'ਟ': 'ṭ',
        'ਠ': 'ṭh',
        'ਡ': 'ḍ',
        'ਢ': 'ḍh',
        'ਣ': 'ṇ',
        'ਤ': 't',
        'ਥ': 'th',
        'ਦ': 'd',
        'ਧ': 'dh',
        'ਨ': 'n',
        'ਪ': 'p',
        'ਫ': 'ph',
        'ਬ': 'b',
        'ਭ': 'bh',
        'ਮ': 'm',
        'ਯ': 'y',
        'ਰ': 'r',
        'ਲ': 'l',
        'ਵ': 'v',
        'ੜ': 'ṛ', 
        # Persian-influenced letters
        'ਖ਼': 'k̲h',      # khakha with line below (خ) - distinguished from ਖ (kh)
        'ਗ਼': 'ġh',      # ghagha with dot above (غ) - distinguished from ਘ (gh)
        'ਜ਼': 'z',       # zaza (ز)
        'ਫ਼': 'f',       # fafa (ف)
        'ਸ਼': 'sh',      # shasha (ش)
        'ਲ਼': 'ḷ',       # lalla with dot
        'ਕ਼': 'q',       # qaqqa (ق)
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

    MODIFIERS = {
        '੍': '',    # virama/halant
        'ੰ': 'ṁ',   # tippi
        'ਂ': 'ṃ',   # bindi
        'ੱ': '',    # addak
        '਼': '',    # nukta
    }

    # Add a set of labial consonants (those that should use 'm' for nasalization)
    LABIAL_CONSONANTS = {
        'ਬ',  # b
        'ਭ',  # bh
        'ਪ',  # p
        'ਫ',  # ph
        'ਮ',  # m
    }

    @classmethod
    def to_practical(cls, text: str) -> str:
        """
        Convert Gurmukhi text to practical romanization.
        
        Handles:
        - Basic consonants and vowels
        - Vowel diacritics
        - Persian-influenced letters
        - Special symbols and modifiers
        - Punctuation and numbers
        - Nasalization (tippi and bindi)
        - Gemination (addak)
        """
        result = []
        i = 0
        while i < len(text):
            char = text[i]
            next_char = text[i + 1] if i + 1 < len(text) else None
            next_next_char = text[i + 2] if i + 2 < len(text) else None

            # Handle special symbols first
            if char in cls.SPECIAL_SYMBOLS:
                result.append(cls.SPECIAL_SYMBOLS[char])
                i += 1
                continue

            # Handle numbers and punctuation
            if char in cls.NUMBERS:
                result.append(cls.NUMBERS[char])
                i += 1
                continue
            if char in cls.PUNCTUATION:
                result.append(cls.PUNCTUATION[char])
                i += 1
                continue

            # Handle consonants (including Persian-influenced)
            if char in cls.CONSONANTS:
                result.append(cls.CONSONANTS[char])
                
                # Look ahead for vowel diacritics
                if next_char in cls.VOWEL_DIACRITICS:
                    result.append(cls.VOWEL_DIACRITICS[next_char])
                    i += 2
                    continue
                
                # Look ahead for subjoined consonants
                elif next_char == '੍':  # virama/halant
                    if i + 2 < len(text) and text[i + 2] in cls.CONSONANTS:
                        result.append(cls.CONSONANTS[text[i + 2]])
                    i += 2
                    continue
                
                # Add inherent 'a' if no vowel diacritic and before checking other modifiers
                elif next_char not in [' ', '।', '॥']:
                    result.append('a')
                
                # Then handle nasalization
                if next_char in ['ੰ', 'ਂ']:
                    if next_char == 'ੰ' and (next_next_char is None or next_next_char in [' ', '\n']):
                        result.append('ng')
                    elif next_next_char in cls.LABIAL_CONSONANTS:
                        result.append('m')
                    else:
                        result.append('n')
                    i += 2
                    continue
                
                # Handle other modifiers like addak
                elif next_char == 'ੱ':  # addak
                    if i + 2 < len(text) and text[i + 2] in cls.CONSONANTS:
                        result.append(cls.CONSONANTS[text[i + 2]])
                    i += 2
                    continue
                
                i += 1
                continue

            # Handle independent vowels
            if char in cls.VOWELS:
                result.append(cls.VOWELS[char])
                i += 1
                continue

            # Handle vowel diacritics
            if char in cls.VOWEL_DIACRITICS:
                result.append(cls.VOWEL_DIACRITICS[char])
                i += 1
                continue

            # Skip modifiers already handled
            if char in cls.MODIFIERS:
                i += 1
                continue

            # Handle spaces and unknown characters
            if char == ' ':
                result.append(' ')
            else:
                print(f"Warning: Unknown character '{char}' (Unicode: {ord(char)})")
            i += 1

        return ''.join(result) 