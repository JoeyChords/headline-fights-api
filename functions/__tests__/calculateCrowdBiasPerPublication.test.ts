import { describe, it, expect } from "vitest";
import { calculateCrowdBiasPerPublication, HeadlineStatFields } from "../calculateCrowdBiasPerPublication";
import { CrowdBiases } from "../../classes/CrowdBiases";

function makeStats(overrides: Partial<HeadlineStatFields> = {}): HeadlineStatFields {
  return {
    sensationalism_true: 0,
    sensationalism_false: 0,
    undue_weight_bias_true: 0,
    undue_weight_bias_false: 0,
    speculative_content_true: 0,
    speculative_content_false: 0,
    tonality_bias_true: 0,
    tonality_bias_false: 0,
    concision_bias_true: 0,
    concision_bias_false: 0,
    coverage_bias_true: 0,
    coverage_bias_false: 0,
    distortion_bias_true: 0,
    distortion_bias_false: 0,
    partisan_bias_true: 0,
    partisan_bias_false: 0,
    favors_or_attacks_true: 0,
    favors_or_attacks_false: 0,
    content_bias_true: 0,
    content_bias_false: 0,
    structural_bias_true: 0,
    structural_bias_false: 0,
    gatekeeping_bias_true: 0,
    gatekeeping_bias_false: 0,
    decision_making_bias_true: 0,
    decision_making_bias_false: 0,
    mainstream_bias_true: 0,
    mainstream_bias_false: 0,
    false_balance_bias_true: 0,
    false_balance_bias_false: 0,
    ...overrides,
  };
}

describe("calculateCrowdBiasPerPublication", () => {
  it("returns a CrowdBiases instance", () => {
    const result = calculateCrowdBiasPerPublication("Pub", makeStats());
    expect(result).toBeInstanceOf(CrowdBiases);
  });

  it("returns all zeros when all stats are zero", () => {
    const result = calculateCrowdBiasPerPublication("Pub", makeStats());
    expect(result.total_bias).toBe(0);
    expect(result.sensationalism).toBe(0);
    expect(result.undue_weight_bias).toBe(0);
  });

  it("stores the publication name", () => {
    const result = calculateCrowdBiasPerPublication("The Guardian", makeStats());
    expect(result.publication).toBe("The Guardian");
  });

  it("calculates sensationalism correctly when only that bias has data", () => {
    // 3 true / 4 total = 75%
    const result = calculateCrowdBiasPerPublication("Pub", makeStats({ sensationalism_true: 3, sensationalism_false: 1 }));
    expect(result.sensationalism).toBe(75);
    // only 1 bias seen, total_bias = average of just that one = 75
    expect(result.total_bias).toBe(75);
  });

  it("averages total_bias across all biases that have data", () => {
    // sensationalism: 100%, undue_weight: 0%, 2 biases seen → average = 50
    const result = calculateCrowdBiasPerPublication(
      "Pub",
      makeStats({ sensationalism_true: 1, sensationalism_false: 0, undue_weight_bias_true: 0, undue_weight_bias_false: 1 })
    );
    expect(result.sensationalism).toBe(100);
    expect(result.undue_weight_bias).toBe(0);
    expect(result.total_bias).toBe(50);
  });

  it("rounds total_bias to nearest integer", () => {
    // sensationalism: 100, undue_weight: 0, speculative: 0 → (100+0+0)/3 = 33.33 → 33
    const result = calculateCrowdBiasPerPublication(
      "Pub",
      makeStats({
        sensationalism_true: 1,
        sensationalism_false: 0,
        undue_weight_bias_true: 0,
        undue_weight_bias_false: 1,
        speculative_content_true: 0,
        speculative_content_false: 1,
      })
    );
    expect(result.total_bias).toBe(33);
  });
});
