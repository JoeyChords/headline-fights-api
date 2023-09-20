const mongoose = require("mongoose");

const headlineSchema = new mongoose.Schema(
  {
    headline: String,
    photo_url: String,
    photo_s3_id: String,
    photo_source_url: String,
    video_url: String,
    video_s3_id: String,
    video_source_url: String,
    publication: String,
    article_url: String,
    times_correctly_chosen: Number,
  },
  {
    timestamps: true,
  }
);

Headline = mongoose.model("Headline", headlineSchema);

module.exports = Headline;
