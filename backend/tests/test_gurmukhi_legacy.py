import unittest
from unittest import TextTestRunner, TextTestResult
import sys
import os
import unicodedata

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from backend.src.transliteration.gurmukhi_legacy import GurmukhiLegacy

class CustomTextTestResult(TextTestResult):
    def __init__(self, stream, descriptions, verbosity):
        super().__init__(stream, descriptions, verbosity)
        self.successes = []
        self.failures_list = []

    def addSuccess(self, test):
        self.successes.append(test)
        super().addSuccess(test)

    def addFailure(self, test, err):
        self.failures_list.append((test, err))
        super().addFailure(test, err)

class TestGurmukhiLegacy(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.all_successes = []
        cls.all_failures = []

    def log_result(self, input_text, result, expected):
        if result == expected:
            self.__class__.all_successes.append((input_text, result))
        else:
            self.__class__.all_failures.append((input_text, result, expected))

    def run_test_cases(self, test_cases):
        """Run multiple test cases and show detailed output for failures."""
        for input_text, expected in test_cases.items():
            with self.subTest(input_text=input_text):
                result = GurmukhiLegacy.to_unicode(input_text)
                
                # For Persian characters and shasha, allow both pre-composed and base+nukta forms
                if 'æ' in input_text or 'S' in input_text:  # Check for both Persian and shasha
                    # Normalize both strings to allow either form
                    result_nfd = unicodedata.normalize('NFD', result)
                    expected_nfd = unicodedata.normalize('NFD', expected)
                    if result_nfd == expected_nfd:
                        continue
                
                if result != expected:
                    print(f"\nInput: {input_text}")
                    print(f"Result bytes:   {result.encode('utf-8')}")
                    print(f"Expected bytes: {expected.encode('utf-8')}")
                    print(f"Result codepoints:   {[hex(ord(c)) for c in result]}")
                    print(f"Expected codepoints: {[hex(ord(c)) for c in expected]}")
                self.assertEqual(result, expected)

    def test_ik_onkar_variations(self):
        """Test all variations of Ik Onkar."""
        test_cases = {
            '<>': 'ੴ',
            'ÅÆ': 'ੴ',
            '¡': 'ੴ',
        }
        self.run_test_cases(test_cases)

    def test_nasalization_alternatives(self):
        """Test tippi and bindi alternatives."""
        test_cases = {
            'isMG': 'ਸਿੰਘ',     # with M
            'isµG': 'ਸਿੰਘ',     # with µ
            'qwN': 'ਤਾਂ',       # with N
            'qwˆ': 'ਤਾਂ',       # with ˆ
            'qW': 'ਤਾਂ',        # with W (pre-composed kanna+bindi)
        }
        self.run_test_cases(test_cases)

    def test_vowel_mark_alternatives(self):
        """Test alternative vowel marks."""
        test_cases = {
            'guru': 'ਗੁਰੁ',     # with u
            'gurü': 'ਗੁਰੁ',     # with ü
            'pUrw': 'ਪੂਰਾ',     # with U
            'p¨rw': 'ਪੂਰਾ',     # with ¨
        }
        self.run_test_cases(test_cases)

    def test_addak_alternatives(self):
        """Test addak alternatives."""
        test_cases = {
            'p`kw': 'ਪੱਕਾ',     # with `
            'p~kw': 'ਪੱਕਾ',     # with ~
        }
        self.run_test_cases(test_cases)

    def test_udaat_combinations(self):
        """Test udaat combinations."""
        test_cases = {
            'h`N': 'ਹਁ',        # with `N
            'h`ˆ': 'ਹਁ',        # with `ˆ
            'h~N': 'ਹਁ',         # with ~N
            'h~ˆ': 'ਹਁ',         # with ~ˆ
        }
        self.run_test_cases(test_cases)

    def test_special_characters(self):
        """Test special characters and combinations."""
        test_cases = {
            'æ': '਼',           # nukta
            'Ú': 'ਃ',          # visarga
            'ƒ': 'ਨੂੰ',         # nana + dulainkar + tippi
        }
        self.run_test_cases(test_cases)

    def test_subjoined_characters(self):
        """Test subjoined character combinations."""
        test_cases = {
            # Pair haha (੍ਹ)
            'nwnHw': 'ਨਾਨ੍ਹਾ',      # with H
            
            # Pair tainka (੍ਟ)
            'idRS†': 'ਦ੍ਰਿਸ਼੍ਟ',      # with †
            
            # Pair nanna (੍ਨ)
            'ies˜wnu': 'ਇਸ੍ਨਾਨੁ',  # with ˜
            
            # Pair tatta (੍ਤ)
            'msœ': 'ਮਸ੍ਤ',      # with œ
            
            # Pair rara (੍ਰ)
            'pRym': 'ਪ੍ਰੇਮ',     # with R
            
            # Sanyukt yayya (੍ਯ)
            'sÎwm': 'ਸ੍ਯਾਮ',    # with Î
            
            # Yakash (ੵ)
            's´wm': 'ਸੵਾਮ',     # with ´
            'sÏwm': 'ਸੵਾਮ',     # with Ï (alternate)
            
            # Pair vava (੍ਵ)
            'sÍwmI': 'ਸ੍ਵਾਮੀ',   # with Í
            
            # Pair chachha (੍ਚ)
            'psçim': 'ਪਸ੍ਚਮਿ',      # with ç
            
            # Complex combinations
            'pRBU': 'ਪ੍ਰਭੂ',     # pair rara + vowels
            'DÎwn': 'ਧ੍ਯਾਨ',    # sanyukt yayya + vowels
            'sÍwgq': 'ਸ੍ਵਾਗਤ',   # pair vava + vowels
        }
        self.run_test_cases(test_cases)

    def test_complex_combinations(self):
        """Test complex combinations of multiple features."""
        test_cases = {
            'AMimRq': 'ਅੰਮ੍ਰਿਤ',  # nasalization + subjoined + sihari
            'pRwpiq': 'ਪ੍ਰਾਪਤਿ',  # subjoined + vowels
            'ik®Sw': 'ਕ੍ਰਿਸ਼ਾ',    # sihari + subjoined + shasha
            'ƒ': 'ਨੂੰ',          # pre-composed noon combination
        }
        self.run_test_cases(test_cases)

    def test_vowel_combinations(self):
        """Test vowel combinations in actual words."""
        test_cases = {
            # Words with ਅ (airha) combinations
            'Awqm': 'ਆਤਮ',     # airha + kanna
            'AYsw': 'ਐਸਾ',      # airha + dulavan
            'AOKw': 'ਔਖਾ',      # airha + kanaura
            
            # Words with ੲ (iri) combinations
            'iehu': 'ਇਹੁ',      # iri + sihari
            'eIrKw': 'ਈਰਖਾ',    # iri + bihari
            'eyku': 'ਏਕੁ',      # iri + lavan
            
            # Words with ੳ (oora) combinations
            'aupjY': 'ਉਪਜੈ',    # oora + aunkar
            'aUcw': 'ਊਚਾ',      # oora + dulainkar
            'Ehu': 'ਓਹੁ',       # oora + hora
            
            # Complex vowel sequences
            'BweI': 'ਭਾਈ',      # kanna + bihari
            'AweI': 'ਆਈ',       # airha + kanna + bihari
            'hoeI': 'ਹੋਈ',      # hora + bihari
            'aUeI': 'ਊਈ',       # oora + dulainkar + bihari
            
            # Additional complex combinations
            'BieAw': 'ਭਇਆ',    # sihari + kanna
            'pieAw': 'ਪਇਆ',    # sihari + kanna
            'hoieAw': 'ਹੋਇਆ',  # hora + sihari + kanna
            'Awieau': 'ਆਇਉ',   # airha + kanna + sihari + aunkar
            'hoie': 'ਹੋਇ',     # hora + sihari
            'deIAw': 'ਦਈਆ',    # bihari + kanna
            'soeI': 'ਸੋਈ',     # hora + bihari
            'AweIAW': 'ਆਈਆਂ',  # airha + kanna + bihari + kanna + bindi
            'BeIAw': 'ਭਈਆ',    # bihari + kanna
            'AauqwrI': 'ਅਉਤਾਰੀ', # airha + aunkar + kanna + bihari
            'AYsIey': 'ਐਸੀਏ',   # airha + dulavan + bihari + lavan
            'EAMkwr': 'ਓਅੰਕਾਰ',  # hora + airha + tippi + kanna
        }
        self.run_test_cases(test_cases)

    def test_persian_characters(self):
        """Test Persian characters with nukta."""
        test_cases = {
            # ਖ਼ (Khay / ਖ਼ੇ)
            'Kæwlsw': 'ਖ਼ਾਲਸਾ',     # khalsa (sovereign)
            'KæYr': 'ਖ਼ੈਰ',       # khair (welfare)
            
            # ਗ਼ (Ghayn / ਗ਼ੈਨ)
            'gæzl': 'ਗ਼ਜ਼ਲ',   # ghazal (song)
            'gæYb': 'ਗ਼ੈਬ',       # ghaib (fear)
            
            # ਜ਼ (Zaal / ਜ਼ਾਲ)
            'jæmIn': 'ਜ਼ਮੀਨ',   # zameen (earth)
            'jæor': 'ਜ਼ੋਰ',       # zor (force)
            
            # ਫ਼ (Faa / ਫ਼ਾ)
            'Pæqh': 'ਫ਼ਤਹ',      # fateh (victory)
            'PæOj': 'ਫ਼ੌਜ',       # fauj (army)
            
            # ਲ਼ (Laam / ਲਾਮ)
            'golæI': 'ਗੋਲ਼ੀ',     # gola (ball)
            'kwlæw': 'ਕਾਲ਼ਾ',     # kala (black)
            
            # ਅ਼ (Ayn / ਅਯਿਨ)
            'Aædb': 'ਅ਼ਦਬ',      # adab (respect)
            'Aæd': 'ਅ਼ਦ',        # ad (respect)

            # ਕ਼ (Qaaf / ਕ਼ਾਫ਼)
            'kæwiedw': 'ਕ਼ਾਇਦਾ',   # qaida (rule/principle)
            'kævwl': 'ਕ਼ਵਾਲ',     # qawal (song)
            
            # ਸ਼ (Sheen / ਸ਼ੀਨ)
            'iSv': 'ਸ਼ਿਵ',       # shiv
            'SWqI': 'ਸ਼ਾਂਤੀ',     # shanti

            # Combinations
            'PæjæIlq': 'ਫ਼ਜ਼ੀਲਤ', # fazilat (virtue)
            'gæjæb': 'ਗ਼ਜ਼ਬ',     # ghazab (wonder)
        }
        self.run_test_cases(test_cases)

if __name__ == '__main__':
    unittest.main() 