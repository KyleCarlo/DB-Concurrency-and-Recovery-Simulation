const puppeteer = require('puppeteer');
const query1 = require('../control/lib/dbs.js').query1;
const query2 = require('../control/lib/dbs.js').query2;
const query3 = require('../control/lib/dbs.js').query3;

describe('Step 2', () => {
    const ids = [
        'A3497E1AD4C71E62AFFAD4947BF12BE0',
        '8349958C2F977BB2B39ACCA84203E2FA'
    ];
    const buttonId = '#btn-2';
    const width = 1920;
    const height = 1080;
    const windowSize = '--window-size=' + width + ',' + height;
    const slowMo = 0; // in ms
    var firstLuzon;
    var firstVismin; 

    beforeAll(async ()=>{
        const browser = await puppeteer.launch({
            headless: false,
            slowMo: slowMo,
            args: [windowSize]
        });
    
        const configPage = await browser.newPage();
        await configPage.bringToFront();
        await configPage.goto('http://localhost:3000/config');
        await configPage.setViewport({width: width, height: height});    
        await configPage.click(buttonId);
    
        let page = await browser.pages();
        page = page[0];
        await page.bringToFront();
        await page.goto('http://localhost:3000/');
        await page.setViewport({width: width, height: height});    
    
        await page.click('#read');
        await page.locator('#read-input').fill(ids[0]);
        await page.click('#read-button');
        await page.waitForNetworkIdle();
        await page.locator('#read-input').fill(ids[1]);
        await page.click('#read-button');
        await page.waitForNetworkIdle();
        firstLuzon =  await query2("SELECT * FROM appointments WHERE apptid = ?", ids[0], 'READ');
        firstVismin = await query3("SELECT * FROM appointments WHERE apptid = ?", ids[1], 'READ');

        await new Promise(resolve => setTimeout(resolve, 1000));

        await configPage.bringToFront();    
        await configPage.click(buttonId);
        await configPage.waitForNetworkIdle();
    });

    it('Case 2a - Luzon Node is Down.', async () => {
        await new Promise(resolve => setTimeout(resolve, 4000));
        const centerLuzon =  await query1("SELECT * FROM appointments WHERE apptid = ?", ids[0], 'READ');
        const centerVismin = await query1("SELECT * FROM appointments WHERE apptid = ?", ids[1], 'READ');
        expect(centerLuzon).toEqual(firstLuzon);
        expect(centerVismin).toEqual(firstVismin);
    });
});

