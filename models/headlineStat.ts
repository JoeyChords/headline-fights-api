import mongoose, { Document, Schema } from "mongoose";

interface BiasAttributes {
  sensationalism_true?: number;
  sensationalism_false?: number;
  sensationalism_neither?: number;
  undue_weight_bias_true?: number;
  undue_weight_bias_false?: number;
  undue_weight_bias_neither?: number;
  speculative_content_true?: number;
  speculative_content_false?: number;
  speculative_content_neither?: number;
  tonality_bias_true?: number;
  tonality_bias_false?: number;
  tonality_bias_neither?: number;
  concision_bias_true?: number;
  concision_bias_false?: number;
  concision_bias_neither?: number;
  coverage_bias_true?: number;
  coverage_bias_false?: number;
  coverage_bias_neither?: number;
  distortion_bias_true?: number;
  distortion_bias_false?: number;
  distortion_bias_neither?: number;
  partisan_bias_true?: number;
  partisan_bias_false?: number;
  partisan_bias_neither?: number;
  favors_or_attacks_true?: number;
  favors_or_attacks_false?: number;
  favors_or_attacks_neither?: number;
  content_bias_true?: number;
  content_bias_false?: number;
  content_bias_neither?: number;
  structural_bias_true?: number;
  structural_bias_false?: number;
  structural_bias_neither?: number;
  gatekeeping_bias_true?: number;
  gatekeeping_bias_false?: number;
  gatekeeping_bias_neither?: number;
  decision_making_bias_true?: number;
  decision_making_bias_false?: number;
  decision_making_bias_neither?: number;
  mainstream_bias_true?: number;
  mainstream_bias_false?: number;
  mainstream_bias_neither?: number;
  false_balance_bias_true?: number;
  false_balance_bias_false?: number;
  false_balance_bias_neither?: number;
}

export interface IHeadlineStat extends Document {
  name?: string;
  times_seen?: number;
  times_pub_1_chosen_correctly?: number;
  times_pub_1_chosen_incorrectly?: number;
  times_pub_2_chosen_correctly?: number;
  times_pub_2_chosen_incorrectly?: number;
  pub_1_bias_attributes?: BiasAttributes;
  pub_2_bias_attributes?: BiasAttributes;
}

const biasAttributesSchema = {
  sensationalism_true: Number,
  sensationalism_false: Number,
  sensationalism_neither: Number,
  undue_weight_bias_true: Number,
  undue_weight_bias_false: Number,
  undue_weight_bias_neither: Number,
  speculative_content_true: Number,
  speculative_content_false: Number,
  speculative_content_neither: Number,
  tonality_bias_true: Number,
  tonality_bias_false: Number,
  tonality_bias_neither: Number,
  concision_bias_true: Number,
  concision_bias_false: Number,
  concision_bias_neither: Number,
  coverage_bias_true: Number,
  coverage_bias_false: Number,
  coverage_bias_neither: Number,
  distortion_bias_true: Number,
  distortion_bias_false: Number,
  distortion_bias_neither: Number,
  partisan_bias_true: Number,
  partisan_bias_false: Number,
  partisan_bias_neither: Number,
  favors_or_attacks_true: Number,
  favors_or_attacks_false: Number,
  favors_or_attacks_neither: Number,
  content_bias_true: Number,
  content_bias_false: Number,
  content_bias_neither: Number,
  structural_bias_true: Number,
  structural_bias_false: Number,
  structural_bias_neither: Number,
  gatekeeping_bias_true: Number,
  gatekeeping_bias_false: Number,
  gatekeeping_bias_neither: Number,
  decision_making_bias_true: Number,
  decision_making_bias_false: Number,
  decision_making_bias_neither: Number,
  mainstream_bias_true: Number,
  mainstream_bias_false: Number,
  mainstream_bias_neither: Number,
  false_balance_bias_true: Number,
  false_balance_bias_false: Number,
  false_balance_bias_neither: Number,
};

const headlineStatSchema = new Schema<IHeadlineStat>(
  {
    name: String,
    times_seen: Number,
    times_pub_1_chosen_correctly: Number,
    times_pub_1_chosen_incorrectly: Number,
    times_pub_2_chosen_correctly: Number,
    times_pub_2_chosen_incorrectly: Number,
    pub_1_bias_attributes: biasAttributesSchema,
    pub_2_bias_attributes: biasAttributesSchema,
  },
  { timestamps: true }
);

export const HeadlineStat =
  (mongoose.models["HeadlineStat"] as mongoose.Model<IHeadlineStat>) ||
  mongoose.model<IHeadlineStat>("HeadlineStat", headlineStatSchema);
