import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Contrast of every theme preset's text-bearing token pairs (V2-060), from
 * src/styles/themes.css. Text pairs need 4.5:1, UI pairs 3:1.
 *   node scripts/theme-contrast.mjs          → report, exit 1 on a failure
 * Run after editing a preset. The pairs are the ones the app draws text
 * with; see ACCESSIBILITY.md.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(path.join(root, "src/styles/themes.css"), "utf8");

const hslToRgb = (h, s, l) => {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
};
const luminance = ([r, g, b]) => {
  const c = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const parse = (value) => {
  const m = /(-?[\d.]+)\s+([\d.]+)%\s+([\d.]+)%/.exec(value);
  return m ? hslToRgb(Number(m[1]), Number(m[2]), Number(m[3])) : null;
};
export const ratio = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// Text pairs (4.5:1): [foreground token, background token].
const TEXT = [
  ["foreground", "background"],
  ["foreground", "card"],
  ["muted-foreground", "background"],
  ["muted-foreground", "card"],
  ["muted-foreground", "muted"],
  ["primary-foreground", "primary"],
  ["destructive", "background"],
  ["destructive", "card"],
  ["destructive-foreground", "destructive"],
  ["primary", "background"],
  ["foreground", "secondary"],
  ["muted-foreground", "secondary"],
  ["destructive", "secondary"],
  ["secondary-foreground", "secondary"],
  ["popover-foreground", "popover"],
  ["muted-foreground", "popover"],
];

const themes = new Map();
for (const block of css.matchAll(/\.(theme-[a-z0-9-]+)\s*\{([^}]*)\}/g)) {
  const vars = {};
  for (const v of block[2].matchAll(/--([a-z-]+):\s*([^;]+);/g)) vars[v[1]] = v[2];
  themes.set(block[1], { ...(themes.get(block[1]) ?? {}), ...vars });
}

let failures = 0;
for (const [name, vars] of themes) {
  const bad = [];
  for (const [fg, bg] of TEXT) {
    const a = parse(vars[fg] ?? "");
    const b = parse(vars[bg] ?? "");
    if (!a || !b) continue;
    const r = ratio(a, b);
    // `primary` on the ground is used for links and large accents: 4.5 like any text.
    if (r < 4.5) bad.push(`${fg} on ${bg} ${r.toFixed(2)}`);
  }
  if (bad.length) {
    failures += bad.length;
    console.log(`✗ ${name}: ${bad.join("; ")}`);
  }
}
console.log(`\n${themes.size} presets, ${failures} failing pair${failures === 1 ? "" : "s"}`);
process.exit(failures ? 1 : 0);
