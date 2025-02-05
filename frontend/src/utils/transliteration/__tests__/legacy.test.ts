import { GurmukhiLegacy } from '../legacy';

describe('GurmukhiLegacy', () => {
  // Helper function to run test cases
  const runTestCases = (testCases: Record<string, string>) => {
    Object.entries(testCases).forEach(([input, expected]) => {
      // For Persian characters and shasha, allow both pre-composed and base+nukta forms
      if (input.includes('æ') || input.includes('S')) {
        const result = GurmukhiLegacy.toUnicode(input);
        // Normalize both strings to allow either form
        const resultNFD = result.normalize('NFD');
        const expectedNFD = expected.normalize('NFD');
        expect(resultNFD).toBe(expectedNFD);
      } else {
        expect(GurmukhiLegacy.toUnicode(input)).toBe(expected);
      }
    });
  };

  // Basic functionality tests
  describe('basic functionality', () => {
    it('should handle empty input', () => {
      expect(GurmukhiLegacy.toUnicode('')).toBe('');
    });

    it('should throw error for unsupported encoding', () => {
      expect(() => GurmukhiLegacy.toUnicode('test', 'invalid' as any))
        .toThrow('Unsupported encoding: invalid');
    });

    // Special combinations
    it('should convert Ik Onkar combinations', () => {
      expect(GurmukhiLegacy.toUnicode('<>')).toBe('ੴ');
      expect(GurmukhiLegacy.toUnicode('ÅÆ')).toBe('ੴ');
      expect(GurmukhiLegacy.toUnicode('¡')).toBe('ੴ');
    });

    // Vowel combinations
    it('should handle vowel combinations with ਅ (airha)', () => {
      expect(GurmukhiLegacy.toUnicode('Aw')).toBe('ਆ');
      expect(GurmukhiLegacy.toUnicode('AW')).toBe('ਆਂ');
      expect(GurmukhiLegacy.toUnicode('AY')).toBe('ਐ');
      expect(GurmukhiLegacy.toUnicode('AO')).toBe('ਔ');
    });

    // Sihari handling
    it('should handle sihari correctly', () => {
      expect(GurmukhiLegacy.toUnicode('si')).toBe('ਸਿ');
      expect(GurmukhiLegacy.toUnicode('isr')).toBe('ਸਿਰ');
    });

    // Tippi handling
    it('should handle tippi correctly', () => {
      expect(GurmukhiLegacy.toUnicode('M')).toBe('ੰ');
      expect(GurmukhiLegacy.toUnicode('µ')).toBe('ੰ');
      expect(GurmukhiLegacy.toUnicode('sM')).toBe('ਸੰ');
    });

    // Persian characters
    it('should handle Persian character combinations', () => {
      expect(GurmukhiLegacy.toUnicode('sæ')).toBe('ਸ਼');
      expect(GurmukhiLegacy.toUnicode('Kæ')).toBe('ਖ਼');
      expect(GurmukhiLegacy.toUnicode('gæ')).toBe('ਗ਼');
    });

    // Complex combinations
    it('should handle complex word combinations', () => {
      expect(GurmukhiLegacy.toUnicode('siqgur')).toBe('ਸਤਿਗੁਰ');
      expect(GurmukhiLegacy.toUnicode('vwihgurU')).toBe('ਵਾਹਿਗੁਰੂ');
    });

    // Subjoined characters
    it('should handle subjoined characters', () => {
      expect(GurmukhiLegacy.toUnicode('s@v')).toBe('ਸ੍ਵ');
      expect(GurmukhiLegacy.toUnicode('pR')).toBe('ਪ੍ਰ');
    });

    // Line handling
    it('should handle multiple lines correctly', () => {
      const input = 'siq\n\nnwmu\n\nkrqw purKu';
      const expected = 'ਸਤਿ\n\nਨਾਮੁ\n\nਕਰਤਾ ਪੁਰਖੁ';
      expect(GurmukhiLegacy.toUnicode(input)).toBe(expected);
    });
  });

  // Comprehensive test cases
  describe('Ik Onkar variations', () => {
    it('should handle all variations of Ik Onkar', () => {
      const testCases = {
        '<>': 'ੴ',
        'ÅÆ': 'ੴ',
        '¡': 'ੴ',
      };
      runTestCases(testCases);
    });
  });

  describe('Nasalization alternatives', () => {
    it('should handle tippi and bindi alternatives', () => {
      const testCases = {
        'isMG': 'ਸਿੰਘ',     // with M
        'isµG': 'ਸਿੰਘ',     // with µ
        'qwN': 'ਤਾਂ',       // with N
        'qwˆ': 'ਤਾਂ',       // with ˆ
        'qW': 'ਤਾਂ',        // with W (pre-composed kanna+bindi)
      };
      runTestCases(testCases);
    });
  });

  // Error handling tests
  describe('error handling', () => {
    it('should handle malformed input gracefully', () => {
      expect(() => GurmukhiLegacy.toUnicode('test\uFFFF')).not.toThrow();
    });

    it('should warn about unknown characters', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      GurmukhiLegacy.toUnicode('test$123');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('vowel mark alternatives', () => {
    it('should handle alternative vowel marks', () => {
      const testCases = {
        'guru': 'ਗੁਰੁ',     // with u
        'gurü': 'ਗੁਰੁ',     // with ü
        'pUrw': 'ਪੂਰਾ',     // with U
        'p¨rw': 'ਪੂਰਾ',     // with ¨
      };
      runTestCases(testCases);
    });
  });

  describe('addak alternatives', () => {
    it('should handle addak alternatives', () => {
      const testCases = {
        'p`kw': 'ਪੱਕਾ',     // with `
        'p~kw': 'ਪੱਕਾ',     // with ~
      };
      runTestCases(testCases);
    });
  });

  describe('udaat combinations', () => {
    it('should handle udaat combinations', () => {
      const testCases = {
        'h`N': 'ਹਁ',        // with `N
        'h`ˆ': 'ਹਁ',        // with `ˆ
        'h~N': 'ਹਁ',        // with ~N
        'h~ˆ': 'ਹਁ',        // with ~ˆ
      };
      runTestCases(testCases);
    });
  });

  describe('special characters', () => {
    it('should handle special characters and combinations', () => {
      const testCases = {
        'æ': '਼',           // nukta
        'Ú': 'ਃ',          // visarga
        'ƒ': 'ਨੂੰ',         // nana + dulainkar + tippi
      };
      runTestCases(testCases);
    });
  });

  describe('subjoined characters', () => {
    it('should handle subjoined character combinations', () => {
      const testCases = {
        // Pair haha (੍ਹ)
        'nwnHw': 'ਨਾਨ੍ਹਾ',      // with H
        
        // Pair tainka (੍ਟ)
        'idRS†': 'ਦ੍ਰਿਸ਼੍ਟ',    // with †
        
        // Pair nanna (੍ਨ)
        'ies˜wnu': 'ਇਸ੍ਨਾਨੁ',  // with ˜
        
        // Pair tatta (੍ਤ)
        'msœ': 'ਮਸ੍ਤ',      // with œ
        
        // Pair rara (੍ਰ)
        'pRym': 'ਪ੍ਰੇਮ',     // with R
        
        // Sanyukt yayya (੍ਯ)
        'sÎwm': 'ਸ੍ਯਾਮ',    // with Î
        
        // Yakash (ੵ)
        's´wm': 'ਸੵਾਮ',     // with ´
        'sÏwm': 'ਸੵਾਮ',     // with Ï (alternate)
        
        // Pair vava (੍ਵ)
        'sÍwmI': 'ਸ੍ਵਾਮੀ',   // with Í
        
        // Pair chachha (੍ਚ)
        'psçim': 'ਪਸ੍ਚਮਿ',  // with ç
        
        // Complex combinations
        'pRBU': 'ਪ੍ਰਭੂ',     // pair rara + vowels
        'DÎwn': 'ਧ੍ਯਾਨ',    // sanyukt yayya + vowels
        'sÍwgq': 'ਸ੍ਵਾਗਤ',   // pair vava + vowels
      };
      runTestCases(testCases);
    });
  });

  describe('vowel combinations', () => {
    it('should handle vowel combinations in actual words', () => {
      const testCases = {
        // Words with ਅ (airha) combinations
        'Awqm': 'ਆਤਮ',     // airha + kanna
        'AYsw': 'ਐਸਾ',      // airha + dulavan
        'AOKw': 'ਔਖਾ',      // airha + kanaura
        
        // Words with ੲ (iri) combinations
        'iehu': 'ਇਹੁ',      // iri + sihari
        'eIrKw': 'ਈਰਖਾ',    // iri + bihari
        'eyku': 'ਏਕੁ',      // iri + lavan
        
        // Words with ੳ (oora) combinations
        'aupjY': 'ਉਪਜੈ',    // oora + aunkar
        'aUcw': 'ਊਚਾ',      // oora + dulainkar
        'Ehu': 'ਓਹੁ',       // oora + hora
        
        // Complex vowel sequences
        'BweI': 'ਭਾਈ',      // kanna + bihari
        'AweI': 'ਆਈ',       // airha + kanna + bihari
        'hoeI': 'ਹੋਈ',      // hora + bihari
        'aUeI': 'ਊਈ',       // oora + dulainkar + bihari
        
        // Additional complex combinations
        'BieAw': 'ਭਇਆ',    // sihari + kanna
        'pieAw': 'ਪਇਆ',    // sihari + kanna
        'hoieAw': 'ਹੋਇਆ',  // hora + sihari + kanna
        'Awieau': 'ਆਇਉ',   // airha + kanna + sihari + aunkar
        'hoie': 'ਹੋਇ',     // hora + sihari
        'deIAw': 'ਦਈਆ',    // bihari + kanna
        'soeI': 'ਸੋਈ',     // hora + bihari
        'AweIAW': 'ਆਈਆਂ',  // airha + kanna + bihari + kanna + bindi
        'BeIAw': 'ਭਈਆ',    // bihari + kanna
        'AauqwrI': 'ਅਉਤਾਰੀ', // airha + aunkar + kanna + bihari
        'AYsIey': 'ਐਸੀਏ',   // airha + dulavan + bihari + lavan
        'EAMkwr': 'ਓਅੰਕਾਰ',  // hora + airha + tippi + kanna
      };
      runTestCases(testCases);
    });
  });

  describe('persian characters', () => {
    it('should handle Persian characters with nukta', () => {
      const testCases = {
        // ਖ਼ (Khay / ਖ਼ੇ)
        'Kæwlsw': 'ਖ਼ਾਲਸਾ',     // khalsa (sovereign)
        '^Yr': 'ਖ਼ੈਰ',         // khair (welfare)
        
        // ਗ਼ (Ghayn / ਗ਼ੈਨ)
        'gæzl': 'ਗ਼ਜ਼ਲ',       // ghazal (song)
        'ZYb': 'ਗ਼ੈਬ',         // ghaib (fear)
        
        // ਜ਼ (Zaal / ਜ਼ਾਲ)
        'jæmIn': 'ਜ਼ਮੀਨ',     // zameen (earth)
        'zor': 'ਜ਼ੋਰ',         // zor (force)
        
        // ਫ਼ (Faa / ਫ਼ਾ)
        'Pæqh': 'ਫ਼ਤਹ',        // fateh (victory)
        '&Oj': 'ਫ਼ੌਜ',         // fauj (army)
        
        // ਲ਼ (Laam / ਲਾਮ)
        'golæI': 'ਗੋਲ਼ੀ',       // gola (ball)
        'kwLw': 'ਕਾਲ਼ਾ',       // kala (black)
        
        // ਅ਼ (Ayn / ਅਯਿਨ)
        'Aædb': 'ਅ਼ਦਬ',        // adab (respect)
        'Aæd': 'ਅ਼ਦ',          // ad (respect)

        // ਕ਼ (Qaaf / ਕ਼ਾਫ਼)
        'kæwiedw': 'ਕ਼ਾਇਦਾ',   // qaida (rule/principle)
        'kævwl': 'ਕ਼ਵਾਲ',       // qawal (song)
        
        // ਸ਼ (Sheen / ਸ਼ੀਨ)
        'iSv': 'ਸ਼ਿਵ',         // shiv
        'SWqI': 'ਸ਼ਾਂਤੀ',       // shanti

        // Combinations
        'PæjæIlq': 'ਫ਼ਜ਼ੀਲਤ',   // fazilat (virtue)
        'gæjæb': 'ਗ਼ਜ਼ਬ',       // ghazab (wonder)
      };
      runTestCases(testCases);
    });
  });
}); 