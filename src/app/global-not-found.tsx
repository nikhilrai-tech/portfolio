import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

// Backstop for URLs that never reach a locale (the proxy normally adds one).
export const metadata: Metadata = { title: "404 · Nikhil Rai" };

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="grid min-h-[100svh] place-items-center px-4 text-center">
        <main>
          <p className="label text-accent">404</p>
          <h1 className="display mt-4 text-5xl">Out of focus.</h1>
          <p className="mt-6">
            <Link href="/en" className="underline underline-offset-4">
              Back home
            </Link>
          </p>
        </main>
      </body>
    </html>
  );
}
