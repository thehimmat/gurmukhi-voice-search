"""
ISO 15919 transliteration system for Gurmukhi script.

This implementation strictly follows the ISO 15919 standard for scholarly transliteration.
For more practical/accessible transliteration, see gurmukhi_practical.py (TODO).

Use cases:
- Academic/scholarly work requiring strict ISO 15919 compliance
- Search functionality requiring exact phonetic matching
- Integration with Grimoire key voice search functionality

For general purpose transliteration with more intuitive phonetic mappings
(e.g., using 'w' instead of 'v' for ਵ), see the practical transliteration system.

TODO: Create gurmukhi_practical.py for a more accessible transliteration system
with intuitive phonetic mappings (e.g., 'w' instead of 'v', 'aa' instead of 'ā')
"""

class GurmukhiISO15919:
    """
    Gurmukhi to ISO 15919 transliteration system.
    Implements strict ISO 15919 standard for scholarly transliteration.
    """
    
    # Independent vowels
    VOWELS = {
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
    SPECIAL = {
        '੍': '',    # virama/halant
        'ੰ': 'ṁ',   # bindi (candrabindu)
        'ਂ': 'ṃ',   # tippi (anusvara)
        'ੱ': '',    # addak (gemination marker)
        '਼': '',    # nukta
        '੦': '0', '੧': '1', '੨': '2', '੩': '3', '੪': '4',
        '੫': '5', '੬': '6', '੭': '7', '੮': '8', '੯': '9'
    }

    @classmethod
    def to_phonetic(cls, text: str) -> str:
        """Convert Gurmukhi text to ISO 15919 transliteration."""
        result = text
        result = cls._handle_conjuncts(result)
        result = cls._handle_vowel_sequences(result)
        result = cls._handle_nasalization(result)
        result = cls._handle_gemination(result)
        return result

    @classmethod
    def _handle_conjuncts(cls, text: str) -> str:
        """
        Handle consonant conjuncts according to ISO 15919 rules.
        Examples:
            ਪ੍ਰ → pra
            ਸ੍ਰੀ → srī
            ਕ੍ਰਿਪਾ → kr̥pā
            ਸ੍ਵ → sva
            ਨ੍ਯ → nya
        """
        result = ""
        i = 0
        while i < len(text):
            char = text[i]
            next_char = text[i + 1] if i + 1 < len(text) else None
            
            # Look ahead for virama sequences
            if char in cls.CONSONANTS:
                if (i + 1 < len(text) and text[i + 1] == '੍' and 
                    i + 2 < len(text) and text[i + 2] in cls.CONSONANTS):
                    
                    # Get the consonants involved
                    first_cons = cls.CONSONANTS[char]
                    second_cons = cls.CONSONANTS[text[i + 2]]
                    
                    # Special handling for r as second consonant (r̥)
                    if text[i + 2] == 'ਰ':
                        result += first_cons + "r̥"
                    else:
                        result += first_cons + second_cons
                    
                    # Add implicit 'a' unless:
                    # - Next character is a vowel mark
                    # - Next character is a halant
                    # - At end of word
                    if (i + 3 < len(text) and 
                        text[i + 3] not in cls.VOWEL_DIACRITICS and 
                        text[i + 3] != '੍'):
                        result += 'a'
                    
                    i += 3  # Skip both consonants and the virama
                    continue
                
                # Regular consonant (not part of conjunct)
                result += cls.CONSONANTS[char]
                # Add implicit 'a' unless followed by vowel mark or halant
                if (next_char and 
                    next_char not in cls.VOWEL_DIACRITICS and 
                    next_char != '੍'):
                    result += 'a'
            
            # Handle other characters
            elif char in cls.VOWELS:
                result += cls.VOWELS[char]
            elif char in cls.VOWEL_DIACRITICS:
                result += cls.VOWEL_DIACRITICS[char]
            elif char in cls.SPECIAL and char != '੍':
                result += cls.SPECIAL[char]
            
            i += 1
            
        return result

    @classmethod
    def _handle_vowel_sequences(cls, text: str) -> str:
        """
        Handle vowel sequences according to ISO 15919 rules.
        Examples:
            ਭਾਈ → bhāī (vowel sequence)
            ਕੌਰ → kaur (true diphthong)
            ਸਿਉ → si'u (separate vowels)
            ਨਾਉਂ → nā'uṁ (separate vowels with nasalization)
        """
        result = ""
        i = 0
        while i < len(text):
            char = text[i]
            next_char = text[i + 1] if i + 1 < len(text) else None
            
            # Handle consonants
            if char in cls.CONSONANTS:
                result += cls.CONSONANTS[char]
                
                # Add implicit 'a' if:
                # - No vowel sign follows
                # - No virama follows
                # - Not part of a conjunct
                if (next_char and 
                    next_char not in cls.VOWEL_DIACRITICS and 
                    next_char != '੍' and
                    next_char not in {'ੰ', 'ਂ', 'ੱ'}):  # Skip if next is a modifier
                    result += 'a'
            
            # Handle independent vowels
            elif char in cls.VOWELS:
                current_vowel = cls.VOWELS[char]
                if next_char and next_char in cls.VOWEL_DIACRITICS:
                    # Add apostrophe between certain vowel combinations
                    next_vowel = cls.VOWEL_DIACRITICS[next_char]
                    if cls._needs_separator(current_vowel, next_vowel):
                        result += current_vowel + "'"
                    else:
                        result += current_vowel
                else:
                    result += current_vowel
            
            # Handle dependent vowel signs
            elif char in cls.VOWEL_DIACRITICS:
                current_vowel = cls.VOWEL_DIACRITICS[char]
                if next_char and (next_char in cls.VOWELS or next_char in cls.VOWEL_DIACRITICS):
                    next_vowel = (cls.VOWELS.get(next_char) or 
                                cls.VOWEL_DIACRITICS.get(next_char))
                    if cls._needs_separator(current_vowel, next_vowel):
                        result += current_vowel + "'"
                    else:
                        result += current_vowel
                else:
                    result += current_vowel
            
            # Handle special characters
            elif char in cls.SPECIAL:
                result += cls.SPECIAL[char]
            
            i += 1
        
        return result

    @staticmethod
    def _needs_separator(v1: str, v2: str) -> bool:
        """
        Determine if two vowels need an apostrophe separator.
        This happens when:
        - First vowel ends in a, i, or u
        - Second vowel starts with a, i, or u
        - They're not part of a legitimate diphthong
        """
        legitimate_pairs = {
            ('a', 'i'),  # ai
            ('a', 'u'),  # au
        }
        
        v1_end = v1[-1]
        v2_start = v2[0]
        
        # Don't separate legitimate diphthongs
        if (v1_end, v2_start) in legitimate_pairs:
            return False
            
        # Add separator if both are basic vowels
        return (v1_end in {'a', 'i', 'u', 'ā', 'ī', 'ū'} and 
                v2_start in {'a', 'i', 'u', 'ā', 'ī', 'ū'})

    @classmethod
    def _handle_nasalization(cls, text: str) -> str:
        """
        Handle nasalization according to ISO 15919 rules:
        - ੰ (bindi) -> ṁ
        - ਂ (tippi) -> ṃ
        - Special cases where nasalization affects surrounding vowels
        Examples:
            ਸਿੰਘ -> siṁgh
            ਪੰਜਾਬੀ -> pañjābī
        """
        # TODO: Implement nasalization handling
        pass

    @classmethod
    def _handle_gemination(cls, text: str) -> str:
        """
        Handle doubled consonants (ੱ addak) according to ISO 15919 rules.
        Examples:
            ਪੱਕਾ -> pakkā
            ਚੱਲਣਾ -> callṇā
            ਕੱਚਾ -> kaccā
        """
        result = ""
        i = 0
        while i < len(text):
            if i + 1 < len(text) and text[i] == 'ੱ':
                # Get the consonant that follows the addak
                next_char = text[i + 1]
                # Add the ISO transliteration of the consonant twice
                if next_char in cls.CONSONANTS:
                    result += cls.CONSONANTS[next_char] * 2
                i += 2  # Skip both the addak and the consonant
            else:
                result += text[i]
                i += 1
        return result


if __name__ == "__main__":
    test_cases = [
        "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ",      # Basic test with conjunct
        "ਭਾਈ",                # Vowel sequence
        "ਪ੍ਰੇਮ",               # Conjunct with vowel
        "ਸਿੰਘ",               # Nasalization
        "ਪੱਕਾ",               # Gemination
        "ਪੰਜਾਬੀ",             # Multiple rules
        "ਕ੍ਰਿਪਾ",              # Conjunct with short i
        "ਸਿਉਂ",               # Vowel sequence with nasalization
        "ਕੌਰ",       # kaur (true diphthong)
        "ਸਿਉ",       # si'u (separate vowels)
        "ਸਿਉਂ",      # si'uṁ (separate vowels with nasalization)
        "ਭਾਉ",       # bhā'u (separate vowels)
        "ਭਾਈ",       # bhāī
        "ਨਾਉਂ",      # nā'uṁ
        "ਗਾਉਣਾ",     # gā'uṇā
    ]

    for text in test_cases:
        phonetic = GurmukhiISO15919.to_phonetic(text)  # Changed from GurmukhiPhonetics
        print(f"Original: {text}")
        print(f"ISO 15919: {phonetic}")
        print("-" * 30)