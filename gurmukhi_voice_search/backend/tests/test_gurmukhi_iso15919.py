import unittest
from unittest import TextTestRunner, TextTestResult
from src.transliteration.gurmukhi_iso15919 import GurmukhiISO15919

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


class CustomTextTestRunner(TextTestRunner):
    def run(self, test):
        result = super().run(test)

        print("\n" + "=" * 70)
        print("FINAL TEST SUMMARY")
        total_tests = len(result.successes) + len(result.failures_list)
        print(f"\nTotal: {total_tests}, Passed: {len(result.successes)}, Failed: {len(result.failures_list)}")

        if result.successes:
            print("\nSuccesses:")
            for test in result.successes:
                print(f"{test.shortDescription()}")

        if result.failures_list:
            print("\nFailures:")
            for test, err in result.failures_list:
                input_text = getattr(test, '_subtest', {}).get('input_text', 'Unknown')
                print(f"Test: {test.shortDescription()} (input_text='{input_text}')")
                print(err)
        print("\n" + "=" * 70)

        return result

class TestGurmukhiISO15919(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.all_successes = []
        cls.all_failures = []

    def log_result(self, input_text, result, expected):
        if result == expected:
            self.__class__.all_successes.append((input_text, result))
        else:
            self.__class__.all_failures.append((input_text, result, expected))

    @classmethod
    def tearDownClass(cls):
        print("\n" + "=" * 70)
        print("FINAL TEST SUMMARY")
        total_tests = len(cls.all_successes) + len(cls.all_failures)
        print(f"\nTotal: {total_tests}, Passed: {len(cls.all_successes)}, Failed: {len(cls.all_failures)}")

        if cls.all_successes:
            print("\nSuccesses:")
            for gurmukhi, output in cls.all_successes:
                print(f"'{gurmukhi}' → '{output}'")

        if cls.all_failures:
            print("\nFailures:")
            for gurmukhi, got, expected in cls.all_failures:
                print(f"'{gurmukhi}' → got '{got}', expected '{expected}'")

        print("\n" + "=" * 70)

    def run_test_cases(self, test_cases):
        for input_text, expected in test_cases.items():
            with self.subTest(input_text=input_text):
                result = GurmukhiISO15919.to_phonetic(input_text)
                self.log_result(input_text, result, expected)
                self.assertEqual(result, expected)

    def test_nasalization(self):
        """Test nasalization with both tippi (ੰ) and bindi (ਂ)."""
        test_cases = {
            'ਹਿੰਮਤ': 'hiṁmata',
            'ਸਿੰਘ': 'siṁgha',
            'ਕੰਮ': 'kaṁma',
            'ਅੰਮ੍ਰਿਤ': 'aṁmrita',
            'ਸਾਂਝਾ': 'sāṃjhā',
            'ਨਾਂ': 'nāṃ',
            'ਮੈਂ': 'maiṃ',
            'ਸਿਉਂ': "siuṃ",
            'ਨਾਉਂ': "nāuṃ",
        }
        self.run_test_cases(test_cases)

    def test_vowel_sequences(self):
        test_cases = {
            "ਭਾਈ": "bhāī",
            "ਕੌਰ": "kaura",
            "ਸਿਉ": "siu",
            "ਭਾਉ": "bhāu",
            'ਆਈਆਂ': 'āīāṃ',
        }
        self.run_test_cases(test_cases)

    def test_conjuncts(self):
        test_cases = {
            'ਪ੍ਰੇਮ': 'prēma',
            'ਸ੍ਰੀ': 'srī',
            'ਕ੍ਰਿਪਾ': 'kripā',
            'ਸ੍ਵਾਮੀ': 'svāmī',
        }
        self.run_test_cases(test_cases)

    def test_gemination(self):
        test_cases = {
            "ਪੱਕਾ": "pakkā",
            "ਚੱਲਣਾ": "callaṇā",
            "ਕੱਚਾ": "kaccā",
            "ਕਿੱਤਾ": "kittā",
            "ਪੁੱਤਰ": "puttara",
            "ਅੱਦਕ": "addaka",
            "ਮਿੱਠਾ": "miṭṭhā",
        }
        self.run_test_cases(test_cases)

if __name__ == '__main__':
    unittest.main(testRunner=CustomTextTestRunner)