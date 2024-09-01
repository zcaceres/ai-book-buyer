import fs from "fs";
import { HTMLParser } from "./HTMLParser";
import { Tool } from "easy-agent";

type BookFinderInputs = {
  author: string;
  title: string;
};

function formatSearchString(s: string) {
  return s.replace(/ /g, "+");
}

class BookFinder {
  private static async bookfinderFetch(url: string, wafToken: string) {
    return fetch(url, {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        pragma: "no-cache",
        priority: "u=0, i",
        "sec-ch-ua": '"Not;A=Brand";v="24", "Chromium";v="128"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        cookie: `aws-waf-token=${wafToken}`,
      },
      referrer:
        "https://www.bookfinder.com/search/?keywords=against+the+odds+james+dyson&currency=USD&destination=us&mode=basic&il=en&classic=off&lang=en&st=sh&ac=qr&submit=",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    });
  }

  private static async getInteractLink(
    inputs: BookFinderInputs,
    wafToken: string,
  ) {
    // fetch the "interact link" from author and title (https://www.bookfinder.com/interact/link/search/?author=James+Dyson&title=Against+the+Odds&lang=en)
    const interactLinkPayload = await this.bookfinderFetch(
      `https://www.bookfinder.com/interact/link/search/?author=${formatSearchString(inputs.author)}&title=${formatSearchString(inputs.title)}&lang=en`,
      wafToken,
    );
    const interactLinkHTML = await interactLinkPayload.text();
    fs.writeFileSync("debug/1-interactLinkHTML.html", interactLinkHTML);
    return HTMLParser.from(interactLinkHTML).getTitleDisambiguationLink();
  }

  private static async pause(durationMs: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, durationMs);
    });
  }

  private static async fetchUntilCached(
    interactLink: string,
    wafToken: string,
  ) {
    await this.bookfinderFetch(interactLink, wafToken);
    await this.pause(5000);
    const res = await this.bookfinderFetch(interactLink, wafToken);
    const html = await res.text();
    fs.writeFileSync("debug/2-fetchUntilCached.html", html);
    return HTMLParser.from(html).getFirstBookLink();
  }

  private static async fetchResultsPage(
    bookListLink: string,
    wafToken: string,
  ) {
    const res = await this.bookfinderFetch(bookListLink, wafToken);
    return res.text();
  }

  static async search(
    inputs: BookFinderInputs,
    wafToken: string,
  ): Promise<string> {
    const interactLink = await this.getInteractLink(inputs, wafToken);
    const bookListLink = await this.fetchUntilCached(interactLink, wafToken);
    if (!bookListLink) {
      throw new Error("No results found on booklist page!");
    }
    const result = await this.fetchResultsPage(bookListLink, wafToken);
    fs.writeFileSync("debug/3-bookfinder-results.html", result);
    return result;
  }
}

const BookFinderSearch = Tool.create({
  name: "book-finder-search",
  description:
    "Search Bookfinder.com for a list of new and used books. Format what's returned into a nicely organized list.",
  inputs: [
    {
      name: "author",
      type: "string",
      description: "the name of the author of the book",
      required: true,
    },
    {
      name: "title",
      type: "string",
      description: "the title of the book",
      required: true,
    },
  ],
  fn: async (inputs: BookFinderInputs, wafToken?: string) => {
    return BookFinder.search(
      inputs,
      wafToken ||
        "10129181-8763-44b2-988a-3b0fe3498e87:EgoAchNy6y3PAAAA:oLYmA79CZXifQTw18DMk0JNVIOxrU9HFjRKO+UFW2cW1pizwU2WHac0BpD7B3oY5US/EnfYB6bvdFv8DYA4FUv6l9rxtgMexNEVqcDnkVWgr4u3G3PzWxUbvjyTCwhaRPxuqJNVopM1VgrzAjoxuEG8dZEepNMV8/Qy+6Z+hlKcCK7h/xJr3VLtzM5/CG+CPgyO6T9dq6/iGBq0WbzVH+uKu1fanBcPMD5Q8qR6MMUn4cLcdDx6OHJes2X3uKJ8zwyWvRSnP4R/D",
    );
  },
});

export default BookFinderSearch;
