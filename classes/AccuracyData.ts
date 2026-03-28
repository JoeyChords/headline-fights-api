export class AccuracyData {
  userPub1Percent: number;
  userPub2Percent: number;
  crowdPub1Percent: number;
  crowdPub2Percent: number;
  totalRatingsCount: number;
  pub1RatingsCount: number;
  pub2RatingsCount: number;

  constructor(
    userPub1Percent: number,
    userPub2Percent: number,
    crowdPub1Percent: number,
    crowdPub2Percent: number,
    totalRatingsCount: number,
    pub1RatingsCount: number,
    pub2RatingsCount: number
  ) {
    this.userPub1Percent = userPub1Percent;
    this.userPub2Percent = userPub2Percent;
    this.crowdPub1Percent = crowdPub1Percent;
    this.crowdPub2Percent = crowdPub2Percent;
    this.totalRatingsCount = totalRatingsCount;
    this.pub1RatingsCount = pub1RatingsCount;
    this.pub2RatingsCount = pub2RatingsCount;
  }
}
