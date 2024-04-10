const puppeteer = require('puppeteer');
const query = require('../control/lib/dbs.js').query1
jest.setTimeout(60000);


it('read write concurrency test', async () => {
    const ids = [
        'A3497E1AD4C71E62AFFAD4947BF12BE0',
        '8349958C2F977BB2B39ACCA84203E2FA'
    ]
    const queryLuzon  = await query("SELECT * FROM appointments WHERE apptid = ?", ids[0], 'READ');
    const queryVismin = await query("SELECT * FROM appointments WHERE apptid = ?", ids[1], 'READ');
    const testName = 'read-write test1';

    const width = 1920;
    const height = 1080;
    const windowSize = '--window-size=' + width + ',' + height;
    const slowMo = 0; // in ms
    const browsers = [
        await puppeteer.launch({
            headless: false,
            slowMo: slowMo,
            args: [windowSize]
        }),
        await puppeteer.launch({
            headless: false,
            slowMo: slowMo,
            args: [windowSize]
        }),
        await puppeteer.launch({
            headless: false,
            slowMo: slowMo,
            args: [windowSize]
        }),
        await puppeteer.launch({
            headless: false,
            slowMo: slowMo,
            args: [windowSize]
        })
    ];
    
    let pages = [
        [   // luzon node
            await browsers[0].pages(),
            await browsers[1].pages()
        ],
        [   // vismin node
            await browsers[2].pages(),
            await browsers[3].pages()
        ]
    ]
    pages = [ // idk why browsers[0].pages()[0] does not work to select blank page
        [
            pages[0][0][0],
            pages[0][1][0]
        ],
        [
            pages[1][0][0],
            pages[1][1][0]
        ],
    ]
    for (var i = 0; i < 2; i++) {
        for (var j = 0; j < 2; j++) {
            await pages[i][j].goto('http://localhost:3000/');
            await pages[i][j].setViewport({width: width, height: height});
            if (j == 0) {
                await pages[i][j].click('#read');
                await pages[i][j].locator('#read-input').fill(ids[i]);
            }
            else {
                await pages[i][j].click('#update');
                await pages[i][j].locator('#update-id').fill(ids[i]);
                await pages[i][j].locator('#update-name').fill(testName);
            }
        }
    }
    setTimeout(function() {
        pages[0][1].click('#update-button');
        pages[0][0].click('#read-button');
        pages[1][1].click('#update-button');
        pages[1][0].click('#read-button');
    },  4000);
    await pages[1][1].waitForNetworkIdle(200);

    setTimeout(async function() {
        await browsers[0].close();
        await browsers[1].close();
        await browsers[2].close();
        await browsers[3].close();
        
        
        var latestQueryLuzon = await query('SELECT * FROM appointments WHERE apptid = ?', ids[0], 'READ');
        var latestQueryVismin = await query('SELECT * FROM appointments WHERE apptid = ?', ids[1], 'READ');
        var newQueryLuzon = queryLuzon;
        var newQueryVismin = queryVismin;
        console.log(await query("SELECT * FROM appointments WHERE apptid = ?", ids[0], 'READ'));
        
        newQueryLuzon[0].hospitalname = testName;
        newQueryVismin[0].hospitalname = testName;
        
        expect(latestQueryLuzon).not.toEqual(queryLuzon);
        expect(latestQueryVismin).not.toEqual(queryVismin);
        
        console.log(latestQueryLuzon);
        console.log(newQueryLuzon);
        expect(latestQueryLuzon).toEqual(newQueryLuzon);
        expect(latestQueryVismin).toEqual(newQueryVismin);
    }, 4000);
});