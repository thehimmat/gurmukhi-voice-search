import { GurmukhiPractical } from '../practical';

describe('GurmukhiPractical', () => {
  // Helper function to run test cases
  const runTestCases = (testCases: Record<string, string>) => {
    Object.entries(testCases).forEach(([input, expected]) => {
      expect(GurmukhiPractical.toPractical(input)).toBe(expected);
    });
  };

  // Basic functionality tests
  describe('basic functionality', () => {
    it('should handle empty input', () => {
      expect(GurmukhiPractical.toPractical('')).toBe('');
    });

    // Special symbols
    it('should convert Ik Onkar correctly', () => {
      expect(GurmukhiPractical.toPractical('ੴ')).toBe('ik oankaar');
    });

    // Basic vowels
    it('should handle independent vowels', () => {
      const testCases = {
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
      };
      runTestCases(testCases);
    });

    // Vowel diacritics
    it('should handle vowel diacritics', () => {
      const testCases = {
        'ਕਾ': 'kaa',
        'ਕਿ': 'ki',
        'ਕੀ': 'kee',
        'ਕੁ': 'ku',
        'ਕੂ': 'koo',
        'ਕੇ': 'ke',
        'ਕੈ': 'kai',
        'ਕੋ': 'ko',
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
        'ਙ': 'nga',
        'ਚ': 'cha',
        'ਛ': 'chha',
        'ਜ': 'ja',
        'ਝ': 'jha',
        'ਞ': 'nya'
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
  });

  // Nasalization tests
  describe('nasalization', () => {
    it('should handle tippi correctly', () => {
      const testCases = {
        'ਸੰਤ': 'sant',
        'ਅੰਗ': 'ang',
        'ਪੰਜ': 'panj'
      };
      runTestCases(testCases);
    });

    it('should handle bindi correctly', () => {
      const testCases = {
        'ਮਾਂ': 'maan',
        'ਕਾਂ': 'kaan',
        'ਨੂੰ': 'noon'
      };
      runTestCases(testCases);
    });

    it('should handle nasalization before labial consonants', () => {
      const testCases = {
        'ਸੰਪ': 'samp',
        'ਸੰਭਵ': 'sambhav',
        'ਸੰਮਤ': 'sammat'
      };
      runTestCases(testCases);
    });
  });

  // Persian character tests
  describe('persian characters', () => {
    it('should handle Persian-influenced characters', () => {
      const testCases = {
        'ਖ਼': 'kha',
        'ਗ਼': 'gha',
        'ਜ਼': 'za',
        'ਫ਼': 'fa',
        'ਸ਼': 'sha',
        'ਲ਼': 'la',
        'ਕ਼': 'qa'
      };
      runTestCases(testCases);
    });
  });

  // Gemination tests
  describe('gemination', () => {
    it('should handle addak (gemination) correctly', () => {
      const testCases = {
        'ਪੱਕਾ': 'pakkaa',
        'ਚੱਲੀ': 'challee',
        'ਕੱਚਾ': 'kachcha'
      };
      runTestCases(testCases);
    });
  });

  // Complex word tests
  describe('complex words', () => {
    it('should handle complex word combinations', () => {
      const testCases = {
        'ਸਤਿਗੁਰੁ': 'satiguru',
        'ਵਾਹਿਗੁਰੂ': 'vaahiguroo',
        'ਸੰਗਤਿ': 'sangat',
        'ਕੀਰਤਨੁ': 'keertanu'
      };
      runTestCases(testCases);
    });
  });

  // Error handling tests
  describe('error handling', () => {
    it('should handle unknown characters gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      GurmukhiPractical.toPractical('test$123');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
}); 