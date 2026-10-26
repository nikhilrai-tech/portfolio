import QRCode from "qrcode";
import type { Profile } from "@/content/profile";
import { person } from "@/content/profile";
import InstallButton from "./InstallButton";
import ShareButton from "./ShareButton";

// QR code (rendered to SVG on the server, no client code), native share, vCard and install.
export default async function ShareCard({ profile, url }: { profile: Profile; url: string }) {
  const { share } = profile;
  const svg = (await QRCode.toString(url, { type: "svg", margin: 0, errorCorrectionLevel: "M" }))
    .replace('<path fill="#ffffff" d="M0 0h25v25H0z"/>', "")
    .replace(/<path fill="#ffffff"[^>]*\/>/, "")
    .replace('stroke="#000000"', 'stroke="currentColor"');

  return (
    <div className="border-line bg-surface/70 grid items-center gap-8 rounded-3xl border p-6 backdrop-blur-md sm:grid-cols-[auto_1fr] md:p-8">
      <figure className="mx-auto text-center sm:mx-0">
        <div className="relative rounded-2xl bg-white p-4 text-[#0a0c0f] shadow-[var(--shadow)]">
          <div
            className="size-36 md:size-40 [&>svg]:size-full"
            aria-hidden
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <span
            className="bg-accent absolute -top-2 -right-2 size-4 rounded-full ring-4 ring-[var(--surface)]"
            aria-hidden
          />
        </div>
        <figcaption className="label text-muted mt-3 !text-[0.62rem]">{share.scan}</figcaption>
      </figure>
      <div>
        <p className="display text-3xl md:text-4xl">{share.heading}</p>
        <p className="text-muted mt-3 max-w-md">{share.body}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ShareButton
            title={profile.meta.title}
            text={share.text}
            url={url}
            label={share.button}
            copiedLabel={share.copied}
          />
          <a
            href="/nikhil-rai.vcf"
            download="Nikhil-Rai.vcf"
            data-magnetic
            className="border-line-strong hover:border-fg inline-flex h-12 items-center justify-center gap-2 rounded-full border px-6 text-sm font-medium transition-colors"
          >
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
              <path
                d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {share.save}
          </a>
          <InstallButton label={share.install} />
        </div>
        <p className="text-muted mt-4 font-mono text-xs break-all">{url.replace("https://", "")}</p>
      </div>
      <span className="sr-only">{person.name}</span>
    </div>
  );
}
