export function calculateOneBiasTypeCrowd(isTrue: number, isFalse: number): { percentBiased: number; biasExists: 0 | 1 } {
  let biasExists: 0 | 1 = 0;

  const totalNumberOfRatings = isTrue + isFalse;
  if (totalNumberOfRatings > 0) {
    biasExists = 1;
  }
  const percentBiased = totalNumberOfRatings > 0 ? Math.round((isTrue / totalNumberOfRatings) * 100) : 0;

  return { percentBiased, biasExists };
}
