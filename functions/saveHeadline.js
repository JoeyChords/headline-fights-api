const Headline = require("../models/headline");

//Create document for scraped headlines. Method takes an instance of one of the Article classes.
function saveHeadline(article) {
  //Filter so that unusable headlines aren't saved
  if (article.headline != "" && article.headline != null && article.imgURL != "" && article.imgURL != null && article.headline.slice(0, 1) != "<") {
    const headline = new Headline({
      headline: article.headline,
      article_url: article.url,
      photo_source_url: article.imgURL,
      video_source_url: article.videoURL,
      publication: article.publication,
    });

    headline.save().then(() => {
      "New headline saved: " + headline.headline;
    });
  } else {
    console.log("Headline corrupt. Not saved.");
  }
}

module.exports = saveHeadline;
