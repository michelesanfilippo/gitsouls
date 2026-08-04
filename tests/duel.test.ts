import { describe, expect, it } from "vitest";
import { resolveDuel, type DuelSide } from "@/lib/lore/duel";

const strong: DuelSide = {
  login: "gwyn",
  name: "Gwyn",
  className: "Soulkeeper",
  rankName: "Lord",
  overall: 88,
};

const weak: DuelSide = {
  login: "hollow",
  name: null,
  className: "Sorcerer",
  rankName: "Hollow",
  overall: 12,
};

describe("resolveDuel", () => {
  it("awards the win to the higher overall", () => {
    const r = resolveDuel(strong, weak);
    expect(r.winner?.login).toBe("gwyn");
    expect(r.loser?.login).toBe("hollow");
    expect(r.margin).toBe(76);
  });

  it("is symmetric — argument order does not change the outcome", () => {
    const a = resolveDuel(strong, weak);
    const b = resolveDuel(weak, strong);
    expect(b.winner?.login).toBe(a.winner?.login);
    expect(b.loser?.login).toBe(a.loser?.login);
    expect(b.lore).toBe(a.lore);
  });

  it("reports a tie with no winner", () => {
    const r = resolveDuel(strong, { ...weak, overall: strong.overall });
    expect(r.winner).toBeNull();
    expect(r.loser).toBeNull();
    expect(r.margin).toBe(0);
    expect(r.lore.length).toBeGreaterThan(20);
  });

  it("is deterministic for the same pairing", () => {
    expect(resolveDuel(strong, weak).lore).toBe(resolveDuel(strong, weak).lore);
  });

  it("names both combatants and leaves no placeholders", () => {
    const r = resolveDuel(strong, weak);
    expect(r.lore).toContain("Gwyn");
    expect(r.lore).toContain("hollow"); // login used when name is null
    expect(r.lore).not.toMatch(/\{[WL]C?\}/);
  });

  it("narrates a rout differently from a razor-thin win", () => {
    const rout = resolveDuel(strong, weak).lore;
    const close = resolveDuel(strong, { ...weak, overall: 87 }).lore;
    expect(close).not.toBe(rout);
  });

  it("leaves the victor more health after a rout than after a close fight", () => {
    const rout = resolveDuel(strong, weak).winnerHp;
    const close = resolveDuel(strong, { ...weak, overall: 87 }).winnerHp;
    expect(rout).toBeGreaterThan(close);
    expect(rout).toBeLessThanOrEqual(100);
    expect(close).toBeGreaterThanOrEqual(1);
  });

  it("reports no survivor's health on a tie", () => {
    expect(resolveDuel(strong, { ...weak, overall: strong.overall }).winnerHp).toBe(
      0,
    );
  });

  it("never divides by zero when both sides have no power", () => {
    const r = resolveDuel(
      { ...strong, overall: 0 },
      { ...weak, overall: 0 },
    );
    expect(r.winnerHp).toBe(0);
    expect(Number.isFinite(r.margin)).toBe(true);
  });
});
