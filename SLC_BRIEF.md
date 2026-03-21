# Sunday Lunch Club - Project Brief

## What is it?
A shared web app for 6 friends (Nick, Denise, Liz, Martin, Kerrie, Kevin) to rate pubs they visit for Sunday lunch. Each person scores the pub across 6 categories (1-5 stars), and the app ranks pubs on a leaderboard.

## Tech stack
- **Frontend:** Single `index.html` file (vanilla HTML/CSS/JS, no framework)
- **Backend:** Firebase Realtime Database (project: `sunday-lunch-club`)
- **Hosting:** Netlify at `https://sunday-lunch-club.netlify.app`
- **Deployment:** GitHub repo connected to Netlify (push to main = auto deploy)

## Firebase config
- Project ID: `sunday-lunch-club`
- Database URL: `https://sunday-lunch-club-default-rtdb.europe-west1.firebasedatabase.app`
- Firebase compat SDK loaded via CDN (v10.8.0)
- Security rules: open read/write on `pubs` and `scores` paths only
- No authentication

## Database structure
```
pubs/
  {pubId}/
    name: string
    area: string
    date: string (YYYY-MM-DD)
    chosenBy: string (member name)

scores/
  {pubId}:{memberName}/
    roast_quality: number (1-5)
    hero_quantity: number (1-5)
    allergy_options: number (1-5)
    drinks: number (1-5)
    atmosphere: number (1-5)
    service: number (1-5)
    _comment: string (optional)
```

## Scoring categories (in priority order)
1. Roast/Meal Quality (🍖) - Meat, veg, trimmings, gravy, Yorkshires
2. Meat/Hero Quantity (🥩) - Generous portions
3. Allergy Options & Quality (🌿) - Dietary alternatives
4. Drinks & Beer Selection (🍺) - Range, quality
5. Atmosphere & Setting (✨) - Ambience, décor
6. Service (🤝) - Friendly, attentive, efficient

## Members
Nick, Denise, Liz, Martin, Kerrie, Kevin

## URL scheme
- Base: `https://sunday-lunch-club.netlify.app`
- Per-person: `?user=nick`, `?user=denise`, etc.
- Admin: `?user=nick&admin=true`
- User selection saved to localStorage (`slc-user` key)

## Key features
- **Leaderboard:** Pubs ranked by average score across all raters. Medals for top 3.
- **Upcoming pubs:** Future-dated pubs shown in separate "Coming Up" section. Scoring blocked until the date. Editable and deletable.
- **Per-person scoring:** 1-5 stars per category. Unscored categories excluded from averages (not zero). Tap star again to deselect.
- **Everyone's scores:** Pub detail page shows each member's individual scores with 2-column category layout.
- **Export/Import:** CSV export (copy to clipboard) and import (paste CSV, merges by pub name + date).
- **Admin mode:** URL param `admin=true` enables edit/delete on all pubs and remove individual member scores.
- **Real-time sync:** Firebase listeners update the UI live when anyone changes data.

## Design system
- Dark pub theme: background `#1a1410`, cards `#2a2118`, accent gold `#d4a24e`
- Fonts: Playfair Display (headings), DM Sans (body)
- Mobile-first, works as iPhone home screen web app
- Icon: `slc-icon.png` (512x512), referenced via apple-touch-icon meta tag

## Files
- `index.html` - The entire app (single file)
- `slc-icon.png` - App icon (512x512)
- `SLC_BRIEF.md` - This file

## Nick's preferences
- British spelling
- Iterative development - working v1 first, layer features
- Vanilla HTML/CSS/JS preferred for simple apps
- Firebase Realtime Database for shared data
- Netlify for hosting
