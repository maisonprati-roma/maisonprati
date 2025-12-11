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
  
  // Carica e decodifica lo scraper
  let scraperCode = fs.readFileSync('./scraper.js', 'utf8');
  scraperCode = decodeURIComponent(scraperCode);
  
  // Apri il sito
  await page.goto('https://www.immobiliare.it/agenzie-immobiliari/438027/maison-prati-srl/', { waitUntil: 'networkidle2' });
  console.log('Pagina caricata!');
  
  // Esegui lo scraper
  await page.evaluate(scraperCode);
  console.log('Scraping avviato!');
  
  // Attendi completamento
  await page.waitForTimeout(600000);
  
  console.log('Scraping completato!');
  await browser.close();
})();
