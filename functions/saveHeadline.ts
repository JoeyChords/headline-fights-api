import { Article } from "../classes/Article";
import { Headline } from "../models/headline";

export async function saveHeadline(article: Article): Promise<void> {
  const isUsable =
    article.headline !== "" &&
    article.headline != null &&
    article.imgURL !== "" &&
    article.imgURL != null &&
    article.headline.slice(0, 1) !== "<";

  if (!isUsable) {
    console.log("Headline corrupt. Not saved.");
    return;
  }

  const existingHeadline = await Headline.findOne({ headline: article.headline });

  if (existingHeadline) {
    console.log("Headline, '" + article.headline + ",' already exists. Not saved.");
    return;
  }

  const headline = new Headline({
    headline: article.headline,
    article_url: article.url,
    photo_source_url: article.imgURL,
    video_source_url: article.videoURL,
    publication: article.publication,
  });

  await headline.save();
}
