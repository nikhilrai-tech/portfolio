import Anthropic from "@anthropic-ai/sdk";
import type { NextRequest } from "next/server";
import { ASK_SYSTEM } from "@/lib/ask-context";

// "Ask Nikhil": answers questions about Nikhil from the portfolio's own content, streamed back
// as plain text. Needs ANTHROPIC_API_KEY; without it the route answers 503 and the UI stays off.

const MAX_TURNS = 12;
const MAX_CHARS = 1200;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, number[]>(); // best effort: per server instance
let client: Anthropic | null = null; // created on first use, once the key is known to exist

type Turn = { role: "user" | "assistant"; content: string };

const NOTES = {
  en: {
    refusal: "I can't help with that one. Ask me about Nikhil's work instead.",
    busy: "I'm a little busy right now. Please try again in a minute.",
    error: "Something went wrong on my side. You can always email Nikhil directly.",
  },
  hi: {
    refusal: "इसमें मैं मदद नहीं कर सकता। निखिल के काम के बारे में पूछिए।",
    busy: "अभी थोड़ी भीड़ है। एक मिनट बाद फिर कोशिश करें।",
    error: "मेरी तरफ़ से कुछ गड़बड़ हुई। आप निखिल को सीधे ईमेल कर सकते हैं।",
  },
};

function parse(body: unknown): Turn[] | null {
  const list = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(list) || list.length === 0 || list.length > MAX_TURNS) return null;
  const turns: Turn[] = [];
  for (const m of list) {
    const role = (m as Turn)?.role;
    const content = String((m as Turn)?.content ?? "").trim();
    if ((role !== "user" && role !== "assistant") || !content || content.length > MAX_CHARS)
      return null;
    turns.push({ role, content });
  }
  if (turns[0].role !== "user" || turns[turns.length - 1].role !== "user") return null;
  return turns;
}

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY)
    return Response.json({ error: "not-configured" }, { status: 503 });

  let messages: Turn[] | null = null;
  let notes = NOTES.en;
  try {
    const body = await request.json();
    messages = parse(body);
    if ((body as { lang?: string })?.lang === "hi") notes = NOTES.hi;
  } catch {}
  if (!messages) return Response.json({ error: "invalid" }, { status: 422 });

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW)
    return Response.json({ error: "rate-limited" }, { status: 429 });
  hits.set(ip, [...recent, now]);

  client ??= new Anthropic(); // reads ANTHROPIC_API_KEY
  const stream = client.beta.messages.stream({
    model: "claude-opus-5-5",
    max_tokens: 2000,
    // Short factual chat: low effort keeps answers quick and cheap.
    output_config: { effort: "low" },
    // If a safety classifier declines, Anthropic retries on its recommended fallback model.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [{ type: "text", text: ASK_SYSTEM, cache_control: { type: "ephemeral" } }],
    messages,
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let sent = false;
      // Notes start on a new paragraph only when part of an answer is already on screen.
      const note = (text: string) =>
        controller.enqueue(encoder.encode(sent ? `\n\n${text}` : text));
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
            sent = true;
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") note(notes.refusal);
      } catch (err) {
        const busy =
          err instanceof Anthropic.RateLimitError ||
          (err instanceof Anthropic.APIError && (err.status ?? 0) >= 500);
        console.error(
          "ask: Claude API error",
          err instanceof Anthropic.APIError ? err.status : err,
        );
        note(busy ? notes.busy : notes.error);
      }
      controller.close();
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
