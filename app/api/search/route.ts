import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { gurmukhiWordToIPA, normalizeIPA } from "@/lib/gurmukhi-to-ipa";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const gurmukhi = searchParams.get("q") ?? "";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);

  if (!gurmukhi.trim()) {
    return NextResponse.json({ results: [] });
  }

  const queryIPA = normalizeIPA(gurmukhiWordToIPA(gurmukhi));

  const { data, error } = await supabase.rpc("search_words_phonetic", {
    query_ipa: queryIPA,
    result_limit: limit,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ results: data ?? [], queryIPA });
}
