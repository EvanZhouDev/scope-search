#!/usr/bin/env node

import * as cheerio from 'cheerio';
import puppeteer from "puppeteer";
import UserAgent from "user-agents";
import express from 'express';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));
const port = argv.port ? parseInt(argv.port, 10) : 3000;

let userAgent = new UserAgent({ deviceCategory: "desktop" });
const app = express();
app.use(express.json());

const browser = await puppeteer.launch({
    args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
    ],
    defaultViewport: null,
    headless: true
});

app.post('/search', async (req, res) => {
    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ error: "Missing query in request body." });
    }

    const page = await browser.newPage();
    await page.setUserAgent(userAgent.random().toString());
    await page.goto(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`);
    await page.waitForSelector('a');
    const htmlContent = await page.content();

    const $ = cheerio.load(htmlContent);
    const results = [];

    $('ol.react-results--main > li[data-layout="organic"] article').each((_, element) => {
        const article = $(element);
        const title = article.find('h2 a span').text();
        const name = article.find('div:nth-of-type(2) > div > div > p').text();
        const href = article.find('h2 a').attr('href');
        results.push({ title, name, href });
    });

    await page.close();
    return res.json({ results });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});