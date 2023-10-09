/**
 * This function returns an object containing the percentages for:
 * crowd accuracy choosing publication 1
 * crowd accuracy choosing publication 2
 * user accuracy choosing publication 1
 * user accuracy choosing publication 2
 */
const AccuracyData = require("../classes/AccuracyData");

function calculateAccuracyData(userHeadlines, statistics) {
  const pub1Only = userHeadlines.filter((userHeadlines) => userHeadlines.publication === process.env.PUBLICATION_1);
  const pub1CorrectCount = pub1Only.reduce((counter, pub1Only) => (pub1Only.chose_correctly === true ? ++counter : counter), 0);
  const pub2Only = userHeadlines.filter((userHeadlines) => userHeadlines.publication === process.env.PUBLICATION_2);
  const pub2CorrectCount = pub2Only.reduce((counter, pub2Only) => (pub2Only.chose_correctly === true ? ++counter : counter), 0);
  const pub1CorrectPercent = Math.round((pub1CorrectCount / pub1Only.length) * 100);
  const pub2CorrectPercent = Math.round((pub2CorrectCount / pub2Only.length) * 100);
  const crowdPub1CorrectPercent = Math.round(
    (statistics.times_pub_1_chosen_correctly / (statistics.times_pub_1_chosen_correctly + statistics.times_pub_1_chosen_incorrectly)) * 100
  );
  const crowdPub2CorrectPercent = Math.round(
    (statistics.times_pub_2_chosen_correctly / (statistics.times_pub_2_chosen_correctly + statistics.times_pub_2_chosen_incorrectly)) * 100
  );

  const accuracyData = new AccuracyData(pub1CorrectPercent, pub2CorrectPercent, crowdPub1CorrectPercent, crowdPub2CorrectPercent);
  return accuracyData;
}

module.exports = calculateAccuracyData;
