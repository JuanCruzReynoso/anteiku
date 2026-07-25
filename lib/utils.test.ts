import { describe, it, expect } from "vitest";
import { cn, formatPrice, formatPercent } from "./utils";

// ─── cn() ──────────────────────────────────────────────

describe("cn", () => {
  it("merges two classes", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("handles conditional classes", () => {
    const condition = false;
    expect(cn("a", condition && "b")).toBe("a");
  });

  it("resolves conflicts (last wins)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("handles undefined and null", () => {
    expect(cn("a", undefined, null, "b")).toBe("a b");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });
});

// ─── formatPrice() ─────────────────────────────────────

describe("formatPrice", () => {
  it("formats zero", () => {
    expect(formatPrice(0)).toBe("$\u00a00");
  });

  it("formats normal price", () => {
    expect(formatPrice(1500)).toBe("$\u00a01.500");
  });

  it("formats large price", () => {
    expect(formatPrice(1250000)).toBe("$\u00a01.250.000");
  });

  it("formats single digit", () => {
    expect(formatPrice(5)).toBe("$\u00a05");
  });

  it("formats price with decimals as-is", () => {
    // Intl.NumberFormat respects minimumFractionDigits: 0
    expect(formatPrice(1500.7)).toBe("$\u00a01.500,7");
  });
});

// ─── formatPercent() ───────────────────────────────────

describe("formatPercent", () => {
  it("formats positive value with plus sign", () => {
    expect(formatPercent(12)).toBe("+12%");
  });

  it("formats negative value with minus sign", () => {
    expect(formatPercent(-3)).toBe("-3%");
  });

  it("formats zero with plus sign", () => {
    expect(formatPercent(0)).toBe("+0%");
  });

  it("rounds decimal values", () => {
    expect(formatPercent(12.7)).toBe("+13%");
    expect(formatPercent(-3.2)).toBe("-3%");
  });

  it("formats large values", () => {
    expect(formatPercent(150)).toBe("+150%");
  });
});
