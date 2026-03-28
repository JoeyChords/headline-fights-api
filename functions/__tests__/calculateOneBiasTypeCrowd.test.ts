import { describe, it, expect } from "vitest";
import { calculateOneBiasTypeCrowd } from "../calculateOneBiasTypeCrowd";

describe("calculateOneBiasTypeCrowd", () => {
  it("returns biasExists 0 and percentBiased 0 when both inputs are zero", () => {
    const result = calculateOneBiasTypeCrowd(0, 0);
    expect(result.biasExists).toBe(0);
    expect(result.percentBiased).toBe(0);
  });

  it("returns biasExists 1 when isTrue is nonzero and isFalse is zero", () => {
    const result = calculateOneBiasTypeCrowd(5, 0);
    expect(result.biasExists).toBe(1);
    expect(result.percentBiased).toBe(100);
  });

  it("returns biasExists 1 when isFalse is nonzero and isTrue is zero", () => {
    const result = calculateOneBiasTypeCrowd(0, 10);
    expect(result.biasExists).toBe(1);
    expect(result.percentBiased).toBe(0);
  });

  it("calculates percentBiased correctly when both are nonzero", () => {
    const result = calculateOneBiasTypeCrowd(3, 1);
    expect(result.biasExists).toBe(1);
    expect(result.percentBiased).toBe(75);
  });

  it("rounds percentBiased to nearest integer", () => {
    // 1 / 3 = 33.333...% → rounds to 33
    const result = calculateOneBiasTypeCrowd(1, 2);
    expect(result.percentBiased).toBe(33);
  });

  it("rounds 0.5 up (Math.round behavior)", () => {
    // 1 / 2 = 50%
    const result = calculateOneBiasTypeCrowd(1, 1);
    expect(result.percentBiased).toBe(50);
  });
});
