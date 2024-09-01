import { describe, beforeAll, expect, it } from "bun:test";

import { HTMLParser } from "./HTMLParser";
import fs from "fs";
import path from "path";

describe("HTMLParser", () => {
  it("should extract the href for the the results page", () => {
    const filePath = path.join(__dirname, "../testing/1-newport.html");
    let htmlContent = fs.readFileSync(filePath, "utf-8");
    const result = HTMLParser.from(htmlContent).getTitleDisambiguationLink();

    // The expected href is the first link in the HTML file
    const expectedHref =
      "https://www.bookfinder.com/search/?author=Deep+Work&title=Cal+Newport&lang=en&st=xl&ac=qr";

    expect(result).toBe(expectedHref);
  });

  it("should extract the top hit from the results page", () => {
    const filePath = path.join(__dirname, "../testing/2-newport.html");
    let htmlContent = fs.readFileSync(filePath, "utf-8");
    const result = HTMLParser.from(htmlContent).getFirstBookLink();

    // The expected href is the first link in the HTML file
    const expectedHref =
      "https://www.bookfinder.com/search/?ac=sl&st=sl&ref=bf_s2_a1_t1_1&qi=94KpwJHlYJxhdusvAWOVqKwEjko_1725206951_1:24061:48157&bq=author%3Dcal%2520newport%26title%3Ddeep%2520work%2520rules%2520for%2520focused%2520success%2520in%2520a%2520distracted%2520world";

    expect(result).toBe(expectedHref);
  });

  it("should extract text from the final list of results", () => {
    const filePath = path.join(__dirname, "../testing/3-newport.html");
    let htmlContent = fs.readFileSync(filePath, "utf-8");
    const result = HTMLParser.from(htmlContent).getResultsText();

    const resultsPath = path.join(__dirname, "../testing/book-results.html");
    const expectedResults = fs.readFileSync(resultsPath, "utf-8");

    expect(result).toBe(expectedResults);
  });

  it("should return undefined if no links are found", () => {
    const htmlWithNoLinks = "<html><body><p>No links here</p></body></html>";
    const result =
      HTMLParser.from(htmlWithNoLinks).getTitleDisambiguationLink();

    expect(result).toBeUndefined();
  });

  it("should handle empty HTML string", () => {
    const result = HTMLParser.from("").getFirstBookLink();

    expect(result).toBeNull();
  });
});
