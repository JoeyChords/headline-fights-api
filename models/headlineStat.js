//Model to store counts of all choices users make
//This is for fast display of stats such as the number of times the publication
//was chosen correctly
const mongoose = require("mongoose");

const headlineStatSchema = new mongoose.Schema(
  {
    times_chosen_correctly: Number,
    times_pub_1_chosen_correctly: Number,
    times_pub_1_chosen_incorrectly: Number,
    times_pub_2_chosen_correctly: Number,
    times_pub_2_chosen_falsely: Number,
  },
  {
    timestamps: true,
  }
);

HeadlineStat = mongoose.model("HeadlineStat", headlineStatSchema);

module.exports = HeadlineStat;
