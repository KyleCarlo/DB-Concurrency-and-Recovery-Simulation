// 
// IMPORTANT NOTE:
// CHANGE TEST NAME FOR EVERY TEST RUN
//

const puppeteer = require('puppeteer');
const query1 = require('../control/lib/dbs.js').query1;

describe('Step 2', () => {
    const ids = [
        'A3497E1AD4C71E62AFFAD4947BF12BE0',
        '8349958C2F977BB2B39ACCA84203E2FA'
    ];

    var queryLuzon;
    var queryVismin;
    var latestQueryLuzon;
    var latestQueryVismin
    var newQueryLuzon;
    var newQueryVismin;
    
    const testName = 'read-write test';

    const width = 1920;
    const height = 1080;
    const windowSize = '--window-size=' + width + ',' + height;
    const slowMo = 0;
    const browserConfig = {
        headless: false,
        slowMo: slowMo,
        args: [windowSize]
    };

    beforeAll(async () => {
        queryLuzon  = await query1("SELECT * FROM appointments WHERE apptid = ?", ids[0], 'READ');
        queryVismin = await query1("SELECT * FROM appointments WHERE apptid = ?", ids[1], 'READ');
        newQueryLuzon = await query1("SELECT * FROM appointments WHERE apptid = ?", ids[0], 'READ');
        newQueryVismin = await query1("SELECT * FROM appointments WHERE apptid = ?", ids[1], 'READ');
        newQueryLuzon[0].hospitalname = testName;
        newQueryVismin[0].hospitalname = testName;

        const browsers = [
            await puppeteer.launch(browserConfig),
            await puppeteer.launch(browserConfig),
            await puppeteer.launch(browserConfig),
            await puppeteer.launch(browserConfig)
        ];
        
        const pages = [
            [   // luzon node
                (await browsers[0].pages())[0],
                (await browsers[1].pages())[0]
            ],
            [   // vismin node
                (await browsers[2].pages())[0],
                (await browsers[3].pages())[0]
            ]
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
        await new Promise(resolve => setTimeout(resolve, 4000));
        pages[0][1].click('#update-button');
        pages[0][0].click('#read-button');
        pages[1][1].click('#update-button');
        pages[1][0].click('#read-button');
        await pages[1][1].waitForNetworkIdle(200);
        await new Promise(resolve => setTimeout(resolve, 4000));

        browsers[0].close();
        browsers[1].close();
        browsers[2].close();
        browsers[3].close();
        
        

    });
    
    it('Case 2, Read-Write Concurrency Test.', async () => {
        latestQueryLuzon = await query1('SELECT * FROM appointments WHERE apptid = ?', ids[0], 'READ');
        latestQueryVismin = await query1('SELECT * FROM appointments WHERE apptid = ?', ids[1], 'READ');

        expect(latestQueryLuzon).not.toEqual(queryLuzon);
        expect(latestQueryVismin).not.toEqual(queryVismin);
        expect(latestQueryLuzon).toEqual(newQueryLuzon);
        expect(latestQueryVismin).toEqual(newQueryVismin);
    });
});