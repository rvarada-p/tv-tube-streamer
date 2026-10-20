# AdStation

[![CI](https://github.com/rvarada-p/tv-tube-streamer/actions/workflows/ci.yml/badge.svg)](https://github.com/rvarada-p/tv-tube-streamer/actions/workflows/ci.yml)

AdStation puts sponsor ads and a store's own content on the TV screens inside local stores.

- **Stores** sign up, describe their store and opening hours, upload default content (images, videos, YouTube links) and see the day's ad schedule.
- **Ad sponsors** sign up and set up their company.
- **The TV** signs in at `/tv/login` with the store's account and plays the store's default content in rotation, switching to scheduled ads at their slot time.

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
