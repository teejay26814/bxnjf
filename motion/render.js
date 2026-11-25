// Render a motion page to PNG frames by calling its window.render(t) at 30fps.
//
//   node render.js page.html outDir            -> every frame
//   TIMES=1.2,5 node render.js page.html outDir stills -> selected stills
//
// Needs Playwright; set PW to its module path if it isn't resolvable.
const { chromium } = require(process.env.PW || 'playwright');
const path = require('path'), fs = require('fs');

(async () => {
  const [, , html, outDir, mode] = process.argv;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.resolve(html));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  fs.mkdirSync(outDir, { recursive: true });
  const dur = await page.evaluate(() => window.DURATION);
  const times = mode === 'stills' ? process.env.TIMES.split(',').map(Number) : null;
  const fps = 30;
  const list = times || Array.from({ length: Math.round(dur * fps) }, (_, i) => i / fps);
  for (let i = 0; i < list.length; i++) {
    await page.evaluate(t => window.render(t), list[i]);
    const name = times ? `still_${list[i]}` : String(i).padStart(5, '0');
    await page.screenshot({ path: path.join(outDir, name + '.png') });
  }
  await browser.close();
  console.log('frames', list.length);
})();
