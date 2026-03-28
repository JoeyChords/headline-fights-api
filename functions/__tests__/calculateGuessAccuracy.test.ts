import { describe, it, expect, beforeEach } from "vitest";
import { calculateGuessAccuracy, UserHeadline, GameStatistics } from "../calculateGuessAccuracy";
import { AccuracyData } from "../../classes/AccuracyData";

const PUB1 = "Publication One";
const PUB2 = "Publication Two";

const stats: GameStatistics = {
  times_pub_1_chosen_correctly: 8,
  times_pub_1_chosen_incorrectly: 2,
  times_pub_2_chosen_correctly: 6,
  times_pub_2_chosen_incorrectly: 4,
};

beforeEach(() => {
  process.env.PUBLICATION_1 = PUB1;
  process.env.PUBLICATION_2 = PUB2;
});

describe("calculateGuessAccuracy", () => {
  it("returns an AccuracyData instance", () => {
    const result = calculateGuessAccuracy([], stats);
    expect(result).toBeInstanceOf(AccuracyData);
  });

  it("returns zero user percents and zero counts when there are no user headlines", () => {
    const result = calculateGuessAccuracy([], stats);
    expect(result.userPub1Percent).toBe(0);
    expect(result.userPub2Percent).toBe(0);
    expect(result.totalRatingsCount).toBe(0);
    expect(result.pub1RatingsCount).toBe(0);
    expect(result.pub2RatingsCount).toBe(0);
  });

  it("calculates crowd percents from statistics", () => {
    const result = calculateGuessAccuracy([], stats);
    // 8 / (8+2) = 80%
    expect(result.crowdPub1Percent).toBe(80);
    // 6 / (6+4) = 60%
    expect(result.crowdPub2Percent).toBe(60);
  });

  it("returns zero crowd percents when statistics totals are zero", () => {
    const zeroStats: GameStatistics = {
      times_pub_1_chosen_correctly: 0,
      times_pub_1_chosen_incorrectly: 0,
      times_pub_2_chosen_correctly: 0,
      times_pub_2_chosen_incorrectly: 0,
    };
    const result = calculateGuessAccuracy([], zeroStats);
    expect(result.crowdPub1Percent).toBe(0);
    expect(result.crowdPub2Percent).toBe(0);
  });

  it("calculates user pub1 accuracy when only pub1 headlines exist", () => {
    const headlines: UserHeadline[] = [
      { publication: PUB1, chose_correctly: true },
      { publication: PUB1, chose_correctly: true },
      { publication: PUB1, chose_correctly: false },
    ];
    const result = calculateGuessAccuracy(headlines, stats);
    // 2/3 → 67%
    expect(result.userPub1Percent).toBe(67);
    expect(result.userPub2Percent).toBe(0);
    expect(result.pub1RatingsCount).toBe(3);
    expect(result.pub2RatingsCount).toBe(0);
    expect(result.totalRatingsCount).toBe(3);
  });

  it("calculates user pub2 accuracy when only pub2 headlines exist", () => {
    const headlines: UserHeadline[] = [
      { publication: PUB2, chose_correctly: true },
      { publication: PUB2, chose_correctly: false },
    ];
    const result = calculateGuessAccuracy(headlines, stats);
    expect(result.userPub1Percent).toBe(0);
    expect(result.userPub2Percent).toBe(50);
    expect(result.pub1RatingsCount).toBe(0);
    expect(result.pub2RatingsCount).toBe(2);
  });

  it("calculates both user percents when headlines exist for both publications", () => {
    const headlines: UserHeadline[] = [
      { publication: PUB1, chose_correctly: true },
      { publication: PUB1, chose_correctly: false },
      { publication: PUB2, chose_correctly: true },
      { publication: PUB2, chose_correctly: true },
      { publication: PUB2, chose_correctly: true },
      { publication: PUB2, chose_correctly: false },
    ];
    const result = calculateGuessAccuracy(headlines, stats);
    expect(result.userPub1Percent).toBe(50);
    // 3/4 = 75%
    expect(result.userPub2Percent).toBe(75);
    expect(result.totalRatingsCount).toBe(6);
  });

  it("does not produce NaN when pub arrays are empty (NaN bug guard)", () => {
    const result = calculateGuessAccuracy([], stats);
    expect(isNaN(result.userPub1Percent)).toBe(false);
    expect(isNaN(result.userPub2Percent)).toBe(false);
  });
});
