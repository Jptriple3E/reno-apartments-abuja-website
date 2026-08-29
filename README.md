# Reno Apartments Abuja — Website

A real, production-ready website for Reno Apartments Abuja. Built as static
HTML/CSS/JS (no build step, no framework dependencies) so it deploys
instantly and has zero installation risk — open `index.html` locally or
push the whole folder to any static host.

## Deploying

**Vercel / Netlify (recommended):**
1. Push this folder to a GitHub repo (or drag-and-drop the folder into
   Netlify's deploy UI).
2. No build command needed — this is a static site. Framework preset:
   "Other" / leave build command blank, output directory `/`.
3. Connect the domain `renoapartmentsabuja.com` (or whatever domain you use)
   and update every `https://www.renoapartmentsabuja.com/` reference in the
   `<link rel="canonical">`, Open Graph tags, and `sitemap.xml` to match.

**Any other static host** (GitHub Pages, Cloudflare Pages, S3, etc.) works
the same way — there is nothing to compile.

## Editing content

Almost everything on the site is read from **`data/property.js`**. Update
phone numbers, WhatsApp number, address, apartments, amenities, FAQs, and
policies there — it updates everywhere automatically (header, footer,
WhatsApp messages, structured data, the chat assistant).

- **Apartments**: add real entries to the `apartments` array in
  `data/property.js`, set `published: true`, and fill in real images,
  pricing, and details. The sample "Add your first apartment/unit type"
  card is a placeholder — replace or remove it.
- **Gallery**: `data/gallery.js` lists every photo shown on the Gallery
  page and where it's grouped. Images live in `images/gallery/`.
- **Video**: drop a real property video at `videos/property-tour.mp4` and
  the Gallery page will automatically detect and display it — the video
  section is hidden until that file exists, so nothing broken ever ships.
- **Policies / check-in times**: several fields in `property.js` are
  intentionally left as `PLACEHOLDER` text (cancellation policy, check-in
  time, etc.) because they were not supplied. Fill these in — the FAQ
  page, chatbot, and Terms page all read from the same fields.

## Connecting a real backend

Two things currently work *without* any backend, by design, so nothing is
faked:

- **Booking form** — captures the request locally and offers a
  "Send via WhatsApp Instead" button pre-filled with all the details, so no
  enquiry is ever lost even before a backend is connected.
- **AI chat assistant** — a small rule-based JS assistant
  (`js/main.js` → `chatAnswer()`) that answers only from `property.js`. It
  never calls an external AI API, so there's no API key to protect and
  nothing to hallucinate.

To upgrade either to a real backend:

1. **Email/booking notifications**: the cleanest path is a Vercel/Netlify
   serverless function that receives the form POST and sends email via
   Resend/SendGrid, or forwards to a service like Formspree. Point the
   `<form>` `action`/fetch target at that endpoint.
2. **Live availability / PMS**: if you connect a real property-management
   system, replace the "Rate on request" / static apartment data with a
   fetch to that system's API, and update the booking form to show real
   availability instead of a request-only flow.
3. **A real LLM-powered chatbot**: if you want a smarter assistant, route
   requests through a server-side API route that calls an AI provider with
   the property data as context — never call an AI API directly from the
   browser, since that would expose your API key.

## Production checklist already done

- Every page tested in a real browser (Playwright) for console/JS errors
- Gallery filtering, lightbox, mobile nav, forms, and chat assistant all
  manually exercised and verified working
- Mobile bottom action bar (Book / WhatsApp / Call), responsive down to
  small phones
- Structured data (LodgingBusiness, BreadcrumbList, FAQPage), sitemap.xml,
  robots.txt
- No invented prices, amenities, reviews, or policies — everything not
  supplied is a clearly marked, easy-to-fill placeholder

## Known placeholders to fill in before launch

- Apartment types, images, and pricing (`data/property.js` →
  `apartments`)
- Check-in/check-out times, cancellation/pet/smoking policies
- A business enquiry email address
- Real domain in canonical/OG tags and `sitemap.xml`
- A backend connection for the booking form (see above) if you want
  automatic email notifications rather than the WhatsApp hand-off
