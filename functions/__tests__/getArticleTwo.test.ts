import { describe, it, expect, vi, beforeEach } from "vitest";
import { getArticleTwo } from "../getArticleTwo";

const mockEnd = vi.hoisted(() => vi.fn());
const mockGet = vi.hoisted(() => vi.fn(() => ({ end: mockEnd })));
const mockSaveHeadline = vi.hoisted(() => vi.fn());

vi.mock("superagent", () => ({ default: { get: mockGet } }));
vi.mock("../saveHeadline", () => ({ saveHeadline: mockSaveHeadline }));

function makeHtml(imgSrc: string | null, videoSrc: string | null): string {
  const imgTag = imgSrc ? `<img src="${imgSrc}" />` : "";
  const videoTag = videoSrc ? `<video><source src="${videoSrc}" /></video>` : "";
  return `
    <div class="big-top">
      <h3><a href="https://example.com/story">Top Story Headline</a></h3>
      ${imgTag}
      ${videoTag}
    </div>
  `;
}

beforeEach(() => {
  mockGet.mockClear();
  mockEnd.mockClear();
  mockSaveHeadline.mockClear();
  process.env.PUBLICATION_2_URL = "https://pub2.example.com";
  process.env.PUBLICATION_2 = "Pub Two";
});

describe("getArticleTwo", () => {
  it("fetches the publication URL", () => {
    mockEnd.mockImplementation(() => {});
    getArticleTwo();
    expect(mockGet).toHaveBeenCalledWith("https://pub2.example.com");
  });

  it("calls saveHeadline with scraped article when img is present", () => {
    mockEnd.mockImplementation((cb: (err: null, res: { text: string }) => void) => {
      cb(null, { text: makeHtml("https://example.com/img.jpg", null) });
    });

    getArticleTwo();

    expect(mockSaveHeadline).toHaveBeenCalledOnce();
    const article = mockSaveHeadline.mock.calls[0][0];
    expect(article.headline).toBe("Top Story Headline");
    expect(article.imgURL).toBe("https://example.com/img.jpg");
    expect(article.url).toBe("https://example.com/story");
    expect(article.publication).toBe("Pub Two");
  });

  it("falls back to videoURL when img src is absent", () => {
    mockEnd.mockImplementation((cb: (err: null, res: { text: string }) => void) => {
      cb(null, { text: makeHtml(null, "https://example.com/vid.mp4") });
    });

    getArticleTwo();

    const article = mockSaveHeadline.mock.calls[0][0];
    expect(article.imgURL).toBe("");
    expect(article.videoURL).toBe("https://example.com/vid.mp4");
  });

  it("prepends https:// to protocol-relative img URLs", () => {
    mockEnd.mockImplementation((cb: (err: null, res: { text: string }) => void) => {
      cb(null, { text: makeHtml("//cdn.example.com/img.jpg", null) });
    });

    getArticleTwo();

    const article = mockSaveHeadline.mock.calls[0][0];
    expect(article.imgURL).toBe("https://cdn.example.com/img.jpg");
  });

  it("does not call saveHeadline when the fetch errors", () => {
    mockEnd.mockImplementation((cb: (err: Error, res: null) => void) => {
      cb(new Error("Network error"), null);
    });

    getArticleTwo();

    expect(mockSaveHeadline).not.toHaveBeenCalled();
  });
});
