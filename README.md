# Edgar Pateño — Portfolio

A single-page portfolio site for Edgar Pateño, Shopify Developer & eCommerce Specialist.

Live URL (after you deploy): `https://<your-github-username>.github.io/`

## What's in this repo

- `index.html` — the entire portfolio (HTML + CSS + JS in one file, no build step)
- `.nojekyll` — tells GitHub Pages to skip Jekyll processing (safer for plain HTML)
- `README.md` — this file

## Deploy to GitHub Pages (5 minutes)

### Option A — User site (recommended, gives you `username.github.io`)

1. On GitHub, create a **new public repository** named exactly:
   `<your-github-username>.github.io`
   (e.g. if your GitHub username is `edgarpateno`, name the repo `edgarpateno.github.io`)
2. From this folder, push the files:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/<your-github-username>/<your-github-username>.github.io.git
   git push -u origin main
   ```
3. In your GitHub repo → **Settings → Pages** → set **Source** to `Deploy from a branch`, branch `main`, folder `/ (root)`. Save.
4. Wait ~1 minute. Your site is live at `https://<your-github-username>.github.io/`.

### Option B — Project site (URL like `username.github.io/portfolio`)

Same steps, but name the repo anything you like (e.g. `portfolio`). The published URL will be `https://<your-github-username>.github.io/portfolio/`.

## Customizing

Everything lives in `index.html`. Common edits:

- **Headline & tagline** — search for `Shopify storefronts that` near the top of the `<header class="hero">` block.
- **Stats** — `100+`, `8+`, `10+` numbers under `.hero-stats`.
- **Projects** — each `<div class="project-card">` block. Update title, description, and links.
- **Experience** — each `<div class="timeline-item">` block.
- **Contact info** — search for `mailto:` and `tel:` near the bottom.
- **Colors** — top of the `<style>` block, in the `:root` CSS variables.

## Adding your own photo

The hero currently shows your initials inside a styled frame. To use your real photo:

1. Save your photo as `me.jpg` (or `.png`) next to `index.html`.
2. In `index.html` find the `.portrait-frame` block and replace it with:
   ```html
   <div class="portrait-frame" style="padding:0;">
     <img src="me.jpg" alt="Edgar Pateño" style="width:100%;height:100%;object-fit:cover;" />
   </div>
   ```
3. Optionally remove the `<span class="portrait-initials">EP</span>` line.

## Custom domain (optional)

If you own a domain (e.g. `edgarpateno.com`):

1. Add a file named `CNAME` in the repo root containing just your domain, e.g. `edgarpateno.com`.
2. In your domain registrar's DNS settings, add an `A` record pointing to GitHub Pages IPs:
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   (or a `CNAME` record pointing to `<your-username>.github.io` for a subdomain like `www.`).
3. In GitHub → Settings → Pages, enter your custom domain and enable **Enforce HTTPS** once DNS propagates.

## License

Personal portfolio — content and likeness © Edgar Pateño. Code is yours to reuse.
