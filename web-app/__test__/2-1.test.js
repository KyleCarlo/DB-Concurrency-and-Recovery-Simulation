const puppeteer = require('puppeteer');
const query1 = require('../control/lib/dbs.js').query1;

describe('Step 2', () => {
    const ids = [
        'A3497E1AD4C71E62AFFAD4947BF12BE0',
        '8349958C2F977BB2B39ACCA84203E2FA'
    ];

    var queryLuzon;
    var queryVismin;
    
    beforeAll(async () => {
        queryLuzon  = await query1("SELECT * FROM appointments WHERE apptid = ?", ids[0], 'READ');
        queryVismin = await query1("SELECT * FROM appointments WHERE apptid = ?", ids[1], 'READ');
        const width = 1280;
        const height = 720;
        const windowSize = '--window-size=' + width + ',' + height;
        const slowMo = 0; // in ms
        const browserConfig = {
            headless: false,
            slowMo: slowMo,
            args: [windowSize]
        }
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
                await pages[i][j].click('#read');
                await pages[i][j].locator('#read-input').fill(ids[i]);
            }
        }

        await new Promise(resolve => setTimeout(resolve, 4000));
        
        pages[0][0].click('#read-button');
        pages[0][1].click('#read-button');
        pages[1][0].click('#read-button');
        pages[1][1].click('#read-button');
        
        await pages[1][1].waitForNetworkIdle(200);
        await new Promise(resolve => setTimeout(resolve, 4000));
        browsers[0].close();
        browsers[1].close();
        browsers[2].close();
        browsers[3].close();
    });
    
    it('Case 1, Read-Read Concurrency Test.', async () => {
        expect(await query1("SELECT * FROM appointments WHERE apptid = ?", ids[0], 'READ')).toEqual(queryLuzon);
        expect(await query1("SELECT * FROM appointments WHERE apptid = ?", ids[1], 'READ')).not.toEqual(queryLuzon);
        expect(await query1("SELECT * FROM appointments WHERE apptid = ?", ids[1], 'READ')).toEqual(queryVismin);
        expect(await query1("SELECT * FROM appointments WHERE apptid = ?", ids[0], 'READ')).not.toEqual(queryVismin);
    });
});
