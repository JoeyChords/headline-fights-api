import { describe, it, expect, vi, beforeEach } from "vitest";
import { saveHeadline } from "../saveHeadline";
import { Article } from "../../classes/Article";

const mockSave = vi.hoisted(() => vi.fn());
const mockFindOne = vi.hoisted(() => vi.fn());

vi.mock("../../models/headline", () => ({
  Headline: Object.assign(
    vi.fn(function (this: unknown) {
      return { save: mockSave };
    }),
    { findOne: mockFindOne }
  ),
}));

function makeArticle(overrides: Partial<Article> = {}): Article {
  return Object.assign(
    new Article("https://example.com", "Valid Headline", "https://example.com/img.jpg", "", "The Times"),
    overrides
  );
}

beforeEach(() => {
  mockSave.mockReset();
  mockFindOne.mockReset();
  mockSave.mockResolvedValue(undefined);
});

describe("saveHeadline", () => {
  it("saves a valid article that has not been seen before", async () => {
    mockFindOne.mockResolvedValue(null);

    await saveHeadline(makeArticle());

    expect(mockFindOne).toHaveBeenCalledWith({ headline: "Valid Headline" });
    expect(mockSave).toHaveBeenCalledOnce();
  });

  it("does not save an article whose headline already exists", async () => {
    mockFindOne.mockResolvedValue({ headline: "Valid Headline" });

    await saveHeadline(makeArticle());

    expect(mockSave).not.toHaveBeenCalled();
  });

  it("does not save an article with an empty headline", async () => {
    await saveHeadline(makeArticle({ headline: "" }));

    expect(mockFindOne).not.toHaveBeenCalled();
    expect(mockSave).not.toHaveBeenCalled();
  });

  it("does not save an article with an empty imgURL", async () => {
    await saveHeadline(makeArticle({ imgURL: "" }));

    expect(mockSave).not.toHaveBeenCalled();
  });

  it("does not save an article whose headline starts with '<'", async () => {
    await saveHeadline(makeArticle({ headline: "<h2>Injected tag</h2>" }));

    expect(mockSave).not.toHaveBeenCalled();
  });
});
