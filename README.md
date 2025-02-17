# Scope Search

> The fast, free, self-hosted SERP solution, built for AI and LLMs.

## How Scope Works

Instead of opening a new headless browser every time, **Scope Server** keeps a browser process open. Then, when it receives POST requests to the endpoint, it's able to quickly fire up a search request and return your results.

The `scope-search` NPM module makes calling Scope Server a breeze. [Try it out now.](#installing-scope)

## Why Scope

Scope is the perfect SERP API to use as a tool for your LLMs during local development.

- **⚡ Speedy**: Scope Server is more than **3x faster** than a standard headless browser solution [^1]
- **💰 Free**: Powered by web scraping, get SERP results **without paying a cent**
- **🔄 Dynamic**: Relies on **relative selectors** to prevent UI refreshes from breaking Scope

> Currently Scope only supports DuckDuckGo. Future updates will enable more search engines and more options.

## Installing Scope

Install with NPM, or your favorite package manager:

```bash
npm i scope-search
```

This will give you access to the `scope` CLI to start Scope Server, as well as the Scope Search NPM module.

## Starting Scope Server

Run the following command to start Scope Server at port `3000`.

```bash
scope
```

Or, provide a parameter to start it at any port.

```bash
scope --port 1234
```

This will start a headless browser instance in the background. Quit out of the command to stop the instance at any time.

Now you're ready to send your first Scope Search request!

## Using Scope Search in JS

We recommend using the NPM module to access Scope. You can also [directly send POST requests](#using-scope-search-rest-api), however.

Here's a basic example of Scope's JS package:

```js
import Scope from "scope-search";

let scope = new Scope(3000);
console.log(await scope.search("hello world"));
```

1. Start by importing `scope-search`
2. Then, construct a `Scope` object, which takes a port parameter
3. Now, call the async `Scope.search()` method with your query to get your search results

## Output Format

Here's what the output looks like.
It'll be a list of objects, each with the `href` of the result, the `name` of the website its coming from, as well as the `title` of the specific webpage its linking to.

```js
[
	{
		title: "Telescope - Wikipedia",
		name: "Wikipedia",
		href: "https://en.wikipedia.org/wiki/Telescope",
	},
	{
		title: "Telescope | History, Types, & Facts | Britannica",
		name: "Britannica",
		href: "https://www.britannica.com/science/optical-telescope",
	},
	{
		title: "How Do Telescopes Work? | NASA Space Place - NASA Science for Kids",
		name: "NASA Space Place",
		href: "https://spaceplace.nasa.gov/telescopes/en/",
	},
];
```

## Using Scope Search REST API

You can simply send a JSON object of this format to your endpoint at `/search` like `localhost:3000/search`:

```json
{ "query": "your query" }
```

Here's what an example `curl` command may look like:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"query": "your search query"}' http://localhost:3000/search
```

[^1]: ## Speed Test

    Tests run with `hyperfine --runs 2 "bun standard.js" "bun scope.js" --show-output`. Limited to 2 runs to prevent suspicious activity detection by remote server. Output shown to verify all runs successfully returned results. The output has been omitted in the benchmark results. Scope server started in separate process.

    ### Hyperfine Results:

    ```
    Benchmark 1: bun standard.js
    [...]
        Time (mean ± σ):      2.472 s ±  0.967 s    [User: 1.370 s, System: 0.610 s]
        Range (min … max):    1.789 s …  3.155 s    2 runs

    Benchmark 2: bun scope.js
    [...]
        Time (mean ± σ):      1.044 s ±  0.169 s    [User: 0.012 s, System: 0.007 s]
        Range (min … max):    0.925 s …  1.164 s    2 runs

    Summary
        bun scope.js ran
            2.37 ± 1.00 times faster than bun standard.js
    ```

    ### `scope.js`

    ```js
    import Scope from "./index.js";

    let scope = new Scope();
    console.log(await scope.search("hello world"));
    ```

    ### `standard.js`

    ```js
    import * as cheerio from "cheerio";
    import puppeteer from "puppeteer";
    import UserAgent from "user-agents";
    import { writeFile } from "fs/promises";

    const userAgent = new UserAgent({ deviceCategory: "desktop" });

    const query = "hello world";
    const URL = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    const browser = await puppeteer.launch({
    	args: [
    		"--no-sandbox",
    		"--disable-setuid-sandbox",
    		"--disable-blink-features=AutomationControlled",
    	],
    	defaultViewport: null,
    });

    const page = await browser.newPage();
    await page.setUserAgent(userAgent.random().toString());
    await page.goto(URL);
    await page.waitForSelector("a");
    const htmlContent = await page.content();

    const $ = cheerio.load(htmlContent);

    const results = [];

    $('ol.react-results--main > li[data-layout="organic"] article').each(
    	(index, element) => {
    		const article = $(element);

    		const title = article.find("h2 a span").text();
    		const name = article.find("div:nth-of-type(2) > div > div > p").text();
    		const href = article.find("h2 a").attr("href");

    		results.push({ title, name, href });
    	}
    );

    console.log(results);

    await writeFile("output.html", htmlContent);

    browser.close();
    ```
