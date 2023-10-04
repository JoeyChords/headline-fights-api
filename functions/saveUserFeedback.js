const saveUserFeedback = async (userFeedback) => {
  if (userFeedback.publicationCorrect) {
    const headlineDocument = await Headline.findOneAndUpdate(
      { _id: userFeedback.headline },
      {
        $inc: {
          times_correctly_chosen: 1,
        },
      }
    );
    if (userFeedback.publicationAnswer === process.env.PUBLICATION_1) {
      const statistics = await HeadlineStat.findOneAndUpdate(
        { _id: process.env.STATISTICS_DOCUMENT_ID },
        {
          $inc: {
            times_seen: 1,
            times_pub_1_chosen_correctly: 1,
          },
        }
      );
    } else if (userFeedback.publicationAnswer === process.env.PUBLICATION_2) {
      const statistics = await HeadlineStat.findOneAndUpdate(
        { _id: process.env.STATISTICS_DOCUMENT_ID },
        {
          $inc: {
            times_seen: 1,
            times_pub_2_chosen_correctly: 1,
          },
        }
      );
    }

    console.log(headlineDocument);
    console.log(statistics);
  } else if (!userFeedback.publicationCorrect) {
    const headlineDocument = await Headline.findOneAndUpdate(
      { _id: userFeedback.headline },
      {
        $inc: {
          times_incorrectly_chosen: 1,
        },
      }
    );

    if (userFeedback.publicationAnswer === process.env.PUBLICATION_1) {
      const statistics = await HeadlineStat.findOneAndUpdate(
        { _id: process.env.STATISTICS_DOCUMENT_ID },
        {
          $inc: {
            times_seen: 1,
            times_pub_1_chosen_incorrectly: 1,
          },
        }
      );
    } else if (userFeedback.publicationAnswer === process.env.PUBLICATION_2) {
      const statistics = await HeadlineStat.findOneAndUpdate(
        { _id: process.env.STATISTICS_DOCUMENT_ID },
        {
          $inc: {
            times_seen: 1,
            times_pub_2_chosen_incorrectly: 1,
          },
        }
      );
    }
    console.log(headlineDocument);
    console.log(statistics);
  }
};

module.exports = saveUserFeedback;
