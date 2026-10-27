import type { NextRequest } from "next/server";
import { person } from "@/content/profile";
import { en } from "@/content/en";

// Sends contact-form messages to Nikhil's inbox through Resend (https://resend.com).
// Needs RESEND_API_KEY. CONTACT_TO and CONTACT_FROM are optional overrides. Without a key the
// route answers 503 and the form falls back to opening the visitor's mail app.

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>(); // best effort: per server instance

const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad-request" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();
  const topicId = String(body.topic ?? "");
  // Only known topics reach the subject line; anything else is dropped.
  const topic =
    topicId in en.form.topics && topicId !== "other"
      ? en.form.topics[topicId as keyof typeof en.form.topics]
      : "";
  const honeypot = String(body.company ?? "");
  const startedAt = Number(body.t ?? 0);

  // Bots fill hidden fields and submit instantly; pretend success so they learn nothing.
  if (honeypot || !startedAt || Date.now() - startedAt < 3000) return Response.json({ ok: true });

  if (
    !name ||
    name.length > 80 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ||
    email.length > 120
  ) {
    return Response.json({ error: "invalid" }, { status: 422 });
  }
  if (message.length < 10 || message.length > 4000)
    return Response.json({ error: "invalid" }, { status: 422 });

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW)
    return Response.json({ error: "rate-limited" }, { status: 429 });
  hits.set(ip, [...recent, now]);

  const key = process.env.RESEND_API_KEY;
  if (!key) return Response.json({ error: "not-configured" }, { status: 503 });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM ?? "Portfolio <onboarding@resend.dev>",
      to: [process.env.CONTACT_TO ?? person.email],
      reply_to: email,
      subject: `${topic ? `[${topic}] ` : ""}Portfolio message from ${name}`,
      text: `${message}\n\n— ${name} <${email}>`,
      html: `<p style="white-space:pre-wrap;font:15px/1.6 system-ui">${escape(message)}</p><p style="color:#666;font:13px system-ui">— ${escape(name)} &lt;${escape(email)}&gt;</p>`,
    }),
  });
  if (!res.ok) return Response.json({ error: "send-failed" }, { status: 502 });
  return Response.json({ ok: true });
}
