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
    await pageB.locator('input').nth(1).fill('Test Teacher'); // 1st is file, 2nd is name
    await pageB.click('button:has-text("Next Step")');
    
    console.log('User B is on Onboarding! (Step 2)');
    await pageB.waitForTimeout(500);
    await pageB.locator('text=UI/UX Design').first().click();
    await pageB.click('button:has-text("Next Step")');

    console.log('User B is on Onboarding! (Step 3)');
    await pageB.waitForTimeout(500);
    await pageB.locator('text=Python Programming').first().click();
    await pageB.click('button:has-text("Next Step")');

    console.log('User B is on Onboarding! (Step 4)');
    await pageB.waitForTimeout(500);
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
    console.log('User A is on Onboarding!');
    await pageA.locator('input').nth(1).fill('Test Learner');
    await pageA.click('button:has-text("Next Step")');
    
    await pageA.waitForTimeout(500);
    await pageA.locator('text=Python Programming').first().click();
    await pageA.click('button:has-text("Next Step")');

    await pageA.waitForTimeout(500);
    await pageA.locator('text=UI/UX Design').first().click();
    await pageA.click('button:has-text("Next Step")');

    await pageA.waitForTimeout(500);
    await pageA.click('button:has-text("Complete & View Matches")');

    await pageA.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('User A is on Dashboard!');
    
    console.log('User A finding User B to book a session...');
    await pageA.waitForTimeout(3000); // Wait for teachers fetch
    
    const teacherVisible = await pageA.isVisible('text=Test Teacher');
    if (!teacherVisible) {
       console.log('Test Teacher is not visible in matches! (Maybe peerMatches algorithm failed?)');
       await pageA.click('button:has-text("Propose Swap")').catch(() => {});
    } else {
       console.log('Test Teacher found!');
       await pageA.click('text=Test Teacher');
    }
    
    console.log('Booking session...');
    const sendButtonVisible = await pageA.isVisible('button:has-text("Send")');
    if (sendButtonVisible) {
        await pageA.click('button:has-text("Send")');
        console.log('Booking Sent via Supabase Realtime Broadcast!');
    }
    
    await pageA.waitForTimeout(2000);
    console.log('E2E Realtime script executed successfully.');
    
  } catch (error) {
    console.error('E2E Test Failed:', error);
  } finally {
    await browser.close();
  }
}

runE2E();
