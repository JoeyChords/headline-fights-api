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

  const numberOfBiasesSeen =
    sensationalism.biasExists +
    undue_weight_bias.biasExists +
    speculative_content.biasExists +
    tonality_bias.biasExists +
    concision_bias.biasExists +
    coverage_bias.biasExists +
    distortion_bias.biasExists +
    partisan_bias.biasExists +
    favors_or_attacks.biasExists +
    content_bias.biasExists +
    structural_bias.biasExists +
    gatekeeping_bias.biasExists +
    decision_making_bias.biasExists +
    mainstream_bias.biasExists +
    false_balance_bias.biasExists;

  let totalPersonalBias =
    numberOfBiasesSeen > 0
      ? Math.round(
          (sensationalism.percentBiased +
            undue_weight_bias.percentBiased +
            speculative_content.percentBiased +
            tonality_bias.percentBiased +
            concision_bias.percentBiased +
            coverage_bias.percentBiased +
            distortion_bias.percentBiased +
            partisan_bias.percentBiased +
            favors_or_attacks.percentBiased +
            content_bias.percentBiased +
            structural_bias.percentBiased +
            gatekeeping_bias.percentBiased +
            decision_making_bias.percentBiased +
            mainstream_bias.percentBiased +
            false_balance_bias.percentBiased) /
            numberOfBiasesSeen
        )
      : 0;

  const allPersonalBiases = new PersonalBiases(
    publication,
    totalPersonalBias,
    sensationalism.percentBiased,
    undue_weight_bias.percentBiased,
    speculative_content.percentBiased,
    tonality_bias.percentBiased,
    concision_bias.percentBiased,
    coverage_bias.percentBiased,
    distortion_bias.percentBiased,
    partisan_bias.percentBiased,
    favors_or_attacks.percentBiased,
    content_bias.percentBiased,
    structural_bias.percentBiased,
    gatekeeping_bias.percentBiased,
    decision_making_bias.percentBiased,
    mainstream_bias.percentBiased,
    false_balance_bias.percentBiased
  );

  return allPersonalBiases;
}

module.exports = calculateTotalBiasPerPublication;
