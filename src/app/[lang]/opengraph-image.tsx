import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { person } from "@/content/profile";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Nikhil Rai, Head of Information Technology";

// One social card for both languages: the default OG font has no Devanagari.
export default async function OpenGraphImage() {
  const portrait = await readFile(join(process.cwd(), "public", person.portrait.src));
  const src = `data:image/jpeg;base64,${portrait.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#0a0c0f",
        color: "#e9ebee",
        padding: 64,
        gap: 56,
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div
          style={{ color: "#eba73f", fontSize: 22, letterSpacing: 4, textTransform: "uppercase" }}
        >
          Head of Information Technology · SimDaaS Autonomy
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 132,
            fontWeight: 700,
            lineHeight: 0.95,
            marginTop: 28,
            letterSpacing: -5,
          }}
        >
          Nikhil Rai<span style={{ color: "#eba73f" }}>.</span>
        </div>
        <div style={{ fontSize: 30, color: "#9aa3ae", marginTop: 32, lineHeight: 1.35 }}>
          Cloud, DevOps and microservices, from first commit to production.
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 40 }}>
          {["IT · Cloud · Security", "Azure · AWS · DigitalOcean", "Kubernetes · Terraform"].map(
            (t) => (
              <div
                key={t}
                style={{
                  border: "1px solid #2a3038",
                  borderRadius: 999,
                  padding: "8px 18px",
                  fontSize: 20,
                  color: "#9aa3ae",
                }}
              >
                {t}
              </div>
            ),
          )}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          width: 360,
          height: 450,
          borderRadius: 28,
          overflow: "hidden",
          border: "3px solid #eba73f",
        }}
      >
        <img src={src} width={360} height={450} style={{ objectFit: "cover" }} alt="" />
      </div>
    </div>,
    size,
  );
}
