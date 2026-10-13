# Slayed Hair & Esthetics — website

Plain static website (HTML/CSS/JavaScript). No build step, no dependencies.
All files sit in this one folder — keep them together.

- index.html — homepage
- services.html — services page
- Booking.dc.html — booking pop-up (loaded by both pages)
- support.js — page runtime
- tokens.css, bundle.css, bundle.js, Nomine-Regular.woff2 — design system and font
- all other files — photos, logos, hero video

Netlify: build command `echo 'Static site - no build step needed'` (set in netlify.toml), publish directory `.`
