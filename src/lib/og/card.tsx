import { readFile } from "node:fs/promises";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { config as appConfig } from "@/lib/config";
import { fetchSiteIdentity, orUndefined } from "@/lib/public-data";

/**
 * The link-preview card (V2-045): what LinkedIn, X, Slack and iMessage show
 * when someone shares a page. Rendered once per page at build — static export
 * has no server to draw one on request — so every file under /og/ is a real
 * PNG on the CDN.
 *
 * satori + resvg directly rather than `next/og`: Next 14's bundled copy
 * builds its own asset paths with `path.join` on a file URL, which throws
 * "Invalid URL" on Windows and fails the build there.
 *
 * Drawn in the default preset (Space Grotesk over Inter on the warm ground,
 * blue accent) rather than the owner's chosen theme: the card has to read at
 * thumbnail size in someone else's feed, and the default pairing is the one
 * checked for that.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;

const INK = "#1f2328";
const MUTED = "#5b636e";
const GROUND = "#f9f8f5";
const ACCENT = "#0b6bdb";

// Static (non-variable) cuts — satori reads WOFF but not WOFF2 or variable
// fonts. Space Grotesk and Inter, both SIL OFL 1.1, from @fontsource.
const FONT_DIR = path.join(process.cwd(), "src/app/fonts/og");

async function fonts() {
  const [heading, body, bodyStrong] = await Promise.all([
    readFile(path.join(FONT_DIR, "space-grotesk-latin-700-normal.woff")),
    readFile(path.join(FONT_DIR, "inter-latin-400-normal.woff")),
    readFile(path.join(FONT_DIR, "inter-latin-600-normal.woff")),
  ]);
  return [
    {
      name: "Heading",
      data: heading,
      weight: 700 as const,
      style: "normal" as const,
    },
    {
      name: "Body",
      data: body,
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Body",
      data: bodyStrong,
      weight: 600 as const,
      style: "normal" as const,
    },
  ];
}

/** The owner's name as the CMS has it at build, else the config's. */
async function ownerName(): Promise<string> {
  const identity = await orUndefined(fetchSiteIdentity());
  return identity?.profile_data?.name?.trim() || appConfig.site.author;
}

/** "johndoe.dev" — or nothing while the site URL is still the placeholder. */
function siteHost(): string | null {
  try {
    const host = new URL(appConfig.site.url).hostname.replace(/^www\./, "");
    return host === "example.com" ? null : host;
  } catch {
    return null;
  }
}

function clip(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

export interface OgCard {
  /** Small line above the title: "Case study", "Writing", … */
  eyebrow?: string;
  title: string;
  /** One or two sentences under the title. */
  description?: string | null;
}

export async function renderOgCard({
  eyebrow,
  title,
  description,
}: OgCard): Promise<Response> {
  const [name, fontList] = await Promise.all([ownerName(), fonts()]);
  const host = siteHost();
  const heading = clip(title, 110);
  // Long titles step down so three lines still fit above the footer.
  const size = heading.length > 70 ? 56 : heading.length > 40 ? 68 : 80;

  const svg = await satori(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: GROUND,
        color: INK,
        fontFamily: "Body",
        borderLeft: `16px solid ${ACCENT}`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        {eyebrow && (
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: ACCENT,
              marginBottom: 24,
            }}
          >
            {clip(eyebrow, 48)}
          </div>
        )}
        <div
          style={{
            fontFamily: "Heading",
            fontSize: size,
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
          }}
        >
          {heading}
        </div>
        {description && (
          <div
            style={{
              marginTop: 28,
              fontSize: 30,
              lineHeight: 1.4,
              color: MUTED,
              // Satori honours line clamping only through this pair.
              display: "block",
              lineClamp: 2,
            }}
          >
            {clip(description, 170)}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 28,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              background: ACCENT,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              fontSize: 24,
            }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
          <div style={{ fontWeight: 600 }}>{name}</div>
        </div>
        {host && <div style={{ color: MUTED }}>{host}</div>}
      </div>
    </div>,
    { ...OG_SIZE, fonts: fontList },
  );
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: OG_SIZE.width },
  })
    .render()
    .asPng();

  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
}
