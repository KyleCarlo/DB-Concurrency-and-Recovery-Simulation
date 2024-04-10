const puppeteer = require('puppeteer');
const query1 = require('../control/lib/dbs.js').query1;
const query2 = require('../control/lib/dbs.js').query2;
const query3 = require('../control/lib/dbs.js').query3;

describe('Step 3', () =>{
    const ids = [
        'A3497E1AD4C71E62AFFAD4947BF12BE0',
        '8349958C2F977BB2B39ACCA84203E2FA'
    ]
    const testName = 'luzon-node-down-write-test-';
    const buttonId = '#btn-2';
    const width = 1920;
    const height = 1080;
    const windowSize = '--window-size=' + width + ',' + height;
    const slowMo = 0; // in ms

    beforeAll(async() => {
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
        
        const replicationPage = await browser.newPage();
        await replicationPage.bringToFront();
        await replicationPage.goto('http://localhost:4000');
        await replicationPage.setViewport({width: width, height: height});    
        await replicationPage.click(buttonId);
        
        const logPage = await browser.newPage();
        await logPage.bringToFront();
        await logPage.goto('http://localhost:4000/logNrecover');

        let page = await browser.pages();
        page = page[0];
        await page.bringToFront();
        await page.goto('http://localhost:3000/');
        await page.setViewport({width: width, height: height});    

        await page.click('#update');
        for (var i = 0; i < 2; i ++) {   
            for (var j = 0; j < 3; j ++) {
                await page.locator('#update-id').fill(ids[i]);
                await page.locator('#update-name').fill(testName + j);
                await page.click('#update-button');

                await new Promise(resolve => setTimeout(resolve, 250));
            }
        }

        await new Promise(resolve => setTimeout(resolve, 10000));
        
        await configPage.bringToFront();    
        await configPage.click(buttonId);
        await configPage.waitForNetworkIdle();
        await replicationPage.bringToFront();    
        await replicationPage.click(buttonId);
        await logPage.bringToFront();
    });
    
    it('Case 4a - Luzon Node is Down.', async () => {
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        const centerLuzon = await query1("SELECT * FROM appointments WHERE apptid = ?", ids[0], 'READ');
        const centerVismin = await query1("SELECT * FROM appointments WHERE apptid = ?", ids[1], 'READ');
        const luzon  = await query2("SELECT * FROM appointments WHERE apptid = ?", ids[0], 'READ');
        const vismin = await query3("SELECT * FROM appointments WHERE apptid = ?", ids[1], 'READ');

        expect(centerLuzon).toEqual(luzon);
        expect(centerVismin).toEqual(vismin);
    });
});
