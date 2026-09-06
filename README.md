# Edgar Pateño — Portfolio

A multipage portfolio site for Edgar Pateño — Shopify Developer, Klaviyo Specialist, and eCommerce Operations pro with 10+ years of experience and 100+ stores shipped.

**Live:** [edgarpateno.github.io](https://edgarpateno.github.io)

Built with vanilla HTML, CSS, and JavaScript — no build step, no framework, no dependencies beyond Google Fonts. Hosted free on GitHub Pages.

**Design system:** light theme derived from a live scrape of [upwork.com](https://www.upwork.com) — Upwork green `#108A00` on white, near-black `#181818` ink, pill-shaped primary buttons, 4px base spacing unit. All colour decisions live in the `:root` token block at the top of `style.css`; `.section--dark` rescopes those tokens so inverted bands need no separate rules.

## Site structure

Five pages, shared header and footer, single stylesheet:

- **`index.html`** — Home page. Hero with stacked browser mockups, About, "How I Work" 4-stage process, Testimonials with badges + stats + carousel, Tools & Platforms, Education, and a final CTA banner.
- **`services.html`** — Services page, split into two tracks: a **Shopify & eCommerce** track (eight image + text blocks — theme dev, UX/CRO, Klaviyo, app integration, technical SEO, B2B & affiliate, fulfillment & 3PL, customer support) and an **Amazon Commerce** track (four capability cards — research & listings, advertising & PPC, Seller Central & fulfillment, inventory & order ops).
- **`work.html`** — Work page. Six case-study cards (Magnum, House of Khalsa, JB Racks, Swished, Bohemian Vibes, Tommy Swiss) each with a browser-mockup screenshot, plus a final "100+ Upwork clients" roster summary and CTA.
- **`experience.html`** — Experience page. Hero stats, "The arc" narrative, and a chronological timeline of every brand and role from 2014 to present.
- **`contact.html`** — Contact page. Direct email/phone in a sidebar, Formspree contact form with project-type dropdown, success/error states wired via AJAX so visitors stay on the page.

## Tech & dependencies

- **HTML / CSS / JS** — vanilla, hand-written, no build step
- **Fonts** — [Figtree](https://fonts.google.com/specimen/Figtree), loaded from Google Fonts (chosen as the closest free match to Upwork's licensed Neue Montreal)
- **Formspree** — handles the contact form submissions ([endpoint](https://formspree.io/f/mjgjqerj))
- **GitHub Pages** — hosting, plus `.nojekyll` to skip Jekyll processing

## What's in this repo

```
.
├── index.html          # Home page
├── services.html       # Services page (Shopify + Amazon tracks)
├── work.html           # Work page
├── experience.html     # Experience page
├── contact.html        # Contact page (Formspree form)
├── style.css           # All styles, shared across pages
├── images/             # All site imagery (webp preferred)
│   ├── hero-magnum-browser-mockup.webp
│   ├── work-magnum.webp
│   ├── hero-shopify-store.webp
│   ├── hero-shopify-store-2.webp
│   ├── work-hok.webp
│   ├── work-jbracks.webp
│   ├── work-swished.webp
│   ├── work-bohemian-vibes.webp
│   ├── work-tommy-swiss.webp
│   └── (skill page screenshots…)
├── .nojekyll           # Tells GitHub Pages to skip Jekyll
└── README.md           # You are here
```

## Local development

No build step. To preview locally:

```bash
# From the repo root, just open the file in your browser:
open index.html

# Or run a quick local server (better for testing relative paths):
python3 -m http.server 8000
# then visit http://localhost:8000
```

Edit any HTML/CSS file in your editor of choice (VS Code recommended), refresh the browser, see changes immediately.

## Deploying changes

The repo is already wired to GitHub Pages. Any push to `main` auto-publishes within ~60 seconds.

```bash
git add .
git commit -m "Describe your change"
git push
```

Visit [edgarpateno.github.io](https://edgarpateno.github.io) after pushing to confirm.

## Common edits

**Headline & hero tagline** — `index.html`, search for `Shopify storefronts that`.

**Hero stats** (the `100+`, `10+` numbers) — `index.html`, look under `.hero-stats`.

**Hero browser mockups** — `index.html`, the two `.browser-mockup` blocks. Update the `browser-url` text and the `<img src="...">` paths.

**Services content** — `services.html`. The Shopify track is eight `<section class="skill-block">` blocks; the Amazon track is four `.svc-card`s inside a `.svc-grid`.

**Work case studies** — `work.html`, six `<section class="case-study">` blocks plus the final roster block. Image filenames follow `images/work-<slug>.webp`. Note the `.case-study--flip` modifier alternates the layout — if you insert a card, re-alternate the ones after it.

**Experience timeline** — `experience.html`, the `.timeline-entry` blocks under the timeline section. Magnum is the only current role — everything else is past tense.

**Contact info** — `contact.html` (and the footer of every page). Search for `mailto:`, `tel:`, `wa.me`, and the LinkedIn/Upwork URLs.

**Colors** — `style.css`, top of the file in the `:root` CSS variables block. Primary accent is `--accent` (`#108A00`, Upwork green); `--lime` (`#D2FF00`) is decoration only and is used as the accent inside `.section--dark` bands, where `#108A00` would not have enough contrast.

**Meta description / OG tags** — top `<head>` of each page, controls how the site appears in Google results and social-link previews (Slack, LinkedIn, etc.).

## Adding or replacing images

1. Drop the new image into the `images/` folder. Use lowercase, hyphenated filenames (`work-newbrand.webp`, not `New Brand Photo.JPG`).
2. Convert to **WebP** at quality 80 for the smallest file size. Tool: [squoosh.app](https://squoosh.app).
3. Aim for these aspect ratios to fit the existing layouts:
   - Hero browser mockups: **~1.9:1** (1896×1001 ideal)
   - Work page mockups: **1:1** (1200×1200 ideal)
   - Skills page panels: **16:11** (1200×825 ideal)
4. Update the `<img src="...">` and `alt="..."` attributes in the relevant HTML.

## Mobile nav

Each page has a hamburger button that appears on screens ≤768 px wide. Tapping it toggles the nav-link dropdown. The button HTML, CSS, and toggle JS are present on all five pages — keep them in sync if you make structural nav changes.

## Custom domain (optional)

To point a custom domain like `edgarpateno.com` at this site:

1. Add a `CNAME` file at the repo root containing your domain on a single line.
2. At your DNS registrar, add `A` records pointing to GitHub Pages IPs:
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
3. In **Settings → Pages** on GitHub, enter the custom domain and enable **Enforce HTTPS** once DNS propagates.

## License

Personal portfolio — content, copy, and likeness © Edgar Pateño. The HTML/CSS/JS code is free for you to reuse for your own portfolio; the design system and copy are not.
