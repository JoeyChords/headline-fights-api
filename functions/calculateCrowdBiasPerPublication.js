const calculateOneBiasTypeCrowd = require("./calculateOneBiasTypeCrowd");
const CrowdBiases = require("../classes/CrowdBiases");

function calculateCrowdBiasPerPublication(publication, stats) {
  const attributes = stats;

  const sensationalism = calculateOneBiasTypeCrowd(attributes.sensationalism_true, attributes.sensationalism_false);

  const undueWeight = calculateOneBiasTypeCrowd(attributes.undue_weight_bias_true, attributes.undue_weight_bias_false);

  const speculativeContent = calculateOneBiasTypeCrowd(attributes.speculative_content_true, attributes.speculative_content_false);

  const tonality = calculateOneBiasTypeCrowd(attributes.tonality_bias_true, attributes.tonality_bias_false);

  const concision = calculateOneBiasTypeCrowd(attributes.concision_bias_true, attributes.concision_bias_false);

  const coverage = calculateOneBiasTypeCrowd(attributes.coverage_bias_true, attributes.coverage_bias_false);

  const distortion = calculateOneBiasTypeCrowd(attributes.distortion_bias_true, attributes.distortion_bias_false);

  const partisan = calculateOneBiasTypeCrowd(attributes.partisan_bias_true, attributes.partisan_bias_false);

  const favorsOrAttacks = calculateOneBiasTypeCrowd(attributes.favors_or_attacks_true, attributes.favors_or_attacks_false);

  const content = calculateOneBiasTypeCrowd(attributes.content_bias_true, attributes.content_bias_false);

  const structural = calculateOneBiasTypeCrowd(attributes.structural_bias_true, attributes.structural_bias_false);

  const gatekeeping = calculateOneBiasTypeCrowd(attributes.gatekeeping_bias_true, attributes.gatekeeping_bias_false);

  const decisionMaking = calculateOneBiasTypeCrowd(attributes.decision_making_bias_true, attributes.decision_making_bias_false);

  const mainstream = calculateOneBiasTypeCrowd(attributes.mainstream_bias_true, attributes.mainstream_bias_false);

  const falseBalance = calculateOneBiasTypeCrowd(attributes.false_balance_bias_true, attributes.false_balance_bias_false);

  const numberOfBiasesSeen =
    sensationalism.biasExists +
    undueWeight.biasExists +
    speculativeContent.biasExists +
    tonality.biasExists +
    concision.biasExists +
    coverage.biasExists +
    distortion.biasExists +
    partisan.biasExists +
    favorsOrAttacks.biasExists +
    content.biasExists +
    structural.biasExists +
    gatekeeping.biasExists +
    decisionMaking.biasExists +
    mainstream.biasExists +
    falseBalance.biasExists;

  const totalCrowdBias =
    numberOfBiasesSeen > 0
      ? Math.round(
          (sensationalism.percentBiased +
            undueWeight.percentBiased +
            speculativeContent.percentBiased +
            tonality.percentBiased +
            concision.percentBiased +
            coverage.percentBiased +
            distortion.percentBiased +
            partisan.percentBiased +
            favorsOrAttacks.percentBiased +
            content.percentBiased +
            structural.percentBiased +
            gatekeeping.percentBiased +
            decisionMaking.percentBiased +
            mainstream.percentBiased +
            falseBalance.percentBiased) /
            numberOfBiasesSeen
        )
      : 0;

  const allCrowdBiases = new CrowdBiases(
    publication,
    totalCrowdBias,
    sensationalism.percentBiased,
    undueWeight.percentBiased,
    speculativeContent.percentBiased,
    tonality.percentBiased,
    concision.percentBiased,
    coverage.percentBiased,
    distortion.percentBiased,
    partisan.percentBiased,
    favorsOrAttacks.percentBiased,
    content.percentBiased,
    structural.percentBiased,
    gatekeeping.percentBiased,
    decisionMaking.percentBiased,
    mainstream.percentBiased,
    falseBalance.percentBiased
  );

  return allCrowdBiases;
}

module.exports = calculateCrowdBiasPerPublication;
