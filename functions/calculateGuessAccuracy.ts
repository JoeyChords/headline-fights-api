import { AccuracyData } from "../classes/AccuracyData";

export interface UserHeadline {
  publication: string;
  chose_correctly: boolean;
}

export interface GameStatistics {
  times_pub_1_chosen_correctly?: number;
  times_pub_1_chosen_incorrectly?: number;
  times_pub_2_chosen_correctly?: number;
  times_pub_2_chosen_incorrectly?: number;
}

export function calculateGuessAccuracy(userHeadlines: UserHeadline[], statistics: GameStatistics): AccuracyData {
  const pub1Only = userHeadlines.filter((h) => h.publication === process.env.PUBLICATION_1);
  const pub1CorrectCount = pub1Only.reduce((counter, h) => (h.chose_correctly === true ? counter + 1 : counter), 0);

  const pub2Only = userHeadlines.filter((h) => h.publication === process.env.PUBLICATION_2);
  const pub2CorrectCount = pub2Only.reduce((counter, h) => (h.chose_correctly === true ? counter + 1 : counter), 0);

  const pub1CorrectPercent = pub1Only.length > 0 ? Math.round((pub1CorrectCount / pub1Only.length) * 100) : 0;
  const pub2CorrectPercent = pub2Only.length > 0 ? Math.round((pub2CorrectCount / pub2Only.length) * 100) : 0;

  const crowdPub1Total = (statistics.times_pub_1_chosen_correctly ?? 0) + (statistics.times_pub_1_chosen_incorrectly ?? 0);
  const crowdPub2Total = (statistics.times_pub_2_chosen_correctly ?? 0) + (statistics.times_pub_2_chosen_incorrectly ?? 0);

  const crowdPub1CorrectPercent =
    crowdPub1Total > 0 ? Math.round(((statistics.times_pub_1_chosen_correctly ?? 0) / crowdPub1Total) * 100) : 0;
  const crowdPub2CorrectPercent =
    crowdPub2Total > 0 ? Math.round(((statistics.times_pub_2_chosen_correctly ?? 0) / crowdPub2Total) * 100) : 0;

  return new AccuracyData(
    pub1CorrectPercent,
    pub2CorrectPercent,
    crowdPub1CorrectPercent,
    crowdPub2CorrectPercent,
    pub1Only.length + pub2Only.length,
    pub1Only.length,
    pub2Only.length
  );
}
