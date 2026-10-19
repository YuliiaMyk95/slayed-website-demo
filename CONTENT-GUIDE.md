# Editing the salon content

Everything visitors read about the salon lives in six files in the `content/` folder.

## The easy way: the content editor (Pages CMS)

1. Go to **https://app.pagescms.org** and sign in. The owner signs in with GitHub. Staff sign in with the email address they were invited with, and need no GitHub account.
2. Open **slayed-website-demo**. In the left menu you'll see: Services & prices, Team, Opening hours, Contact details, Gallery, Booking rules.
3. Change what you need and click **Save**.
4. The live site updates within about 2 minutes.

**If your change doesn't appear after 5 minutes,** the automatic check found a problem and kept the previous version online. Netlify emails the owner the reason (see "Owner setup" below). Common causes:
- two services with the same code;
- a price filled in both as a number and as text;
- a closing time earlier than the opening time;
- a category's specialists not matching who offers its services (this one is only a warning).

**Owner setup (once):**
- **Install the editor:** sign in at app.pagescms.org with GitHub and install the Pages CMS app on the `slayed-website-demo` repository only.
- **Invite staff:** in the editor, open **Collaborators** and invite each person by email.
- **Get failure emails:** in Netlify, go to **Project configuration → Notifications → Emails → Add notification → "Deploy failed"** and enter your email.
- **Add a specialist:** add the person on the Team page. Then open **Settings** in the editor (or edit `.pages.yml` on GitHub) and add their id to the two `specialist` lists, so they can be picked on the Services page.

The rest of this guide explains each file field by field, for editing them directly on GitHub.

## Ground rules

- **Keep the punctuation.** Text goes in "double quotes". Items in a list are separated by commas, and there is no comma after the last one.
- **Prices are plain numbers**, like `"price": 65`, with no `$` and no quotes. For something that isn't a number, use `"priceText": "Free"` instead.
- **Durations are minutes**, like `90`.
- **Times use the 24-hour clock**, like `"09:00"` or `"17:30"`.
- **Photos:** upload the image file to the main site folder first, then type its exact file name. The editor does this for you.
- **Don't change an `id` or `key` once the site is live.** Links like `services.html#nails` and the booking pop-up depend on them. You can still change the visible `name` freely.
- If something is wrong, the deploy stops and the current site stays online. The Netlify deploy log lists each problem in plain words, for example: *`services.json … "price" "$65" looks like a number — write it without quotes or "$"`*.

## contact.json

| Field | Example | Notes |
|---|---|---|
| `businessName` | `"Slayed Hair & Esthetics"` | |
| `address` | `"88 Mirror Lane, Halifax, NS B3H 0A0"` | Shown in both footers |
| `phone` | `"(902) 555-0147"` | Shown as written |
| `phoneLink` | `"+19025550147"` | The same number in international form, used for tap-to-call. The check makes sure it matches `phone`. |
| `email` | `"hello@…"` | Contact links, the "Get in touch" button, **and the address booking requests are sent to** |
| `directionsUrl` | Google Maps link | The "Get a direction" link |
| `intro` | Text | The "Get in touch" paragraph. `\n` starts a new line. |

## hours.json

List all seven days. Each day is one of these three:

```json
{ "day": "Tuesday", "open": "09:00", "close": "19:00" }
{ "day": "Monday", "open": "10:00", "close": "17:00", "onlyFor": "esthetic", "note": "Esthetic services only" }
{ "day": "Sunday", "closed": true }
```

- The opening-hours list is built automatically. Days with the same hours are grouped ("Tue–Sat 9:00 am – 7:00 pm").
- The booking pop-up uses the same rules.
  - It greys out closed days.
  - On an `"onlyFor": "esthetic"` day, only specialists marked `"estheticServices": true` in team.json can be booked.

## booking.json

| Field | Current | Meaning |
|---|---|---|
| `slotEveryMinutes` | 30 | Gap between start times offered |
| `minNoticeMinutes` | 60 | How soon from now the first bookable time can be |
| `daysAhead` | 14 | How many days the pop-up shows |

## team.json

```json
{
  "id": "amanda",
  "name": "Amanda",
  "photo": "cb00832dd6c34a3a7441279036b6f8f7.webp",
  "photoAlt": "Amanda, skin, brow, lash and nail specialist",
  "specialties": "Skin, brows & lashes, nails, waxing",
  "cardText": "Skin, brows & lashes,\nnails, waxing.",
  "estheticServices": true
}
```

| Field | Notes |
|---|---|
| `id` | Lowercase and permanent. services.json refers to people by it. |
| `specialties` | Short description shown in the booking pop-up |
| `cardText` | Optional. Different wording for the homepage team card; `specialties` is used if it's left out. |
| `photoAlt` | Describes the photo for screen readers |

The order of the list is the order of the team cards.

## services.json

Categories (the tabs on the services page) contain services:

```json
{
  "key": "gel",
  "name": "Gel manicure",
  "description": "Shaping, cuticle care and a high-shine gel finish.",
  "durationMinutes": 60,
  "image": "0251750fd40df4f72485cbf8310d4c5d.webp",
  "offeredBy": [
    { "specialist": "amanda", "price": 50 },
    { "specialist": "toni", "price": 50 }
  ]
}
```

- **`offeredBy`** says who does the service and at what price.
  - The services page shows "From $" plus the lowest price, and "with Amanda or Toni".
  - The booking pop-up lets the visitor choose between them.
- **`priceText`** replaces `price` for a price that isn't a number, such as `{ "specialist": "kennedy", "priceText": "Free" }`. It is shown exactly as written on both the services page and in the booking pop-up.
- **`priceLabel`** is optional. It is text shown on the services page instead of "From $…".
- **`bookingName`** is optional. It is a different name used only in the booking pop-up.
- **A category's `specialists`** are the faces and the "With …" line above that category's list. The check warns if they don't match who offers its services.
- The order of services is the order shown on the services page and in the booking pop-up.

## gallery.json

```json
{ "image": "bca20903dd3c8b944e20c3cec0233e23.webp", "alt": "Black chrome stiletto nails with crystals" }
```

Add `"before": "file-name.webp"` to make that card a before/after slider.

## Keeping an outside booking system in sync

Right now the booking pop-up sends an email request, so there is no outside booking system. If Slayed connects one (Fresha, Square, Vagaro, GlossGenius and similar) or links to one, the items below exist in both places and must be changed in both.

| Information | Here | In the booking system |
|---|---|---|
| Service names, durations and prices | services.json | Service menu |
| Who offers which service, and their price | services.json `offeredBy` | Staff service assignments |
| Specialists (name, photo, who's on staff) | team.json | Staff list |
| Opening hours and the Monday esthetics-only rule | hours.json | Business hours plus staff schedules |
| Slot spacing, minimum notice, how far ahead | booking.json | Online booking settings |
| Where requests and confirmations go | contact.json `email` | Notification email |
| Category names | services.json | Service categories |

Some things exist only in the booking system: real availability, staff days off, deposits and cancellation policy. Once a booking system is connected, it should be the source of truth for availability. The website should show only the menu and link to it.
