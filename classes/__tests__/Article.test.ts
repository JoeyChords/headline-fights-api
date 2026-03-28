import { describe, it, expect } from "vitest";
import { Article } from "../Article";

describe("Article", () => {
  it("stores all constructor arguments as properties", () => {
    const article = new Article(
      "https://example.com/story",
      "Breaking: Something Happened",
      "https://example.com/img.jpg",
      "",
      "Example News"
    );

    expect(article.url).toBe("https://example.com/story");
    expect(article.headline).toBe("Breaking: Something Happened");
    expect(article.imgURL).toBe("https://example.com/img.jpg");
    expect(article.videoURL).toBe("");
    expect(article.publication).toBe("Example News");
  });

  it("accepts empty strings for optional media fields", () => {
    const article = new Article("https://example.com", "Headline", "", "", "Pub");

    expect(article.imgURL).toBe("");
    expect(article.videoURL).toBe("");
  });

  it("stores videoURL independently from imgURL", () => {
    const article = new Article("https://example.com", "Headline", "", "https://example.com/vid.mp4", "Pub");

    expect(article.imgURL).toBe("");
    expect(article.videoURL).toBe("https://example.com/vid.mp4");
  });
});
