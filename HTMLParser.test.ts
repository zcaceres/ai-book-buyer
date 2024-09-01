import { describe, beforeAll, expect, it } from "bun:test";

import { HTMLParser } from "./HTMLParser";
import fs from "fs";
import path from "path";

describe("HTMLParser", () => {
  let htmlContent: string;

  beforeAll(() => {
    // Read the HTML file
    const filePath = path.join(__dirname, "newport.html");
    htmlContent = fs.readFileSync(filePath, "utf-8");
  });

  it("should extract the first href from the HTML", () => {
    const result = HTMLParser.from(htmlContent);

    // The expected href is the first link in the HTML file
    const expectedHref =
      "https://www.bookfinder.com/search/?author=Deep+Work&title=Cal+Newport&lang=en&st=xl&ac=qr";

    expect(result).toBe(expectedHref);
  });

  it("should return undefined if no links are found", () => {
    const htmlWithNoLinks = "<html><body><p>No links here</p></body></html>";
    const result = HTMLParser.from(htmlWithNoLinks);

    expect(result).toBeUndefined();
  });

  it("should handle empty HTML string", () => {
    const result = HTMLParser.from("");

    expect(result).toBeUndefined();
  });
});
