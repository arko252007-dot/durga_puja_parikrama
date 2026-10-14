import puppeteer from 'puppeteer-core';

async function testLoadingControlsSequence() {
  console.log('[Test] Launching Chrome for Loading Screen & Controls Sequence Verification...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--autoplay-policy=no-user-gesture-required', '--no-sandbox', '--disable-setuid-sandbox']
  });

  let allPassed = true;

  // -------------------------------------------------------------
  // Test 1: Desktop Mode
  // -------------------------------------------------------------
  console.log('\n--- TEST 1: Desktop Environment ---');
  const desktopPage = await browser.newPage();
  await desktopPage.setViewport({ width: 1280, height: 720, isMobile: false, hasTouch: false });

  // Navigate and inspect loading controls immediately
  await desktopPage.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  const desktopControlsText = await desktopPage.$eval('#loading-instructions', el => el.innerText);
  console.log('[Desktop Controls Text]:\n', desktopControlsText);

  const hasWASD = desktopControlsText.includes('W A S D');
  const hasMouse = desktopControlsText.includes('Mouse');
  const noJoystickDesktop = !desktopControlsText.includes('Joystick');

  console.log(`[Desktop Test] Shows WASD & Mouse controls: ${hasWASD && hasMouse && noJoystickDesktop ? 'PASS' : 'FAIL'}`);
  if (!(hasWASD && hasMouse && noJoystickDesktop)) allPassed = false;

  // Wait for loading screen to dismiss
  await desktopPage.waitForFunction(() => {
    const ls = document.getElementById('loading-screen');
    return !ls || ls.classList.contains('hidden');
  }, { timeout: 10000 });

  const desktopOverlayPresent = await desktopPage.$eval('#orientation-lock-overlay', () => true).catch(() => false);
  console.log(`[Desktop Test] Zero orientation overlay on desktop: ${!desktopOverlayPresent ? 'PASS' : 'FAIL'}`);
  if (desktopOverlayPresent) allPassed = false;
  await desktopPage.close();

  // -------------------------------------------------------------
  // Test 2: Mobile Portrait Mode
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: Mobile Portrait Startup Sequence ---');
  const mobilePortraitPage = await browser.newPage();
  await mobilePortraitPage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  await mobilePortraitPage.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });

  // 2a: Check loading screen controls BEFORE loading finishes
  const mobileControlsText = await mobilePortraitPage.$eval('#loading-instructions', el => el.innerText);
  console.log('[Mobile Portrait Controls Text]:\n', mobileControlsText);

  const hasJoystick = mobileControlsText.includes('Virtual Joystick');
  const hasSwipe = mobileControlsText.includes('Swipe');
  const noWASDMobile = !mobileControlsText.includes('W A S D');

  console.log(`[Mobile Test 2a] Shows exact touch controls (Joystick & Swipe): ${hasJoystick && hasSwipe && noWASDMobile ? 'PASS' : 'FAIL'}`);
  if (!(hasJoystick && hasSwipe && noWASDMobile)) allPassed = false;

  // 2b: Confirm orientation overlay is HIDDEN while loading screen is active
  const overlayHiddenDuringLoading = await mobilePortraitPage.evaluate(() => {
    const overlay = document.getElementById('orientation-lock-overlay');
    if (!overlay) return true; // not even injected yet
    return overlay.classList.contains('hidden') || window.getComputedStyle(overlay).display === 'none';
  });
  console.log(`[Mobile Test 2b] Orientation overlay hidden while loading screen is visible: ${overlayHiddenDuringLoading ? 'PASS' : 'FAIL'}`);
  if (!overlayHiddenDuringLoading) allPassed = false;

  // 2c: Wait for loading screen to finish and dismiss
  await mobilePortraitPage.waitForFunction(() => {
    const ls = document.getElementById('loading-screen');
    return !ls || ls.classList.contains('hidden');
  }, { timeout: 15000 });

  // Give brief moment for orientationLock.activate()
  await new Promise(r => setTimeout(r, 200));

  // 2d: NOW confirm orientation overlay is ACTIVATED and visible suggesting landscape mode
  const overlayVisibleAfterLoading = await mobilePortraitPage.evaluate(() => {
    const overlay = document.getElementById('orientation-lock-overlay');
    if (!overlay) return false;
    const isHidden = overlay.classList.contains('hidden');
    const isNone = window.getComputedStyle(overlay).display === 'none';
    return !isHidden && !isNone;
  });
  console.log(`[Mobile Test 2c] Orientation overlay suggests landscape mode AFTER loading: ${overlayVisibleAfterLoading ? 'PASS' : 'FAIL'}`);
  if (!overlayVisibleAfterLoading) allPassed = false;

  // 2e: Rotate to landscape
  console.log('[Rotating mobile device to landscape (844x390)...]');
  await mobilePortraitPage.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
  await new Promise(r => setTimeout(r, 200));

  const overlayHiddenInLandscape = await mobilePortraitPage.evaluate(() => {
    const overlay = document.getElementById('orientation-lock-overlay');
    return overlay.classList.contains('hidden') || window.getComputedStyle(overlay).display === 'none';
  });
  console.log(`[Mobile Test 2d] Orientation overlay hidden once in landscape: ${overlayHiddenInLandscape ? 'PASS' : 'FAIL'}`);
  if (!overlayHiddenInLandscape) allPassed = false;

  await mobilePortraitPage.close();

  // -------------------------------------------------------------
  // Test 3: Mobile Landscape Mode Startup
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Mobile Landscape Startup ---');
  const mobileLandscapePage = await browser.newPage();
  await mobileLandscapePage.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });

  await mobileLandscapePage.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });

  // Check controls
  const landscapeControlsText = await mobileLandscapePage.$eval('#loading-instructions', el => el.innerText);
  const hasJoystickLand = landscapeControlsText.includes('Virtual Joystick');
  console.log(`[Mobile Test 3a] Shows exact mobile controls in landscape: ${hasJoystickLand ? 'PASS' : 'FAIL'}`);
  if (!hasJoystickLand) allPassed = false;

  // Wait for loading to finish
  await mobileLandscapePage.waitForFunction(() => {
    const ls = document.getElementById('loading-screen');
    return !ls || ls.classList.contains('hidden');
  }, { timeout: 15000 });

  await new Promise(r => setTimeout(r, 200));

  const overlayNeverShownInLandscape = await mobileLandscapePage.evaluate(() => {
    const overlay = document.getElementById('orientation-lock-overlay');
    return !overlay || overlay.classList.contains('hidden');
  });
  console.log(`[Mobile Test 3b] Zero orientation overlay shown when already in landscape: ${overlayNeverShownInLandscape ? 'PASS' : 'FAIL'}`);
  if (!overlayNeverShownInLandscape) allPassed = false;

  await mobileLandscapePage.close();
  await browser.close();

  console.log(`\n====================================================`);
  console.log(`OVERALL SEQUENCE VERIFICATION: ${allPassed ? 'ALL TESTS PASSED' : 'TESTS FAILED'}`);
  console.log(`====================================================\n`);

  process.exit(allPassed ? 0 : 1);
}

testLoadingControlsSequence().catch(err => {
  console.error('[Test Error]:', err);
  process.exit(1);
});
