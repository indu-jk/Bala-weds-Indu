'use strict';
const config = window.WEDDING_CONFIG;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const $ = selector => document.querySelector(selector);
const all = selector => [...document.querySelectorAll(selector)];
const welcome = $('#welcome');
const content = $('#invitation-content');
let opened = false;
let toastTimer;
let lastDialogTrigger;
function toast(text) { clearTimeout(toastTimer);$('#toast').textContent=text;$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,4500); }
function safeUrl(value) { try { const url=new URL(value,location.href);return ['https:','http:'].includes(url.protocol)?url.href:''; } catch { return ''; } }
function showDetails(message, trigger) { lastDialogTrigger=trigger;$('#dialog-message').textContent=message;$('#details-dialog').showModal(); }
function closeDetails() { $('#details-dialog').close();lastDialogTrigger?.focus({preventScroll:true}); }
$('.dialog-close').addEventListener('click',closeDetails);$('.dialog-done').addEventListener('click',closeDetails);
$('#details-dialog').addEventListener('click',event=>{if(event.target!==event.currentTarget)return;const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDetails();});
all('[data-groom]').forEach(el=>el.textContent=config.groom);
all('[data-bride]').forEach(el=>el.textContent=config.bride);
all('[data-groom-initial]').forEach(el=>el.textContent=config.groom.slice(0,1));
all('[data-bride-initial]').forEach(el=>el.textContent=config.bride.slice(0,1));
if(config.groomParents)$('#groom-family').textContent=config.groomParents;
if(config.brideParents)$('#bride-family').textContent=config.brideParents;
function portrait(selector,url,name) {
  if(!safeUrl(url)||!url)return;
  const image=new Image();image.alt=name;image.loading='lazy';image.src=safeUrl(url);
  image.onload=()=>{const parent=$(selector);parent.replaceChildren(image);};
}
portrait('#groom-portrait',config.groomPhoto,config.groom);portrait('#bride-portrait',config.bridePhoto,config.bride);
all('.name-line').forEach(line=>{const name=line.textContent;line.textContent='';line.setAttribute('aria-label',name);[...name].forEach((letter,index)=>{const span=document.createElement('span');span.textContent=letter===' '?'\u00a0':letter;span.style.setProperty('--letter-index',index);span.setAttribute('aria-hidden','true');line.append(span);});});
function formatDate(value) { if(!value)return '';const date=new Date(value.length===10?`${value}T12:00:00`:value);return Number.isNaN(date.getTime())?'':new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Kolkata'}).format(date); }
if(config.locationLabel)$('[data-location]').textContent=config.locationLabel;
const weddingTime=config.ceremonyDate?Date.parse(config.ceremonyDate):NaN;
if(Number.isFinite(weddingTime)){const formatted=formatDate(config.ceremonyDate);$('[data-date-label]').textContent=formatted.toUpperCase();$('#countdown-date').textContent=`Our forever begins on ${formatted}`;}
function updateCountdown() {
  if(!Number.isFinite(weddingTime))return;
  const remaining=Math.max(0,Math.floor((weddingTime-Date.now())/1000));
  const values=[Math.floor(remaining/86400),Math.floor(remaining%86400/3600),Math.floor(remaining%3600/60),remaining%60];
  ['days','hours','minutes','seconds'].forEach((id,i)=>$('#'+id).textContent=String(values[i]).padStart(2,'0'));
  if(weddingTime<=Date.now())$('#countdown-note').textContent='Our forever has begun. Thank you for being part of our story.';
}
updateCountdown();if(Number.isFinite(weddingTime))setInterval(updateCountdown,1000);
function textNode(tag,text,className) { const el=document.createElement(tag);el.textContent=text;if(className)el.className=className;return el; }
(config.events||[]).forEach((event,index)=>{
  const card=document.createElement('article');card.className='event-card reveal';
  card.append(textNode('span',`${String(index+1).padStart(2,'0')} / ${index===0?'THE SACRED BEGINNING':'THE CELEBRATION'}`,'event-index'));
  const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.classList.add('event-symbol');icon.setAttribute('aria-hidden','true');
  const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href',index===0?'#lotus':'#calendar-icon');icon.append(use);card.append(icon);
  card.append(textNode('h3',event.title),textNode('p',event.subtitle,'event-subtitle'),textNode('div','','event-separator'));
  const list=document.createElement('dl');
  [['DATE',formatDate(event.date)||'To be announced'],['TIME',event.time||'The auspicious time, coming soon'],['VENUE',event.venue||'A beautiful place, to be revealed']].forEach(([label,value])=>{const wrapper=document.createElement('div');wrapper.append(textNode('dt',label),textNode('dd',value));list.append(wrapper);});
  if(event.address)list.append(textNode('dd',event.address,'venue-address'));card.append(list);
  const action=textNode('button',safeUrl(event.mapUrl)&&event.mapUrl?'View directions ↗':'Details coming soon ↗','button');action.type='button';action.setAttribute('aria-label',`${event.title}: ${event.mapUrl?'view directions':'details coming soon'}`);
  action.addEventListener('click',()=>{const url=event.mapUrl&&safeUrl(event.mapUrl);if(url)window.open(url,'_blank','noopener,noreferrer');else showDetails(`The date, time, venue and directions for our ${event.title.toLowerCase()} will be added when they are confirmed. This is a design preview. We look forward to sharing the beautiful details with you.`,action);});card.append(action);$('#event-grid').append(card);
});
$('#calendar-button').addEventListener('click',event=>{
  if(!Number.isFinite(weddingTime)){showDetails('The wedding date has not been announced yet. Once the date and time are confirmed, this button will let you add the celebration to your calendar.',event.currentTarget);return;}
  const icsEscape=value=>String(value).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
  const utc=date=>date.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const start=new Date(weddingTime);const end=new Date(weddingTime+2*3600000);
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Bala weds Indu//Wedding Invitation//EN','BEGIN:VEVENT',`UID:bala-indu-wedding-${weddingTime}@invitation`,`DTSTAMP:${utc(new Date())}`,`DTSTART:${utc(start)}`,`DTEND:${utc(end)}`,`SUMMARY:${icsEscape(config.groom+' & '+config.bride+' — Wedding')}`,`LOCATION:${icsEscape(config.events[0]?.venue||'Venue to be announced')}`,'END:VEVENT','END:VCALENDAR'];
  const blob=new Blob([lines.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download='Bala-and-Indu-wedding.ics';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
$('#rsvp-button').addEventListener('click',event=>{const number=String(config.rsvpPhone||'').replace(/\D/g,'');if(number.length>=8)window.open(`https://wa.me/${number}`,'_blank','noopener,noreferrer');else showDetails('RSVP contact details will be added once they are confirmed. This preview does not collect or submit guest information. For now, we’re simply delighted to share this first look with you.',event.currentTarget);});
all('[data-share]').forEach(button=>button.addEventListener('click',async()=>{
  const url=safeUrl(config.siteUrl)||location.href;
  try{if(navigator.share){await navigator.share({title:`${config.groom} weds ${config.bride}`,text:'With love and blessings, a beautiful beginning. Wedding details coming soon.',url});return;}if(navigator.clipboard&&isSecureContext){await navigator.clipboard.writeText(url);toast('Invitation link copied. Share a little joy.');}else showDetails(`Copy this invitation link to share: ${url}`,button);}catch(error){if(error.name!=='AbortError')toast('Please copy the invitation link from your address bar.');}
}));
// Gallery: keyboard-friendly controls, touch swipes, and quiet automatic transitions.
if(config.gallery?.length){$('#gallery-stage').replaceChildren();config.gallery.forEach((photo,index)=>{const url=safeUrl(photo.src);if(!url)return;const figure=document.createElement('figure');figure.className=`gallery-slide ${index===0?'is-active':''}`;const img=new Image();img.src=url;img.alt=photo.alt||`Wedding memory ${index+1}`;img.loading='lazy';figure.append(img);$('#gallery-stage').append(figure);});$('#gallery-description').textContent='Little moments from our journey, memories we’ll cherish forever.';}
const slides=all('.gallery-slide');let slideIndex=0;let galleryVisible=false;let galleryPaused=false;let swipeX=null;
function showSlide(index){slideIndex=(index+slides.length)%slides.length;slides.forEach((slide,i)=>{slide.classList.toggle('is-active',i===slideIndex);slide.setAttribute('aria-hidden',String(i!==slideIndex));});all('.gallery-dots button').forEach((dot,i)=>{dot.classList.toggle('is-active',i===slideIndex);dot.setAttribute('aria-pressed',String(i===slideIndex));});}
slides.forEach((_,i)=>{const dot=document.createElement('button');dot.type='button';dot.setAttribute('aria-label',`Show gallery image ${i+1}`);dot.addEventListener('click',()=>showSlide(i));$('#gallery-dots').append(dot);});showSlide(0);
$('#gallery-prev').addEventListener('click',()=>showSlide(slideIndex-1));$('#gallery-next').addEventListener('click',()=>showSlide(slideIndex+1));
$('#gallery-stage').addEventListener('touchstart',event=>{swipeX=event.changedTouches[0].clientX;},{passive:true});$('#gallery-stage').addEventListener('touchend',event=>{if(swipeX===null)return;const delta=event.changedTouches[0].clientX-swipeX;if(Math.abs(delta)>40)showSlide(slideIndex+(delta<0?1:-1));swipeX=null;},{passive:true});
$('.gallery-wrap').addEventListener('mouseenter',()=>galleryPaused=true);$('.gallery-wrap').addEventListener('mouseleave',()=>galleryPaused=false);$('.gallery-wrap').addEventListener('focusin',()=>galleryPaused=true);$('.gallery-wrap').addEventListener('focusout',()=>galleryPaused=false);
setInterval(()=>{if(opened&&galleryVisible&&!galleryPaused&&!document.hidden&&!reducedMotion.matches&&slides.length>1)showSlide(slideIndex+1);},6500);
// Original generated ambient chimes. No third-party recording or automatic playback.
let audioContext=null;let musicTimer=null;let noteIndex=0;const notes=[293.66,392,440,329.63,493.88,440,392,329.63];
function playChime(){if(!audioContext||audioContext.state!=='running')return;const now=audioContext.currentTime;const frequency=notes[noteIndex++%notes.length];[1,2].forEach((harmonic,index)=>{const oscillator=audioContext.createOscillator();const gain=audioContext.createGain();oscillator.type='sine';oscillator.frequency.value=frequency*harmonic;gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(index?0.008:0.028,now+.04);gain.gain.exponentialRampToValueAtTime(.0001,now+3.5);oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start(now);oscillator.stop(now+3.6);});}
function soundState(on){$('#sound-button').setAttribute('aria-pressed',String(on));$('#sound-button').setAttribute('aria-label',on?'Pause ambient chimes':'Play ambient chimes');$('#sound-label').textContent=on?'Sound on':'Sound off';}
async function stopSound(){clearInterval(musicTimer);musicTimer=null;soundState(false);if(audioContext?.state==='running')await audioContext.suspend();}
$('#sound-button').addEventListener('click',async()=>{try{if(musicTimer){await stopSound();return;}const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){toast('Sound is not available in this browser.');return;}audioContext=audioContext||new Audio();await audioContext.resume();soundState(true);playChime();musicTimer=setInterval(playChime,2800);}catch{await stopSound();toast('Tap again to enable sound in this browser.');}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)void stopSound();});
// Only the visible hero animates petals. Respect reduced-motion preferences.
const canvas=$('#petals');const ctx=canvas.getContext('2d');let particles=[];let petalFrame=0;let heroVisible=true;let previousTime=0;
function sizeCanvas(){const r=$('#home').getBoundingClientRect();const ratio=Math.min(devicePixelRatio||1,2);canvas.width=r.width*ratio;canvas.height=r.height*ratio;ctx?.setTransform(ratio,0,0,ratio,0,0);particles=Array.from({length:innerWidth<600?20:42},()=>({x:Math.random()*r.width,y:Math.random()*r.height,size:2+Math.random()*3.5,speed:10+Math.random()*22,angle:Math.random()*Math.PI*2,spin:(Math.random()-.5)*.6,color:['#e2b4a7','#dfb868','#f3e2c4','#b77a70'][Math.floor(Math.random()*4)]}));}
function animatePetals(time){petalFrame=0;if(!opened||!heroVisible||document.hidden||reducedMotion.matches||!ctx){previousTime=0;return;}const r=$('#home').getBoundingClientRect();const dt=previousTime?Math.min((time-previousTime)/1000,.05):.016;previousTime=time;ctx.clearRect(0,0,r.width,r.height);particles.forEach(p=>{p.y+=p.speed*dt;p.x+=Math.sin(p.angle)*9*dt;p.angle+=p.spin*dt;if(p.y>r.height+10){p.y=-10;p.x=Math.random()*r.width;}ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.globalAlpha=.45;ctx.fillStyle=p.color;ctx.beginPath();ctx.ellipse(0,0,p.size,p.size*.48,0,0,Math.PI*2);ctx.fill();ctx.restore();});petalFrame=requestAnimationFrame(animatePetals);}
function startPetals(){if(!petalFrame)petalFrame=requestAnimationFrame(animatePetals);}
function updateScroll(){if(!opened)return;const y=scrollY;if(!reducedMotion.matches&&heroVisible)$('.hero-image').style.setProperty('--parallax',`${Math.min(y*.12,95)}px`);const ids=['home','couple','celebrations','date','gallery'];let active='home';ids.forEach(id=>{if($('#'+id).getBoundingClientRect().top<innerHeight*.45)active=id;});all('.bottom-nav a').forEach(a=>{const match=a.hash==='#'+active;a.classList.toggle('is-active',match);if(match)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
let scrollQueued=false;addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(()=>{updateScroll();scrollQueued=false;});}},{passive:true});
if('IntersectionObserver' in window){const reveals=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');reveals.unobserve(entry.target);}}),{threshold:.1});all('.reveal').forEach(el=>reveals.observe(el));new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;if(heroVisible)startPetals();},{threshold:0}).observe($('#home'));new IntersectionObserver(entries=>{galleryVisible=entries[0].isIntersecting;},{threshold:.15}).observe($('#gallery-stage'));}else all('.reveal').forEach(el=>el.classList.add('is-visible'));
addEventListener('resize',()=>{sizeCanvas();updateScroll();},{passive:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden)startPetals();});reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches){cancelAnimationFrame(petalFrame);petalFrame=0;ctx?.clearRect(0,0,canvas.width,canvas.height);}else startPetals();});sizeCanvas();
$('#open-invitation').addEventListener('click',event=>{
  if(opened)return;opened=true;event.currentTarget.disabled=true;content.inert=false;document.body.classList.add('invitation-open');welcome.classList.add('is-opening');$('.bottom-nav').hidden=false;$('#sound-button').hidden=false;window.scrollTo({top:0,behavior:'instant'});startPetals();updateScroll();
  setTimeout(()=>{welcome.hidden=true;$('#couple-names').tabIndex=-1;$('#couple-names').focus({preventScroll:true});},reducedMotion.matches?20:1450);
});
