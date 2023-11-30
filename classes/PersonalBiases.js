class PersonalBiases {
  constructor(
    publication,
    total_bias,
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

module.exports = PersonalBiases;
