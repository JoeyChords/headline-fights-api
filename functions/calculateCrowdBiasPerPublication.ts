import { CrowdBiases } from "../classes/CrowdBiases";
import { calculateOneBiasTypeCrowd } from "./calculateOneBiasTypeCrowd";

export interface HeadlineStatFields {
  sensationalism_true?: number;
  sensationalism_false?: number;
  undue_weight_bias_true?: number;
  undue_weight_bias_false?: number;
  speculative_content_true?: number;
  speculative_content_false?: number;
  tonality_bias_true?: number;
  tonality_bias_false?: number;
  concision_bias_true?: number;
  concision_bias_false?: number;
  coverage_bias_true?: number;
  coverage_bias_false?: number;
  distortion_bias_true?: number;
  distortion_bias_false?: number;
  partisan_bias_true?: number;
  partisan_bias_false?: number;
  favors_or_attacks_true?: number;
  favors_or_attacks_false?: number;
  content_bias_true?: number;
  content_bias_false?: number;
  structural_bias_true?: number;
  structural_bias_false?: number;
  gatekeeping_bias_true?: number;
  gatekeeping_bias_false?: number;
  decision_making_bias_true?: number;
  decision_making_bias_false?: number;
  mainstream_bias_true?: number;
  mainstream_bias_false?: number;
  false_balance_bias_true?: number;
  false_balance_bias_false?: number;
}

export function calculateCrowdBiasPerPublication(publication: string, stats: HeadlineStatFields): CrowdBiases {
  const sensationalism = calculateOneBiasTypeCrowd(stats.sensationalism_true ?? 0, stats.sensationalism_false ?? 0);
  const undueWeight = calculateOneBiasTypeCrowd(stats.undue_weight_bias_true ?? 0, stats.undue_weight_bias_false ?? 0);
  const speculativeContent = calculateOneBiasTypeCrowd(stats.speculative_content_true ?? 0, stats.speculative_content_false ?? 0);
  const tonality = calculateOneBiasTypeCrowd(stats.tonality_bias_true ?? 0, stats.tonality_bias_false ?? 0);
  const concision = calculateOneBiasTypeCrowd(stats.concision_bias_true ?? 0, stats.concision_bias_false ?? 0);
  const coverage = calculateOneBiasTypeCrowd(stats.coverage_bias_true ?? 0, stats.coverage_bias_false ?? 0);
  const distortion = calculateOneBiasTypeCrowd(stats.distortion_bias_true ?? 0, stats.distortion_bias_false ?? 0);
  const partisan = calculateOneBiasTypeCrowd(stats.partisan_bias_true ?? 0, stats.partisan_bias_false ?? 0);
  const favorsOrAttacks = calculateOneBiasTypeCrowd(stats.favors_or_attacks_true ?? 0, stats.favors_or_attacks_false ?? 0);
  const content = calculateOneBiasTypeCrowd(stats.content_bias_true ?? 0, stats.content_bias_false ?? 0);
  const structural = calculateOneBiasTypeCrowd(stats.structural_bias_true ?? 0, stats.structural_bias_false ?? 0);
  const gatekeeping = calculateOneBiasTypeCrowd(stats.gatekeeping_bias_true ?? 0, stats.gatekeeping_bias_false ?? 0);
  const decisionMaking = calculateOneBiasTypeCrowd(stats.decision_making_bias_true ?? 0, stats.decision_making_bias_false ?? 0);
  const mainstream = calculateOneBiasTypeCrowd(stats.mainstream_bias_true ?? 0, stats.mainstream_bias_false ?? 0);
  const falseBalance = calculateOneBiasTypeCrowd(stats.false_balance_bias_true ?? 0, stats.false_balance_bias_false ?? 0);

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

  return new CrowdBiases(
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
}
