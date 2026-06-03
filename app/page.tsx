"use client";

import { useState, useCallback, useRef } from "react";
import { Mic, MicOff, Search, Loader2, Volume2 } from "lucide-react";
import { gurmukhiWordToIPA, normalizeIPA } from "@/lib/gurmukhi-to-ipa";

type SearchResult = {
  id: number;
  gurmukhi: string;
  phonetic_ipa: string;
  frequency: number;
  similarity: number;
};

type SearchState =
  | { status: "idle" }
  | { status: "listening" }
  | { status: "loading" }
  | { status: "done"; results: SearchResult[]; query: string; queryIPA: string }
  | { status: "error"; message: string };

const KOSH_BASE = "https://gurmukhi-kosh.vercel.app";
const SEARCH_BASE = "https://gurmukhi-search.vercel.app";

export default function VoiceSearchPage() {
  const [state, setState] = useState<SearchState>({ status: "idle" });
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const search = useCallback(async (gurmukhi: string) => {
    if (!gurmukhi.trim()) return;
    setState({ status: "loading" });
    setTranscript(gurmukhi);

    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(gurmukhi)}&limit=20`
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Search failed");

      setState({
        status: "done",
        results: data.results ?? [],
        query: gurmukhi,
        queryIPA: data.queryIPA ?? normalizeIPA(gurmukhiWordToIPA(gurmukhi)),
      });
    } catch (err) {
      setState({ status: "error", message: String(err) });
    }
  }, []);

  const startListening = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setState({
        status: "error",
        message: "Speech recognition is not supported in this browser. Try Chrome.",
      });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).webkitSpeechRecognition ?? (window as any).SpeechRecognition;
    const recognition = new SR() as SpeechRecognition;
    recognitionRef.current = recognition;

    recognition.lang = "pa-IN";
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.continuous = false;

    setState({ status: "listening" });
    setTranscript("");

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const latest = event.results[event.results.length - 1];
      const text = latest[0].transcript.trim();
      setTranscript(text);

      if (latest.isFinal) {
        recognition.stop();
        search(text);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setState({ status: "error", message: `Speech error: ${event.error}` });
    };

    recognition.onend = () => {
      setState((prev) =>
        prev.status === "listening" ? { status: "idle" } : prev
      );
    };

    recognition.start();
  }, [search]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setState({ status: "idle" });
  }, []);

  const isListening = state.status === "listening";
  const isLoading = state.status === "loading";

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight mb-2">
        ਗੁਰਮੁਖੀ ਅਵਾਜ਼ ਖੋਜ
      </h1>
      <p className="text-stone-400 text-sm mb-12">Gurmukhi Voice Search</p>

      <div className="flex flex-col items-center gap-6 w-full max-w-lg">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isLoading}
          className={[
            "w-24 h-24 rounded-full flex items-center justify-center transition-all",
            "focus:outline-none focus:ring-2 focus:ring-amber-400",
            isListening
              ? "bg-red-600 hover:bg-red-700 animate-pulse"
              : "bg-amber-500 hover:bg-amber-400 disabled:opacity-40",
          ].join(" ")}
          aria-label={isListening ? "Stop listening" : "Start voice search"}
        >
          {isListening ? (
            <MicOff className="w-10 h-10" />
          ) : isLoading ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : (
            <Mic className="w-10 h-10" />
          )}
        </button>

        {isListening && (
          <p className="text-stone-400 text-sm animate-pulse">
            Listening... speak a Gurmukhi word
          </p>
        )}

        {transcript && (
          <div className="flex items-center gap-3 bg-stone-900 rounded-xl px-5 py-4 w-full">
            <Volume2 className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="text-2xl leading-relaxed">{transcript}</span>
          </div>
        )}

        <div className="flex gap-2 w-full">
          <input
            type="text"
            placeholder="ਜਾਂ ਇੱਥੇ ਟਾਈਪ ਕਰੋ..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search(transcript)}
            className={[
              "flex-1 bg-stone-900 border border-stone-700 rounded-lg px-4 py-3",
              "text-xl placeholder:text-stone-600 focus:outline-none",
              "focus:border-amber-500 transition-colors",
            ].join(" ")}
          />
          <button
            onClick={() => search(transcript)}
            disabled={!transcript.trim() || isLoading}
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 rounded-lg px-4 py-3 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {state.status === "done" && (
        <div className="w-full max-w-lg mt-12">
          <p className="text-stone-500 text-xs mb-4">
            IPA key: <code className="text-amber-400">{state.queryIPA}</code>
            {" · "}
            {state.results.length} match{state.results.length !== 1 ? "es" : ""}
          </p>

          {state.results.length === 0 ? (
            <p className="text-stone-500 text-center py-8">
              No phonetic matches found. Try adjusting pronunciation or typing directly.
            </p>
          ) : (
            <ul className="space-y-2">
              {state.results.map((r) => (
                <li
                  key={r.id}
                  className="bg-stone-900 rounded-xl px-5 py-4 flex items-center justify-between gap-4 hover:bg-stone-800 transition-colors"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-2xl leading-relaxed">{r.gurmukhi}</span>
                    <span className="text-xs text-stone-500 font-mono truncate">
                      {r.phonetic_ipa}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-stone-600">
                      {r.frequency.toLocaleString()}×
                    </span>
                    <div className="flex gap-2">
                      <a
                        href={`${KOSH_BASE}/word/${encodeURIComponent(r.gurmukhi)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        Kosh
                      </a>
                      <span className="text-stone-700">·</span>
                      <a
                        href={`${SEARCH_BASE}?q=${encodeURIComponent(r.gurmukhi)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        Search
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {state.status === "error" && (
        <p className="mt-8 text-red-400 text-sm max-w-lg text-center">
          {state.message}
        </p>
      )}
    </main>
  );
}
