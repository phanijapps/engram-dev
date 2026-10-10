/* Seeded local library only. External browser tools are supplied by the caller. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE);
const base = process.argv[2];
const output = path.join(__dirname, 'ui-captures');
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [], requests = [], captures = [], audits = [], layouts = [], contrasts = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('request', r => requests.push(r.url()));
  await page.goto(base + '#/p/overview');
  await page.locator('#owner-start').waitFor();
  await page.locator('[data-doc="brief.md"] h1').waitFor();
  await page.waitForFunction(() => !document.getElementById('gatePanel').textContent.includes('loading'));
  await page.evaluate(() => document.fonts.ready);
  for (const width of [600, 601, 901]) for (const height of [600, 900]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => window.scrollTo(0, 0));
    for (const position of ['rest', 'scrolled']) {
      if (position === 'scrolled') await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const metrics = await page.evaluate(() => ({ 'viewport-width': innerWidth, 'viewport-height': innerHeight, 'scroll-position': scrollY, 'page-scrollable': document.documentElement.scrollHeight > innerHeight ? 'yes' : 'no' }));
      const file = `${width}-${height}-${position}.png`;
      await page.screenshot({ path: path.join(output, file) });
      captures.push({ route: '/', file, ...metrics });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      layouts.push({ width, height, position, overflow });
      assert.equal(overflow, false);
    }
  }
  await page.setViewportSize({ width: 320, height: 800 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, '320px reflow');
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.evaluate(() => window.scrollTo(0, 0));
  const luminance = c => { const rgb = c.match(/[\d.]+/g).slice(0, 3).map(v => { const n = Number(v) / 255; return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4; }); return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722; };
  const ratio = (a, b) => { const l = [luminance(a), luminance(b)].sort((a, b) => b - a); return (l[0] + 0.05) / (l[1] + 0.05); };
  for (const theme of ['light', 'dark']) {
    await page.evaluate(t => document.documentElement.dataset.theme = t, theme);
    await page.evaluate(fs.readFileSync(process.env.AXE_SCRIPT, 'utf8'));
    const audit = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) })));
    audits.push({ theme, violations: audit });
    await page.locator('#owner-start').focus();
    const colors = await page.locator('#owner-start').evaluate(e => { const s = getComputedStyle(e); return { foreground: s.color, background: s.backgroundColor, outline: s.outlineColor, panel: getComputedStyle(e.parentElement).backgroundColor }; });
    const contrast = { theme, ...colors, textRatio: ratio(colors.foreground, colors.background), focusRatio: ratio(colors.outline, colors.panel) };
    assert.ok(contrast.textRatio >= 4.5, 'Owner button text contrast');
    assert.ok(contrast.focusRatio >= 3, 'Owner focus contrast');
    contrasts.push(contrast);
  }
  await page.evaluate(() => document.documentElement.dataset.theme = 'light');
  await page.locator('#owner-start').focus();
  const focus = await page.locator('#owner-start').evaluate(e => { const s = getComputedStyle(e), b = e.getBoundingClientRect(); return { outline: s.outline, width: b.width, height: b.height }; });
  assert.ok(focus.width >= 24 && focus.height >= 24);
  assert.ok(focus.outline.includes('3px'));
  await page.keyboard.press('Enter');
  await page.locator('#owner-heading').filter({ hasText: 'Implementation in progress' }).waitFor();
  assert.equal(await page.locator('#owner-heading').evaluate(e => e === document.activeElement), true);
  assert.equal(await page.locator('#owner-finish').count(), 0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const motion = await page.locator('.phase-row').first().evaluate(e => getComputedStyle(e).transitionDuration);
  assert.equal(motion, '0s');
  const result = { captures, layouts, audits, contrasts, focus, reducedMotion: motion, errors, requests: [...new Set(requests)], keyboardStart: 'recorded on disposable fixture', prematureFinish: 'absent' };
  fs.writeFileSync(path.join(__dirname, 'ui-browser-results.json'), JSON.stringify(result, null, 2) + '\n');
  await browser.close();
  assert.deepEqual(errors, []);
  assert.ok(audits.every(a => a.violations.length === 0), 'accessibility violations: see ui-browser-results.json');
  console.log('Browser workflow, reflow, target size, focus, motion and accessibility checks passed.');
})().catch(e => { console.error(e); process.exitCode = 1; });
