# Pasi.Live — Portfolio Site

A static, multi-page site (no build step, no server, no npm install) styled in the Pasi.Live brand palette. Every page shares one stylesheet and one small JS file.

## File structure

```
index.html          Home page — hero, project cards, timeline, achievements, skills, education, contact
project.html         Single template for every project's own page (reads ?slug=... from the URL)
pricing.html         Pricing page — plan cards
admin.html           Private content editor (see "Admin panel" below)
assets/style.css     All styling for every page
assets/site.js       Shared logic: nav menu, loading & rendering projects/pricing
assets/admin.js      Logic specific to the admin page
data/projects.json   The content behind every project card and project page — edit this to add/change projects
data/pricing.json    The content behind the pricing cards — edit this to change plans/prices
```

## How to host it on GitHub Pages

1. On GitHub, create a new repository — e.g. `pasindu.github.io` if you want it at the root of your GitHub domain, or any name (e.g. `portfolio`) if you're fine with a subpath.
2. Upload **all the files and folders above, keeping the same structure** (so `assets/` and `data/` stay as folders, not flattened) to the root of that repository — drag-and-drop the whole folder on the GitHub web UI, or via git:
   ```
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
   cp -r /path/to/this/folder/* .
   git add .
   git commit -m "Add portfolio site"
   git push
   ```
3. In the repo, go to **Settings → Pages**.
4. Under "Build and deployment", set **Source** to "Deploy from a branch", branch `main`, folder `/ (root)`, then **Save**.
5. Wait 1–2 minutes — your site will be live at:
   - `https://<your-username>.github.io/` (if the repo is named `<your-username>.github.io`), or
   - `https://<your-username>.github.io/<repo-name>/` otherwise.

## Adding or editing projects and pricing

You have two ways to do this — use whichever is easier at the time:

**Option A — the admin panel.** Visit `https://<your-site>/admin.html`, enter the passphrase (default is `pasilive-admin` — **change this** by editing `ADMIN_PASSPHRASE` near the top of `assets/admin.js` before you publish), edit or add projects/plans in the form, then click "Download updated projects.json" or "Download updated pricing.json". Take the downloaded file and upload it into the `data/` folder of your GitHub repo, overwriting the old one. Commit, and the live site updates within a minute or two.

**Option B — edit the JSON directly.** Open `data/projects.json` or `data/pricing.json` in any text editor (or directly on github.com), edit the fields, commit. This is often faster once you're comfortable with the format.

**Important — the admin page is not real security.** GitHub Pages only hosts static files; there's no server to check a password against. The passphrase in `admin.html` is a light deterrent (stops casual visitors, keeps it out of search results via a noindex tag) but anyone who views the page source can read it. Don't put anything truly sensitive behind it. If you want real access control, keep the whole repository private instead (Settings → General → Danger Zone → Change visibility) — note that GitHub Pages from a private repo requires a paid GitHub plan.

## Adding a new project

Either through the admin panel, or by adding a new object to `data/projects.json` with this shape:

```json
{
  "slug": "unique-url-friendly-id",
  "domainLabel": "shown in the card header, e.g. a domain or short label",
  "tag": "short tag line shown above the title",
  "title": "Project title",
  "summary": "2-3 sentence summary shown on the card",
  "linkType": "Case study",
  "stats": [{ "value": "7", "label": "Sites built" }],
  "description": ["First paragraph.", "Second paragraph."],
  "highlights": ["Bullet point one", "Bullet point two"]
}
```

The `slug` becomes the URL: `project.html?slug=unique-url-friendly-id`.

## What's inside

- Fully responsive (desktop, tablet, mobile — including a mobile nav menu)
- Brand palette applied via CSS variables at the top of `assets/style.css`, so colors are easy to retune later
- Home page: hero with network diagram, project cards, career timeline, achievements, skills, education & certifications, contact — with pricing and contact CTAs throughout
- Each project card links to its own detail page (`project.html?slug=...`)
- Dedicated pricing page, content-driven from `data/pricing.json`
- Private admin page for editing project/pricing content without touching code
- Respects reduced-motion preferences and has visible keyboard focus states
