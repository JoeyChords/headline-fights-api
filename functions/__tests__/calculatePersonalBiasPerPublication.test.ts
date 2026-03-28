import { describe, it, expect } from "vitest";
import { calculatePersonalBiasPerPublication } from "../calculatePersonalBiasPerPublication";
import { HeadlineEntry } from "../calculateOneBiasTypePersonal";
import { PersonalBiases } from "../../classes/PersonalBiases";

function makeHeadline(publication: string, attribute1: string, attribute1Answer: string): HeadlineEntry {
  return { publication, attribute1, attribute1Answer, attribute2: "", attribute2Answer: "" };
}

describe("calculatePersonalBiasPerPublication", () => {
  it("returns a PersonalBiases instance", () => {
    const result = calculatePersonalBiasPerPublication("Pub", []);
    expect(result).toBeInstanceOf(PersonalBiases);
  });

  it("returns all zeros when given no headlines", () => {
    const result = calculatePersonalBiasPerPublication("Pub", []);
    expect(result.total_bias).toBe(0);
    expect(result.sensationalism).toBe(0);
    expect(result.undue_weight_bias).toBe(0);
  });

  it("stores the publication name", () => {
    const result = calculatePersonalBiasPerPublication("The Times", []);
    expect(result.publication).toBe("The Times");
  });

  it("calculates sensationalism from matching headlines for the given publication", () => {
    const headlines: HeadlineEntry[] = [
      makeHeadline("Pub A", "sensationalism", "true"),
      makeHeadline("Pub A", "sensationalism", "false"),
      makeHeadline("Pub B", "sensationalism", "true"),
    ];
    const result = calculatePersonalBiasPerPublication("Pub A", headlines);
    // 1 true out of 2 for Pub A → 50%
    expect(result.sensationalism).toBe(50);
    // Pub B headlines ignored
    expect(result.total_bias).toBe(50);
  });

  it("ignores headlines for other publications", () => {
    const headlines: HeadlineEntry[] = [makeHeadline("Other Pub", "sensationalism", "true")];
    const result = calculatePersonalBiasPerPublication("Pub A", headlines);
    expect(result.sensationalism).toBe(0);
    expect(result.total_bias).toBe(0);
  });

  it("rounds total_bias correctly", () => {
    // sensationalism 100%, undue_weight_bias 0%, speculative_content 0% → 100/3 = 33
    const headlines: HeadlineEntry[] = [
      makeHeadline("Pub", "sensationalism", "true"),
      makeHeadline("Pub", "undue_weight_bias", "false"),
      makeHeadline("Pub", "speculative_content", "false"),
    ];
    const result = calculatePersonalBiasPerPublication("Pub", headlines);
    expect(result.total_bias).toBe(33);
  });
});
