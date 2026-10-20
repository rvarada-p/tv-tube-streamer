# AdStation

[![CI](https://github.com/rvarada-p/tv-tube-streamer/actions/workflows/ci.yml/badge.svg)](https://github.com/rvarada-p/tv-tube-streamer/actions/workflows/ci.yml)

AdStation puts sponsor ads and a store's own content on the TV screens inside local stores.

- **Stores** sign up, describe their store and opening hours, upload default content (images, videos, YouTube links) and see the day's ad schedule.
- **Ad sponsors** sign up and set up their company.
- **The TV** signs in at `/tv/login` with the store's account and plays the store's default content in rotation, switching to scheduled ads at their slot time.

## Setting up a store TV

1. Use any screen with a modern browser: a smart TV browser, a Fire TV / Android TV stick, a Chromecast with Google TV, or a small PC.
2. Open `<your site>/tv/login` and sign in with the **store owner's** account.
3. Optional: in Chrome or on Android, choose **Install app** / **Add to Home screen**. AdStation then opens straight on the TV display, full screen.
4. Otherwise, double-click the screen (or press OK twice on an air remote) to go fullscreen.
5. The display keeps the screen awake by itself where the device allows it. Also turn off the TV's own sleep timer.

On the screen:

- **"N ads scheduled today · next at …"** (bottom right): today's remaining sponsor ads.
- **"Offline"** (bottom left): the connection dropped. Content keeps playing; new bookings arrive when it's back.
- **"No Store on This Account"**: you signed in with a sponsor account or before finishing store setup. Use **Sign out**.

## Tech stack

- Vite, React and TypeScript
- shadcn-ui and Tailwind CSS
- Supabase (auth, Postgres with row-level security, storage, realtime)

The app was started in [Lovable](https://lovable.dev); changes made there are committed to this repo automatically, and pushes here show up in Lovable.

## Running locally

You need Node.js and npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)).

```sh
git clone https://github.com/rvarada-p/tv-tube-streamer.git
cd tv-tube-streamer
npm i
npm run dev
```

The Supabase connection comes from `.env`:

| Variable | What it is |
| --- | --- |
| `VITE_SUPABASE_URL` | The Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | The project's anon (publishable) key |
| `VITE_SUPABASE_PROJECT_ID` | The Supabase project id |

The database schema lives in `supabase/migrations/`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run lint` | ESLint over the project |
| `npm run preview` | Serves the production build locally |

## Deploying

Open the project in Lovable and choose Share → Publish. To use your own domain, go to Project → Settings → Domains → Connect Domain ([guide](https://docs.lovable.dev/features/custom-domain#custom-domain)).
