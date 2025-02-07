import { GurmukhiISO15919 } from '../iso15919';

describe('GurmukhiISO15919', () => {
  // Helper function to run test cases
  const runTestCases = (testCases: Record<string, string>) => {
    Object.entries(testCases).forEach(([input, expected]) => {
      expect(GurmukhiISO15919.toPhonetic(input)).toBe(expected);
    });
  };

  // Basic functionality tests
  describe('basic functionality', () => {
    it('should handle empty input', () => {
      expect(GurmukhiISO15919.toPhonetic('')).toBe('');
    });

    // Special symbols
    it('should convert Ik Onkar correctly', () => {
      expect(GurmukhiISO15919.toPhonetic('ੴ')).toBe('ika oaṁkāra');
    });

    // Basic vowels
    it('should handle independent vowels', () => {
      const testCases = {
        'ਅ': 'a',
        'ਆ': 'ā',
        'ਇ': 'i',
        'ਈ': 'ī',
        'ਉ': 'u',
        'ਊ': 'ū',
        'ਏ': 'ē',
        'ਐ': 'ai',
        'ਓ': 'ō',
        'ਔ': 'au'
      };
      runTestCases(testCases);
    });

    // Vowel diacritics
    it('should handle vowel diacritics', () => {
      const testCases = {
        'ਕਾ': 'kā',
        'ਕਿ': 'ki',
        'ਕੀ': 'kī',
        'ਕੁ': 'ku',
        'ਕੂ': 'kū',
        'ਕੇ': 'kē',
        'ਕੈ': 'kai',
        'ਕੋ': 'kō',
        'ਕੌ': 'kau'
      };
      runTestCases(testCases);
    });

    // Basic consonants
    it('should handle basic consonants', () => {
      const testCases = {
        'ਕ': 'ka',
        'ਖ': 'kha',
        'ਗ': 'ga',
        'ਘ': 'gha',
        'ਙ': 'ṅa',
        'ਚ': 'ca',
        'ਛ': 'cha',
        'ਜ': 'ja',
        'ਝ': 'jha',
        'ਞ': 'ña'
      };
      runTestCases(testCases);
    });

    // Numbers
    it('should handle Gurmukhi numerals', () => {
      const testCases = {
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
      };
      runTestCases(testCases);
    });

    // Punctuation
    it('should handle punctuation marks', () => {
      const testCases = {
        '॥': '||',
        '।': '|',
        ' ': ' ',
        '.': '.',
        ',': ',',
        '?': '?',
        '!': '!',
        '"': '"',
        "'": "'",
        '\n': '\n'
      };
      runTestCases(testCases);
    });
  });

  // Nasalization tests
  describe('nasalization', () => {
    it('should handle tippi correctly', () => {
      const testCases = {
        'ਸੰਤ': 'saṁta',
        'ਅੰਗ': 'aṁga',
        'ਪੰਜ': 'paṁja'
      };
      runTestCases(testCases);
    });

    it('should handle bindi correctly', () => {
      const testCases = {
        'ਮਾਂ': 'māṃ',
        'ਕਾਂ': 'kāṃ',
        'ਨੂੰ': 'nūṁ'
      };
      runTestCases(testCases);
    });
  });

  // Persian character tests
  describe('persian characters', () => {
    it('should handle Persian-influenced characters', () => {
      expect(GurmukhiISO15919.toPhonetic('ਖ਼')).toBe('k̲ha');
      expect(GurmukhiISO15919.toPhonetic('ਗ਼')).toBe('ġha');
      expect(GurmukhiISO15919.toPhonetic('ਜ਼')).toBe('za');
      expect(GurmukhiISO15919.toPhonetic('ਫ਼')).toBe('fa');
      expect(GurmukhiISO15919.toPhonetic('ਸ਼')).toBe('śa');
      expect(GurmukhiISO15919.toPhonetic('ਲ਼')).toBe('ḷa');
      expect(GurmukhiISO15919.toPhonetic('ਕ਼')).toBe('qa');
    });

    it('should handle decomposed Persian characters', () => {
      const composed = 'ਸ਼';
      const decomposed = 'ਸ਼';  // This is actually ਸ + ਼
      expect(GurmukhiISO15919.toPhonetic(composed)).toBe('śa');
      expect(GurmukhiISO15919.toPhonetic(decomposed)).toBe('śa');
    });
  });

  // Gemination tests
  describe('gemination', () => {
    it('should handle addak (gemination) correctly', () => {
      const testCases = {
        'ਪੱਕਾ': 'pakkā',
        'ਚੱਲੀ': 'callī',
        'ਕੱਚਾ': 'kaccā'
      };
      runTestCases(testCases);
    });
  });

  // Complex word tests
  describe('complex words', () => {
    it('should handle complex word combinations', () => {
      const testCases = {
        'ਸਤਿਗੁਰੁ': 'satiguru',
        'ਵਾਹਿਗੁਰੂ': 'vāhigurū',
        'ਸੰਗਤਿ': 'saṁgati',
        'ਕੀਰਤਨੁ': 'kīratanu'
      };
      runTestCases(testCases);
    });

    it('should handle vowel sequences correctly', () => {
      const testCases = {
        'ਭਾਈ': 'bhāī',
        'ਹੋਇਆ': 'hōiā',
        'ਕਿਉਂ': 'kiuṃ',
        'ਸੋਈ': 'sōī'
      };
      runTestCases(testCases);
    });
  });

  // Conjuncts tests
  describe('conjuncts', () => {
    it('should handle consonant conjuncts correctly', () => {
      const testCases = {
        'ਪ੍ਰੇਮ': 'prēma',
        'ਤ੍ਰੇਤਾ': 'trētā',
        'ਸ੍ਰੀ': 'srī',
        'ਕ੍ਰਿਪਾ': 'kripā',
        'ਸ੍ਵਾਮੀ': 'svāmī',
        'ਦ੍ਰਿਸ਼੍ਟ': 'driśṭa', // ਸ਼ is made up of ਸ +  ਼
        'ਦ੍ਰਿਸ਼੍ਟ': 'driśṭa', // ਸ਼ is a pre-structured persian character
        'ਪ੍ਰਸਾਦਿ': 'prasādi',
        'ਇਸ੍ਨਾਨੁ': 'isnānu',
        'ਮਸ੍ਤ': 'masta'
      };
      runTestCases(testCases);
    });
  });

  // Error handling tests
  describe('error handling', () => {
    it('should handle malformed input gracefully', () => {
      expect(() => GurmukhiISO15919.toPhonetic('test\uFFFF')).not.toThrow();
    });

    it('should warn about unknown characters in development', () => {
      // Store the original NODE_ENV
      const originalEnv = process.env.NODE_ENV;
      
      // Set NODE_ENV to development
      process.env.NODE_ENV = 'development';
      
      // Spy on console.debug
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();
      
      // Run the test with a string containing unknown characters
      GurmukhiISO15919.toPhonetic('test$123');  // '$' is definitely not in our maps
      
      // Verify console.debug was called
      expect(consoleSpy).toHaveBeenCalled();
      
      // Clean up
      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });
  });
}); 