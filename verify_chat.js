const { chromium } = require('@playwright/test');

async function verifyChatFeatures() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('📌 Step 1: Navigate to home page');
    await page.goto('http://localhost:5173', { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    
    // Save screenshot
    await page.screenshot({ path: '/tmp/01-home.png' });
    console.log('✅ Home page loaded');
    
    // Check if we need to login
    console.log('📌 Step 2: Check for login requirement');
    const loginBtn = await page.$('button:has-text("로그인")');
    if (loginBtn) {
      console.log('⚠️ Login button found, trying signup...');
      const signupBtn = await page.$('a:has-text("회원가입")');
      if (signupBtn) {
        await signupBtn.click();
        await page.waitForNavigation();
        await page.waitForTimeout(1000);
        
        // Fill signup form
        const inputs = await page.$$('input');
        if (inputs.length >= 3) {
          await inputs[0].fill('test' + Date.now() + '@test.com');
          await inputs[1].fill('TestUser' + Math.random().toString(36).substr(2, 9));
          await inputs[2].fill('password123!');
          
          const submitBtn = await page.$('button[type="submit"]');
          if (submitBtn) {
            await submitBtn.click();
            try {
              await page.waitForNavigation({ timeout: 5000 });
            } catch (e) {
              await page.waitForTimeout(2000);
            }
          }
        }
      }
    }
    
    await page.screenshot({ path: '/tmp/02-after-login.png' });
    console.log('✅ Login/signup completed or already logged in');
    
    // Step 3: Look for create room button
    console.log('📌 Step 3: Find "새 채팅방 만들기" button');
    const createBtn = await page.$('button:has-text("새 채팅방 만들기")');
    
    if (!createBtn) {
      console.log('❌ Create room button not found');
      const buttons = await page.$$eval('button', buttons => 
        buttons.map(b => b.textContent).slice(0, 10)
      );
      console.log('Available buttons:', buttons);
      await page.screenshot({ path: '/tmp/error-no-create-btn.png' });
      process.exit(1);
    }
    
    await createBtn.click();
    await page.waitForTimeout(1500);
    
    await page.screenshot({ path: '/tmp/03-create-modal.png' });
    console.log('✅ Create room modal opened');
    
    // Step 4: Fill room details
    console.log('📌 Step 4: Fill in room title');
    const titleInput = await page.$('input[name="title"]');
    if (titleInput) {
      await titleInput.fill('테스트채팅방' + Date.now());
    }
    
    // Click create button
    const submitRoomBtn = await page.$('button:has-text("채팅방 생성")');
    if (!submitRoomBtn) {
      console.log('❌ Create button not found in modal');
      await page.screenshot({ path: '/tmp/error-no-submit.png' });
      process.exit(1);
    }
    
    console.log('📌 Step 5: Click "채팅방 생성" button');
    await submitRoomBtn.click();
    
    // Wait for navigation
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    await page.screenshot({ path: '/tmp/04-chat-page.png' });
    
    // Check if navigated to chat page
    if (!currentUrl.includes('/chat/')) {
      console.log('❌ Not navigated to chat page');
      await page.screenshot({ path: '/tmp/error-not-on-chat.png' });
      process.exit(1);
    }
    console.log('✅ Successfully navigated to chat page!');
    
    // Step 6: Test back button
    console.log('📌 Step 6: Look for back button');
    const backBtn = await page.$('button:has-text("뒤로가기")');
    
    if (!backBtn) {
      console.log('❌ Back button not found on chat page');
      const buttons = await page.$$eval('button', buttons => buttons.map(b => b.textContent));
      console.log('Available buttons:', buttons);
      await page.screenshot({ path: '/tmp/error-no-back-btn.png' });
      process.exit(1);
    }
    console.log('✅ Back button found');
    
    console.log('📌 Step 7: Click back button');
    await backBtn.click();
    await page.waitForTimeout(1500);
    
    await page.screenshot({ path: '/tmp/05-confirm-modal.png' });
    
    // Step 8: Verify confirmation modal
    console.log('📌 Step 8: Check for confirmation modal');
    const confirmH2 = await page.locator('h2:has-text("채팅방을 나가시겠습니까?")');
    const isVisible = await confirmH2.isVisible().catch(() => false);
    
    if (!isVisible) {
      console.log('❌ Confirmation modal not found');
      const h2Text = await page.$$eval('h2', elements => elements.map(e => e.textContent));
      console.log('H2 texts:', h2Text);
      await page.screenshot({ path: '/tmp/error-no-confirm.png' });
      process.exit(1);
    }
    console.log('✅ Confirmation modal displayed!');
    
    // Step 9: Test "아니오" button
    console.log('📌 Step 9: Click "아니오" button');
    const noBtn = await page.$('button:has-text("아니오")');
    
    if (!noBtn) {
      console.log('❌ "아니오" button not found');
      process.exit(1);
    }
    
    await noBtn.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: '/tmp/06-after-no.png' });
    
    // Verify still on chat page
    const stillOnChat = page.url().includes('/chat/');
    if (!stillOnChat) {
      console.log('❌ Not on chat page after clicking "아니오"');
      process.exit(1);
    }
    console.log('✅ "아니오" works - still on chat page');
    
    // Step 10: Test "예" button
    console.log('📌 Step 10: Click back button again');
    const backBtn2 = await page.$('button:has-text("뒤로가기")');
    if (backBtn2) {
      await backBtn2.click();
      await page.waitForTimeout(1500);
    }
    
    console.log('📌 Step 11: Click "예" button');
    const yesBtn = await page.$('button:has-text("예")');
    
    if (!yesBtn) {
      console.log('❌ "예" button not found');
      process.exit(1);
    }
    
    await yesBtn.click();
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: '/tmp/07-home-after-exit.png' });
    
    // Verify back on home page
    const homeUrl = page.url();
    console.log('Final URL:', homeUrl);
    if (homeUrl.includes('/chat')) {
      console.log('❌ Still on chat page');
      process.exit(1);
    }
    console.log('✅ "예" works - navigated back to home!');
    
    console.log('\n✨ ALL TESTS PASSED!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyChatFeatures();
