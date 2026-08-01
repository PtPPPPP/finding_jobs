export const FRESH_DAYS = 30;
export const REVIEW_DAYS = 90;

export type FreshnessLevel = "fresh" | "review" | "stale" | "unverified";

const isDate = (value?: string) => Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)));

export function getVerificationFreshness(date?: string, now = new Date()): FreshnessLevel {
  if (!isDate(date)) return "unverified";
  const days = Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.parse(`${date}T00:00:00Z`)) / 86_400_000);
  if (days <= FRESH_DAYS) return "fresh";
  if (days <= REVIEW_DAYS) return "review";
  return "stale";
}

export const freshnessLabel: Record<FreshnessLevel, string> = {
  fresh: "核验较新",
  review: "建议复核",
  stale: "建议重新核验",
  unverified: "待核验",
};
