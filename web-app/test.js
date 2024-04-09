const puppeteer = require('puppeteer');
jest.setTimeout(60*1000);


it('browser', async () => {
    const ids = [
        'A3497E1AD4C71E62AFFAD4947BF12BE0',
        '8349958C2F977BB2B39ACCA84203E2FA'
    ]

    const width = 1920;
    const height = 1080;
    const windowSize = '--window-size=' + width + ',' + height;
    console.log(windowSize)

    browser = await puppeteer.launch({
        headless: false,
        slowMo: 0,
        args: [windowSize]
    });
    
    let pages = [
        [   // luzon node
            await browser.newPage(),
            await browser.newPage()
        ],
        [   // vismin node
            await browser.newPage(),
            await browser.newPage()
        ]
    ]

    for (i = 0; i < 2; i++) {
        for (j = 0; j < 2; j++) {
            await pages[i][j].goto('http://localhost:3000/');
            await pages[i][j].setViewport({width: width, height: height});
            await pages[i][j].bringToFront();
            await pages[i][j].click('#read');
        }
    }
    await pages[1][1].waitForNetworkIdle({idleTime: 100});
    
	for (i = 0; i < 2; i++) {
        for (j = 0; j < 2; j++) {
            await pages[i][j].bringToFront();
            await pages[i][j].locator('#read-input').fill(ids[i]);
        }
    }
	for (i = 0; i < 2; i++) {
        for (j = 0; j < 2; j++) {
            await pages[i][j].bringToFront();
            await pages[i][j].click('#read-button');
        }
    }

    
    //await pages[0][0].click('button');



	//await browser.close();
});
