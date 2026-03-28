export class CrowdBiases {
  publication: string;
  total_bias: number;
  sensationalism: number;
  undue_weight_bias: number;
  speculative_content: number;
  tonality_bias: number;
  concision_bias: number;
  coverage_bias: number;
  distortion_bias: number;
  partisan_bias: number;
  favors_or_attacks: number;
  content_bias: number;
  structural_bias: number;
  gatekeeping_bias: number;
  decision_making_bias: number;
  mainstream_bias: number;
  false_balance_bias: number;

  constructor(
    publication: string,
    total_bias: number,
    sensationalism: number,
    undue_weight_bias: number,
    speculative_content: number,
    tonality_bias: number,
    concision_bias: number,
    coverage_bias: number,
    distortion_bias: number,
    partisan_bias: number,
    favors_or_attacks: number,
    content_bias: number,
    structural_bias: number,
    gatekeeping_bias: number,
    decision_making_bias: number,
    mainstream_bias: number,
    false_balance_bias: number
  ) {
    this.publication = publication;
    this.total_bias = total_bias;
    this.sensationalism = sensationalism;
    this.undue_weight_bias = undue_weight_bias;
    this.speculative_content = speculative_content;
    this.tonality_bias = tonality_bias;
    this.concision_bias = concision_bias;
    this.coverage_bias = coverage_bias;
    this.distortion_bias = distortion_bias;
    this.partisan_bias = partisan_bias;
    this.favors_or_attacks = favors_or_attacks;
    this.content_bias = content_bias;
    this.structural_bias = structural_bias;
    this.gatekeeping_bias = gatekeeping_bias;
    this.decision_making_bias = decision_making_bias;
    this.mainstream_bias = mainstream_bias;
    this.false_balance_bias = false_balance_bias;
  }
}
