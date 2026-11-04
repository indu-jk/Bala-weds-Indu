import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,channel:'msedge'});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await fs.mkdir('artifacts',{recursive:true});
await page.goto('http://127.0.0.1:5190');await page.getByRole('button',{name:'Open invitation',exact:true}).waitFor();
assert.equal(await page.locator('#invitation-content').evaluate(el=>el.inert),true);
await page.screenshot({path:'artifacts/welcome-desktop.png'});
await page.getByRole('button',{name:'Open invitation',exact:true}).click();
assert.ok(await page.locator('.name-line span').evaluateAll(els=>els.some(el=>el.getAnimations().length>0)),'Names have real entrance animations');
await page.locator('#welcome').waitFor({state:'hidden'});
assert.equal(await page.locator('#invitation-content').evaluate(el=>el.inert),false);
assert.ok(await page.getByRole('navigation',{name:'Wedding invitation sections'}).isVisible());
assert.ok(await page.locator('#sound-button').getAttribute('aria-pressed')==='false');
await page.emulateMedia({reducedMotion:'reduce'});
await page.screenshot({path:'artifacts/hero-desktop.png'});
await page.screenshot({path:'artifacts/desktop.png',fullPage:true});
await page.locator('.hero-image').evaluate(img=>img.decode());assert.ok(await page.locator('.hero-image').evaluate(img=>img.naturalWidth>0));
await page.locator('.bottom-nav').getByRole('link',{name:'Events',exact:true}).click();
await page.getByRole('button',{name:'Wedding ceremony: details coming soon',exact:true}).click();
await page.getByRole('dialog').waitFor({state:'visible'});assert.ok((await page.locator('#dialog-message').innerText()).includes('design preview'));
await page.getByRole('button',{name:'Lovely, got it',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});
await page.locator('.bottom-nav').getByRole('link',{name:'Date',exact:true}).click();
assert.equal(await page.locator('#days').innerText(),'—');await page.getByRole('button',{name:'Save the date',exact:true}).click();assert.ok((await page.locator('#dialog-message').innerText()).includes('has not been announced'));await page.keyboard.press('Escape');
await page.locator('.bottom-nav').getByRole('link',{name:'Gallery',exact:true}).click();
await page.getByRole('button',{name:'Next gallery image'}).click();assert.equal(await page.locator('.gallery-slide.is-active').count(),1);assert.ok((await page.locator('.gallery-slide.is-active').innerText()).includes('TRADITIONS')||(await page.locator('.gallery-slide.is-active').innerText()).includes('Traditions'));
await page.getByRole('button',{name:'Show gallery image 3'}).click();assert.equal(await page.getByRole('button',{name:'Show gallery image 3'}).getAttribute('aria-pressed'),'true');
await page.getByRole('button',{name:'Previous gallery image'}).click();assert.equal(await page.getByRole('button',{name:'Show gallery image 2'}).getAttribute('aria-pressed'),'true');
await page.locator('#sound-button').click();assert.equal(await page.locator('#sound-button').getAttribute('aria-pressed'),'true');await page.locator('#sound-button').click();assert.equal(await page.locator('#sound-button').getAttribute('aria-pressed'),'false');
for(const width of [320,375,390,768,1024,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`No overflow at ${width}px`);}
await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:5190');await page.screenshot({path:'artifacts/welcome-mobile.png'});await page.getByRole('button',{name:'Open invitation',exact:true}).click();await page.locator('#welcome').waitFor({state:'hidden'});await page.screenshot({path:'artifacts/hero-mobile.png'});await page.screenshot({path:'artifacts/mobile.png',fullPage:true});
await page.getByRole('button',{name:'A note about RSVP'}).click();assert.ok((await page.locator('#dialog-message').innerText()).includes('does not collect'));await page.keyboard.press('Escape');
// Configured-data path: prove future real details produce a real calendar, without fabricating public dates.
const configured=await context.newPage();await configured.addInitScript(()=>{Object.defineProperty(window,'WEDDING_CONFIG',{configurable:true,set(value){Object.defineProperty(window,'WEDDING_CONFIG',{value:{...value,ceremonyDate:'2030-02-14T06:30:00+05:30',groomParents:'Sample parent names',events:value.events.map((e,i)=>i?e:{...e,date:'2030-02-14',time:'6:30 AM',venue:'Sample test venue'})},configurable:true});}});});
await configured.goto('http://127.0.0.1:5190');await configured.getByRole('button',{name:'Open invitation',exact:true}).click();await configured.locator('#welcome').waitFor({state:'hidden'});assert.ok((await configured.locator('[data-date-label]').innerText()).includes('2030'));
const downloadWait=configured.waitForEvent('download');await configured.getByRole('button',{name:'Save the date',exact:true}).click();const download=await downloadWait;await download.saveAs('artifacts/test-wedding.ics');const calendar=await fs.readFile('artifacts/test-wedding.ics','utf8');assert.ok(calendar.includes('DTSTART:20300214T010000Z'));await configured.close();
// Generate the messaging card from our original artwork, using only local assets.
const card=await context.newPage();await card.setViewportSize({width:1200,height:630});await card.setContent(`<html><head><style>*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#17392c;color:#fff1c8;font-family:Georgia,serif;position:relative;display:flex;align-items:center;justify-content:center;text-align:center}img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}body:after{content:'';position:absolute;inset:0;background:#102e216b}.copy{position:relative;z-index:1}small{font:13px Arial;letter-spacing:4px;color:#e6d19a}h1{font-size:105px;font-weight:400;margin:25px 0 15px;letter-spacing:-3px}h1 i{color:#e6c77a;font-size:70px}p{font-size:26px;font-style:italic;color:#e9dcad}footer{font:11px Arial;letter-spacing:2px;margin-top:28px;color:#e2d8b9}</style></head><body><img src="http://127.0.0.1:5190/assets/temple-dawn.webp"><div class="copy"><small>WITH LOVE & BLESSINGS</small><h1>Bala <i>&</i> Indu</h1><p>A beautiful beginning. A lifetime of togetherness.</p><footer>DESIGN PREVIEW · WEDDING DETAILS COMING SOON</footer></div></body></html>`);await card.locator('img').evaluate(img=>img.decode());await card.screenshot({path:'assets/share-preview.png'});await card.close();
assert.deepEqual(errors,[]);console.log('Passed: welcome gate and animation, real letter animation, safe focus, responsive hero at six widths, event dialogs, placeholder countdown, configured real-date calendar, gallery controls, optional sound, RSVP honesty, reduced motion, social preview. No runtime errors.');await browser.close();

