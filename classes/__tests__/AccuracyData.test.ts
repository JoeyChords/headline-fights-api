import { describe, it, expect } from "vitest";
import { AccuracyData } from "../AccuracyData";

describe("AccuracyData", () => {
  it("stores all constructor arguments as properties", () => {
    const data = new AccuracyData(75, 80, 60, 65, 200, 100, 100);

    expect(data.userPub1Percent).toBe(75);
    expect(data.userPub2Percent).toBe(80);
    expect(data.crowdPub1Percent).toBe(60);
    expect(data.crowdPub2Percent).toBe(65);
    expect(data.totalRatingsCount).toBe(200);
    expect(data.pub1RatingsCount).toBe(100);
    expect(data.pub2RatingsCount).toBe(100);
  });

  it("accepts zero for all numeric fields", () => {
    const data = new AccuracyData(0, 0, 0, 0, 0, 0, 0);

    expect(data.userPub1Percent).toBe(0);
    expect(data.totalRatingsCount).toBe(0);
  });

  it("accepts decimal values", () => {
    const data = new AccuracyData(33.33, 66.67, 50.5, 49.5, 10, 4, 6);

    expect(data.userPub1Percent).toBeCloseTo(33.33);
    expect(data.userPub2Percent).toBeCloseTo(66.67);
  });

  it("pub1RatingsCount and pub2RatingsCount sum to totalRatingsCount when equal", () => {
    const data = new AccuracyData(50, 50, 50, 50, 100, 40, 60);

    expect(data.pub1RatingsCount + data.pub2RatingsCount).toBe(100);
    expect(data.totalRatingsCount).toBe(100);
  });
});
