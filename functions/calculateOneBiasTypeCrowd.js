function calculateOneBiasTypeCrowd(isTrue, isFalse) {
  let biasExists = 0;

  const totalNumberOfRatings = isTrue + isFalse;
  if (totalNumberOfRatings > 0) {
    biasExists = 1;
  }
  const percentBiased = totalNumberOfRatings > 0 ? Math.round((isTrue / totalNumberOfRatings) * 100) : 0;

  const biasType = {
    percentBiased: percentBiased,
    biasExists: biasExists,
  };
  return biasType;
}

module.exports = calculateOneBiasTypeCrowd;
