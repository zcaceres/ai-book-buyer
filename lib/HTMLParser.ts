import { JSDOM } from "jsdom";

export class HTMLParser {
  private doc: Document;

  private constructor(htmlString: string) {
    const dom = new JSDOM(htmlString);
    this.doc = dom.window.document;
  }

  public getTitleDisambiguationLink(): string {
    const anchorNodes = this.doc.querySelectorAll("blockquote a");
    // @ts-ignore
    const hrefs = Array.from(anchorNodes).map((node) => node.href);
    return hrefs[0];
  }

  public getFirstBookLink(): string | null {
    const titleElement = this.doc.querySelector(".select-titlename-top-match");

    if (titleElement) {
      const anchor = titleElement.querySelector("a");

      if (anchor && anchor.hasAttribute("href")) {
        return anchor.getAttribute("href");
      }
    }

    return null;
  }

  public getResultsText(): string {
    this.doc.querySelectorAll("script").forEach((s) => s.remove());
    this.doc.querySelectorAll("style").forEach((s) => s.remove());
    this.doc.querySelectorAll("nav").forEach((s) => s.remove());
    const textNodes = this.doc.querySelectorAll("tr");
    const textContent = Array.from(textNodes)
      .map((node) => node.textContent?.trim() || "")
      .filter((text) => text.length > 0)
      .join("\n");
    return textContent;
  }

  static from(htmlString: string) {
    return new HTMLParser(htmlString);
  }
}
