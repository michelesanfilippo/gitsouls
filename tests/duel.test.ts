import { describe, expect, it } from "vitest";
import { resolveDuel, battleScore, skillPower, type DuelSide } from "@/lib/lore/duel";
import type { Skill } from "@/lib/scoring/skills";

function skill(name: string, power: number): Skill {
  return {
    name,
    note: `${name} note`,
    icon: "*",
    how: `${name} how`,
    power,
    verb: `wields ${name}`,
  };
}

const strong: DuelSide = {
  login: "gwyn",
  name: "Gwyn",
  className: "Soulkeeper",
  rankName: "Lord",
  overall: 88,
  skills: [skill("Ember of Cinder", 5), skill("Starforged", 4)],
};

const weak: DuelSide = {
  login: "hollow",
  name: null,
  className: "Sorcerer",
  rankName: "Hollow",
  overall: 12,
  skills: [skill("Kindling Spark", 1)],
};

describe("skillPower", () => {
  it("sums the weight of every skill", () => {
    expect(skillPower(strong.skills)).toBe(9);
    expect(skillPower([])).toBe(0);
  });
});

describe("battleScore", () => {
  it("adds skill weight to stat power", () => {
    expect(battleScore(strong)).toBe(88 + 9);
    expect(battleScore(weak)).toBe(12 + 1);
  });
});

describe("resolveDuel", () => {
  it("awards the win to the higher battle score", () => {
    const r = resolveDuel(strong, weak);
    expect(r.winner?.login).toBe("gwyn");
    expect(r.loser?.login).toBe("hollow");
    expect(r.margin).toBe(97 - 13);
  });

  it("lets a deep skill roster win a fight lost on raw stats", () => {
    // Two points behind on stats, but six points of skills ahead.
    const understudy: DuelSide = {
      ...weak,
      login: "understudy",
      overall: 40,
      skills: [skill("a", 5), skill("b", 5), skill("c", 4)],
    };
    const brute: DuelSide = {
      ...strong,
      login: "brute",
      overall: 42,
      skills: [skill("d", 1)],
    };
    expect(brute.overall).toBeGreaterThan(understudy.overall);
    expect(resolveDuel(understudy, brute).winner?.login).toBe("understudy");
  });

  it("is symmetric — argument order does not change the outcome", () => {
    const a = resolveDuel(strong, weak);
    const b = resolveDuel(weak, strong);
    expect(b.winner?.login).toBe(a.winner?.login);
    expect(b.loser?.login).toBe(a.loser?.login);
    expect(b.lore).toBe(a.lore);
    expect(b.winnerHp).toBe(a.winnerHp);
  });

  it("reports a tie with no winner", () => {
    const mirror: DuelSide = { ...weak, login: "mirror", overall: strong.overall, skills: strong.skills };
    const r = resolveDuel(strong, mirror);
    expect(r.winner).toBeNull();
    expect(r.loser).toBeNull();
    expect(r.margin).toBe(0);
    expect(r.winnerHp).toBe(0);
  });

  it("is deterministic for the same pairing", () => {
    expect(resolveDuel(strong, weak).lore).toBe(resolveDuel(strong, weak).lore);
  });

  it("retells the fight when a profile grows, not just when logins differ", () => {
    // Same two logins, but one has climbed a rank and gained a skill.
    const grown: DuelSide = {
      ...weak,
      rankName: "Knight",
      overall: 55,
      skills: [...weak.skills, skill("Starforged", 4)],
    };
    expect(resolveDuel(strong, grown).lore).not.toBe(
      resolveDuel(strong, weak).lore,
    );
  });

  it("weaves rank and class into the telling", () => {
    const lore = resolveDuel(strong, weak).lore;
    // The clash sentence names both standings.
    expect(lore).toMatch(/Lord|Soulkeeper/);
    expect(lore).toMatch(/Hollow|Sorcerer/);
  });

  it("names both combatants and leaves no placeholders", () => {
    const r = resolveDuel(strong, weak);
    expect(r.lore).toContain("Gwyn");
    expect(r.lore).toContain("hollow"); // login used when name is null
    expect(r.lore).not.toMatch(/\{[WL][CR]?\}/);
  });

  it("weaves each side's strongest skills into the tale", () => {
    const r = resolveDuel(strong, weak);
    expect(r.lore).toContain("wields Ember of Cinder");
    expect(r.lore).toContain("wields Kindling Spark");
  });

  it("survives a combatant with no skills at all", () => {
    const bare: DuelSide = { ...weak, login: "bare", skills: [] };
    const r = resolveDuel(strong, bare);
    expect(r.winner?.login).toBe("gwyn");
    expect(r.lore.length).toBeGreaterThan(40);
    expect(r.lore).not.toMatch(/\{[WL][CR]?\}/);
  });

  it("reports both battle scores", () => {
    const r = resolveDuel(strong, weak);
    expect(r.scores.gwyn).toBe(97);
    expect(r.scores.hollow).toBe(13);
  });

  it("leaves the victor more health after a rout than after a close fight", () => {
    const rout = resolveDuel(strong, weak).winnerHp;
    const close = resolveDuel(strong, {
      ...weak,
      overall: 87,
      skills: strong.skills,
    }).winnerHp;
    expect(rout).toBeGreaterThan(close);
    expect(rout).toBeLessThanOrEqual(100);
    expect(close).toBeGreaterThanOrEqual(1);
  });

  it("never divides by zero when neither side has any power", () => {
    const r = resolveDuel(
      { ...strong, overall: 0, skills: [] },
      { ...weak, overall: 0, skills: [] },
    );
    expect(r.winnerHp).toBe(0);
    expect(Number.isFinite(r.margin)).toBe(true);
  });

  it("narrates a rout differently from a razor-thin win", () => {
    const rout = resolveDuel(strong, weak).lore;
    const close = resolveDuel(strong, {
      ...weak,
      overall: 87,
      skills: strong.skills,
    }).lore;
    expect(close).not.toBe(rout);
  });
});
