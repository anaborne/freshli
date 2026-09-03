import { Ingredient } from "@/types/ingredient";
import { parseLocalDate } from "@/lib/expiry";

/** Dashboard column order. The app renders these columns even when empty. */
export const CATEGORY_ORDER = [
  "produce",
  "meats",
  "dairy",
  "pantry/grains",
  "frozen",
  "miscellaneous",
] as const;

export const DEFAULT_CATEGORY = "miscellaneous";

export type ParsedRecipeIngredient = {
  name: string;
  quantity: number;
  unit: string;
};

/**
 * One line in the shape the prompt asks for: Name (quantity unit). Returns null for a
 * line carrying no quantity, such as "Salt and pepper", and leaves it to the caller to
 * decide what that means. The earlier inline regex matched integers only, so
 * "Chicken Thighs (1.5 lb)" fell through that branch and decremented the row by 1.
 */
export function parseRecipeIngredient(line: string): ParsedRecipeIngredient | null {
  const m = /^([^(]+?)\s*\(\s*(\d+(?:\.\d+)?)\s+([^)]+?)\s*\)\s*$/.exec(line.trim());
  if (!m) return null;
  const quantity = Number.parseFloat(m[2]);
  if (!Number.isFinite(quantity)) return null;
  return { name: m[1].trim(), quantity, unit: m[3].trim() };
}

function quantityOf(item: Ingredient): number {
  const n = typeof item.quantity === "number" ? item.quantity : Number.parseFloat(item.quantity);
  return Number.isFinite(n) ? n : 0;
}

/** Two rows are the same stock if name, unit and expiration all agree. */
function mergeKey(item: Ingredient): string {
  return [
    item.name.trim().toLowerCase(),
    item.unit.trim().toLowerCase(),
    item.expirationDate.trim(),
  ].join(" ");
}

/**
 * Name and unit compare case- and whitespace-insensitively, expiration exactly: two
 * dates that differ are two batches, and merging them moves a food expiry date. First
 * occurrence wins the displayed name and category, so the merge is stable.
 */
export function mergeDuplicates(items: Ingredient[]): Ingredient[] {
  const out = new Map<string, Ingredient>();
  for (const item of items) {
    const key = mergeKey(item);
    const seen = out.get(key);
    if (seen) {
      seen.quantity = quantityOf(seen) + quantityOf(item);
    } else {
      out.set(key, { ...item, quantity: quantityOf(item) });
    }
  }
  return [...out.values()];
}

/** Soonest expiry first. Unparseable dates sort last rather than to the top. */
export function sortByExpiry(items: Ingredient[]): Ingredient[] {
  return [...items].sort((a, b) => {
    const ta = parseLocalDate(a.expirationDate).getTime();
    const tb = parseLocalDate(b.expirationDate).getTime();
    if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
    if (Number.isNaN(ta)) return 1;
    if (Number.isNaN(tb)) return -1;
    return ta - tb;
  });
}

/**
 * Every column in `order` is present even when empty, so the layout does not reflow as
 * stock runs out. An unrecognised category lands in miscellaneous.
 */
export function groupByCategory(
  items: Ingredient[],
  order: readonly string[] = CATEGORY_ORDER,
): Record<string, Ingredient[]> {
  const grouped: Record<string, Ingredient[]> = {};
  for (const category of order) grouped[category] = [];
  for (const item of items) {
    const category = (item.category ?? "").trim().toLowerCase() || DEFAULT_CATEGORY;
    const bucket = grouped[category] ? category : DEFAULT_CATEGORY;
    if (!grouped[bucket]) grouped[bucket] = [];
    grouped[bucket].push(item);
  }
  return grouped;
}

export type StockBatch = {
  quantity: string | number;
  expirationDate: string;
};

/** One batch's share of a deduction, as an index into the batches passed in. */
export type BatchDeduction = {
  index: number;
  /** What the batch holds once its share is taken out. */
  remaining: number;
};

export type DeductionPlan =
  | { ok: true; deductions: BatchDeduction[] }
  | { ok: false; reason: string };

/**
 * How much of a recipe line comes out of each batch of the same food. A recipe line
 * carries a food and a unit with no expiration date, so every batch under that name and
 * unit is a candidate, and the soonest to expire is emptied first. The whole plan is
 * built before any row is written, so a line the fridge cannot cover deducts nothing.
 */
export function planDeduction(batches: StockBatch[], needed: number): DeductionPlan {
  const held = batches.map((batch, index) => ({
    index,
    quantity:
      typeof batch.quantity === "number"
        ? batch.quantity
        : Number.parseFloat(String(batch.quantity)),
    expiry: parseLocalDate(batch.expirationDate ?? "").getTime(),
  }));

  if (held.some((batch) => !Number.isFinite(batch.quantity))) {
    return { ok: false, reason: "inventory quantity is not a number" };
  }

  const total = held.reduce((sum, batch) => sum + batch.quantity, 0);
  if (total < needed) {
    return { ok: false, reason: `needs ${needed}, inventory has ${total}` };
  }

  held.sort((a, b) => {
    if (Number.isNaN(a.expiry) && Number.isNaN(b.expiry)) return 0;
    if (Number.isNaN(a.expiry)) return 1;
    if (Number.isNaN(b.expiry)) return -1;
    return a.expiry - b.expiry;
  });

  const deductions: BatchDeduction[] = [];
  let outstanding = needed;
  for (const batch of held) {
    if (outstanding <= 0) break;
    const take = Math.min(batch.quantity, outstanding);
    deductions.push({ index: batch.index, remaining: batch.quantity - take });
    outstanding -= take;
  }
  return { ok: true, deductions };
}

/** Case-insensitive substring match on the name. An empty query matches all. */
export function filterByName(items: Ingredient[], query: string): Ingredient[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => item.name.toLowerCase().includes(q));
}

export function fromRow(row: {
  name: string;
  quantity: string | number;
  unit: string;
  expiration_date: string;
  category?: string | null;
}): Ingredient {
  return {
    name: row.name,
    quantity: row.quantity,
    unit: row.unit,
    expirationDate: row.expiration_date,
    category: row.category ?? DEFAULT_CATEGORY,
  };
}
