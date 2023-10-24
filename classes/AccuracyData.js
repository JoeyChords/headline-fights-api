/**
 * Tells the FE how accurate users are in their guesses about publications
 */

class AccuracyData {
  constructor(userPub1Percent, userPub2Percent, crowdPub1Percent, crowdPub2Percent, totalRatingsCount, pub1RatingsCount, pub2RatingsCount) {
    this.userPub1Percent = userPub1Percent;
    this.userPub2Percent = userPub2Percent;
    this.crowdPub1Percent = crowdPub1Percent;
    this.crowdPub2Percent = crowdPub2Percent;
    this.totalRatingsCount = totalRatingsCount;
    this.pub1RatingsCount = pub1RatingsCount;
    this.pub2RatingsCount = pub2RatingsCount;
  }
}

module.exports = AccuracyData;
