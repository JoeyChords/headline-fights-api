import { describe, it, expect, vi, beforeEach } from "vitest";
import { saveUserFeedback, UserFeedback } from "../saveUserFeedback";

const mockHeadlineFindOneAndUpdate = vi.hoisted(() => vi.fn());
const mockHeadlineStatFindOneAndUpdate = vi.hoisted(() => vi.fn());

vi.mock("../../models/headline", () => ({
  Headline: { findOneAndUpdate: mockHeadlineFindOneAndUpdate },
}));

vi.mock("../../models/headlineStat", () => ({
  HeadlineStat: { findOneAndUpdate: mockHeadlineStatFindOneAndUpdate },
}));

const PUB1 = "Publication One";
const PUB2 = "Publication Two";
const STATS_ID = "stats_doc_id";
const HEADLINE_ID = "headline_id_abc";

beforeEach(() => {
  mockHeadlineFindOneAndUpdate.mockReset();
  mockHeadlineStatFindOneAndUpdate.mockReset();
  mockHeadlineFindOneAndUpdate.mockResolvedValue({});
  mockHeadlineStatFindOneAndUpdate.mockResolvedValue({});
  process.env.PUBLICATION_1 = PUB1;
  process.env.PUBLICATION_2 = PUB2;
  process.env.STATISTICS_DOCUMENT_ID = STATS_ID;
});

describe("saveUserFeedback", () => {
  it("increments times_correctly_chosen when guess is correct", async () => {
    const feedback: UserFeedback = { headline: HEADLINE_ID, publicationCorrect: true, publicationAnswer: PUB1 };
    await saveUserFeedback(feedback);

    expect(mockHeadlineFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: HEADLINE_ID },
      { $inc: { times_correctly_chosen: 1 } }
    );
  });

  it("increments times_incorrectly_chosen when guess is wrong", async () => {
    const feedback: UserFeedback = { headline: HEADLINE_ID, publicationCorrect: false, publicationAnswer: PUB1 };
    await saveUserFeedback(feedback);

    expect(mockHeadlineFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: HEADLINE_ID },
      { $inc: { times_incorrectly_chosen: 1 } }
    );
  });

  it("increments pub_1_chosen_correctly in stats when correct guess for pub1", async () => {
    const feedback: UserFeedback = { headline: HEADLINE_ID, publicationCorrect: true, publicationAnswer: PUB1 };
    await saveUserFeedback(feedback);

    expect(mockHeadlineStatFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: STATS_ID },
      { $inc: { times_seen: 1, times_pub_1_chosen_correctly: 1 } }
    );
  });

  it("increments pub_2_chosen_correctly in stats when correct guess for pub2", async () => {
    const feedback: UserFeedback = { headline: HEADLINE_ID, publicationCorrect: true, publicationAnswer: PUB2 };
    await saveUserFeedback(feedback);

    expect(mockHeadlineStatFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: STATS_ID },
      { $inc: { times_seen: 1, times_pub_2_chosen_correctly: 1 } }
    );
  });

  it("increments pub_1_chosen_incorrectly in stats when wrong guess for pub1", async () => {
    const feedback: UserFeedback = { headline: HEADLINE_ID, publicationCorrect: false, publicationAnswer: PUB1 };
    await saveUserFeedback(feedback);

    expect(mockHeadlineStatFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: STATS_ID },
      { $inc: { times_seen: 1, times_pub_1_chosen_incorrectly: 1 } }
    );
  });

  it("increments pub_2_chosen_incorrectly in stats when wrong guess for pub2", async () => {
    const feedback: UserFeedback = { headline: HEADLINE_ID, publicationCorrect: false, publicationAnswer: PUB2 };
    await saveUserFeedback(feedback);

    expect(mockHeadlineStatFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: STATS_ID },
      { $inc: { times_seen: 1, times_pub_2_chosen_incorrectly: 1 } }
    );
  });
});
