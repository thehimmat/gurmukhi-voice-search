/**
 * Legacy encoding conversion system for Gurmukhi script.
 * 
 * Handles conversion from:
 * - Font-based encodings (AnmolLipi, GurbaniAkhar, etc.)
 * - Keyboard mappings (ASCII-based input)
 * to Unicode Gurmukhi.
 */

import unorm from 'unorm';

// Type definitions
type EncodingType = 'anmollipi' | 'unicode';

interface CharacterMaps {
  readonly SPECIAL_COMBINATIONS: Record<string, string>;
  readonly ANMOLLIPI_MAP: Record<string, string>;
  readonly SUBJOINED_MAP: Record<string, string>;
}

export class GurmukhiLegacy {
  private static readonly MAPS: CharacterMaps = {
    // Special combinations that need to be processed first
    SPECIAL_COMBINATIONS: {
      '<>': 'ੴ',    // Ik Onkar
      'ÅÆ': 'ੴ',    // Ik Onkar (alternative)
      '[]': '॥',     // Double danda
      ']': '॥',      // Single closing bracket to double danda
      '[': '।',      // Single opening bracket to single danda
      'W': 'ਾਂ',     // pre-composed kanna + bindi
      '`N': 'ਁ',     // udaat
      '`ˆ': 'ਁ',     // udaat (alternative)
      '~N': 'ਁ',     // udaat (alternative)
      '~ˆ': 'ਁ',     // udaat (alternative)
      'ƒ': 'ਨੂੰ',    // noon + dulainkar + tippi
      
      // Vowel combinations with ਅ (airha)
      'Aw': 'ਆ',     // airha + kanna
      'AW': 'ਆਂ',    // airha + kanna + bindi
      'AY': 'ਐ',     // airha + dulavan
      'AO': 'ਔ',     // airha + kanaura
      
      // Vowel combinations with ੲ (iri)
      'ie': 'ਇ',     // iri + sihari
      'eI': 'ਈ',     // iri + bihari
      'ey': 'ਏ',     // iri + lavan
      
      // Vowel combinations with ੳ (oora)
      'au': 'ਉ',     // oora + aunkar
      'aU': 'ਊ',     // oora + dulainkar
      
      // Persian character combinations
      'sæ': '\u0A36', // Alternative to 'S' (ਸ਼)
      'Kæ': '\u0A59', // Alternative to '^' (ਖ਼)
      'gæ': '\u0A5A', // Alternative to 'Z' (ਗ਼)
      'jæ': '\u0A5B', // Alternative to 'z' (ਜ਼)
      'Pæ': '\u0A5E', // Alternative to '&' (ਫ਼)
      'læ': '\u0A33', // Alternative to 'L' (ਲ਼)
      'kæ': 'ਕ਼',     // k + nukta
      'Aæ': 'ਅ਼',     // A + nukta
    },

    // AnmolLipi font mapping for single characters
    ANMOLLIPI_MAP: {
      // Base vowel carriers
      'a': 'ੳ',     // oora
      'A': 'ਅ',     // airha
      'e': 'ੲ',     // iri
      'E': 'ਓ',     // oora + hora (direct mapping)

      // Vowel marks with alternatives
      'w': 'ਾ',     // kanna
      'i': 'ਿ',     // sihari
      'I': 'ੀ',     // bihari
      'u': 'ੁ',     // aunkar
      'ü': 'ੁ',     // aunkar (alternative)
      'U': 'ੂ',     // dulainkar
      '¨': 'ੂ',     // dulainkar (alternative)
      'y': 'ੇ',     // lavan
      'Y': 'ੈ',     // dulavan
      'o': 'ੋ',     // hora
      'O': 'ੌ',     // kanaura

      // Special marks with alternatives
      'M': 'ੰ',     // tippi
      'µ': 'ੰ',     // tippi (alternative)
      'N': 'ਂ',     // bindi
      'ˆ': 'ਂ',     // bindi (alternative)
      'æ': '਼',     // nukta
      'Ú': 'ਃ',     // visarg
      
      // Ik Onkar variations
      '¡': 'ੴ',     // Single character Ik Onkar
      '¤': 'ੴ',     // Alternative single character Ik Onkar
      
      // Alternative characters that map to same output
      '<': 'Å',     // Maps to Å
      'Å': 'Å',     // Ura
      '>': 'Æ',     // Maps to Æ
      'Æ': 'Æ',     // Ura
      
      // Consonants
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
      'l': 'ਲ',
      'v': 'ਵ',
      'V': 'ੜ',

      // Special characters
      '`': 'ੱ',     // addak
      '~': 'ੱ',     // addak (alternative)
      '@': '੍',     // halant/virama
      
      // Numbers
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

      // Preserve spaces and newlines
      ' ': ' ',
      '\n': '\n',

      // Persian characters (using pre-composed characters)
      'L': 'ਲ਼',    // Laam (pre-composed)
      'S': 'ਸ਼',    // Sheen (pre-composed)
      'z': 'ਜ਼',    // Zaal (pre-composed)
      'Z': 'ਗ਼',    // Ghayn (pre-composed)
      '^': 'ਖ਼',    // Khay (pre-composed)
      '&': 'ਫ਼',    // Faa (pre-composed)
    },

    // Special subjoined characters in AnmolLipi
    SUBJOINED_MAP: {
      'H': '੍ਹ',    // pair haha
      '†': '੍ਟ',    // pair tainka
      '˜': '੍ਨ',    // pair nanna
      'œ': '੍ਤ',    // pair tatta
      'R': '੍ਰ',    // pair rara
      'Î': '੍ਯ',    // sanyukt yayya
      '´': 'ੵ',     // yakash
      'Ï': 'ੵ',     // yakash (alternate)
      'Í': '੍ਵ',    // pair vava
      'ç': '੍ਚ',    // pair chachha
      '®': '੍ਰ',    // pair rara
    }
  } as const;

  /**
   * Convert legacy encoded text to Unicode Gurmukhi.
   * @param text - The input text in legacy encoding
   * @param encoding - The encoding type (default: 'anmollipi')
   * @returns Unicode Gurmukhi text
   * @throws Error if encoding is unsupported
   */
  public static toUnicode(text: string, encoding: EncodingType = 'anmollipi'): string {
    if (!text) return "";
    if (encoding.toLowerCase() !== 'anmollipi') {
      throw new Error(`Unsupported encoding: ${encoding}`);
    }

    const chars: string[] = [];
    let sihariPosition: number | null = null;
    let i = 0;

    while (i < text.length) {
      // 1. Check special combinations FIRST
      let foundSpecial = false;
      for (const [combo, replacement] of Object.entries(this.MAPS.SPECIAL_COMBINATIONS)) {
        if (text.startsWith(combo, i)) {
          chars.push(replacement);
          i += combo.length;
          foundSpecial = true;
          break;
        }
      }
      if (foundSpecial) continue;

      const char = text[i];

      // 2. Handle sihari separately
      if (char === 'i') {
        sihariPosition = chars.length; // Mark position for later insertion
        i++;
        continue;
      }

      // 3. Process regular characters and their subjoined forms
      if (this.MAPS.ANMOLLIPI_MAP[char]) {
        const basePos = chars.length;
        chars.push(this.MAPS.ANMOLLIPI_MAP[char]);

        // Look ahead for subjoined characters
        let nextPos = i + 1;
        while (nextPos < text.length && this.MAPS.SUBJOINED_MAP[text[nextPos]]) {
          chars.push(this.MAPS.SUBJOINED_MAP[text[nextPos]]);
          nextPos++;
        }

        // Insert sihari after base and its subjoined characters
        if (sihariPosition !== null && sihariPosition <= basePos) {
          chars.splice(chars.length, 0, 'ਿ');
          sihariPosition = null;
        }

        i = nextPos;
        continue;
      }

      // Handle unknown characters
      if (char !== '\u0000' && char !== '\ufffd') { // Skip null and replacement characters
        console.warn(`Unknown character '${char}' at position ${i}`);
      }
      i++;
    }

    // Add any remaining sihari
    if (sihariPosition !== null) {
      chars.push('ਿ');
    }

    return unorm.nfc(chars.join(''));
  }

  /**
   * Attempt to detect the encoding of the input text.
   * @param text - The input text to analyze
   * @returns The detected encoding type
   */
  public static detectEncoding(text: string): EncodingType {
    // TODO: Implement encoding detection logic
    return 'unicode';
  }

  // Helper methods
  private static isVowelDiacritic(char: string): boolean {
    const vowelDiacritics = ['w', 'i', 'I', 'u', 'U', 'y', 'Y', 'o', 'O'];
    return vowelDiacritics.includes(char);
  }

  private static isConsonant(char: string): boolean {
    // List of all consonant Unicode points in Gurmukhi
    const consonantRange = [
      'ਸ', 'ਹ', 'ਕ', 'ਖ', 'ਗ', 'ਘ', 'ਙ', 'ਚ', 'ਛ', 'ਜ', 'ਝ', 'ਞ',
      'ਟ', 'ਠ', 'ਡ', 'ਢ', 'ਣ', 'ਤ', 'ਥ', 'ਦ', 'ਧ', 'ਨ', 'ਪ', 'ਫ',
      'ਬ', 'ਭ', 'ਮ', 'ਯ', 'ਰ', 'ਲ', 'ਵ', 'ੜ'
    ];
    return consonantRange.includes(char);
  }

  private static isAspiratedConsonant(char: string): boolean {
    return char.length > 1 && char[1] === 'h';
  }
} 