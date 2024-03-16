import fetch from "node-fetch";
import cheerio from "cheerio";
import fs from 'fs';
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

const loadUrl = JSON.parse(fs.readFileSync('./url.json', { encoding: 'utf8' }));
const date = new Date()
client.connect()
    .then(() => console.log('Connesso al database PostgreSQL!'))

loadUrl.url.forEach(async function (url) {
    fetch(url, {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "en-US,en;q=0.9,it-IT;q=0.8,it;q=0.7",
        }

    }).then((data) => {
        data.text().then((html) =>{
            const $ = cheerio.load(html)
        const scriptText = $('script._iub_cs_activate').text();

        // Trova il valore della chiave 'value'
        const match = scriptText.match(/value:\s*([\d.]+)/);

        var oggetto = {}
        const priceText = $('.singleProductPrice .prevPrice').text();
        // Estrai il numero
        // Estrai il numero intero e i decimali dopo la virgola
        const match1 = priceText.match(/(\d{1,3}(,\d{3})*(\.\d{2})?)/);
        const prezzoAttuale = match ? match[1] : null;
        // Estrai il numero
        const prezzoIntero = match1 ? match1[0] : null;
        const match2 = url.match(/(\d+)\?/);
        const codice = match2 ? match2[1] : null;

        oggetto.prezzoAttuale = parseFloat(prezzoAttuale);
        oggetto.prezzoIntero = parseFloat(prezzoIntero);
        oggetto.codice = codice;
        try {
            client.query('INSERT INTO product (price, pricescont ,id, date_sc) VALUES ($1,$2,$3,$4)', [oggetto.prezzoIntero, oggetto.prezzoAttuale, oggetto.codice, date])
        } catch (e) {

            console.log(e)
        }
        });
        
    });




});


