const { chromium } = require('C:/Users/ChillOutKet/AppData/Roaming/npm/node_modules/@playwright/mcp/node_modules/playwright-core');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Users/ChillOutKet/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',
  });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
  });
  const page = await context.newPage();

  console.log('--- Navbar Mobile Sheet Test ---');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Screenshot before opening
  await page.screenshot({ path: 'test-navbar-1-closed.png', fullPage: false });
  console.log('Screenshot 1: closed state');

  // Find hamburger (aria-label="Abrir menú")
  const hamburger = page.locator('button[aria-label="Abrir menú"]');
  const exists = await hamburger.count();
  console.log(`Hamburger buttons found: ${exists}`);

  if (exists > 0) {
    await hamburger.first().click({ force: true });
    await page.waitForTimeout(1000);

    // Screenshot after opening
    await page.screenshot({ path: 'test-navbar-2-open.png', fullPage: false });
    console.log('Screenshot 2: sheet open');

    // Check for close button
    const closeBtn = page.locator('[data-slot="sheet-close"]');
    const closeCount = await closeBtn.count();
    console.log(`Close buttons found: ${closeCount}`);

    // Check sheet content
    const sheet = page.locator('[data-slot="sheet-content"]');
    const sheetCount = await sheet.count();
    console.log(`Sheet content elements: ${sheetCount}`);
    if (sheetCount > 0) {
      const visible = await sheet.first().isVisible();
      console.log(`Sheet visible: ${visible}`);
      const bgColor = await sheet.first().evaluate(el => getComputedStyle(el).backgroundColor);
      const backdrop = await sheet.first().evaluate(el => getComputedStyle(el).backdropFilter);
      console.log(`Sheet bg: ${bgColor}, backdrop: ${backdrop}`);
    }

    // Try closing
    if (closeCount > 0) {
      await closeBtn.first().click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-navbar-3-closed-again.png', fullPage: false });
      console.log('Screenshot 3: after close');
    }
  } else {
    console.log('No hamburger found!');
  }

  await browser.close();
})();
