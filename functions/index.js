const functions = require('firebase-functions');
const puppeteer = require("puppeteer");

let browserPromise = puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    headless: false
}).catch("Failed to start Chrome");


exports.secavis = functions.runWith({
    timeoutSeconds: 120,
    memory: '1GB'
}).https.onRequest(async (req, res) => {
    const spi = req.query.spi;
    const num_facture = req.query.num_facture;

    try {
        const browser = await browserPromise;
        const context = await browser.createIncognitoBrowserContext();
        var page = await context.newPage();
        await page.goto(`https://www.impots.gouv.fr/verifavis/`);
        await page.$eval('input[name="j_id_7:spi"]', (el, spi) => el.value = spi, spi);
        await page.$eval('input[name="j_id_7:num_facture"]', (el, num_facture) => el.value = num_facture, num_facture);
        await page.$eval('input[name="j_id_7:j_id_l"]', el => el.click());

        let handles = await page.$$('.titre_affiche_avis');

        const jsonResult = await page.$$eval('table tr', rows => {
            return rows.reduce((object, row) => {
                const columns = row.querySelectorAll('td');
                object[columns[0].innerText] = columns[1] && columns[1].innerText;
                return object
            }, {});
        });

        res.send({
            result: jsonResult
        });
        context.close();

    }
    catch (error) {
        console.error("An error occured.");
        console.error(error);
        return res.status(500).send(error);
    }
});
