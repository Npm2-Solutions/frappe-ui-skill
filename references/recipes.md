# frappe-ui recipes: eight full app screens, read from source and seen rendered

What is in this file: the eight "recipes" frappe-ui 1.1.0 ships on https://ui.frappe.io (Discussions, Compose, Deals,
Tickets, Mail, Files, Tasks, Accounting). Each is a complete app screen built only from frappe-ui parts, in a desktop
and a mobile layout. For each one you get the screen, its skeleton, the components and the props that matter (with
file:line), the patterns worth copying, how the mobile version changes it, and the screenshots. The last sections
collect what all eight do the same way (the frappe-ui house style) and a table of measures.

Sections
- [0. Where they live, how to view them](#0-where-they-live-how-to-view-them)
- [1. Discussions](#1-discussions) - community feed: rail + sidebar + centered feed + settings dialog
- [2. Compose](#2-compose) - full-page rich-text editor with a pinned toolbar
- [3. Deals](#3-deals) - kanban board with drag and drop, cards, hover card
- [4. Tickets](#4-tickets) - helpdesk table: columns, sort, selection, bulk actions
- [5. Mail](#5-mail) - three panes: sidebar, message list, reading pane, split header
- [6. Files](#6-files) - file browser: breadcrumbs, search + filter, grouped table, row menus, empty state
- [7. Tasks](#7-tasks) - grouped task list with filter bar, then a record page with a side meta panel
- [8. Accounting](#8-accounting) - dashboard, plain tables, selectable table, wide report
- [9. Patterns across the recipes](#9-patterns-across-the-recipes) - the house style, 14 rules with examples
- [10. Measures](#10-measures) - row heights, widths, paddings, type sizes in one table

Paths: every `File.vue:N` below is in `docs/components/recipes/` of https://github.com/frappe/frappe-ui (tag v1.1.0).
Screenshots: `assets/recipes/` in this skill (light theme, viewport shots, 1440x900 desktop,
390x844 phone), taken 10 Nov 2026 from the live site.

---

## 0. Where they live, how to view them

| What | Where |
|---|---|
| Source, one SFC per platform | `docs/components/recipes/<Name>Desktop.vue`, `<Name>Mobile.vue`; `DealCard.vue` is a child of DealsDesktop |
| Registry (title + headline components per recipe) | `index.ts:76-249`; slug list `slugs.ts:10-27` (`<base>-desktop` / `<base>-mobile`) |
| Gallery block (Desktop/Mobile switch, Preview/Code tabs, lazy iframe) | `RecipeExample.vue`; mobile iframe is 390px wide (`RecipeExample.vue:156`) |
| Home page that shows all eight | `docs/content/index.md:15-117` = https://ui.frappe.io/ |
| Chrome-less demo route, one per slug | `docs/content/recipes/demo/[slug].md` + `[slug].paths.js` = `https://ui.frappe.io/recipes/demo/<slug>` (e.g. `/recipes/demo/tickets-desktop`) |
| How the demo renders | `.vitepress/theme/Layout.vue`: `<FrappeUIProvider>` > `div.h-screen.w-full.overflow-hidden.bg-surface-base` > `<ClientOnly>` > the recipe |
| Router for recipes | in-memory vue-router installed by the docs theme (`.vitepress/theme/index.ts:13-19`) because `Breadcrumbs`, `Sidebar`, `SidebarRail` render `<router-link>` / call `useRouter()` - an app needs a real router |
| Images in `docs/content/public/recipes/` | only `compose-dashboard-light.png` / `-dark.png`: the picture embedded inside the Compose draft, not screenshots of the recipes |

Registry vs code (the code wins): Discussions lists `KeyboardShortcutsDialog` (`index.ts:87`) but no recipe imports it;
Accounting lists `AreaChart` and `Checkbox` (`index.ts:235-237`) but AccountingDesktop imports neither - `AreaChart`
is only in AccountingMobile (`AccountingMobile.vue:13`, from `frappe-ui/charts`) and the checkboxes come from
`List selectable`. Tasks also uses `Combobox`, `DatePicker`, `MultiSelect`, `Divider`, Accounting uses
`DateRangePicker`; the registry does not list them.

Imports used across the recipes: `frappe-ui` (shell, header, sidebar, inputs, Badge, Avatar...), `frappe-ui/list`
(List, ListRow, ListRows, ListCell, ListHeader, ListHeaderCell, ListHeaderCellSort, ListGroup), `frappe-ui/editor`
(Editor, EditorContent, EditorFixedMenu, RichTextKit, toolbar items), `frappe-ui/charts` (AreaChart).

Every desktop recipe starts the same way: `<div class="h-screen w-full bg-surface-base text-ink-gray-9"><DesktopShell>`
(`TicketsDesktop.vue:315-316`). Every mobile recipe starts with `<MobileShell>` (it is `fixed inset-0` itself).

---

## 1. Discussions

**Screen.** A community app (Gameplan-like): a rail of communities, a sidebar of spaces, a centered feed of
discussions with unread counts; the user menu opens a full settings dialog. Mobile: the feed under a centered header,
spaces in a bottom sheet, bottom tabs.

Screenshots: `discussions-desktop.png`, `discussions-mobile.png`, `discussions-settings-desktop.png` (SettingsDialog open).

```
Desktop                                                         Mobile
+----+-------------+--------------------------------------+     +---------------------------+
|logo| SidebarHeader| PageHeader: Title [...]   [+ Add new]|     |[panel]   Home     [pen]   |  PageHeaderMobile
|    |  Home/Search |--------------------------------------|     |---------------------------|
|av  |  Spaces  [sort]   [Unread|All]        33 discussions|     | pin Pinned                |
|av4 |  # Announce 2|   (o) Title (semibold if unread) 2h |     | (o) Title            1w   |
|av  |  # Design   3|       reply-icon Author: excerpt [3]|     |     Author: excerpt  [43] |
|    |  ...         |   (o) ...                           |     | (o) Title            2h   |
|srch|              |   max-w-[940px], centered           |     |     Author: excerpt  [3]  |
|gear|              |                                     |     |---------------------------|
|me  |              |                                     |     | Home  Notif  Search  You  |  MobileNav
+----+-------------+--------------------------------------+     +---------------------------+
SidebarRail  Sidebar 14rem          scroll region (ScrollArea)        BottomSheet "Spaces" (List v-model:active)
```

**Components and props**

| Part | How it is used | Where |
|---|---|---|
| `DesktopShell` | `#rail`, `#sidebar`, default slot = page | `DiscussionsDesktop.vue:505-745` |
| `SidebarRail` + `SidebarRailItem` | one item per community: `:label` (tooltip), `:active`, `:badge="c.unread"`, `badge-style="count"`, an `Avatar size="lg" shape="square" class="size-7"` in the default slot | `:519-535` |
| ghost rail items | `variant="ghost" icon="lucide-search"`; Settings opens the dialog | `:541-547` |
| `Dropdown` with `#trigger="{ open }"` | the account avatar at the foot of the rail is the trigger | `:551-567` |
| `Sidebar width="14rem" class="border-r"` | | `:573` |
| `SidebarHeader` | `title`, `subtitle="18 members"`, `:show-logo="false"` (the rail already shows the community), `:menu-items` (Dropdown option shape) | `:576-592` |
| `ScrollArea` in the sidebar | `class="min-h-0 flex-1" viewport-class="px-2 pt-0.5 pb-10"` - the app owns the sidebar scroll | `:596` |
| `SidebarItem` | `:active`, `@click`, `#prefix` = `<span class="lucide-x size-4">`, default = `<span class="flex-1 truncate text-sm">`, `#suffix` = unread count `text-xs text-ink-gray-5` | `:625-643` |
| `SidebarLabel` + ghost sm Button | group label row `mt-4 flex h-7 items-center justify-between` with a sort button | `:612-622` |
| `PageHeader` + `PageHeaderTitle` | title, then an ellipsis `Dropdown` of page actions beside it; one button on the right | `:650-662` |
| `TabButtons` | Unread / All filter, count text on the right | `:667-676` |
| `List` (no `columns`) | default feed template `auto minmax(0,1fr) auto`; `class="-mx-3 sm:list-gap-4"` | `:681` |
| `ListRow class="h-15" @click` | the click handler makes it a button with a hover surface | `:682-687` |
| `Avatar size="2xl"`, `Badge`, `Tooltip` | unread `Badge theme="amber" variant="solid" size="sm"` inside a Tooltip; otherwise plain `Badge` with the comment count | `:689-740` |
| `SettingsDialog` | `v-model:open`, `v-model:tab`, `size="5xl"`; `SettingsSidebar` > `SettingsNavGroup label` > `SettingsNavItem value` (+ `#prefix` icon/avatar); `SettingsContent` > `SettingsPanel value` > `SettingsHeader title [description] [#actions]` + `SettingsBody` | `:747-1122` |
| `SettingsRow title description` + control | Select / Switch / Button on the right; rows in `divide-y divide-outline-gray-1` | `:845-863`, `:874-955` |
| `Select #item-prefix="{ item }"` | colored swatch per option (theme picker) | `:879-905` |
| `List` inside settings | `:row-height="56"`, `:columns="['minmax(0,1fr)','6rem','3rem']"`, `ListHeader`, `ListRows :items v-slot="{ item: member }"` | `:1077-1118` |

Feed row, the canonical two-line row (`DiscussionsDesktop.vue:695-720`):
```vue
<ListCell>
  <div class="min-w-0 flex-1">
    <div class="truncate leading-none text-ink-gray-8">
      <span :class="discussion.unread ? 'text-base-semibold' : 'text-base'">{{ discussion.title }}</span>
    </div>
    <div class="mt-1.5 flex min-w-0 items-center text-base text-ink-gray-5">
      <span class="lucide-reply mr-1 size-4 shrink-0" aria-hidden="true" />
      <span class="shrink-0">{{ discussion.author }}:&nbsp;</span>
      <span class="truncate">{{ discussion.excerpt }}</span>
    </div>
  </div>
</ListCell>
```

**Worth copying**
- Unread = weight, not color: the title goes `text-base` -> `text-base-semibold`; the only color is the amber count badge (`:703-705`, `:734`).
- The sized text sits in an inner `<span>`: `leading-none` and `truncate` on the same element shears descenders (comment `:697-700`).
- `-mx-3` on the List lets the row hover surface bleed past the text edge so text stays aligned with the toolbar above (`:679-681`).
- Body container for a reading feed: `mx-auto mt-5 w-full max-w-[940px] px-3 pb-10 sm:px-5` (`:665`).
- Settings page grammar: panels of `section`s `space-y-11 pt-6`, section titles `text-lg-semibold text-ink-gray-8`, rows of
  `SettingsRow` (title + description left, one control right) in `divide-y divide-outline-gray-1` (`:804-864`).
- Icon-only buttons always carry `label` (it becomes the `aria-label`, text sr-only: `Button.vue:327,347`), e.g. `label="Space actions"` (`:654-658`).

**Mobile changes** (`DiscussionsMobile.vue`)
- `MobileShell` + `PageHeaderMobile title="Home"`: `#prefix` ghost `lucide-panel-left` opens the spaces sheet, `#suffix` ghost `lucide-square-pen` = new (`:97-114`).
- The sidebar becomes a `BottomSheet v-model:open title="Spaces"` holding a `List v-model:active` whose rows are `h-11 rounded-5`, icons `size-5`, text `text-lg` (`:230-258`).
- Rows: `List class="list-gap-3 list-row-px-4"`, `ListRow class="h-17"`, title `text-lg` (16px) / meta `text-md` (15px): one type step up from desktop (`:122-151`, `:169-227`).
- A "Pinned" block above the feed: label `lucide-pin size-4 text-ink-gray-4` + `text-base` (`:118-121`).
- `#nav` = `MobileNav` with 4 `MobileNavItem label icon :active`; the last is "You" with an `Avatar size="md"` in its default slot, ringed when active (`:260-291`).

---

## 2. Compose

**Screen.** A full-page document editor: breadcrumb header with Delete + Publish, a pinned formatting toolbar, a big
title field, prose. No sidebar. Mobile: back + title + Publish, a sideways-scrolling sticky toolbar.

Screenshots: `compose-desktop.png`, `compose-mobile.png`.

```
Desktop                                                     Mobile
+-----------------------------------------------------+     +---------------------------+
| Drafts / New discussion              [trash][Publish]|     |[<]  New discussion [Publish]|
|-----------------------------------------------------|     |---------------------------|
| T H2 H3 H4 | B I S | lists | align color | media ... |     | T H2 H3 H4 B I S ... ->   |  sticky, scrolls x
|-----------------------------------------------------|     |---------------------------|
|        Title (text-4xl-semibold, textarea)          |     | Title (text-3xl-semibold) |
|        prose (prose-v3), max-w-[770px]               |     | prose px-4                |
+-----------------------------------------------------+     +---------------------------+
```

**Components and props**

| Part | How it is used | Where |
|---|---|---|
| `DesktopShell` with only the default slot | no rail, no sidebar: a focused screen | `ComposeDesktop.vue:160` |
| `Editor` (from `frappe-ui/editor`) | `v-model="content"`, `:extensions="[RichTextKit.configure({ mention: { items: people } })]"`, `:upload-function` (returns `{ file_url, file_name }`), `placeholder`; its default slot gives `{ editor }` | `:49`, `:149-152`, `:161-167` |
| `PageHeader` + `Breadcrumbs :items` | `[{label:'Drafts'},{label:'New discussion'}]`; right: ghost trash `label="Delete draft"` + `variant="solid"` Publish | `:168-180` |
| `PageHeaderBase` | a second bar teleported into the same pinned header target, so the toolbar never scrolls: `class="flex h-10 items-center border-b bg-surface-base px-3 sm:px-5"` | `:182-188` |
| `EditorFixedMenu :editor :items="toolbar"` | toolbar = array of item components with `Separator` between groups | `:52-81`, `:186` |
| `EditorContent :editor` | `class="prose-v3 -mx-2 min-h-[calc(100vh-200px)] max-w-[unset] overflow-auto px-2 pb-40"` | `:203-206` |
| title field | plain `<textarea>` autosized with `useTextareaAutosize`, `text-4xl-semibold text-ink-gray-8 placeholder-ink-gray-3`, Enter/ArrowDown move focus into the editor | `:155`, `:192-202` |
| `useResolvedColorScheme()` | read-only scheme follower (the docs shell owns `data-theme`); `useColorScheme()` is for an app that owns the scheme | `:92-98` |

**Worth copying**
- Two pinned bars = `PageHeader` + `PageHeaderBase`; both teleport to the shell's header target (`PageHeaderBase.vue:3`), so nothing needs `sticky`.
- Prose column: `mx-auto w-full max-w-[770px] px-3 pt-4 sm:px-5` ("720px of prose + padding", `:190-191`).
- The page title is an input styled as a heading, not a labelled form field.

**Mobile changes** (`ComposeMobile.vue`)
- `PageHeaderMobile title="New discussion"`: `#prefix` ghost `lucide-chevron-left label="Back"`, `#suffix` solid Publish (`:166-173`).
- Toolbar: `div.sticky.top-0.z-10.border-b.bg-surface-base > div.overflow-x-auto.px-2.py-1 > EditorFixedMenu` (`:177-181`).
- Title `text-3xl-semibold` (20px instead of 24px), body `px-4 pb-40 pt-4` (`:183-198`).

---

## 3. Deals

**Screen.** A CRM pipeline board: four stage columns of deal cards, drag and drop between columns, card menu on hover,
owner hover card. Mobile: same board as horizontally snapping columns.

Screenshots: `deals-desktop.png`, `deals-mobile.png`.

```
Desktop                                                                   Mobile
+-------------+--------------------------------------------------------+  +--------------------------+
| Deals v     | Deals            [Board|List] [Filter] [Sort] [+ New deal]| |          Deals       [+] |
| Notifs    4 |--------------------------------------------------------|  |--------------------------|
| Leads       | +- . Qualification 5 [+]-+ +- . Negotiation 4 [+]-+ ...|  | [ Board | List ] [f] [s] |
| Deals  <    | | [logo] Globex     [...]| | [logo] Acme      [...]|    |  | +- . Qualif. 5 -+ +- Neg |
| ...         | | $ 45,000     (Inbound) | | ...                    |    |  | | card          | | ...  |
| Pinned views| | (o) Priya   cal Jul 18 | |                        |    |  | | card          | |      |
|  * My open  | +------------------------+ +------------------------+    |  | snap-x columns w-72       |
| [Collapse]  |  w-72 columns, each its own ScrollArea, board scrolls x |  |--------------------------|
+-------------+--------------------------------------------------------+  | Notifs Leads Deals Contacts|
                                                                          +--------------------------+
```

**Components and props**

| Part | How it is used | Where |
|---|---|---|
| `DesktopShell :scroll="false"` | content area fills the height without page scroll; the board owns x-overflow, each column owns y-overflow | `DealsDesktop.vue:440`, comment `:516-518` |
| `SidebarHeader` | `title`, `subtitle="brightloom.frappe.cloud"`, `logo` (image URL), `:menu-items` | `:443-451` |
| `SidebarItem` count | `#suffix` = `<Badge variant="ghost" :label="String(item.count)" />` | `:465-471` |
| `SidebarCollapseToggle` | sidebar footer `div.mt-auto.px-2.pb-2` | `:494-496` |
| `PageHeader` right cluster | `TabButtons` Board/List, `Button label="Filter" icon-left`, `Button label="Sort"`, then `variant="solid" label="New deal" icon-left="lucide-plus"` | `:500-514` |
| column | `flex min-h-0 w-72 shrink-0 flex-col rounded-6 bg-surface-gray-1 dark:bg-transparent dark:border` | `:524-528` |
| column header | dot `size-2 rounded-full bg-surface-<color>-7` + `text-sm font-medium text-ink-gray-8` name + `text-sm text-ink-gray-5` count + ghost `+` | `:61-66`, `:529-544` |
| `ScrollArea` per column | the card list carries `p-2` (not the column) so card shadows are not clipped | `:546-556` |
| card | `group cursor-grab rounded-6 border bg-surface-elevation-1 p-3 transition hover:shadow-sm` | `:574-579` |
| `DealCard` | `Avatar size="sm" shape="square"` logo + `text-base font-medium` name + hover `Dropdown align="end"`; value `text-base font-semibold` + `Badge variant="outline"`; owner in a `HoverCard :hover-delay="300"`; due date `lucide-calendar size-3.5` | `DealCard.vue:24-105` |
| drag ghost | `Teleport to="body"`, fixed, `rotate-2 scale-[1.02] shadow-xl`; dragged slot = `border-2 border-dashed border-outline-gray-2 bg-surface-gray-2` | `:569-573`, `:588-609` |

Hover-only action that still works on touch (`DealCard.vue:43-50`):
```vue
<Dropdown :options="cardActions" align="end">
  <Button variant="ghost" icon="lucide-ellipsis" label="Deal options"
    class="opacity-0 transition group-hover:opacity-100 [@media(hover:none)]:opacity-100" />
</Dropdown>
```

**Worth copying**
- `DesktopShell :scroll="false"` for any screen whose panes scroll on their own (board, split view) instead of `h-[calc(100vh-…)]` hacks (`DesktopShell.vue:22-31`).
- Stage color as a small dot with semantic surface tokens (`bg-surface-amber-7`), names stay gray.
- Drag starts after 4px for a mouse, after a 250ms still hold for touch; a click on a `button` inside the card is never a drag (`:211-215`, `:250-255`). The dragged item never leaves the data model; FLIP via `TransitionGroup name="deals"` + `.deals-move { transition: transform .2s }` (`:552-556`, `:618-620`).

**Mobile changes** (`DealsMobile.vue`)
- Header: title + ghost `+` only (`:82-86`). Filter/Sort move under it as icon buttons next to a `TabButtons fluid class="flex-1"` (`:89-101`).
- Board: `flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-px-4 px-4`, columns `w-72 snap-start` (`:105-111`); no drag, no hover card, no card menu.
- Card on `bg-surface-base shadow-sm`, owner avatar `xs` (`:137`, `:160-164`).

---

## 4. Tickets

**Screen.** A helpdesk list: a real table with columns (subject, SLA, status, priority, assignee, modified), sortable
headers, row checkboxes; when rows are selected the header swaps to bulk actions. Mobile: a feed of ticket cards.

Screenshots: `tickets-desktop.png`, `tickets-mobile.png`, `tickets-selected-desktop.png` (2 selected, header shows Assign / Close tickets).

```
Desktop
+-------------+---------------------------------------------------------------------------+
| Tickets v   | Tickets [2 selected]          [Open|All] [Filter] [+ New ticket]           |  <- or [Assign] [Close tickets]
| Tickets  24 |---------------------------------------------------------------------------|
| Customers   | [ ] Subject            Response/Resolution  Status  Priority  Assigned  ^Mod |  ListHeader + sort cells
| ...         | [ ] Payment gateway... reply Due 4 m        (Open)  * Urgent  (o) Leo    5 m |
| Views       |     #1017 . Wayne Ent. check Due 2 h                                       |
|  = My open  | [ ] ...                                                    row-height 60   |
| [Collapse]  |  columns: minmax(0,1fr) 11rem 6.5rem 6rem 9rem 5rem                         |
+-------------+---------------------------------------------------------------------------+
```

**Components and props**

| Part | How it is used | Where |
|---|---|---|
| `PageHeader` with two states | left: `PageHeaderTitle` + `"{n} selected"` `text-sm text-ink-gray-5`; right: bulk buttons when `selection.length`, else TabButtons + Filter + solid New ticket | `TicketsDesktop.vue:370-398` |
| `List` | `class="w-full list-row-px-3"`, `:columns="['minmax(0,1fr)','11rem','6.5rem','6rem','9rem','5rem']"`, `:row-height="60"`, `selectable`, `v-model:selection` | `:401-414` |
| `ListHeader` / `ListHeaderCell` | one cell per column | `:415-433` |
| `ListHeaderCellSort` | `:direction="directionFor('priority')"` (`'asc'`/`'desc'`/`null`), `@click="toggleSort(...)"`; `align="end"` for the right column (glyph moves to the leading side) | `:419-432` |
| sort state | app code: the header cell only draws the chrome for the direction you hand it | `:282-309` |
| `ListRows :items v-slot="{ item: ticket, value }"` + `ListRow :value="value"` | `value` is the row identity used by selection | `:434-435` |
| status | `Badge :theme="statusTheme[s]" :label="s"` (Open red, Replied blue, Resolved green, Paused gray) | `:40-45`, `:477-482` |
| priority | dot `size-2 rounded-full` `bg-surface-red-7 / amber-7 / gray-7 / gray-4` + `ml-2 text-base text-ink-gray-7` | `:46-51`, `:483-492` |
| SLA | two lines, icon `size-3.5 text-ink-gray-4` + `text-sm` colored by state: met `text-ink-green-5`, breached `text-ink-red-5`, pending `text-ink-gray-5`, none `text-ink-gray-4` | `:52-59`, `:446-476` |
| assignee | `Avatar size="sm"` + `ml-2 truncate text-base text-ink-gray-7` | `:493-502` |

Subject cell (`TicketsDesktop.vue:436-445`):
```vue
<ListCell>
  <div class="min-w-0">
    <div class="truncate text-base text-ink-gray-8">{{ ticket.subject }}</div>
    <div class="mt-1.5 truncate text-sm text-ink-gray-5">#{{ ticket.id }} · {{ ticket.customer }}</div>
  </div>
</ListCell>
```

**Worth copying**
- The one flexible track is the title (`minmax(0,1fr)`); every other column is a fixed rem width, so values line up row after row.
- `list-row-px-3` (sets `--list-row-padding-x`) instead of `px-3`: it reaches header and rows alike and composes with the checkbox column (`list/style.css:73-86`).
- Selection changes the header, not a floating bar: count next to the title, bulk verbs replace the normal actions.
- In a `selectable` List a row click toggles the selection (it does not "open"): `ListRow.vue:50-53`.

**Mobile changes** (`TicketsMobile.vue`)
- Header: title + ghost filter icon (`:209-217`); `TabButtons fluid` Open/All under it (`:220-229`).
- The six columns fold into one card row: `Avatar size="2xl"` (cell `self-start pt-0.5`), subject `text-lg`, `#id · customer` `text-md`, an SLA line `text-sm` with the same state colors, trailing time + status Badge (`:231-305`).
- Rows `class="py-3"` (content-height), `List class="list-gap-3 list-row-px-4"`.
- No checkboxes, no sort headers on mobile.

---

## 5. Mail

**Screen.** A mail client: sidebar of mailboxes and labels, a 23rem message list with category tabs, a reading pane with
the thread and a pinned reply bar; one header split in two halves that align with the panes. Mobile: list screen and
detail screen; mailboxes in a bottom sheet; the reply bar replaces the bottom tabs on the detail screen.

Screenshots: `mail-desktop.png`, `mail-mobile.png`, `mail-detail-mobile.png`.

```
Desktop
+-------------+---------------------------+-------------------------------------------------+
| Northwind v | Inbox               [pen] | [panel] Re: Trouble connecting...  [arc][snz][del][mail][...] |
| Search  ⌘K  |---------------------------|-------------------------------------------------|
| Inbox     6 | [Primary|Transac|Updates] | (o) Sarah Tran                   Aug 29, 8:03 AM |
| Starred     |---------------------------|     From sarah.tran@...                         |
| ...         | Trouble connecting... 6h  |  paragraphs (text-p-base)                        |
| Labels      |  preview, 2 lines         |  ---------------------------------------------   |
|  tag Work   | . Missing files (bold) 6h |  (o) Peter Lann ...                              |
| [Collapse]  |  w-[23rem], ScrollArea    |-------------------------------------------------|
|             |                           | [Reply] Reply all  Forward      (footer pinned) |
+-------------+---------------------------+-------------------------------------------------+
```

**Components and props**

| Part | How it is used | Where |
|---|---|---|
| `DesktopShell :scroll="false"` | panes own their scroll | `MailDesktop.vue:473` |
| sidebar Search item | `#suffix` `<Badge variant="ghost" label="⌘K" />` | `:489-497` |
| `PageHeaderBase` split header | `class="z-10 flex h-12 border-b border-outline-gray-1 bg-surface-base"`; left half `w-[23rem] border-r px-4` (title + compose), right half `flex-1 px-5` (toggle list, `PageHeaderTitle` slot, ghost icon actions, `Dropdown align="end"` More) | `:541-585` |
| list pane | `section.flex.h-full.min-h-0.w-[23rem].shrink-0.flex-col.border-r`; tabs pinned in `shrink-0 border-b px-4 py-2`; `ScrollArea viewport-class="p-1"` below | `:595-609` |
| `List v-model:active="activeId"` | `:columns="['minmax(0,1fr)','auto']"`, `:style="{ '--list-row-padding-x': '1rem' }"`; the List draws the active highlight and hides the dividers next to it; clicking a row sets it | `:610-626` |
| row | subject `text-base text-ink-gray-8` (unread: `font-semibold text-ink-gray-9` + `size-2 bg-surface-blue-7` dot inline), preview `line-clamp-2 text-p-sm text-ink-gray-5`, time `text-xs` in a `self-start pt-3` cell | `:631-658` |
| empty tab | `<p class="px-3 py-10 text-center text-p-sm text-ink-gray-4">No conversations in {{ activeTab }}.</p>` | `:662-667` |
| reading pane | `ScrollArea` > `px-6 py-5 space-y-6` > `article` per message (`border-t pt-6 first:border-0 first:pt-0`): `Avatar size="xl"`, name `text-base font-semibold`, `From email` `text-sm text-ink-gray-5`, date right; paragraphs `whitespace-pre-line text-p-base text-ink-gray-8` | `:672-711` |
| reply bar | `footer.flex.shrink-0.items-center.gap-2.border-t.px-5.py-3`: solid Reply + ghost Reply all + ghost Forward | `:715-729` |

**Worth copying**
- One header for a two-pane view: `PageHeaderBase` (padding-free) so the divider in the header lines up with the column border below (`:541-547`).
- Collapsible list pane: `v-show="showList"` on both the header half and the pane, toggle icon `lucide-panel-left-close` / `lucide-panel-left` (`:553`, `:565-570`, `:596`).
- Master-detail selection via `v-model:active`, no per-row `:class` or `@click` (`:618-621`).
- Setting `columns` flips the divider default from `inset` to `full` (`List.vue:186`, comment `:611-613`).
- Accent discipline: "the one deliberate accent in an otherwise gray recipe" is the blue unread dot (`MailMobile.vue:537-538`).

**Mobile changes** (`MailMobile.vue`)
- Two screens on one page (`screen = 'list' | 'detail'`, `:439`); a real app maps them to routes (`:436-438`).
- List header: `#prefix` ghost `lucide-panel-left` opens a `BottomSheet title="Mailboxes"`; `#suffix` compose (`:497-509`). Category tabs in a `sticky top-0 z-10 overflow-x-auto border-b px-4 py-2` bar (`:513-520`).
- No active-row highlight on mobile: a tap drills in, a lingering highlight is noise (`:523-524`).
- Detail header: `#prefix` ghost chevron whose `label` is the mailbox name, `#suffix` one ellipsis `Dropdown` carrying all mail verbs (header has room for one control, `:462-464`, `:569-583`).
- `#nav` slot does double duty: the reply `footer` on the detail screen (with `[@media(display-mode:standalone)]:pb-[env(safe-area-inset-bottom)]`), `MobileNav` elsewhere (`:680-728`).
- The mailbox sheet uses hand-rolled rows: `flex w-full items-center gap-2 rounded-6 px-3 py-2.5`, active `bg-surface-gray-3`, hover `bg-surface-gray-2`, icon `size-5 text-ink-gray-5`, text `text-lg` (`:628-648`).

---

## 6. Files

**Screen.** A drive: breadcrumbs as the title, New folder + Upload, a search box and a type filter, a table grouped by
time bucket (Today, Yesterday, This week...), a row menu per item, a storage meter in the sidebar foot, a two-case
empty state. Mobile: a flat list with "date · size" meta lines, folders drill in place, menus become action sheets.

Screenshots: `files-desktop.png`, `files-mobile.png`, `files-sheet-mobile.png` (row action sheet open).

```
Desktop
+-------------+---------------------------------------------------------------+
| Files v     | Home / Design assets                  [New folder] [Upload]   |
| Home        |---------------------------------------------------------------|
| Recents     | [search Search files] [All types v]                           |
| Favourites  | Name              Owner          Modified ^    Size           |  sticky ListHeader
| Shared      | Today                                                         |  ListGroup label
| Trash       |  folder Design assets (o) Rhea   Today        4 items  [...]  |
|             |  file   Q2 deck.pdf   (o) Rhea   Today         8.4 MB  [...]  |
| Storage 42% | Yesterday ...                                    row 40px     |
| 4.2 of 10 GB|                                                               |
+-------------+---------------------------------------------------------------+
```

**Components and props**

| Part | How it is used | Where |
|---|---|---|
| sidebar foot | `div.mt-auto.px-4.pb-4` > `Progress :value="42" size="sm" label="Storage" hint` + `text-xs text-ink-gray-5` caption | `FilesDesktop.vue:564-569` |
| `Breadcrumbs :items` as the page title | items `{ label, onClick }`, Home + one per ancestor | `:398-412`, `:574` |
| toolbar | `TextInput v-model placeholder class="w-64"` with `#prefix` search icon; `Select v-model :options` with `#item-prefix="{ item }"` icon per type | `:582-605` |
| `List` | `class="-mx-3 list-row-px-3"`, `:columns="['minmax(0,1fr)','11rem','7.5rem','5.5rem','3rem']"`, `:row-height="40"` | `:611-615` |
| `ListHeader class="sticky top-0 z-10 bg-surface-base"` | sticks inside the shell scroll | `:616` |
| `ListHeaderCellSort` x3 + empty `ListHeaderCell` | `align="end"` on Size | `:617-640` |
| `ListGroup :label` | one per non-empty time bucket; wraps rows in `role="rowgroup"`, rows stay direct children so dividers survive | `:643-651` |
| static `ListRow` + stretched button | row has no `@click`; first cell holds `<button class="absolute inset-0 sm:rounded-[10px]" :aria-label="`Open ${item.name}`">`; hover/active restored with `active:bg-surface-gray-2 sm:rounded-[10px] sm:hover:bg-surface-gray-1` | `:652-669` |
| row menu | `Dropdown :options` (folder vs file actions) around `Button class="relative" variant="ghost" icon="lucide-ellipsis"` - `relative` lifts it above the stretched button | `:702-719` |
| empty state | `flex flex-col items-center gap-1 py-16 text-center`: icon `size-6 text-ink-gray-4` (`lucide-search-x` when filtering, `lucide-folder-open` otherwise), `text-base font-medium text-ink-gray-7` title, `text-p-sm text-ink-gray-5` hint | `:725-744` |

Static row with a stretched open target (`FilesDesktop.vue:658-677`):
```vue
<ListRow v-for="item in group.items" :key="item.id"
  class="active:bg-surface-gray-2 sm:rounded-[10px] sm:hover:bg-surface-gray-1">
  <ListCell>
    <button type="button" class="absolute inset-0 sm:rounded-[10px]"
      :aria-label="`Open ${item.name}`" @click="onRowClick(item)" />
    <span :class="item.icon" class="size-4 shrink-0 text-ink-gray-5" />
    <span class="ml-3 truncate text-base text-ink-gray-8">{{ item.name }}</span>
  </ListCell>
  ...
```

**Worth copying**
- A row with `@click` renders as a `<button>` (`ListRow.vue:18-22`, `:45-47`), so it cannot contain another button (invalid HTML). When a row needs its own controls: static row + `absolute inset-0` open target + `relative` controls (`:652-657`). The recipe's target is a `<button @click>` because Files opens folders in place; a row that navigates gets a `RouterLink` there instead (modifier-click works), and `rounded-[10px]` is `rounded-5` on the scale — list.md «Rows: link, button or div».
- `-mx-3` + `list-row-px-3`: the hover surface bleeds into the gutter while header and row text align with the search box above (`:607-612`).
- Grouping is the primary order; the column sort orders within each group (`:513-530`).
- Two empty states: "nothing here yet" (with the next step) vs "nothing matches" (with how to widen the search).

**Mobile changes** (`FilesMobile.vue`)
- Header `#prefix`: back chevron labelled with the parent folder when inside a folder, else `lucide-panel-left` opening the nav sheet; `#suffix`: `+` Dropdown (New folder / Upload) (`:542-566`). Folders drill in place, the title becomes the folder name (`:377-394`).
- Search + type filter pinned: `sticky top-0 z-10 flex gap-2 border-b px-4 py-2` (`:569-586`).
- One flat list, newest first, no group headers (`:589-590`). Row `h-17`, icon in a `size-7` box (`size-5` glyph), name `text-lg leading-snug`, meta `mt-0.5 text-sm text-ink-gray-5` "Today · 8.4 MB" (`:598-636`).
- The row Dropdown becomes a `BottomSheet :title="activeItem?.name"` action sheet, one sheet reused for whichever row; tapping a file opens it too (`:409-457`, `:711-729`).
- The sidebar (sections + storage meter) becomes a `BottomSheet title="Files"` (`:679-707`).

---

## 7. Tasks

**Screen.** A project tracker (Linear-like). List screen: a filter bar (scope tabs, stackable attribute filters, group by,
sort), sections per status that collapse, dense single-line rows with a status menu, tags, due date, priority, avatars.
Detail screen: the task as a record page - title, description, comments on the left, a meta panel of label/control
pairs on the right. Mobile: a feed of tasks, and a detail page whose meta panel becomes a wrapping row of chips.

Screenshots: `tasks-desktop.png`, `tasks-mobile.png`, `tasks-detail-desktop.png`, `tasks-detail-mobile.png`.

```
List (desktop)
+-------------+--------------------------------------------------------------------------+
| Halcyon v   | Website Redesign                                         [+ Add task]    |
| Inbox     4 |--------------------------------------------------------------------------|
| My tasks    | [All|Assigned to me|Created by me] | Status v Priority v Assignee v Label v [x Clear]  9 tasks [Group: Status] [Priority] |
| Search      | In Progress 3                                              (Collapse)   |  group header button
| Projects [+]|  (o) 245 Fix layout shift...      (.Bug)(.Frontend) cal Jul 6  ill High  (o) | h-10 rows
|  Website  7 |  (o) 231 ...                                                             |
|  Mobile   7 | Todo 2 ...   Backlog 2 ...   Done 1 (collapsed)   Canceled 1 (collapsed)  |
+-------------+--------------------------------------------------------------------------+

Detail (desktop)
+-------------+----------------------------------------------+----------------------------+
|             | Website Redesign / Fix layout shift...       |                            |
|             |----------------------------------------------+----------------------------|
|             | Fix layout shift... (text-2xl-semibold)      | Status    [(o) In Progress v]|
|             | description (text-p-base)                    | Assignee  [(o) Priya v]    |
|             | ------------------------------------------   | Priority  [ill High v]     |
|             | Comments 0                                   | Due date  [cal Jul 6 v]    |
|             | (o) [ Add a comment               ]          | Project   [globe Website v]|
|             |                          [Comment]           | Labels    (.Bug)(.Frontend)|
|             | ScrollArea, p-6                              | w-[20rem] border-l, p-6    |
+-------------+----------------------------------------------+----------------------------+
```

**Components and props**

| Part | How it is used | Where |
|---|---|---|
| sidebar | Inbox count as plain `mr-1 text-xs text-ink-gray-5` suffix; "Projects" `SidebarLabel` + ghost `size="sm"` `+` with `icon="lucide-plus text-ink-gray-5"`; project items with ghost Badge open-count | `TasksDesktop.vue:838-896` |
| list header | `PageHeader` > `Breadcrumbs :items="[{ label: activeView }]"` + one solid `Add task` | `:903-908` |
| filter bar | `flex flex-wrap items-center gap-2 pt-5`: `TabButtons` scope, `Divider orientation="vertical" class="mx-1" flex-item`, four `Select variant="ghost"` with `#item-prefix`, ghost Clear (only when a filter is set), right side count + `Dropdown` Group + `Dropdown` Sort (`ml-auto`) | `:912-1007` |
| filter Select trick | first option `{ label: 'Priority', value: '' }` doubles as the reset and makes the trigger read like the field name | `:631-648` |
| group header | a `<button>` `flex w-full items-baseline rounded-1 bg-surface-sidebar px-2.5 py-2 text-base hover:bg-surface-gray-2`; name `font-medium text-ink-gray-8`, count `ml-2 text-sm text-ink-gray-5`, "Collapse/Expand" shown on hover; Done/Canceled start collapsed | `:722-733`, `:1011-1026` |
| `List` per group | `class="mt-1 list-row-px-3" :columns="taskColumns"`; columns `auto, 2.5rem, minmax(0,1fr), 14rem, 6.5rem, 5.5rem, 3.5rem` - only the title flexes | `:786-798`, `:1031-1035` |
| row | static `ListRow class="h-10 active:bg-surface-gray-2 sm:rounded-[10px] sm:hover:bg-surface-gray-1"` + stretched open button | `:1043-1054` |
| status menu in the row | `span.relative` > `Tooltip text="Change status"` > `Dropdown :options` (items `{label, icon, onClick}`) > round icon button | `:800-806`, `:1055-1069` |
| cells | id `text-sm tabular-nums text-ink-gray-4`; title `truncate text-base-medium text-ink-gray-8`; tags `Badge variant="outline" theme="gray"` with a `#prefix` dot `size-1.5 rounded-full bg-surface-<c>-6`, budget of 2 then `+N`; due `lucide-calendar size-3.5` + `text-sm text-ink-gray-5`; priority signal icon colored (`text-ink-red-6/amber-6/gray-5`); avatars `relative flex -space-x-1` in a Tooltip | `:1071-1156` |
| detail header | `Breadcrumbs` with the parent crumb `onClick` going back | `:1166-1173` |
| detail main | `ScrollArea` > `p-6`: `h1 text-2xl-semibold text-ink-gray-8`, `p mt-3 text-p-base text-ink-gray-7`, comments block `mt-10 border-t pt-6`, `h2 text-base-semibold` with a gray count; comment = `Avatar size="lg"` + name `text-base-medium` + time `text-sm text-ink-gray-5` + `text-p-base`; new comment `Textarea` + solid Comment `:disabled="!newComment.trim()"` | `:1175-1243` |
| meta panel | `hidden w-[20rem] shrink-0 border-l sm:block` > `grid grid-cols-[5rem_minmax(0,1fr)] items-center gap-y-6 p-6 text-base text-ink-gray-6`: label div + control | `:1245-1249` |
| meta controls | `Select v-model :options` + `#item-prefix` icon; `MultiSelect v-model :options placeholder` + `#item-prefix` avatar; `DatePicker v-model placeholder format="MMM D"` + `#prefix` calendar (v-model speaks `YYYY-MM-DD`, `:767-769`); `Combobox v-model trigger="button" :options` (options carry `icon`, shown in rows and trigger, `:760-765`); labels as Badges | `:1251-1332` |

Meta panel, label/control pairs (`TasksDesktop.vue:1246-1262`):
```vue
<div class="hidden w-[20rem] shrink-0 border-l sm:block">
  <div class="grid grid-cols-[5rem_minmax(0,1fr)] items-center gap-y-6 p-6 text-base text-ink-gray-6">
    <div>Status</div>
    <Select v-model="selectedTask.status" :options="statusSelectOptions">
      <template #item-prefix="{ item }">
        <span :class="statusIcon[item.value]" class="size-4 text-ink-gray-6" aria-hidden="true" />
      </template>
    </Select>
    ...
```

**Worth copying**
- Record page = wide main column (content, then activity/comments) + fixed 20rem right meta panel of editable fields; the header holds only the breadcrumb (`:1165-1336`).
- Fields in the panel are edited in place (Select, MultiSelect, DatePicker, Combobox) - no Edit/Save mode.
- Dense list: `h-10` rows, one line, fixed-width trailing tracks so ids and tags land at the same x on every row (`:786-789`).
- Color only where it encodes: status by icon shape (`lucide-circle-dashed/circle/circle-dot/circle-check/circle-x`, `:29-35`), priority by signal bars + warm color, labels as gray outline badges with one colored dot ("the palette can stay small", `:52-75`).
- "A real app would use two routes and pass the task id as a param" (`:747-748`).

**Mobile changes** (`TasksMobile.vue`)
- List: `TabButtons fluid` Open/All (`:319-328`); rows `py-2.5`, status icon `size-4.5`, title `text-lg leading-snug` (gray-5 when Done), meta row `text-md` with priority, first label Badge, due; trailing `Avatar size="sm"` (`:330-404`).
- Detail: `PageHeaderMobile :title="`#${id}`"` + back chevron (`:411-420`); `h1 text-xl-semibold` (`:423`).
- The meta panel becomes chips: `mt-6 flex flex-wrap items-center gap-2` of default `Button`s with icon/avatar prefixes, the status one inside a `Dropdown`; labels `Badge size="lg"` ("Gameplan's mobile task detail lays the same controls out as a wrapping row instead of a side panel", `:430-490`).

---

## 8. Accounting

**Screen.** A small-business ledger with grouped navigation and four real pages: Cashflow (dashboard), Expenses (plain
table), Payroll (selectable table with a Select/Done mode), Profit & Loss (wide report with a date range, monthly or
quarterly columns, sticky header, scrolling both ways). The other nav items fall through to an empty state. Mobile:
bottom tabs for the four pages, a chart on top of the cashflow page, KPI cards, feed rows.

Screenshots: `accounting-desktop.png` (Cashflow), `accounting-payroll-desktop.png`, `accounting-reports-desktop.png`, `accounting-mobile.png`.

```
Cashflow (desktop)
+---------------+-------------------------------------------------------------------+
| Everdusk v    | Cashflow                      [Incomings|Outgoings] [+ Add transaction] |
| Overview      |-------------------------------------------------------------------|
|  ~ Cashflow . |      Todays balance | Incoming 30d | Outgoing 30d | Projected     |  KPI strip, divide-x
| Sales         |      $14,081.09     | $2,011.44    | $12,011.44   | -$1,518.00 (red)|
|  Invoices     |      ^ 4.2% vs last month (gray)                                  |
| Purchases     |      Recent transactions                          [View all]      |
|  Expenses .   |      August 20   Lunch                            -$104.99        |  List row 44
| Accounting    |      -------------------------------------------------------      |
|  Payroll .    |      Cash accounts    $57,499.46 | Spend this month               |  grid-cols-2 gap-8
| Reports       |      Business checking  $18,240  | Salaries $20,100 [=====   ]   |
|  P&L .        |      max-w-4xl, centered                                          |
+---------------+-------------------------------------------------------------------+
```

**Components and props**

| Part | How it is used | Where |
|---|---|---|
| grouped sidebar | `Sidebar width="15rem"`; per group `div.mb-3` > `div.flex.h-7.items-center > SidebarLabel` + items; a gray `size-1.5` dot suffix marks items with a real page ("Gray per Gameplan's no-color rule") | `AccountingDesktop.vue:368-411` |
| header actions per page | one `PageHeader`, the right cluster switches with the page: TabButtons + solid Add transaction / solid Add transaction / "n selected" + Select-Done toggle + solid Add employee / ghost Compare + solid Export | `:415-472` |
| KPI strip | `grid grid-cols-4 divide-x divide-outline-gray-2`, cell `px-4 first:pl-0 last:pr-0`: label `text-xs text-ink-gray-5`, value `mt-1 text-2xl font-semibold` (red `text-ink-red-5` when negative), delta `text-xs text-ink-gray-5` with arrow `size-3` - kept gray because "up isn't universally good" | `:97-105`, `:480-506` |
| section header | `div.flex.h-7.items-center.justify-between` > `h3.text-sm.font-semibold.text-ink-gray-8` + ghost `View all` | `:509-515` |
| list flush with the page | `List class="list-row-px-0" :columns="['8rem','minmax(0,1fr)','8rem']" :row-height="44"` (drops the interactive row inset so text shares the KPI edge) | `:516-523` |
| two-up widgets | `grid grid-cols-2 gap-8`; accounts as `divide-y divide-outline-gray-1` rows; spend bars `h-1.5 rounded-full bg-surface-gray-2` > `bg-surface-gray-6` fill | `:557-626` |
| Expenses table | `List class="w-full list-row-px-3" :columns="['10rem','minmax(0,1fr)','9rem']" :row-height="40"`; amount header `ListHeaderCell class="justify-end"` | `:631-660` |
| Payroll table | `:selectable="selectMode"` + `v-model:selection`; header cells carry a muted unit: `Total pay <span class="text-ink-gray-5">(per annum)</span>` | `:663-716` |
| P&L page | `absolute inset-0 flex flex-col p-4` fills the shell scroll region so the filter bar and column header stay put; `ScrollArea orientation="both"`; `List :columns` computed (`minmax(9rem,1.4fr)` + one `minmax(4.5rem,1fr)` per bucket); `ListHeader class="sticky top-0 z-10 bg-surface-base"`; section rows `text-sm font-semibold text-ink-gray-7` | `:357-361`, `:719-816` |
| `DateRangePicker` | `v-model` `[start,end]` `YYYY-MM-DD`, `dual-pane`, `format="MMM YYYY"`, `:min`, `:max`, `#prefix` icon, `#actions="{ setRange, close }"` preset buttons | `:731-760` |
| empty state (stub pages) | `flex min-h-[60vh] flex-col items-center justify-center text-center`: icon in `size-11 rounded-full bg-surface-gray-2`, `text-base font-medium` "No x yet", `max-w-xs text-p-sm text-ink-gray-5` line, `Button variant="subtle"` "New x" | `:819-845` |

**Watch out (seen on the live page):** the Payroll recipe preselects `selection = ref(['2'])` (`:174`) but its rows come
from `ListRows`, whose row value is `String(item.name ?? item.id ?? index)` (`ListRows.vue:124-136`, `:108-110`). The
payroll items have a `name` field ("Derek Forbes"), so the values are names, `'2'` matches no row: the header says
"1 selected" and no box is checked (`accounting-payroll-desktop.png`). Give `ListRows` a `row-key="id"` (or pass
`:value` yourself) when a display field is called `name`. In Frappe documents `name` is the id, so there the default is right.

**Worth copying**
- A dashboard is one centered column `mx-auto max-w-4xl space-y-6` read top to bottom, KPIs as a divided strip (no cards), sections with `h-7` headers (`:475-479`).
- Money: negative in `text-ink-red-5`, incoming in `text-ink-green-5`, deltas neutral.
- Wide reports: bound the page height (`absolute inset-0`) and let one `ScrollArea orientation="both"` scroll rows under a sticky header.
- Selection as an explicit mode for tables where a click should normally open (header button Select / Done).

**Mobile changes** (`AccountingMobile.vue`)
- `MobileNav` built from the four pages (`:343-353`); header `#prefix` is a brand square `size-8 rounded-4 bg-surface-gray-7 text-ink-white`, `#suffix` one ghost action that changes per page (`:150-174`).
- Cashflow gains an `AreaChart` in a card `h-52 overflow-hidden rounded-6 border bg-surface-base p-3` (`:178-189`):
  `:data`, `x="week"`, `y="balance"`, `title`, `subtitle`, `:x-axis="{ type: 'time', timeGrain: 'week' }"`, `:y-axis="{ format }"`, `:series-config="{ balance: { label: 'Balance' } }"`.
- KPI strip -> `grid grid-cols-2 gap-3` of `rounded-6 border p-3` cards (`:191-205`); TabButtons `fluid` (`:207-214`).
- Tables -> two-column feed rows `:columns="['minmax(0,1fr)','auto']"`, `h-14`/`h-16`, description `text-lg`, date `text-md`, amount `text-lg font-medium tabular-nums` (`:216-305`). Payroll keeps `selectable` with `ListRow :value="String(item.id)"` (`:281`).
- P&L -> `ScrollArea orientation="horizontal"` card with a `List class="w-max"` and a totals row `border-t font-semibold` (`:309-340`).

---

## 9. Patterns across the recipes

What all eight do the same way. Each rule with one or two examples.

1. **App frame = shell + sidebar + teleported header.** `DesktopShell` (`#rail`, `#sidebar`, page) on desktop,
   `MobileShell` (`#nav`) on phones. The page declares `PageHeader` / `PageHeaderMobile` / `PageHeaderBase` anywhere
   and it teleports into the shell's pinned header target (`PageHeaderBase.vue:2-7`). Use `:scroll="false"` when the
   page's panes scroll themselves (Deals `:440`, Mail `:473`); otherwise the shell's ScrollArea scrolls the page.

2. **Sidebar anatomy is fixed.** `Sidebar width="14rem" class="border-r"` > `SidebarHeader` (title, subtitle,
   logo, `menu-items` = workspace menu) > `ScrollArea class="min-h-0 flex-1" viewport-class="px-2 pt-0.5 pb-10"` >
   `div.space-y-0.5` of `SidebarItem` (icon `size-4` in `#prefix`, `text-sm` label, count in `#suffix`) > groups
   `div.mt-4.flex.h-7.items-center` + `SidebarLabel` (+ optional ghost sm `+`) > footer `div.mt-auto` (collapse toggle,
   storage meter). Tickets `:318-367`, Tasks `:824-898`, Files `:537-570`.

3. **Page header: title left, actions right, one solid primary, last.** Left: `PageHeaderTitle` or `Breadcrumbs`
   (nested pages: Files `:574`, Tasks `:904`, Compose `:169`), optionally a ghost ellipsis menu beside the title
   (Discussions `:653`). Right, in order: view switch `TabButtons` -> secondary default Buttons (Filter, Sort) -> the
   single `variant="solid"` action with `icon-left="lucide-plus"` (Deals `:503-512`, Tickets `:383-395`). Discussions'
   "Add new" is the one header action left `subtle` (`:661`). Mobile keeps one ghost icon action in `#suffix`
   (Deals mobile `:84`), except Compose whose solid Publish stays (`ComposeMobile.vue:171`).

4. **Header reflects state.** Selection count and bulk verbs replace the normal actions (Tickets `:371-381`); the
   header actions change per page (Accounting `:417-471`); a Select/Done toggle enters selection mode (Accounting `:447-451`).

5. **Lists are `frappe-ui/list`, composed per row.** No data-table component: `List` + `ListRow` + `ListCell` with your
   own markup. Default (no `columns`) = feed `auto minmax(0,1fr) auto` (leading media / content / trailing meta,
   `list/style.css:56`), inset dividers. Tables pass `:columns` with exactly one `minmax(0,1fr)` track and fixed rem
   widths for the rest, and `:row-height` (Tickets `:403-411`, Tasks `:790-798`).

6. **Row composition.** Title `text-base text-ink-gray-8 truncate`; meta line `mt-1.5 text-sm text-ink-gray-5`
   joined with ` · `; trailing time `text-sm`/`text-xs text-ink-gray-5` right-aligned; status as `Badge`; people as
   `Avatar size="sm"` + name `text-base text-ink-gray-7`. Inner span for sized text under `truncate`
   (Discussions `:697-708`). Bold only for unread (Discussions `:704`, Mail `:637`).

7. **Clickable rows: `@click`/`route` row, or a static row with a stretched button.** A row with a handler is a
   `<button>` (`ListRow.vue:20`); if the row also needs its own controls, keep it static, put
   `<button class="absolute inset-0">` in the first cell and `relative` on the controls, and restore hover with
   `sm:hover:bg-surface-gray-1 active:bg-surface-gray-2 sm:rounded-[10px]` (Files `:652-669`, Tasks `:1036-1054`). In an app: a `RouterLink`
   target when the row opens a record, `rounded-5` for the 10px, the ring kept (list.md).
   Master-detail = `List v-model:active` (Mail `:622`); multi-select = `selectable v-model:selection` (Tickets `:412-413`).

8. **Inset and alignment through the list hooks, not padding.** `list-row-px-3` / `list-row-px-4` / `list-row-px-0`
   and `list-gap-3` / `sm:list-gap-4` set `--list-row-padding-x` / `--list-gap` (tailwind `plugin.js:220-224`).
   Pair `-mx-3` with `list-row-px-3` so hover surfaces bleed into the gutter while text aligns with the toolbar
   (Files `:607-612`, Discussions `:679-681`).

9. **Filters sit in a bar above the list, never in the header on desktop when there are many.** `TabButtons` for the
   scope (All / Assigned to me), `Select variant="ghost"` per attribute with a first "reset" option named like the
   field, `Divider orientation="vertical" flex-item` between kinds, a Clear button only when something is set, count +
   group + sort on the right (Tasks `:912-1007`). Few filters: TabButtons in the header (Tickets `:383-389`). Search:
   `TextInput` with a `#prefix` search icon (Files `:583-595`).

10. **Gray first, color only where it encodes.** Text in `ink-gray-9/8` (primary), `-7` (secondary values),
    `-6` (labels), `-5` (meta), `-4` (faint ids, icons, empty hints). Color goes to: status Badges with a theme
    (Tickets `:40-45`), small dots `bg-surface-<color>-7` for stage/priority (Deals `:61-66`, Tickets `:46-51`),
    pass/fail text `text-ink-green-5`/`text-ink-red-5` (Tickets `:54-59`), negative money red (Accounting `:491`).
    Labels are gray outline Badges with one colored dot (Tasks `:65-75`); KPI deltas stay gray (Accounting `:97-99`);
    the sidebar marker dot is gray "per Gameplan's no-color rule" (Accounting `:400-407`).

11. **Only semantic tokens.** Surfaces `bg-surface-base`, `bg-surface-gray-1/2/3`, `bg-surface-elevation-1` (cards),
    `bg-surface-sidebar` (group header); borders `border` (default outline), `border-outline-gray-1/2`,
    `divide-outline-gray-1/2`; text `text-ink-*`; radii `rounded-4/5/6`; type `text-<size>[-medium|-semibold]` and the
    paragraph family `text-p-<size>` for running text. Dark mode comes free; the only explicit `dark:` is the board
    column `dark:bg-transparent dark:border` (Deals `:527`). Sizes like `h-15`, `h-17`, `size-4.5` exist because the
    preset fills the spacing scale (`tailwind/tokens.js:212-230`); without the preset they compile to nothing.

12. **Side panels and pinned bars.** A record's fields live in a right panel `w-[20rem] border-l` with a
    `grid-cols-[5rem_minmax(0,1fr)] gap-y-6 p-6` of label/control pairs (Tasks `:1246-1249`); a list pane is
    `w-[23rem] border-r` (Mail `:597`); bars inside a pane are `shrink-0 border-b px-4 py-2` (Mail `:601`) and footers
    `shrink-0 border-t px-5 py-3` (Mail `:716`). A second pinned page bar is a `PageHeaderBase` (Compose `:182-188`).

13. **Empty states say what and what next.** Icon `size-6 text-ink-gray-4` (or in a `size-11 rounded-full
    bg-surface-gray-2` disc), one `text-base font-medium` line, one `text-p-sm text-ink-gray-5` line, optionally a
    `subtle` button; distinguish "empty" from "no match" (Files `:725-744`, Accounting `:819-845`, Mail `:662-667`).

14. **Mobile is the same screen re-laid, not a different app.**
    - `PageHeaderMobile` centered `text-xl-semibold` title, `#prefix` = back chevron (labelled with where it goes) or
      `lucide-panel-left` (opens the former sidebar as a `BottomSheet`), `#suffix` = one ghost action or an ellipsis
      `Dropdown` (Mail mobile `:497-583`, Files mobile `:542-566`).
    - `MobileNav` with 4 `MobileNavItem`s, the last "You" with an avatar (Discussions mobile `:260-291`).
    - Table columns fold into feed rows; text one step up (`base`->`lg`, `sm`->`md`); `list-gap-3 list-row-px-4`;
      rows `h-14`...`h-17` or `py-3` (Tickets mobile `:231-305`).
    - `TabButtons fluid`; filters/search/tabs in a `sticky top-0 z-10 border-b bg-surface-base px-4 py-2` bar
      (Files mobile `:569`, Mail mobile `:513`).
    - Row Dropdowns -> `BottomSheet` action sheets (Files mobile `:711-729`); side panel -> wrapping chips of Buttons
      (Tasks mobile `:432-490`); split panes -> two screens with a back button (Mail mobile `:496`, `:568`); boards ->
      snap-scrolling columns (Deals mobile `:105-111`); wide tables -> horizontal `ScrollArea` + `List class="w-max"`
      (Accounting mobile `:309-314`); group headers dropped (Files mobile `:589`); hover-only controls get
      `[@media(hover:none)]:opacity-100` (DealCard `:48`).
    - The `#nav` slot can hold a context action bar instead of the tabs (Mail mobile `:680-692`).

---

## 10. Measures

| Thing | Desktop | Mobile | Example |
|---|---|---|---|
| Page header height | `min-h-12` (48px), `px-3 sm:px-5`, `border-b` (`PageHeader.vue:3`) | `h-[52px]`, `px-3` (`PageHeaderMobile.vue:3`) | all |
| Sidebar width | `14rem` (Accounting `15rem`) | - | Tickets `:318`, Accounting `:368` |
| Sidebar item / label row | items `space-y-0.5`, label rows `h-7`, groups `mt-4` | sheet rows `px-3 py-2.5`, `text-lg`, icon `size-5` | Deals `:454-478`, Mail mobile `:628-648` |
| Feed row | `h-15` (60px), avatar `2xl` | `h-17` (68px), avatar `2xl` | Discussions `:685` / mobile `:126` |
| Table row | `:row-height="60"` (two-line), `40` (one-line), `44` | `h-14`, `h-16`, `h-17`, `py-3` | Tickets `:411`, Files `:614`, Accounting `:522` |
| Task row | `h-10` | `py-2.5` | Tasks `:1046` / mobile `:334` |
| Settings list row | `:row-height="56"` | - | Discussions `:1012` |
| Content padding | `px-3 sm:px-5` (Tasks `sm:px-6`), top `pt-3`...`pt-5` | `px-4` | Tickets `:400`, Tasks `:910` |
| Reading width | feed `max-w-[940px]`, prose `max-w-[770px]`, dashboard `max-w-4xl` | full width | Discussions `:665`, Compose `:191`, Accounting `:479` |
| Panels | list pane `w-[23rem]`, meta panel `w-[20rem]`, board column `w-72` | - | Mail `:597`, Tasks `:1246`, Deals `:527` |
| Gaps | header clusters `gap-2`, board `gap-3 p-4`, cards `gap-2 p-2`, card body `p-3` | `gap-3`, `px-4 py-3` | Deals `:523-555` |
| Type (px) | `xs` 12, `sm` 13, `base` 14, `md` 15, `lg` 16, `xl` 17, `2xl` 18, `3xl` 20, `4xl` 24 (`tailwind/tokens/typography.js`) | | |
| Title / meta | `text-base` / `text-sm` | `text-lg` / `text-md` | Tickets `:438-441` / mobile `:253-255` |
| Headings | page title `text-lg font-semibold` (`PageHeaderTitle.vue:2`), record `text-2xl-semibold`, section `text-lg-semibold` or `text-sm font-semibold` (dashboard), doc title `text-4xl-semibold` | header `text-xl-semibold`, record `text-xl-semibold`, doc `text-3xl-semibold` | Tasks `:1178`, Discussions `:844`, Accounting `:511` |
| Icons | `size-4` (nav, cells), `size-3.5` (inline meta), `size-2` dots, `size-1.5` label dots | `size-5` (sheets, file glyphs), `size-4.5` (status) | Tickets `:450`, Files mobile `:610` |
| Radius | cards/columns `rounded-6`, row hover `rounded-[10px]` (= `rounded-5`), sheet rows `rounded-6`, group header `rounded-1` | | Deals `:576`, Files `:661` |
