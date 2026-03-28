import { describe, it, expect, vi, beforeEach } from "vitest";
import { getArticleOne } from "../getArticleOne";

const mockEnd = vi.hoisted(() => vi.fn());
const mockGet = vi.hoisted(() => vi.fn(() => ({ end: mockEnd })));
const mockSaveHeadline = vi.hoisted(() => vi.fn());

vi.mock("superagent", () => ({ default: { get: mockGet } }));
vi.mock("../saveHeadline", () => ({ saveHeadline: mockSaveHeadline }));

const VALID_HTML = `
  <div class="stack_condensed">
    <h2>Top Story Headline</h2>
    <a href="https://example.com/story">Link</a>
    <img src="https://example.com/img.jpg" />
  </div>
`;

beforeEach(() => {
  mockGet.mockClear();
  mockEnd.mockClear();
  mockSaveHeadline.mockClear();
  process.env.PUBLICATION_1_URL = "https://pub1.example.com";
  process.env.PUBLICATION_1 = "Pub One";
});

describe("getArticleOne", () => {
  it("fetches the publication URL", () => {
    mockEnd.mockImplementation(() => {});
    getArticleOne();
    expect(mockGet).toHaveBeenCalledWith("https://pub1.example.com");
  });

  it("calls saveHeadline with scraped article data on success", () => {
    mockEnd.mockImplementation((cb: (err: null, res: { text: string }) => void) => {
      cb(null, { text: VALID_HTML });
    });

    getArticleOne();

    expect(mockSaveHeadline).toHaveBeenCalledOnce();
    const article = mockSaveHeadline.mock.calls[0][0];
    expect(article.headline).toBe("Top Story Headline");
    expect(article.imgURL).toBe("https://example.com/img.jpg");
    expect(article.url).toBe("https://example.com/story");
    expect(article.publication).toBe("Pub One");
  });

  it("does not call saveHeadline when the fetch errors", () => {
    mockEnd.mockImplementation((cb: (err: Error, res: null) => void) => {
      cb(new Error("Network error"), null);
    });

    getArticleOne();

    expect(mockSaveHeadline).not.toHaveBeenCalled();
  });
});
