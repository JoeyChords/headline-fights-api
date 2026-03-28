export class Article {
  url: string;
  headline: string;
  imgURL: string;
  videoURL: string;
  publication: string;

  constructor(url: string, headline: string, imgURL: string, videoURL: string, publication: string) {
    this.url = url;
    this.headline = headline;
    this.imgURL = imgURL;
    this.videoURL = videoURL;
    this.publication = publication;
  }
}
