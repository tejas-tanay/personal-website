# Minimalist Blog – tejastanaysharma.com

This repo contains the source for my writing-centric site, built with [Eleventy](https://11ty.dev/).

## Local development
```bash
npm install
npm run serve
# Eleventy prints the exact URL, e.g. http://localhost:8080/ or 8081 if 8080 is taken.
```
Site is built to the `docs/` folder for easy GitHub Pages deployment.

## Adding a new post
1. Create a markdown file in `posts/`, e.g. `posts/my-new-idea.md`.
2. Add front-matter:
   ```md
   ---
   title: "My New Idea"
   date: "2025-05-01"
   summary: "Optional – appears in RSS readers."
   layout: layouts/post.njk
   ---
   ```
3. Write your post in Markdown below the front-matter.

During the build Eleventy automatically places it at `/YYYY/mm/dd/slug/` and wires up **previous/next** links.

## RSS
An RSS feed is generated at `/rss.xml`.

## Toggling the GitHub link in the header
The GitHub anchor is already present in `_includes/layouts/base.njk` but wrapped in an HTML comment. Simply delete the `<!--` & `-->` to show it.

## Booking calendar

The site includes a minimal booking page at `/book/` using an inline Cal.com embed.

Setup:
1. Create or sign in to Cal.com and configure your availability, event types, and connected calendars for conflict checks and time zones.
2. Set your Cal.com handle in `_data/site.json` under `calLink` (e.g., `"tejastanay"` or `"team/handle"`).
3. Deploy. Visitors can view availability (month view), select a slot, enter details, and confirm. Cal.com handles time zones automatically.

Managing bookings:
- Use your Cal.com dashboard to view, edit, or cancel bookings.
- Block out personal busy times by connecting your primary calendar or by setting time-off in Cal.com.
