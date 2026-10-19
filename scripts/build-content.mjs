#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Slayed content builder + validator (no dependencies, Node 18+).
//
//   node scripts/build-content.mjs          validate content/*.json and write content.js
//   node scripts/build-content.mjs --check  validate only; fail if content.js is out of date
//
// The website pages never read the JSON files directly: they load the generated
// content.js, which sets window.SLAYED_CONTENT. Netlify runs this script on every
// deploy (see netlify.toml), so a broken edit fails the deploy and the previous
// version of the site stays live.
//
// Errors stop the build. Warnings are printed but do not stop it: they point at
// things a person should look at (placeholders, wording that differs between
// pages, a specialist with no services…). Nothing is ever filled in or guessed.
// ─────────────────────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'content');
const OUT = join(ROOT, 'content.js');
const CHECK = process.argv.includes('--check');

const errors = [], warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

// ── helpers ──────────────────────────────────────────────────────────────────
function load(name) {
  const file = join(CONTENT, name);
  if (!existsSync(file)) { err(name, 'file is missing'); return null; }
  try { return JSON.parse(readFileSync(file, 'utf8')); }
  catch (e) { err(name, 'is not valid JSON (' + e.message + '). Check for a missing comma, quote or bracket.'); return null; }
}
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const text = (where, obj, key, { optional = false } = {}) => {
  const v = obj ? obj[key] : undefined;
  if (v === undefined || v === null) { if (!optional) err(where, `"${key}" is missing`); return undefined; }
  if (typeof v !== 'string' || !v.trim()) { err(where, `"${key}" must be non-empty text`); return undefined; }
  if (v !== v.trim()) warn(where, `"${key}" has spaces at the start or end`);
  return v;
};
const whole = (where, obj, key, { min = 1 } = {}) => {
  const v = obj ? obj[key] : undefined;
  if (v === undefined || v === null) { err(where, `"${key}" is missing`); return undefined; }
  if (!Number.isInteger(v) || v < min) { err(where, `"${key}" must be a whole number of at least ${min} (got ${JSON.stringify(v)})`); return undefined; }
  return v;
};
const fields = (where, obj, allowed) => {
  if (!isObj(obj)) { err(where, 'must be an object { … }'); return false; }
  for (const k of Object.keys(obj)) if (!allowed.includes(k)) warn(where, `unknown field "${k}" is ignored (typo? allowed: ${allowed.join(', ')})`);
  return true;
};
const fileExists = (where, key, name) => {
  if (!name) return;
  if (/[\\/]/.test(name) || name.startsWith('.')) { err(where, `"${key}" must be a file name in the site folder, not a path ("${name}")`); return; }
  if (!existsSync(join(ROOT, name))) err(where, `"${key}" file "${name}" does not exist in the site folder`);
};
const ID = /^[a-z][a-z0-9-]*$/;
const id = (where, obj, key) => {
  const v = text(where, obj, key);
  if (v && !ID.test(v)) err(where, `"${key}" "${v}" must be lowercase letters, digits or "-" (it is used in links and must not change once live)`);
  return v;
};

// ── contact.json ─────────────────────────────────────────────────────────────
const contact = load('contact.json');
if (contact && fields('contact.json', contact, ['businessName', 'address', 'phone', 'phoneLink', 'email', 'directionsUrl', 'intro'])) {
  const W = 'contact.json';
  ['businessName', 'address', 'phone', 'phoneLink', 'email', 'directionsUrl', 'intro'].forEach((k) => text(W, contact, k));
  if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) err(W, `"email" "${contact.email}" is not a valid email address`);
  if (contact.phoneLink && !/^\+\d{7,15}$/.test(contact.phoneLink)) err(W, '"phoneLink" must be the phone number in international form, e.g. +19025550147');
  if (contact.phone && contact.phoneLink) {
    const d = contact.phone.replace(/\D/g, '');
    if (!contact.phoneLink.replace(/\D/g, '').endsWith(d)) err(W, `"phone" (${contact.phone}) and "phoneLink" (${contact.phoneLink}) are different numbers`);
    if (/555-?01\d\d/.test(contact.phone)) warn(W, `phone ${contact.phone} is a fictional 555-01xx number (placeholder) — replace with the real number`);
  }
  if (contact.directionsUrl && !/^https:\/\//.test(contact.directionsUrl)) err(W, '"directionsUrl" must start with https://');
  if (/mirror lane/i.test(contact.address || '')) warn(W, `address "${contact.address}" is a placeholder — replace with the real address`);
}

// ── hours.json ───────────────────────────────────────────────────────────────
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const RULES = { esthetic: 'estheticServices' };   // supported "onlyFor" values → team.json flag
const hoursIn = load('hours.json');
const week = new Array(7).fill(null);
const toMin = (where, key, v) => {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(v || '');
  if (!m) { err(where, `"${key}" must be a 24-hour time like "09:00" or "17:30" (got ${JSON.stringify(v)})`); return null; }
  return +m[1] * 60 + +m[2];
};
if (hoursIn && fields('hours.json', hoursIn, ['days'])) {
  if (!Array.isArray(hoursIn.days)) err('hours.json', '"days" must be a list');
  else hoursIn.days.forEach((d, i) => {
    const W = `hours.json day ${i + 1}`;
    if (!fields(W, d, ['day', 'open', 'close', 'closed', 'onlyFor', 'note'])) return;
    const di = DAYS.indexOf(d.day);
    if (di < 0) { err(W, `"day" must be one of ${DAYS.join(', ')} (got ${JSON.stringify(d.day)})`); return; }
    if (week[di]) { err(W, `${d.day} is listed twice`); return; }
    if (d.closed === true) {
      if (d.open || d.close) err(W, `${d.day} is marked closed but also has open/close times`);
      week[di] = { day: d.day, closed: true };
      return;
    }
    if (d.closed !== undefined && d.closed !== false) err(W, '"closed" must be true or false');
    const open = toMin(W, 'open', d.open), close = toMin(W, 'close', d.close);
    if (open != null && close != null && open >= close) err(W, `${d.day} opens at ${d.open} but closes at ${d.close}`);
    if (d.onlyFor !== undefined && !RULES[d.onlyFor]) err(W, `"onlyFor" "${d.onlyFor}" is not supported (supported: ${Object.keys(RULES).join(', ')})`);
    if (d.onlyFor && !d.note) err(W, `${d.day} is limited to ${d.onlyFor} services, so it needs a "note" to show visitors (e.g. "Esthetic services only")`);
    if (d.note !== undefined) text(W, d, 'note');
    week[di] = { day: d.day, open, close, onlyFor: d.onlyFor || null, note: d.note || null };
  });
  DAYS.forEach((name, i) => { if (!week[i]) err('hours.json', `${name} is missing (list every day; use "closed": true for days off)`); });
}

// ── booking.json ─────────────────────────────────────────────────────────────
const booking = load('booking.json');
if (booking && fields('booking.json', booking, ['slotEveryMinutes', 'minNoticeMinutes', 'daysAhead'])) {
  whole('booking.json', booking, 'slotEveryMinutes', { min: 5 });
  whole('booking.json', booking, 'minNoticeMinutes', { min: 0 });
  whole('booking.json', booking, 'daysAhead', { min: 1 });
}

// ── team.json ────────────────────────────────────────────────────────────────
const teamIn = load('team.json');
const team = [];
if (teamIn && fields('team.json', teamIn, ['specialists'])) {
  if (!Array.isArray(teamIn.specialists) || !teamIn.specialists.length) err('team.json', '"specialists" must be a list with at least one person');
  else teamIn.specialists.forEach((p, i) => {
    const W = `team.json specialist ${i + 1}${p && p.name ? ' (' + p.name + ')' : ''}`;
    if (!fields(W, p, ['id', 'name', 'photo', 'photoAlt', 'specialties', 'cardText', 'estheticServices'])) return;
    const pid = id(W, p, 'id');
    if (pid && team.some((t) => t.id === pid)) err(W, `id "${pid}" is used twice`);
    ['name', 'photo', 'photoAlt', 'specialties'].forEach((k) => text(W, p, k));
    text(W, p, 'cardText', { optional: true });
    fileExists(W, 'photo', p.photo);
    if (typeof p.estheticServices !== 'boolean') err(W, '"estheticServices" must be true or false (it decides who can be booked on esthetic-only days)');
    team.push({ id: pid, name: p.name, photo: p.photo, photoAlt: p.photoAlt, specialties: p.specialties,
      cardText: p.cardText || p.specialties, estheticServices: p.estheticServices === true });
  });
}
const teamIds = new Set(team.map((t) => t.id));

// ── services.json ────────────────────────────────────────────────────────────
const svcIn = load('services.json');
const categories = [];
if (svcIn && fields('services.json', svcIn, ['defaultImage', 'categories'])) {
  text('services.json', svcIn, 'defaultImage'); fileExists('services.json', 'defaultImage', svcIn.defaultImage);
  const keys = new Map();
  if (!Array.isArray(svcIn.categories) || !svcIn.categories.length) err('services.json', '"categories" must be a list with at least one category');
  else svcIn.categories.forEach((c, ci) => {
    const CW = `services.json category ${ci + 1}${c && c.name ? ' (' + c.name + ')' : ''}`;
    if (!fields(CW, c, ['id', 'name', 'title', 'description', 'specialists', 'services'])) return;
    const cid = id(CW, c, 'id');
    if (cid && categories.some((x) => x.id === cid)) err(CW, `id "${cid}" is used twice`);
    ['name', 'title', 'description'].forEach((k) => text(CW, c, k));
    if (!Array.isArray(c.specialists) || !c.specialists.length) err(CW, '"specialists" must list who is shown for this category, e.g. ["kennedy"]');
    else c.specialists.forEach((s) => { if (!teamIds.has(s)) err(CW, `"specialists" names "${s}", who is not in team.json`); });
    const services = [];
    if (!Array.isArray(c.services) || !c.services.length) err(CW, '"services" must be a list with at least one service');
    else c.services.forEach((s, si) => {
      const W = `${CW} service ${si + 1}${s && s.name ? ' (' + s.name + ')' : ''}`;
      if (!fields(W, s, ['key', 'name', 'bookingName', 'description', 'durationMinutes', 'image', 'priceLabel', 'offeredBy'])) return;
      const key = id(W, s, 'key');
      if (key && keys.has(key)) err(W, `key "${key}" is also used by "${keys.get(key)}" — every service needs its own key`);
      if (key) keys.set(key, s.name);
      ['name', 'description', 'image'].forEach((k) => text(W, s, k));
      text(W, s, 'bookingName', { optional: true }); text(W, s, 'priceLabel', { optional: true });
      if (s.bookingName && s.bookingName !== s.name) warn(W, `named "${s.name}" on the services page but "${s.bookingName}" in the booking pop-up — consider using one name`);
      if (s.priceLabel) warn(W, `services page shows "${s.priceLabel}" instead of a price (booking pop-up shows each specialist's price)`);
      whole(W, s, 'durationMinutes', { min: 5 });
      fileExists(W, 'image', s.image);
      const offeredBy = [];
      if (!Array.isArray(s.offeredBy) || !s.offeredBy.length) err(W, '"offeredBy" must list at least one specialist with their price, e.g. [{ "specialist": "kennedy", "price": 65 }]');
      else s.offeredBy.forEach((o, oi) => {
        const OW = `${W} offeredBy ${oi + 1}`;
        if (!fields(OW, o, ['specialist', 'price'])) return;
        if (!teamIds.has(o.specialist)) err(OW, `specialist "${o.specialist}" is not in team.json`);
        if (offeredBy.some((x) => x.specialist === o.specialist)) err(OW, `"${o.specialist}" is listed twice`);
        const p = o.price;
        if (p === undefined || p === null || p === '') err(OW, '"price" is missing (use a number like 65, or text like "Free")');
        else if (typeof p === 'number') { if (!(p >= 0) || !isFinite(p)) err(OW, `"price" ${p} is not a valid amount`); }
        else if (typeof p === 'string') { if (/^\s*\$?\s*\d/.test(p)) err(OW, `"price" "${p}" looks like a number — write it without quotes or "$", e.g. 65`); }
        else err(OW, '"price" must be a number like 65, or text like "Free"');
        offeredBy.push({ specialist: o.specialist, price: p });
      });
      const nums = offeredBy.map((o) => o.price).filter((p) => typeof p === 'number');
      const words = [...new Set(offeredBy.map((o) => o.price).filter((p) => typeof p === 'string'))];
      if (!s.priceLabel && !nums.length && words.length > 1) err(W, `specialists use different price wording (${words.join(' / ')}), so the services page needs a "priceLabel" to show instead`);
      if (nums.length > 1 && Math.min(...nums) !== Math.max(...nums)) warn(W, `prices differ by specialist (${offeredBy.map((o) => o.specialist + ' ' + o.price).join(', ')}); services page shows "From $${Math.min(...nums)}"`);
      services.push({ key, name: s.name, bookingName: s.bookingName || s.name, description: s.description, durationMinutes: s.durationMinutes,
        image: s.image, priceLabel: s.priceLabel || null, offeredBy });
    });
    // the category's listed specialists should be exactly the people who offer its services
    const who = new Set(services.flatMap((s) => s.offeredBy.map((o) => o.specialist)));
    const listed = new Set(Array.isArray(c.specialists) ? c.specialists : []);
    const missing = [...who].filter((x) => !listed.has(x)), extra = [...listed].filter((x) => !who.has(x));
    if (missing.length) warn(CW, `${missing.join(', ')} ${missing.length > 1 ? 'offer' : 'offers'} services here but are not in the category's "specialists"`);
    if (extra.length) warn(CW, `${extra.join(', ')} ${extra.length > 1 ? 'are' : 'is'} in "specialists" but ${extra.length > 1 ? 'offer' : 'offers'} no services in this category`);
    categories.push({ id: cid, name: c.name, title: c.title, description: c.description, specialists: c.specialists || [], services });
  });
  // a service that can never fit in any open day can't be booked
  const longest = Math.max(0, ...week.filter((d) => d && !d.closed).map((d) => d.close - d.open));
  categories.forEach((c) => c.services.forEach((s) => { if (s.durationMinutes > longest) err(`services.json ${s.name}`, `takes ${s.durationMinutes} min, longer than any opening day — it could never be booked`); }));
}
team.forEach((t) => {
  if (!categories.some((c) => c.services.some((s) => s.offeredBy.some((o) => o.specialist === t.id)))) warn(`team.json ${t.name}`, 'offers no services in services.json, so they cannot be booked');
});
week.forEach((d) => {
  if (d && d.onlyFor) {
    const flag = RULES[d.onlyFor];
    if (flag && !team.some((t) => t[flag])) warn('hours.json', `${d.day} is for ${d.onlyFor} services only, but nobody in team.json has "${flag}": true — the day can never be booked`);
  }
});

// ── gallery.json ─────────────────────────────────────────────────────────────
const galIn = load('gallery.json');
const gallery = [];
if (galIn && fields('gallery.json', galIn, ['items'])) {
  if (!Array.isArray(galIn.items) || !galIn.items.length) err('gallery.json', '"items" must be a list with at least one photo');
  else galIn.items.forEach((g, i) => {
    const W = `gallery.json item ${i + 1}`;
    if (!fields(W, g, ['image', 'alt', 'before'])) return;
    text(W, g, 'image'); text(W, g, 'alt'); text(W, g, 'before', { optional: true });
    fileExists(W, 'image', g.image); fileExists(W, 'before', g.before);
    if (gallery.some((x) => x.image === g.image)) warn(W, `photo ${g.image} is in the gallery twice`);
    gallery.push(g.before ? { after: g.image, before: g.before, alt: g.alt } : { after: g.image, alt: g.alt });
  });
}

// ── derived values the pages use ─────────────────────────────────────────────
const SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const clock = (m) => { const h = Math.floor(m / 60), mm = m % 60; return ((h + 11) % 12 + 1) + ':' + String(mm).padStart(2, '0') + ' ' + (h >= 12 ? 'pm' : 'am'); };
const hours = { week: [], lines: [], summary: '' };
if (week.every(Boolean)) {
  // the booking pop-up's rules, indexed like Date.getDay() (0 = Sunday)
  hours.week = week.map((d) => d.closed
    ? { closed: true, reason: 'Closed on ' + d.day + 's' }
    : { open: d.open, close: d.close, onlyFor: d.onlyFor,
        reason: d.onlyFor ? d.day + 's are ' + d.note.charAt(0).toLowerCase() + d.note.slice(1) : '' });
  // the opening-hours list: Monday first, days with identical hours grouped (Tue–Sat …)
  const order = [1, 2, 3, 4, 5, 6, 0], groups = [];
  order.forEach((i) => {
    const d = week[i], sig = JSON.stringify([d.closed, d.open, d.close, d.onlyFor, d.note]), last = groups[groups.length - 1];
    if (last && last.sig === sig) last.days.push(i); else groups.push({ sig, days: [i], d });
  });
  groups.forEach((g) => {
    const label = SHORT[g.days[0]] + (g.days.length > 1 ? '–' + SHORT[g.days[g.days.length - 1]] : '');
    const t = g.d.closed ? label + ' Closed' : label + ' ' + clock(g.d.open) + ' – ' + clock(g.d.close);
    hours.lines.push(g.d.note ? { text: t, note: g.d.note } : t);
  });
  // the one-line summary in the mobile menu: the regular (unrestricted) hours covering the most days
  const main = groups.filter((g) => !g.d.closed && !g.d.onlyFor).sort((a, b) => b.days.length - a.days.length)[0];
  hours.summary = main ? (typeof hours.lines[groups.indexOf(main)] === 'string' ? hours.lines[groups.indexOf(main)] : '') : '';
}

// ── report + write ───────────────────────────────────────────────────────────
const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
if (warnings.length) { console.log(`\n⚠  ${plural(warnings.length, 'warning')} (the site still builds):`); warnings.forEach((w) => console.log('   - ' + w)); }
if (errors.length) {
  console.error(`\n✖  ${plural(errors.length, 'error')} — content.js was NOT updated and the deploy is stopped:`);
  errors.forEach((e) => console.error('   - ' + e));
  console.error('');
  process.exit(1);
}
const data = { contact, hours, booking, team, categories, defaultImage: svcIn.defaultImage, gallery };
const deepFreeze = 'function f(o){Object.values(o).forEach(function(v){if(v&&typeof v==="object")f(v)});return Object.freeze(o)}';
const js = '/* GENERATED FILE — do not edit. Edit the files in content/ and run: node scripts/build-content.mjs\n' +
  '   (Netlify runs it automatically on every deploy.) */\n' +
  'window.SLAYED_CONTENT = (' + deepFreeze + ')(' + JSON.stringify(data, null, 1) + ');\n';
if (CHECK) {
  const cur = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
  if (cur !== js) { console.error('\n✖  content.js is out of date — run: node scripts/build-content.mjs\n'); process.exit(1); }
  console.log(`\n✓  content is valid and content.js is up to date (${plural(team.length, 'specialist')}, ${plural(categories.reduce((n, c) => n + c.services.length, 0), 'service')}, ${plural(gallery.length, 'gallery photo')}).`);
} else {
  writeFileSync(OUT, js);
  console.log(`\n✓  content.js written (${plural(team.length, 'specialist')}, ${plural(categories.reduce((n, c) => n + c.services.length, 0), 'service')}, ${plural(gallery.length, 'gallery photo')}).`);
}
