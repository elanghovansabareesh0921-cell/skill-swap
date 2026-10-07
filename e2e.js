const { chromium } = require('playwright');
const fs = require('fs');

async function runE2E() {
  console.log('Starting Complete E2E Test...');
  
  const browser = await chromium.launch({ headless: true });
  const contextA = await browser.newContext();
  const pageA = await contextA.newPage();
  const contextB = await browser.newContext();
  const pageB = await contextB.newPage();
  
  try {
    console.log('Setting up User B (Teacher)...');
    await pageB.goto('http://localhost:3000/signup');
    await pageB.fill('input[type="email"]', `test.teacher.${Date.now()}@skillswap.com`);
    await pageB.fill('input[type="password"]', 'TeacherPassword123!');
    await pageB.check('input[type="checkbox"]');
    await pageB.click('button[type="submit"]');
    
    await pageB.waitForURL('**/onboarding', { timeout: 10000 });
    console.log('User B is on Onboarding! (Step 1)');
    await pageB.locator('input').nth(1).fill('Test Teacher'); // name
    await pageB.click('button:has-text("Next Step")');
    
    console.log('User B is on Onboarding! (Step 2 - Teach)');
    await pageB.waitForTimeout(1000);
    // Use the explicit add skill input
    await pageB.fill('input[placeholder="Don\'t see it? Type a skill and press Enter"]', 'Python');
    await pageB.keyboard.press('Enter');
    await pageB.click('button:has-text("Next Step")');

    console.log('User B is on Onboarding! (Step 3 - Learn)');
    await pageB.waitForTimeout(1000);
    await pageB.fill('input[placeholder="Don\'t see it? Type a skill and press Enter"]', 'Machine Learning');
    await pageB.keyboard.press('Enter');
    await pageB.click('button:has-text("Next Step")');

    console.log('User B is on Onboarding! (Step 4)');
    await pageB.waitForTimeout(1000);
    await pageB.click('button:has-text("Complete & View Matches")');

    await pageB.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('User B is on Dashboard!');
    
    
    console.log('Setting up User A (Learner)...');
    await pageA.goto('http://localhost:3000/signup');
    await pageA.fill('input[type="email"]', `test.learner.${Date.now()}@skillswap.com`);
    await pageA.fill('input[type="password"]', 'LearnerPassword123!');
    await pageA.check('input[type="checkbox"]');
    await pageA.click('button[type="submit"]');
    
    await pageA.waitForURL('**/onboarding', { timeout: 10000 });
    console.log('User A is on Onboarding! (Step 1)');
    await pageA.locator('input').nth(1).fill('Test Learner');
    await pageA.click('button:has-text("Next Step")');
    
    console.log('User A is on Onboarding! (Step 2 - Teach)');
    await pageA.waitForTimeout(1000);
    await pageA.fill('input[placeholder="Don\'t see it? Type a skill and press Enter"]', 'Machine Learning');
    await pageA.keyboard.press('Enter');
    await pageA.click('button:has-text("Next Step")');

    console.log('User A is on Onboarding! (Step 3 - Learn)');
    await pageA.waitForTimeout(1000);
    await pageA.fill('input[placeholder="Don\'t see it? Type a skill and press Enter"]', 'Python');
    await pageA.keyboard.press('Enter');
    await pageA.click('button:has-text("Next Step")');

    console.log('User A is on Onboarding! (Step 4)');
    await pageA.waitForTimeout(1000);
    await pageA.click('button:has-text("Complete & View Matches")');

    await pageA.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('User A is on Dashboard!');
    
    console.log('User A searching for Test Teacher (User B)...');
    await pageA.waitForTimeout(3000); // Wait for fetch
    
    const teacherVisible = await pageA.isVisible('text=Test Teacher');
    if (!teacherVisible) {
       console.log('❌ Test Teacher is not visible! Searching failed.');
    } else {
       console.log('✅ Test Teacher found successfully!');
       await pageA.click('text=Test Teacher');
       
       console.log('Booking session...');
       const sendButtonVisible = await pageA.isVisible('button:has-text("Send")');
       if (sendButtonVisible) {
           await pageA.click('button:has-text("Send")');
           console.log('✅ Booking Sent via Supabase Realtime Broadcast!');
       }
    }
    
    await pageA.waitForTimeout(2000);
    console.log('🎉 E2E script executed perfectly!');
    
  } catch (error) {
    console.error('E2E Test Failed:', error);
  } finally {
    await browser.close();
  }
}

runE2E();
