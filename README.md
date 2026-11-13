# malaikaimran.com

Source of my personal website: **[malaikaimran.com](https://malaikaimran.com)**

It's a static site in plain HTML, CSS and JavaScript, hosted on GitHub Pages with the domain on Cloudflare.

## Contents

- About, work experience, internships, education, certifications and volunteering
- Light and dark themes, and a layout that works on phones
- A Content Security Policy, a sitemap, structured data for search engines, and link-preview images

## Files

| File | Purpose |
|---|---|
| `index.html` | The page |
| `styles.css`, `script.js` | Styling and behaviour |
| `404.html` | "Page not found" page |
| `assets/` | Profile photo (600, 900 and 1200 px wide) and link-preview image |
| `robots.txt`, `sitemap.xml` | Search engines |
| `site.webmanifest`, `favicon.svg`, `*.png` icons | Browser and home-screen icons |
| `CNAME` | Custom domain for GitHub Pages |

## Updating

Edit or upload the changed files on this repository's `master` branch. GitHub Pages republishes the site within about a minute.

If you change the small inline script in `index.html`, update its `sha256-…` hash in the Content-Security-Policy meta tag. Otherwise the browser blocks the script.
