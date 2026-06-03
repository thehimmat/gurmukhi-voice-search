/**
 * Populate phonetic_ipa for all words in the Supabase words table.
 * Run with: npx tsx scripts/populate-phonetics.ts
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in env (not the anon key — we need write access).
 */

import { createClient } from "@supabase/supabase-js";
import { gurmukhiWordToIPA, normalizeIPA } from "../lib/gurmukhi-to-ipa";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BATCH_SIZE = 500;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
  let offset = 0;
  let total = 0;

  console.log("Starting phonetic population...");

  while (true) {
    const { data, error } = await supabase
      .from("words")
      .select("id, gurmukhi")
      .range(offset, offset + BATCH_SIZE - 1)
      .order("id");

    if (error) {
      console.error("Fetch error:", error.message);
      process.exit(1);
    }
    if (!data || data.length === 0) break;

    const updates = data.map((row) => ({
      id: row.id,
      phonetic_ipa: normalizeIPA(gurmukhiWordToIPA(row.gurmukhi)),
    }));

    const { error: upsertError } = await supabase.rpc("bulk_update_phonetic_ipa", {
      updates,
    });

    if (upsertError) {
      console.error("Upsert error:", upsertError.message);
      process.exit(1);
    }

    total += data.length;
    process.stdout.write(`\rProcessed ${total} words...`);
    offset += BATCH_SIZE;

    if (data.length < BATCH_SIZE) break;
  }

  console.log(`\nDone. Populated phonetic_ipa for ${total} words.`);
}

main();
