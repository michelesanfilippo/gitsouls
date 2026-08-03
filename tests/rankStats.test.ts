import { describe, expect, it } from "vitest";
import { getRankInfo, topPercent } from "@/lib/scoring/rankStats";

describe("topPercent", () => {
  it("is rarer (smaller) for higher overalls", () => {
    expect(topPercent(90)).toBeLessThan(topPercent(20));
  });

  it("never drops below the 0.3 floor", () => {
    expect(topPercent(99)).toBeGreaterThanOrEqual(0.3);
  });

  it("approaches 100% at the bottom", () => {
    expect(topPercent(0)).toBeGreaterThan(90);
  });
});

describe("getRankInfo", () => {
  it("produces ten buckets spanning 0–99", () => {
    const info = getRankInfo(50);
    expect(info.buckets).toHaveLength(10);
    expect(info.buckets[0].from).toBe(0);
    expect(info.buckets[9].to).toBe(99);
  });

  it("normalizes the tallest bucket to 100", () => {
    const info = getRankInfo(50);
    expect(Math.max(...info.buckets.map((b) => b.weight))).toBe(100);
  });

  it("places the user in the correct bucket", () => {
    expect(getRankInfo(0).userBucket).toBe(0);
    expect(getRankInfo(55).userBucket).toBe(5);
    expect(getRankInfo(99).userBucket).toBe(9);
  });

  it("weights the low tiers heavier than the high tiers", () => {
    const info = getRankInfo(50);
    expect(info.buckets[0].weight).toBeGreaterThan(info.buckets[9].weight);
  });
});
