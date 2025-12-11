const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    dumpio: true, // Mostra i console.log della pagina
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });
  
  const page = await browser.newPage();
  
  // Ascolta i console.log dalla pagina
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  // Configura download
  const downloadPath = path.resolve('./downloads');
  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath);
  }
  
  const client = await page.createCDPSession();
  await client.send('Browser.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadPath,
    eventsEnabled: true
  });
  
  // Monitora il download
  let downloadCompleted = false;
  client.on('Browser.downloadProgress', e => {
    console.log('Download progress:', e.state, e.totalBytes || '');
    if (e.state === 'completed') {
      downloadCompleted = true;
    }
  });
  
  // Leggi l'URL dal file scrape.json
  const config = JSON.parse(fs.readFileSync('./scrape.json', 'utf-8'));
  const targetUrl = config.url;
  
  console.log('URL da scrapare:', targetUrl);
  
  // Carica e decodifica lo scraper
  let scraperCode = fs.readFileSync('./scraper.js', 'utf8');
  scraperCode = decodeURIComponent(scraperCode);
  
  // Apri il sito
  await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 60000 });
  console.log('Pagina caricata!');
  
  // Esegui lo scraper
  await page.evaluate(scraperCode);
  console.log('Scraping avviato!');
  
  // Attendi il download con timeout lungo
  const maxWait = 600000; // 10 Min
  const startTime = Date.now();
  
  while (!downloadCompleted && (Date.now() - startTime) < maxWait) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Attendendo download... elapsed:', Math.floor((Date.now() - startTime) / 1000), 'secondi');
  }
  
  if (downloadCompleted) {
    console.log('Download completato!');
  } else {
    console.log('Timeout raggiunto');
  }
  
  // Attendi altri 3 secondi per sicurezza
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await browser.close();
})();
