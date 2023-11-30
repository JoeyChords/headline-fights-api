const calculateOneBiasTypePersonal = require("./calculateOneBiasTypePersonal");
const PersonalBiases = require("../classes/PersonalBiases");

function calculateTotalBiasPerPublication(publication, headlines) {
  const sensationalism = calculateOneBiasTypePersonal(publication, "sensationalism", headlines);

  const undue_weight_bias = calculateOneBiasTypePersonal(publication, "undue_weight_bias", headlines);

  const speculative_content = calculateOneBiasTypePersonal(publication, "speculative_content", headlines);

  const tonality_bias = calculateOneBiasTypePersonal(publication, "tonality_bias", headlines);

  const concision_bias = calculateOneBiasTypePersonal(publication, "concision_bias", headlines);

  const coverage_bias = calculateOneBiasTypePersonal(publication, "coverage_bias", headlines);

  const distortion_bias = calculateOneBiasTypePersonal(publication, "distortion_bias", headlines);

  const partisan_bias = calculateOneBiasTypePersonal(publication, "partisan_bias", headlines);

  const favors_or_attacks = calculateOneBiasTypePersonal(publication, "favors_or_attacks", headlines);

  const content_bias = calculateOneBiasTypePersonal(publication, "content_bias", headlines);

  const structural_bias = calculateOneBiasTypePersonal(publication, "structural_bias", headlines);

  const gatekeeping_bias = calculateOneBiasTypePersonal(publication, "gatekeeping_bias", headlines);

  const decision_making_bias = calculateOneBiasTypePersonal(publication, "decision_making_bias", headlines);

  const mainstream_bias = calculateOneBiasTypePersonal(publication, "mainstream_bias", headlines);

  const false_balance_bias = calculateOneBiasTypePersonal(publication, "false_balance_bias", headlines);

  let totalPersonalBias = Math.round(
    (sensationalism +
      undue_weight_bias +
      speculative_content +
      tonality_bias +
      concision_bias +
      coverage_bias +
      distortion_bias +
      partisan_bias +
      favors_or_attacks +
      content_bias +
      structural_bias +
      gatekeeping_bias +
      decision_making_bias +
      mainstream_bias +
      false_balance_bias) /
      15
  );

  const allPersonalBiases = new PersonalBiases(
    publication,
    totalPersonalBias,
    sensationalism,
    undue_weight_bias,
    speculative_content,
    tonality_bias,
    concision_bias,
    coverage_bias,
    distortion_bias,
    partisan_bias,
    favors_or_attacks,
    content_bias,
    structural_bias,
    gatekeeping_bias,
    decision_making_bias,
    mainstream_bias,
    false_balance_bias
  );

  console.log(allPersonalBiases);

  return allPersonalBiases;
}

module.exports = calculateTotalBiasPerPublication;
