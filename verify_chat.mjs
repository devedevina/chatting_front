import { chromium } from '@playwright/test';

async function verifyChatFeatures() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Mock the API responses
    await page.route('**/api/**', async (route) => {
      const url = route.request().url();
      const method = route.request().method();
      
      console.log(`🔄 Intercepted API: ${method} ${url}`);
      
      if (url.includes('/chat-rooms') && method === 'POST') {
        // Mock create room response
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'room-' + Date.now(),
            title: 'TestRoom' + Date.now(),
            description: 'Test Description',
            isPublic: true,
            maxMembers: 50,
            createdAt: new Date().toISOString(),
          }),
        });
      } else if (url.includes('/chat-rooms') && method === 'GET') {
        // Mock get rooms response
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      } else {
        // Default response
        await route.abort();
      }
    });
    
    console.log('📌 Step 1: Navigate to home page');
    await page.goto('http://localhost:5173', { waitUntil: 'load' });
    
    // Set a mock logged-in user
    console.log('📌 Step 2: Set test user in localStorage');
    await page.evaluate(() => {
      const testUser = {
        id: 'test-user-123',
        email: 'test@test.com',
        nickname: 'TestUser'
      };
      localStorage.setItem('user', JSON.stringify(testUser));
    });
    
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(1500);
    
    await page.screenshot({ path: '/tmp/01-home-logged-in.png' });
    console.log('✅ Home page loaded with test user');
    
    // Step 3: Find create button
    console.log('📌 Step 3: Find "새 채팅방 만들기" button');
    const createBtn = await page.$('button:has-text("새 채팅방 만들기")');
    
    if (!createBtn) {
      console.log('❌ Create button not found');
      const buttons = await page.$$eval('button', buttons => 
        buttons.map(b => b.textContent).join(' | ')
      );
      console.log('Available buttons:', buttons);
      process.exit(1);
    }
    
    console.log('✅ Create button found');
    await createBtn.click();
    await page.waitForTimeout(1500);
    
    await page.screenshot({ path: '/tmp/02-create-modal.png' });
    console.log('✅ Create room modal opened');
    
    // Step 4: Fill room details
    console.log('📌 Step 4: Fill in room title');
    const titleInput = await page.$('input[name="title"]');
    if (titleInput) {
      await titleInput.fill('TestRoom' + Date.now());
    }
    
    const submitRoomBtn = await page.$('button:has-text("채팅방 생성")');
    if (!submitRoomBtn) {
      console.log('❌ Submit button not found');
      process.exit(1);
    }
    
    console.log('📌 Step 5: Click "채팅방 생성"');
    await submitRoomBtn.click();
    
    // Wait for navigation to chat page
    try {
      await page.waitForNavigation({ timeout: 5000 });
    } catch (e) {
      await page.waitForTimeout(3000);
    }
    
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    await page.screenshot({ path: '/tmp/03-after-create.png' });
    
    if (!currentUrl.includes('/chat/')) {
      console.log('❌ Did not navigate to chat page');
      const bodyText = await page.locator('body').textContent();
      console.log('Page text sample:', bodyText.substring(0, 300));
      process.exit(1);
    }
    console.log('✅ Successfully navigated to chat page!');
    
    // Step 6: Find back button
    console.log('📌 Step 6: Find back button');
    const backBtn = await page.$('button:has-text("뒤로가기")');
    
    if (!backBtn) {
      console.log('❌ Back button not found');
      const buttons = await page.$$eval('button', buttons => buttons.map(b => b.textContent));
      console.log('Available buttons:', buttons);
      process.exit(1);
    }
    console.log('✅ Back button found');
    
    // Step 7: Click back button
    console.log('📌 Step 7: Click back button');
    await backBtn.click();
    await page.waitForTimeout(1500);
    
    await page.screenshot({ path: '/tmp/04-confirmation-modal.png' });
    
    // Step 8: Verify confirmation modal
    console.log('📌 Step 8: Verify confirmation modal is visible');
    const h2Elements = await page.locator('h2').all();
    let foundModal = false;
    let modalText = '';
    
    for (const h2 of h2Elements) {
      const text = await h2.textContent();
      if (text.includes('채팅방')) {
        foundModal = true;
        modalText = text;
        break;
      }
    }
    
    if (!foundModal) {
      console.log('❌ Confirmation modal not found');
      process.exit(1);
    }
    console.log('✅ Confirmation modal visible:', modalText);
    
    // Step 9: Test "아니오" button
    console.log('📌 Step 9: Click "아니오" button');
    const noBtn = await page.$('button:has-text("아니오")');
    if (!noBtn) {
      console.log('❌ "아니오" button not found');
      process.exit(1);
    }
    
    await noBtn.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: '/tmp/05-after-no-click.png' });
    
    const urlAfterNo = page.url();
    if (!urlAfterNo.includes('/chat/')) {
      console.log('❌ Navigated away from chat after clicking "아니오"');
      process.exit(1);
    }
    console.log('✅ "아니오" works - still on chat page');
    
    // Step 10: Click back button again
    console.log('📌 Step 10: Click back button again');
    const backBtn2 = await page.$('button:has-text("뒤로가기")');
    if (!backBtn2) {
      console.log('❌ Back button disappeared');
      process.exit(1);
    }
    
    await backBtn2.click();
    await page.waitForTimeout(1500);
    
    // Step 11: Click "예" button
    console.log('📌 Step 11: Click "예" button');
    const yesBtn = await page.$('button:has-text("예")');
    if (!yesBtn) {
      console.log('❌ "예" button not found');
      process.exit(1);
    }
    
    await yesBtn.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: '/tmp/06-final-home.png' });
    
    const finalUrl = page.url();
    console.log('Final URL:', finalUrl);
    
    if (finalUrl.includes('/chat')) {
      console.log('❌ Still on chat page after clicking "예"');
      process.exit(1);
    }
    console.log('✅ "예" works - navigated back to home');
    
    console.log('\n✨✨✨ ALL TESTS PASSED! ✨✨✨');
    console.log('✅ Feature 1: Auto-navigate to chat after room creation');
    console.log('✅ Feature 2: Back button displays confirmation modal');
    console.log('✅ Feature 3: "아니오" keeps user on chat page');
    console.log('✅ Feature 4: "예" navigates back to home page\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyChatFeatures();
