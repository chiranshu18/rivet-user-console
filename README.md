# User Console

An internal console for browsing users, their profiles and sessions, and a small analytics
dashboard. Built with React from the requirements in `resources/PRD.pdf`, using the CSV files as
the only data source (no backend).

**Live demo:** [rivet-user-console-pi.vercel.app](https://rivet-user-console-pi.vercel.app/)

The full spec, metric definitions, decision log, and per-phase manual test checklists live in
[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md).

## Features

### Core

- **Users list (`/users`)**: search by name or ID, filter by status, sort by join time, paginate.
- **User details (`/user/:id`)**: profile info, full-size image preview, jump to any user by ID.
- **User sessions (`/user/:id/sessions`)**: per-user sessions with device filter, duration sort, and pagination.
- **Analytics (`/analytics`)**: total users, average session duration, and deleted user %, plus
  charts for daily active users, new vs returning users, and app version distribution.
- **Not found states**: unknown routes and user IDs show a "not found" page.
- **Responsive layout** for desktop and mobile.

### Bonus

- **Light/dark theme**: follows the OS setting by default; a manual choice is remembered.
- **Keyboard accessibility**: visible focus rings, a skip link, Esc closes the image modal, and
  charts can be explored with the arrow keys.
- **CSV export**: downloads every row matching the current filters and sort.
- **Remembered filters**: search, filters, sort, and page size persist across visits (`localStorage`).

## Getting started

Requires Node.js 20+ (required by React Router 7; developed on Node 22) and npm.

```bash
npm install
npm start          # dev server at http://localhost:3000
npm run build      # production build in build/
```

To serve the production build locally: `npx serve -s build`. The `-s` flag sends unknown paths to
`index.html`; any static host needs the same SPA rewrite so that refreshing `/user/u0001` works.

## Deployment

Deployed on [Vercel](https://vercel.com) from the `master` branch; every push redeploys
automatically. Vercel detects Create React App with no extra settings or environment variables.
`vercel.json` adds the SPA rewrite so deep links like `/user/u0001` work on refresh.

## Tech stack

- React 19 (Create React App / `react-scripts` 5), JavaScript
- `react-router-dom` for routing
- `papaparse` to parse CSVs in the browser
- `recharts` for charts (the Analytics page is lazy-loaded, so recharts is only downloaded there)
- SCSS Modules (`sass` pinned to `~1.77.8` to avoid deprecation warnings from CRA's sass-loader)

## Data

The CSVs are served from `public/data/` and fetched at runtime, once per file per session:

| File                | Contents                                     |
| ------------------- | -------------------------------------------- |
| `users.csv`         | 100 users: ID, name, join/last-active time, status |
| `user_profiles.csv` | One profile per user: app version, device, location, language, images |
| `user_sessions.csv` | 686 sessions: start time, duration, device, entry/exit screen |
| `analytics.csv`     | 60 days of daily active / new / returning / deleted counts |

`resources/` holds the original copies. To use new data, replace the files in `public/data/` with
the same column headers.

Analytics metric logic is isolated in `src/analytics/metrics.js`; see Section 6 of the plan for
the alternatives and how to switch.

## Project structure

```
src/
  app/          App + route table
  pages/        One folder per route (data wiring and page layout)
  components/   Reusable presentational components (Component.jsx + Component.module.scss)
  data/         CSV loading/caching, useCsv hooks, lookup selectors
  analytics/    Dashboard metric calculations
  hooks/        useDebounce, usePersistentState, useSort, usePagination
  utils/        Date formatting, language names, filters, sorters
  theme/        Light/dark theme state (ThemeProvider, useTheme)
  styles/       Theme palettes, SCSS variables, mixins, global styles, chart colors
```

## Testing

Testing is manual: each phase in [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) has a
checklist with expected values taken from the CSV data.
