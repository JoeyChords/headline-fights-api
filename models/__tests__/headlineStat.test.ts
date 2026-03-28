import { describe, it, expect } from "vitest";
import { HeadlineStat } from "../headlineStat";

describe("HeadlineStat model", () => {
  it("stores name field", () => {
    const doc = new HeadlineStat({ name: "global" });
    expect(doc.name).toBe("global");
  });

  it("stores times_seen field", () => {
    const doc = new HeadlineStat({ times_seen: 100 });
    expect(doc.times_seen).toBe(100);
  });

  it("stores pub_1 choice counts", () => {
    const doc = new HeadlineStat({ times_pub_1_chosen_correctly: 8, times_pub_1_chosen_incorrectly: 2 });
    expect(doc.times_pub_1_chosen_correctly).toBe(8);
    expect(doc.times_pub_1_chosen_incorrectly).toBe(2);
  });

  it("stores pub_2 choice counts", () => {
    const doc = new HeadlineStat({ times_pub_2_chosen_correctly: 6, times_pub_2_chosen_incorrectly: 4 });
    expect(doc.times_pub_2_chosen_correctly).toBe(6);
    expect(doc.times_pub_2_chosen_incorrectly).toBe(4);
  });

  it("stores nested pub_1_bias_attributes", () => {
    const doc = new HeadlineStat({
      pub_1_bias_attributes: { sensationalism_true: 5, sensationalism_false: 2 },
    });
    expect(doc.pub_1_bias_attributes?.sensationalism_true).toBe(5);
    expect(doc.pub_1_bias_attributes?.sensationalism_false).toBe(2);
  });

  it("stores nested pub_2_bias_attributes", () => {
    const doc = new HeadlineStat({
      pub_2_bias_attributes: { partisan_bias_true: 3 },
    });
    expect(doc.pub_2_bias_attributes?.partisan_bias_true).toBe(3);
  });
});
