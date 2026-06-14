const { chromium } = require('playwright');

(async () => {
  const PAGES = [
    { name: 'landing', url: 'http://localhost:5173/' },
    { name: 'dashboard', url: 'http://localhost:5173/dashboard' },
    { name: 'members', url: 'http://localhost:5173/members' },
    { name: 'campaigns', url: 'http://localhost:5173/campaigns' },
    { name: 'analytics', url: 'http://localhost:5173/analytics' },
    { name: 'ai', url: 'http://localhost:5173/ai' },
  ];

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  for (const { name, url } of PAGES) {
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `C:/Users/snira/AppData/Local/Temp/screenshots/${name}.png` });
      console.log(`OK: ${name}`);
    } catch (e) {
      console.log(`ERROR: ${name} - ${e.message}`);
    }
  }

  await browser.close();
})();
