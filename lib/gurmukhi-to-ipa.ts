import rulesJson from "./rules.json";

type Rules = typeof rulesJson;

const rules = rulesJson as Rules;

// Unicode ranges for Gurmukhi
const VOWEL_DIACRITICS = new Set([
  "ਾ", "ਿ", "ੀ", "ੁ", "ੂ", "ੇ", "ੈ", "ੋ", "ੌ",
]);
const NASALS = new Set(["ਂ", "ੰ"]);
const ADDAK = "ੱ"; // gemination mark
const VIRAMA = "੍"; // halant / virama

// Inherent vowel for a consonant with no following diacritic
const INHERENT_VOWEL = "ə";

// Consonants that carry low tone (mudda in some analyses) — from rules.json
// Reserved for future tone analysis
// const LOW_TONE_CONSONANTS: Set<string> = new Set(
//   (rules.lowToneConsonants as string[]) ?? []
// );

function getIPA(char: string): string {
  const p = (rules.primitives as Record<string, string>)[char];
  return p ?? "";
}

function getPlaceOfArticulation(char: string): string {
  return (rules.placeOfArticulation as Record<string, string>)[char] ?? "dental";
}

function resolveNasal(nextConsonant: string | null): string {
  if (!nextConsonant) return "n̪";
  const place = getPlaceOfArticulation(nextConsonant);
  return (rules.nasalResolution as Record<string, string>)[place] ?? "n̪";
}

/**
 * Convert a single Gurmukhi word to its IPA representation.
 * Handles: consonant+vowel clusters, inherent vowel, nasalization,
 * gemination (addak), and virama (consonant clusters).
 *
 * Does NOT handle tone (mudda, udaat) — out of scope for MVP.
 */
export function gurmukhiWordToIPA(word: string): string {
  const chars = [...word]; // split on Unicode codepoints
  let result = "";
  let i = 0;

  while (i < chars.length) {
    const ch = chars[i];
    const next = chars[i + 1] ?? null;

    // Addak: geminate the following consonant
    if (ch === ADDAK) {
      // The next consonant will be doubled — mark it; handled below when we
      // encounter the consonant at i+1 after incrementing
      if (next) {
        result += getIPA(next);
      }
      i++;
      continue;
    }

    // Virama: suppresses inherent vowel — next char is a consonant with no vowel
    if (ch === VIRAMA) {
      i++;
      continue;
    }

    // Nasal marks (bindi / tippi)
    if (NASALS.has(ch)) {
      // Resolve nasal to the place of articulation of the next consonant
      result += resolveNasal(next);
      i++;
      continue;
    }

    // Vowel diacritic appearing mid-stream (should be consumed by the
    // consonant processing below, but guard in case)
    if (VOWEL_DIACRITICS.has(ch)) {
      result += getIPA(ch);
      i++;
      continue;
    }

    // Check for overrides (consonant + following diacritic as a pair)
    const overrides = rules.overrides as Record<string, string>;
    if (next && overrides[ch + next]) {
      result += overrides[ch + next];
      i += 2;
      continue;
    }

    // Normal consonant
    const consonantIPA = getIPA(ch);
    if (consonantIPA !== undefined) {
      result += consonantIPA;

      // Look ahead: does a vowel diacritic follow?
      if (next && VOWEL_DIACRITICS.has(next)) {
        result += getIPA(next);
        i += 2;

        // Nasal after the vowel?
        const afterVowel = chars[i] ?? null;
        if (afterVowel && NASALS.has(afterVowel)) {
          result += resolveNasal(chars[i + 1] ?? null);
          i++;
        }
        continue;
      }

      // Does virama follow? (consonant cluster — no inherent vowel)
      if (next === VIRAMA) {
        i += 2;
        continue;
      }

      // No vowel diacritic and no virama → apply inherent vowel
      // Exception: if this is the last character we still add inherent vowel
      // (final inherent vowel is debated; keep it for phonetic indexing purposes)
      if (consonantIPA !== "") {
        result += INHERENT_VOWEL;
      }
      i++;
      continue;
    }

    // Unknown character — skip
    i++;
  }

  return result;
}

/**
 * Normalize an IPA string for fuzzy matching:
 * - Collapse length distinctions (aː → a)
 * - Remove diacritics that a speaker might not distinguish (ʰ aspiration kept — it's salient)
 * - Lowercase
 */
export function normalizeIPA(ipa: string): string {
  return ipa
    .replace(/ː/g, "")         // long vowels → short
    .replace(/͡/g, "")          // affricates: remove tie bar
    .replace(/̪/g, "")          // dental diacritic
    .replace(/̪/g, "")    // dental diacritic (combining)
    .replace(/ɦ/g, "h")        // breathy h → plain h
    .replace(/ɾ/g, "r")        // flap → r
    .replace(/ɽ/g, "r")        // retroflex flap → r
    .replace(/ɪ/g, "i")        // near-close → i
    .replace(/ʊ/g, "u")        // near-close → u
    .replace(/ə/g, "a")        // schwa → a
    .replace(/ɔ/g, "o")        // open-mid → o
    .replace(/ɛ/g, "e")        // open-mid front → e
    .replace(/ʋ/g, "v")        // labiodental approx → v
    .replace(/ŋ/g, "n")        // velar nasal → n
    .replace(/ɲ/g, "n")        // palatal nasal → n
    .replace(/ɳ/g, "n")        // retroflex nasal → n
    .replace(/ɖ/g, "d")        // retroflex d → d
    .replace(/ʈ/g, "t")        // retroflex t → t
    .replace(/ʃ/g, "sh")       // not in Punjabi but handle anyway
    .toLowerCase();
}
