const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // I tuoi URL preferiti
  await page.goto('https://www.immobiliare.it/agenzie-immobiliari/438027/maison-prati-srl/');
  console.log('Aperto !');
  
  await browser.close();
})();
