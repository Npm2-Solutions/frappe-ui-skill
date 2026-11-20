# Design rules for app screens built with frappe-ui (1.2.0)

What is in this file: how to make a frappe-ui screen well designed, not only correct — the principles, the rules and a frappe-ui composition per screen type, a review checklist to run on the rendered screen, the slop patterns to avoid, and where the sources disagree. Every rule is written in frappe-ui's own tokens and components (`text-ink-gray-*`, `bg-surface-*`, `border-outline-*`, `text-p-*`, `Button variant`, `Badge theme`…), never raw hex or stock Tailwind colours. Token tables live in [setup-and-tokens.md](setup-and-tokens.md); component APIs in the other references; where every outside rule came from, in [design-sources.md](design-sources.md).

Sections
1. Principles — 1.1 question, finding, job · 1.2 hierarchy · 1.3 one primary action · 1.4 density · 1.5 spacing rhythm and edges · 1.6 type scale · 1.7 colour for state only, with a word · 1.8 surfaces, borders, radius, shadow · 1.9 empty, zero, loading, error · 1.10 feedback · 1.11 motion · 1.12 words · 1.13 accessibility and dark mode · 1.14 wayfinding and URL state
2. Screen types — 2.0 the shell · 2.1 list page · 2.2 record page · 2.3 dashboard · 2.4 settings · 2.5 form and dialog · 2.6 board · 2.7 mobile
3. Review checklist (run on the rendered screen)
4. What not to do (slop in app screens)
5. Where the sources disagree — 5a design skill vs frappe-ui · 5b between the other guides

**Sources and tags.** Design skill [taste-skill](https://github.com/Leonxlnx/taste-skill) v2.1.5 (MIT, skill name `design-taste-frontend`): `AS§n` = `references/app-screens.md` section, `CO§n` = `colour.md`, `CP§n` = `copy.md`, `DT` = `SKILL.md`. frappe-ui (https://github.com/frappe/frappe-ui, tag v1.2.0): `CORE` = `skills/frappe-ui/CORE.md`, `P1–P15` = `PHILOSOPHY.md`, `CONTEXT` = `CONTEXT.md`, `spec/…`, `recipe:X.vue` = `docs/components/recipes/X.vue` (frappe-ui's own full screens; screenshots in `../assets/recipes/`), `Name.vue:line` = `src/…`. Other guides in **[brackets]** — [Primer], [Vercel], [GOV.UK], [Nielsen H1–H10], [impeccable], [Atlassian], [Polaris], [Apple HIG], [Linear], [Refactoring UI], [ui-ux-pro-max], [Anthropic] — with their URLs and licences in [design-sources.md](design-sources.md). Contrast ratios marked *measured* were computed from `tailwind/tokens.js` (WCAG 2 formula, oklch → sRGB).

**Precedence.** frappe-ui's intent wins for anything about its components and tokens (their look, sizes, radius, motion, chart chrome). The design skill and the other guides decide what frappe-ui leaves open: what goes on the screen, hierarchy, data honesty, states, layout arithmetic, words, forms, wayfinding. Inside frappe-ui, code beats docs, and P12 (accessibility is non-negotiable) beats a token-step suggestion. Every conflict is listed in §5.

---

## 1. Principles

### 1.1 Question, finding, job (AS§2.1–2.2)
Before markup, write three lines: the screen's **one question** ("Which jobs are late?"), today's **finding** ("3 jobs past due, the oldest by 6 days"), and the **most frequent job** ("assign the next job").
- The biggest block answers the question; the largest figure answers the title's question; nothing else is bigger.
- The finding is read first: a `text-p-base text-ink-gray-6` line at the top of the body, or the subline of the lead figure, next to the action it drives.
- The job is one click from the first screen: the solid Button in `PageHeader`, or an action on the row that needs it.
- Every block answers a next question; a block with no question is deleted. No stock order (KPI row → big chart → two small charts → table).
- At 1440×900 every block the brief names shows its header and first rows. Overview lists stop at 4–6 rows with a "View all" ghost Button and the total.
- Common things first, the advanced ones a click away: `SidebarSection collapsible`, `Divider :action` "Show more", a `Popover` for filters, `Tabs` for a record's facets [Nielsen H8, impeccable].
- **Data tells the truth**: a fact shown twice is one variable; totals and deltas are computed from the values as displayed; a relative figure names its baseline ("+5 vs last Monday"); small numbers stay small; no lorem, Acme, John Doe, vanity totals.
- **Give it the product**: product and scope in `SidebarHeader` (`title` + `subtitle`), people as `Avatar :label` (initials), the trade's own nouns in every label.

### 1.2 Hierarchy (CORE «Page anatomy»)
- **Gray first.** Root wrapper `bg-surface-base text-ink-gray-8` once (recipes use `text-ink-gray-9`); colour only where it encodes information.
- **The work leads, the chrome recedes**: sidebar, toolbars and tabs stay neutral, with few small gray icons; no hue fills, coloured icons or per-item badges in nav rows [Linear, impeccable].
- Rank by ink step and weight before size; keep the scale tight (`text-base-medium text-ink-gray-8` name, `text-base text-ink-gray-6` detail, `text-sm text-ink-gray-5` meta) [Refactoring UI, impeccable]. Only the identity and the key number take the strongest ink (AS§7.5).
- **Labels are a last resort**: let the value carry its meaning ("12 open", "Due Fri"), not "Open count: 12"; no eyebrow above a heading [Refactoring UI, impeccable, Anthropic].

| Ink | Role (CORE) | *Measured* on `surface-base` light / on `surface-gray-2` light / on `surface-base` dark |
|---|---|---|
| `text-ink-gray-9` | strongest values: page title, KPI figures, unread titles | 19.2 / 17.3 / 16.9 |
| `text-ink-gray-8` | body, row titles, section headings — the page default | 17.9 / 16.1 / 12.7 |
| `text-ink-gray-7` | secondary values, table cells, descriptions | 11.7 / 10.6 / 8.2 |
| `text-ink-gray-6` | field labels, form icons, meta panel labels; anything a person must read | 7.8 / 7.0 / 6.3 |
| `text-ink-gray-5` | meta that is secondary or also given elsewhere: timestamps, counts, column headers | 4.2 / 3.8 / 4.2 |
| `text-ink-gray-4` (`placeholder-ink-gray-4`) | placeholders, disabled, decorative glyphs, the empty "—" — never needed words | 2.9 / 2.6 / 4.2 |
| `text-ink-blue-link` | links — add an underline or weight, the hue alone is 3.4:1 | 3.4 / 3.0 / 3.5 |
| `text-ink-amber-7` | not for text: amber icons and dots only (words: `ink-amber-8`, 7.1 / 10.9) | 3.9 / 3.5 / 8.2 |
| `outline-gray-3` as a focus colour | never (the recipes' `focus-visible:ring-outline-gray-3`): use `focus-visible:focus-ring` — itself 1.6 / — / 1.6 (1.13) | 1.7 / 1.5 / 1.8 |

- Sections are separated by a heading and `divide-y divide-outline-gray-1` or `border-t`, not by a card around each (CORE; recipe:AccountingDesktop.vue:554).
- The page is named once, in `PageHeader` (§2.0); the body does not repeat the header's title (record pages: §2.2).

### 1.3 One primary action per view
- One `<Button variant="solid">` per view or region (theme defaults to `gray` = near-black), at the right end of `PageHeader` (CORE; AS§4.3; every recipe) [impeccable, Primer, Nielsen H8]. A screen may have none (12 of 23 studied screens, AS§4.3). The accent marks only the primary action, selection and state, never decoration [impeccable].
- `Button`'s default variant is `subtle`: every other action is a plain `<Button>`; `variant="ghost"` in toolbars, section headers and selection toolbars (Button.md).
- In a Dialog the solid action goes **last** in `actions`: they render right-aligned in order (`flex justify-end gap-2`, Dialog.vue:120); a single action in an `xs`–`md` dialog stretches full width (Dialog.vue:368-371).
- Destructive: `theme="red"` (`subtle` in place, `solid` only inside the confirm), through `dialog.danger` naming the object and the consequence — or an undo (1.10) (CORE; AS§8.2).
- Actions sit in the same place on every page: page acts at the right of `PageHeader`, a record's secondary acts in one `Dropdown` with `:button="{ icon: 'lucide-more-horizontal', label: 'More actions', variant: 'ghost' }"` in the same spot on every record page [impeccable, Linear]. No decorative Export/Share clusters (AS§4.3, §14).
- A view switch (Open / All, Board / List) is `TabButtons` beside the primary, not a second solid button (recipes Accounting, Tickets, Deals).
- Row actions: none, one trailing `Dropdown`, or one visible ghost Button in a fixed column, same on every row (AS§7.8). Hover-revealed row actions must stay visible on touch: `opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100` (recipe DealCard.vue:48; the preset sets `hoverOnlyWhenSupported`).

### 1.4 Density
frappe-ui is compact by default. Keep it: dense is right when people need the data, and calm comes from hierarchy, not from emptiness [impeccable, Linear]. Compact controls, air between groups (§5b).

| Thing | frappe-ui value | Source |
|---|---|---|
| Buttons and inputs | `sm` 28px (default) · `md` 32 · `lg` 40 · `xs` 24 | Button.vue:225-228; TextInput.vue:103-106 |
| Sidebar item | `h-7` (28px), `text-sm` label, `size-4` icon | SidebarItem.vue:6, :47, :61 |
| Page header | `min-h-12` (48px); mobile 52px | PageHeader.vue:3; PageHeaderMobile.vue:3 |
| List header | `h-8 text-sm text-ink-gray-5`, one `border-b` | ListHeader.vue:5, :39 |
| Rows | `:row-height="40"` dense · 44–60 medium (Tickets 60) · `h-15` desktop feed · `h-17` mobile feed | CORE; recipe:TicketsDesktop.vue:411 |
| Settings row | `py-3.5`, gap-8 between text and control | SettingsRow.vue:2 |

- Choose one density per screen from who uses it (AS§10): **sparse** (homes, settings, one object: 56–60px rows, `p-6`), **medium** (lists, overviews: 44–60px rows, `p-4`), **dense** (an all-day queue: `:row-height="40"`, `text-sm` cells). Density belongs to the view, not to each row: one `:row-height`, one `list-row-px-*` per list [Primer].
- Row height, padding and type size move together; never shrink the type and keep the padding (AS§10). Do not size desktop controls up to `lg`.
- One control height per row or context: a toolbar is all `sm` (AS§4.4, §8.3).
- Placed space reads calm; leftover space reads unfinished (AS§10).

### 1.5 Spacing rhythm and edges
Geometry (CORE): sidebar `14rem` · gutters `px-3 sm:px-5`, the same pair on header, body and full-bleed rows (mobile body `px-4`, recipe:TicketsMobile.vue:220) · body top `pt-5`/`p-4` · sections `space-y-6` · settings sections `space-y-11` · form fields `space-y-4`, label to control `space-y-1.5` · inline actions `gap-2` · nav `space-y-0.5` · every scroll area ends `pb-10`…`pb-40` · widths: reading `max-w-[940px]`, prose `max-w-[770px]`, dashboards `max-w-4xl`, dense tables full width.
- **One left edge** from header to last row [Vercel]. A `List` bleeds its hover into the gutter with `-mx-3 list-row-px-3` so its text stays on the edge above (CORE); a table with a header needs `list-row-px-3` or labels sit left of the cells (list.md).
- **Group tightly, separate generously**: a heading has more space above than below; spacing only from the 0.25rem scale, no `p-[13px]` [impeccable, Refactoring UI].
- **One gap** for card grids, the same horizontally and vertically (`gap-4` or `gap-6`) (AS§4.1).
- **The grid closes**: column count chosen from the item count, a lone card spans, no orphan cell; write the sum in a comment (AS§4.2).
- **Cards in a row share a bottom edge**: balance by content; when short, `items-start` and let each keep its height (AS§4.2).
- No stretched card with a blank band over ~40px; only a footer action or a total sits at its foot (AS§4.2).
- Narrow blocks (≤5 columns, ≤6 rows) do not span the full width; pair them (`grid-cols-2 gap-8`, recipe:AccountingDesktop.vue:557) (AS§4.2).

### 1.6 Type scale
One family (InterVar, from the preset) [impeccable, Linear]; no second face in app screens. Size and weight are one utility: `text-base-medium`, not `text-base font-medium` (tracking is per weight; spec/foundations.md).

| Role | Class | px |
|---|---|---|
| Page title in `PageHeader` | `PageHeaderTitle` (`text-lg font-semibold text-ink-gray-9`, PageHeaderTitle.vue:2) or `Breadcrumbs` (`text-lg-medium`) | 16 |
| Record title in the body | `text-2xl-semibold text-ink-gray-8` (recipe:TasksDesktop.vue:1178) | 18 |
| Section heading | `text-base-semibold` / `text-lg-semibold` (CORE) | 14–16 |
| Body, cells, row titles | `text-base` (mobile `text-lg`) | 14 (16) |
| Meta, labels, captions | `text-sm text-ink-gray-5` (mobile `text-md`) | 13 (15) |
| Small labels in a strip | `text-xs text-ink-gray-5` | 12 |
| KPI figure | `NumberCard`: `text-3xl-semibold tabular-nums` (NumberCard.vue:124); bare strip `text-2xl-semibold` | 20 / 18 |
| The one answer figure | `text-5xl-semibold`…`text-7xl-semibold tabular-nums` | 26–32 |
| Wrapping text | `text-p-base`, `text-p-sm` (line-height ~1.5) | |

- `text-p-*` for anything that wraps, `text-*` for one-line labels; `leading-tighter` in a fixed-height box (CORE). Prose stays near 65–75 characters a line: `max-w-prose` on descriptions in wide record pages [impeccable, Anthropic].
- 4–6 sizes per screen; weights regular (420), medium, semibold; bold only for one figure or money (AS§9.1). Nothing above `text-7xl` (32px): `text-8xl`+ reads as a landing page (AS§9.1).
- **Numbers to compare**: right-aligned with their header, `tabular-nums`, formatted with `Intl.NumberFormat` / the exported `dayjs` (server datetimes through `dayjsLocal`, setup-and-tokens.md «Dates»), the same decimals per metric, thousands separators, a sign on every change, the unit as a smaller grey suffix (AS§7.4) [Primer, Polaris, Vercel]. `List` has no tabular figures of its own: add `ListCell class="justify-end tabular-nums"` + `ListHeaderCellSort align="end"`; charts take `format`.
- **Plan for short, average and very long content**: text in `<span class="truncate">` inside a `min-w-0` parent; essential truncated text keeps a way to the full value (a `Tooltip` or the record page). `Badge` never wraps, so status words stay short [Vercel, ui-ux-pro-max, impeccable].
- Typographic details: the `…` character on progress labels ("Saving…") and on menu items that open another step ("Move to…"); a non-breaking space between number and unit [Vercel].
- Sentence case everywhere: "Recent activity" (CORE) [Anthropic, Primer, Atlassian]. No uppercase tracked labels (AS§7.2).

### 1.7 Colour for state only, always with a word
- **Only semantic tokens**: `bg-surface-*`, `text-ink-*`, `border-outline-*`. Never raw hex, never `bg-gray-100`/`text-red-600` (fixed light values that do not flip), never `slate/zinc/indigo…` (not in the preset) (CORE; CO§2) [ui-ux-pro-max].
- **Colour encodes state, sign, severity or unread — nothing else** (CORE). Chrome stays gray: no tinted sidebar, no coloured tabs, no brand fill on buttons, at most one accent per screen (CORE; AS§13) [impeccable, Linear].
- **Never colour alone**: a `Badge` carries its `label`; a dot (`size-2 rounded-full bg-surface-<color>-7`, `aria-hidden`) sits beside a word (recipe:TicketsDesktop.vue:485-491); a sign carries direction; `Alert` brings its own icon per theme (P12; AS§7.5) [Vercel, ui-ux-pro-max, Refactoring UI].
- **One status vocabulary**: one map per state field, the same hue and the same word on every screen (CORE) [impeccable, Nielsen H4]: `({ open: 'blue', late: 'red', done: 'green', waiting: 'amber' })[s] ?? 'gray'` → `Badge :theme`. States at rest are `gray`; colour only for what needs attention or has ended. Badge themes `gray blue green amber red violet`; Alert `gray blue green amber red`; Button only `gray blue green red`.
- `Badge` default `variant="subtle"` is the pale pill. `solid` only for an unread/action count (`theme="amber" variant="solid" size="sm"`, CORE) or one rare call to action; if more than ~1 row in 5 would carry it, it is subtle (AS§7.6).
- **On/off** (Enabled/Disabled, Active/Inactive): on is the rest state — no mark, no green. An off record steps its title down to `text-ink-gray-6` (still read; `-4` is for disabled controls, 2.9:1) and says so in a gray subtle `Badge label="Disabled"`; a `Switch` in the row only when switching it there is the job (it shows its own state). «Built-in», «Standard», «System» are categories, not states: `Badge variant="outline" theme="gray"`, as the recipes' tags (recipe:TasksDesktop.vue:1071-1156). Red only when off is a fault to fix.
- One status mark per row; one red mark per object, on the failing fact (AS§7.6, §11). Warning is `amber`, never `yellow` (CONTEXT). The amber subtle Badge *measures* 3.5:1 in light mode: it must always say its word. `violet` is a sixth Badge theme for a category, not an accent.
- **Text colours in your own markup** (*measured*, ≥4.5:1 on `surface-base` in both themes): green `text-ink-green-7` (5.0 / 8.9) · red `text-ink-red-6` (5.2 / 4.8) or `-7` (6.7 / 6.9) · amber `text-ink-amber-8` (7.1 / 10.9) · blue `text-ink-blue-7` (4.7 / 9.0). Lower steps (`ink-green-5` 2.8, `ink-amber-6` 3.2, `ink-amber-7` 3.9 light) only for icons and dots (§5a). Badge subtle text on its tint, light: blue 4.2 · green 4.5 · amber 3.5 · red 5.7 · violet 7.0; dark all ≥4.8.
- **Good or bad, not up or down** (AS§5): `NumberCard negative-is-better` for cost, churn, late jobs, time-to-reply; a flat or absent delta is neutral grey (numberCardFormat.ts:16-36). Where up is not clearly good, keep the delta gray (recipe:AccountingDesktop.vue:98).
- Zero or undefined change is grey; from zero write "+4 (new)" (AS§5). The sign lives in the text: income "+" may take `text-ink-green-7`, expenses stay ink, not red on every negative (AS§7.5).
- On a `surface-gray-1`/`-2` fill, step text up one: meta `text-ink-gray-6`.
- **Charts**: one hue per chart — a single series takes the default ramp's first colour; 2–5 series `palette="categorical"`; one subject keeps one colour across charts via `seriesConfig[key].color` (AS§6.4; charts.md). Chromatic pixels stay around 3–5% of the screen (AS intro).

### 1.8 Surfaces, borders, radius, shadow
- **Structure must mean something**: a border, divider or card appears only where it separates real things; prefer space or a background step over a border (CORE: "a border needs a reason") [Anthropic, impeccable, Refactoring UI, Linear]. Never a card inside a card; no coloured side border thicker than 1px [impeccable].
- **Border or shadow, never both** on a resting surface; shadows only on what floats (AS§9.4).
- **No Card component** (CORE). Panel: `rounded-4 border border-outline-gray-1 bg-surface-base p-4`. On a dashboard next to charts, copy `ChartCard`'s surface so both match in dark mode: `rounded-4 border border-outline-gray-1 bg-surface-elevation-2 px-4 py-3` (ChartCard.vue:17-22: "8px, the radius the library gives a bordered box").
- **Radius scale** (`tailwind/tokens/radius.js`, turned into `rounded-<n>` by `plugin.js:38-52`; no bare `rounded`, no `-sm/-lg`): `0` · `1` 4px · `2` 5px · `3` 6px · `4` 8px · `5` 10px · `6` 12px · `7` 16px · `8` 20px · `9` 100px · `full`. How frappe-ui uses them: `-1` the checkbox box, legend and tooltip swatches, a toast's close button, small marks · `-2` a chart's focus box · `-3` `xs` buttons and inputs · `-4` `sm`/`md` buttons and inputs, menu and sidebar items, bordered panels (ChartCard) · `-5` `lg` buttons and inputs (Button.vue:222,228; TextInput.vue:106), toasts, tree rows, tabs and hovered list rows (written `rounded-[10px]`, ListRowBase.vue:12, tabs/styles.ts:91) · `-6` menus, popovers, Alert, board columns and cards (recipe:DealsDesktop.vue:527, :576) · `-7` dialogs · `-8`, `-9` unused · `-full` avatars, dots, pill badges, switches. Radius grows with size: a box you make clickable at row height takes `rounded-5` (write it so, not `rounded-[10px]`). Radii are concentric: an inner radius is never larger than its parent's (a box inside a panel `rounded-3` or less) [Vercel, Refactoring UI]; at most three panel radii per screen (AS§9.4).
- **Elevation pairs** (docs `foundations/shadows.md`): active nav/tab `bg-surface-elevation-3 shadow-sm` (the components do it) · dialog `bg-surface-elevation-1 shadow-xl` · menu/popover `bg-surface-elevation-2 shadow-2xl`. Shadows are light-only: in dark mode the `surface-elevation-*` step carries the lift.
- **Quiet fills**: `bg-surface-gray-1` for what is not a control (board column, inset block, key-value well). `bg-surface-gray-2/3/4` is the control ladder rest / hover / pressed — not a panel ground (CORE).
- **Every interactive piece has all its states** — rest, hover, focus, active, disabled, loading, error — and hover, active and focus are stronger than rest [impeccable, Vercel]. The library's parts have them; your own clickable element is a `<button>` with `hover:bg-surface-gray-2` and the global focus ring. A pressed `Button` is `:data-state="'active'"` + `aria-pressed` (no `active` prop, Button.md).
- No gradients, glows, glass or backdrop blur (AS§13). `bg-surface-alpha-*` only for overlays.

### 1.9 Empty, zero, loading, error (AS§11; spec/charts.md; CORE)

| State | Rule | frappe-ui |
|---|---|---|
| Real zero | Printed in the normal style: `0`, `€0.00`, `0%` | — |
| Missing | Grey dash "—" at text size, never at value size | `NumberCard :value="null"` prints "—" in `ink-gray-4` (NumberCard.vue:125) |
| Empty block | Keeps its frame and header; one sentence in the trade's words; at most one next step [Primer] | `px-3 py-10 text-center text-p-sm text-ink-gray-5`; `emptyText` on Select/Combobox; `List` has none — build it beside the list |
| First use (whole screen) | Shell and title stay; say what the area is for; one action where the data will appear [Primer, Polaris, Anthropic] | `min-h-[60vh]` centre, neutral disc `size-11 rounded-full bg-surface-gray-2` + `size-5 text-ink-gray-5` icon, `text-base-medium text-ink-gray-8`, `text-p-sm text-ink-gray-5`, one `subtle` Button «New …» (recipe:AccountingDesktop.vue:819-845); the solid primary stays in `PageHeader` |
| Filtered to nothing | Says so and names the filter ("No late jobs on Line 2") + a ghost "Clear filters" [Primer, impeccable] | — |
| No permission | Says who can see it — not an error, not empty [impeccable, GOV.UK] | `Alert` (gray) or one sentence |
| Empty chart | Drawn by the chart from no rows; no picture | charts have no `empty` prop (States.md) |
| First load | The final layout with placeholders of the real size; labels and headers at once; one indicator per region, never one per item; no layout shift [Primer, Vercel, impeccable] | `Skeleton class="h-4 w-40"`; region `aria-busy="true"`; charts and NumberCard skeleton themselves; guard `v-if="x.loading && !x.data"` (data.md) |
| Wait thresholds | Under ~1s nothing · 1–3s indeterminate · 3–10s progress · past 10s background it; show after ~150–300ms, keep shown ~300–500ms (no flicker) [Primer, Vercel] | `Spinner`/`LoadingText`; `Progress :value`; `toast.loading` updated by `id`; the delay is your timer |
| Refresh | Old values stay — also when the refresh fails (the error shows beside them); no skeleton; freshness stamp updates. Show what you have at once [Primer, Vercel] | A reload keeps the data while it runs; a *failed* one keeps `useList` rows and `useDoc().doc`, but `useCall` drops its `data` and never falls back to its `cacheKey` copy on a server error, `staleOnError` or not (useCall.ts:360-362) — the guard above then shows the error state. Keep the last good value in `onSuccess` (data.md §3). `useDoc` shows its IndexedDB copy first |
| Short wait | Inline | `Button :loading`, `LoadingText` |
| Error in a block | Inside the block that failed: what happened, why if known, what to do; Retry; the rest of the screen keeps working; no blame, no "sorry", no code first [Atlassian, Nielsen H9, impeccable] | `ErrorMessage :message` (`text-sm text-ink-red-7`, `role="alert"`, ErrorMessage.vue:4; a server error through `serverMessage`, data.md §2), or `Alert theme="red" :primary-action="{ label: 'Retry', onClick: () => res.reload() }"`; chart `#error` slot keeps the card |
| Page notice | Inline, above the content it concerns | `Alert` — `theme` colours only the icon and action, never the container |
| Stale/static data | "Updated 09:14" + refresh | `text-sm text-ink-gray-5` + `Button variant="ghost" icon="lucide-refresh-cw" label="Refresh"` |
| Can't act (read-only, not allowed, not yet) | Say why in visible text; show read-only values as text; avoid disabled buttons that explain nothing [Primer, impeccable, GOV.UK] | an `Alert` ("Only planners can change the schedule") or the field `description`; a `disabled` Button is a native `<button disabled>` and its `tooltip` never shows |

### 1.10 Feedback
- Every action answers: started, in progress, done or failed [Nielsen H1, Primer] — `:loading` on the button while the call runs (spinner, no dimming, Button.md), then the change in place: `useList`/`useDoc` share one store, so the row updates by itself (data.md). Progress words: "Saving…" while it runs, then "Saved" (`loading-text`, `toast.promise`) [Vercel].
- **Channel by how long the message must stay and how serious it is** [Atlassian, Primer]: a toast is the passing result of an act just taken; an `Alert` above the area is a lasting state; a banner is a system-wide risk; a dialog is a decision. Toasts: bottom-right, 4s, at most 3, dark surface, tone from the icon (spec/toast.md). Several edits on one record → the same `id`; long saves → `toast.promise`. When the page stays, confirm in place too (the saved value, a "Saved" stamp).
- **Undo before confirm** when recovery is safe: `toast.success('Job archived', { action: { label: 'Undo', onClick: restore } })`. When it is not, `dialog.danger` names the object and the consequence [Vercel, Nielsen H3/H5, impeccable].
- **Small, likely changes show at once** [Vercel]. A control bound to the store — `:model-value="job.doc.status"` + `@update:model-value` → `setValue.submit` — snaps back until the response lands, because the stores are written only from the response (data.md §5). Hold the shown value locally, set it first, revert on failure:
  ```ts
  const status = ref(job.doc?.status)
  watch(() => job.doc?.status, (v) => (status.value = v))          // follow the server
  async function setStatus(v: string | number | null | undefined) {
    const before = status.value
    status.value = v as string                                      // show it now
    try { await job.setValue.submit({ status: v }) }
    catch (e) { status.value = before; toast.error(serverMessage(e, `Couldn't change the status.`)) }  // data.md §2
  }
  // <Select :model-value="status" :options="statuses" @update:model-value="setStatus" />
  ```
  In a list the same is `useList().updateRow(doc)` (only keys the row already has) before `setValue.submit`, and `reload()` on failure.
- **Errors**: per field through `error` (aria wired, P5); form-level `ErrorMessage` beside the submit; a throw inside `onConfirm` shows inline in the dialog (CORE). Forms: §2.5.
- **Async results reach assistive tech** [Vercel, Primer]: input errors, red/amber `Alert`, `Spinner` and toasts announce themselves; add a visually hidden `<p role="status" class="sr-only">24 jobs</p>` after a filter changes.
- **One save model per view**: §2.4, §2.5 (AS§8.2) [Primer].
- **Selection states** are the components': `v-model:active` for list↔detail, `selectable` + `v-model:selection` for bulk, `SidebarItem` active for place.

### 1.11 Motion
- Motion is feedback only, short, showing cause and effect: press, hover, focus, a menu or dialog opening, a row arriving. Nothing performs an entrance; no staggered reveals; no count-up numbers (AS§2.8) [impeccable, Anthropic].
- frappe-ui's one rhythm: an 80ms opacity fade on open, nothing on close, nothing scales in (spec/popover.md, spec/dropdown.md, spec/hover-card.md). Do not add transitions to overlays.
- Your own transitions: `transition-colors` (never `transition-all`), 150–250ms, with `motion-reduce:` [Vercel, impeccable]. Reduced motion reduces, it does not remove status motion: `Spinner` slows to 1.6s (Spinner.vue:163).
- The only loading motion is `Skeleton`'s pulse (`animate-pulse bg-surface-gray-3`, Skeleton.vue:3); no shimmer gradient (AS§11).
- No colour transitions on large surfaces: `setColorScheme` mutes transitions for the switch (setup-and-tokens §12).

### 1.12 Words (CP§4, §6; AS)
- The person's words, not the system's, and **one name per concept everywhere** — keep one glossary for the app (sidebar, titles, Badge labels, empty states) [Nielsen H2/H4, Anthropic, impeccable].
- Titles are nouns: "Jobs", "Weld map", the record's name. No greeting, no emoji (AS§4.3).
- A subline is about the data (finding, period, scope), never about the interface ("This page shows…") (AS§4.3).
- **Buttons say what will happen**: a verb, plus the object when not obvious, 1–3 words: "Close job", "Release to shop", not "Submit"/"OK"; the primary keeps one name everywhere (CP§4) [Vercel, Primer, Atlassian, impeccable, Polaris]. Override the library's generic defaults (`'Confirm'`, `'Submit'`, `'Delete'`, utils/dialog.ts:390, :756).
- Sentence case, active voice, second person, short [Anthropic, Primer, Atlassian].
- The trade's words, not template nouns: "Waiting on material", not "Items", "Records", "Status" (AS intro).
- A count carries its noun and sits only on a queue that needs action: "Requests 5" (AS§3.2).
- Errors say what happened and what to do: "Couldn't load jobs. Last updated 09:14." — no blame, no "sorry", no "please" (AS§11) [Atlassian].
- Recency in words ("Today", "6 d"); dates compared in a column in one fixed format; IDs truncated with a copy action (AS§7.4). A server datetime goes through `dayjsLocal(s)` before it is formatted, or it shows the site's clock (setup-and-tokens.md «Dates»).
- Leave room for translation (+30–40%) and plurals: no fixed widths on Buttons or Badges; keep numbers as values in the string [impeccable].
- No genre verbs (streamline, seamless, empower), no tricolons, no "Step 1" labels (CP§6).

### 1.13 Accessibility and dark mode
- Every interactive element is a frappe-ui component (keyboard, focus, ARIA by P12); raw HTML only for layout (frappe-ui SKILL contract 1). Native elements first: `<button>` acts, `<a>` navigates, never a clickable `<div>` [Vercel].
- Everything works from the keyboard and focus is always visible: never remove the ring (`outline-none`) without `focus-visible:focus-ring`; on an error field `focus-visible:focus-ring-red` (spec/foundations.md) [Vercel, ui-ux-pro-max, Nielsen H7]. Do not pick a focus colour: `ring-outline-gray-3` (recipe:TasksDesktop.vue:1059; TreeItem.vue:45) is 1.7:1 (table in 1.2) — use `focus-visible:focus-ring`, the library's ring (2px light, 3px dark), itself only 1.6:1 (`tokens.js` `focusRing`), so never lighter or thinner than it.
- **Icon-only Button**: always pass `label` — it becomes `aria-label` and is visually hidden (Button.vue:327, :347); add `tooltip` for sighted users. The same for `TabTrigger icon` and icon `Dropdown` triggers [Vercel, ui-ux-pro-max]. A button repeated on every row names its row — `` :label="`Actions for ${row.title}`" `` — or a screen reader's list of buttons reads "Actions, Actions, Actions"; the short word goes in a `Tooltip` (list.md). Decorative icon spans take `aria-hidden="true"` (CORE).
- **Landmarks and one h1**: `Sidebar` is a `<nav>`; wrap `Breadcrumbs` in `<nav aria-label="Breadcrumb">`. Desktop `PageHeaderTitle` renders a `<span>` (PageHeaderTitle.vue:2): write `<PageHeaderTitle title="Jobs" role="heading" aria-level="1" />` (attributes fall through to the span). `PageHeaderMobile` already renders `<h1>` (PageHeaderMobile.vue:21). With Breadcrumbs as the title, the body carries the h1 (§2.2) [Vercel, ui-ux-pro-max].
- Every field has `label` (P5); a placeholder is only an example and never carries needed information (it is `ink-gray-4`, 2.9:1); `required` draws `*` with sr-only "(required)" and `aria-required`; a limit that remains goes in `description`. A toolbar search without a visible label gets `aria-label` [Primer, ui-ux-pro-max, Vercel].
- Every gesture has a click and a keyboard way: drag-to-reorder also has a "Move to…" menu item; `BottomSheet` also closes on Escape and outside click [Vercel, ui-ux-pro-max].
- A tooltip is a short label, never the only way to something; prefer inline help. Wrap a toolbar in one `TooltipProvider` (500ms first, 300ms skip). `HoverCard` may not show on touch or to screen readers: never hide an action in one [Vercel].
- Skeleton blocks are `aria-hidden`; mark the loading region `aria-busy="true"` (Skeleton.md).
- Nothing essential lives only on hover (touch has none; `hoverOnlyWhenSupported`) [ui-ux-pro-max, Vercel].
- Text ≥4.5:1 by WCAG 2 (CO§8; P12) — the measured tables in 1.2 and 1.7.
- **Dark mode is a full theme**: semantic tokens flip under `[data-theme="dark"]`; call `useColorScheme()` once at the root or nothing sets it. `useColorScheme` sets no CSS `color-scheme` (only `TextInput` sets it on itself, TextInput.vue:256): add `[data-theme="dark"]{color-scheme:dark}` to the app CSS so scrollbars and native controls follow [Vercel]. Use `dark:` only where no token exists (recipe board column `dark:bg-transparent dark:border`, recipe:DealsDesktop.vue:527, because `surface-gray-1` equals `surface-elevation-1` in dark). Look at both themes every round.

### 1.14 Wayfinding and URL state
- **Always show where the person is** [ui-ux-pro-max, Vercel, Nielsen H6]: the active nav item (pass `:active` for child routes — `SidebarItem` matches only exactly, SidebarItem.vue:216), the page title, a trail (`Breadcrumbs`) on nested pages, and the browser-tab title: `usePageMeta(() => ({ title: \`${job.title} · Jobs\` }))`.
- **The URL holds the view state** — tab, filters, sort, page, selected record — so a view can be shared, survives refresh, and Back works [Vercel, ui-ux-pro-max]: routed `Tabs` (`TabTrigger :route`); `TabButtons` v-model, filter values and `ListHeaderCellSort` direction synced with `route.query`; `List v-model:active` follows a route param.
- **Navigation uses real links** so modifier-click and "open in new tab" work: `ListRow :route` renders an `<a>`, `Button :route` a RouterLink, a row that holds buttons gets a stretched `RouterLink` (list.md). Menu items with `route` only `router.push` and render no `<a>` (Menu/Menu.vue:35-40): «Open» never lives only in a `Dropdown`. `Button href` always opens a new tab (Button.md): inside the app use `route` [Vercel].
- **Back is predictable and a deep link never strands anyone**: give `PageHeaderBackButton` a `:fallback-route`; without one a cold deep link calls `router.back()` and leaves the app (useHeaderBack.ts:72) [ui-ux-pro-max].
- **Shortcuts for experts, discoverable, out of novices' way**: `useKeyboardShortcut` + `KeyboardShortcutsDialog`; show keys with `KeyboardShortcut` chips in tooltips and menus; name keys, not characters [Nielsen H7, impeccable, Vercel].
- **Search is debounced**: `TextInput :debounce="300"` (read once at setup) [Vercel]. Synced with the URL, the field keeps its own untrimmed ref — `TextInput` binds `:value` (TextInput.vue:39), so writing a trimmed value or `route.query.q` back into it eats the trailing space while the person types:
  ```ts
  const text = ref(String(route.query.q ?? ''))                 // what the field shows
  const q = computed(() => text.value.trim())                    // what the filter and the URL use
  watch(q, (v) => router.replace({ query: { ...route.query, q: v || undefined } }))
  watch(() => route.query.q, (v) => { if (String(v ?? '') !== q.value) text.value = String(v ?? '') })  // Back/Forward
  // <TextInput v-model="text" :debounce="300" type="search" aria-label="Search jobs" />
  ```

---

## 2. Screen types

### 2.0 The shell (every desktop screen)
- `DesktopShell` + labelled `Sidebar` (`width="14rem"`, `class="border-r"`). `SidebarHeader` names the product and the scope (`title`, `subtitle`, `menu-items` for the switcher) (AS§3.2; every recipe) [impeccable].
- Labels by default; the icon `SidebarRail` only for multi-workspace apps (CORE). Groups by `SidebarLabel`/`SidebarSection` in sentence case.
- Nav items are other screens, never anchors inside the page (AS§3.2). Active look is `SidebarItem`'s own (`bg-surface-elevation-3 shadow-sm`, SidebarItem.vue:9); pass `:active` for nested routes.
- Counts only on queues that need action, as the `suffix` text (AS§3.2).
- Utilities (settings, help, collapse) at the bottom (AS§3.2; recipes).
- No extra top bar: `PageHeader` is the bar — title on the left; view switch, filters and the one primary on the right. Never a mostly empty bar (AS§3.3).
- Split panes (inbox, two-pane, board): `:scroll="false"`, each pane its own `ScrollArea` (DesktopShell.md).

```vue
<div class="h-screen w-full bg-surface-base text-ink-gray-8">
  <DesktopShell>
    <template #sidebar>
      <Sidebar width="14rem" class="border-r">
        <SidebarHeader title="Carpentry" subtitle="Officine Rossi" :menu-items="workspaceMenu" />
        <ScrollArea class="min-h-0 flex-1" viewport-class="px-2 pt-0.5 pb-10">
          <div class="space-y-0.5">
            <SidebarItem label="Today" icon="lucide-sun" :route="{ name: 'Today' }" />
            <SidebarItem label="Jobs" icon="lucide-briefcase" :route="{ name: 'Jobs' }"
              :active="route.path.startsWith('/jobs')" />
            <SidebarItem label="Requests" icon="lucide-inbox" :route="{ name: 'Requests' }" suffix="5" />
          </div>
        </ScrollArea>
      </Sidebar>
    </template>
    <RouterView />
  </DesktopShell>
</div>
```

### 2.1 List page
Question: "which one do I open or do next?"
- **Choose the kind of list on purpose** [Polaris]: a feed (no `columns`: media, title + meta line, trailing) to scan and open; an index table (`:columns` + `ListHeader` + `selectable`) to act on many; a data table to compare values (CORE).
- Header: the title (h1) and the set it shows — the total in grey, and the qualifier when filtered or partial ("Jobs · late · 12") [Polaris]; a view switch (`TabButtons`); the primary (AS§7.8; recipe:TicketsDesktop).
- One toolbar row at most (search `sm` with `:debounce`, filter and sort Buttons with a count `#suffix`); filters left, sort/view right (AS§4.4; Button.md). Filters, sort and page live in `route.query` (1.14).
- The identity column takes the room (`minmax(0,1fr)`), other tracks fixed; the identity cell may carry a second line `mt-1.5 text-sm text-ink-gray-5` (id · customer) (recipe:TicketsDesktop.vue:437-443).
- Status: one `Badge` column; priority: a dot + word; people: `Avatar size="sm"` + name; time: `text-sm text-ink-gray-5`, right (recipe:TicketsDesktop.vue:478-506). Numbers right, `tabular-nums`; missing "—".
- frappe-ui's header is already right (sentence case `text-sm text-ink-gray-5`, one rule): no fill band, no uppercase (ListHeader.vue:5, :39). **One visible default sort**: clicking the sorted column flips it; a new column sorts ascending; `ListHeaderCellSort` is controlled and sets `aria-sort` [Primer].
- Keep the header in view in a long table: `<ListHeader class="sticky top-0 z-10 bg-surface-base">` inside the pane's `ScrollArea` (recipe:AccountingDesktop.vue:779).
- No zebra; dividers as the List sets them (`full` with columns, `inset` in feeds).
- A row click opens the record (`ListRow :route`); controls inside the row don't hijack it — a row with its own buttons uses the stretched-link pattern: a `RouterLink` over a static row, `rounded-5`, the focus ring kept (list.md) [Polaris].
- Row actions: one in a final column, more in a menu; that column's header keeps `<span class="sr-only">Actions</span>`; each row's button names its row in `label` (1.13) [Primer].
- Bulk: `selectable` only when bulk actions exist; every `ListRow` gets `:value="value"`; a bar "3 selected · Close jobs · Clear" with verb + noun labels, ghost Buttons, destructive `theme="red"` (Button.md) [Polaris, ui-ux-pro-max].
- Past about 50 rows, load more, page or virtualise, and say the range ("1–50 of 1,284"; the total from the count endpoint, data.md §3). `useList` pages by appending: "Load more" with `next()`, and back to the first page on every filter or sort change — `previous()` until `!hasPreviousPage` in a `flush: 'sync'` watcher, or the rows repeat (data.md §4). Numbered pages that replace each other need `useCall` on `/api/v2/document/<doctype>` with `start` in its params. Or `ListRows virtual` with `List :row-height` and a scrollable parent. No pagination under a short overview list (AS§7.8) [Polaris, Vercel].
- `List` has no loading or empty state: put `Skeleton` rows of the real height and the empty block (1.9) beside it yourself.
- Announce the count after filtering (`role="status"` line, 1.10).

```vue
<PageHeader>
  <div class="flex items-baseline gap-2">
    <PageHeaderTitle title="Jobs" role="heading" aria-level="1" />
    <span class="text-sm tabular-nums text-ink-gray-5">{{ total }} open</span>
  </div>
  <div class="flex items-center gap-2">
    <TabButtons v-model="view" :options="[{ label: 'Open', value: 'open' }, { label: 'All', value: 'all' }]" />
    <Button icon-left="lucide-list-filter" label="Filter" />
    <Button variant="solid" icon-left="lucide-plus" label="New job" @click="openNew" />
  </div>
</PageHeader>
<div class="px-3 pt-3 pb-10 sm:px-5">
  <List class="w-full list-row-px-3" :columns="['minmax(0,1fr)', '8rem', '7rem', '6rem']" :row-height="60">
    <ListHeader>
      <ListHeaderCell>Job</ListHeaderCell>
      <ListHeaderCell>Status</ListHeaderCell>
      <ListHeaderCellSort :direction="dir" align="end" @click="toggleSort">Due</ListHeaderCellSort>
      <ListHeaderCell class="justify-end">Hours</ListHeaderCell>
    </ListHeader>
    <ListRows :items="jobs.data ?? []" v-slot="{ item, value }">
      <ListRow :value="value" :route="{ name: 'Job', params: { name: item.name } }">
        <ListCell>
          <div class="min-w-0">
            <div class="truncate text-base text-ink-gray-8">{{ item.title }}</div>
            <div class="mt-1.5 truncate text-sm text-ink-gray-5">{{ item.name }} · {{ item.customer }}</div>
          </div>
        </ListCell>
        <ListCell><Badge :label="item.status" :theme="statusTheme(item.status)" /></ListCell>
        <ListCell class="justify-end text-base tabular-nums text-ink-gray-7">{{ fmtDate(item.due) }}</ListCell>
        <ListCell class="justify-end text-base tabular-nums text-ink-gray-7">{{ item.hours ?? '—' }}</ListCell>
      </ListRow>
    </ListRows>
  </List>
</div>
```

### 2.2 Record page
Question: "what state is this one thing in, and what do I do next?"
- Its own route with the id as a param (list ↔ detail are two routes) (CORE); the tab title names the record (`usePageMeta`).
- `PageHeader`: `Breadcrumbs` (parent, then the record); the record's next step as the solid Button on the right; other acts in the same `…` Dropdown on every record page (destructive last, `theme: 'red'` → `dialog.danger`). Give the last crumb a `route` too: a crumb with neither `route` nor `href` renders as a `<button>` (Breadcrumbs.vue:57-66).
- Body column + meta panel: `w-[20rem] shrink-0 border-l` holding a `grid grid-cols-[5rem_minmax(0,1fr)] items-center gap-y-6 p-6 text-base text-ink-gray-6` of label / control pairs, edited in place with `Select`, `MultiSelect`, `DatePicker` (recipe:TasksDesktop.vue:1246-1250; CORE). These auto-save (single choices, 2.4); text fields save explicitly.
- Body opens with the state and the finding: the title `text-2xl-semibold text-ink-gray-8` (when it is read or edited there, recipe:TasksDesktop.vue:1178) or an `sr-only` h1, a `Badge`, then one `text-p-base text-ink-gray-7` line ("Waiting on material since 3 Nov · 2 of 5 parts cut") (AS§2.2). Long descriptions `max-w-prose`.
- Sections: `mt-10 border-t pt-6`, heading `text-base-semibold text-ink-gray-8` with its count in `text-ink-gray-5` (recipe:TasksDesktop.vue:1185-1194); or `Tabs` (default `underline`, "as on a CRM record page", Tabs.md), routed, when sections are big. `TabButtons` only to switch a filter or view inside a section.
- Key-value: label `text-ink-gray-6`, value `text-ink-gray-8`, missing "—"; group with headings, not boxes. Read-only for this person → values as text plus one line saying why (1.9).
- Child rows (the record's lines) are a `List` table inside their section; activity is a feed (avatar, name `text-base-medium`, time `text-sm text-ink-gray-5`, text `text-p-base text-ink-gray-7`).
- Two-pane variant (inbox, queue): `DesktopShell :scroll="false"`, `List v-model:active` on the left following a route param, the record in a `ScrollArea`; `PageHeaderBase` splits the header at the column border (CORE).

```vue
<PageHeader>
  <nav aria-label="Breadcrumb">
    <Breadcrumbs :items="[{ label: 'Jobs', route: { name: 'Jobs' } }, { label: job.doc?.title ?? '', route: $route.fullPath }]" />
  </nav>
  <div class="flex items-center gap-2">
    <Dropdown :options="moreActions" :button="{ icon: 'lucide-more-horizontal', label: 'More actions', variant: 'ghost' }" />
    <Button variant="solid" label="Release to shop" :loading="release.loading" @click="release.submit()" />
  </div>
</PageHeader>
<div class="flex h-full flex-1">
  <ScrollArea class="min-h-0 flex-1">
    <div class="p-6">
      <div class="flex items-center gap-2">
        <h1 class="text-2xl-semibold text-ink-gray-8">{{ job.doc?.title }}</h1>
        <Badge :label="job.doc?.status" :theme="statusTheme(job.doc?.status)" />
      </div>
      <p class="mt-3 max-w-prose text-p-base text-ink-gray-7">Waiting on material since 3 Nov · 2 of 5 parts cut</p>
      <section class="mt-10 border-t pt-6">
        <h2 class="text-base-semibold text-ink-gray-8">Parts <span class="ml-1 text-ink-gray-5">5</span></h2>
        <!-- List table of the parts -->
      </section>
    </div>
  </ScrollArea>
  <aside class="hidden w-[20rem] shrink-0 border-l sm:block">
    <div class="grid grid-cols-[5rem_minmax(0,1fr)] items-center gap-y-6 p-6 text-base text-ink-gray-6">
      <div>Owner</div><Select v-model="owner" :options="people" />
      <div>Due</div><DatePicker v-model="due" />
    </div>
  </aside>
</div>
```

### 2.3 Dashboard
Question, e.g.: "is the shop on plan this week?"
- Width: frappe-ui's centred `mx-auto max-w-4xl space-y-6` for a one- or two-column overview (CORE; recipe:AccountingDesktop.vue:479); full width with the gutters when three columns or a wide table would leave voids (AS§4.1). Width follows content.
- The finding line first (`text-p-base text-ink-gray-6`), then the block that answers the question, biggest (AS§2.2).
- Each block fetches on its own (`useCall` per block), so the header and fast blocks paint before slow stats; each shows its own placeholder [Primer, Vercel].
- **KPIs are type, not tiles** (AS§5): one strip split by dividers, not four cards. Either the bare strip of the recipe (`grid grid-cols-4 divide-x divide-outline-gray-2`, cells `px-4 first:pl-0 last:pr-0`, label `text-xs text-ink-gray-5`, value `text-2xl-semibold`, recipe:AccountingDesktop.vue:482-505), or `NumberCard :card="false"` cells inside one bordered box (spec/charts.md) for its delta, loading and empty handling.
- Column count = KPI count; 1–6 KPIs; or no KPI row and each panel leads with its own number (AS§5). A figure is shown once.
- `NumberCard`: `delta` + `delta-caption="vs last week"` (the baseline in words), `negative-is-better` where down is good, `:value="null"` when missing, `format` for units. No `sparkline` unless the trend is the point and no chart shows it (AS§5; §5a).
- **Charts** inside `<ChartCard class="h-64">`…`h-80` (no height, no plot); the chart's `title` prop is its heading; one question, one series per chart; switch metrics with `TabButtons` rather than overlaying lines; time on x; `referenceLines` for a target, a capacity or the day something changed, with a `label` (AS§6.1-6.4; charts.md). A legend or `colors` pins meaning; never colour alone.
- Do not restyle chart chrome (gridlines, legend, tooltip, states): the library owns the look (spec/charts.md conventions 2-3).
- A series flat except one event gets ≤2/3 of the width; a few numbers need no chart (AS§6.1).
- Lists on a dashboard: 4–6 rows, a ghost "View all" in the block header, the total stated (AS§7.8; recipe «Recent transactions»).
- Progress against a whole: a thin grey track `h-1.5 rounded-full bg-surface-gray-2` with fill `bg-surface-gray-6`, both ends labelled (recipe:AccountingDesktop.vue:616-619; AS§6.4), or `Progress`.

```vue
<div class="mx-auto max-w-4xl space-y-6 p-4">
  <p class="text-p-base text-ink-gray-6">3 jobs are past due; welding is 12 h behind plan.</p>
  <div class="grid grid-cols-4 divide-x divide-outline-gray-1 rounded-4 border border-outline-gray-1 bg-surface-elevation-2">
    <NumberCard v-for="k in kpis" :key="k.title" :card="false" class="px-4 py-3" v-bind="k" />
    <!-- k = { title: 'Late jobs', value: 3, delta: 1, deltaCaption: 'vs last week', negativeIsBetter: true } -->
  </div>
  <div class="grid grid-cols-3 gap-4">
    <ChartCard class="col-span-2 h-72">
      <BarChart :data="hours" x="day" y="booked" title="Booked hours per day"
        :reference-lines="[{ value: 64, label: 'Capacity', dashed: true }]" />
    </ChartCard>
    <section class="rounded-4 border border-outline-gray-1 bg-surface-elevation-2 px-4 py-3">
      <div class="flex h-7 items-center justify-between">
        <h2 class="text-base-semibold text-ink-gray-8">Late jobs</h2>
        <Button variant="ghost" label="View all" :route="{ name: 'Jobs', query: { late: 1 } }" />
      </div>
      <!-- 5 rows: title text-base text-ink-gray-8, days late text-ink-red-6 tabular-nums -->
    </section>
  </div>
</div>
```

### 2.4 Settings
- `SettingsDialog` is frappe-ui's settings screen (CORE): `SettingsNavGroup` / `SettingsNavItem` on the left, one `SettingsPanel` per area with `SettingsHeader` (stays) and `SettingsBody` (scrolls). One area per panel, its name as the header title (AS§8.2). Bind `v-model:tab` to a `/settings/:tab` route so a link opens the right panel.
- `SettingsRow` = title + one-sentence description left, control right; rows in `divide-y divide-outline-gray-1`, sections `space-y-11 pt-6` (CORE; SettingsRow.vue). A description that points somewhere («Managed in <a>Email accounts</a>») goes in the `#description` slot (1.2.0, SettingsRow.vue:12-17); the prop is plain text.
- **Save model by control** [Primer]: a `Switch`, `TabButtons` or single `Select` saves on change (`useDoc().setValue.submit`, then `toast.success('Saved', { id: 'settings-<panel>' })`); text fields, checkbox groups and multi-selects share one explicit Save in `SettingsHeader #actions` with `:loading`. Never both models on one panel (AS§8.2).
- Show what the setting produces beside it (the email as sent, the next invoice) (AS§8.2).
- A setting this person cannot change stays readable and says why in its description (AS§8.1) [impeccable].
- Destructive last, in its own section: a `subtle` red Button, the consequence in words, `dialog.danger` naming the object (AS§8.2).

```vue
<SettingsDialog v-model:open="open" v-model:tab="tab">
  <SettingsSidebar>
    <SettingsNavGroup label="Workshop">
      <SettingsNavItem value="shifts">Shifts</SettingsNavItem>
      <SettingsNavItem value="notifications">Notifications</SettingsNavItem>
    </SettingsNavGroup>
  </SettingsSidebar>
  <SettingsContent>
    <SettingsPanel value="notifications">
      <SettingsHeader title="Notifications" description="Who hears about late jobs, and when." />
      <SettingsBody>
        <div class="divide-y divide-outline-gray-1">
          <SettingsRow title="Morning digest" description="An email at 07:00 with yesterday's late jobs.">
            <Switch v-model="digest" /> <!-- saved by a watcher + toast with a stable id -->
          </SettingsRow>
        </div>
      </SettingsBody>
    </SettingsPanel>
  </SettingsContent>
</SettingsDialog>
```

### 2.5 Form and dialog
**When a dialog**
- A modal only for a short, self-contained task or a decision that must interrupt: rename, assign, move (`Dialog size="md"`), one to three fields (`dialog.prompt`). A new record with many fields or sections is a page (§2.2) [Apple HIG, Atlassian, impeccable] (Dialog.md).
- The title names the task ("Move weld to another joint"); the buttons name the outcome (1.12) [Apple HIG, Atlassian, Vercel].
- An obvious way out (`dismissible` + close button); no modal on top of a modal — the one exception is a "Discard changes?" `dialog.confirm` [Apple HIG].
- Focus goes in on open, stays inside, returns to the opener (the components do it); autofocus the first field on desktop only — an `[autofocus]` element is focused on every open [Vercel, Primer].
- `dialog.*` renders confirm before cancel in the DOM (`flex flex-row-reverse`, utils/dialog.ts:388), so Tab reaches confirm first; a `<Dialog :actions>` row is in array order — Cancel first, primary last (Dialog.vue:120) [Primer].
- A multi-step task is one Dialog whose body, title and main button change with the step (Dialog.md «New project setup»).

**Fields**
- `FormControl` with the label above (P5); `required`; `description` for a limit that remains; `error` per field. Placeholder at most an example [Primer, ui-ux-pro-max, Vercel].
- One column, most important first, related fields under their own heading; a field's width hints at the value's length (`mx-auto max-w-xl space-y-4`, CORE) [Primer]. When a label renders, `class` moves to the wrapper (inputs.md), so set widths knowing that.
- The right control and input type: `Select` fixed one, `MultiSelect` fixed many, `Combobox` searched one (`:filterable="false"` for server search), date pickers for dates (CORE); `TextInput type="email|number|tel|url"`; never block paste. `TextInput` sets `autocomplete="off"` (TextInput.vue:47): pass a real `autocomplete` on login, address and contact fields [Vercel, ui-ux-pro-max].
- One control height per form (default `sm`; `lg` on a phone, 2.7).

**Validation and submit**
- **Validate on submit first; then re-check a field while the person fixes it; never block typing; the server always validates** [GOV.UK, Primer, Vercel]. Map the server's message into the field `error`s; form-level or server errors in `ErrorMessage` beside the actions — as plain words, without the `"ValidationError: "` head or HTML (`serverMessage`, data.md §2). `dialog.prompt` blocks an empty `required` field **without a message**, before any `validate` runs (utils/dialog.ts:524-567): when the person needs to be told, leave `required` off and let `validate` return the message ("Enter a title"), or use a `Dialog` with `FormControl`s.
- Errors sit beside their field and focus moves to the first one (`.focus()` is exposed on every input); with three or more, an `Alert theme="red"` summary above the form [Primer, GOV.UK].
- A failed save keeps what was typed (`useNewDoc().doc` stays; a rejected `onConfirm` keeps the dialog open with the error inline, CORE) [Primer, GOV.UK, impeccable].
- Submit stays enabled until the request starts, then `:loading` (keeps the label, blocks clicks, no dimming); never `disabled` to mean "invalid" — submit and show the errors [Vercel, Primer]. Async `Dialog` actions and `dialog.*` do this themselves.
- Enter submits (`dialog.prompt` is a real `<form novalidate>`, utils/dialog.ts:680-684). In a `Dialog`, `#default` and `#actions` are sibling divs (Dialog.vue:51-134), so no `<form>` wraps both: give the form an `id` in `#default` and put `Button type="submit" form="<id>"` in `#actions` (as below), or the buttons inside the form and no `actions` (overlays.md). Always `novalidate`: `required` is the native attribute on the input (TextInput.vue:41), and without it the browser's own bubble blocks the submit before your validation runs. `Mod+Enter` submits a textarea (`@keydown.meta.enter` / `.ctrl.enter`) [Vercel].
- **Warn before unsaved work is lost** [Vercel, Primer, Apple HIG]: control the dialog — `:open="open" @update:open="onOpenChange"` — and ask there while dirty: ×, Escape, outside click and Cancel's `close()` all arrive in it. `:dismissible="false"` alone is not enough: it stops Escape and outside clicks, not the header × (a `DialogClose`, Dialog.vue:36-45, :89-95). On pages a router leave guard plus `beforeunload`.
- Actions at the end, right-aligned: Cancel (subtle) then the primary (solid) named for the result: "Create job", not "Submit" (CORE form example; CP§4).
- On success: close, `toast.success`, navigate (data.md).
- Destructive confirm: `dialog.danger({ title: 'Delete job J-0042?', message: 'Its 5 parts and 12 welds are deleted too.', confirmLabel: 'Delete job', onConfirm })` — the default label is a bare 'Delete' (utils/dialog.ts:756).

```vue
<script setup lang="ts">
const open = ref(false)
function onOpenChange(next: boolean) {
  if (next || !dirty.value) { open.value = next; return }
  dialog.confirm({ title: 'Discard the new job?', message: 'What you typed is lost.', confirmLabel: 'Discard',
    onConfirm: () => { open.value = false } })
}
// create(): validate → errors; saving = true; insert; on success open.value = false (no question), toast, navigate
</script>

<Dialog :open="open" @update:open="onOpenChange" title="New job">
  <form id="new-job" novalidate class="space-y-4" @submit.prevent="create">
    <FormControl v-model="form.title" label="Title" required :error="errors.title" />
    <FormControl v-model="form.customer" type="combobox" label="Customer" :options="customers" :error="errors.customer" />
    <FormControl v-model="form.due" type="date" label="Due" description="The day the customer expects it." />
  </form>
  <template #actions="{ close }">
    <div class="flex justify-end gap-2">
      <Button label="Cancel" @click="close" />
      <Button type="submit" form="new-job" variant="solid" label="Create job" :loading="saving" />
    </div>
  </template>
</Dialog>
```

### 2.6 Board
Question: "where is the work stuck?"
- `DesktopShell :scroll="false"`; the track `flex h-full gap-3 p-4` inside `overflow-x-auto`; columns `flex w-72 shrink-0 flex-col rounded-6 bg-surface-gray-1 dark:bg-transparent dark:border`, each with its own `ScrollArea`; cards `rounded-6 border bg-surface-elevation-1 p-3` (recipe:DealsDesktop.vue:521-576; CORE).
- Column header: a state dot + name `text-sm-medium text-ink-gray-8` + count `text-sm text-ink-gray-5` + a ghost add Button (recipe:DealsDesktop.vue:529-545). The column is gray; state colour lives in the dot only, beside its word.
- Card: name `text-base-medium text-ink-gray-9`, the key figure `text-base-semibold text-ink-gray-8`, one outline `Badge` for a category, `Avatar size="xs"` + name and a date `text-sm text-ink-gray-5` (recipe:DealCard.vue). One status mark per card; one red mark at most (AS§11).
- Card actions revealed on hover stay visible on touch (`[@media(hover:none)]:opacity-100`, DealCard.vue:48). Drag has a keyboard path: a "Move to…" Dropdown item on the card (P12) [Vercel].
- Drop target: `rounded-6 border-2 border-dashed border-outline-gray-2 bg-surface-gray-2` (recipe:DealsDesktop.vue:571). Empty column keeps its frame + one line in `text-ink-gray-6` (gray-1 fill, 1.7).
- Board ↔ List as `TabButtons` in the header, kept in the URL; on a phone, one column at a time or a `ListGroup` per state (AS§12).

```vue
<div class="min-h-0 flex-1 overflow-x-auto overflow-y-hidden">
  <div class="flex h-full gap-3 p-4">
    <section v-for="col in columns" :key="col.state"
      class="flex min-h-0 w-72 shrink-0 flex-col rounded-6 bg-surface-gray-1 dark:border dark:bg-transparent">
      <div class="flex items-center justify-between pl-3 pr-1 pt-1">
        <div class="flex items-center gap-2">
          <span class="size-2 rounded-full" :class="col.dot" aria-hidden="true" />
          <h2 class="text-sm-medium text-ink-gray-8">{{ col.label }}</h2>
          <span class="text-sm tabular-nums text-ink-gray-5">{{ col.items.length }}</span>
        </div>
        <Button variant="ghost" icon="lucide-plus" :label="`New in ${col.label}`" />
      </div>
      <ScrollArea class="min-h-0 flex-1" viewport-class="flex flex-col gap-2 p-2">
        <article v-for="c in col.items" :key="c.name" class="rounded-6 border bg-surface-elevation-1 p-3">…</article>
        <p v-if="!col.items.length" class="py-6 text-center text-p-sm text-ink-gray-6">Nothing waiting</p>
      </ScrollArea>
    </section>
  </div>
</div>
```

### 2.7 Mobile
- **Adapt the structure, don't shrink it** [impeccable, Vercel]: desktop and mobile are two shells, chosen by viewport — `MobileShell` + `PageHeaderMobile` + `MobileNav` (MobileShell.md).
- **Knowing it is a phone.** frappe-ui exports no breakpoint helper (`useScreenSize`/`useIsMobile` were removed in 1.0, docs changelog/v0-to-v1.md:2671-2674); the shells switch nothing, only `Sidebar` collapses itself below `sm` (Sidebar.vue:48-52). The preset's screens are `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280, no `2xl` (tailwind/tokens.js:233-238). Read them with VueUse (a frappe-ui dependency) on the same numbers, so script and classes switch at the same width: `const bp = useBreakpoints({ sm: 640, md: 768, lg: 1024, xl: 1280 })`, `const phone = bp.smaller('sm')` (`max-width: 639.9px`, the same as `max-sm:`), `bp.greaterOrEqual('lg')` for a two-pane layout. VueUse's `breakpointsTailwind` has the same four plus a `2xl` the preset lacks.
- `PageHeaderMobile`: back or menu in `#prefix`, the title (an `h1`, centred, 52px), one action or a `…` Dropdown in `#suffix` (CORE). A back button always has a `fallback-route` (1.14).
- `MobileNav`: 3–5 destinations, short labels, the last "You" with an `Avatar` (CORE; AS§12) [ui-ux-pro-max].
- Desktop → mobile (CORE): sidebar → `BottomSheet`; persistent nav → `MobileNav`; panes → separate routes; action clusters → one `…` Dropdown; multi-value fields collapse (assignees → one avatar); titles `text-base` → `text-lg`, meta `text-sm` → `text-md`; rows `h-15` → `h-17`; Dialog → `BottomSheet`.
- **Sheets, not centred dialogs**: `BottomSheet` focuses the sheet, not a field, so the keyboard stays down; it has no `actions` prop — put a full-width `Button` in the slot; content-sized up to 90dvh [Vercel].
- Body gutter `px-4` (`list-row-px-4`) (recipe:TicketsMobile.vue:220-230; AS§12).
- Tables become two-line rows: the identity and the key number on line 1, the other fields in `text-md text-ink-gray-5` on line 2, status/time trailing — fields move, they are never dropped; never a sideways page scroll (AS§12; recipe:TicketsMobile) [ui-ux-pro-max, impeccable]. Or responsive `columns` (`{ base: [...], md: [...] }`) with matching `max-md:hidden` cells (list.md).
- One row of controls above a list at most (a `TabButtons fluid`); other filters behind a header icon Button → `BottomSheet`. The first row starts in the top 60% of the screen (AS§12).
- KPIs: a two-column grid (even count) or a label/value list, never four squeezed columns. Charts full width, `h-44`…`h-48` (AS§12).
- **Touch targets about 44px, at least 8px apart**: rows `h-17`; Buttons `size="lg"` (40px) inside `min-h-11` hit areas; nothing on hover [Vercel, ui-ux-pro-max].
- **Inputs at 16px or more**, or iOS zooms on focus: only `lg` TextInput/selection controls are `text-lg` (TextInput.vue:103-106); `Textarea` is a flat 13px at every size (Textarea.vue:77-80, :134-138) — give it `class="text-lg"` or accept the zoom [Vercel].
- Row actions are text actions or one compact trailing button; one bulk action for the list (AS§12).
- Safe areas: `MobileShell` pads a standalone PWA; a pinned footer adds `[@media(display-mode:standalone)]:pb-[env(safe-area-inset-bottom)]` (CORE) [Vercel].

```vue
<MobileShell>
  <PageHeaderMobile title="Jobs">
    <template #prefix><Button variant="ghost" icon="lucide-menu" label="Menu" @click="menuOpen = true" /></template>
    <template #suffix><Button variant="ghost" icon="lucide-list-filter" label="Filter jobs" @click="filtersOpen = true" /></template>
  </PageHeaderMobile>
  <div class="pb-6 pt-3">
    <div class="mb-3 px-4"><TabButtons v-model="view" fluid :options="[{ label: 'Open', value: 'open' }, { label: 'All', value: 'all' }]" /></div>
    <List class="list-gap-3 list-row-px-4">
      <ListRow v-for="j in jobs" :key="j.name" class="py-3" :route="{ name: 'Job', params: { name: j.name } }">
        <ListCell class="self-start"><div class="min-w-0"><div class="truncate text-lg text-ink-gray-8">{{ j.title }}</div>
          <div class="mt-1.5 truncate text-md text-ink-gray-5">{{ j.name }} · {{ j.customer }}</div></div></ListCell>
        <ListCell class="self-start justify-end"><Badge :label="j.status" :theme="statusTheme(j.status)" /></ListCell>
      </ListRow>
    </List>
  </div>
  <BottomSheet v-model:open="menuOpen" title="Carpentry"><!-- the desktop sidebar items --></BottomSheet>
  <template #nav>
    <MobileNav>
      <MobileNavItem label="Today" icon="lucide-sun" :route="{ name: 'Today' }" />
      <MobileNavItem label="Jobs" icon="lucide-briefcase" :route="{ name: 'Jobs' }" />
      <MobileNavItem label="Requests" icon="lucide-inbox" :route="{ name: 'Requests' }" />
      <MobileNavItem label="You" :route="{ name: 'Me' }"><Avatar :label="me" size="md" /></MobileNavItem>
    </MobileNav>
  </template>
</MobileShell>
```

---

## 3. Review checklist (source, then the rendered screen)

Wait for the network to settle, then look: render at 1440×900, 768 and 390, in light and dark, and walk it with the keyboard alone. Fix every "no", look again; three rounds at most. Judge the screenshots: what shows is real, whatever the code says (AS§2.7) [Anthropic webapp-testing, impeccable].

**Where** says what a row can be checked on. `src`: reading the code and running the grep below settles it (tokens, classes, labels, the branches that exist, `:loading`, `route` vs `onClick`). `screen`: only the rendered page shows it — sizes, order, edges, real data, wrapping, contrast as painted, keyboard order and focus, dark mode, phone width. `both`: the code says whether the piece exists, the screen whether it works (the error branch exists / a failed reload really shows it). A review done from the source alone reports its `screen` rows as not checked, never as passed.

| # | Check | Passes when | Where |
|---|---|---|---|
| 1 | Question | The biggest block answers the screen's one question and is read first; the largest figure answers the title's question | screen |
| 2 | Finding | Today's finding is in a sentence near the top, beside its action | screen |
| 3 | Job | The most frequent job is one click away; at most one `variant="solid"` per view (dialogs count separately) | src |
| 4 | Brief | Every block asked for shows its header and first rows at 1440×900 | screen |
| 5 | Product | Product and scope named in the sidebar header; labels in the trade's words; one name per concept across screens | src |
| 6 | Where am I | Active nav item lit (child routes too), one h1, a trail on nested pages, a browser-tab title | both |
| 7 | URL | Refresh keeps tab, filters, sort, page and selection; Back returns; a deep link has a way out; in-app links open in the same tab and are real `<a>` (modifier-click opens a tab; not a menu `route`) | both |
| 8 | Edges | One left edge from header to last row; the right edge used; header and body share `px-3 sm:px-5` | screen |
| 9 | Grid | No orphan cell, no dead strip, no stretched card with a blank band, no card in a card; cards in a row end level | screen |
| 10 | Density | One density; one control height per row; row height, padding and type moved together | src |
| 11 | Type | ≤6 sizes; size+weight as one utility; nothing above `text-7xl`; `text-p-*` on wrapped text; sentence case | src |
| 12 | Numbers | Right-aligned with headers, `tabular-nums`, fixed decimals, separators, units grey; totals recomputed from shown values; facts shown twice agree; deltas name their baseline | both |
| 13 | Long content | A very long name and +40% translated labels truncate cleanly, with a way to the full value; nothing overflows | screen |
| 14 | Zero/missing | Real zeros printed; missing values "—"; zero or undefined change grey | both |
| 15 | Colour | Colour only on state, sign, severity, unread; every colour has a word or icon beside it; the same state has the same hue and word on every screen; one red per object; one hue per chart | src |
| 16 | Tokens | No raw hex, no stock palette class, no removed alias (grep below) | src |
| 17 | Contrast | Words a person must read at `ink-gray-6`+; meta at `ink-gray-5` only; placeholders carry nothing needed; chromatic text uses the measured steps; links underlined or weighted | src |
| 18 | Surfaces | Borders have a reason; no resting shadow beside a border; radii on the scale and concentric, as in 1.8 | src |
| 19 | States | Each block shown empty (by cause: first use, filtered, no permission), loading (placeholder of its shape, one per region, no shift, no flicker), error (inside the block, what + what to do + Retry) | both |
| 20 | Can't act | Read-only or not-allowed says why in visible text; no unexplained disabled button | src |
| 21 | Feedback | Every act shows `:loading` then its result in place; toasts only report; decisions through `dialog.*`; reversible acts offer Undo; a filter announces its count | src |
| 22 | Forms | Validate on submit then re-check; errors beside fields, focus on the first, summary when 3+; input kept on failure; submit never disabled for "invalid"; Enter submits (`novalidate` form); unsaved changes warned, the × included; labels name the outcome, no bare Confirm/Submit/Delete | both |
| 23 | Dialogs | Short task only; title names the task; no modal on a modal; focus returns to the opener | both |
| 24 | Motion | Nothing enters on load; overlays use the library's fade; own transitions `transition-colors`; reduced motion respected | src |
| 25 | Keyboard | Every action reachable by Tab in reading order; focus ring visible; Esc closes overlays; drag has a menu alternative; tooltips are never the only way | screen |
| 26 | Names | Every icon-only Button has `label`, a repeated row button names its row; every field has `label`; decorative icons `aria-hidden`; Breadcrumbs inside a `nav` | src |
| 27 | Dark | Every surface, border and text still reads; scrollbars dark (`color-scheme`); no `dark:` override where a token exists | screen |
| 28 | Phone | MobileShell; nav in MobileNav/BottomSheet; tables as two-line rows; one control row above the list; first row in the top 60%; 44px targets; inputs ≥16px; no sideways page scroll | screen |
| 29 | Hover | Nothing essential appears only on hover | src |
| 30 | Size | Past ~50 rows the list pages or virtualises; search is debounced | src |

Source grep for rows 16–18 and 25 (review each hit; `#` hits include slot names): stock colours and removed aliases; arbitrary radii (`rounded-[10px]` → `rounded-5`); `font-mono` (one family, 1.6); every `outline-none` (kept only beside `focus-visible:focus-ring`); hand-picked gray focus colours; chromatic text below the measured steps (allowed only on icons and dots, 1.7).

```bash
grep -rnP --include=*.vue '#[0-9a-fA-F]{3,8}\b|\b(?:bg|text|border|ring|divide|fill|stroke)-(?:gray|red|green|blue|amber|yellow|orange|teal|cyan|violet|purple|pink|slate|zinc|neutral|stone|indigo|sky|emerald|rose|lime|fuchsia)-\d{2,3}\b|\brounded(?:-(?:sm|md|lg|xl|2xl))?(?![-\w\[])|\brounded(?:-[trblse]{1,2})?-\[|\bshadow-inner\b|\b2xl:|\bfont-(?:medium|semibold|bold|mono)\b|\boutline-none\b|\b(?:ring|outline)-outline-gray-[1-3]\b|\btext-ink-(?:(?:green|blue)-[1-6]|(?:red|violet)-[1-5]|amber-[1-7])\b|transition-all|theme="(?:yellow|orange)"' src/
```

---

## 4. What not to do (slop in app screens)

| Slop | Instead (frappe-ui) | Source |
|---|---|---|
| Raw hex, `bg-gray-100`, `text-red-600`, `indigo-*` | `bg-surface-*`, `text-ink-*`, `border-outline-*` | CORE |
| `rounded-lg`, bare `rounded`, `shadow-inner`, `2xl:` (silently no CSS); `rounded-[10px]` | `rounded-4`/`-5`/`-6`/`-7` (1.8), the six shadows, `xl:` | spec/foundations.md |
| `text-base font-medium` | `text-base-medium` | ADR-0007 |
| A hand-made Card/Modal/Toggle/Select lookalike | Token surface; `Dialog`; `Switch`; `Select`/`Combobox` | SKILL contract 1 [impeccable] |
| A dark or tinted sidebar, a coloured active pill with a left bar, coloured nav icons | `Sidebar` on `surface-sidebar`; `SidebarItem`'s own active state | AS§3.2 [Linear] |
| "Welcome back, Alex 👋", a hero header, an illustrated banner | A noun title in `PageHeader`; the finding as one line | AS§4.3 |
| An eyebrow or uppercase kicker; "Open count: 12" | The value carries the meaning: "12 open" | [Refactoring UI, impeccable] |
| Four KPI cards, each with an icon in a tinted circle and a green "+12.5%" pill | One divided strip; `NumberCard` delta with `delta-caption`, gray when flat | AS§5 |
| A sparkline on every KPI | No `sparkline`; the trend gets its own chart, or none | AS§5 |
| KPI values at 36–48px in a brand colour | `text-3xl-semibold` (NumberCard) / `text-2xl-semibold` in `ink-gray-9` | NumberCard.vue:124 |
| Green on every rise, red on every fall | `negative-is-better`; gray when direction carries no judgement | numberCardFormat.ts:34 |
| A rainbow: a hue per bar, per category, per row | One hue per chart; `palette="categorical"` only for real series; gray for what is fine | AS§6.4 |
| Restyled chart gridlines, legends, tooltips via `echartOptions` | The library's chrome; your meaning: `title`, `referenceLines`, `seriesConfig` | spec/charts.md |
| A chart with no height (0px) or a heading drawn above it | `<ChartCard class="h-72">` + the chart's `title` prop | charts.md |
| Zebra rows, uppercase tracked headers, a header band | `List` as shipped: rules, `text-sm text-ink-gray-5` sentence-case header | ListHeader.vue:5 |
| Left-aligned numbers in proportional digits | `justify-end tabular-nums` | AS§7.4 [Primer] |
| Saturated solid badges on most rows; a tag and a badge saying the same | `Badge` subtle; one status mark per row | AS§7.6 |
| The same state called "Done" here, "Closed" there, green here, blue there | One status map and one glossary | [impeccable, Nielsen H4] |
| `theme="yellow"`/`"orange"` for a warning | `theme="amber"` | CONTEXT |
| Colour as the only signal (a red row, a coloured dot alone) | Badge with a word; dot + word; sign in the text | P12 [Vercel] |
| Pagination under a five-row overview; 800 rows rendered at once | Cap + "View all" + total; page or `virtual` past ~50 | AS§7.8 [Polaris, Vercel] |
| Every block in its own bordered card with a shadow; a card in a card | Headings + `divide-y`; a border only with a reason; never border + shadow | CORE; AS§9.4 [impeccable] |
| A grid of equal cards with an orphan, cards stretched over blank bands | Column count from item count; `items-start`; pair narrow blocks | AS§4.2 |
| Three toolbar rows above a list; Export/Share/date clustered by the title | One control row; actions only when real; overflow in `…` | AS§4.4 |
| A top bar with search, bell and avatar, mostly empty; a floating action button | `PageHeader` holding the title, view switch and the primary | AS§3.3-3.4 |
| Spinners in every card or every row; a full-screen loader; a spinner that flashes for 100ms | Placeholder of the region's shape, one per region; show after ~200ms | spec/charts.md [Primer, Vercel] |
| A full-screen error banner; "Oops! Sorry, something went wrong (500)" | What happened, what to do, Retry — inside the block | AS§11 [Atlassian] |
| A toast for a lasting state, a toast asking a question, three toasts for one record | `Alert` for lasting state; `dialog.confirm`; one toast `id` | CORE [Atlassian] |
| "Are you sure? Yes / No" on a reversible act | Do it, toast with Undo; `dialog.danger` with a named label for the irreversible | [Vercel, impeccable] |
| A disabled Save for an invalid form; a disabled button with a tooltip as the only explanation | Submit stays enabled, errors show; reasons in visible text | [Primer] Button.vue native `disabled` |
| A long record form in a dialog; a dialog opening a dialog | A page; one modal at a time | [Apple HIG, Atlassian] |
| Validation on every keystroke; a field cleared after a failed save | Submit first, then re-check; keep the input | [GOV.UK, Primer] |
| Filters and tabs lost on refresh; `Button href` for in-app links (opens a new tab) | `route.query`; `route` | [Vercel] |
| Title Case Buttons, "OK", "Submit" | Sentence case, verb + object | [Anthropic, Primer, Atlassian] |
| "No data yet" with an illustration in an empty chart or card | The chart's empty state; one sentence in the frame | AS§11 |
| Scale-in modals, staggered entrances, count-up numbers, `transition-all` | The library's 80ms fade; nothing enters; `transition-colors` | spec/popover.md [Vercel] |
| Icon-only buttons with no name, or every row's button called "Actions"; placeholder as label; `outline-none` with no ring after it; the recipes' `focus-visible:ring-outline-gray-3` (1.7:1) | `label` naming the row; `label` on the field; `focus-visible:focus-ring` | P5, P12 |
| Row actions only on hover; actions hidden in a HoverCard or tooltip | Visible action, or `[@media(hover:none)]:opacity-100`; a menu | DealCard.vue:48 [Vercel] |
| 14px inputs and a 13px Textarea on a phone (iOS zooms) | `size="lg"`; `class="text-lg"` on Textarea | TextInput.vue:103 [Vercel] |
| Lorem, Acme, John Doe, round vanity totals, growth on a week-old account | The trade's own data, small numbers at real size, totals from rows | AS§2.5 |
| Emoji in labels, nav, empty states | Words | AS§13 |
| `dark:` overrides everywhere; shadows to lift things in dark; light scrollbars in dark | Tokens; `surface-elevation-*`; `color-scheme:dark` | CORE [Vercel] |
| A 4-column table squeezed on a phone; four KPI columns at 390px | Two-line rows; 2-column grid | AS§12 |

---

## 5. Where the sources disagree

frappe-ui wins on its components and tokens; P12 (frappe-ui's own) beats a step suggestion in its docs; the design skill and the other guides decide what frappe-ui leaves open.

### 5a. Design skill vs frappe-ui

| Topic | Design skill | frappe-ui | Rule here |
|---|---|---|---|
| Page title | One h1 at 18–32px in the canvas, or the breadcrumb's last item at 16px (AS§4.3) | `PageHeaderTitle` 16px semibold, a `<span>` (PageHeaderTitle.vue:2); CORE says "page titles `text-2xl`+" | frappe-ui code: the title is the header's 16px; add `role="heading" aria-level="1"` (P12). Record title `text-2xl-semibold` in the body as in recipe:TasksDesktop |
| Control height | 32–40px; form inputs 38–40 (AS§8.1, §8.3) | `sm` 28px default, `md` 32, `lg` 40 | frappe-ui sizes; default `sm`, `lg` for thumbs |
| Nav row | 32px hit, 14px label, grey pill without shadow (AS§3.2) | `SidebarItem` h-7, `text-sm`, `bg-surface-elevation-3 shadow-sm` | frappe-ui, unchanged |
| KPI figure | Median 24px; answer figure 30–36 (AS§5) | `NumberCard` value 20px (`text-3xl-semibold`) | NumberCard as is; the one answer figure in own markup at `text-5xl`–`text-7xl` |
| Sparklines | None on KPIs (0 of 23, AS§5) | `NumberCard` has a `sparkline` prop | Off by default; on only when the trend is the point and not charted elsewhere |
| Chart chrome | Solid faint gridlines, no legend for one series (AS§6.3-6.4) | The library owns the look: dotted gridlines, xs legends, one placement (spec/charts.md) | frappe-ui; the design rules apply to meaning (one question, one series, reference lines, height, hue) |
| Card radius | Bimodal 4–8 or 16–24 (AS§9.4) | `ChartCard` `rounded-4` (code); CORE says `rounded-6` for cards; recipes' board cards `rounded-6` | Code: panels `rounded-4`; board cards, menus `rounded-6`; dialogs `rounded-7` |
| Meta grey | Every word tier ≥4.5:1 (AS§9.2, CO§8) | `ink-gray-5` is the library's meta colour (NumberCard title, ListHeader); *measured* 4.2:1 | frappe-ui: `ink-gray-5` only for secondary meta at ≥13px; needed words `ink-gray-6`+; step up on gray fills |
| Status text steps | Status text ≥4.5:1, darker greens (AS§9.2) | CORE and recipes use `ink-green-5` (2.8:1), `ink-red-5` (4.5/3.3), `ink-amber-6` (3.2) for text | P12 wins over CORE's step: `ink-green-7`, `ink-red-6/7`, `ink-amber-8` for text; lower steps for dots and icons. Badge's own subtle themes stay as shipped (amber subtle 3.5:1 light → always a word) |
| Empty one-liner | Grey sentence at 4.5:1 | CORE: `text-ink-gray-4` (2.9:1 light) | `text-ink-gray-5` |
| Empty-state icon | No icons in tinted circles; a neutral disc is allowed (AS§9.4, §13) | CORE/recipe empty state: icon in `bg-surface-gray-2` disc | Compatible: neutral disc only for a whole-screen first run; inside blocks one sentence |
| Dashboard width | Data pages 1100–1250px; narrow columns flagged (AS§4.1) | `max-w-4xl` (896px) centred (CORE, recipe) | frappe-ui width for one- or two-column overviews; full width when content has more columns |
| Phone geometry | 16–20px margins, 44px targets (AS§12) | Body `px-4` (recipe), header `px-3`, Button `lg` 40px, rows `h-17` | frappe-ui sizes; `lg` buttons in `min-h-11` hit areas; `h-17` rows |
| Primary colour | Near-black, often none (AS§4.3) | `variant="solid" theme="gray"` (= near-black) | Agree |
| Violet | Banned as an accent (owner's taste, AS§13) | `Badge`/`Avatar` `theme="violet"`, `focus-ring-violet` | Allowed as a component theme for a category; never as the screen's accent |
| Loading | Flat grey bars, no shimmer (AS§11) | `Skeleton` pulses (`animate-pulse`) | frappe-ui (a pulse is not a shimmer) |
| Table header | 12px grey, regular, strongest rule (AS§7.2) | `ListHeader` 13px `ink-gray-5`, `border-b outline-gray-1` | frappe-ui |
| Toasts | — | Dark surface in both themes, tone in the icon (spec/toast.md) | frappe-ui |
| KPI container | One container split by dividers (AS§5) | `NumberCard` draws its own card; `:card="false"` for several in one; recipe uses a bare divided strip | Agree: one divided strip, not a card per KPI |

### 5b. Between the other guides (frappe-ui's side decided; details in design-sources.md §4)

| Topic | The sides | Rule here (frappe-ui's intent) |
|---|---|---|
| Capitalisation | [Vercel] Title Case · [Anthropic, Primer, Atlassian] sentence case | Sentence case, as frappe-ui's labels and defaults ("Cancel", "Delete project"); older parts (editor toolbar, `KeyboardShortcutsDialog` title) are exceptions |
| When to validate | [GOV.UK] on submit only · [Primer] submit, then inline · [ui-ux-pro-max] on blur | Submit first, then re-check fields that had errors as they change; `dialog.prompt` checks on confirm |
| Toasts | [Primer] avoid, confirm inline · [Atlassian, Vercel, ui-ux-pro-max] flags, auto-dismiss | Both by role: `toast` for an act's result (4s, max 3), `Alert` for lasting state, and confirm in place when the page stays |
| Disabled buttons | [Primer] avoid · [Vercel, ui-ux-pro-max] disable while submitting | `:loading` during the request (blocks clicks, no dimming); for "can't yet" keep enabled and explain |
| Modals | [impeccable] last resort · [Apple HIG, Atlassian] fine for short tasks | Short tasks yes (`Dialog`, `dialog.*`, `SettingsDialog`); long record forms on a page |
| Contrast metric | [Vercel] APCA · [ui-ux-pro-max, impeccable] WCAG 4.5:1 | WCAG 2 (the legal baseline); measured ratios in 1.2 and 1.7 |
| Typeface | [Anthropic] distinctive type, avoid Inter · [impeccable, Linear] one sans | Inter, the library's font |
| Spinner or skeleton | [Primer] spinner default · [impeccable] skeletons in content | A region gets a placeholder of its shape; a button or inline wait a spinner (charts States.md) |
| Reduced motion | [Vercel, ui-ux-pro-max] reduce/turn off · [Primer] keep status motion | Reduce, keep status motion: Spinner slows to 1.6s; menus drop their motion |
| Button order | [Primer] page forms Save bottom-left · dialogs bottom-right | End-aligned everywhere: primary rightmost in dialogs; on pages the primary sits right in `PageHeader` |
| White space | [Refactoring UI] start with too much · [impeccable, Linear] dense for tools | Compact controls (14px, 28px), air between groups, not inside rows |
| Hit targets | [Vercel] 24px mouse / 44px touch · [ui-ux-pro-max] 44pt/48dp | By pointer: `sm` on desktop, `lg` with 44px hit areas on touch |
