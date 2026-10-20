# How AdStation fits together

## Who uses it

| User | Pages | Main tables |
| --- | --- | --- |
| Store owner | `/dashboard`, `/store/setup`, `/store/content`, `/store/schedule` | `stores`, `store_default_content`, `ad_schedule` |
| Ad sponsor | `/dashboard`, `/sponsor/setup` (campaign pages are still to come) | `ad_sponsors`, `ads`, `orders` |
| The store's TV | `/tv/login`, `/tv` | `ad_schedule`, `store_default_content` |

Everyone signs in through Supabase Auth (`src/contexts/AuthContext.tsx`). A trigger creates a `profiles` row with the account type (`store` or `ad_sponsor`) at sign-up.

## How the TV decides what to show

`src/pages/TVDisplay.tsx`:

1. Loads the store, today's unplayed `ad_schedule` rows (by the **local** date) and the active default content.
2. Every 15 seconds, `findDueAd` (`src/lib/ads.ts`) picks an ad whose slot started within the last 2 minutes. The TV plays it for its duration and records the play with the `mark_ad_played` database function.
3. Otherwise it rotates through the default content every 30 seconds, skipping items that fail to load.
4. Realtime subscriptions on `ad_schedule` and `store_default_content` (plus a refetch when the network comes back) keep it current without reloads.

## Shared logic

| File | What it does |
| --- | --- |
| `src/lib/youtube.ts` | Reads the video id from any YouTube URL |
| `src/lib/schedule.ts` | Slot start times for the store's opening hours, including past midnight |
| `src/lib/uploads.ts` | Allowed upload types and sizes |
| `src/lib/content.ts` | Position for newly added default content |
| `src/lib/ads.ts` | Which scheduled ad is due |

Each has a `*.test.ts` next to it (`npm test`).

## Security

Row-level security lives in `supabase/migrations/`. Store owners see only their own store, content and schedule; sponsors see only their own ads and those ads' schedule. Bank columns on `stores` aren't exposed through the API.
