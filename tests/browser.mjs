import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const server = spawn('node', ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4173']);
const base = 'http://127.0.0.1:4173';
const fixture = JSON.parse(await readFile(new URL('./fixtures/photos.json', import.meta.url), 'utf8'));
const output = process.env.TEST_OUTPUT_DIR || 'test-results';
await mkdir(output, { recursive: true });
let browser;
const results = [];
const pass = (name) => { results.push(name); console.log('PASS', name); };
try {
  for (let attempt = 0; attempt < 50; attempt++) {
    try { await fetch(base); break; } catch { await new Promise((r) => setTimeout(r, 100)); }
  }
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  let calls = 0;
  await page.route('https://picsum.photos/v2/list?limit=30', async (route) => {
    calls++;
    await new Promise((r) => setTimeout(r, 1000));
    await route.fulfill({ json: fixture, headers: { 'access-control-allow-origin': '*' } });
  });
  await page.goto(base);
  await page.getByText('Loading photos...').waitFor();
  pass('loading spinner visible during fetch');
  await page.locator('article').nth(29).waitFor();
  assert.equal(await page.locator('article').count(), 30);
  pass('30 photos rendered from real API fixture');
  const columns = async () => page.getByTestId('photo-grid').evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
  assert.equal(await columns(), 4);
  pass('desktop has 4 columns');
  await page.getByLabel('Search by author').fill(fixture[0].author.toUpperCase());
  const expected = fixture.filter((p) => p.author.toLowerCase().includes(fixture[0].author.toLowerCase())).length;
  assert.equal(await page.locator('article').count(), expected);
  assert.equal(calls, 1);
  pass('case-insensitive author search uses no extra API call');
  await page.getByLabel('Search by author').fill('ZZZ-no-match');
  await page.getByText('No photos match that author. Try another name.').waitFor();
  pass('empty search result message');
  await page.getByLabel('Search by author').fill('');
  await page.locator('article button').first().click();
  assert.equal(await page.locator('article button').first().getAttribute('aria-pressed'), 'true');
  await page.reload();
  await page.locator('article').nth(29).waitFor();
  assert.equal(await page.locator('article button').first().getAttribute('aria-pressed'), 'true');
  pass('favourite survives full page refresh');
  await page.locator('article button').first().click();
  assert.equal(await page.locator('article button').first().getAttribute('aria-pressed'), 'false');
  pass('favourite toggles off');
  await page.evaluate(() => localStorage.setItem('celebrare-gallery-favourites', '{bad'));
  await page.reload();
  await page.locator('article').nth(29).waitFor();
  pass('corrupt localStorage does not crash rendering');
  await page.setViewportSize({ width: 800, height: 1050 });
  assert.equal(await columns(), 2);
  pass('tablet has 2 columns');
  await page.setViewportSize({ width: 390, height: 1000 });
  assert.equal(await columns(), 1);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  pass('mobile has 1 column and no horizontal overflow');
  // Wait for visible real images, but do not silently call an unloaded-image screenshot verified.
  await page.waitForTimeout(4500);
  const mobileImages = await page.locator('article img').evaluateAll((images) => images.slice(0, 2).map((im) => ({loaded: im.complete && im.naturalWidth > 0, url: im.currentSrc})));
  console.log('VISIBLE IMAGE LOADS', JSON.stringify(mobileImages));
  await page.screenshot({ path: `${output}/celebrare-mobile.png` });
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${output}/celebrare-desktop.png` });
  await page.route('https://picsum.photos/v2/list?limit=30', (route) => route.fulfill({ status: 503, body: 'Unavailable' }));
  await page.reload();
  await page.getByRole('alert').filter({ hasText: 'The photo service is unavailable.' }).waitFor();
  pass('HTTP API failure displays error');
  await page.route('https://picsum.photos/v2/list?limit=30', (route) => route.fulfill({ json: { invalid: true } }));
  await page.reload();
  await page.getByRole('alert').filter({ hasText: 'unexpected data' }).waitFor();
  pass('malformed API response displays error');
  await page.route('https://picsum.photos/v2/list?limit=30', (route) => route.abort());
  await page.reload();
  await page.getByRole('alert').waitFor();
  pass('network failure displays error');
  assert.deepEqual(errors, []);
  pass('no uncaught browser errors');
  // Separate live request, no API fixture.
  await page.unroute('https://picsum.photos/v2/list?limit=30');
  await page.reload();
  await page.locator('article').nth(29).waitFor({ timeout: 30000 });
  pass('unmocked browser API fetch renders all 30 photos');
  await writeFile(`${output}/celebrare-test-results.txt`, results.join('\n') + '\n');
} finally {
  await browser?.close();
  server.kill();
}
