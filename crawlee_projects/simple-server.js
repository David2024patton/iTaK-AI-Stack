const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Scrape endpoint
app.post('/scrape', async (req, res) => {
  const { url, selector } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  try {
    console.log(`Scraping: ${url}`);
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
      res.json({ success: true, results: [html] });
    }
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Web scraper API running on port ${PORT}`);
});
