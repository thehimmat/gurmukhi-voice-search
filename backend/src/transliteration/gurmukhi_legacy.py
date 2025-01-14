"""
Legacy encoding conversion system for Gurmukhi script.

Handles conversion from:
- Font-based encodings (AnmolLipi, GurbaniAkhar, etc.)
- Keyboard mappings (ASCII-based input)
to Unicode Gurmukhi.

This module serves as a pre-processor for other transliteration systems,
allowing them to work with both Unicode and legacy input formats.
"""

import logging

class GurmukhiLegacy:
    # Special combinations that need to be processed first
    SPECIAL_COMBINATIONS = {
        '<>': 'ੴ',  # Ik Onkar
        '[]': '॥',   # Double danda
        ']': '॥',    # Single closing bracket to double danda
        '[': '।',    # Single opening bracket to single danda
    }

    # AnmolLipi font mapping for single characters
    ANMOLLIPI_MAP = {
        # Vowel bearers
        'A': 'ਅ',
        'e': 'ਇ',
        'E': 'ਈ',
        's': 'ਸ',
        'h': 'ਹ',
        'k': 'ਕ',
        'K': 'ਖ',
        'g': 'ਗ',
        'G': 'ਘ',
        '|': 'ਙ',
        'c': 'ਚ',
        'C': 'ਛ',
        'j': 'ਜ',
        'J': 'ਝ',
        '\\': 'ਞ',
        't': 'ਟ',
        'T': 'ਠ',
        'f': 'ਡ',
        'F': 'ਢ',
        'x': 'ਣ',
        'q': 'ਤ',
        'Q': 'ਥ',
        'd': 'ਦ',
        'D': 'ਧ',
        'n': 'ਨ',
        'p': 'ਪ',
        'P': 'ਫ',
        'b': 'ਬ',
        'B': 'ਭ',
        'm': 'ਮ',
        'X': 'ਯ',
        'r': 'ਰ',
        'R': '੍ਰ',  # Subjoined r (rakar)
        'l': 'ਲ',
        'v': 'ਵ',
        'V': 'ੜ',

        # Vowel marks (laga matra)
        'w': 'ਾ',   # kanna
        'i': 'ਿ',   # sihari
        'I': 'ੀ',   # bihari
        'u': 'ੁ',   # aunkar
        'U': 'ੂ',   # dulainkar
        'y': 'ੇ',   # lavan
        'Y': 'ੈ',   # dulavan
        'o': 'ੋ',   # hora
        'O': 'ੌ',   # kanaura

        # Special characters
        'M': 'ੰ',   # tippi
        'N': 'ਂ',   # bindi
        '`': 'ੱ',   # addak
        '~': '੍',   # halant/virama
        '@': '॥',   # double danda
        '¤': 'ੴ',   # Ek Onkar
        
        # Numbers
        '0': '੦',
        '1': '੧',
        '2': '੨',
        '3': '੩',
        '4': '੪',
        '5': '੫',
        '6': '੬',
        '7': '੭',
        '8': '੮',
        '9': '੯',

        # Preserve spaces and newlines
        ' ': ' ',
        '\n': '\n',
    }

    @classmethod
    def to_unicode(cls, text: str, encoding: str = 'anmollipi') -> str:
        """Convert legacy encoded text to Unicode Gurmukhi."""
        if not text:
            return ""
            
        if encoding.lower() != 'anmollipi':
            raise ValueError(f"Unsupported encoding: {encoding}")

        logger = logging.getLogger(__name__)
        logger.debug(f"Starting conversion of text length: {len(text)}")

        # First pass: collect characters and handle vowel carriers
        chars = []
        i = 0
        while i < len(text):
            try:
                # Check for special combinations first
                found_special = False
                for combo, replacement in cls.SPECIAL_COMBINATIONS.items():
                    if text[i:i+len(combo)] == combo:
                        logger.debug(f"Found special combo at position {i}: {combo} -> {replacement}")
                        chars.append((replacement, False))
                        i += len(combo)
                        found_special = True
                        break
                
                if found_special:
                    continue

                # Process single character
                char = text[i]
                next_char = text[i + 1] if i + 1 < len(text) else None
                logger.debug(f"Processing char at position {i}: {char}")

                if char in cls.ANMOLLIPI_MAP:
                    # Handle vowel carriers based on context
                    if char == 'A' and next_char in ['w', 'Y', 'O']:
                        logger.debug(f"Skipping vowel carrier A at position {i}")
                        i += 1
                        continue
                    elif char == 'e' and next_char == 'I':
                        logger.debug(f"Skipping vowel carrier e at position {i}")
                        i += 1
                        continue
                    elif char == 'a' and next_char == 'u':
                        logger.debug(f"Converting au to ਉ at position {i}")
                        chars.append(('ਉ', False))
                        i += 2
                        continue
                    elif char == 'a' and next_char == 'U':
                        logger.debug(f"Converting aU to ਊ at position {i}")
                        chars.append(('ਊ', False))
                        i += 2
                        continue
                    
                    # Handle sihari - store with next consonant
                    if cls.ANMOLLIPI_MAP[char] == 'ਿ' and i + 1 < len(text):
                        next_char_val = cls.ANMOLLIPI_MAP.get(text[i + 1])
                        if next_char_val:
                            logger.debug(f"Handling sihari with next char at position {i}")
                            chars.append((next_char_val + 'ਿ', False))
                            i += 2
                            continue
                    
                    chars.append((cls.ANMOLLIPI_MAP[char], False))
                elif char == 'a' and next_char in ['u', 'U']:
                    logger.debug(f"Skipping 'a' part of vowel combo at position {i}")
                    i += 1  # Only increment by 1 as the next char will be handled in next iteration
                    continue
                elif char != 'a':
                    chars.append((char, False))
                
                # Always increment i if we haven't continued
                i += 1
                
            except Exception as e:
                logger.error(f"Error at position {i}: {str(e)}")
                raise

        logger.debug("Character processing complete, joining results")
        result = ''.join(char[0] for char in chars)

        # Handle line breaks and spacing
        lines = result.split('\n')
        formatted_lines = []
        for line in lines:
            if line.strip():
                formatted_lines.append(line.strip())
        
        logger.debug("Formatting complete")
        return '\n\n'.join(formatted_lines)

    @classmethod
    def detect_encoding(cls, text: str) -> str:
        """Attempt to detect the encoding of the input text."""
        return 'unicode' 