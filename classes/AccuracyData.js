/**
 * Tells the FE how accurate users are in their guesses about publications
 */

class AccuracyData {
  constructor(userPub1Percent, userPub2Percent, crowdPub1Percent, crowdPub2Percent) {
    this.userPub1Percent = userPub1Percent;
    this.userPub2Percent = userPub2Percent;
    this.crowdPub1Percent = crowdPub1Percent;
    this.crowdPub2Percent = crowdPub2Percent;
  }
}

module.exports = AccuracyData;
