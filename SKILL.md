---
name: frappe-ui-screens
description: Build and change app screens with frappe-ui (Vue 3 + Tailwind, v1.1.0) — lists, record pages, forms, dialogs, sidebars and shells, tabs, trees, menus, toasts, charts, rich-text editors — and fetch Frappe data with useCall, useList, useDoc, useDoctype and useNewDoc. Written from frappe-ui's own source, with its recipes (full app screens) and UI/UX design rules for app screens. Use it before writing or reviewing ANY Vue screen that imports frappe-ui or frappe-ui/list, in any Frappe app, even a small change, because frappe-ui mistakes fail silently (no CSS, no error, data null).
---

# frappe-ui — building app screens that are correct and well designed

Everything here was read from frappe-ui **1.1.0**'s source (`node_modules/frappe-ui/` in your app; docs and recipes in the repo https://github.com/frappe/frappe-ui at tag v1.1.0). `file:line` citations are relative to `node_modules/frappe-ui/src/` unless they start with `tailwind/`, `docs/` or `skills/`. Where its docs and its code disagree, the references say so: **the code wins**. When unsure, open the component's file and read it — every gotcha below cites the file and line.

## How to work

1. **Find the screen's shape** in [design.md](references/design.md) (list page, record page, dashboard, settings, form and dialog, board, mobile) and look at the closest **recipe** in [recipes.md](references/recipes.md): frappe-ui's own full screens (mail, tickets, deals, accounting, files, tasks, discussions, compose), desktop and mobile, with screenshots in `assets/recipes/`.
2. **Pick each component** from the table below, then open its reference before writing markup: props, slots and option shapes differ per component and are not guessable.
3. **Style only with the semantic tokens** (`text-ink-*`, `bg-surface-*`, `border-outline-*`, `text-p-*`/`text-base`…) — [setup-and-tokens.md](references/setup-and-tokens.md). Never raw hex, never `bg-gray-100` (does not switch in dark mode).
4. **Fetch through the `use*` composables** — [data.md](references/data.md).
5. **Render it and look** (desktop and phone width), run the review checklist at the end of [design.md](references/design.md), and fix before delivering.

## The contracts (true across the library)

- **Every interactive element is a frappe-ui component**; raw HTML is for layout (flex, grid, spacing).
- **Colour is `variant` + `theme` on the component**; value sets differ per component (see the table at the top of [display.md](references/display.md) and [inputs.md](references/inputs.md) §0). In your own markup colours come only from `surface`/`ink`/`outline` tokens.
- **Two-way state is `v-model`**: inputs `v-model`; overlays `v-model:open`; `Combobox`/`MultiSelect` add `v-model:query`; `List` adds `v-model:selection` and `v-model:active`.
- **Icons are CSS classes written literally**: `<span class="lucide-pencil size-4" aria-hidden="true" />`, or a prop `icon-left="lucide-plus"`. A name built at runtime (`` `lucide-${x}` ``) or stored in a record gets no CSS unless safelisted.
- **Slots are per component**: read the entry before writing `<template #…>`.
- **Data goes through `useCall`, `useList`, `useDoc`, `useDoctype`, `useNewDoc`** (v2 API). The v1 `createResource` family is frozen and needs `setConfig('resourceFetcher', frappeRequest)`.

## The house style (what frappe-ui's own recipe screens all do — details and file:line in recipes.md)

- **Frame**: `DesktopShell` (rail, sidebar, page) or `MobileShell`; the page header sits in the shell's pinned bar; `:scroll="false"` when the panes scroll themselves.
- **Header**: title or breadcrumbs on the left; actions on the right, ending with **one** solid button. With a selection, the count and the bulk acts replace the normal buttons.
- **Tables**: one flexible title column, fixed rem widths for the rest, a row height, `list-row-px-3`, sortable header cells.
- **Rows**: title `text-base text-ink-gray-8`; a meta line `mt-1.5 text-sm text-ink-gray-5` joined with « · »; status as a `Badge`; unread shown by weight, not colour.
- **A row with its own buttons**: a clickable `ListRow` renders as a `<button>` and cannot hold buttons — keep the row static, stretch an invisible `RouterLink` over it (a real link, so Ctrl/Cmd-click works; `sm:rounded-5`, `focus-visible:focus-ring`), lift the row's controls with `relative`, and name each row's button after its row (list.md).
- **Record page**: content and comments in the main column; a 20rem right panel of label/control pairs edited in place.
- **Filter bar** above a list: scope tabs; ghost `Select`s whose first option resets and reads like the field name; «Clear» only when something is set; count, group and sort on the right.
- **Gray first**: colour only where it means something — a status badge, a small stage or priority dot, pass/fail, negative money — and always beside a word.
- **Mobile is the same screen re-laid**: centred header (back or menu left, one act right), bottom tabs, the sidebar as a bottom sheet, table columns folded into rows one text size up, row menus as action sheets, the side panel as chips, split panes as two screens.

## Which component for what

| You need | Use | Reference |
|---|---|---|
| A button, an icon button, a link that looks like one | `Button` (`icon` = icon-only, `icon-left`/`icon-right` with text) | inputs.md |
| A text field, number, password, long text | `TextInput`, `Password`, `Textarea`, or `FormControl` with `type` | inputs.md |
| A label + control + description + error in one | `FormControl` (`type` picks the control) | inputs.md |
| Pick one of a few / of many / with search / many values | `Select` / `Combobox` / `Combobox :filterable="false"` for server search / `MultiSelect` | inputs.md |
| A yes/no | `Checkbox` (emits booleans) or `Switch` (a setting that applies at once) | inputs.md |
| Dates and times | `DatePicker`, `DateTimePicker`, `DateRangePicker`, `TimePicker`, `Duration` | inputs.md |
| Upload a file | `FileUploader` (private by default) | inputs.md |
| A status word | `Badge` (`theme`) — always a word, colour only adds | display.md |
| A message on the page | `Alert` (the parent hides it on `dismiss`) | display.md |
| A person | `Avatar` | display.md |
| Loading / empty | `Skeleton`, `LoadingText`, `Spinner`, `LoadingIndicator` | display.md |
| A progress | `Progress` | display.md |
| A modal task | `Dialog` (`title`, `message`, `size`, `actions` are top-level props) | overlays.md |
| Confirm / prompt / danger in one call | `dialog.confirm`, `dialog.prompt`, `dialog.danger` (no `dialog.alert`) | overlays.md |
| A feedback after an act | `toast` | overlays.md |
| A menu of acts on a row or a button | `Dropdown` (options shape in overlays.md), `ContextMenu` on right click | overlays.md |
| A small panel anchored to a trigger | `Popover`, `HoverCard`, `Tooltip` | overlays.md |
| A sheet on a phone | `BottomSheet` | overlays.md |
| App frame | `FrappeUIProvider`, `DesktopShell`, `MobileShell`, `Sidebar`/`SidebarRail`, `MobileNav` | navigation.md |
| A page's head | `PageHeader` family, `Breadcrumbs`, `usePageMeta` | navigation.md |
| Tabs | `Tabs` + `TabList`/`TabTrigger`/`TabPanel`, or `TabButtons` for a segmented switch | navigation.md |
| A hierarchy | `Tree` (you apply drops yourself; `nodeKey` defaults to `key`) | navigation.md |
| A list or table of records | `frappe-ui/list`: `List`, `ListHeader`, `ListRows`, `ListRow`, `ListCell`, `ListGroup` | list.md |
| Keyboard shortcuts | `useKeyboardShortcut` (key names: `Shift+Slash`, not `?`) | navigation.md |
| Charts and number cards | `frappe-ui/charts` inside `ChartCard` with a height | charts.md |
| Rich text | `frappe-ui/editor`: `Editor` + `EditorContent` (+ an upload function) | editors.md |
| Code | `frappe-ui/code-editor` | editors.md |

## The gotchas that fail silently (read before you ship)

Data
- `useCall` only understands `/api/v2/...` URLs; on a v1 `/api/method/x` it returns `data: null` with no error (`data-fetching/useCall/useCall.ts:207,288`). It fires as soon as it is created, POST included: an act needs `immediate: false` (`useCall.ts:44`).
- `useList` appends pages and never resets its start: after `next()`, a filter change or `reload()` rows can repeat (`useList.ts:388-391`); `start`/`limit` are read once — walk back with `previous()` in a `flush: 'sync'` watcher (data.md §4).
- A failed `useCall` refresh puts `data` back to `initialData` or `null` (VueUse, on any non-2xx) and its `cacheKey` copy is never shown for a server error, `staleOnError` or not (`useCall.ts:360-362`): the `loading && !data` guard then shows the error state instead of the old values — keep the last good value in `onSuccess`.
- `FrappeResponseError.message` is `"<Type>: <message>"` and the message may hold HTML; `ErrorMessage` and `dialog.*` show it whole — strip both (`serverMessage`, data.md §2).
- `useDoc().doc` is one shared, cached object: mutating it changes every reader and saves nothing — write with `setValue.submit` (`useDoc.ts:210-229`).

Styling
- Old class names produce no CSS and no error: `rounded-lg`, bare `rounded`, `shadow-inner`, `2xl:`, `bg-surface-white`, `text-ink-white`; `text-base` is 14px (`tailwind/plugin.js`, `migrate-tokens-v2.js`).
- Icons and classes built at runtime are never generated (`tailwind/iconPackPlugin.js:16`).
- A `class` on `Popover`, `Dropdown`, `ContextMenu`, `HoverCard` or `Tooltip` is dropped: style the element inside the trigger slot (`Popover/Popover.vue:68`).
- Inputs move your `class`/`style` to the outer wrapper once a label, description or error shows (`TextInput.vue:1-20`).
- `DesktopShell` (default `scroll`) wraps the page in a ScrollArea: `h-full` does not fill and wide content is clipped sideways; full-height or split panes need `:scroll="false"` (`DesktopShell.vue:18`).
- Charts fill their parent and draw no card: inside `<ChartCard class="h-80">` or they are 0px tall (`charts/ChartContainer.vue:5-9`).
- Nothing sets `data-theme` until `useColorScheme()` is first called (`composables/useColorScheme.ts:133`).

Behaviour
- A `Dialog` action with `onClick` does not close the dialog: call `close()` from its context (`Dialog/Dialog.vue:353`).
- In menu options `route` beats `onClick`, and the item only `router.push`es — no `<a>`, no new tab (`Menu/Menu.vue:35-40`): keep «Open» outside the menu as a real link.
- `Dialog :dismissible="false"` stops Escape and outside clicks, not the header × (`Dialog.vue:36-45,89-95`): guard unsaved work with `:open` + `@update:open`. `#default` and `#actions` are separate divs, so a `<form>` cannot wrap the buttons — `form="<id>"` on the submit Button; and `novalidate`, since `required` is native (design.md §2.5).
- A control bound to `doc.x` that saves on change snaps back until the response lands (stores are written only from the response): show a local value first, revert on failure (design.md §1.10).
- `ListRows` does not pass `value` on: without `:value="value"` on `ListRow` there is no checkbox and no active row (`molecules/list/ListRowBase.vue:85`); `v-model:active` needs the update listener bound (`List.vue:47`). Rows are identified by `item.name`, then `item.id`, then position (`ListRows.vue:124-136`): when `name` is a display field, set `row-key` (frappe-ui's own Accounting recipe shows «1 selected» with no box ticked because of it).
- `SidebarItem` is active only on an exact route-name match: pass `:active` for nested routes (`Sidebar/SidebarItem.vue:246`).
- `Tree`: a click anywhere on a row toggles it; there is no select event; it never changes `nodes` on drop — apply `drag-end` yourself (`Tree/TreeItem.vue:28`, `useTreeDragDrop.ts:38`). Its `<ul>` keydown eats Enter/Space/arrows/Home/End and runs typeahead for any control inside a row, toggling the tree's focused row, not the control's (`useTreeKeyboard.ts:64-108`): slot controls need `@click.stop @keydown.stop`.
- `Checkbox` emits `true`/`false`, never 1/0 (`Checkbox.vue:105`); `MultiSelect` drops plain-string options (`MultiSelect/utils.ts:48`); `Combobox` never commits typed text (`Combobox.vue:340`); `DatePicker` clears to `''`, `DateRangePicker` to `[]` (`DatePicker.vue:239`).
- `TextInput` always emits strings (`v-model.number`), reads `debounce` once (`TextInput.vue:281`), and binds `:value`: a parent that trims or rewrites the model (a URL-synced search) eats the trailing space being typed — keep a local ref (`TextInput.vue:39`).
- `FileUploader` uploads private files by default and ignores re-selecting the same file (`FileUploader.vue:51,106-125`).
- `Alert`'s `theme` colours only the icon and the action, not the background; `dismiss` only emits (`Alert.vue:176,78`).
- `Editor` renders nothing without `<EditorContent>`; without an upload function pasted images are dropped (`editor/Editor.vue:57-63`).
- `useKeyboardShortcut` is off inside inputs and dialogs unless `allowInInput` / `allowInDialog` (`composables/useKeyboardShortcut.ts:132`).

Accessibility and the browser
- `PageHeaderTitle` renders a `<span>`: a desktop page has no heading element unless you write one (`PageHeader/PageHeaderTitle.vue:2`).
- `Textarea` text is 13px at every size, `TextInput` 14px below `lg`: under 16px iOS zooms on focus — mobile forms use `size="lg"` (`Textarea.vue:77-80`, `TextInput.vue:103-106`).
- `dialog.*` puts the confirm button first in tab order (`utils/dialog.ts:389`): a destructive confirm needs its words to name the object and the consequence.
- `TextInput` sets `autocomplete="off"` by default (`TextInput.vue:47`): login, e-mail and address fields set it.
- Nothing sets the page's CSS `color-scheme`: native scrollbars stay light in dark mode unless the app sets it.
- Text people must read uses `text-ink-gray-6` or darker; `ink-gray-5` is for meta only, `ink-gray-4` for placeholders and disabled (contrast computed in design-sources.md).

Found while redesigning a large app (first pass)
- `Badge` themes are only `gray`, `blue`, `green`, `amber`, `red`, `violet`: `theme="orange"` falls back to gray silently (`Badge/types.ts:3`, `Badge.vue:94`).
- `Button` has no `link` prop: `:link="url"` renders a button that does nothing — use `:href` or `route` (`Button/types.ts`).
- `useKeyboardShortcut` matches punctuation by the physical key: `Slash`/`Shift+Slash` never fire on an Italian keyboard (where «/» is Shift+7); give such shortcuts a letter key too.
- `SidebarRailItem` folds an English «N unread» into its accessible name, not overridable (`SidebarRail/SidebarRailItem.vue:152`): say the count yourself elsewhere for a non-English app.
- `Breadcrumbs` gives no `aria-current` on the last crumb: wrap it in `<nav aria-label>` and mark the current page yourself.
- Inside your own `<form>`, a plain `<button>` without `type` submits it; frappe-ui's `Button` passes its `type` prop through (`Button.vue:266`) — set `type="button"` on acts that must not submit.

Found while redesigning a large app (later passes)
- `Button`'s `label` wins over an `aria-label` attribute (`Button/Button.vue:347`): to name a text button after its row («Remind PO-…»), put the visible word in the default slot and the row's name in `aria-label`.
- `Progress` without `label` is announced as the English «Progress» (`Progress/Progress.vue:101`) and extra attributes land on its wrapper: give it `label`, or `aria-hidden` when the figures beside it say the same.
- `DatePicker` (via `shared/picker/PickerShell.vue:15`) puts extra attributes on a wrapper div, not the input: `aria-label` never reaches it — use its `label` prop or `id` with `<label for>`.
- The semantic colour families are wired per utility — `ink` for text, `surface` for backgrounds and gradients, `outline` for borders (`tailwind/plugin.js:249-275`) — not into `colors`: `decoration-outline-*`, `decoration-ink-*`, `ring-ink-*` produce no CSS. Use `decoration-[color:var(--outline-gray-3)]`.
- `ListHeaderCell` has no `align` prop (`molecules/list/ListHeaderCell.vue`): `align="end"` becomes a dead HTML attribute — use `class="justify-end"` (only `ListHeaderCellSort` aligns).
- A `Dropdown` group heading is `text-ink-gray-4` (`Menu/utils.ts:23`): fine for a label, too faint for a sentence — use `hideLabel` and say it elsewhere.
- Underline `Tabs` never scroll on their own: on a phone wrap the tab row in a horizontal `ScrollArea` or the page scrolls sideways.
- `Accordion` lives in `frappe-ui/experimental` (`experimental/Accordion`): slots `item-label`, `item-suffix`, `item-content` (props `{ item, index }`); its model is `string | string[] | undefined`; its trigger's focus ring is the weak `ring-outline-gray-3` (`Accordion.vue:73`) — add `focus-visible:focus-ring`.
- `SettingsRow` (`SettingsDialog/SettingsRow.vue`) works on its own on a settings page, not only inside `SettingsDialog`.
- frappe-ui already draws a focus outline on every focused element (`tailwind/plugin.js:164-171`, `focus-visible:outline-none` removes it): add a ring only where something removed it.
- A menu option's `description` is cut to one line (`Menu/MenuItemContent.vue:173`) and the keyboard skips disabled items: a reason written there is never heard — say why outside the menu.
- `RadioGroup` takes no focus itself and draws hidden native inputs: a «focus the first empty field» search picks the hidden input or nothing — focus the chosen option, or the first.
- `PageHeaderMobile` caps `#suffix` at 35% and insets the centred title by the widest side (`PageHeader/PageHeaderMobile.vue`): a labelled button there cuts the title to a few letters — on a phone put wide acts in the page's first row, keep the bar for an icon or a short word.
- `v-model` on a writable `computed`: the setter must accept what the component emits (`TabButtons` gives `string | number`, `Accordion` `string | string[]`), or vue-tsc flags it.

Words frappe-ui writes in English whatever the app's language (no translation hook in 1.1.0)
- `Dialog`'s × button is labelled «Close» (`Dialog/Dialog.vue:90,145`): screen readers say it in English.
- `MultiSelect` writes «N selected», «Clear All», «Select All» (`MultiSelect.vue:188,615-628`): override with the `#summary` and `#footer` slots (slot props `clear`, `selectAll`).
- `Select`'s default placeholder «Select option» and empty list «No options» (prop `emptyText`, `Select/Select.vue:67`), `Combobox`'s empty texts: always pass your own `placeholder` and empty words.
- `Combobox` with `:loading` writes «Loading...» with no prop or slot to replace it (`Combobox/ComboboxResults.vue:118`): for a non-English app, show the search state in the empty text instead, or accept the word.
- Typography: a bare `text-sm`/`text-base` already sets its weight (420); `font-normal` beside it changes it to 400 — never add it.

Names that do not exist in 1.1.0 (from older docs or habits): `Dialog`'s `options` prop, `TabContent` (it is `TabPanel`), `dialog.alert`, a `pageMeta` option (use `usePageMeta`), `fileUploadHandler` (it is the class `FileUploadHandler`); `useInputLabeling`, `InputLabel`, `InputError` only from `frappe-ui/experimental`; `TextEditor` is the deprecated v0 editor.

## Reference files

| File | Holds |
|---|---|
| [design.md](references/design.md) | UI/UX rules for app screens in frappe-ui's tokens and components; per screen type; review checklist; what not to do |
| [design-sources.md](references/design-sources.md) | Where each design rule comes from: 14 sources opened (Anthropic, Vercel, Primer, Atlassian, Polaris, Nielsen, GOV.UK…), what does not fit, conflicts |
| [recipes.md](references/recipes.md) | frappe-ui's eight recipe screens: layout, components, patterns, desktop vs mobile; screenshots in `assets/recipes/` |
| [inputs.md](references/inputs.md) | Every form control, sizes, variants, labels, FormControl types |
| [display.md](references/display.md) | Alert, Avatar, Badge, Breadcrumbs, Progress, Skeleton, loading, icons end to end |
| [overlays.md](references/overlays.md) | Dialog and `dialog.*`, Popover, Dropdown and the options shape, ContextMenu, HoverCard, Tooltip, BottomSheet, toast, SettingsDialog |
| [navigation.md](references/navigation.md) | Provider, shells, sidebar and rail, mobile nav, page header, tabs, tree, scroll area, page meta, shortcuts |
| [list.md](references/list.md) | `frappe-ui/list`: parts, selection, active row, sorting, groups, virtual rows, a full list page |
| [data.md](references/data.md) | useCall, useList, useDoc, useDoctype, useNewDoc; the frozen v1 resources; caching; errors |
| [setup-and-tokens.md](references/setup-and-tokens.md) | Package entries, vite plugins, the Tailwind preset and every token, dark mode, fonts |
| [charts.md](references/charts.md) | `frappe-ui/charts`: every chart, data shapes, ChartCard, palettes |
| [editors.md](references/editors.md) | `frappe-ui/editor`, `frappe-ui/code-editor`, `frappe-ui/experimental`, `frappe-ui/icons` |

## More gotchas found in a real app

- `Alert` has **no default slot**: loose children inside it are never drawn — put rows in `#description` and buttons in `#actions`. The same holds for any component (frappe-ui's or your own) with no default slot, and a `<template #name>` for a slot the component does not declare vanishes too (`Alert` has only `prefix`, `title`, `description`, `actions`: a `#footer` is lost). Check a whole app with `scripts/slotscan.cjs` (below).
- `useSlots()` read inside a `computed` is not tracked by Vue: a part that decides its layout from «is there an `#aside`?» that way never sees a slot that appears after the data arrives — read `$slots` during render.
- VueUse `createReusableTemplate`: a bare boolean attribute (`<Reply in-sheet />`) arrives as `''`, i.e. false — write `:in-sheet="true"`.
- `Intl.DateTimeFormat(undefined, …)`, `toLocaleDateString([], …)` and `toLocaleTimeString([], …)` use the browser's language, not the app's: a headless or English browser prints «Wednesday, November 11» and «03:39 AM» on a screen in another language. Pass the app's locale explicitly, or use the app's date helpers.
- «Phone» should be one test across the app, e.g. `useBreakpoints(breakpointsTailwind).smaller('md')` from VueUse, used by the shell and by every page, so a page switches layout together with its shell.
- After a change: `vue-tsc --noEmit` (a `TS2304 Cannot find name` is a page that will not open), build, then look at the screen rendered as a real user with a real role, desktop and phone width.

## The slot scanner

`scripts/slotscan.cjs` lists, for every `.vue` file under `src/`, the loose children of a component that has no default slot and every `<template #name>` for a slot the component does not declare. Slots are read from frappe-ui's own source (`SlotsType` included) and from the app's components by their import path (`@/` is read as `src/`). Run it from the app's frontend folder (needs `@vue/compiler-sfc`, which every Vue app already has):

```bash
NODE_PATH=$PWD/node_modules node -e "require('module').Module._initPaths(); require('/path/to/frappe-ui-screens/scripts/slotscan.cjs')"
```
