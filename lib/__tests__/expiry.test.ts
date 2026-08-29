import { describe, expect, it } from "vitest";
import {
  EXPIRING_SOON_DAYS,
  daysUntilExpiry,
  expiryStatus,
  parseLocalDate,
  startOfLocalDay,
} from "@/lib/expiry";

// Fixed "now", late enough in the day to catch the timezone and mutation defects.
const NOW = new Date(2026, 7, 28, 18, 30, 0); // 2026-08-28, 18:30 local

describe("parseLocalDate", () => {
  it("reads YYYY-MM-DD in the local timezone, not UTC", () => {
    // new Date("2026-08-28") is UTC midnight, the 27th anywhere west of Greenwich.
    const d = parseLocalDate("2026-08-28");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(7);
    expect(d.getDate()).toBe(28);
  });

  it("hands anything else to the platform parser", () => {
    expect(Number.isNaN(parseLocalDate("not a date").getTime())).toBe(true);
  });
});

describe("startOfLocalDay", () => {
  it("does not mutate its argument", () => {
    // The old code called today.setHours(0,0,0,0) inside the day arithmetic, so the
    // next line's comparison depended on that mutation having already run.
    const today = new Date(NOW);
    const before = today.getTime();
    startOfLocalDay(today);
    expect(today.getTime()).toBe(before);
  });
});

describe("daysUntilExpiry", () => {
  it("counts whole days regardless of the time of day", () => {
    const morning = new Date(2026, 7, 28, 6, 0, 0);
    const evening = new Date(2026, 7, 28, 23, 45, 0);
    expect(daysUntilExpiry("2026-09-04", morning)).toBe(7);
    expect(daysUntilExpiry("2026-09-04", evening)).toBe(7);
  });

  it("is 0 on the expiration date itself and negative after it", () => {
    expect(daysUntilExpiry("2026-08-28", NOW)).toBe(0);
    expect(daysUntilExpiry("2026-08-27", NOW)).toBe(-1);
  });

  it("returns NaN for an unparseable date rather than a wrong number", () => {
    expect(Number.isNaN(daysUntilExpiry("", NOW))).toBe(true);
  });
});

describe("expiryStatus", () => {
  it("treats the expiration day itself as expiring soon, not expired", () => {
    // Food is good until the end of its date. The old code called this "Expired" from
    // mid-afternoon, comparing a UTC-parsed date against a local clock.
    expect(expiryStatus("2026-08-28", NOW)).toBe("expiring-soon");
  });

  it("is expired the day after", () => {
    expect(expiryStatus("2026-08-27", NOW)).toBe("expired");
  });

  it("bands exactly at the boundary", () => {
    const last = new Date(NOW);
    last.setDate(last.getDate() + EXPIRING_SOON_DAYS);
    const first = new Date(NOW);
    first.setDate(first.getDate() + EXPIRING_SOON_DAYS + 1);
    const iso = (d: Date) =>
      [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
    expect(expiryStatus(iso(last), NOW)).toBe("expiring-soon");
    expect(expiryStatus(iso(first), NOW)).toBe("fresh");
  });

  it("does not call an unreadable date expired", () => {
    expect(expiryStatus("", NOW)).toBe("fresh");
  });
});
