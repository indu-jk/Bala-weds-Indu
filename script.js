'use strict';
// Only the couple's names are confirmed. Keep unknown details honest in the sample.
const wedding = Object.freeze({
  couple: 'Bala & Indu',
  url: 'https://indu-jk.github.io/Bala-weds-Indu/',
  events: {
    wedding: 'We’re putting together the details of our wedding ceremony. The confirmed date, time, venue, and directions will appear here. For now, enjoy this little first look at the invitation.',
    reception: 'An evening to celebrate with the people we love. Reception timing, venue, and RSVP contact will be added once they are confirmed. This sample does not accept RSVPs.'
  }
});
const dialog = document.querySelector('#details-dialog');
const message = document.querySelector('#dialog-message');
let lastTrigger = null;
document.querySelectorAll('[data-event]').forEach(button => button.addEventListener('click', () => {
  lastTrigger = button;
  message.textContent = wedding.events[button.dataset.event];
  dialog.showModal();
}));
function closeDetails() { dialog.close(); lastTrigger?.focus(); }
document.querySelector('.dialog-close').addEventListener('click', closeDetails);
document.querySelector('.dialog-done').addEventListener('click', closeDetails);
dialog.addEventListener('click', event => { if(event.target === dialog) { const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeDetails(); } });
let toastTimer;
function toast(text) { const element=document.querySelector('#toast');clearTimeout(toastTimer);element.textContent=text;element.hidden=false;toastTimer=setTimeout(()=>{element.hidden=true;},4500); }
document.querySelectorAll('[data-share]').forEach(button => button.addEventListener('click', async () => {
  const share = { title: 'Bala weds Indu', text: 'A beautiful beginning. A little first look at Bala & Indu’s wedding invitation. Event details coming soon.', url: wedding.url };
  try {
    if(navigator.share) { await navigator.share(share); return; }
    if(navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(wedding.url);toast('Invitation link copied. Share a little joy.');return; }
    message.textContent=`Copy this invitation link to share: ${wedding.url}`;lastTrigger=button;dialog.showModal();
  } catch(error) { if(error.name!=='AbortError') toast('Sharing isn’t available here. Copy the invitation link from your address bar.'); }
}));
if('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer=new IntersectionObserver(items=>items.forEach(item=>{if(item.isIntersecting){item.target.classList.add('is-visible');observer.unobserve(item.target);}}),{threshold:.08});
  document.querySelectorAll('.section-heading,.event,.note-copy,.note-illustration,.closing').forEach(element=>{element.classList.add('reveal');observer.observe(element);});
}
