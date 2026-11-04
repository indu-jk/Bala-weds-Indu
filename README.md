# Bala weds Indu — animated Hindu wedding invitation

An original, mobile-first sample inspired by the invitation experience at https://vishnu-weds-rathiga.invytale.in/ . Built as a static site for GitHub Pages and WhatsApp sharing. The reference couple's photos, event details, source code, and music are not included.

## Preview

```sh
python -m http.server 5190 --bind 127.0.0.1
```

Open http://127.0.0.1:5190/ . Tap **Open invitation** for the animated entrance. Sound is optional and starts only after tapping its control.

## Add the real details later

Edit **wedding-data.js**. All couple names, parent details, portrait URLs, event dates/times, venues, directions, RSVP contact and gallery photos are configured there. Empty values display honest placeholders. No guest information is collected in the sample.

- `ceremonyDate`: full ISO date/time including offset, e.g. `2027-02-14T06:30:00+05:30`. Leave blank until confirmed. A real date activates the countdown and .ics calendar download; the sample shows dashes instead of inventing a date. Expired countdowns stop at zero.
- `events`: one or more event objects with `title`, `subtitle`, `date`, `time`, `venue`, `address`, `mapUrl`. Leave unknown values blank. Configured map URLs open only after a guest clicks directions.
- `groomPhoto`, `bridePhoto`: relative image paths or HTTPS URLs. Current monograms are labelled photo placeholders.
- `gallery`: array of `{src, alt}` objects. Empty uses a clearly labelled artwork moodboard. Add actual photos under `assets/` and use relative paths.
- `rsvpPhone`: international number with country code. Blank opens an explanatory note; configured contact opens WhatsApp without automatically sending a message.
- `siteUrl`: used by the share action.

After details are confirmed, remove design-preview labels and update social metadata/share image as appropriate.

## Experience

- Original Ganesha line illustration and sliding-panel welcome entrance.
- Generated original temple-at-sunrise image with jasmine, marigolds, banana leaves and brass lamps, compressed to a ~231 KB WebP.
- Staggered name reveal, scroll reveals, gentle parallax and falling-petal canvas. Petals pause when the hero is offscreen or the document hidden. Reduced-motion preferences disable decorative motion.
- Fixed section navigation, couple profiles, celebration cards, countdown, personal invitation letter and crossfading gallery with dots/arrows and touch swipes.
- Optional original synthesized ambient chimes. No third-party recording. Sound pauses when the browser tab is hidden.
- Native accessible details dialog, calendar download when a date is configured, and share/copy-link fallback.
- Original local Open Graph PNG for messaging previews. WhatsApp controls its own preview caching.

## Publish

Repository: https://github.com/indu-jk/Bala-weds-Indu

Pages URL: https://indu-jk.github.io/Bala-weds-Indu/

Publish from `main`, directory `/`, with `.nojekyll`. MKJaswanth has code write access, but the repository owner may need to enable Pages under Settings → Pages. Do not expose any credentials in this public repository.

## Verification

`node --check script.js`

`node scripts/check-invitation.mjs` (requires Playwright and installed Edge; run the preview server first). It checks the welcome gate, actual entrance animations, six responsive widths, details dialogs, gallery controls, optional sound, reduced motion, future configured dates and calendar timezone conversion. Test-only real dates are injected into an isolated browser and never saved to the public invitation.

Local screenshots and test calendar files are in ignored `artifacts/`. The script also creates the original social preview PNG.
