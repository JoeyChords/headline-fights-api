import { describe, it, expect } from "vitest";
import { CrowdBiases } from "../CrowdBiases";

const ALL_ZERO_BIASES = new CrowdBiases("Test Pub", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

describe("CrowdBiases", () => {
  it("stores publication name", () => {
    expect(ALL_ZERO_BIASES.publication).toBe("Test Pub");
  });

  it("stores all bias fields as zero when constructed with zeros", () => {
    expect(ALL_ZERO_BIASES.total_bias).toBe(0);
    expect(ALL_ZERO_BIASES.sensationalism).toBe(0);
    expect(ALL_ZERO_BIASES.undue_weight_bias).toBe(0);
    expect(ALL_ZERO_BIASES.speculative_content).toBe(0);
    expect(ALL_ZERO_BIASES.tonality_bias).toBe(0);
    expect(ALL_ZERO_BIASES.concision_bias).toBe(0);
    expect(ALL_ZERO_BIASES.coverage_bias).toBe(0);
    expect(ALL_ZERO_BIASES.distortion_bias).toBe(0);
    expect(ALL_ZERO_BIASES.partisan_bias).toBe(0);
    expect(ALL_ZERO_BIASES.favors_or_attacks).toBe(0);
    expect(ALL_ZERO_BIASES.content_bias).toBe(0);
    expect(ALL_ZERO_BIASES.structural_bias).toBe(0);
    expect(ALL_ZERO_BIASES.gatekeeping_bias).toBe(0);
    expect(ALL_ZERO_BIASES.decision_making_bias).toBe(0);
    expect(ALL_ZERO_BIASES.mainstream_bias).toBe(0);
    expect(ALL_ZERO_BIASES.false_balance_bias).toBe(0);
  });

  it("stores distinct values for each bias field", () => {
    const biases = new CrowdBiases("Pub", 50, 10, 20, 30, 40, 5, 15, 25, 35, 45, 55, 60, 70, 80, 90, 100);

    expect(biases.total_bias).toBe(50);
    expect(biases.sensationalism).toBe(10);
    expect(biases.undue_weight_bias).toBe(20);
    expect(biases.speculative_content).toBe(30);
    expect(biases.tonality_bias).toBe(40);
    expect(biases.concision_bias).toBe(5);
    expect(biases.coverage_bias).toBe(15);
    expect(biases.distortion_bias).toBe(25);
    expect(biases.partisan_bias).toBe(35);
    expect(biases.favors_or_attacks).toBe(45);
    expect(biases.content_bias).toBe(55);
    expect(biases.structural_bias).toBe(60);
    expect(biases.gatekeeping_bias).toBe(70);
    expect(biases.decision_making_bias).toBe(80);
    expect(biases.mainstream_bias).toBe(90);
    expect(biases.false_balance_bias).toBe(100);
  });

  it("accepts decimal bias values", () => {
    const biases = new CrowdBiases("Pub", 33.33, 16.67, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

    expect(biases.total_bias).toBeCloseTo(33.33);
    expect(biases.sensationalism).toBeCloseTo(16.67);
  });
});
