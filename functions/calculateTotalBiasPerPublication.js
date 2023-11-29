const calculateOneBiasType = require("./calculateOneBiasType");

function calculateTotalBiasPerPublication(stats) {
  const attributes = stats;

  let percentBiased = 0;

  const sensationalism = calculateOneBiasType(attributes.sensationalism_true, attributes.sensationalism_false);

  const undueWeight = calculateOneBiasType(attributes.undue_weight_bias_true, attributes.undue_weight_bias_false);

  const speculativeContent = calculateOneBiasType(attributes.speculative_content_true, attributes.speculative_content_false);

  const tonality = calculateOneBiasType(attributes.tonality_bias_true, attributes.tonality_bias_false);

  const concision = calculateOneBiasType(attributes.concision_bias_true, attributes.concision_bias_false);

  const coverage = calculateOneBiasType(attributes.coverage_bias_true, attributes.coverage_bias_false);

  const distortion = calculateOneBiasType(attributes.distortion_bias_true, attributes.distortion_bias_false);

  const partisan = calculateOneBiasType(attributes.partisan_bias_true, attributes.partisan_bias_false);

  const favorsOrAttacks = calculateOneBiasType(attributes.favors_or_attacks_true, attributes.favors_or_attacks_false);

  const content = calculateOneBiasType(attributes.content_bias_true, attributes.content_bias_false);

  const structural = calculateOneBiasType(attributes.structural_bias_true, attributes.structural_bias_false);

  const gatekeeping = calculateOneBiasType(attributes.gatekeeping_bias_true, attributes.gatekeeping_bias_false);

  const decisionMaking = calculateOneBiasType(attributes.decision_making_bias_true, attributes.decision_making_bias_false);

  const mainstream = calculateOneBiasType(attributes.mainstream_bias_true, attributes.mainstream_bias_false);

  const falseBalance = calculateOneBiasType(attributes.false_balance_bias_true, attributes.false_balance_bias_false);

  percentBiased = Math.round(
    (sensationalism +
      undueWeight +
      speculativeContent +
      tonality +
      concision +
      coverage +
      distortion +
      partisan +
      favorsOrAttacks +
      content +
      structural +
      gatekeeping +
      decisionMaking +
      mainstream +
      falseBalance) /
      15
  );

  return percentBiased;
}

module.exports = calculateTotalBiasPerPublication;
