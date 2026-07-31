# Special Minds Assessment & Therapy Centre — Website

Static site for Special Minds Assessment & Therapy Centre (Dr. Misbah Masood), ready to deploy on GitHub Pages.

## Structure

All files sit flat at the repo root — no subfolders:

```
index.html                 Home
about.html                 About Dr. Misbah Masood
services-assessment.html   Assessment services
services-therapy.html      Therapy services
services-women.html        Women's Mental Health services
booking.html                Booking / contact page
admin.html                  Staff-only inquiry dashboard (noindex)
robots.txt
sitemap.xml
styles.css                  Site-wide styles
site.js                      Nav, reveal animations, WhatsApp links, booking form
service-data.js              Shared contact config (phone/email)
admin.js                      Staff dashboard logic (localStorage-based)
og-image.png                  Social share preview image
```

## Deploying to GitHub Pages

1. Create a new GitHub repository and push everything in this folder to the `main` branch (root, no subfolder).
2. In the repo, go to **Settings → Pages**, set **Source** to `Deploy from a branch`, branch `main`, folder `/ (root)`.
3. If using the custom domain `www.specialmindscentre.com`, add a `CNAME` file at the repo root containing just that domain, and point your DNS `CNAME`/`A` records at GitHub Pages per [GitHub's custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).
4. Wait a few minutes for GitHub Pages to build, then visit your domain.

## Things to double-check before launch

- **Admin passcode**: set in `assets/admin.js` (`ADMIN_PASSCODE`). It's a soft gate only — anyone who views the page source can see it, since this is a static site with no real backend. Fine for keeping casual visitors out, not for sensitive data.
- **Admin data storage**: inquiries logged in `admin.html` are saved in that browser's `localStorage` only — they do not sync across devices. The dashboard already explains this to staff.
- **Contact details**: phone/email live in `assets/service-data.js` (`SITE_CONFIG`) — update once there and it flows through WhatsApp links and the booking form.
- **og-image.png**: currently a simple placeholder graphic. Swap in a real photo or branded design before relying on link previews.
- **Booking form**: currently opens a pre-filled `mailto:` draft (no backend). If you'd like actual form submissions (e.g. via a form service or small backend) instead of relying on the visitor's email client, that's a separate addition.
