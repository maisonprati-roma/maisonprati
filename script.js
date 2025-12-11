const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });
  
  const page = await browser.newPage();
  
  // Configura download
  const downloadPath = path.resolve('./downloads');
  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath);
  }
  
  const client = await page.createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadPath
  });
  
  // Leggi l'URL dal file scrape.json
  const config = JSON.parse(fs.readFileSync('./scrape.json', 'utf-8'));
  const targetUrl = config.url;
  
  console.log('URL da scrapare:', targetUrl);
  
  // Carica e decodifica lo scraper
  let scraperCode = fs.readFileSync('./scraper.js', 'utf8');
  scraperCode = decodeURIComponent(scraperCode);
  
  // Apri il sito
  await page.goto(targetUrl, { waitUntil: 'networkidle2' });
  console.log('Pagina caricata!');
  
  // Esegui lo scraper
  await page.evaluate(scraperCode);
  console.log('Scraping avviato!');
  
  // Attendi che appaia il messaggio "finito" nell'overlay
  await page.waitForFunction(() => {
    const status = document.querySelector('#imm-scr-status');
    return status && status.textContent.includes('finito');
  }, { timeout: 3600000 });
  
  console.log('Scraping completato!');
  
  // Attendi qualche secondo per il download
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  await browser.close();
})();
