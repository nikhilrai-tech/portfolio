import Anthropic from "@anthropic-ai/sdk";
import type { NextRequest } from "next/server";
import type { Locale } from "@/i18n/config";
import { ASK_SYSTEM } from "@/lib/ask-context";
import { localAnswer } from "@/lib/ask-local";

// "Ask Nikhil": answers questions about Nikhil from the portfolio's own content, streamed back
// as plain text. Provider, in order of preference:
//   ANTHROPIC_API_KEY -> Claude (paid)
//   GEMINI_API_KEY    -> Google Gemini (free tier; GEMINI_MODEL overrides the model)
//   neither           -> instant answers from the site's content (no AI, always free)
// If an AI provider fails before sending anything, the instant answer is used instead.
// The X-Ask-Mode response header tells the UI which one answered ("ai" or "instant").

const MAX_TURNS = 12;
const MAX_CHARS = 1200;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, number[]>(); // best effort: per server instance
let claude: Anthropic | null = null; // created on first use, once the key is known to exist

type Turn = { role: "user" | "assistant"; content: string };

const REFUSAL = {
  en: "I can't help with that one. Ask me about Nikhil's work instead.",
  hi: "इसमें मैं मदद नहीं कर सकता। निखिल के काम के बारे में पूछिए।",
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

async function* fromClaude(messages: Turn[], locale: Locale): AsyncGenerator<string> {
  claude ??= new Anthropic(); // reads ANTHROPIC_API_KEY
  const stream = claude.beta.messages.stream({
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
  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta")
      yield event.delta.text;
  }
  const final = await stream.finalMessage();
  if (final.stop_reason === "refusal") yield `\n\n${REFUSAL[locale]}`;
}

async function* fromGemini(messages: Turn[], signal: AbortSignal): AsyncGenerator<string> {
  const model = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`,
    {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY!,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: ASK_SYSTEM }] },
        contents: messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        generationConfig: { maxOutputTokens: 2048, temperature: 0.4 },
      }),
    },
  );
  if (!res.ok || !res.body) throw new Error(`gemini ${res.status}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split(/\r?\n\r?\n/);
    buffer = events.pop() ?? "";
    for (const event of events) {
      for (const line of event.split(/\r?\n/)) {
        if (!line.startsWith("data:")) continue;
        const chunk = JSON.parse(line.slice(5)) as {
          candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[];
        };
        for (const part of chunk.candidates?.[0]?.content?.parts ?? []) {
          if (part.text && !part.thought) yield part.text;
        }
      }
    }
  }
}

export async function POST(request: NextRequest) {
  let messages: Turn[] | null = null;
  let locale: Locale = "en";
  try {
    const body = await request.json();
    messages = parse(body);
    if ((body as { lang?: string })?.lang === "hi") locale = "hi";
  } catch {}
  if (!messages) return Response.json({ error: "invalid" }, { status: 422 });

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW)
    return Response.json({ error: "rate-limited" }, { status: 429 });
  hits.set(ip, [...recent, now]);

  const question = messages[messages.length - 1].content;
  const abort = new AbortController();
  const ai = process.env.ANTHROPIC_API_KEY
    ? fromClaude(messages, locale)
    : process.env.GEMINI_API_KEY
      ? fromGemini(messages, abort.signal)
      : null;

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let sent = false;
      if (ai) {
        try {
          for await (const text of ai) {
            controller.enqueue(encoder.encode(text));
            sent = true;
          }
        } catch (err) {
          console.error(
            "ask: AI provider error",
            err instanceof Anthropic.APIError ? err.status : String(err),
          );
        }
      }
      // No provider, or it failed before answering: answer from the site's content instead.
      if (!sent) controller.enqueue(encoder.encode(localAnswer(question, locale)));
      controller.close();
    },
    cancel() {
      abort.abort();
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Ask-Mode": ai ? "ai" : "instant",
    },
  });
}
