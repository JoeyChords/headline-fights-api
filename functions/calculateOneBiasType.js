function calculateOneBiasType(isTrue, isFalse) {
  const totalNumberOfRatings = isTrue + isFalse;
  const percentBiased = totalNumberOfRatings > 0 ? Math.round((isTrue / totalNumberOfRatings) * 100) : 0;
  return percentBiased;
}

module.exports = calculateOneBiasType;
