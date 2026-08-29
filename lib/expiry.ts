/**
 * One copy of the expiry banding. It used to live inline in IngredientCard and
 * SelectionIngredientCard, and both copies read a bare YYYY-MM-DD as UTC midnight,
 * mutated today inside the day arithmetic, and ceil'd a millisecond difference. An item
 * expiring today showed "Expired" all afternoon in New York. The tests in
 * lib/__tests__/expiry.test.ts pin all three.
 */

export type ExpiryStatus = "expired" | "expiring-soon" | "fresh";

/** An item this many days out or fewer, and not yet expired, is expiring soon. */
export const EXPIRING_SOON_DAYS = 7;

/**
 * new Date(s) reads that shape as UTC per the ECMAScript date-time string format, which
 * is not what someone typing an expiration date means. Any other shape goes to the
 * platform parser unchanged.
 */
export function parseLocalDate(value: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return new Date(value);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/** Midnight at the start of `d`'s local day, as a new Date. Never mutates `d`. */
export function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Whole days from today to the expiration date, both floored to local midnight
 * so the answer does not depend on the time of day. Negative once expired.
 */
export function daysUntilExpiry(expirationDate: string, today: Date = new Date()): number {
  const from = startOfLocalDay(today).getTime();
  const to = startOfLocalDay(parseLocalDate(expirationDate)).getTime();
  if (Number.isNaN(to)) return Number.NaN;
  return Math.round((to - from) / 86_400_000);
}

/** Expired / expiring soon / fresh. An unparseable date is treated as fresh. */
export function expiryStatus(expirationDate: string, today: Date = new Date()): ExpiryStatus {
  const days = daysUntilExpiry(expirationDate, today);
  if (Number.isNaN(days)) return "fresh";
  if (days < 0) return "expired";
  if (days <= EXPIRING_SOON_DAYS) return "expiring-soon";
  return "fresh";
}

const LABELS: Record<ExpiryStatus, string> = {
  expired: "Expired",
  "expiring-soon": "Expiring soon",
  fresh: "Fresh",
};

const BORDERS: Record<ExpiryStatus, string> = {
  expired: "border-red-500",
  "expiring-soon": "border-yellow-300",
  fresh: "border-green-600",
};

export function expiryLabel(status: ExpiryStatus): string {
  return LABELS[status];
}

export function expiryBorderClass(status: ExpiryStatus): string {
  return BORDERS[status];
}
