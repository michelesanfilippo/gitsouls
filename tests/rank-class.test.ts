import { describe, expect, it } from "vitest";
import { getRank, RANKS } from "@/lib/scoring/rank";
import { getClass, getTopStat } from "@/lib/scoring/class";
import type { Stats } from "@/lib/scoring/types";

describe("getRank", () => {
  it("maps boundary scores to the README tiers", () => {
    expect(getRank(0).name).toBe("Hollow");
    expect(getRank(20).name).toBe("Hollow");
    expect(getRank(21).name).toBe("Undead");
    expect(getRank(40).name).toBe("Undead");
    expect(getRank(60).name).toBe("Knight");
    expect(getRank(75).name).toBe("Abyss Walker");
    expect(getRank(90).name).toBe("Lord");
    expect(getRank(91).name).toBe("Soul of Cinder");
    expect(getRank(99).name).toBe("Soul of Cinder");
  });

  it("every tier exposes a border color", () => {
    for (const r of RANKS) {
      expect(r.color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

const base: Stats = { VIT: 10, END: 10, INT: 10, DEX: 10, FAI: 10, SOP: 10 };

describe("getClass", () => {
  it("selects the class of the highest stat", () => {
    expect(getClass({ ...base, INT: 80 }).name).toBe("Sorcerer");
    expect(getClass({ ...base, DEX: 80 }).name).toBe("Blade Dancer");
    expect(getClass({ ...base, FAI: 80 }).name).toBe("Saint");
    expect(getClass({ ...base, VIT: 80 }).name).toBe("Juggernaut");
    expect(getClass({ ...base, END: 80 }).name).toBe("Vanguard");
    expect(getClass({ ...base, SOP: 80 }).name).toBe("Soulkeeper");
  });

  it("breaks ties deterministically by priority order", () => {
    // all equal → INT wins (first in priority)
    expect(getTopStat(base)).toBe("INT");
    // INT vs DEX tie → INT wins
    expect(getTopStat({ ...base, INT: 50, DEX: 50 })).toBe("INT");
  });
});
