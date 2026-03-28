import { Headline } from "../models/headline";
import { HeadlineStat } from "../models/headlineStat";

export interface UserFeedback {
  headline: string;
  publicationCorrect: boolean;
  publicationAnswer: string;
}

export async function saveUserFeedback(userFeedback: UserFeedback): Promise<void> {
  if (userFeedback.publicationCorrect) {
    const headlineDocument = await Headline.findOneAndUpdate(
      { _id: userFeedback.headline },
      { $inc: { times_correctly_chosen: 1 } }
    );

    let statisticsDocument;
    if (userFeedback.publicationAnswer === process.env.PUBLICATION_1) {
      statisticsDocument = await HeadlineStat.findOneAndUpdate(
        { _id: process.env.STATISTICS_DOCUMENT_ID },
        { $inc: { times_seen: 1, times_pub_1_chosen_correctly: 1 } }
      );
    } else if (userFeedback.publicationAnswer === process.env.PUBLICATION_2) {
      statisticsDocument = await HeadlineStat.findOneAndUpdate(
        { _id: process.env.STATISTICS_DOCUMENT_ID },
        { $inc: { times_seen: 1, times_pub_2_chosen_correctly: 1 } }
      );
    }

    console.log(headlineDocument);
    console.log(statisticsDocument);
  } else {
    const headlineDocument = await Headline.findOneAndUpdate(
      { _id: userFeedback.headline },
      { $inc: { times_incorrectly_chosen: 1 } }
    );

    let statisticsDocument;
    if (userFeedback.publicationAnswer === process.env.PUBLICATION_1) {
      statisticsDocument = await HeadlineStat.findOneAndUpdate(
        { _id: process.env.STATISTICS_DOCUMENT_ID },
        { $inc: { times_seen: 1, times_pub_1_chosen_incorrectly: 1 } }
      );
    } else if (userFeedback.publicationAnswer === process.env.PUBLICATION_2) {
      statisticsDocument = await HeadlineStat.findOneAndUpdate(
        { _id: process.env.STATISTICS_DOCUMENT_ID },
        { $inc: { times_seen: 1, times_pub_2_chosen_incorrectly: 1 } }
      );
    }

    console.log(headlineDocument);
    console.log(statisticsDocument);
  }
}
