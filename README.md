# Slayed Hair & Esthetics — website

Plain static website (HTML/CSS/JavaScript). There are no npm dependencies. A tiny Node script checks the salon content before each deploy.

## Where the content lives

All salon information is in the **`content/`** folder. The pages read it from there, so each fact is written once.

| File | What it holds | Used by |
|---|---|---|
| `content/contact.json` | Business name, address, phone, email, map link, "Get in touch" text | Homepage contact section and footer, services footer, booking pop-up (where requests are emailed) |
| `content/hours.json` | Opening hours for every weekday, plus days limited to esthetic services | Homepage opening hours, mobile menu, booking pop-up (which days and times can be picked) |
| `content/booking.json` | Booking rules: time-slot spacing, minimum notice, how many days ahead | Booking pop-up |
| `content/team.json` | Specialists: name, photo, short description, team-card text, esthetic flag | Homepage team cards, services page, booking pop-up |
| `content/services.json` | Categories and services: name, description, duration, photo, who offers it and at what price | Services page, booking pop-up, footer service links |
| `content/gallery.json` | "Recent work" photos with descriptions (optional "before" photo) | Homepage gallery |

Staff edit these files through **Pages CMS** (https://app.pagescms.org), a free form-based editor that saves changes straight to this repository. Its setup is in `.pages.yml`.

See **[CONTENT-GUIDE.md](CONTENT-GUIDE.md)** for using the editor and for editing each file by hand.

## How it fits together

```
content/*.json ──► scripts/build-content.mjs ──► content.js ──► index.html, services.html, Booking.dc.html
                    (checks everything; stops on errors)    (window.SLAYED_CONTENT)
```

- `content.js` is **generated**, so don't edit it by hand. It is committed, so the site also works when opened as plain files.
- Netlify runs `node scripts/build-content.mjs` on every deploy (see `netlify.toml`).
  - If the content has an error, the deploy stops, the live site stays unchanged, and the deploy log lists the problem.
- To check the content locally, run `node scripts/build-content.mjs`. Add `--check` to only validate and confirm that `content.js` is up to date.

## Files

- `index.html`: homepage
- `services.html`: services page
- `Booking.dc.html`: booking pop-up (loaded by both pages)
- `content/`, `content.js`, `scripts/build-content.mjs`: salon content (see above)
- `support.js`: page runtime
- `tokens.css`, `bundle.css`, `bundle.js`, `Nomine-Regular.woff2`: design system and font
- All other files: photos, logos, hero video, favicons
