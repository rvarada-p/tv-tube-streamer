import { describe, expect, it } from "vitest";
import { findDueAd } from "./ads";

const at = (h: number, m: number, s = 0) => new Date(2026, 0, 15, h, m, s);
const ads = (...slots: string[]) => slots.map((slot_time, i) => ({ id: String(i), slot_time }));

describe("findDueAd", () => {
  it("plays an ad in its own minute", () => {
    expect(findDueAd(ads("10:30:00"), at(10, 30, 5))?.slot_time).toBe("10:30:00");
  });

  it("still plays an ad when the check runs a minute late", () => {
    expect(findDueAd(ads("10:30:00"), at(10, 31, 40))?.slot_time).toBe("10:30:00");
  });

  it("skips an ad more than 2 minutes late", () => {
    expect(findDueAd(ads("10:30:00"), at(10, 33))).toBeUndefined();
  });

  it("doesn't play an ad early", () => {
    expect(findDueAd(ads("10:30:00"), at(10, 29, 59))).toBeUndefined();
  });

  it("plays the earliest due ad first", () => {
    expect(findDueAd(ads("10:29:00", "10:30:00"), at(10, 30))?.slot_time).toBe("10:29:00");
  });
});
