import { describe, expect, it } from "vitest";
import { nextDisplayOrder } from "./content";

const items = (...orders: (number | null)[]) => orders.map((display_order) => ({ display_order }));

describe("nextDisplayOrder", () => {
  it("starts at 0 for an empty list", () => {
    expect(nextDisplayOrder([])).toBe(0);
  });

  it("goes one past the end of a normal list", () => {
    expect(nextDisplayOrder(items(0, 1, 2))).toBe(3);
  });

  it("doesn't reuse a position after the first item was deleted", () => {
    // Was items.length (2), which collided with the item at 2
    expect(nextDisplayOrder(items(1, 2))).toBe(3);
  });

  it("goes past the highest position when there are gaps", () => {
    expect(nextDisplayOrder(items(0, 7, 3))).toBe(8);
  });

  it("treats rows with no position as before the start", () => {
    expect(nextDisplayOrder(items(null, null))).toBe(0);
    expect(nextDisplayOrder(items(null, 4))).toBe(5);
  });
});
