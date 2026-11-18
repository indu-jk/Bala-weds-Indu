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
function toast(text) { clearTimeout(toastTimer); $('#toast').textContent = text; $('#toast').hidden = false; toastTimer = setTimeout(() => $('#toast').hidden = true, 4500); }
function safeUrl(value) { try { const url = new URL(value, location.href); return ['https:', 'http:', 'file:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } }
function showDetails(message, trigger) { lastDialogTrigger = trigger; $('#dialog-message').textContent = message; $('#details-dialog').showModal(); }
function closeDetails() { $('#details-dialog').close(); lastDialogTrigger?.focus({ preventScroll: true }); }
$('.dialog-close').addEventListener('click', closeDetails); $('.dialog-done').addEventListener('click', closeDetails);
$('#details-dialog').addEventListener('click', event => { if (event.target !== event.currentTarget) return; const r = event.currentTarget.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeDetails(); });
all('[data-groom]').forEach(el => el.textContent = config.groom);
all('[data-bride]').forEach(el => el.textContent = config.bride);
all('[data-groom-initial]').forEach(el => el.textContent = config.groom.slice(0, 1));
all('[data-bride-initial]').forEach(el => el.textContent = config.bride.slice(0, 1));
if (config.groomParents) $('#groom-family').textContent = config.groomParents;
if (config.brideParents) $('#bride-family').textContent = config.brideParents;
function portrait(selector, url, name) {
  if (!safeUrl(url) || !url) return;
  const image = new Image();
  image.alt = name;
  image.loading = 'lazy';
  image.onload = () => {
    const parent = $(selector);
    if (parent) parent.replaceChildren(image);
  };
  image.onerror = () => {
    if (url.includes('bala.webp')) {
      portrait(selector, 'assets/Bala.png', name);
    } else if (url.includes('Bala.png')) {
      portrait(selector, 'assets/bala.png', name);
    } else if (url.includes('bride.webp')) {
      portrait(selector, 'assets/bride.jpg', name);
    }
  };
  image.src = safeUrl(url);
}
portrait('#groom-portrait', config.groomPhoto, config.groom);
portrait('#bride-portrait', config.bridePhoto, config.bride);
all('.name-line').forEach(line => {
  const name = line.textContent.trim();
  line.textContent = '';
  line.setAttribute('aria-label', name);
  let globalIndex = 0;
  const words = name.split(/\s+/);
  words.forEach((word, wIdx) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'name-word';
    wordSpan.style.display = 'inline-block';
    wordSpan.style.whiteSpace = 'nowrap';
    [...word].forEach(letter => {
      const span = document.createElement('span');
      span.textContent = letter;
      span.style.setProperty('--letter-index', globalIndex++);
      span.setAttribute('aria-hidden', 'true');
      wordSpan.append(span);
    });
    line.append(wordSpan);
    if (wIdx < words.length - 1) {
      const spaceSpan = document.createElement('span');
      spaceSpan.innerHTML = '&nbsp;';
      spaceSpan.setAttribute('aria-hidden', 'true');
      line.append(spaceSpan);
      globalIndex++;
    }
  });
});
function formatDate(value) { if (!value) return ''; const date = new Date(value.length === 10 ? `${value}T12:00:00` : value); return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(date); }
if (config.locationLabel) $('[data-location]').textContent = config.locationLabel;
const weddingTime = config.ceremonyDate ? Date.parse(config.ceremonyDate) : NaN;
if (Number.isFinite(weddingTime)) { const formatted = formatDate(config.ceremonyDate); $('[data-date-label]').textContent = formatted.toUpperCase(); $('#countdown-date').textContent = `Our forever begins on ${formatted}`; }
function updateCountdown() {
  if (!Number.isFinite(weddingTime)) return;
  const remaining = Math.max(0, Math.floor((weddingTime - Date.now()) / 1000));
  const values = [Math.floor(remaining / 86400), Math.floor(remaining % 86400 / 3600), Math.floor(remaining % 3600 / 60), remaining % 60];
  ['days', 'hours', 'minutes', 'seconds'].forEach((id, i) => $('#' + id).textContent = String(values[i]).padStart(2, '0'));
  if (weddingTime <= Date.now()) $('#countdown-note').textContent = 'Our forever has begun. Thank you for being part of our story.';
}
updateCountdown(); if (Number.isFinite(weddingTime)) setInterval(updateCountdown, 1000);
function textNode(tag, text, className) { const el = document.createElement(tag); el.textContent = text; if (className) el.className = className; return el; }
if ($('#event-grid')) $('#event-grid').replaceChildren();
(config.events || []).forEach((event, index) => {
  const card = document.createElement('article'); card.className = 'event-card reveal';
  card.append(textNode('span', index === 0 ? 'THE SACRED BEGINNING' : 'THE CELEBRATION', 'event-index'));
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); icon.classList.add('event-symbol'); icon.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use'); use.setAttribute('href', index === 0 ? '#lotus' : '#calendar-icon'); icon.append(use); card.append(icon);
  card.append(textNode('h3', event.title), textNode('p', event.subtitle, 'event-subtitle'), textNode('div', '', 'event-separator'));
  const list = document.createElement('dl');
  [['DATE', formatDate(event.date) || 'To be announced'], ['TIME', event.time || 'The auspicious time, coming soon'], ['VENUE', event.venue || 'A beautiful place, to be revealed']].forEach(([label, value]) => { const wrapper = document.createElement('div'); wrapper.append(textNode('dt', label), textNode('dd', value)); list.append(wrapper); });
  if (event.address) list.append(textNode('dd', event.address, 'venue-address')); card.append(list);
  const action = textNode('button', safeUrl(event.mapUrl) && event.mapUrl ? 'View directions ↗' : 'Details coming soon ↗', 'button'); action.type = 'button'; action.setAttribute('aria-label', `${event.title}: ${event.mapUrl ? 'view directions' : 'details coming soon'}`);
  action.addEventListener('click', () => { const url = event.mapUrl && safeUrl(event.mapUrl); if (url) window.open(url, '_blank', 'noopener,noreferrer'); else showDetails(`The date, time, venue and directions for our ${event.title.toLowerCase()} will be added when they are confirmed. This is a design preview. We look forward to sharing the beautiful details with you.`, action); }); card.append(action); $('#event-grid').append(card);
});
$('#calendar-button').addEventListener('click', event => {
  if (!Number.isFinite(weddingTime)) { showDetails('The wedding date has not been announced yet. Once the date and time are confirmed, this button will let you add the celebration to your calendar.', event.currentTarget); return; }
  const icsEscape = value => String(value).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  const utc = date => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const start = new Date(weddingTime); const end = new Date(weddingTime + 2 * 3600000);
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bala Subramani weds Indu Mathi//Wedding Invitation//EN', 'BEGIN:VEVENT', `UID:bala-subramani-indu-mathi-wedding-${weddingTime}@invitation`, `DTSTAMP:${utc(new Date())}`, `DTSTART:${utc(start)}`, `DTEND:${utc(end)}`, `SUMMARY:${icsEscape(config.groom + ' & ' + config.bride + ' — Wedding')}`, `LOCATION:${icsEscape(config.events[0]?.venue || 'Venue to be announced')}`, 'END:VEVENT', 'END:VCALENDAR'];
  const blob = new Blob([lines.join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'Bala-Subramani-and-Indu-Mathi-wedding.ics'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
$('#rsvp-button')?.addEventListener('click', event => { const number = String(config.rsvpPhone || '').replace(/\D/g, ''); if (number.length >= 8) window.open(`https://wa.me/${number}`, '_blank', 'noopener,noreferrer'); else showDetails('RSVP contact details will be added once they are confirmed. This preview does not collect or submit guest information. For now, we’re simply delighted to share this invitation with you.', event.currentTarget); });
all('[data-share]').forEach(button => button.addEventListener('click', async () => {
  const url = safeUrl(config.siteUrl) || location.href;
  try { if (navigator.share) { await navigator.share({ title: `${config.groom} weds ${config.bride}`, text: 'With love and blessings, a beautiful beginning. Wedding details coming soon.', url }); return; } if (navigator.clipboard && isSecureContext) { await navigator.clipboard.writeText(url); toast('Invitation link copied. Share a little joy.'); } else showDetails(`Copy this invitation link to share: ${url}`, button); } catch (error) { if (error.name !== 'AbortError') toast('Please copy the invitation link from your address bar.'); }
}));
// Gallery: keyboard-friendly controls, touch swipes, and quiet automatic transitions.
if ($('#gallery-stage')) {
  if (config.gallery?.length) { $('#gallery-stage').replaceChildren(); config.gallery.forEach((photo, index) => { const url = safeUrl(photo.src); if (!url) return; const figure = document.createElement('figure'); figure.className = `gallery-slide ${index === 0 ? 'is-active' : ''}`; const img = new Image(); img.src = url; img.alt = photo.alt || `Wedding memory ${index + 1}`; img.loading = 'lazy'; figure.append(img); $('#gallery-stage').append(figure); }); $('#gallery-description').textContent = 'Little moments from our journey, memories we’ll cherish forever.'; }
  const slides = all('.gallery-slide'); let slideIndex = 0; let galleryVisible = false; let galleryPaused = false; let swipeX = null;
  function showSlide(index) { if (!slides.length) return; slideIndex = (index + slides.length) % slides.length; slides.forEach((slide, i) => { slide.classList.toggle('is-active', i === slideIndex); slide.setAttribute('aria-hidden', String(i !== slideIndex)); }); all('.gallery-dots button').forEach((dot, i) => { dot.classList.toggle('is-active', i === slideIndex); dot.setAttribute('aria-pressed', String(i === slideIndex)); }); }
  slides.forEach((_, i) => { const dot = document.createElement('button'); dot.type = 'button'; dot.setAttribute('aria-label', `Show gallery image ${i + 1}`); dot.addEventListener('click', () => showSlide(i)); $('#gallery-dots')?.append(dot); }); if (slides.length) showSlide(0);
  $('#gallery-prev')?.addEventListener('click', () => showSlide(slideIndex - 1)); $('#gallery-next')?.addEventListener('click', () => showSlide(slideIndex + 1));
  $('#gallery-stage')?.addEventListener('touchstart', event => { swipeX = event.changedTouches[0].clientX; }, { passive: true }); $('#gallery-stage')?.addEventListener('touchend', event => { if (swipeX === null) return; const delta = event.changedTouches[0].clientX - swipeX; if (Math.abs(delta) > 40) showSlide(slideIndex + (delta < 0 ? 1 : -1)); swipeX = null; }, { passive: true });
  $('.gallery-wrap')?.addEventListener('mouseenter', () => galleryPaused = true); $('.gallery-wrap')?.addEventListener('mouseleave', () => galleryPaused = false); $('.gallery-wrap')?.addEventListener('focusin', () => galleryPaused = true); $('.gallery-wrap')?.addEventListener('focusout', () => galleryPaused = false);
  setInterval(() => { if (opened && galleryVisible && !galleryPaused && !document.hidden && !reducedMotion.matches && slides.length > 1) showSlide(slideIndex + 1); }, 6500);
}
// Traditional Hindu Wedding Background Music
const weddingAudio = $('#wedding-audio');
if (weddingAudio) weddingAudio.volume = 0.64;
function soundState(on) {
  const btn = $('#sound-button');
  if (!btn) return;
  btn.setAttribute('aria-pressed', String(on));
  btn.setAttribute('aria-label', on ? 'Pause wedding music' : 'Play wedding music');
  const label = $('#sound-label');
  if (label) label.textContent = on ? 'Music on' : 'Music off';
}
async function playMusic() {
  if (!weddingAudio) return;
  try {
    weddingAudio.volume = 0.64;
    await weddingAudio.play();
    soundState(true);
  } catch (e) {
    soundState(false);
  }
}
function stopMusic() {
  if (!weddingAudio) return;
  weddingAudio.pause();
  soundState(false);
}
$('#sound-button')?.addEventListener('click', async () => {
  if (!weddingAudio) return;
  if (weddingAudio.paused) {
    await playMusic();
  } else {
    stopMusic();
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopMusic();
});
if (weddingAudio) {
  weddingAudio.addEventListener('ended', () => soundState(false));
  weddingAudio.addEventListener('pause', () => soundState(false));
  weddingAudio.addEventListener('play', () => soundState(true));
}
// Festive Color Poppers Celebration
const popperCanvas = $('#popper-canvas');
const popperCtx = popperCanvas ? popperCanvas.getContext('2d') : null;
let popperParticles = [];
let popperFrame = 0;

function resizePopperCanvas() {
  if (!popperCanvas || !popperCtx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  popperCanvas.width = window.innerWidth * dpr;
  popperCanvas.height = window.innerHeight * dpr;
  popperCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

const POPPER_COLORS = [
  '#e63946', '#ff4d6d', '#ffd166', '#f4a261',
  '#dfb868', '#06d6a0', '#2a9d8f', '#4cc9f0',
  '#7209b7', '#b5179e', '#fff3b0'
];

function createPopperBurst(x, y, count, baseAngleDeg, spreadDeg, minSpeed, maxSpeed) {
  for (let i = 0; i < count; i++) {
    const angle = (baseAngleDeg + (Math.random() - 0.5) * spreadDeg) * (Math.PI / 180);
    const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
    const shape = Math.random() < 0.65 ? 'rect' : (Math.random() < 0.6 ? 'circle' : 'star');
    popperParticles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      w: 6 + Math.random() * 6,
      h: 10 + Math.random() * 9,
      r: 3 + Math.random() * 3.5,
      color: POPPER_COLORS[Math.floor(Math.random() * POPPER_COLORS.length)],
      shape,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.25,
      tilt: Math.random() * Math.PI,
      tiltSpeed: 0.05 + Math.random() * 0.1,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.04 + Math.random() * 0.06,
      gravity: 0.38 + Math.random() * 0.22,
      drag: 0.97 + Math.random() * 0.015,
      life: 0,
      maxLife: 200 + Math.random() * 70
    });
  }
}

function drawPopperStar(context, cx, cy, spikes, outerRadius, innerRadius) {
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;
  context.beginPath();
  context.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    context.lineTo(x, y);
    rot += step;
    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    context.lineTo(x, y);
    rot += step;
  }
  context.lineTo(cx, cy - outerRadius);
  context.closePath();
  context.fill();
}

function animatePoppers() {
  popperFrame = 0;
  if (!popperCtx || !popperCanvas) return;
  const w = window.innerWidth;
  const h = window.innerHeight;

  popperCtx.clearRect(0, 0, w, h);

  let activeCount = 0;
  for (let i = 0; i < popperParticles.length; i++) {
    const p = popperParticles[i];
    p.life++;
    if (p.life >= p.maxLife || p.y > h + 60) continue;
    activeCount++;

    p.vx *= p.drag;
    p.vy = p.vy * p.drag + p.gravity;
    p.x += p.vx + Math.sin(p.wobble) * 1.2;
    p.y += p.vy;
    p.wobble += p.wobbleSpeed;
    p.rotation += p.rotationSpeed;
    p.tilt += p.tiltSpeed;

    const remaining = p.maxLife - p.life;
    const alpha = remaining < 60 ? Math.max(0, remaining / 60) : 1;

    popperCtx.save();
    popperCtx.translate(p.x, p.y);
    popperCtx.rotate(p.rotation);
    popperCtx.scale(Math.cos(p.tilt), 1);
    popperCtx.globalAlpha = alpha;
    popperCtx.fillStyle = p.color;

    if (p.shape === 'circle') {
      popperCtx.beginPath();
      popperCtx.arc(0, 0, p.r, 0, Math.PI * 2);
      popperCtx.fill();
    } else if (p.shape === 'star') {
      drawPopperStar(popperCtx, 0, 0, 4, p.w * 0.7, p.w * 0.28);
    } else {
      popperCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    }

    popperCtx.restore();
  }

  if (activeCount > 0) {
    popperFrame = requestAnimationFrame(animatePoppers);
  } else {
    popperCtx.clearRect(0, 0, w, h);
    popperParticles = [];
  }
}

function launchPoppers() {
  if (!popperCanvas || !popperCtx || reducedMotion.matches) return;
  resizePopperCanvas();
  popperParticles = [];
  const w = window.innerWidth;
  const h = window.innerHeight;

  // Dual cannons from bottom corners shooting inwards & upwards + center burst
  createPopperBurst(w * 0.08, h * 0.98, 90, -60, 45, 24, 40);
  createPopperBurst(w * 0.92, h * 0.98, 90, -120, 45, 24, 40);
  createPopperBurst(w * 0.5, h * 0.58, 70, -90, 360, 12, 28);

  // Second celebratory pop wave 220ms later
  setTimeout(() => {
    if (document.hidden) return;
    createPopperBurst(w * 0.04, h * 0.92, 60, -50, 40, 22, 38);
    createPopperBurst(w * 0.96, h * 0.92, 60, -130, 40, 22, 38);
  }, 220);

  if (!popperFrame) {
    popperFrame = requestAnimationFrame(animatePoppers);
  }
}

addEventListener('resize', resizePopperCanvas, { passive: true });
resizePopperCanvas();

// Only the visible hero animates petals. Respect reduced-motion preferences.
const canvas = $('#petals'); const ctx = canvas.getContext('2d'); let particles = []; let petalFrame = 0; let heroVisible = true; let previousTime = 0;
function sizeCanvas() { const r = $('#home').getBoundingClientRect(); const ratio = Math.min(devicePixelRatio || 1, 2); canvas.width = r.width * ratio; canvas.height = r.height * ratio; ctx?.setTransform(ratio, 0, 0, ratio, 0, 0); particles = Array.from({ length: innerWidth < 600 ? 20 : 42 }, () => ({ x: Math.random() * r.width, y: Math.random() * r.height, size: 2 + Math.random() * 3.5, speed: 10 + Math.random() * 22, angle: Math.random() * Math.PI * 2, spin: (Math.random() - .5) * .6, color: ['#e2b4a7', '#dfb868', '#f3e2c4', '#b77a70'][Math.floor(Math.random() * 4)] })); }
function animatePetals(time) { petalFrame = 0; if (!opened || !heroVisible || document.hidden || reducedMotion.matches || !ctx) { previousTime = 0; return; } const r = $('#home').getBoundingClientRect(); const dt = previousTime ? Math.min((time - previousTime) / 1000, .05) : .016; previousTime = time; ctx.clearRect(0, 0, r.width, r.height); particles.forEach(p => { p.y += p.speed * dt; p.x += Math.sin(p.angle) * 9 * dt; p.angle += p.spin * dt; if (p.y > r.height + 10) { p.y = -10; p.x = Math.random() * r.width; } ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle); ctx.globalAlpha = .45; ctx.fillStyle = p.color; ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * .48, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }); petalFrame = requestAnimationFrame(animatePetals); }
function startPetals() { if (!petalFrame) petalFrame = requestAnimationFrame(animatePetals); }
function updateScroll() { if (!opened) return; const y = scrollY; if (!reducedMotion.matches && heroVisible) $('.hero-image').style.setProperty('--parallax', `${Math.min(y * .12, 95)}px`); }
let scrollQueued = false; addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(() => { updateScroll(); scrollQueued = false; }); } }, { passive: true });
if ('IntersectionObserver' in window) { const reveals = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); reveals.unobserve(entry.target); } }), { threshold: .1 }); all('.reveal').forEach(el => reveals.observe(el)); new IntersectionObserver(entries => { heroVisible = entries[0].isIntersecting; if (heroVisible) startPetals(); }, { threshold: 0 }).observe($('#home')); if ($('#gallery-stage')) new IntersectionObserver(entries => { galleryVisible = entries[0].isIntersecting; }, { threshold: .15 }).observe($('#gallery-stage')); } else all('.reveal').forEach(el => el.classList.add('is-visible'));
addEventListener('resize', () => { sizeCanvas(); updateScroll(); }, { passive: true }); document.addEventListener('visibilitychange', () => { if (!document.hidden) startPetals(); }); reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) { cancelAnimationFrame(petalFrame); petalFrame = 0; ctx?.clearRect(0, 0, canvas.width, canvas.height); } else startPetals(); }); sizeCanvas();
$('#open-invitation').addEventListener('click', event => {
  if (opened) return; opened = true; event.currentTarget.disabled = true; content.inert = false; document.body.classList.add('invitation-open'); welcome.classList.add('is-opening'); if ($('.bottom-nav')) $('.bottom-nav').hidden = false; $('#sound-button').hidden = false; window.scrollTo({ top: 0, behavior: 'instant' });
  launchPoppers();
  startPetals();
  updateScroll();
  playMusic();
  setTimeout(() => { welcome.hidden = true; $('#couple-names').tabIndex = -1; $('#couple-names').focus({ preventScroll: true }); }, reducedMotion.matches ? 20 : 1450);
});
