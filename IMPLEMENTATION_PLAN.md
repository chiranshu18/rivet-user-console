# Internal User Console — Requirements & Implementation Plan

> **Audience:** any developer or AI agent picking up this project.
> **Source requirement:** `resources/PRD.pdf`. Data files: `resources/*.csv`.
> This document is the single source of truth for scope, decisions, and build order.
> If something is not covered here, **ask before assuming** and then record the answer in
> [Section 10 — Decision Log](#10-decision-log).

---

## Table of Contents

1. [Objective](#1-objective)
2. [Tech Stack](#2-tech-stack)
3. [Data Dictionary](#3-data-dictionary)
4. [Routes & Navigation](#4-routes--navigation)
5. [Feature Specifications](#5-feature-specifications)
6. [Analytics Metric Definitions (changeable)](#6-analytics-metric-definitions-changeable)
7. [Architecture & Folder Structure](#7-architecture--folder-structure)
8. [Reusable Building Blocks](#8-reusable-building-blocks)
9. [Phase-wise Implementation Plan](#9-phase-wise-implementation-plan)
10. [Decision Log](#10-decision-log)
11. [Out of Scope / Deferred](#11-out-of-scope--deferred)
12. [Conventions for Contributors & Agents](#12-conventions-for-contributors--agents)

---

## 1. Objective

Build a React internal tool to **view, search, filter, and analyze** user data. All data comes
from static CSV files that simulate API responses.

Core expectations (from PRD):

- Responsive layout
- Data filtering, sorting, searching
- Functional modals and routing
- Modular, reusable code

UI direction: **clean and simple, nothing fancy**.

---

## 2. Tech Stack

| Concern        | Choice                                                                 |
| -------------- | ---------------------------------------------------------------------- |
| Framework      | React 19 via Create React App (`react-scripts` 5) — already set up     |
| Language       | JavaScript (no TypeScript)                                             |
| Routing        | `react-router-dom`                                                     |
| CSV parsing    | `papaparse`                                                            |
| Charts         | `recharts`                                                             |
| Styling        | SCSS Modules (`*.module.scss`) + shared partials; `sass` pinned to `~1.77.8` |
| Testing        | Manual checklist per phase (no automated tests required)               |

---

## 3. Data Dictionary

CSV files are copied from `resources/` to `public/data/` and fetched at runtime
(`fetch('/data/<file>.csv')`) to simulate API calls.

### 3.1 `users.csv` — 100 rows

| Column             | Type     | Example               | Notes                                         |
| ------------------ | -------- | --------------------- | --------------------------------------------- |
| `user_id`          | string   | `u0001`               | Unique, `u0001`–`u0100`                        |
| `name`             | string   | `User1`               | Unique                                        |
| `join_time`        | datetime | `2025-06-16 07:59:34` | No timezone. Range 2025-05-11 → 2025-11-04    |
| `status`           | enum     | `Deleted`             | `New` (30), `Returning` (26), `Deleted` (44)  |
| `last_active_time` | datetime | `2025-10-01 07:59:34` | No timezone                                   |

### 3.2 `user_profiles.csv` — 100 rows (exactly 1 per user)

| Column                  | Type   | Example         | Notes                                                    |
| ----------------------- | ------ | --------------- | -------------------------------------------------------- |
| `user_id`               | string | `u0001`         | FK → `users.user_id`                                     |
| `app_version`           | string | `v1.4.4`        | 86 distinct values, `v1.0.0`–`v3.8.9`                    |
| `device_info`           | string | `Pixel 6`       | Pixel 6, Macbook Pro, OnePlus 11, Samsung S22, iPhone 14 |
| `location`              | string | `Bangalore`     | Bangalore, Delhi, Mumbai, Chennai, Hyderabad             |
| `language`              | code   | `en`            | `en`, `hi`, `bn`, `te`, `ta`                             |
| `profile_thumbnail_url` | URL    | dicebear 64px   | External URL (needs internet)                            |
| `profile_full_url`      | URL    | dicebear 512px  | External URL (needs internet)                            |

### 3.3 `user_sessions.csv` — 686 rows

| Column                     | Type     | Example               | Notes                                    |
| -------------------------- | -------- | --------------------- | ---------------------------------------- |
| `user_id`                  | string   | `u0001`               | FK → `users.user_id`; every user has 3–10 sessions |
| `session_start`            | datetime | `2025-10-22 07:59:34` | Range 2025-10-06 → 2025-11-05            |
| `session_duration_minutes` | integer  | `68`                  | Range 5–120, mean 64.2                   |
| `device`                   | enum     | `Desktop`             | `Desktop`, `Mobile` only                 |
| `entry_screen`             | enum     | `Search`              | `Search`, `Explore`, `Home`              |
| `exit_screen`              | enum     | `Profile`             | `Profile`, `Settings`, `Logout`          |

### 3.4 `analytics.csv` — 60 rows (one per day)

| Column               | Type    | Notes                                                |
| -------------------- | ------- | ---------------------------------------------------- |
| `date`               | date    | 2025-09-07 → 2025-11-05, stored **newest first**     |
| `daily_active_users` | integer | 213–798                                              |
| `new_users`          | integer | 22–99                                                |
| `returning_users`    | integer | 65–290                                               |
| `deleted_users`      | integer | 0–20                                                 |

### 3.5 Known data quirks (display as-is, do not "fix")

- 59 sessions have `session_start` earlier than the user's `join_time`. **Shown as-is.**
- Profile `device_info` (e.g. "Macbook Pro") does not always agree with session `device`
  (e.g. "Mobile"). **Shown as-is.**
- `analytics.csv` is on a different scale from `users.csv` (hundreds of DAU vs 100 users) and is
  not internally consistent (`new_users + returning_users` sometimes exceeds
  `daily_active_users`). See [Section 6](#6-analytics-metric-definitions-changeable).
- Max sessions per user is 10, so with the minimum page size (10) the Sessions table never shows
  more than one page with the current data. Pagination still must work for larger data.

---

## 4. Routes & Navigation

| Route                 | Page               | Notes                                     |
| --------------------- | ------------------ | ----------------------------------------- |
| `/`                   | —                  | Redirects to `/users`                     |
| `/users`              | Users List         |                                           |
| `/user/:id`           | User Details       | "User not found" state for unknown IDs    |
| `/user/:id/sessions`  | User Sessions      | "User not found" state for unknown IDs    |
| `/analytics`          | Analytics Dashboard|                                           |
| `*`                   | 404 Not Found      | Link back to `/users`                     |

- **Top header** with app title and links: **Users**, **Analytics**. Active link is highlighted.
- Header is responsive (no overflow at 375px width).
- Static-host refresh handling (SPA rewrites) is deferred to the deploy bonus task.

---

## 5. Feature Specifications

### 5.1 Global behavior

| Behavior          | Spec                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------- |
| Date display      | Friendly format `16 Jun 2025, 07:59` (no timezone conversion; parse as local time)       |
| Language display  | Full name: `en`→English, `hi`→Hindi, `bn`→Bengali, `te`→Telugu, `ta`→Tamil               |
| Loading           | Show a loader while CSVs load                                                           |
| Error             | Show an error message if a CSV fails to load / parse                                    |
| Empty results     | Show an empty-state message when filters/search yield no rows                          |
| Responsive        | Usable at 375px, 768px, 1280px. Tables scroll horizontally on small screens             |

### 5.2 Table behavior (shared by Users and Sessions tables)

| Behavior        | Spec                                                                                          |
| --------------- | --------------------------------------------------------------------------------------------- |
| Default order   | CSV order until the user sorts                                                                |
| Sort            | Click a sortable header to cycle **ascending → descending → none (CSV order)**; indicator: grey stacked up/down chevrons when unsorted, a single blue chevron for the active direction |
| Pagination      | Client-side. Page-size selector: **10 / 25 / 50**, default **10**                             |
| Pagination UI   | Prev / Next, "Page X of Y", "Showing A–B of N"; Prev/Next disabled at the edges               |
| Page reset      | Any change to search, filter, sort, or page size resets to **page 1**                          |
| Page-size state | Independent per table (not shared). Not persisted (persistence is a bonus)                    |
| Multi-select    | Empty selection = no filter (all rows shown)                                                  |
| Pipeline order  | search → filter → sort → paginate                                                             |

### 5.3 Users List — `/users`

**Columns:** User ID, Name, Join Time, Status, Last Active Time, Actions.

| Feature        | Spec                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| Search         | Single input matching **Name OR User ID**, **partial match (contains)**, **case-insensitive**, trimmed. Updates as you type with **500 ms debounce**. Empty input = all rows |
| Status filter  | **Multi-select**: New, Returning, Deleted                                                                |
| Sort           | **Join Time** only (3-state cycle)                                                                        |
| User ID        | Rendered as a link → `/user/:id`                                                                          |
| Status         | Rendered as a badge (distinct color per status)                                                           |
| Actions        | "View Sessions" link → `/user/:id/sessions`                                                               |
| Pagination     | Per [5.2](#52-table-behavior-shared-by-users-and-sessions-tables)                                          |

### 5.4 User Details — `/user/:id`

| Element / Feature  | Spec                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| Header             | Name, User ID, Status badge (context; PRD-required fields below)                                         |
| PRD fields         | Join Time, App Version, Device Info, Location, Language (full name)                                     |
| Thumbnail          | `profile_thumbnail_url`; click opens modal with `profile_full_url`                                       |
| Modal close        | Close button **and** backdrop click (Esc is part of the bonus a11y task)                                 |
| Search by User ID  | Input + "Go" button; submit on Enter or click. **Exact**, case-insensitive, trimmed. Found → navigate to `/user/<id>`. Not found → inline "User not found" message under the input |
| Back navigation    | "Back to Users" link → `/users`                                                                          |
| Sessions link      | "View Sessions" button → `/user/:id/sessions`                                                            |
| Unknown ID         | "User not found" state with link back to `/users`                                                         |

### 5.5 User Sessions — `/user/:id/sessions`

**Columns:** Session Start, Duration (min), Device, Entry Screen, Exit Screen.

| Feature        | Spec                                                                        |
| -------------- | --------------------------------------------------------------------------- |
| Header         | User Name + User ID, with a link back to `/user/:id`                         |
| Device filter  | **Multi-select** (same component as Status filter): Desktop, Mobile          |
| Sort           | **Duration** only (3-state cycle)                                            |
| Pagination     | Per [5.2](#52-table-behavior-shared-by-users-and-sessions-tables)             |
| Unknown ID     | "User not found" state with link back to `/users`                            |
| No sessions    | Empty-state message                                                          |

### 5.6 Analytics Dashboard — `/analytics`

| Element                     | Type        | Source & logic                                          |
| --------------------------- | ----------- | ------------------------------------------------------- |
| Total Users                 | Metric card | See [6.1](#61-total-users)                              |
| Average Session Duration    | Metric card | See [6.2](#62-average-session-duration)                 |
| Deleted User %              | Metric card | See [6.3](#63-deleted-user-)                            |
| Daily Active Users          | Line chart  | See [6.4](#64-daily-active-users-line-chart)            |
| New vs Returning Users      | Pie chart   | See [6.5](#65-new-vs-returning-users-pie-chart)         |
| App Version Distribution    | Bar chart   | See [6.6](#66-app-version-distribution-bar-chart)       |

All charts use recharts `ResponsiveContainer` and show tooltips.

---

## 6. Analytics Metric Definitions (changeable)

> **Status:** Decided by the implementer (user delegated the choice). **Expected to be revisited.**
> All logic lives in **one file: `src/analytics/metrics.js`** as pure functions.
> `AnalyticsPage` only calls these functions, so changing a definition means editing one function
> (and this section) — no UI changes needed.

### Guiding principle of the current choice

**"Consistent with the Users table."** Every card/chart number can be cross-checked against the
Users List (e.g. filter Status = Deleted → 44 rows ↔ Deleted User % = 44%). `analytics.csv` is
used **only** for the DAU line chart, because it is the only daily time series available.

**Why not `analytics.csv` for everything?** It is on a different scale than the 100-user table
(213–798 DAU/day), has no "total users" field, and is internally inconsistent
(`new + returning > DAU` on some days). Using it would make the dashboard disagree with the
rest of the app.

### 6.1 Total Users

| Option | Source / logic                                     | Value   |
| ------ | -------------------------------------------------- | ------- |
| **1a ✅ (current)** | `users.csv` — count of all rows            | **100** |
| 1b     | `users.csv` — rows where `status !== 'Deleted'`    | 56      |
| 1c     | `analytics.csv` — `daily_active_users` on latest date | 769  |
| 1d     | `analytics.csv` — sum of `new_users`               | 3591    |

Function: `getTotalUsers(users) → number`

### 6.2 Average Session Duration

| Option | Source / logic                                                   | Value        |
| ------ | ---------------------------------------------------------------- | ------------ |
| **4a ✅ (current)** | `user_sessions.csv` — mean of all `session_duration_minutes` | **64.2 min** |
| 4b     | Mean of each user's mean duration                                | 64.5 min     |
| 4c     | Mean over sessions of non-Deleted users only (349 sessions)      | 64.0 min     |

Display: 1 decimal + " min". Function: `getAverageSessionDuration(sessions) → number`

### 6.3 Deleted User %

| Option | Source / logic                                                              | Value     |
| ------ | --------------------------------------------------------------------------- | --------- |
| **2a ✅ (current)** | `users.csv` — Deleted count ÷ total users × 100                | **44.0%** |
| 2b     | `analytics.csv` — Σ`deleted_users` ÷ Σ`new_users`                           | 16.7%     |
| 2c     | `analytics.csv` — Σ`deleted_users` ÷ (Σ`new_users` + Σ`returning_users`)    | 4.4%      |
| 2d     | `analytics.csv` — Σ`deleted_users` ÷ Σ`daily_active_users`                  | 2.1%      |
| 2e     | `analytics.csv` — latest day `deleted_users` ÷ `daily_active_users`         | 2.5%      |

Display: 1 decimal + "%". Function: `getDeletedUserPercent(users) → number`

### 6.4 Daily Active Users (line chart)

| Option | Source / logic                                                           | Result                  |
| ------ | ------------------------------------------------------------------------ | ----------------------- |
| **5a ✅ (current)** | `analytics.csv` — `date` × `daily_active_users`, sorted ascending by date | 60 points, 213–798 |
| 5b     | `user_sessions.csv` — distinct `user_id` per day of `session_start`      | 31 points, 13–27        |

Function: `getDailyActiveUsers(analytics) → [{ date, value }]` (ascending by date)

### 6.5 New vs Returning Users (pie chart)

| Option | Source / logic                                               | Slices                          |
| ------ | ------------------------------------------------------------ | ------------------------------- |
| **3a ✅ (current)** | `users.csv` — count by `status`, excluding Deleted | **New 30 / Returning 26**       |
| 3b     | `users.csv` — count by `status`, including Deleted           | New 30 / Returning 26 / Deleted 44 |
| 3c     | `analytics.csv` — Σ`new_users` vs Σ`returning_users`         | New 3591 / Returning 10065      |
| 3d     | `analytics.csv` — latest day `new_users` vs `returning_users`| New 56 / Returning 219          |

Tooltip shows count and percentage. Function: `getNewVsReturning(users) → [{ name, value }]`

### 6.6 App Version Distribution (bar chart)

| Option | Source / logic                                             | Result                       |
| ------ | ---------------------------------------------------------- | ---------------------------- |
| **6a ✅ (current)** | `user_profiles.csv` — count per **exact** `app_version`, all 100 users | 86 bars, counts 1–2 |
| 6b     | Same, but only non-Deleted users (join with `users.csv`)   | 50 bars                      |

- Bars sorted by **semantic version ascending** (`v1.0.0` → `v3.8.9`), comparing numeric parts,
  not strings.
- Rendered inside a horizontally scrollable container so 86 bars stay readable.

Function: `getAppVersionDistribution(profiles) → [{ version, count }]`

### How to change a metric

1. Pick the new option from the tables above (or define a new one).
2. Edit the matching function in `src/analytics/metrics.js` (and its inputs in `AnalyticsPage` if
   the source file changes).
3. Update the ✅ marker and "Value" in this section, and add an entry to the Decision Log.
4. Re-run the Phase 6 manual checklist with the new expected values.

---

## 7. Architecture & Folder Structure

```
public/
  data/                       users.csv, user_profiles.csv, user_sessions.csv, analytics.csv
src/
  index.js                    Entry; imports styles/global.scss
  app/
    App.jsx                   Router + Layout
    routes.jsx                Route table
  components/                 Reusable, presentational (each has Component.jsx + Component.module.scss)
    Layout/  Header/  DataTable/  Pagination/  SearchInput/  MultiSelectFilter/
    Modal/  StatusBadge/  MetricCard/  Loader/  ErrorState/  ChartCard/
    SearchForm/  NotFoundState/  PageHeader/  Panel/  BackLink/
  pages/                      Route-level containers (data wiring + composition)
    UsersPage/  UserDetailsPage/  UserSessionsPage/  AnalyticsPage/  NotFoundPage/
    AnalyticsPage/            Also holds the three chart components (DAU, New vs Returning, App Version)
  data/
    csvClient.js              fetch + PapaParse + in-memory cache (one fetch per file)
    useCsv.js                 Hook → { data, loading, error }
    selectors.js              getUserById, getProfileByUserId, getSessionsByUserId
  analytics/
    metrics.js                All dashboard metric logic (see Section 6)
  hooks/
    useDebounce.js            Debounced value
    useSort.js                3-state sort (asc → desc → none)
    usePagination.js          Page, page size, slicing, reset
  utils/
    formatDate.js             'YYYY-MM-DD HH:mm:ss' → '16 Jun 2025, 07:59'; chart labels '07 Sep' / '07 Sep 2025'
    languages.js              Code → full language name
    filters.js                Partial search match, multi-select filter
    sorters.js                Date, number, semver comparators
  styles/
    _variables.scss           Colors, spacing, breakpoints, typography
    _mixins.scss              Breakpoint mixins, focus ring, etc.
    global.scss               Reset + base styles
    chartTheme.js             Chart colors as JS strings (recharts cannot read SCSS variables)
```

### Data flow

```
public/data/*.csv ──fetch──▶ csvClient (PapaParse, cached) ──▶ useCsv(name) ──▶ Page
                                                                              │
                                    selectors / filters / sorters / metrics ◀─┘
                                                                              │
                                                       Reusable components ◀──┘
```

- **Pages** own data loading and state (search, filters, sort, pagination).
- **Components** are presentational and receive data + callbacks via props.
- **Pure logic** (filters, sorters, metrics, formatters) lives in `utils/` / `analytics/` so it is
  easy to read and change.

### Parsing rules

- PapaParse with `header: true`, `skipEmptyLines: true`.
- Numeric columns converted to numbers (`session_duration_minutes`, all `analytics.csv` counts).
- Datetimes kept as original strings; parsed with a regex into a local-time `Date` only when
  formatting or sorting (see Decision Log #28).

---

## 8. Reusable Building Blocks

| Component / Hook     | Props / API (indicative)                                                        | Used by                  |
| -------------------- | ------------------------------------------------------------------------------- | ------------------------ |
| `DataTable`          | `columns[{ key, header, render?, sortable? }]`, `rows`, `sort`, `onSort`, `emptyMessage` | Users, Sessions |
| `Pagination`         | `page`, `pageCount`, `pageSize`, `pageSizeOptions`, `total`, `onPageChange`, `onPageSizeChange` | Users, Sessions |
| `SearchInput`        | `value`, `onChange`, `placeholder`                                              | Users                    |
| `MultiSelectFilter`  | `label`, `options`, `selected[]`, `onChange`                                    | Users (Status), Sessions (Device) |
| `Modal`              | `isOpen`, `onClose`, `title`, `children` (closes on button + backdrop; locks page scroll; focuses Close on open and restores focus on close) | User Details |
| `SearchForm`         | `label`, `placeholder`, `value`, `onChange`, `onSubmit`, `error` (submit on Enter/button, inline error) | User Details |
| `NotFoundState`      | `code?`, `title`, `message?`, `linkTo?`, `linkLabel?`                           | 404 page, User Details, User Sessions |
| `PageHeader`         | `title`, `subtitle?`                                                            | Users, User Sessions     |
| `Panel`              | `toolbar?`, `children` (card with an optional search/filter row on top)         | Users, User Sessions     |
| `BackLink`           | `to`, `children` (renders "← label")                                            | User Details, User Sessions |
| `StatusBadge`        | `status`                                                                        | Users, User Details      |
| `MetricCard`         | `label`, `value`, `description?` (small text naming the metric's data source)   | Analytics                |
| `ChartCard`          | `title`, `description?`, `className?`, `children`                               | Analytics                |
| `Loader` / `ErrorState` | `message?` (empty tables use `DataTable`'s `emptyMessage` instead)           | All pages                |
| `useCsv(name)`       | → `{ data: rows, loading, error }`. Names: `users`, `profiles`, `sessions`, `analytics` | Users, Sessions  |
| `useCsvs(names[])`   | → `{ data: { [name]: rows }, loading, error }` (loads several files together)    | User Details, Analytics  |
| `useDebounce(v, ms)` | → debounced value                                                               | Users                    |
| `useSort()`          | → `{ sort: { key, direction }, toggleSort(key) }` (3-state cycle)               | Users, Sessions          |
| `usePagination(rows, { defaultPageSize, resetKey })` | → `{ page, pageSize, pageCount, total, pageRows, setPage, setPageSize }`; resets to page 1 when `resetKey` or page size changes | Users, Sessions |
| `sortRows(rows, sort, comparators)` (`utils/sorters.js`) | Sorted copy; stable, so ties keep CSV order. Comparators: `compareNumbers`, `compareDateTimes`, `compareSemver` | Users, Sessions, Analytics |
| `filterByPartialSearch` / `filterBySelection` (`utils/filters.js`) | Case-insensitive "contains" search across fields; multi-select filter (empty = all) | Users, Sessions |

---

## 9. Phase-wise Implementation Plan

Each phase is **independently testable** via its manual checklist. Do not start a phase until the
previous phase's checklist passes. Expected values below are taken from the actual CSV data.

### Phase status

| Phase | Title                                  | Status      |
| ----- | -------------------------------------- | ----------- |
| 1     | Project setup, app shell & routing     | Done        |
| 2     | Data layer                             | Done        |
| 3     | Users List                             | Done        |
| 4     | User Details                           | Done        |
| 5     | User Sessions                          | Done        |
| 6     | Analytics Dashboard                    | Done        |
| 7     | Responsive polish & final QA           | Done        |
| 8     | Bonus features (deferred)              | Deferred    |

---

### Phase 1 — Project setup, app shell & routing

**Goal:** App boots with a header and all routes resolve to placeholder pages.

**Tasks**
1. Install `react-router-dom`, `papaparse`, `recharts`, `sass`.
2. Remove CRA boilerplate (`logo.svg`, `App.css`, default `App.test.js` content, spinning logo).
3. Create `styles/_variables.scss`, `styles/_mixins.scss`, `styles/global.scss`; import global in `index.js`.
4. Create `Layout` and responsive `Header` (title + Users / Analytics links with active state).
5. Create `routes.jsx` with all routes from [Section 4](#4-routes--navigation); placeholder pages
   render their name and route params.
6. `/` redirects to `/users`; `*` renders `NotFoundPage`.

**Manual test checklist**
- [ ] `npm start` runs with no console errors; browser lands on `/users`.
- [ ] Clicking **Users** / **Analytics** in the header navigates and highlights the active link.
- [ ] `/user/u0001` placeholder shows `u0001`; `/user/u0001/sessions` placeholder shows `u0001`.
- [ ] `/some/unknown/path` shows the 404 page with a link back to `/users`.
- [ ] At 375px width the header does not overflow.

---

### Phase 2 — Data layer

**Goal:** All CSVs load through one reusable, cached layer with loading and error states.

**Tasks**
1. Copy the 4 CSVs from `resources/` to `public/data/`.
2. `csvClient.loadCsv(name)`: fetch → PapaParse (rules in [Section 7](#parsing-rules)) → validate
   expected header columns → cache per file (fetched at most once per app session; failed loads
   are not cached so they can be retried).
3. `useCsv(name)` and `useCsvs(names)` hooks returning `{ data, loading, error }`.
4. `selectors.js`: `getUserById`, `getProfileByUserId`, `getSessionsByUserId` (case-insensitive ID).
5. `utils/formatDate.js`, `utils/languages.js`.
6. `Loader`, `ErrorState`, `EmptyState` components (`EmptyState` was later removed in Phase 7 as
   unused; tables show their own empty row).
7. Temporarily render row counts on placeholder pages to verify loading (marked `TEMP` in code;
   each is replaced when its page is built in Phases 3–6).

**Manual test checklist**
- [ ] Placeholder pages show counts: users **100**, profiles **100**, sessions **686**, analytics **60**.
- [ ] DevTools Network tab: each CSV is requested **once**, even after navigating between pages.
- [ ] Network throttled to "Slow 3G": loader is visible before data appears.
- [ ] Temporarily rename `public/data/users.csv`: `/users` shows "Failed to load users.csv (file
      missing or not a CSV)" (then restore the file).
- [ ] `/users` shows `2025-06-16 07:59:34 → 16 Jun 2025, 07:59`.
- [ ] `/user/U0002` (uppercase) shows `User2 · joined 31 Oct 2025, 07:59 · Bengali`.
- [ ] `/user/u9999` shows "No user found for this ID."
- [ ] `/user/u0001/sessions` shows "Sessions for this user: 3".

---

### Phase 3 — Users List (`/users`)

**Goal:** Fully functional Users List built from reusable table components.

**Tasks**
1. `DataTable` (column config, sortable headers with indicator, empty message, horizontal scroll on small screens).
2. `useSort` (3-state cycle) and `sorters.js` (date comparator).
3. `usePagination` + `Pagination` component (10/25/50, default 10, reset to page 1 on changes).
4. `useDebounce` (500 ms) + `SearchInput`; `filters.js` partial (contains), case-insensitive, trimmed match on name or ID.
5. `MultiSelectFilter` (Status: New, Returning, Deleted; empty = all).
6. `StatusBadge`.
7. `UsersPage` wiring: search → status filter → sort → paginate. Columns per [5.3](#53-users-list--users).

**Manual test checklist**
- [ ] Page loads 100 users in CSV order (`u0001`, `u0002`, …), 10 per page, "Page 1 of 10".
- [ ] Page size 25 → "Page 1 of 4"; page size 50 → "Page 1 of 2".
- [ ] Prev disabled on page 1; Next disabled on last page.
- [ ] Search `User5` → **11** rows (User5, User50–User59). Same for `user5`, ` USER5 `, and `ser5`.
- [ ] Search `u005` → **10** rows (u0050–u0059); `U0005` → only **u0005**.
- [ ] Search `User` → all **100** rows; `xyz` → no rows, empty-state message shown. Clearing search → all 100 rows.
- [ ] Results update ~500 ms after typing stops (not on every keystroke).
- [ ] Status = Deleted → **44** rows; New → **30**; Returning → **26**; New + Returning → **56**; none selected → **100**.
- [ ] Join Time header shows grey up/down chevrons when unsorted. 1st click ascending (blue up
      chevron, first row **u0051**, 11 May 2025), 2nd click descending (blue down chevron, first row
      **u0029**, 04 Nov 2025), 3rd click back to CSV order and grey chevrons.
- [ ] Go to page 3, then change search/filter/sort/page size → returns to page 1.
- [ ] Dates are shown as `16 Jun 2025, 07:59` style.
- [ ] Clicking a User ID → `/user/:id`; clicking "View Sessions" → `/user/:id/sessions`.
- [ ] At 375px, the table scrolls horizontally and controls stack without overflow.

---

### Phase 4 — User Details (`/user/:id`)

**Goal:** User profile view with image modal, ID search, and navigation.

**Tasks**
1. `UserDetailsPage`: join `users` + `user_profiles` by ID via selectors.
2. Details card per [5.4](#54-user-details--userid) (language as full name).
3. Reusable `Modal` (close button + backdrop click); thumbnail opens full image.
4. ID search form (exact, case-insensitive, trimmed; Enter or "Go"; inline "User not found").
5. "Back to Users" link and "View Sessions" button.
6. Not-found state for unknown IDs.

**Manual test checklist**
- [ ] `/user/u0002` shows: User2, New, Join Time **31 Oct 2025, 07:59**, App Version **v2.5.8**,
      Device **Macbook Pro**, Location **Delhi**, Language **Bengali**.
- [ ] `/user/u0010` shows: v3.8.9, Pixel 6, Delhi, **Tamil**.
- [ ] Clicking the thumbnail opens a modal with the full image (`profile_full_url`); close button
      closes it; clicking the backdrop closes it; clicking the image itself does **not** close it.
      (The URL asks for 512px but dicebear serves 256px; it is scaled to fit the modal.)
- [ ] While the modal is open the page behind does not scroll; after closing, focus returns to the thumbnail.
- [ ] Search `U0010` + Enter → navigates to `/user/u0010` and the input clears. Search `u9999` →
      inline "User not found: u9999", URL unchanged. Typing again clears the error.
- [ ] Submitting an empty search shows "Enter a user ID, e.g. u0010."
- [ ] `/user/u9999` shows "User not found" with a link back to `/users`.
- [ ] "Back to Users" → `/users`; "View Sessions" → `/user/u0002/sessions`.
- [ ] Layout is readable at 375px.

---

### Phase 5 — User Sessions (`/user/:id/sessions`)

**Goal:** Sessions table reusing Phase 3 components.

**Tasks**
1. `UserSessionsPage`: header with Name + ID and link back to `/user/:id`.
2. Reuse `DataTable`, `Pagination`, `MultiSelectFilter` (Device), `useSort` (Duration, numeric comparator).
3. Columns per [5.5](#55-user-sessions--useridsessions); Session Start in friendly format.
4. Not-found and empty states.

**Manual test checklist**
- [ ] `/user/u0001/sessions` shows "← Back to User1", heading **Sessions — User1**, subtitle
      **u0001 · 3 sessions in total**; table shows **3** sessions in CSV order (durations 6, 68, 113).
- [ ] Device = Desktop → **2** rows; Mobile → **1** row; both or none → **3**.
- [ ] `/user/u0005/sessions`: **9** sessions (Desktop 6, Mobile 3), CSV order durations
      **19, 103, 114, 39, 71, 115, 9, 54, 81**.
- [ ] Duration header on u0005: asc → **9, 19, 39, 54, 71, 81, 103, 114, 115**; desc → reverse;
      3rd click → back to CSV order above.
- [ ] Device filter + duration sort work together (u0001: Mobile + asc → **113**).
- [ ] Pagination shows "Page 1 of 1" for page size 10 (max 10 sessions/user in current data);
      page-size selector still works.
- [ ] Reachable from both the Users List ("View Sessions") and User Details ("View Sessions" button).
- [ ] "← Back to User1" → `/user/u0001`. `/user/U0002/sessions` (uppercase) works.
- [ ] `/user/u9999/sessions` → "User not found" with a "Back to Users" link (no back-to-details link).
- [ ] At 375px the table scrolls horizontally inside its card; the page itself does not.

---

### Phase 6 — Analytics Dashboard (`/analytics`)

**Goal:** Metric cards and charts, with all metric logic isolated in `src/analytics/metrics.js`.

**Tasks**
1. `src/analytics/metrics.js` with the six functions from [Section 6](#6-analytics-metric-definitions-changeable)
   (each with a short comment naming the chosen option, e.g. "Option 2a").
2. `sorters.js`: semver comparator (`compareSemver`).
3. `MetricCard`, `ChartCard` components; `styles/chartTheme.js` for chart colors.
4. `AnalyticsPage`: load `users`, `user_sessions`, `user_profiles`, `analytics`; render 3 cards + 3 charts.
5. Line chart (DAU), pie chart (New vs Returning with %), bar chart (App versions, horizontally scrollable).
   Chart components live in `pages/AnalyticsPage/`.

**Layout:** metric cards in 1 column, 3 columns from 768px. Charts: DAU full width; from 1024px the
pie takes 1/3 and the bar chart 2/3 of the next row; below 1024px everything stacks.

**Manual test checklist** (expected values for the current definitions in Section 6)
- [ ] Total Users = **100**, Average Session Duration = **64.2 min**, Deleted User % = **44.0%**;
      each card shows a one-line description of its data source.
- [ ] DAU line chart: subtitle reads **07 Sep 2025 – 05 Nov 2025** (oldest on the left); tooltip
      shows the peak **798** on 14 Sep 2025 and the lowest **213** on 23 Oct 2025.
- [ ] Pie: slice labels **53.6%** (New, green) and **46.4%** (Returning, blue); tooltip shows
      **30 users** / **26 users**; legend shows New and Returning.
- [ ] Bar chart: subtitle says **86 versions**; bars run `v1.0.0` → `v3.8.9`; y-axis 0–2;
      hovering `v1.2.0` shows **2** users.
- [ ] Charts resize with the window; at 375px the cards stack, and the bar chart scrolls
      horizontally inside its card (the page itself does not).
- [ ] Changing one metric function in `metrics.js` changes only that card/chart (sanity check of isolation).

---

### Phase 7 — Responsive polish & final QA

**Goal:** Consistent, clean UI across breakpoints; app is submission-ready.

**Tasks**
1. Review all pages at **375px**, **768px**, **1280px**; fix overflow, spacing, stacking.
2. Consistent spacing, typography, colors, and visible focus styles.
3. Remove unused code/files; zero console warnings/errors; `npm run build` succeeds.
4. Update `README.md` with setup, scripts, folder overview, and link to this plan.
5. Lazy-load the Analytics page so recharts is not in the initial bundle.

**Outcome:** the review at 375 / 768 / 1280 px found no overflow or stacking issues on any page
(including not-found states), so no layout changes were needed. Removed: `EmptyState` component,
`visually-hidden` mixin, `src/setupTests.js`, unused packages, and the `npm test` script.

**Manual test checklist**
- [ ] Re-run Phases 1–6 checklists end to end.
- [ ] Every page usable at 375 / 768 / 1280 px with no horizontal page overflow (tables and the
      app-version chart scroll inside their card).
- [ ] `npm install` then `npm run build` completes with "Compiled successfully" and no warnings;
      the main JS bundle is ~98 kB gzipped, with a separate ~122 kB chunk for Analytics.
- [ ] DevTools Network: opening `/users` does not download the Analytics chunk; navigating to
      `/analytics` downloads it once (a brief "Loading analytics…" may appear).
- [ ] No console errors or warnings during a full walkthrough.
- [ ] `README.md` setup steps work from a fresh clone.

---

### Phase 8 — Bonus features (deferred, single task)

Scope to be decided later. Candidates from the PRD:

- Persist filters (query params and/or localStorage)
- Light/dark theme toggle
- Export filtered data to CSV
- Keyboard accessibility (Tab focus, **Esc to close modal**)
- Deploy to Vercel/Netlify (includes SPA refresh/rewrite handling)

---

## 10. Decision Log

| #  | Topic                         | Decision                                                                 |
| -- | ----------------------------- | ------------------------------------------------------------------------ |
| 1  | Language                      | JavaScript                                                               |
| 2  | Libraries                     | react-router-dom, papaparse, recharts                                    |
| 3  | Styling                       | SCSS Modules + shared partials                                           |
| 4  | Data loading                  | CSVs in `public/data/`, fetched at runtime, cached in memory             |
| 5  | Testing                       | Manual checklist per phase                                               |
| 6  | Navigation                    | Top header; `/` → `/users`; 404 for unknown routes                       |
| 7  | Date format                   | `16 Jun 2025, 07:59`                                                     |
| 8  | Language display              | Full name                                                                |
| 9  | Pagination                    | Both tables; 10/25/50 (default 10); independent per table; reset to page 1 on change |
| 10 | Default table order           | CSV order                                                                |
| 11 | Sort cycle                    | asc → desc → none                                                        |
| 12 | Users search                  | Partial match (contains) on Name or ID, case-insensitive, live with 500 ms debounce. Originally exact match; changed via P1 (see [Pending changes](#pending-changes)) |
| 13 | Status filter                 | Multi-select                                                             |
| 14 | Device filter (Sessions)      | Multi-select                                                             |
| 15 | Sessions entry points         | Users List row link + User Details button                                |
| 16 | Details "Search by User ID"   | Exact ID on submit; inline "User not found"                              |
| 17 | Unknown user ID               | In-page "User not found" state                                           |
| 18 | Sessions header               | Name + ID + link back to details                                         |
| 19 | Modal close                   | Close button + backdrop click (Esc in bonus)                             |
| 20 | App version chart             | Exact versions, semver ascending                                         |
| 21 | Data quirks                   | Displayed as-is                                                          |
| 22 | Analytics metric sources      | Implementer's choice, "consistent with Users table" — see Section 6      |
| 23 | Static-host refresh           | Deferred to deploy bonus                                                 |
| 24 | Bonus features                | Deferred as a single task                                                |
| 25 | `sass` version                | Pinned to `~1.77.8`: CRA's sass-loader uses the legacy Sass JS API, which newer `sass` versions flag with deprecation warnings on every compile |
| 26 | Header active state           | "Users" is highlighted on `/users`, `/user/:id`, and `/user/:id/sessions`  |
| 27 | CSV validation                | Each file's header columns are checked after parsing. The dev server returns `index.html` (HTTP 200) for missing files, so a status check alone would not catch them |
| 28 | Date parsing                  | Parsed manually with a regex into local time (no `new Date(string)`), and formatted with fixed English month names so output is identical across browsers |
| 29 | `react-is` dependency         | `react-is@^19` installed explicitly; otherwise recharts resolves an older copy that does not recognise React 19 elements |
| 30 | Chart colors                  | `styles/chartTheme.js` mirrors the SCSS color variables, because recharts takes colors as JS props. Keep both in sync |
| 31 | Analytics code-splitting      | `AnalyticsPage` is lazy-loaded (`React.lazy` + `Suspense` with the shared `Loader`), so recharts is downloaded only when `/analytics` is opened. Initial JS: ~98 kB gzipped instead of ~214 kB |
| 32 | Unused dependencies           | Removed `web-vitals`, `@testing-library/*`, `src/setupTests.js`, and the `npm test` script (testing is manual only) |
| 33 | Node version                  | Node 20+ (React Router 7 requires it)                                     |

### Implementer assumptions (minor, change freely)

- Multi-select with nothing selected shows all rows.
- Search input is trimmed before matching.
- User Details also shows Name, User ID, and Status for context (beyond PRD-required fields).
- Metric display precision: 1 decimal place.
- Pagination UI: Prev/Next + "Page X of Y" + "Showing A–B of N".
- User Details search: empty submit shows "Enter a user ID, e.g. u0010."; a successful search clears
  the input; the search stays visible on the "User not found" state.
- Sessions rows have no unique ID in the CSV; the row's position within the user's sessions is used
  as the React key.
- Sessions empty-state text: "No sessions recorded for this user." (no data) vs "No sessions match
  the selected device." (filtered out).
- Modal locks page scroll while open and returns focus to the thumbnail on close (Esc is still in
  the bonus task).
- Analytics: each card/chart shows a short description of its data source (from
  `METRIC_DESCRIPTIONS` in `metrics.js`, so it updates when a metric definition changes).
- Analytics: DAU x-axis labels are `07 Sep`, tooltips `07 Sep 2025`; the bar chart's y-axis stops
  at the highest count; recharts' default entry animations are kept.
- recharts adds ~118 kB gzipped; it is split into the lazy-loaded Analytics chunk (Decision #31).

---

## 11. Out of Scope / Deferred

- Any backend / real API; data is read-only CSV.
- Editing, creating, or deleting users.
- Automated tests (manual checklists only).
- Bonus features (Phase 8).

### Pending changes

Changes identified during implementation. Pick these up only when asked. None are open right now.

#### P1 — Users List search: exact match → partial match ✅ Done

- **Was:** `/users` search kept a row only if Name or User ID **equalled** the query.
- **Now:** a row is kept if Name or User ID **contains** the query anywhere (case-insensitive,
  trimmed; `ser5` matches User5 and User50–59). Debounce, empty-query behavior, and the
  filter → sort → paginate pipeline are unchanged.
- **Scope:** Users List only. The User Details "Search by User ID" stays exact, because it must
  resolve to a single user.
- **Code:** `filterByPartialSearch` in `src/utils/filters.js` (replaced `filterByExactSearch`),
  used by `UsersPage.jsx`; the search label no longer says "exact match".

#### P2 — Table sort icon too small / unclear when unsorted ✅ Done

- **Was:** a small, light-grey `↕` text glyph when unsorted; `▲` / `▼` when sorted.
- **Now:** a `SortIcon` SVG in `DataTable.jsx` with stacked up/down chevrons (10×14px). Unsorted:
  both chevrons in the header's grey (darkens on hover with the label). Sorted: only the active
  chevron, in blue; the other is hidden but keeps its space so the header does not shift.
- **Scope:** `DataTable`, so both Users (Join Time) and Sessions (Duration) tables get it.

---

## 12. Conventions for Contributors & Agents

- Work **one phase at a time**; update the Phase status table when a phase starts/finishes.
- A phase is "Done" only when **every checklist item passes**.
- Keep components presentational; keep logic in hooks / utils / `analytics/metrics.js`.
- One component per folder: `ComponentName.jsx` + `ComponentName.module.scss`.
- Use SCSS variables/mixins from `src/styles/` — no hard-coded colors or breakpoints in components.
- Any new decision or change to an existing one → add/update a row in the
  [Decision Log](#10-decision-log) (and Section 6 for analytics metrics).
- If requirements are unclear, **ask** rather than assume, then document the answer here.
