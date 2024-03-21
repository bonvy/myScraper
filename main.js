import fetch from "node-fetch";
import cheerio from "cheerio";

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


const date = new Date()

client.connect().then(() => console.log('Connesso al database PostgreSQL!'))
let loadUrl=[];


await client.query('SELECT url, date_sc FROM "URLS"').then(resp => resp.rows.forEach(el => loadUrl.push({url: el.url, date_sc: el.date_sc})));
let sc=loadUrl.length;
await scraperStart();
   
async function scraperStart() {

    loadUrl.forEach(async function (obj) {
        if(obj?.date_sc?.getDay()===date.getDay() && obj?.date_sc?.getMonth()===date.getMonth() && !obj.date){
            fetch(obj.url, {
                "headers": {
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "accept-language": "en-US,en;q=0.9,it-IT;q=0.8,it;q=0.7",
                    "cache-control": "max-age=0",
                    "sec-ch-ua": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Google Chrome\";v=\"122\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"macOS\"",
                    "sec-fetch-dest": "document",
                    "sec-fetch-mode": "navigate",
                    "sec-fetch-site": "same-origin",
                    "sec-fetch-user": "?1",
                    "upgrade-insecure-requests": "1"
                },
                "referrer": "https://www.sportler.com/it/l/pantaloni_sci_alpinismo-uomo?itm_source=menu&itm_medium=link&itm_campaign=uomo/pantaloni/pantaloni-scialpinismo",
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": null,
                "method": "GET",
                "mode": "cors",
                "credentials": "include"
            }).then((data) => {
                try {
                    data.text().then((html) => {
    
                        const $ = cheerio.load(html);
                        const scriptText = $('script._iub_cs_activate').text();
    
                        // Trova il valore della chiave 'value'
                        const match = scriptText.match(/value:\s*([\d.]+)/);
    
                        var oggetto = {};
                       
    
                        // Trova il prezzo attuale
                        const currentPrice = $('.prodDetailPrice .singleProductPrice span[itemprop="price"]').text().trim().replace(',', '.');
    
                        const isDiscounted = $('.singleProductPrice .bullet-rect').length > 0;
                        // Trova il prezzo precedente
                        const previousPrice = $('.singleProductPrice .prevPrice').text().trim().replace('€', '').replace(',', '.');
                        oggetto.prezzoAttuale = parseFloat(currentPrice);
                        if (isDiscounted) {
                            oggetto.prezzoIntero = parseFloat(previousPrice);
                        } else {
                            oggetto.prezzoIntero = parseFloat(currentPrice);
                        }
                        // Trova la tag title e ne estrae il testo
                        const title = $('title').text().trim();
    
                        // Estrai il testo prima del carattere "-"
                        const name = title.split(/\s+-\s+/)[0].trim();
    
    
    
                        oggetto.codice = $('#AjaxValueVariationSkuTemplate').text().trim();
                        try {
                            if (oggetto.codice) {
                                client.query("SELECT EXISTS (SELECT 1 FROM product WHERE sku = '" + oggetto.codice + "' AND date_sc = '" + date.toISOString().slice(0, 10) + "') AS entita_esiste;").then((data) => {sc--
                                    !data.rows[0].entita_esiste ? client.query('INSERT INTO product (price, pricescont ,sku, date_sc, name,store) VALUES ($1,$2,$3,$4,$5,$6)', [oggetto.prezzoIntero, oggetto.prezzoAttuale, oggetto.codice, date, name, "https://www.sportler.com/it"]) : null;
                                    client.query('SELECT * FROM "URLS" WHERE url=$1',[obj.url]).then((resp) => resp.rows.length>=1?  client.query('UPDATE "URLS" SET date_sc=$2 WHERE url=$1', [obj.url,date.toISOString()]): null  )
                                });
    
                            }else{
                                sc--;
                            }
    
                        } catch (e) {
    
                            console.log(e);
                        }
                    });
                } catch (e) { }
    
            }); 
        }else{
            sc--}

    });
}
setInterval(()=>{sc===0 ?  process.exit(): console.log(sc) },500)
