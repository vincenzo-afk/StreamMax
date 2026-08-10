# StreamMax

A Netflix-style streaming browser built with plain HTML / CSS / JavaScript (no build step, no framework). Movie & TV metadata comes from **TMDb**, and a live "On Air Today" rail is powered by **TVmaze**.

## ✨ Features

- **Hero banner** with a random trending title, backdrop art, and trailer playback
- **Rows** for Trending, Popular, Top Rated, Now Playing/Upcoming, On The Air, and genre-based rails (Action, Comedy, Horror, Sci-Fi, Drama, Crime, etc.)
- **Movies** and **TV Shows** tabs with dedicated rails
- **On Air Today** — a rail sourced entirely from TVmaze's live schedule endpoint
- **Search** (TMDb `/search/multi`) with debounced input and a live results grid
- **Title detail modal** — synopsis, genres, rating, cast, and trailer (YouTube, pulled from TMDb `videos`)
- **My List** — add/remove titles, persisted in `localStorage`, its own tab
- Fully responsive (mobile hamburger nav, fluid card grids), keyboard-accessible focus states, and `prefers-reduced-motion` support
- Brand palette and typography built to spec (see below) with your uploaded ribbon-play logo used across nav, favicon, and footer

## 🎨 Design tokens

| Token | Hex | Usage |
|---|---|---|
| Primary Brand Red | `#D90000` | Buttons, accents, active states |
| Highlight Red | `#FF4D4D` | Ratings, glow accents, hover highlights |
| Deep Shadow Red | `#7A0000` | Borders, gradients, depth |
| Background | `#000000` | Page canvas |
| Card/Container | `#121212` | Cards, modals, hero fallback |
| Primary Text | `#FFFFFF` | Headlines, body copy |
| Secondary Text | `#858585` | Meta text, timestamps, disabled state |

Typography: **Bebas Neue** (display/headlines), **Inter** (UI/body), **Space Mono** (meta/data — ratings, timestamps, badges), loaded from Google Fonts.

## 📁 Project structure

```
streammax/
├── index.html          # App shell / markup
├── css/
│   └── style.css       # All styling (design tokens at the top)
├── js/
│   ├── config.js       # API keys & base URLs
│   ├── api.js           # TMDb + TVmaze fetch wrappers
│   └── app.js            # State, rendering, event wiring
├── assets/
│   └── logo.png         # Your StreamMax logo (used in nav/footer/favicon)
└── README.md
```

## ▶️ Running it

Because the app makes `fetch()` calls to external APIs, most browsers are happiest serving it over `http://` rather than `file://`. Any static server works:

**Option A — Python (already on most machines)**
```bash
cd streammax
python3 -m http.server 5500
```
Then open `http://localhost:5500`.

**Option B — Node**
```bash
cd streammax
npx serve .
```

**Option C — VS Code**
Install the "Live Server" extension, right-click `index.html` → *Open with Live Server*.

> Opening `index.html` directly by double-clicking it usually works too (TMDb and TVmaze both allow cross-origin requests), but if you see network errors in the console, switch to one of the options above.

## 🔑 API keys

Your TMDb API key and Read Access Token, plus the TVmaze base URL, are already wired up in `js/config.js`:

```js
TMDB.API_KEY   // used as a query param on every TMDb request
TMDB.READ_TOKEN // included for reference / header-based auth if you switch approach
TVMAZE.BASE_URL // no auth required
```

**Heads up:** this is a client-side demo, so the key is visible in the browser's network tab — normal for personal/demo projects, but for a public production deploy you'd typically proxy TMDb calls through a small backend so the key isn't exposed.

## 🧩 Customizing

- **Add/remove rows:** edit the `ROW_CONFIGS` object in `js/app.js` — each row is just a title + a function that returns a TMDb fetch.
- **Change genres:** genre IDs live in the `GENRE` object at the top of `js/app.js`.
- **Swap fonts/colors:** all design tokens are CSS custom properties at the top of `css/style.css`.
- **Logo:** replace `assets/logo.png` with any image of the same aspect ratio.

## 📜 Attribution

This product uses the TMDb API but is not endorsed or certified by TMDb. TV schedule data courtesy of TVmaze.com. Built as a personal demo project — not for commercial use.
