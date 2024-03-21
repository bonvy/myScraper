import puppeteer from 'puppeteer';
import CryptoJS from 'crypto-js';
import pkg from 'pg';
const { Client } = pkg
// Configura le credenziali di accesso al database
const client = new Client({
    user: 'postgres', // Nome utente del database
    host: 'localhost', // Indirizzo del server PostgreSQL
    database: 'postgres', // Nome del database
    password: 'root', // Password del database
    port: 5432 // Porta di default di PostgreSQL
});
let sc;
client.connect()
    .then(() => console.log('Connesso al database PostgreSQL!'));
(async () => {
    // Avvia una nuova istanza di browser
    const browser = await puppeteer.launch();

    // Apre una nuova pagina
    const page = await browser.newPage();

    // Naviga verso il sito web desiderato
    await page.goto('https://www.sportler.com/it/l/calzini-donna?open=filterSports&itm_source=menu&itm_medium=link&itm_campaign=donna/intimo-e-accessori/calzini');
 
    var urls = await page.evaluate(() => {
        const elements = document.querySelectorAll('div.singleProductBoxImg a.activeVariant');
        const urls = Array.from(elements).map(element => {
            return 'https://www.sportler.com' + element.getAttribute('href').trim();
        });
        return urls;
    });
    urls = [... new Set(urls)]
    // Stampa gli URL
    sc=urls.length;
    urls.forEach(url => {
        const hashValue = CryptoJS.SHA256(rimuoviSpaziBianchi(url))
       
        client.query('SELECT COUNT(url) AS numb FROM "URLS" WHERE url=$1',[url]).then((resp) => resp.rows[0].numb!=='1' ?  client.query('INSERT INTO "URLS" (url) VALUES($1)', [rimuoviSpaziBianchi(url)]): null,sc--)
       
    });
    // Chiude il browser
    setInterval(()=> sc===0? process.exit():null )
    await browser.close();
})();



function rimuoviSpaziBianchi(stringa) {
    // Utilizziamo una espressione regolare per sostituire tutti gli spazi bianchi con una stringa vuota
    let str= stringa.replace(/\s+/g, '');
    return str.replace(/\t/g,'');
}

