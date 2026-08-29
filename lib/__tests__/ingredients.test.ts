import { describe, expect, it } from "vitest";
import {
  CATEGORY_ORDER,
  filterByName,
  fromRow,
  groupByCategory,
  mergeDuplicates,
  parseRecipeIngredient,
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
