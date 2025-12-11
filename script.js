const puppeteer = require('puppeteer');

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
  
  // I tuoi URL preferiti
  await page.goto('https://www.immobiliare.it/agenzie-immobiliari/438027/maison-prati-srl/');
  console.log('Aperto Google!');
  
  await browser.close();
})();
