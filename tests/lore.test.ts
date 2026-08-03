import { describe, expect, it } from "vitest";
import { generateLore, type LoreInput } from "@/lib/lore/generate";

const input: LoreInput = {
  login: "gwyn",
  name: "Gwyn",
  className: "Soulkeeper",
  rankName: "Lord",
  topLanguage: "TypeScript",
  topRepoName: "firelink",
  years: 8,
  overall: 88,
  totalStars: 4200,
};

describe("generateLore", () => {
  it("is deterministic for the same input", () => {
    expect(generateLore(input)).toBe(generateLore(input));
  });

  it("differs between usernames", () => {
    const other = generateLore({ ...input, login: "artorias" });
    expect(other).not.toBe(generateLore(input));
  });

  it("weaves in key profile facts", () => {
    const lore = generateLore(input);
    expect(lore).toContain("Gwyn");
    expect(lore).toContain("Lord");
    expect(lore).toContain("TypeScript");
    expect(lore).toContain("firelink");
    expect(lore).toContain("4200");
  });

  it("falls back gracefully when data is missing", () => {
    const lore = generateLore({
      ...input,
      name: null,
      topLanguage: null,
      topRepoName: null,
      years: 0.3,
    });
    expect(lore).toContain("gwyn"); // login used as hero name
    expect(lore.length).toBeGreaterThan(40);
  });
});
