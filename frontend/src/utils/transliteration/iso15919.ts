/**
 * ISO 15919 transliteration system for Gurmukhi script.
 * 
 * This implementation strictly follows the ISO 15919 standard for scholarly transliteration.
 * For more practical/accessible transliteration, see practical.ts
 * 
 * Use cases:
 * - Academic/scholarly work requiring strict ISO 15919 compliance
 * - Search functionality requiring exact phonetic matching
 * - Integration with Grimoire key voice search functionality
 */

// Type definitions
interface ISO15919Maps {
  readonly SPECIAL_SYMBOLS: Record<string, string>;
  readonly NUMBERS: Record<string, string>;
  readonly VOWELS: Record<string, string>;
  readonly VOWEL_DIACRITICS: Record<string, string>;
  readonly CONSONANTS: Record<string, string>;
  readonly PUNCTUATION: Record<string, string>;
  readonly MODIFIERS: Record<string, string>;
}

export class GurmukhiISO15919 {
  private static readonly MAPS: ISO15919Maps = {
    // Special religious/sacred symbols
    SPECIAL_SYMBOLS: {
      'ੴ': 'ika oaṁkāra'
    },

    // Numbers
    NUMBERS: {
      '੦': '0', '੧': '1', '੨': '2', '੩': '3', '੪': '4',
      '੫': '5', '੬': '6', '੭': '7', '੮': '8', '੯': '9'
    },

    // Independent vowels
    VOWELS: {
      'ਅ': 'a', 'ਆ': 'ā', 'ਇ': 'i', 'ਈ': 'ī',
      'ਉ': 'u', 'ਊ': 'ū', 'ਏ': 'ē', 'ਐ': 'ai',
      'ਓ': 'ō', 'ਔ': 'au'
    },

    // Dependent vowel signs (matras)
    VOWEL_DIACRITICS: {
      'ਾ': 'ā', 'ਿ': 'i', 'ੀ': 'ī', 'ੁ': 'u',
      'ੂ': 'ū', 'ੇ': 'ē', 'ੈ': 'ai', 'ੋ': 'ō',
      'ੌ': 'au'
    },

    // Complete consonant mapping
    CONSONANTS: {
      'ਸ': 's', 'ਹ': 'h', 
      'ਕ': 'k', 'ਖ': 'kh', 'ਗ': 'g', 'ਘ': 'gh', 'ਙ': 'ṅ', 
      'ਚ': 'c', 'ਛ': 'ch', 'ਜ': 'j', 'ਝ': 'jh', 'ਞ': 'ñ', 
      'ਟ': 'ṭ', 'ਠ': 'ṭh', 'ਡ': 'ḍ', 'ਢ': 'ḍh', 'ਣ': 'ṇ', 
      'ਤ': 't', 'ਥ': 'th', 'ਦ': 'd', 'ਧ': 'dh', 'ਨ': 'n', 
      'ਪ': 'p', 'ਫ': 'ph', 'ਬ': 'b', 'ਭ': 'bh', 'ਮ': 'm', 
      'ਯ': 'y', 'ਰ': 'r', 'ਲ': 'l', 'ਵ': 'v', 'ੜ': 'ṛ'
    },

    // Punctuation
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
    }
  } as const;

  // Replace direct NODE_ENV checks with a debug flag
  private static readonly DEBUG = false;  // Set to true when debugging needed

  private static debugChar(char: string, context: string) {
    if (this.DEBUG) {
      console.debug(
        `[${context}] '${char}' (${char.charCodeAt(0).toString(16)})`,
        {
          inConsonants: char in this.MAPS.CONSONANTS,
          value: this.MAPS.CONSONANTS[char],
        }
      );
    }
  }

  // Define the Persian transformations once
  private static readonly PERSIAN_MAP_BASE: Record<string, string> = {
    'ਸ': 'ś',     // ਸ਼
    'ਖ': 'k\u0332h', // ਖ਼
    'ਗ': 'ġh',    // ਗ਼
    'ਜ': 'z',     // ਜ਼
    'ਫ': 'f',     // ਫ਼
    'ਲ': 'ḷ',     // ਲ਼
    'ਕ': 'q',      // ਕ਼
    //TODO: handle ਅ਼ (airaa with dot below)
    // 'ਅ': 'a',      // ਅ਼ 
  };

  private static readonly PERSIAN_MAP_PRECOMPOSED: Record<string, string> = {
    'ਸ਼': 'ś',    // ਸ਼ 
    'ਖ਼': 'k\u0332h', // ਖ਼
    'ਗ਼': 'ġh',    // ਗ਼
    'ਜ਼': 'z',     // ਜ਼
    'ਫ਼': 'f',     // ਫ਼
    'ਲ਼': 'ḷ',     // ਲ਼
  };

  /**
   * Convert Gurmukhi text to ISO 15919 phonetic representation.
   * 
   * Nasalization marks are handled as follows:
   * - ੰ (tippi) → ṁ (dot above) - Used within words
   * - ਂ (bindi) → ṃ (dot below) - Used typically word-finally
   * 
   * Note: For tippi (ੰ) followed by ਮ, we explicitly mark the nasalization (ṁ)
   * on the first m. This may deviate from ISO 15919 standard (needs verification)
   * but maintains the distinction between tippi and addak cases.
   */
  public static toPhonetic(text: string): string {
    let result = '';
    let i = 0;
    
    while (i < text.length) {
      let char = text[i];
      let nextChar = text[i + 1] || '';
      let nextNextChar = text[i + 2] || '';
      
      // Check for special symbols first
      if (char in this.MAPS.SPECIAL_SYMBOLS) {
        result += this.MAPS.SPECIAL_SYMBOLS[char];
        i++;
        continue;
      }

      // Check for punctuation (including line breaks)
      if (char in this.MAPS.PUNCTUATION) {
        result += this.MAPS.PUNCTUATION[char];
        i++;
        continue;
      }

      // Check for numbers
      if (char in this.MAPS.NUMBERS) {
        result += this.MAPS.NUMBERS[char];
        i++;
        continue;
      }

      // Handle gemination (addak)
      if (nextChar === 'ੱ' && nextNextChar) {
        if (nextNextChar in this.MAPS.CONSONANTS) {
          if (char in this.MAPS.CONSONANTS) {
            // Add current consonant plus mukta 'a'
            result += this.MAPS.CONSONANTS[char] + 'a';
          } else if (char in this.MAPS.VOWEL_DIACRITICS) {
            // Add current vowel diacritic
            result += this.MAPS.VOWEL_DIACRITICS[char];
          } else if (char in this.MAPS.VOWELS) {
            // Add current vowel
            result += this.MAPS.VOWELS[char];
          }

          // Check if the consonant is aspirated
          const consonantValue = this.MAPS.CONSONANTS[nextNextChar];
          if (consonantValue.length > 1 && consonantValue[1] === 'h') {
            result += consonantValue[0] + consonantValue;
          } else {
            result += consonantValue + consonantValue;
          }
          i += 3;
          if (i < text.length && !(text[i] in this.MAPS.VOWEL_DIACRITICS)) {
            result += 'a';
          }
          continue;
        }
      }

      // Handle nasalization
      if (nextChar === 'ੰ' || nextChar === 'ਂ') {  // tippi or bindi
        if (char in this.MAPS.CONSONANTS) {
          result += this.MAPS.CONSONANTS[char] + 'a';
        } else if (char in this.MAPS.VOWEL_DIACRITICS) {
          result += this.MAPS.VOWEL_DIACRITICS[char];
        } else if (char in this.MAPS.VOWELS) {
          result += this.MAPS.VOWELS[char];
        }
        result += nextChar === 'ੰ' ? 'ṁ' : 'ṃ';
        i += 2;
        continue;
      } 

      // Handle vowel sequences
      if (result.length > 0 && result.endsWith('a') && char in this.MAPS.VOWELS) {
        result += "'" + this.MAPS.VOWELS[char];
        i++;
        continue;
      }

      // Process regular characters
      if (char in this.MAPS.CONSONANTS || char in this.PERSIAN_MAP_PRECOMPOSED) {
        // Check for nukta or if it's a pre-composed Persian character
        const isPersianConsonant = char in this.PERSIAN_MAP_PRECOMPOSED;
        const isPersianConsonantBase = char in this.PERSIAN_MAP_BASE;
        const hasNukta = nextChar === '਼';
        
        if (hasNukta && isPersianConsonantBase) {
          // Handle decomposed form (base + nukta)
          result += this.PERSIAN_MAP_BASE[char];
          i += 2;  // Skip both the base consonant and nukta
        } else if (isPersianConsonant) {
          // Handle pre-composed form
          result += this.PERSIAN_MAP_PRECOMPOSED[char];
          i++;
        } else {
          // Handle regular consonant
          result += this.MAPS.CONSONANTS[char];
          i++;
        }

        char = text[i];
        nextChar = text[i + 1] || '';
        nextNextChar = text[i + 2] || '';

        // Handle conjuncts (virama + consonant)
        if (char === '੍' && nextChar && nextChar in this.MAPS.CONSONANTS) {
            // Add the consonant with conjunct (consonant after the virama)
            result += this.MAPS.CONSONANTS[nextChar];
            // Add 'a' only if there's no following vowel diacritic
            if (!(nextNextChar in this.MAPS.VOWEL_DIACRITICS)) {
                result += 'a';
                i += 2;
            } else if (nextNextChar in this.MAPS.VOWEL_DIACRITICS) {
                result += this.MAPS.VOWEL_DIACRITICS[nextNextChar];
                i += 3;
            } else {
                i += 2;
            }
            continue;
        }
        
        
        // Add inherent 'a' if needed
        // const nextCharAfterSequence = text[hasNukta ? i + 1 : i];
        if (char !== '੍' && !(char in this.MAPS.VOWEL_DIACRITICS)) {
          result += 'a';
        }
      } else if (char in this.MAPS.VOWEL_DIACRITICS) {
        result += this.MAPS.VOWEL_DIACRITICS[char];
        i++;
      } else if (char in this.MAPS.VOWELS) {
        result += this.MAPS.VOWELS[char];
        i++;
      } else {
        // Fallback for unknown characters - ALWAYS log in development
        if (process.env.NODE_ENV === 'development') {
          console.debug(`Unknown character: '${char}' (${char.charCodeAt(0)})`);
        }
        // Skip the unknown character but make sure to increment i
        i++;
        continue;
      }
    }
    return result;
  }
} 