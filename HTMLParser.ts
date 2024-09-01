import { JSDOM } from "jsdom";

export class HTMLParser {
  private doc: Document;

  private constructor(htmlString: string) {
    const dom = new JSDOM(htmlString);
    this.doc = dom.window.document;
  }

  getText(): string {
    const anchorNodes = this.doc.querySelectorAll("blockquote a");
    // @ts-ignore
    const hrefs = Array.from(anchorNodes).map((node) => node.href);
    return hrefs[0];
  }

  static from(htmlString: string): string {
    return new HTMLParser(htmlString).getText();
  }
}
