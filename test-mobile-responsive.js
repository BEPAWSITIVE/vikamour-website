const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const VIEWPORTS = [
  { name: 'iPhone SE (320px)', width: 320, height: 667 },
  { name: 'Android Compact (360px)', width: 360, height: 740 },
  { name: 'iPhone Mini/X (375px)', width: 375, height: 812 },
  { name: 'iPhone 14/15 (390px)', width: 390, height: 844 },
  { name: 'iPhone Plus (414px)', width: 414, height: 896 },
  { name: 'iPad Portrait (768px)', width: 768, height: 1024 }
];

const PAGES = [
  { name: 'Home Page', file: 'index.html' },
  { name: 'Shop Page', file: 'shop.html' }
];

async function runTests() {
  console.log('🚀 Starting Automated Mobile Responsiveness Tests with Google Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let totalTests = 0;
  let passedTests = 0;

  for (const pageInfo of PAGES) {
    const pageUrl = 'file://' + path.resolve(__dirname, pageInfo.file).replace(/\\/g, '/');
    console.log(`\n📄 Testing ${pageInfo.name} (${pageInfo.file})`);

    const page = await browser.newPage();

    for (const vp of VIEWPORTS) {
      totalTests++;
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(pageUrl, { waitUntil: 'load' });
      await new Promise(r => setTimeout(r, 600));

      const overflowData = await page.evaluate(() => {
        const docWidth = document.documentElement.clientWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        const bodyScrollWidth = document.body.scrollWidth;

        // Find elements that overflow the viewport outside intentional scroll containers
        const overflowingElements = [];
        const allElements = document.querySelectorAll('body *');
        for (const el of allElements) {
          // Ignore elements inside intentional scrollable containers or offscreen drawers
          if (el.closest('.side-drawer') || 
              el.closest('.mobile-filter-drawer-pane') ||
              el.closest('.modal-backdrop') ||
              el.closest('.shop-pill-nav') ||
              el.closest('.filter-categories-pills') ||
              el.closest('.size-guide-table-wrap') ||
              el.closest('.announcement-bar') ||
              el.closest('.account-tabs')) {
            continue;
          }

          const rect = el.getBoundingClientRect();
          if (rect.right > docWidth + 2 && rect.width > 0) {
            overflowingElements.push({
              tag: el.tagName,
              class: el.className || '',
              id: el.id || '',
              right: Math.round(rect.right),
              width: Math.round(rect.width)
            });
            if (overflowingElements.length >= 5) break;
          }
        }

        return {
          clientWidth: docWidth,
          scrollWidth: scrollWidth,
          bodyScrollWidth: bodyScrollWidth,
          hasHorizontalScroll: scrollWidth > docWidth + 1 || bodyScrollWidth > docWidth + 1,
          overflowingElements: overflowingElements
        };
      });

      if (!overflowData.hasHorizontalScroll && overflowData.overflowingElements.length === 0) {
        passedTests++;
        console.log(`  ✅ [${vp.name}]: clientWidth=${overflowData.clientWidth}px, scrollWidth=${overflowData.scrollWidth}px (No horizontal overflow)`);
      } else {
        console.error(`  ❌ [${vp.name}]: OVERFLOW DETECTED! clientWidth=${overflowData.clientWidth}px, scrollWidth=${overflowData.scrollWidth}px, bodyScrollWidth=${overflowData.bodyScrollWidth}px`);
        if (overflowData.overflowingElements.length > 0) {
          console.error('     Overflowing elements:', JSON.stringify(overflowData.overflowingElements, null, 2));
        }
      }

      // Capture screenshot at 375px
      if (vp.width === 375) {
        const screenshotPath = path.resolve(__dirname, `screenshot-${pageInfo.file.replace('.html', '')}-375px.png`);
        await page.screenshot({ path: screenshotPath });
        console.log(`     📸 Screenshot saved to ${path.basename(screenshotPath)}`);
      }
    }

    // Test Mobile Navigation Drawer opening (fresh reload)
    console.log(`  🔍 Testing Mobile Nav Drawer Interaction on ${pageInfo.name}...`);
    await page.setViewport({ width: 375, height: 812 });
    await page.goto(pageUrl, { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 400));
    const toggleBtn = await page.$('#mobileMenuToggle');
    if (toggleBtn) {
      await toggleBtn.click();
      await new Promise(r => setTimeout(r, 400));
      const drawerOpen = await page.evaluate(() => {
        const drawer = document.getElementById('mobileNavDrawer');
        return drawer && drawer.classList.contains('open');
      });
      console.log(`     Drawer opens on toggle: ${drawerOpen ? '✅ YES' : '❌ NO'}`);
    }

    // If shop page, test Mobile Filter Drawer (fresh reload)
    if (pageInfo.file === 'shop.html') {
      console.log(`  🔍 Testing Mobile Filter Drawer on Shop Page...`);
      await page.goto(pageUrl, { waitUntil: 'load' });
      await new Promise(r => setTimeout(r, 400));
      const filterBtn = await page.$('#mobileFilterOpenBtn');
      if (filterBtn) {
        await filterBtn.click();
        await new Promise(r => setTimeout(r, 400));
        const filterDrawerOpen = await page.evaluate(() => {
          const drawer = document.getElementById('mobileFilterDrawer');
          return drawer && drawer.classList.contains('open');
        });
        console.log(`     Filter Drawer opens on toggle: ${filterDrawerOpen ? '✅ YES' : '❌ NO'}`);
      }
    }

    await page.close();
  }

  await browser.close();

  console.log(`\n🏁 Test Results: ${passedTests} / ${totalTests} viewports passed without horizontal overflow.`);
  if (passedTests === totalTests) {
    console.log('🎉 ALL MOBILE RESPONSIVENESS CHECKS PASSED PERFECTLY!');
  } else {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
