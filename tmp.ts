// https://www.bookfinder.com/search/?author=James+Dyson&title=Against+the+Odds&lang=en&st=xl&ac=qr
// - get the href from the first <a>

// fetch that page
// - At this moment .... its a loading screen! So we probably need a way to let the javascript load

// https://www.bookfinder.com/search/?ac=sl&st=sl&qi=86LOFIt5gem9c1aFl89grzAoEDM_1725134204_1:17662:33045&bq=author%3Dkat%2520martin%26title%3Dagainst%2520the%2520odds
// https://www.bookfinder.com/search/?full=on&ac=sl&st=sl&qi=MLdy3piRUkuAJM4Y2ckrqPo2iFM_1725134454_1:6171:13860

import fs from "fs";
import { HTMLParser } from "./HTMLParser";

type BookFinderInputs = {
  author: string;
  title: string;
  wafToken: string; //
};

function formatSearchString(s: string) {
  return s.replace(/ /g, "+");
}

async function bookfinderFetch() {
  throw new Error("Not implemented");
}

async function getInteractLink(inputs: BookFinderInputs) {
  // fetch the "interact link" from author and title (https://www.bookfinder.com/interact/link/search/?author=James+Dyson&title=Against+the+Odds&lang=en)
  const interactLinkPayload = await fetch(
    `https://www.bookfinder.com/interact/link/search/?author=${formatSearchString(inputs.author)}&title=${formatSearchString(inputs.title)}&lang=en`,
    {
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
        Cookie: `aws-waf-token=${inputs.wafToken}`,
      },
      referrer:
        "https://www.bookfinder.com/search/?keywords=against+the+odds+james+dyson&currency=USD&destination=us&mode=basic&il=en&classic=off&lang=en&st=sh&ac=qr&submit=",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    },
  );
  const interactLinkHTML = await interactLinkPayload.text();

  return HTMLParser.from(interactLinkHTML);
}

async function pause(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, durationMs);
  });
}

async function fetchUntilCached(interactLink: string) {
  await fetch(interactLink);
  await pause(5000);
  const res = await fetch(interactLink, {
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
    },
    referrer:
      "https://www.bookfinder.com/search/?keywords=against+the+odds+james+dyson&currency=USD&destination=us&mode=basic&il=en&classic=off&lang=en&st=sh&ac=qr&submit=",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "include",
  });
  const html = await res.text();
  return html;
}

async function searchBookfinder(inputs: BookFinderInputs) {
  const interactLink = await getInteractLink(inputs);
  const result = await fetchUntilCached(interactLink);
  fs.writeFileSync("bf-test.html", result);
}

// async function searchBookfinder(inputs: BookFinderInputs) {
//   // find the right link in the HTML "copy this link"
//   // fetch HTML from THAT link
//   // find the url of the first result (if any)
//   // fetch the HTML from THAT link
//   // get results

//   try {
//     const res = await fetch(
//       "https://www.bookfinder.com/search/?ac=sl&st=sl&qi=JSyeZptJJVLsUHNjIIEdx38XQ1A_1725132292_1:6815:12344&bq=author%3Djames%2520dyson%26title%3Dagainst%2520the%2520odds",

//     );

//     const html = await res.text();
//     fs.writeFileSync("bookfinder.html", html);
//     console.log("TRUE?", html.includes("Dyson"));

//     return html;
//   } catch (e) {
//     console.error(e);
//   }
// }

searchBookfinder({
  author: "cal newport",
  title: "deep work",
  wafToken:
    "b3616423-96dc-494e-90e4-423c1cc67341:EgoAqz2Qh9rwAAAA:+kt3iQmDFOjqEVjHUgQBpvxtQiTJz0fJpYWuYsUnLZs7s5Ul14nVNPHOrppR17U5Bs2l9zIF4gldTvlaPQw8iLJPkJjP1r1JSbvOp6n/VUClCW9XEasKkn86+BkVnFyyrB2jtS4hM1TU0xHgC9+3MRKUNTWi6S6GFMjsfVJfQNM/E3U9dxFmP9F7v9cD/et8nBvh/o8XkPEx/UAPlqLy+VuTMg6aZBvMNj6AAE2BoGWd73s1zbcIUbB72jSnat4rDjC3BbZIUIf6",
});
