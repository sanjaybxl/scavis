const puppeteer = require("puppeteer");
const chalk = require("chalk");
var fs = require("fs");

// MY OCD of colorful console.logs for debugging... IT HELPS
const error = chalk.bold.red;

(async () => {
    try {
        // open the headless browser
        var browser = await puppeteer.launch({ headless: false });
        // open a new page
        var page = await browser.newPage();
        // enter url in page
        await page.goto(`https://www.impots.gouv.fr/verifavis/`);
        await page.$eval('input[name="j_id_7:spi"]', el => el.value = '1068244073106');
        await page.$eval('input[name="j_id_7:num_facture"]', el => el.value = '19A8033832930');
        await page.$eval('input[name="j_id_7:j_id_l"]', el => el.click());

        let handles = await page.$$('.titre_affiche_avis');

        const jsonResult = await page.$$eval('table tr', rows => {
            return rows.reduce((object, row) => {
                const columns = row.querySelectorAll('td');
                object[columns[0].innerText] = columns[1] && columns[1].innerText;
                return object
            }, {});
        });

        console.log(jsonResult);
        await browser.close();

    } catch (err) {
        // Catch and display errors
        console.log(error(err));
        await browser.close();
        console.log(error("Browser Closed"));
    }
})();

