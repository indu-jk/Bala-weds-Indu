import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,channel:'msedge'});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await fs.mkdir('artifacts',{recursive:true});
// Original local artwork and system typography make the social card self-contained.
const card=await context.newPage();await card.setViewportSize({width:1200,height:630});
await card.setContent(`<html><head><style>*{box-sizing:border-box}body{margin:0;background:#f8f4eb;color:#722c3b;font-family:Georgia,serif;width:1200px;height:630px;display:flex;align-items:center;padding:54px 72px;border:17px solid #f0e9da}.copy{width:620px}small{font-family:Arial;font-size:13px;letter-spacing:3px;color:#a58c63}h1{font-size:96px;font-weight:400;margin:25px 0 15px;letter-spacing:-4px}h1 i{color:#b09772;font-size:60px}p{font-size:26px;font-style:italic;color:#937b68;margin:0 0 35px}footer{font:13px Arial;color:#9b8c73;letter-spacing:1px}img{height:530px;width:420px;object-fit:contain}</style></head><body><div class="copy"><small>THE WEDDING OF</small><h1>Bala <i>&</i> Indu</h1><p>Together, a beautiful beginning.</p><footer>DESIGN PREVIEW · WEDDING DETAILS COMING SOON</footer></div><img src="http://127.0.0.1:5190/assets/pavilion.svg"/></body></html>`);
await card.locator('img').evaluate(img=>img.decode());await card.screenshot({path:'assets/share-preview.png'});await card.close();
await page.goto('http://127.0.0.1:5190');await page.getByRole('heading',{name:'Bala & Indu',exact:true}).waitFor();
assert.equal(await page.locator('img').evaluateAll(images=>images.every(i=>i.complete&&i.naturalWidth>0)),true);
assert.ok(await page.getByText('Design preview · wedding details coming soon',{exact:false}).isVisible());
await page.screenshot({path:'artifacts/desktop.png',fullPage:true});
await page.getByRole('link',{name:'You’re invited',exact:true}).click();assert.equal(new URL(page.url()).hash,'#celebrations');
await page.getByRole('button',{name:'A little more detail',exact:false}).first().click();await page.getByRole('dialog').waitFor({state:'visible'});assert.ok((await page.locator('#dialog-message').innerText()).includes('confirmed date'));
await page.getByRole('button',{name:'Lovely, got it',exact:false}).click();await page.getByRole('dialog').waitFor({state:'hidden'});
await page.getByRole('button',{name:'A little more detail',exact:false}).last().click();assert.ok((await page.locator('#dialog-message').innerText()).includes('does not accept RSVPs'));await page.keyboard.press('Escape');
for(const width of [320,375,390,768,1024,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`No overflow at ${width}px`);}
await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:5190');await page.screenshot({path:'artifacts/mobile.png',fullPage:true});
assert.equal(await page.locator('meta[property="og:image"]').getAttribute('content'),'https://indu-jk.github.io/Bala-weds-Indu/assets/share-preview.png');
assert.equal(await page.locator('a[href^="tel:"],a[href^="mailto:"]').count(),0);
assert.deepEqual(errors,[]);console.log('Passed: desktop/mobile illustration, 6 responsive widths, anchor navigation, event dialogs, Escape dismissal, honest sample details, social metadata, no runtime errors.');await browser.close();
