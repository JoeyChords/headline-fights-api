import { describe, it, expect } from "vitest";
import { calculateOneBiasTypePersonal, HeadlineEntry } from "../calculateOneBiasTypePersonal";

const PUB = "The Daily";
const BIAS = "sensationalism";

function makeHeadline(overrides: Partial<HeadlineEntry> = {}): HeadlineEntry {
  return {
    publication: PUB,
    attribute1: BIAS,
    attribute1Answer: "true",
    attribute2: "tonality_bias",
    attribute2Answer: "false",
    ...overrides,
  };
}

describe("calculateOneBiasTypePersonal", () => {
  it("returns biasExists 0 and percentBiased 0 when no headlines match the publication", () => {
    const headlines: HeadlineEntry[] = [makeHeadline({ publication: "Other Pub" })];
    const result = calculateOneBiasTypePersonal(PUB, BIAS, headlines);
    expect(result.biasExists).toBe(0);
    expect(result.percentBiased).toBe(0);
  });

  it("returns biasExists 0 and percentBiased 0 for an empty headline array", () => {
    const result = calculateOneBiasTypePersonal(PUB, BIAS, []);
    expect(result.biasExists).toBe(0);
    expect(result.percentBiased).toBe(0);
  });

  it("counts a match on attribute1 and counts true answer", () => {
    const result = calculateOneBiasTypePersonal(PUB, BIAS, [makeHeadline({ attribute1Answer: "true" })]);
    expect(result.biasExists).toBe(1);
    expect(result.percentBiased).toBe(100);
  });

  it("counts a match on attribute1 and counts false answer", () => {
    const result = calculateOneBiasTypePersonal(PUB, BIAS, [makeHeadline({ attribute1Answer: "false" })]);
    expect(result.biasExists).toBe(1);
    expect(result.percentBiased).toBe(0);
  });

  it("counts a match on attribute2 when attribute1 does not match", () => {
    const headline = makeHeadline({ attribute1: "other_bias", attribute2: BIAS, attribute2Answer: "true" });
    const result = calculateOneBiasTypePersonal(PUB, BIAS, [headline]);
    expect(result.biasExists).toBe(1);
    expect(result.percentBiased).toBe(100);
  });

  it("calculates percent correctly across a mix of true and false answers", () => {
    const headlines: HeadlineEntry[] = [
      makeHeadline({ attribute1Answer: "true" }),
      makeHeadline({ attribute1Answer: "true" }),
      makeHeadline({ attribute1Answer: "false" }),
    ];
    const result = calculateOneBiasTypePersonal(PUB, BIAS, headlines);
    expect(result.biasExists).toBe(1);
    // 2/3 → 67
    expect(result.percentBiased).toBe(67);
  });

  it("rounds percentBiased to nearest integer", () => {
    // 1/3 → 33
    const headlines: HeadlineEntry[] = [
      makeHeadline({ attribute1Answer: "true" }),
      makeHeadline({ attribute1Answer: "false" }),
      makeHeadline({ attribute1Answer: "false" }),
    ];
    const result = calculateOneBiasTypePersonal(PUB, BIAS, headlines);
    expect(result.percentBiased).toBe(33);
  });
});
