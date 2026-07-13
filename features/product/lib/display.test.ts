import { describe, it, expect } from "vitest";
import { getProductDisplayData } from "./display";

describe("getProductDisplayData", () => {
  it("returns basePrice when no variants", () => {
    const result = getProductDisplayData({
      variants: [],
      images: ["/test.jpg"],
    });
    expect(result.minPrice).toBe(0);
    expect(result.hasVariants).toBe(false);
  });

  it("returns lowest variant price", () => {
    const result = getProductDisplayData({
      variants: [{ price: 2000 }, { price: 1000 }, { price: 3000 }],
      images: ["/test.jpg"],
    });
    expect(result.minPrice).toBe(1000);
    expect(result.hasVariants).toBe(true);
  });

  it("hasVariants is false with single variant", () => {
    const result = getProductDisplayData({
      variants: [{ price: 1500 }],
      images: ["/test.jpg"],
    });
    expect(result.hasVariants).toBe(false);
  });

  it("detects real image", () => {
    const result = getProductDisplayData({
      variants: [],
      images: ["https://example.com/img.jpg"],
    });
    expect(result.hasRealImage).toBe(true);
  });

  it("detects placeholder image", () => {
    const result = getProductDisplayData({
      variants: [],
      images: ["/placeholder.png"],
    });
    expect(result.hasRealImage).toBe(false);
  });

  it("detects empty images as no real image", () => {
    const result = getProductDisplayData({
      variants: [],
      images: [],
    });
    expect(result.hasRealImage).toBe(false);
  });
});
