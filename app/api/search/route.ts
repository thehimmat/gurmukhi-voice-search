import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { gurmukhiWordToIPA, normalizeIPA } from "@/lib/gurmukhi-to-ipa";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Gurmukhi Unicode block: U+0A00–U+0A7F
const GURMUKHI_RE = /[਀-੿]/;

/**
 * Rough romanization → phonetic key.
 * Maps common English spelling conventions to the normalized IPA we store,
 * so "waheguru", "wahiguru", "satnam" etc. all find the right words.
 */
function romanToPhoneticKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/wh/g, "v")       // wh → v  (waheguru → vaheguru)
    .replace(/w/g, "v")        // w → v
    .replace(/ee/g, "i")       // ee → i
    .replace(/oo/g, "u")       // oo → u
    .replace(/aa/g, "a")       // aa → a  (already long in our keys)
    .replace(/kh/g, "kh")      // keep kh
    .replace(/gh/g, "g")       // gh → g  (both map to g in our IPA)
    .replace(/dh/g, "d")       // dh → d
    .replace(/th/g, "t")       // th → t
    .replace(/bh/g, "b")       // bh → b
    .replace(/ph/g, "p")       // ph → p  (pʰ → p in normalized)
    .replace(/sh/g, "sh")      // keep sh
    .replace(/ch/g, "ch")      // keep ch
    .replace(/ng/g, "n")       // ng → n
    .replace(/[^a-z]/g, "");   // strip anything non-alpha
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = (searchParams.get("q") ?? "").trim();
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  // If the query contains Gurmukhi characters, convert via IPA rules.
  // Otherwise treat it as romanized phonetic input.
  const isGurmukhi = GURMUKHI_RE.test(q);
  const queryIPA = isGurmukhi
    ? normalizeIPA(gurmukhiWordToIPA(q))
    : romanToPhoneticKey(q);

  if (!queryIPA) {
    return NextResponse.json({ results: [], queryIPA: "" });
  }

  const { data, error } = await supabase.rpc("search_words_phonetic", {
    query_ipa: queryIPA,
    result_limit: limit,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ results: data ?? [], queryIPA, isGurmukhi });
}
