# Freshli

A food-inventory web app. Photograph what you bought, get an editable inventory,
and get recipes generated from what is actually in the fridge, with the
soonest-to-expire items surfaced first.

Next.js 15 (App Router) and TypeScript, one Supabase Postgres table through
`supabase-js`, Tailwind, and the OpenAI API: GPT-4o vision for reading a photo
of groceries, GPT-3.5 Turbo for recipes, DALL-E 2 for recipe illustrations.

```bash
npm install
cp .env.example .env.local     # fill in the three values
npm run dev                    # http://localhost:3000
npm test                       # 28 unit tests, no network, no database
```

## What it does

### Inventory dashboard

Six fixed columns (produce, meats, dairy, pantry/grains, frozen,
miscellaneous), each sorted soonest-expiry first, each card banded green /
yellow / red by how long the item has left. Search filters across all columns.

### Photo to inventory

Upload a photo of your groceries. GPT-4o returns the ingredients it can see
and the app pre-fills a card per item. You supply quantity, unit and
expiration before anything is written, so the model proposes and you confirm.
Adding stock that matches an existing row on name, unit and expiration merges
into that row.

### Recipes from selected stock

Pick ingredients, optionally add free-text filters ("soup", "vegetarian",
"Korean"), and the model is asked for nine recipes that may use up to the
quantities you have and may add only salt, pepper, oil and basic seasonings.
Malformed recipes are dropped, so fewer than nine can come back. After cooking,
the quantities used are deducted from the inventory.

## Worth reading

The interesting code is the pure logic in [`lib/`](lib), which is the part
with tests: [`lib/expiry.ts`](lib/expiry.ts) for the expiry banding and
[`lib/ingredients.ts`](lib/ingredients.ts) for parsing, merging, grouping and
sorting. The pages and API routes call into those.

Extracting that logic and writing tests against it turned up four live defects.
Each is now pinned by a test that fails against the old behaviour.

1. Every expiration date was read a day early west of UTC. `new Date("2026-08-28")`
   parses a bare `YYYY-MM-DD` as UTC midnight per the spec, and it was compared
   against a local `new Date()`. In America/New_York an item expiring today
   displayed as "Expired" from 20:00 the previous evening onward. `parseLocalDate`
   reads the date in the viewer's own zone, and CI runs the suite under four
   timezones so this cannot come back through a green run in UTC.
2. The day count mutated the value it was comparing against.
   `today.setHours(0,0,0,0)` was called inside the arithmetic, and the
   `expDate < today` comparison on the next line then depended on that mutation
   having already happened. Correct only by accident, and only while those two
   lines stayed in that order. `startOfLocalDay` returns a new Date and mutates
   nothing.
3. Recipes with fractional quantities silently corrupted the inventory. The
   parser for a recipe line was `/([^(]+)\s*\((\d+)\s+([^)]+)\)/`, which matches
   integers only. `Chicken Thighs (1.5 lb)` did not match, fell through to the
   branch meant for quantity-less basics like "Salt and pepper", and deducted
   exactly 1 lb instead of 1.5. It also read the number with `parseInt` where
   the rest of the pipeline uses `parseFloat`.
4. Recipe images could not load. The `remotePatterns` entry allowing
   `next/image` to fetch DALL-E URLs lived in `next.config.js`. Next 15 resolves
   `next.config.ts` first and ignores the `.js` when both exist, so the allowlist
   was inactive and `app/recipes/results` threw on every generated image.

A fifth defect was less visible. A failed Supabase lookup returned `null` data
and the insert path treated that as "no such row", so a transient error
created a duplicate row. The error is now checked before the branch.

## Tests

```bash
npm test          # vitest, 28 tests
npm run typecheck # tsc --noEmit
npm run lint      # next lint
```

The tests are pure functions only: no network, no database, no OpenAI key, no
component rendering. They run in about 150ms. CI runs typecheck, lint and tests
on every push, and runs the test suite again under UTC, America/New_York,
Asia/Tokyo and Pacific/Kiritimati, because the logic they cover is
timezone-sensitive and the defect they replaced only reproduced west of UTC.

The React components, the Supabase round trips and the three OpenAI calls are
not covered by the suite, and exercising them needs a live project and live
keys.

## Configuration

The Supabase project this ran against has been deleted, so there is no
deployment to visit and no live demo. Running the app past the tested logic
takes your own Supabase project and your own OpenAI key.

`.env.example` lists the three values. `NEXT_PUBLIC_SUPABASE_ANON_KEY` is
Supabase's publishable key and is sent to the browser by design, so it is only
as safe as the row-level security policies on the table it can reach. Enable
RLS on `ingredients` before pointing a public deployment at a project.

The table is:

| column | type | |
|---|---|---|
| `id` | bigint | primary key |
| `name` | text | |
| `quantity` | text | read with `parseFloat` |
| `unit` | text | free text, for example `cnt`, `lb`, `fl oz` |
| `expiration_date` | text | `YYYY-MM-DD` |
| `category` | text | one of the six columns above. Anything else lands in `miscellaneous` |

`scripts/seedIngredients.js` inserts sample rows and reads the same two
environment variables.

## Layout

| path | what |
|---|---|
| `app/` | App Router pages and the four API routes |
| `app/api/gpt-vision` | photo to ingredient names, GPT-4o |
| `app/api/generate-recipes` | recipes from selected stock, GPT-3.5 Turbo |
| `app/api/generate-recipe-image` | recipe illustration, DALL-E 2, with backoff on 429 |
| `app/api/update-inventory` | deduct what a cooked recipe used |
| `components/` | presentational components |
| `lib/expiry.ts`, `lib/ingredients.ts` | the tested logic |
| `lib/__tests__/` | the tests |


MIT licensed. Arjun Agrawal and I built the 2025 app together.
