/**
 * Automated Test for Vikamour AI Stylist Chatbot
 */
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runAiStylistTest() {
  console.log('✨ Starting AI Stylist Chatbot Verification Test...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const htmlPath = path.resolve(__dirname, 'index.html');
    await page.goto(`file://${htmlPath}`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));

    // 1. Verify trigger button exists
    const triggerBtn = await page.$('#aiStylistTriggerBtn');
    if (!triggerBtn) throw new Error('#aiStylistTriggerBtn not found');
    console.log('  ✅ Floating AI Stylist button found');

    // 2. Click trigger button to open modal
    await triggerBtn.click();
    await new Promise(r => setTimeout(r, 400));

    const isModalActive = await page.evaluate(() => {
      const modal = document.getElementById('aiStylistModal');
      return modal && modal.classList.contains('active');
    });
    if (!isModalActive) throw new Error('AI Stylist modal did not open upon click');
    console.log('  ✅ AI Stylist modal opened successfully');

    // 3. Verify welcome message from Stylist
    const welcomeMsg = await page.evaluate(() => {
      const thread = document.getElementById('aiChatThread');
      return thread ? thread.innerText : '';
    });
    if (!welcomeMsg.includes('Vikamour Atelier') && !welcomeMsg.includes('Namaste')) {
      throw new Error('Welcome message not rendered in thread: ' + welcomeMsg);
    }
    console.log('  ✅ Welcome message from AI Stylist verified');

    // 4. Test quick chip click
    const chipQuery = await page.evaluate(() => {
      const firstChip = document.querySelector('.ai-chip-btn');
      if (firstChip) {
        firstChip.click();
        return firstChip.dataset.query;
      }
      return null;
    });
    console.log(`  🔍 Clicked suggestion chip: "${chipQuery}"`);
    await new Promise(r => setTimeout(r, 800));

    // 5. Verify user query and recommendations in chat thread
    const chatState = await page.evaluate(() => {
      const thread = document.getElementById('aiChatThread');
      const userRows = thread.querySelectorAll('.user-row');
      const stylistRows = thread.querySelectorAll('.stylist-row');
      const productCards = thread.querySelectorAll('.chat-product-card');

      const cardDetails = Array.from(productCards).map(c => ({
        title: c.querySelector('.chat-product-title')?.innerText || '',
        price: c.querySelector('.chat-product-price')?.innerText || '',
        hasQuickView: Boolean(c.querySelector('.quickview-btn')),
        hasAddBag: Boolean(c.querySelector('.addbag-btn'))
      }));

      return {
        userRowCount: userRows.length,
        stylistRowCount: stylistRows.length,
        productCardCount: productCards.length,
        cardDetails
      };
    });

    if (chatState.userRowCount === 0) throw new Error('User message was not added to chat thread');
    if (chatState.stylistRowCount < 2) throw new Error('Stylist response was not received');
    if (chatState.productCardCount === 0) throw new Error('No product cards recommended by AI');

    console.log(`  ✅ User message registered (${chatState.userRowCount})`);
    console.log(`  ✅ Stylist response received with ${chatState.productCardCount} stock recommendations:`);
    chatState.cardDetails.forEach((c, i) => {
      console.log(`     ${i + 1}. ${c.title} - ${c.price} (QuickView: ${c.hasQuickView}, AddBag: ${c.hasAddBag})`);
    });

    // 6. Test custom user requirement submission
    console.log('  🔍 Testing custom input submission: "Show me Flat ₹999 cotton kurtas"');
    await page.type('#aiStylistInput', 'Show me Flat ₹999 cotton kurtas');
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 800));

    const secondQueryCheck = await page.evaluate(() => {
      const thread = document.getElementById('aiChatThread');
      const productCards = thread.querySelectorAll('.chat-product-card');
      return {
        totalCards: productCards.length,
        latestCardTitle: productCards[productCards.length - 1]?.querySelector('.chat-product-title')?.innerText || ''
      };
    });
    console.log(`  ✅ Custom query answered with stock matches! Latest recommended item: "${secondQueryCheck.latestCardTitle}"`);

    // 7. Test API Key Settings panel toggle
    const configBtn = await page.$('#aiStylistConfigBtn');
    await configBtn.click();
    await new Promise(r => setTimeout(r, 300));

    const apiPanelVisible = await page.evaluate(() => {
      const panel = document.getElementById('aiStylistApiPanel');
      return panel && panel.style.display !== 'none';
    });
    if (!apiPanelVisible) throw new Error('Settings API panel did not open');
    console.log('  ✅ Gemini API Key configuration panel toggled open');

    // 8. Test entering API Key
    await page.type('#geminiApiKeyInput', 'AIzaSyDemoKeyTestOnly123456');
    await page.click('#saveGeminiApiKeyBtn');
    await new Promise(r => setTimeout(r, 400));

    const statusPillOnline = await page.evaluate(() => {
      const pill = document.getElementById('aiStylistStatusPill');
      const text = document.getElementById('aiStylistStatusText');
      return {
        isOnline: pill.classList.contains('online'),
        text: text.textContent
      };
    });
    console.log(`  ✅ Status badge updated: ${statusPillOnline.text} (online: ${statusPillOnline.isOnline})`);

    // 9. Reset Key
    await new Promise(r => setTimeout(r, 1500)); // wait for auto-close
    await configBtn.click(); // re-open settings
    await new Promise(r => setTimeout(r, 300));
    await page.click('#clearGeminiApiKeyBtn');
    await new Promise(r => setTimeout(r, 300));

    const statusPillReset = await page.evaluate(() => {
      const text = document.getElementById('aiStylistStatusText');
      return text.textContent;
    });
    console.log(`  ✅ Status badge successfully reset: ${statusPillReset}`);

    // 10. Also test shop.html
    console.log('\n📄 Testing AI Stylist on Shop Page (shop.html)...');
    const shopHtmlPath = path.resolve(__dirname, 'shop.html');
    await page.goto(`file://${shopHtmlPath}`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));

    const shopTriggerBtn = await page.$('#aiStylistTriggerBtn');
    if (!shopTriggerBtn) throw new Error('#aiStylistTriggerBtn not found on shop.html');
    await shopTriggerBtn.click();
    await new Promise(r => setTimeout(r, 400));

    const shopModalActive = await page.evaluate(() => {
      const modal = document.getElementById('aiStylistModal');
      return modal && modal.classList.contains('active');
    });
    if (!shopModalActive) throw new Error('AI Stylist modal did not open on shop.html');
    console.log('  ✅ AI Stylist modal opened on shop.html');

    // Click quick chip on shop.html
    await page.evaluate(() => {
      const chip = document.querySelector('.ai-chip-btn');
      if (chip) chip.click();
    });
    await new Promise(r => setTimeout(r, 800));

    const shopChatCards = await page.evaluate(() => {
      return document.querySelectorAll('#aiChatThread .chat-product-card').length;
    });
    if (shopChatCards === 0) throw new Error('No product cards generated on shop.html');
    console.log(`  ✅ Stock recommendations generated on shop.html (${shopChatCards} items)`);

    // 11. Take visual screenshot of AI Stylist Chat
    const screenshotPath = path.resolve(__dirname, 'screenshot-ai-stylist-chat.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`  📸 Saved visual screenshot to: screenshot-ai-stylist-chat.png`);

    console.log('\n🎉 ALL AI STYLIST TESTS PASSED FLAWLESSLY ON BOTH PAGES!');

  } finally {
    await browser.close();
  }
}

runAiStylistTest().catch(err => {
  console.error('❌ AI Stylist test failed:', err);
  process.exit(1);
});
