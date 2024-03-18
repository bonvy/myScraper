import puppeteer from 'puppeteer';
import fs from 'fs'
(async () => {
    // Avvia una nuova istanza di browser
    const browser = await puppeteer.launch();
  
    // Apre una nuova pagina
    const page = await browser.newPage();
  
    // Naviga verso il sito web desiderato
    await page.goto('https://www.sportler.com/it/l/pantaloni_softshell-donna?itm_source=menu&itm_medium=link&itm_campaign=donna/pantaloni-e-gonne/pantaloni-softshell');
  
    var urls = await page.evaluate(() => {
        const elements = document.querySelectorAll('div.singleProductBoxImg a.activeVariant');
        const urls = Array.from(elements).map(element => {
          return 'https://www.sportler.com' + element.getAttribute('href');
        });
        return urls;
      });
      urls=[... new Set(urls)]
      // Stampa gli URL
      const data = { "url": urls };

      // Convertiamo l'oggetto JSON in una stringa
      const jsonData = JSON.stringify(data, null, 2);
    
      // Salva gli URL in un file JSON
      fs.appendFileSync('url.json', jsonData);
    // Chiude il browser
    await browser.close();
  })();