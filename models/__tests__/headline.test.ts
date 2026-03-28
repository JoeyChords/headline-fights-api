import { describe, it, expect } from "vitest";
import { Headline } from "../headline";

describe("Headline model", () => {
  it("stores headline field", () => {
    const doc = new Headline({ headline: "Test Headline" });
    expect(doc.headline).toBe("Test Headline");
  });

  it("stores publication field", () => {
    const doc = new Headline({ publication: "The Guardian" });
    expect(doc.publication).toBe("The Guardian");
  });

  it("stores article_url field", () => {
    const doc = new Headline({ article_url: "https://example.com/story" });
    expect(doc.article_url).toBe("https://example.com/story");
  });

  it("stores photo_source_url field", () => {
    const doc = new Headline({ photo_source_url: "https://example.com/img.jpg" });
    expect(doc.photo_source_url).toBe("https://example.com/img.jpg");
  });

  it("stores video_source_url field", () => {
    const doc = new Headline({ video_source_url: "https://example.com/vid.mp4" });
    expect(doc.video_source_url).toBe("https://example.com/vid.mp4");
  });

  it("stores times_correctly_chosen and times_incorrectly_chosen", () => {
    const doc = new Headline({ times_correctly_chosen: 5, times_incorrectly_chosen: 2 });
    expect(doc.times_correctly_chosen).toBe(5);
    expect(doc.times_incorrectly_chosen).toBe(2);
  });

  it("stores nested bias_attributes fields", () => {
    const doc = new Headline({
      bias_attributes: { sensationalism_true: 3, sensationalism_false: 1 },
    });
    expect(doc.bias_attributes?.sensationalism_true).toBe(3);
    expect(doc.bias_attributes?.sensationalism_false).toBe(1);
  });
});
