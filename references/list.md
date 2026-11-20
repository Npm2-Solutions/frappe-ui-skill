# frappe-ui/list — lists and tables built from parts (frappe-ui 1.2.0)

The `frappe-ui/list` molecule (`src/molecules/list/`): every exported part, its props/slots, selection, active row, sorting, columns, groups, virtual rows, and how a list page is composed. `file:line` is relative to `src/molecules/list/`.

Sections: [What it is](#what-it-is) · [Import](#import) · [Parts and API](#parts-and-api) · [Minimal list](#minimal-list) · [Table with header, sort, selection](#table-with-header-sort-selection) · [Composition of a list page](#composition-of-a-list-page) · [Columns and layout](#columns-and-layout) · [Rows: link, button or div](#rows-link-button-or-div) · [Selection](#selection) · [Active row (master–detail)](#active-row-masterdetail) · [Sorting](#sorting) · [Groups](#groups) · [Virtual rows](#virtual-rows) · [Empty and loading states](#empty-and-loading-states) · [Spacing hooks](#spacing-hooks) · [Gotchas](#gotchas)

---

## What it is

A CSS-grid list: one column template shared by the header and every row, dividers, hover surfaces, a checkbox column, sort buttons. It does **no data work**: no fetching, sorting, filtering, paging, empty state. You pass rows and render cells. It is not the config-driven `ListView` (that lives, unstable, in `frappe-ui/experimental`).

Roles follow the header: without `ListHeader` → `list`/`listitem`; with it → `table`/`row`/`columnheader`/`cell` (ListHeader.vue:66).

## Import

```ts
import { List, ListHeader, ListHeaderCell, ListHeaderCellSort, ListRows, ListRow, ListCell, ListGroup } from 'frappe-ui/list'
import type { ListColumns, ListColumnsByBreakpoint, ListProps, ListRowProps, ListHeaderCellSortProps, ListDivider, ListSortDirection } from 'frappe-ui/list'
```
Importing `frappe-ui/list` also imports its `style.css` (grid/divider rules) — nothing else to add. Responsive `columns` and the `list-gap-*`/`list-row-px-*` utilities need frappe-ui's Tailwind preset.

## Parts and API

| Part | Props | Models / emits | Slots |
|---|---|---|---|
| `List` | `columns?: string[] \| { base: string[], sm?, md?, lg?, xl?, [screen] }`; `divider?: 'inset'\|'full'\|'none'`; `selectable?: boolean`; `rowHeight?: number` (px) | `v-model:selection` (`string[]`, default `[]`); `v-model:active` (`string\|undefined`) | `#default` |
| `ListHeader` | — | — | `#default` (header cells) |
| `ListHeaderCell` | — | — | `#default` (label), `#prefix`, `#suffix` |
| `ListHeaderCellSort` | `direction?: 'asc'\|'desc'\|null`; `align?: 'start'\|'end'` (default start) | emits `click(event)` | `#default`, `#prefix {direction}`, `#sort-indicator {direction}` |
| `ListRows` (generic `T`) | `items: T[]` (req); `rowKey?: string \| (item, index) => PropertyKey`; `virtual?: boolean`; `overscan?: number` (default 6) | — | `#default { item, index, value: string, selected, active }` |
| `ListRow` | `route?: RouteLocationRaw`; `href?: string`; `value?: string`; `onClick?(event)` | `@click` | `#default` (cells) |
| `ListCell` | — (`flex min-w-0 items-center`) | — | `#default` |
| `ListGroup` | `label?: string`; `sticky?: boolean` | — | `#default` (rows), `#label` |

Defaults: `columns` = feed template `['auto', 'minmax(0,1fr)', 'auto']` (style.css:56); `divider` = `inset` for the feed template, `full` when `columns` is set (List.vue:186).

## Minimal list

Feed layout (leading avatar, content, trailing meta), each row a link:

```vue
<List>
  <ListRows :items="people" v-slot="{ item }">
    <ListRow :route="{ name: 'Person', params: { name: item.name } }">
      <ListCell><Avatar :label="item.full_name" /></ListCell>
      <ListCell>
        <div class="flex min-w-0 flex-col">
          <span class="truncate text-base text-ink-gray-8">{{ item.full_name }}</span>
          <span class="truncate text-sm text-ink-gray-5">{{ item.role }}</span>
        </div>
      </ListCell>
      <ListCell class="text-sm text-ink-gray-5">{{ item.since }}</ListCell>
    </ListRow>
  </ListRows>
</List>
```

## Table with header, sort, selection

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { List, ListHeader, ListHeaderCell, ListHeaderCellSort, ListRows, ListRow, ListCell } from 'frappe-ui/list'

const selection = ref<string[]>([])
const sort = ref<{ field: 'title' | 'due'; dir: 'asc' | 'desc' }>({ field: 'due', dir: 'asc' })
function toggleSort(field: 'title' | 'due') {
  sort.value = sort.value.field === field
    ? { field, dir: sort.value.dir === 'asc' ? 'desc' : 'asc' }
    : { field, dir: 'asc' }
}
const rows = computed(() => [...jobs.value].sort((a, b) =>
  (a[sort.value.field] > b[sort.value.field] ? 1 : -1) * (sort.value.dir === 'asc' ? 1 : -1)))
</script>

<template>
  <List class="list-row-px-3" :columns="['minmax(0,1fr)', '8rem', '6rem']" selectable v-model:selection="selection">
    <ListHeader>
      <ListHeaderCellSort :direction="sort.field === 'title' ? sort.dir : null" @click="toggleSort('title')">Job</ListHeaderCellSort>
      <ListHeaderCell>Customer</ListHeaderCell>
      <ListHeaderCellSort align="end" :direction="sort.field === 'due' ? sort.dir : null" @click="toggleSort('due')">Due</ListHeaderCellSort>
    </ListHeader>
    <ListRows :items="rows" v-slot="{ item, value }">
      <ListRow :value="value" :route="{ name: 'Job', params: { name: item.name } }">
        <ListCell><span class="truncate">{{ item.title }}</span></ListCell>
        <ListCell><span class="truncate text-ink-gray-6">{{ item.customer }}</span></ListCell>
        <ListCell class="justify-end tabular-nums">{{ item.due }}</ListCell>
      </ListRow>
    </ListRows>
  </List>
</template>
```
While `selectable` is on, a row click toggles the checkbox instead of navigating (ListRow.vue:57) — usually `selectable` is switched on by a "Select" mode button.

## Composition of a list page

The usual list page inside `DesktopShell` (see [navigation.md](navigation.md#app-frame-at-a-glance)):

```vue
<template>
  <PageHeader>
    <PageHeaderTitle title="Jobs" />
    <div class="flex items-center gap-2">
      <TabButtons v-model="status" :options="[{ value: 'open', label: 'Open' }, { value: 'done', label: 'Done' }]" />
      <Button variant="solid" icon-left="lucide-plus" label="New job" @click="create" />
    </div>
  </PageHeader>

  <div class="px-5 py-3">
    <!-- selection action bar: your own markup -->
    <div v-if="selection.length" class="mb-2 flex items-center gap-2 text-sm">
      {{ selection.length }} selected
      <Button size="sm" label="Close jobs" @click="closeJobs(selection)" />
      <Button size="sm" variant="ghost" label="Clear" @click="selection = []" />
    </div>

    <!-- empty state: your own markup, the List has none -->
    <div v-if="!loading && !rows.length" class="py-16 text-center text-ink-gray-5">No jobs</div>

    <List v-else class="-mx-3 list-row-px-3" :columns="{ base: ['minmax(0,1fr)', '5rem'], md: ['minmax(0,1fr)', '10rem', '6rem'] }"
          :selectable="selecting" v-model:selection="selection">
      <ListHeader>
        <ListHeaderCell>Job</ListHeaderCell>
        <ListHeaderCell class="max-md:hidden">Customer</ListHeaderCell>
        <ListHeaderCell class="justify-end">Due</ListHeaderCell>
      </ListHeader>
      <ListRows :items="rows" row-key="name" v-slot="{ item, value }">
        <ListRow :value="value" :route="{ name: 'Job', params: { name: item.name } }">
          <ListCell><span class="truncate">{{ item.title }}</span></ListCell>
          <ListCell class="max-md:hidden"><span class="truncate">{{ item.customer }}</span></ListCell>
          <ListCell class="justify-end">{{ item.due }}</ListCell>
        </ListRow>
      </ListRows>
    </List>
  </div>
</template>
```
Rows come from your data layer (the data reference: `useList` and friends; `ListHeaderCellSort` pairs with its `orderBy`). Filters, paging ("Load more" button after the rows is fine — dividers ignore non-row siblings, style.css:186-195) and the selection bar are yours.

## Columns and layout

- Every row is its **own grid** reading the list's template, so `auto` tracks size per row and do not line up across rows. Tables must use fixed sizes, `fr`, or `minmax(0,1fr)` for the content column.
- Number of `ListCell`s per row (and header cells) must match the track count; extra cells wrap to a new grid line.
- Breakpoint object: `base` required; each other key is one of the app's Tailwind `screens` and replaces the **whole** template from that width up; switching happens in CSS (SSR-safe). Unknown keys (`medium`) are ignored with a dev warning; without the frappe-ui Tailwind preset every key above `base` is ignored (List.vue:84, `tailwind/listColumns.js`).
- Fewer tracks never hide a cell: hide header + row cells with the same classes (`max-md:hidden`).
- A nested `List` never inherits the outer template.
- Cells are `flex min-w-0 items-center` (ListCell.vue): right-align numbers with `class="justify-end"`. Put text in a `<span class="truncate">` (truncating the flex cell itself does not ellipsize), and stack lines in an inner `<div class="flex min-w-0 flex-col">` — `items-start` on the cell loses to its own `items-center` in Tailwind's CSS order.

## Rows: link, button or div

| ListRow has | Renders |
|---|---|
| `route` | `<a>` via `RouterLink custom` (needs vue-router) |
| `href` | `<a href>` same tab; since 1.2.0 only a relative, `http(s)`, `mailto` or `tel` href is rendered (ListRow.vue:18), any other leaves an `<a>` that goes nowhere |
| `@click`/`onClick`, or the List binds `v-model:active` | `<button type=button>` (ListRow.vue:53) |
| none | `<div>` (static: no hover surface, no padding inset) |

Click order (ListRow.vue:56-69): selection mode with a `value` → toggle only, stop; else if active-tracking → set active; then your `onClick`; then router `navigate`.

**Clickable rows that also hold buttons** (a star, a Dropdown): a link/button row cannot contain buttons. Keep the row static and stretch the open target over it as the first child, controls after it with `relative`. When the row opens a record the target is a real link (`RouterLink`: Ctrl/Cmd-click and "Open in new tab" work), not a `<button @click>`; a `<button>` only when the row does something in place (selects, expands). Restore what a static row lacks — the interactive row's `active:bg-surface-gray-2 sm:rounded-[10px] sm:hover:bg-surface-gray-1` (ListRowBase.vue:12-17), written on the scale as `rounded-5` (= 10px) — and the 0.75rem inset (`list-row-px-3` on the List, style.css:106-127):
```vue
<List class="-mx-3 list-row-px-3" :columns="cols">
  <ListRows :items="jobs" v-slot="{ item, value }">
    <ListRow :value="value" class="active:bg-surface-gray-2 sm:rounded-5 sm:hover:bg-surface-gray-1">
      <ListCell>
        <RouterLink v-if="!selecting" :to="{ name: 'Job', params: { name: item.name } }"
          class="absolute inset-0 sm:rounded-5 focus-visible:focus-ring" :aria-label="`Open ${item.title}`" />
        <span class="truncate">{{ item.title }}</span>
      </ListCell>
      <ListCell>
        <span class="relative"><Tooltip text="Actions"><Dropdown :options="actionsFor(item)">
          <Button variant="ghost" icon="lucide-more-horizontal" :label="`Actions for ${item.title}`" />
        </Dropdown></Tooltip></span>
      </ListCell>
    </ListRow>
  </ListRows>
</List>
```
Rows are `position: relative` (style.css:102). Drop the link while `selectable` is on (`v-if="!selecting"`), or a click both navigates and toggles the checkbox (ListRow.vue:56-69). A button repeated on every row names its row in `label` (it becomes the `aria-label`, Button.vue:347) — a screen reader's list of buttons otherwise reads "Actions, Actions, Actions" — and shows the short word in a `Tooltip` around the `Dropdown` (as recipe:TasksDesktop.vue:1055-1069 does). Do not put "Open" in the row's menu: menu `route` items render no `<a>` (overlays.md).

## Selection

- `selectable` on `List` reveals a 32px checkbox column (padding, not a track) and turns row clicks into toggles. `v-model:selection` is `string[]`.
- A row takes part only if it has `:value` (ListRowBase.vue:85) — rows without it get no checkbox.
- With a `ListHeader`, a select-all checkbox appears (checked / mixed / empty). Its universe is the `items` of `ListRows` (so it covers virtual rows that are not mounted). Clearing "all" only removes the current universe and keeps selections from other pages/filters (List.vue:174-182).

## Active row (master–detail)

- `v-model:active="openName"` highlights one row (`bg-surface-gray-3`, `aria-current`, dividers around it hidden) and makes rows buttons; a click sets it, then runs `onClick`/route.
- Opt-in is the **listener**: List checks for `onUpdate:active` on its vnode (List.vue:47). `:active="x"` alone shows no highlight — use `v-model:active` (or add `@update:active`).
- `active` and `selection` are independent, but while `selectable` is on clicks only toggle, so the active row cannot change by click.

## Sorting

`ListHeaderCellSort` is controlled: pass `direction` (`'asc'|'desc'|null`), change your own state in `@click`. It renders a real `<button>`, `aria-sort`, a tooltip "Order by <label>" (ListHeaderCellSort.vue:106), an up/down glyph shown on hover for inactive columns, and with `align="end"` right-aligns and puts the glyph before the label. Plain and sortable header cells mix freely.

## Groups

```vue
<List :columns="cols">
  <ListGroup v-for="g in groups" :key="g.status" :label="g.status" sticky>
    <ListRows :items="g.rows" v-slot="{ item, value }">
      <ListRow :value="value" :route="routeFor(item)">…</ListRow>
    </ListRows>
  </ListGroup>
</List>
```
`ListGroup` = `role="rowgroup"` + a label row aligned with row content; `sticky` pins it (`sticky top-0 z-10 bg-surface-base`, ListGroup.vue:11). Rows stay direct children so dividers work inside each group.

## Virtual rows

```vue
<List :row-height="44" :columns="cols">
  <ListRows :items="thousands" virtual v-slot="{ item, value }">…</ListRows>
</List>
```
- Needs `rowHeight` on `List`; without it `virtual` is ignored (all rows render) with a console warning (ListRows.vue:73).
- Scrolls in the **nearest scrollable ancestor** (useVirtualRows.ts:85) — the shell's ScrollArea viewport, a `SettingsBody`, or your `overflow-y-auto` pane. With no scrollable ancestor (window/page scrolling, or `DesktopShell :scroll="false"` without an `overflow-y-auto` pane) the viewport measures 0 and only the first `overscan` rows ever render (useVirtualRows.ts:52-62).
- `rowHeight` is one number at every width; responsive heights only for non-virtual lists (height classes on rows).

## Empty and loading states

None built in (no `empty`/`loading` slot or prop anywhere in `molecules/list`). Render your own with `v-if` around or beside the `List` — e.g. `Skeleton` rows while loading, a centered message when `items` is empty.

## Spacing hooks

| Hook | Utility (preset) | Default |
|---|---|---|
| `--list-gap` (column gap) | `list-gap-*` | `0.5rem` |
| `--list-row-padding-x` (row/header inset) | `list-row-px-*` | clickable rows `0.75rem`; static rows, header, group header `0` (style.css:127) |

Set them on `List` or any ancestor; responsive prefixes work (`max-sm:list-gap-3`). `--_list-*` variables are internal.

## Gotchas

1. **Pass `:value="value"` to `ListRow`.** `ListRows` computes it but does not forward it; without it the row gets no checkbox, no active state (ListRowBase.vue:85).
2. **Values are strings.** `ListRows` stringifies the key (ListRows.vue:109) and `ListRowProps.value` is `string` (types.ts:98): if you build `:value="item.id"` with numbers yourself, selection and select-all disagree. Use the slot's `value`.
3. **Default key is `name` → `id` → index** (ListRows.vue:135). Rows without either are keyed by index: selection follows positions after re-sorting. Pass `row-key`.
4. **One `ListRows` per List for select-all.** Each `ListRows` overwrites the select-all universe and clears it on unmount (ListRows.vue:103-106, List.vue:158-159): with one `ListRows` per `ListGroup`, the header checkbox only sees the last group. For grouped selectable tables, keep select-all off (no header) or render one `ListRows` over a flat array.
5. **`:active` without `v-model` does nothing** (List.vue:47).
6. **Header misaligned with clickable rows** unless the list sets `list-row-px-3` (rows get 0.75rem, header 0 by default) (style.css:127).
7. **`auto` column tracks don't align across rows** — table columns must be deterministic.
8. **No interactive content inside a link/button row**; clicks bubble into navigation. Use the stretched-link pattern (a `RouterLink` when it opens a record).
9. **`virtual` without `rowHeight` silently renders everything** (warning only) (ListRows.vue:73).
10. **Breakpoint keys must be Tailwind screens of the app** and need the frappe-ui preset; otherwise only `base` applies.
