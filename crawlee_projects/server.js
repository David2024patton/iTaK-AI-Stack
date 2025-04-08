const express = require('express');
const bodyParser = require('body-parser');
const { PlaywrightCrawler, Dataset } = require('crawlee');
const { chromium } = require('playwright');
const cheerio = require('cheerio');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

// Basic scraping with Axios and Cheerio (for simple pages)
app.post('/scrape/basic', async (req, res) => {
  const { url, selector } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    console.log(`Basic scraping: ${url}`);
    const response = await axios.get(url);
    const html = response.data;

    if (selector) {
      const $ = cheerio.load(html);
      const results = [];

      $(selector).each((i, el) => {
        results.push($(el).text().trim());
      });

      res.json({ success: true, results });
    } else {
      res.json({ success: true, html: html.substring(0, 1000) + '...' });
    }
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// Advanced scraping with Playwright (for JavaScript-heavy pages)
app.post('/scrape/advanced', async (req, res) => {
  const { url, selector, actions, waitFor } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    console.log(`Advanced scraping: ${url}`);

    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle' });

    // Wait for specific element if requested
    if (waitFor) {
      await page.waitForSelector(waitFor, { timeout: 10000 }).catch(() => {});
    }

    // Perform actions if requested
    if (actions && Array.isArray(actions)) {
      for (const action of actions) {
        if (action.type === 'click' && action.selector) {
          await page.click(action.selector).catch(e => console.error(`Click error: ${e.message}`));
          await page.waitForTimeout(1000); // Wait for any reactions
        } else if (action.type === 'type' && action.selector && action.text) {
          await page.fill(action.selector, action.text).catch(e => console.error(`Fill error: ${e.message}`));
        } else if (action.type === 'wait' && action.ms) {
          await page.waitForTimeout(action.ms);
        }
      }
    }

    // Extract data
    let results = [];

    if (selector) {
      results = await page.$$eval(selector, elements =>
        elements.map(el => el.textContent.trim())
      ).catch(() => []);
    } else {
      // Get page content if no selector
      const content = await page.content();
      results = [content.substring(0, 1000) + '...'];
    }

    await browser.close();

    res.json({ success: true, results });
  } catch (error) {
    console.error(`Error with Playwright scraping ${url}:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// Full crawling with Crawlee (for multiple pages)
app.post('/scrape/crawl', async (req, res) => {
  const { url, selector, maxPages } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    console.log(`Crawling: ${url}, max pages: ${maxPages || 'unlimited'}`);

    // Create a unique ID for this crawl
    const crawlId = Date.now().toString();
    const dataset = await Dataset.open(crawlId);

    const crawler = new PlaywrightCrawler({
      maxRequestsPerCrawl: maxPages || 10, // Default to 10 pages max
      async requestHandler({ page, request, enqueueLinks }) {
        console.log(`Processing: ${request.url}`);

        // Wait for the page to load
        await page.waitForLoadState('networkidle');

        let pageData = {
          url: request.url,
          title: await page.title(),
        };

        // Extract data if selector provided
        if (selector) {
          pageData.results = await page.$$eval(selector, elements =>
            elements.map(el => el.textContent.trim())
          ).catch(() => []);
        } else {
          // Get meta description as a fallback
          pageData.description = await page.$eval('meta[name="description"]', el => el.getAttribute('content'))
            .catch(() => 'No description available');
        }

        // Save the data
        await dataset.pushData(pageData);

        // Find links and enqueue them
        await enqueueLinks();
      },
    });

    // Start the crawler and wait for it to finish
    await crawler.run([url]);

    // Get the results
    const data = await dataset.getData();
    res.json({ success: true, results: data.items });

    // Clean up
    await Dataset.destroy(crawlId);
  } catch (error) {
    console.error(`Error crawling ${url}:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// Main scrape endpoint that chooses the appropriate method
app.post('/scrape', async (req, res) => {
  const { url, selector, mode, actions, waitFor, maxPages } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Choose the appropriate scraping method based on mode
  if (mode === 'crawl') {
    // Forward to crawl endpoint
    req.url = '/scrape/crawl';
    app._router.handle(req, res);
  } else if (mode === 'advanced' || actions || waitFor) {
    // Forward to advanced endpoint
    req.url = '/scrape/advanced';
    app._router.handle(req, res);
  } else {
    // Default to basic scraping
    req.url = '/scrape/basic';
    app._router.handle(req, res);
  }
});

// Create a simple HTML documentation page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Web Scraper API</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #4a6cf7; }
        h2 { color: #4a6cf7; margin-top: 30px; }
        pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
        code { background: #f5f5f5; padding: 2px 5px; border-radius: 3px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <h1>Web Scraper API</h1>
      <p>This API provides web scraping capabilities with three different modes:</p>

      <h2>Endpoints</h2>
      <table>
        <tr>
          <th>Endpoint</th>
          <th>Description</th>
        </tr>
        <tr>
          <td><code>GET /health</code></td>
          <td>Health check endpoint</td>
        </tr>
        <tr>
          <td><code>POST /scrape</code></td>
          <td>Main scraping endpoint (auto-selects the appropriate method)</td>
        </tr>
        <tr>
          <td><code>POST /scrape/basic</code></td>
          <td>Basic scraping with Axios and Cheerio</td>
        </tr>
        <tr>
          <td><code>POST /scrape/advanced</code></td>
          <td>Advanced scraping with Playwright</td>
        </tr>
        <tr>
          <td><code>POST /scrape/crawl</code></td>
          <td>Full website crawling with Crawlee</td>
        </tr>
      </table>

      <h2>Example Usage</h2>
      <h3>Basic Scraping</h3>
      <pre>
{
  "url": "https://example.com",
  "selector": "h1, p"
}
      </pre>

      <h3>Advanced Scraping with Actions</h3>
      <pre>
{
  "url": "https://example.com",
  "selector": ".content",
  "mode": "advanced",
  "waitFor": ".loaded",
  "actions": [
    { "type": "click", "selector": ".load-more" },
    { "type": "wait", "ms": 1000 },
    { "type": "type", "selector": "input[name=search]", "text": "search term" }
  ]
}
      </pre>

      <h3>Website Crawling</h3>
      <pre>
{
  "url": "https://example.com",
  "selector": "h1",
  "mode": "crawl",
  "maxPages": 5
}
      </pre>

      <h2>n8n Integration</h2>
      <p>To use this scraper with n8n:</p>
      <ol>
        <li>Add an HTTP Request node</li>
        <li>Set method to POST</li>
        <li>Set URL to <code>http://webscrapyd:5000/scrape</code></li>
        <li>Set Body to JSON and include the appropriate parameters</li>
      </ol>
    </body>
    </html>
  `);
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Web scraper API running on port ${PORT}`);
  console.log(`Documentation available at http://localhost:${PORT}/`);
});
