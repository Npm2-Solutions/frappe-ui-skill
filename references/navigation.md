# Navigation and app shell — tabs, tree, sidebar, rail, shells, headers, shortcuts (frappe-ui 1.1.0)

How a screen is framed and moved through, read from `src/` of frappe-ui 1.1.0. `file:line` is relative to `src/components/` unless it starts with `utils/`, `composables/` or `index.ts`.

Sections: [App frame at a glance](#app-frame-at-a-glance) · [FrappeUIProvider](#frappeuiprovider) · [DesktopShell](#desktopshell) · [MobileShell](#mobileshell) · [MobileNav / MobileNavItem](#mobilenav--mobilenavitem) · [Sidebar family](#sidebar-family) · [SidebarRail / SidebarRailItem](#sidebarrail--sidebarrailitem) · [PageHeader family](#pageheader-family) · [Breadcrumbs](#breadcrumbs) · [Tabs (Tabs, TabList, TabTrigger, TabPanel)](#tabs-tabs-tablist-tabtrigger-tabpanel) · [TabButtons](#tabbuttons) · [Tree](#tree) · [ScrollArea](#scrollarea) · [useShellScrolled / shellScrollContainer](#useshellscrolled--shellscrollcontainer) · [usePageMeta](#usepagemeta) · [useKeyboardShortcut](#usekeyboardshortcut)

---

## App frame at a glance

```vue
<!-- App.vue -->
<FrappeUIProvider>
  <div class="h-screen">
    <DesktopShell>
      <template #rail>
        <SidebarRail>
          <SidebarRailItem label="Jobs" icon="lucide-briefcase" :route="{ name: 'Jobs' }" />
        </SidebarRail>
      </template>
      <template #sidebar>
        <Sidebar>
          <SidebarHeader title="Acme" />
          <div class="flex-1 overflow-y-auto px-2">
            <SidebarItem label="Open jobs" icon="lucide-inbox" :route="{ name: 'Jobs' }" />
          </div>
          <SidebarCollapseToggle />
        </Sidebar>
      </template>
      <router-view />
    </DesktopShell>
  </div>
</FrappeUIProvider>

<!-- a routed page -->
<PageHeader>
  <PageHeaderTitle title="Jobs" />
  <Button variant="solid" label="New job" />
</PageHeader>
<div class="p-5">…</div>
```

The page's `PageHeader` teleports into the shell's header slot above the scroll area; the page body scrolls in the shell's `ScrollArea`.

---

## FrappeUIProvider

**For** the app root: mounts `<ToastProvider />` before the slot and `<Dialogs />` after it (FrappeUIProvider.vue:17-19), no wrapper element. Needed only for `toast.*` / `dialog.*`.
**Import** `import { FrappeUIProvider } from 'frappe-ui'` · no props · slot `#default`.
**Gotchas** It does not provide a `TooltipProvider` or a portal target. Don't also mount `ToastProvider` (double toasts) or `Dialogs` (dev warning).

---

## DesktopShell

**For** the desktop app frame: rail + sidebar + header target + scrolling content. Mobile → MobileShell.
**Import** `import { DesktopShell } from 'frappe-ui'`

| Prop | Type | Default |
|---|---|---|
| `scroll` | `boolean` — content scrolls as one page (ScrollArea) | `true` |

Slots: `#rail`, `#sidebar`, `#default` (routed content).

**Gotchas**
- Root is `flex h-full` (DesktopShell/DesktopShell.vue:2): its parent must have a height (`h-screen`), or nothing scrolls.
- `scroll=true` wraps content in `ScrollArea` (DesktopShell.vue:18); reka puts the slot in an auto-height div, so `h-full` on a page root does not fill, and horizontal overflow is clipped (vertical ScrollArea sets `overflow-x: hidden`). For list+detail splits, boards or full-height panes use `:scroll="false"` and let panes own `overflow-y-auto`.
- `scroll=false` → no shell scroll element: `useShellScrolled()` stays false, `shellScrollContainer` null, `ListRows virtual` needs its own scroller.
- Renders the `PageHeaderTarget` and provides it + the scroll element to its subtree.

## MobileShell

**For** the mobile frame: `fixed inset-0` column, header target, native momentum scroll, bottom nav (MobileShell/MobileShell.vue:4).
**Import** `import { MobileShell } from 'frappe-ui'` · no props · slots `#default`, `#nav` (MobileShell.vue:26).
**Gotchas** Adds safe-area top padding in standalone PWA. Swap shells with `v-if` on a breakpoint; the header-target and scroll registries hand over cleanly.

## MobileNav / MobileNavItem

**Import** `import { MobileNav, MobileNavItem } from 'frappe-ui'`

| `MobileNavItem` prop | Type | Default |
|---|---|---|
| `label` (req) | `string` — text under icon + aria-label | — |
| `icon` | `lucide-*` \| Component | — |
| `route` | `string \| RouteLocationObject` | — |
| `href` | `string` | — |
| `active` | `boolean` — section highlight independent of route | current-route match |

Emits `click`. Slot `#default {active}` replaces the icon. `MobileNav` = equal-width grid, no props.
**Gotchas** Tapping the item of the current route renders a `<button>` and scrolls the shell to top instead of navigating (MobileNav/MobileNavItem.vue:12, 115). Current = same route **name** (or path when unnamed): child routes are not current.

---

## Sidebar family

**For** the wide nav column. Composed, not config-driven: `Sidebar` gives width + collapse; you lay out header, scroll region and footer.

**Import** `import { Sidebar, SidebarHeader, SidebarItem, SidebarLabel, SidebarSection, SidebarCard, SidebarCollapseToggle, sidebarCollapsedKey, sidebarToggleKey } from 'frappe-ui'`

| Part | Props / models | Slots / events |
|---|---|---|
| `Sidebar` | `v-model:collapsed` (`boolean\|null`, default `null` = auto), `collapsible=true`, `width='15rem'`, `collapsedWidth='3rem'`, `ariaLabel='Main'` | `#default`; `update:collapsed` |
| `SidebarHeader` | `title` (req), `subtitle?`, `logo?` (img URL \| Component), `showLogo=true`, `menuItems?` (Dropdown `MenuOptions`) | `#prefix` (logo box, size-7) |
| `SidebarItem` | `label?`, `icon?` (lucide / emoji / Component), `suffix?` (text), `route?`, `href?`, `active?`, `accessKey?`, `onClick?` | `#prefix`, `#default` (label), `#suffix` (sibling of the link — safe for a Dropdown) |
| `SidebarLabel` | `divider?` (shows a line when collapsed) | `#default` |
| `SidebarSection` | `label?`, `collapsible?`, `v-model:collapsed` (default `false`) | `#default` (`role="group"`) |
| `SidebarCard` | `title?`, `description?`, `theme='gray'` (`StatusTheme`), `icon?` (`false` hides), `action?` (`ButtonProps & onClick({dismiss})`), `dismissible=false` | `#prefix`, `#title`, `#description`, `#actions {dismiss}`; emits `dismiss` |
| `SidebarCollapseToggle` | — (must be inside `Sidebar`) | — |

```vue
<Sidebar v-model:collapsed="collapsed">
  <SidebarHeader title="Acme" subtitle="acme.example" :menu-items="workspaceMenu" />
  <div class="flex-1 overflow-y-auto px-2">
    <SidebarItem label="Inbox" icon="lucide-inbox" route="/inbox">
      <template #suffix><span class="mr-2 text-sm text-ink-gray-4">{{ unread }}</span></template>
    </SidebarItem>
    <SidebarSection label="Projects" collapsible>
      <SidebarItem v-for="p in projects" :key="p.name" :label="p.title" :route="`/p/${p.name}`" />
    </SidebarSection>
  </div>
  <SidebarCollapseToggle />
</Sidebar>
```

**Gotchas**
- Unbound `collapsed` (`null`) auto-collapses below Tailwind `sm`; `collapsible=false` never collapses even if bound true (Sidebar/Sidebar.vue:52).
- `Sidebar` does not scroll: wrap the item list in `flex-1 overflow-y-auto` yourself.
- `SidebarItem` active state, when `active` is unset, is **exact** route-name equality (or path when the target has no name) (Sidebar/SidebarItem.vue:246): `/jobs/123` does not light "Jobs". Pass `:active="route.path.startsWith('/jobs')"` for section highlighting.
- Attr split: `class`, `style`, `on*` listeners stay on the row wrapper; everything else (`target`, `id`, `data-*`, `aria-*`) goes to the inner link/button (SidebarItem.vue:161).
- Without a router, `route` renders a plain `<a>` with `href` only when `route` is a string (SidebarItem.vue:223-229).
- `icon` strings other than `lucide-*`/emoji render nothing (dev warning) — initials go in `#prefix`.
- Collapsed items get a right-side tooltip from `label` or the slot's text.
- `SidebarCard` never hides itself; handle `@dismiss`.

## SidebarRail / SidebarRailItem

**For** the narrow 50px icon column left of the sidebar (spaces, search, notifications) (SidebarRail/SidebarRail.vue:4).
**Import** `import { SidebarRail, SidebarRailItem } from 'frappe-ui'`

| `SidebarRailItem` prop | Type | Default |
|---|---|---|
| `label` (req) | tooltip text + accessible name | — |
| `description` | 2nd tooltip line | — |
| `icon` | `lucide-*` \| Component (ignored with `#default`) | — |
| `route` / `href` | link target | — |
| `active` | `boolean` | route-name match |
| `badge` | unread count (0 = none) | `0` |
| `badgeStyle` | `'count'\|'dot'` (count caps at 99+) | `'count'` |
| `variant` | `'subtle'` (filled cell, left bar when active — avatars/workspaces) \| `'ghost'` (transparent — icon shortcuts) | `'subtle'` |

Emits `click`. Slot `#default` (image, avatar, initials). `SidebarRail`: no props, slot `#default`, plain flex (no scroll).
**Gotchas** Default variant is `subtle` (SidebarRailItem.vue:88) — icon shortcuts look like tiles unless `variant="ghost"`. Rail wraps items in `TooltipProvider :hover-delay="0"` (SidebarRail.vue:8). Attrs go to the clickable cell (SidebarRailItem.vue:85). Badge count is teleported to body. aria-label folds the count in ("Inbox, 3 unread").

---

## PageHeader family

**For** the header strip of a page in a shell. It teleports into the shell's `PageHeaderTarget` from wherever the page declares it.

**Import** `import { PageHeader, PageHeaderTitle, PageHeaderBase, PageHeaderTarget, PageHeaderMobile, PageHeaderMobileTitle, PageHeaderBackButton } from 'frappe-ui'`

| Part | Props | Slots |
|---|---|---|
| `PageHeader` | — (no `title`) | `#default`: one row, `justify-between`, min-h 48px |
| `PageHeaderTitle` | `title?` | `#default` |
| `PageHeaderMobile` | `title?` (centered, h1, 52px fixed) | `#prefix`, `#default`, `#suffix` |
| `PageHeaderMobileTitle` | `title?` | `#prefix`, `#default` |
| `PageHeaderBackButton` | `fallbackRoute?`, `label='Back'` | — |
| `PageHeaderBase` | — (unstyled `<header>`, attrs pass to it) | `#default` |
| `PageHeaderTarget` | — (the shells render it) | — |

```vue
<PageHeaderMobile>
  <template #prefix><PageHeaderBackButton :fallback-route="{ name: 'Jobs' }" /></template>
  <PageHeaderMobileTitle :title="job.title" />
  <template #suffix><Button variant="ghost" icon="lucide-more-horizontal" label="More" /></template>
</PageHeaderMobile>
```

**Gotchas**
- Target resolution: nearest shell (inject) → most recently mounted target → none = renders in place (PageHeader/PageHeaderBase.vue:3).
- A click on empty header area smooth-scrolls the page to top; links, buttons, inputs, labels, `[role=button]` and `[data-no-scroll-top]` are ignored (PageHeaderBase.vue:37-43). Breadcrumbs are buttons/links, but add `data-no-scroll-top` to custom clickable bits.
- `PageHeaderBackButton` without `fallbackRoute` just calls `router.back()` — on a cold deep link that leaves the app (PageHeader/useHeaderBack.ts:72-73). Always give a fallback.
- `PageHeader` has no `title` prop; put `PageHeaderTitle` or `Breadcrumbs` inside.

## Breadcrumbs

**For** the page path in a header. **Import** `import { Breadcrumbs } from 'frappe-ui'`

Prop `items: BreadcrumbItem[]` = `{ label (req), route?, href?, onClick?(event), ...any }`. Slots `#prefix {item}`, `#suffix {item}`. `route` → `<router-link>`, `href` → `<a>`, neither → `<button>`.

```vue
<Breadcrumbs :items="[{ label: 'Jobs', route: { name: 'Jobs' } }, { label: job.title }]" />
```

**Gotchas** Crumbs are keyed by `label` (Breadcrumbs/Breadcrumbs.vue:19) — duplicate labels collide. When the row overflows and there are >2 items, all but the last two move into a "…" Dropdown (Breadcrumbs.vue:3); there an `href`-only item does nothing and a `route` item navigates without calling its `onClick`. `href` + `onClick`: plain click runs `onClick` only, modified clicks follow the URL. No `<nav>` landmark — wrap it yourself.

---

## Tabs (Tabs, TabList, TabTrigger, TabPanel)

**For** switching panels or routed pages. Picking a value → [TabButtons](#tabbuttons). The exports are `Tabs`, `TabList`, `TabTrigger`, `TabPanel` — there is no `TabContent`.

**Import** `import { Tabs, TabList, TabTrigger, TabPanel } from 'frappe-ui'`

| Part | Props | Slots |
|---|---|---|
| `Tabs` | `v-model` (`string\|number`), `vertical=false`, `dir?`, shorthand only: `tabs?: TabItem[]`, `variant='underline'`, `size='sm'`, `edge?` | `#default` (composed) or shorthand `#tab-prefix/#tab-label/#tab-suffix {tab, active, disabled}`, `#tab-panel {tab}` |
| `TabList` | `variant` (`'underline'\|'subtle'\|'ghost'\|'browser-tab'`, default `'underline'`), `size` (`'sm'\|'md'`, `'sm'`), `edge` (`'start'\|'end'`, browser-tab + vertical) | `#default` |
| `TabTrigger` | `value` (req), `label?`, `icon?` (icon-only; `label` → aria-label), `iconLeft?`, `disabled?`, `route?` | `#prefix`, `#default` (label), `#suffix` — all `{active, disabled}` |
| `TabPanel` | `value` (req) | `#default` |

`TabItem` = `{ value, label?, icon?, iconLeft?, disabled?, route?, condition?(), data? }`.

```vue
<Tabs v-model="tab">
  <TabList>
    <TabTrigger value="details" label="Details" icon-left="lucide-file-text" />
    <TabTrigger value="welds" label="Welds"><template #suffix><Badge :label="String(count)" /></template></TabTrigger>
  </TabList>
  <TabPanel value="details">…</TabPanel>
  <TabPanel value="welds">…</TabPanel>
</Tabs>

<!-- routed tabs: no v-model, no panels, router-view outside -->
<Tabs><TabList>
  <TabTrigger value="open" label="Open" :route="{ name: 'JobsOpen' }" />
  <TabTrigger value="done" label="Done" :route="{ name: 'JobsDone' }" />
</TabList></Tabs>
<router-view />
```

**Gotchas**
- `variant`/`size`/`edge` on `<Tabs>` apply only in shorthand (`tabs`) mode (Tabs/types.ts:25-31); in composed mode set them on `<TabList>`.
- `vertical` changes orientation and arrow keys only; composed mode adds no layout — add `class="flex"` (shorthand mode lays itself out, Tabs.vue:382).
- `tabs` + default-slot children → children ignored, dev warning (Tabs.vue:57).
- Route mode = no `v-model` bound + a route trigger (Tabs.vue:195): selection follows the route, arrow keys only move focus (manual activation). Activation mode is fixed before first render from the vnodes (Tabs.vue:118): a `TabTrigger` wrapped in your own component, or route triggers that arrive later, keep automatic activation (dev warning, Tabs.vue:144). `route` must be set when the trigger is created (TabTrigger.vue:48).
- Bound model pointing at a missing/disabled tab → the first selectable tab is chosen **and emitted** (Tabs.vue:321); a `ref()` starting `undefined` gets filled.
- `TabPanel` unmounts when not selected (TabPanel.vue:13) and has no keep-mounted option — keep form state outside the panel.
- `icon` makes the trigger icon-only, even with `label` (TabTrigger.vue:87). Icon + text = `iconLeft`.

## TabButtons

**For** a segmented control choosing one value (view toggle, period). It is a radio group, not tabs.
**Import** `import { TabButtons } from 'frappe-ui'`

| Prop | Type | Default |
|---|---|---|
| `options` | `TabButton[]` = `{ value, label (req), icon?, iconLeft?, disabled?, route?, href?, onClick?(e) }` | — |
| `v-model` | `string\|number` | internal |
| `variant` | as Tabs | `'subtle'` |
| `size` | `'sm'\|'md'` | `'sm'` |
| `vertical` / `edge` / `fluid` | `boolean` / `'start'\|'end'` / `boolean` (equal-width fill) | `false` / `'start'` / `false` |

Slots `#prefix`, `#suffix` `{button, active, disabled}`. Exposed `focus()`. Emits `update:modelValue`.

```vue
<TabButtons v-model="view" :options="[{ value: 'list', label: 'List', icon: 'lucide-list' }, { value: 'board', label: 'Board', icon: 'lucide-kanban' }]" />
```

**Gotchas** Default variant is `subtle` (TabButtons.vue:41) while Tabs default to `underline`. Any `icon` hides the visible label (TabButtons.vue:65). `href` options open in a new tab (`target=_blank`, TabButtons.vue:308). Disabled options become disabled `<button>`s even with route/href (TabButtons.vue:295). Attrs/class go to the root.

---

## Tree

**For** nested rows that open/close (assembly trees, folders, org charts), with optional drag-and-drop reparenting.

**Import** `import { Tree, type TreeNode, type TreeKey, type DropInfo, type MoveContext, type TreeExposed } from 'frappe-ui'`

| Prop | Type | Default |
|---|---|---|
| `nodes` (req) | `TreeNode[]` = `{ label?, children?, [any]: unknown }` | — |
| `nodeKey` | field holding the unique key | `'key'` |
| `v-model:expanded` | `TreeKey[]` (open node keys) | `[]` = only roots |
| `draggable` | `boolean` | `false` |
| `move` | `(ctx: { node, target, position }) => boolean` | — |
| `guides` | `'connectors'\|'lines'\|'none'` | `'connectors'` |
| `disabled` | blocks expand/collapse + drag (not the exposed methods) | `false` |

Emits: `update:expanded`, `drag-start (node)`, `drag-end (DropInfo | null)` — `DropInfo = { node, from, to, position: 'before'|'inside'|'after', oldIndex, newIndex }` (`from`/`to` = parent keys, `null` at root; `newIndex` counted after removal).
Slots: `#item` (whole row) `{node, level, expanded, hasChildren, focused, disabled, toggle}`; `#item-prefix`, `#item-label`, `#item-suffix` (same minus `toggle`); `#empty`.
Exposed: `expand(key)`, `collapse(key)`, `toggle(key)`, `expandAll()`, `collapseAll()`.
CSS hooks: `--tree-row-height` (32px), `--tree-indent` (24px); on `li[data-slot=item]`: `data-state` (expanded/collapsed), `data-level`, `data-has-children`, `data-disabled`, `data-dragging`, `data-drop`; inside it `div[data-slot=row]` and the chevron `button[data-slot=toggle]` (TreeItem.vue:2-45). Style them from the tree's own `class`, e.g. `[&_[data-slot=row]]:h-9`.
Look (TreeItem.vue:21-25): rows are `flex items-center gap-1.5 rounded-5 px-1.5` with `hover:bg-surface-gray-2` — the hover is dropped when you use `#item` (you own the row surface then); label `text-base text-ink-gray-8`. The whole tree is `select-none` (Tree.vue:6): add `select-text` on a code or quantity people copy. The drag label uses `text-ink-white` (Tree.vue:43), a removed token with no CSS, so its text takes `body`'s colour on `bg-surface-gray-7`: with `draggable`, set `.frappe-tree-drag-label { color: var(--ink-base) }` in the app CSS.

**A tree with columns.** `Tree` has none. Put the values in `#item-suffix` (it sits in `ml-auto flex items-center`), one fixed-width cell each (`w-20 shrink-0 text-right tabular-nums`): every row ends at the same right edge whatever its indent, so fixed cells line up across levels while the label column narrows with depth. A header row above the tree is your own `div` with the same widths, visual only — `role=tree` has no column headers, so a screen reader hears the row as one string ("Frame 2 120 kg"): put the column name in each cell as `sr-only` text. Controls inside rows follow the keyboard gotcha below and all stay in the Tab order (the roving tabindex covers the rows only). When editing many values per row is the job, a `frappe-ui/list` table with indented first cells serves better than a tree.

```vue
<Tree :nodes="assemblies" node-key="name" v-model:expanded="open" draggable
      :move="({ target }) => Array.isArray(target.children)" @drag-end="onMove">
  <template #item-suffix="{ node }"><Badge :label="node.qty" /></template>
</Tree>
```
```ts
function onMove(info: DropInfo | null) {
  if (!info) return            // cancelled
  // remove info.node from parent info.from, insert under info.to at info.newIndex, then persist
}
```

**Gotchas**
- The tree never mutates `nodes`; a drop only emits `drag-end` — apply the move to your data yourself (Tree/useTreeDragDrop.ts:38).
- Clicking anywhere on a row toggles it (Tree/TreeItem.vue:28, 164); there is no select/activate event or selected state. A link, button or input in a slot needs `@click.stop` to avoid toggling (and `@keydown.stop`, below).
- `#item` replaces the chevron too, but the row's click-to-toggle stays (TreeItem.vue:28, 36); call `toggle` only from a `.stop` handler or you double-toggle.
- `children: []` is a leaf: no chevron, can't expand (Tree.vue:120). For lazy loading give unloaded parents a placeholder child, or call `expand(key)` before the children arrive (it opens when they land).
- Expansion lives only in `v-model:expanded`; a node's own `expanded` field is ignored (dev warning), and the v0 boolean `v-model:expanded` warns and is treated as `[]`.
- `nodeKey` defaults to `'key'` (Tree.vue:78): Frappe docs use `name` — set `node-key="name"`.
- **Keyboard inside a row.** The `<ul>`'s keydown handler runs for every key that bubbles from any descendant (Tree.vue:8, useTreeKeyboard.ts:64-108): Enter/Space are `preventDefault`ed and toggle the tree's *focused* item — the last row that had focus, or the first root (Tree.vue:231-234; a control taking focus does not move it, the `li` listens to `@focus`, not focusin, TreeItem.vue:17) — not the row holding the control; arrows, Home and End are `preventDefault`ed (the caret cannot move); a printable key runs typeahead and moves focus to a matching row. So an input cannot take a space, Enter submits nothing, and typing jumps away. Interactive slot content needs `@click.stop` and `@keydown.stop` on it or on its wrapper; inside a `Dialog`, let Escape through (`@keydown="(e) => e.key !== 'Escape' && e.stopPropagation()"`), since overlays listen for it on `window`.
- Drop zones: top 25% = before, bottom 25% = after, middle = inside (useTreeDragDrop.ts:71); "inside" onto the current parent is rejected (useTreeDragDrop.ts:90).
- `class` lands on the `<ul role=tree>` (Tree.vue:4).

---

## ScrollArea

**For** a scroll container with uniform auto-hiding overlay scrollbars. **Import** `import { ScrollArea } from 'frappe-ui'`

Props: `orientation='vertical'` (`'vertical'\|'horizontal'\|'both'`), `scrollHideDelay=600` ms, `viewportClass?`. Slot `#default`. Exposed `viewportElement` (for virtualization).

```vue
<ScrollArea class="h-80" viewport-class="p-4">…</ScrollArea>
```

**Gotchas** The root is `relative overflow-hidden` (ScrollArea/ScrollArea.vue:5): give it a height (`h-80`, `flex-1 min-h-0`) or it never scrolls. `class` does not reach the scrolling element — padding/grid go in `viewportClass`. With `vertical` the viewport has `overflow-x: hidden`: wide content is clipped, use `orientation="both"` or an inner `overflow-x-auto`. `ScrollBar` is not exported.

---

## useShellScrolled / shellScrollContainer

**Import** `import { useShellScrolled, shellScrollContainer } from 'frappe-ui'`

- `useShellScrolled({ threshold })` → `ComputedRef<boolean>`, true when the shell scroll element is past `threshold` px. `threshold` is **required**; without it, always false + dev warning (composables/useShellScrolled.ts:102, 165).
- `shellScrollContainer` → `ComputedRef<HTMLElement|null>` of the latest mounted shell; usable outside components (router `scrollBehavior`): `shellScrollContainer.value?.scrollTo({ top: 0 })`.
- Both need a mounted `DesktopShell` (with `scroll` true) or `MobileShell`.

## usePageMeta

**Import** `import { usePageMeta, type PageMeta } from 'frappe-ui'`

`usePageMeta(() => ({ title?, emoji?, icon? }))` → stop function; deep-watched, stops on unmount.

```ts
usePageMeta(() => ({ title: job.value ? `${job.value.title} · Jobs` : 'Jobs', emoji: '🔧' }))
```

**Gotchas** There is no `pageMeta` component option in 1.1.0 (the `FrappeUI` plugin installs no such mixin, utils/plugin.ts) — only the composable. Favicon changes need a `<link rel="icon">` in `index.html` (utils/pageMeta.ts:22). Returning `null` or no `title` changes nothing (utils/pageMeta.ts:48-51): the old title stays after unmount.

## useKeyboardShortcut

**Import** `import { useKeyboardShortcut, type KeyboardShortcutConfig, type KeyboardShortcutCombo } from 'frappe-ui'`

`useKeyboardShortcut(config | config[])` — registers for the component's lifetime (removed on unmount/deactivate, re-added on activate) and lists each in `KeyboardShortcutsDialog`.

| Field | Type | Default |
|---|---|---|
| `combo` (req) | `'Mod+Ctrl+Alt+Shift+<Key>'` (ref/getter ok) | — |
| `description` (req) | dialog label; same group+description merge | — |
| `group` | dialog heading | `'General'` |
| `handler(e)` | press mode | — |
| `onHold(e)` / `onRelease(e?)` | hold mode (instead of `handler`) | — |
| `enabled` | `MaybeRefOrGetter<boolean>`; false = inert and hidden | `true` |
| `preventDefault` | | `true` |
| `allowInInput` | fire while typing in input/textarea/contenteditable | `false` |
| `allowInDialog` | fire with focus inside `[role=dialog]` | `false` |

Keys: `A`–`Z`, `F1`–`F12`, `Escape`, `Enter`, `Tab`, `Space`, `Backspace`, `Delete`, `Insert`, arrows, `Home`, `End`, `PageUp`, `PageDown` (by `event.key`); `Digit0`–`Digit9`, `Minus`, `Equal`, `Plus` (numpad), `Slash`, `Backslash`, `Backtick`, `Comma`, `Period`, `Semicolon`, `Quote`, `BracketLeft`, `BracketRight` (by `event.code`). `Mod` = ⌘ on Apple, Ctrl elsewhere.

```ts
useKeyboardShortcut([
  { combo: 'Mod+S', description: 'Save', group: 'Job', allowInInput: true, handler: save },
  { combo: 'Mod+Shift+Slash', description: 'Show shortcuts', allowInDialog: true, handler: () => (help.value = !help.value) },
])
```

**Gotchas**
- Must be called in `setup()`; otherwise it throws (composables/useKeyboardShortcut.ts:294).
- Name keys, never characters: `'?'`, `'/'`, `','`, `'cmd+s'` are invalid — dev warning once, never fires (utils/keyboardShortcutCombo.ts:291). `?` is `Shift+Slash`. The v0 `{ key, ctrl, shift }` config is gone (utils/keyboardShortcutCombo.ts:247).
- Modifiers must match exactly: `Mod+S` does not fire while Shift is also held (utils/keyboardShortcutCombo.ts:316).
- By default ignored while typing in a field and inside any dialog (composables/useKeyboardShortcut.ts:132-133) — a Save shortcut for a form needs `allowInInput: true`; one used in a Dialog needs `allowInDialog: true`.
- Same combo registered twice: the last live registration wins, dev warning names both (composables/useKeyboardShortcut.ts:127). `SettingsDialog` registers `Mod+Shift+Comma`.
- `preventDefault` is on by default (composables/useKeyboardShortcut.ts:142): `Mod+P`, `Mod+F` replace the browser's.
