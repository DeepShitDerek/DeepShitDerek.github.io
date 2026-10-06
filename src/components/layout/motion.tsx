import type { ReactNode } from "react";

/**
 * Block wrappers that public sections share: `Reveal`, `Stagger` and
 * `StaggerItem`, plus `CountUp` for a figure.
 *
 * **They no longer move.** Each one used to prerender at `opacity: 0` and
 * wait for an IntersectionObserver and the animation library to bring it in.
 * On a slow phone that left bands blank after scrolling, it held the first
 * meaningful paint behind a script download, and a figure read "0" to anyone
 * who looked before it counted (P0-2, X10, X11; ServiceNow and Borg showed
 * the same blank panels in the research captures). The redesign's rule is
 * that nothing animates on load and no text is animated (north star §3.6).
 *
 * The components stay so the nineteen sections that use them keep their
 * structure and element types; they now render exactly that element,
 * visible from the first paint, with no client JavaScript.
 */

/** The house curve — the same one as `--m-enter`, for the few animations left. */
export const EASE = [0.32, 0.72, 0, 1] as const;

type Tag = "div" | "ul" | "ol" | "li" | "article" | "figure";

interface BlockProps {
  as?: Tag;
  className?: string;
  children?: ReactNode;
}

/** A block. `from` and `delay` are accepted for existing callers and unused. */
export function Reveal({
  as: Comp = "div",
  className,
  children,
}: BlockProps & { from?: "up" | "left" | "right"; delay?: number }) {
  return <Comp className={className}>{children}</Comp>;
}

/** A group of `StaggerItem`s. `step` is accepted for existing callers. */
export function Stagger({
  as: Comp = "div",
  className,
  children,
}: BlockProps & { step?: number }) {
  return <Comp className={className}>{children}</Comp>;
}

/** One member of a `Stagger`. */
export function StaggerItem({ as: Comp = "div", className, children }: BlockProps) {
  return <Comp className={className}>{children}</Comp>;
}

/* ────────────────────────────────────────────────────────────────
 * Figures
 * ──────────────────────────────────────────────────────────────── */

export interface Stat {
  prefix: string;
  number: number;
  decimals: number;
  grouped: boolean;
  suffix: string;
}

/** Split "$1,200+" into "$", 1200 and "+". Null when there is no number. */
export function parseStat(value: string): Stat | null {
  const match = value.trim().match(/^(\D*?)(\d[\d,]*(?:\.\d+)?)([\s\S]*)$/);
  if (!match) return null;

  const [, prefix, digits, suffix] = match;
  const plain = digits.replace(/,/g, "");
  const number = Number(plain);
  if (!Number.isFinite(number)) return null;

  return {
    prefix,
    number,
    decimals: plain.includes(".") ? plain.split(".")[1].length : 0,
    grouped: digits.includes(","),
    suffix,
  };
}

/**
 * A stat that is a quantity, or null.
 *
 * A year ("2019"), a ratio ("24/7", "4.9/5") or a phrase ("Since 2019",
 * "Top 5") is words with a number in them, not an amount.
 */
export function animatableStat(value: string): Stat | null {
  const stat = parseStat(value);
  if (!stat) return null;
  if (/[A-Za-z0-9]/.test(stat.prefix)) return null;
  if (/\d/.test(stat.suffix)) return null;
  if (!stat.prefix && !stat.suffix && /^(19|20)\d{2}$/.test(value.trim())) {
    return null;
  }
  return stat;
}

export function formatStat(stat: Stat, n: number): string {
  const body = stat.grouped
    ? n.toLocaleString("en-US", {
        minimumFractionDigits: stat.decimals,
        maximumFractionDigits: stat.decimals,
      })
    : n.toFixed(stat.decimals);
  return `${stat.prefix}${body}${stat.suffix}`;
}

/** A figure, exactly as the author wrote it, in tabular numerals. */
export function CountUp({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return <span className={className}>{value}</span>;
}
