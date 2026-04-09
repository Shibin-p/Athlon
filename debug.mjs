import puppeteer from 'puppeteer';

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
        
        await page.goto('http://localhost:5175', { waitUntil: 'domcontentloaded', timeout: 5000 });
        await new Promise(r => setTimeout(r, 2000));
        const content = await page.evaluate(() => document.getElementById('root')?.innerHTML);
        console.log('ROOT CONTENT:', content);
        await browser.close();
    } catch (e) {
        console.error("Puppeteer Script Error:", e.message);
        process.exit(1);
    }
})();
