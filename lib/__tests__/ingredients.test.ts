import { describe, expect, it } from "vitest";
import {
  CATEGORY_ORDER,
  filterByName,
  fromRow,
  groupByCategory,
  mergeDuplicates,
  parseRecipeIngredient,
  planDeduction,
  sortByExpiry,
} from "@/lib/ingredients";
import { Ingredient } from "@/types/ingredient";

const item = (over: Partial<Ingredient> = {}): Ingredient => ({
  name: "Tomatoes",
  quantity: "2",
  unit: "cnt",
  expirationDate: "2026-09-01",
  category: "produce",
  ...over,
});

describe("parseRecipeIngredient", () => {
  it("parses the shape the prompt asks the model for", () => {
    expect(parseRecipeIngredient("Tomatoes (2 cnt)")).toEqual({
      name: "Tomatoes",
      quantity: 2,
      unit: "cnt",
    });
  });

  it("parses a fractional quantity", () => {
    // The old regex was (\d+), so this line fell through to the quantity-less branch
    // and decremented the row by 1 lb instead of 1.5.
    expect(parseRecipeIngredient("Chicken Thighs (1.5 lb)")).toEqual({
      name: "Chicken Thighs",
      quantity: 1.5,
      unit: "lb",
    });
  });

  it("keeps multi-word names and units intact", () => {
    expect(parseRecipeIngredient("Extra Virgin Olive Oil (2 fl oz)")).toEqual({
      name: "Extra Virgin Olive Oil",
      quantity: 2,
      unit: "fl oz",
    });
  });

  it("returns null for a line with no quantity", () => {
    expect(parseRecipeIngredient("Salt and pepper")).toBeNull();
    expect(parseRecipeIngredient("Olive oil (to taste)")).toBeNull();
  });
});

describe("mergeDuplicates", () => {
  it("sums rows that match on name, unit and expiration", () => {
    const merged = mergeDuplicates([item({ quantity: "2" }), item({ quantity: "3" })]);
    expect(merged).toHaveLength(1);
    expect(merged[0].quantity).toBe(5);
  });

  it("matches names and units case- and whitespace-insensitively", () => {
    const merged = mergeDuplicates([
      item({ name: "Tomatoes", unit: "cnt", quantity: 1 }),
      item({ name: " tomatoes ", unit: "CNT", quantity: 2 }),
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0].quantity).toBe(3);
    expect(merged[0].name).toBe("Tomatoes");
  });

  it("keeps different expirations apart", () => {
    // Merging two batches would move a food expiry date.
    const merged = mergeDuplicates([
      item({ expirationDate: "2026-09-01" }),
      item({ expirationDate: "2026-09-08" }),
    ]);
    expect(merged).toHaveLength(2);
  });

  it("treats an unreadable quantity as zero rather than NaN", () => {
    const merged = mergeDuplicates([item({ quantity: "" }), item({ quantity: "2" })]);
    expect(merged[0].quantity).toBe(2);
  });

  it("does not mutate its input", () => {
    const rows = [item({ quantity: "2" }), item({ quantity: "3" })];
    mergeDuplicates(rows);
    expect(rows[0].quantity).toBe("2");
  });
});

describe("planDeduction", () => {
  const batch = (quantity: string | number, expirationDate: string) => ({
    quantity,
    expirationDate,
  });

  it("takes from the soonest-expiring batch first", () => {
    expect(planDeduction([batch("5", "2026-09-20"), batch("5", "2026-09-02")], 3)).toEqual({
      ok: true,
      deductions: [{ index: 1, remaining: 2 }],
    });
  });

  it("spreads one line across batches when the soonest runs out", () => {
    // The route used to key inventory by name, so only one of these two rows existed
    // as far as it was concerned and the other could never be deducted.
    expect(planDeduction([batch("1", "2026-09-02"), batch("4", "2026-09-20")], 3)).toEqual({
      ok: true,
      deductions: [
        { index: 0, remaining: 0 },
        { index: 1, remaining: 2 },
      ],
    });
  });

  it("counts every batch before calling a line short", () => {
    expect(planDeduction([batch("1", "2026-09-02"), batch("4", "2026-09-20")], 6)).toEqual({
      ok: false,
      reason: "needs 6, inventory has 5",
    });
  });

  it("deducts nothing when a quantity cannot be read as a number", () => {
    expect(planDeduction([batch("about two", "2026-09-02")], 1)).toEqual({
      ok: false,
      reason: "inventory quantity is not a number",
    });
  });

  it("uses a batch with an unreadable expiration date last", () => {
    expect(planDeduction([batch("2", ""), batch("2", "2026-09-02")], 2)).toEqual({
      ok: true,
      deductions: [{ index: 1, remaining: 0 }],
    });
  });

  it("covers a line the batches sum to only within float error", () => {
    // 0.7 + 0.1 is 0.7999999999999999, which read as a shortage against 0.8.
    expect(planDeduction([batch("0.7", "2026-09-02"), batch("0.1", "2026-09-20")], 0.8)).toEqual({
      ok: true,
      deductions: [
        { index: 0, remaining: 0 },
        { index: 1, remaining: 0 },
      ],
    });
  });

  it("reports a real shortage with a readable number", () => {
    expect(planDeduction([batch("0.1", "2026-09-02"), batch("0.2", "2026-09-20")], 0.5)).toEqual({
      ok: false,
      reason: "needs 0.5, inventory has 0.3",
    });
  });

  it("leaves no float residue in a batch it empties", () => {
    // The second batch held 2.7755575615628914e-17, and the route wrote that string.
    expect(planDeduction([batch("0.1", "2026-09-02"), batch("0.2", "2026-09-20")], 0.3)).toEqual({
      ok: true,
      deductions: [
        { index: 0, remaining: 0 },
        { index: 1, remaining: 0 },
      ],
    });
  });

  it("spends the readable batches when a sibling quantity is blank", () => {
    // The upload path inserts `quantity: item.quantity || ''`, so a blank row is
    // reachable, and it used to block every other batch of that food.
    expect(planDeduction([batch("", "2026-09-02"), batch("10", "2026-09-20")], 1)).toEqual({
      ok: true,
      deductions: [{ index: 1, remaining: 9 }],
    });
  });

  it("refuses only when no batch is readable", () => {
    expect(planDeduction([batch("", "2026-09-02"), batch("about two", "2026-09-20")], 1)).toEqual({
      ok: false,
      reason: "inventory quantity is not a number",
    });
  });

  it("leaves an empty batch out of the plan", () => {
    // Writing that row back is an update setting "0" to "0".
    expect(planDeduction([batch("0", "2026-09-02"), batch("5", "2026-09-20")], 2)).toEqual({
      ok: true,
      deductions: [{ index: 1, remaining: 3 }],
    });
  });

  it("does not raise a negative batch to zero out of a healthy one", () => {
    // -5 and 10 against a line needing 3 used to take 8 from the 10 row.
    expect(planDeduction([batch("-5", "2026-09-02"), batch("10", "2026-09-20")], 3)).toEqual({
      ok: true,
      deductions: [{ index: 1, remaining: 7 }],
    });
  });
});

describe("sortByExpiry", () => {
  it("puts the soonest expiry first", () => {
    const sorted = sortByExpiry([
      item({ name: "Late", expirationDate: "2026-12-01" }),
      item({ name: "Soon", expirationDate: "2026-09-01" }),
    ]);
    expect(sorted.map((i) => i.name)).toEqual(["Soon", "Late"]);
  });

  it("sorts unreadable dates last instead of to the top", () => {
    const sorted = sortByExpiry([
      item({ name: "Broken", expirationDate: "" }),
      item({ name: "Soon", expirationDate: "2026-09-01" }),
    ]);
    expect(sorted.map((i) => i.name)).toEqual(["Soon", "Broken"]);
  });

  it("does not mutate its input", () => {
    const rows = [
      item({ name: "Late", expirationDate: "2026-12-01" }),
      item({ name: "Soon", expirationDate: "2026-09-01" }),
    ];
    sortByExpiry(rows);
    expect(rows[0].name).toBe("Late");
  });
});

describe("groupByCategory", () => {
  it("returns every column even when empty", () => {
    const grouped = groupByCategory([]);
    expect(Object.keys(grouped)).toEqual([...CATEGORY_ORDER]);
  });

  it("files an unrecognised category under miscellaneous", () => {
    const grouped = groupByCategory([item({ category: "condiments" })]);
    expect(grouped.miscellaneous).toHaveLength(1);
    expect(Object.keys(grouped)).toEqual([...CATEGORY_ORDER]);
  });

  it("files a missing category under miscellaneous", () => {
    const grouped = groupByCategory([item({ category: undefined })]);
    expect(grouped.miscellaneous).toHaveLength(1);
  });
});

describe("filterByName", () => {
  it("matches case-insensitively on a substring", () => {
    const rows = [item({ name: "Tomatoes" }), item({ name: "Chicken" })];
    expect(filterByName(rows, "TOMA").map((i) => i.name)).toEqual(["Tomatoes"]);
  });

  it("returns everything for an empty query", () => {
    const rows = [item({ name: "Tomatoes" }), item({ name: "Chicken" })];
    expect(filterByName(rows, "   ")).toHaveLength(2);
  });
});

describe("fromRow", () => {
  it("maps the snake_case column to the camelCase field", () => {
    expect(
      fromRow({ name: "Milk", quantity: "1", unit: "gal", expiration_date: "2026-09-02", category: null }),
    ).toEqual({
      name: "Milk",
      quantity: "1",
      unit: "gal",
      expirationDate: "2026-09-02",
      category: "miscellaneous",
    });
  });
});
