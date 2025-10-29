const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const requests = [];
  page.on('request', req => {
    requests.push({ url: req.url(), method: req.method(), resourceType: req.resourceType() });
  });

  page.on('console', msg => {
    console.log('PAGE_CONSOLE:', msg.type(), msg.text());
  });

  page.on('pageerror', err => {
    console.log('PAGE_ERROR:', err.toString());
  });

  try {
    await page.goto('https://nebulosamagica.com/', { waitUntil: 'networkidle2', timeout: 60000 });
    console.log('Loaded. Requests:');
    requests.forEach(r => console.log(`${r.resourceType} ${r.method} ${r.url}`));

    const mixed = requests.filter(r => r.url.startsWith('http://'));
    if (mixed.length) {
      console.log('\nMIXED CONTENT FOUND:');
      mixed.forEach(r => console.log(r.url));
    } else {
      console.log('\nNo mixed content requests detected.');
    }
  } catch (err) {
    console.error('Error loading page:', err);
  } finally {
    await browser.close();
  }
})();
