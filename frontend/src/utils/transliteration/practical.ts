/**
 * Practical transliteration system for Gurmukhi script.
 * 
 * This system provides more intuitive phonetic mappings for general use cases:
 * - More intuitive consonant mappings (e.g., 'w' for ਵ)
 * - Simplified diacritic handling
 * - Optional roman numerals instead of ISO marks
 * - Easier to read and type on standard keyboards
 * 
 * Use cases:
 * - General text display
 * - User-friendly searching
 * - Casual transliteration needs
 */

// Type definitions
interface TransliterationMaps {
  readonly SPECIAL_SYMBOLS: Record<string, string>;
  readonly NUMBERS: Record<string, string>;
  readonly VOWELS: Record<string, string>;
  readonly VOWEL_DIACRITICS: Record<string, string>;
  readonly CONSONANTS: Record<string, string>;
  readonly PUNCTUATION: Record<string, string>;
  readonly MODIFIERS: Record<string, string>;
  readonly LABIAL_CONSONANTS: Set<string>;
}

export class GurmukhiPractical {
  private static readonly MAPS: TransliterationMaps = {
    // Special religious/sacred symbols
    SPECIAL_SYMBOLS: {
      'ੴ': 'ik oankaar'
    },

    // Numbers
    NUMBERS: {
      '੦': '0', '੧': '1', '੨': '2', '੩': '3', '੪': '4',
      '੫': '5', '੬': '6', '੭': '7', '੮': '8', '੯': '9'
    },

    VOWELS: {
      'ਅ': 'a', 'ਆ': 'aa', 'ਇ': 'i', 'ਈ': 'ee',
      'ਉ': 'u', 'ਊ': 'oo', 'ਏ': 'e', 'ਐ': 'ai',
      'ਓ': 'o', 'ਔ': 'au'
    },

    VOWEL_DIACRITICS: {
      'ਾ': 'aa', 'ਿ': 'i', 'ੀ': 'ee', 'ੁ': 'u',
      'ੂ': 'oo', 'ੇ': 'e', 'ੈ': 'ai', 'ੋ': 'o',
      'ੌ': 'au'
    },

    CONSONANTS: {
      'ਸ': 's', 'ਹ': 'h', 'ਕ': 'k', 'ਖ': 'kh', 'ਗ': 'g',
      'ਘ': 'gh', 'ਙ': 'ng', 'ਚ': 'ch', 'ਛ': 'chh', 'ਜ': 'j',
      'ਝ': 'jh', 'ਞ': 'ny', 'ਟ': 'ṭ', 'ਠ': 'ṭh', 'ਡ': 'ḍ',
      'ਢ': 'ḍh', 'ਣ': 'ṇ', 'ਤ': 't', 'ਥ': 'th', 'ਦ': 'd',
      'ਧ': 'dh', 'ਨ': 'n', 'ਪ': 'p', 'ਫ': 'ph', 'ਬ': 'b',
      'ਭ': 'bh', 'ਮ': 'm', 'ਯ': 'y', 'ਰ': 'r', 'ਲ': 'l',
      'ਵ': 'v', 'ੜ': 'ṛ',
      // Persian-influenced letters
      'ਖ਼': 'k̲h', 'ਗ਼': 'ġh', 'ਜ਼': 'z', 'ਫ਼': 'f',
      'ਸ਼': 'sh', 'ਲ਼': 'ḷ', 'ਕ਼': 'q'
    },

    PUNCTUATION: {
      '॥': '||', '।': '|', ' ': ' ', '.': '.', ',': ',',
      '?': '?', '!': '!', '"': '"', "'": "'", '\n': '\n'
    },

    MODIFIERS: {
      '੍': '',    // virama/halant
      'ੰ': 'ṁ',   // tippi
      'ਂ': 'ṃ',   // bindi
      'ੱ': '',    // addak
      '਼': '',    // nukta
    },

    // Using Set for O(1) lookups
    LABIAL_CONSONANTS: new Set(['ਬ', 'ਭ', 'ਪ', 'ਫ', 'ਮ'])
  } as const;

  /**
   * Convert Gurmukhi text to practical romanization.
   * 
   * Handles:
   * - Basic consonants and vowels
   * - Vowel diacritics
   * - Persian-influenced letters
   * - Special symbols and modifiers
   * - Punctuation and numbers
   * - Nasalization (tippi and bindi)
   * - Gemination (addak)
   */
  public static toPractical(text: string): string {
    let result = '';
    let i = 0;

    while (i < text.length) {
      const char = text[i];
      const nextChar = i + 1 < text.length ? text[i + 1] : null;
      const nextNextChar = i + 2 < text.length ? text[i + 2] : null;

      // Handle nasalization (tippi and bindi)
      if (nextChar && (nextChar === 'ੰ' || nextChar === 'ਂ')) {
        // First add current character
        if (char in this.MAPS.CONSONANTS) {
          result += this.MAPS.CONSONANTS[char];
        } else if (char in this.MAPS.VOWELS) {
          result += this.MAPS.VOWELS[char];
        } else if (char in this.MAPS.VOWEL_DIACRITICS) {
          result += this.MAPS.VOWEL_DIACRITICS[char];
        }

        // Check if there's a following consonant
        result += nextNextChar && this.MAPS.LABIAL_CONSONANTS.has(nextNextChar) ? 'm' : 'n';
        i += 2;
        continue;
      }

      // Handle special symbols first
      if (char in this.MAPS.SPECIAL_SYMBOLS) {
        result += this.MAPS.SPECIAL_SYMBOLS[char];
        i++;
        continue;
      }

      // Handle numbers and punctuation
      if (char in this.MAPS.NUMBERS) {
        result += this.MAPS.NUMBERS[char];
        i++;
        continue;
      }
      if (char in this.MAPS.PUNCTUATION) {
        result += this.MAPS.PUNCTUATION[char];
        i++;
        continue;
      }

      // Handle consonants (including Persian-influenced)
      if (char in this.MAPS.CONSONANTS) {
        result += this.MAPS.CONSONANTS[char];
        
        const hasNukta = nextChar === '਼';
        
        if (hasNukta) {
          // Handle decomposed form (base + nukta)
          result += this.MAPS.CONSONANTS[char];
          if (text[i + 2] !== '੍' && !(text[i + 2] in this.MAPS.VOWEL_DIACRITICS)) {
            result += 'a';
          }
          i += 2;
        } else {
          // Handle regular consonant
          result += this.MAPS.CONSONANTS[char];
          
          // Add inherent 'a' if:
          // 1. Not followed by virama
          // 2. Not followed by vowel diacritic
          // 3. Not at end of word
          if (nextChar !== '੍' && nextChar &&
              !(nextChar in this.MAPS.VOWEL_DIACRITICS) && 
              !([' ', '।', '॥'].includes(nextChar || '') || i === text.length - 1)) {
            result += 'a';
          }
          i++;
        }
      } else if (char in this.MAPS.VOWEL_DIACRITICS) {
        result += this.MAPS.VOWEL_DIACRITICS[char];
        i++;
      } else if (char in this.MAPS.VOWELS) {
        result += this.MAPS.VOWELS[char];
        i++;
      }

      // Skip modifiers already handled
      if (char in this.MAPS.MODIFIERS) {
        i++;
        continue;
      }

      // Handle spaces and unknown characters
      if (char === ' ') {
        result += ' ';
      } else {
        console.warn(`Unknown character '${char}' (Unicode: ${char.charCodeAt(0)})`);
      }
      i++;
    }

    return result;
  }
} 