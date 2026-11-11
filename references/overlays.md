# Overlays — dialogs, popovers, menus, tooltips, sheets, toasts (frappe-ui 1.1.0)

Everything that floats over the page, read from `src/` of frappe-ui 1.1.0. `file:line` is relative to `src/components/` unless it starts with `utils/`, `composables/`, `directives/` or `index.ts`.

Sections: [Shared rules](#shared-rules) · [Dialog](#dialog) · [dialog() functions + Dialogs](#dialog-functions--dialogs) · [Popover](#popover) · [Dropdown](#dropdown) · [Menu options shape (Dropdown + ContextMenu)](#menu-options-shape-dropdown--contextmenu) · [ContextMenu](#contextmenu) · [HoverCard](#hovercard) · [Tooltip + TooltipProvider](#tooltip--tooltipprovider) · [BottomSheet (+ useSheetDrag)](#bottomsheet--usesheetdrag) · [Toast](#toast) · [KeyboardShortcutsDialog](#keyboardshortcutsdialog) · [SettingsDialog family](#settingsdialog-family) · [usePortalTarget](#useportaltarget) · [vOnOutsideClick](#vonoutsideclick) · [useAutofocusOnOpen / vFocus](#useautofocusonopen--vfocus)

---

## Shared rules

- All overlays are reka-ui underneath and teleport to `body` unless a host names a portal target ([usePortalTarget](#useportaltarget)).
- Every "trigger" slot is rendered `as-child`: the slot must be **one element** that accepts attrs/refs (a `<Button>`, a `<button>`), not text or a fragment.
- `Popover`, `Dropdown`, `ContextMenu`, `HoverCard`, `Tooltip` set `inheritAttrs: false` → a `class`/`style` on the component itself goes nowhere (Popover.vue:68, Dropdown.vue:74, ContextMenu.vue:50, HoverCard.vue:20, Tooltip.vue:13). Put classes on the element in the trigger slot.
- Delays are **milliseconds** (v0 used seconds; `scripts/migrate-overlays-v1.js:215` multiplies by 1000).
- Icons are `lucide-*` class strings or components; any other string renders nothing and warns in dev.
- Floating panels share `PopoverPanel` (`shared/popover/PopoverPanel.vue`): `rounded-6 bg-surface-elevation-2 shadow-2xl ring-1`, 80ms fade on open, no scale.

---

## Dialog

**For** a modal window: message, form, decision. For a quick question from code, use [`dialog.*`](#dialog-functions--dialogs); on mobile use [`BottomSheet`](#bottomsheet--usesheetdrag).

**Import** `import { Dialog } from 'frappe-ui'` — also `Dialog.Title`, `Dialog.Description`, `Dialog.Close` (reka parts, Dialog/index.ts:24-27).

| Prop | Type | Default |
|---|---|---|
| `open` (v-model:open, canonical) | `boolean` | `undefined` |
| `modelValue` (v-model, also works) | `boolean` | `undefined` |
| `title` | `string` | — renders the header |
| `message` | `string` | — paragraph; replaced by `#default` |
| `icon` | `lucide-*` string \| Component | — badge left of title |
| `theme` | `'amber'\|'blue'\|'red'\|'green'` | gray badge |
| `size` | `'xs'…'7xl'` (max-w-*) | `'lg'` |
| `position` | `'center'\|'top'` (top = `pt-[20vh]`) | `'center'` |
| `paddingTop` | `string\|number` (number = px) | — overrides position padding |
| `actions` | `DialogAction[]` = `ButtonProps & { onClick?({ close }) }` | — |
| `dismissible` | `boolean` (outside click + Escape) | `true` |
| `showCloseButton` | `boolean` | `true` |
| `bare` | `boolean` — no card, header, action row | `false` |

Emits: `update:open`, `update:modelValue` (both fire on every change), `close` (on change to false), `after-leave` (close animation done).
Slots: `#default {close}`, `#title {close}`, `#actions {close, actions}` (actions = reactive list with `loading`).

```vue
<Dialog v-model:open="show" title="Rename job" size="md"
  :actions="[{ label: 'Save', variant: 'solid', onClick: async ({ close }) => { await save(); close() } }]">
  <template #default>
    <TextInput v-model="name" autofocus />
  </template>
</Dialog>
```

Bare dialog (own layout, still needs an accessible name):
```vue
<Dialog v-model:open="show" bare>
  <div class="p-6">
    <Dialog.Title class="text-2xl-semibold">Pick a workspace</Dialog.Title>
    <Dialog.Close as-child><Button label="Not now" /></Dialog.Close>
  </div>
</Dialog>
```

**Gotchas**
- An action **with** `onClick` does not close the dialog; call `close()` from its context. An action **without** `onClick` just closes (Dialog.vue:353). The button shows `loading` while the promise runs; a throw is not caught for display (only `finally`).
- Action buttons are keyed by `label` (Dialog.vue:125) — two actions with the same label collide.
- With one action and `size` xs/sm/md the button is full width (Dialog.vue:368).
- There is **no `options` prop** in 1.1.0: `title`, `message`, `size`, `icon`, `actions` are top-level props. An `:options="{…}"` from old code is an unknown attr and does nothing.
- The v0 `icon: { name, theme }` object is removed; it renders an empty badge and warns (Dialog.vue:273). Use `icon="lucide-…"` + `theme`.
- `open` wins when both `open` and `modelValue` are bound (Dialog.vue:239).
- Header shows only with `title` or `#title`; close button then sits in the header, otherwise absolute top-right (Dialog.vue:139). `bare` drops the close button, title, icon and actions (dev warning, Dialog.vue:281-289).
- Initial focus: an element with `[autofocus]` inside the content is focused on **every** open (and input text selected) via `useAutofocusOnOpen` (Dialog.vue:391); otherwise reka focuses the first tabbable.
- Outside clicks on `[data-editor-floating]` (editor @mention / slash menus portaled to body) do not close it (Dialog.vue:43).
- Unknown `size` falls back to `max-w-lg` (Dialog.vue:232).
- **`dismissible: false` does not stop the header ×.** It only cancels Escape and outside clicks (Dialog.vue:36-45); the × is a reka `DialogClose` (Dialog.vue:89-95, :138-151) and still closes. To guard unsaved work, control it: `:open="open" @update:open="onOpenChange"` and keep `open` true until the person agrees — ×, Escape, outside click and `close()` all arrive there (the `isOpen` setter, Dialog.vue:237-247), so no `dismissible` is needed. `close` is emitted on every request to close, even one you refuse (Dialog.vue:245): do no clean-up on `@close`. Pattern: design.md §2.5.
- **No `<form>` around fields and buttons.** `#default` and `#actions` render in two sibling divs (Dialog.vue:51-107, :109-134), so a `<form>` in `#default` cannot contain the action row. For Enter-to-submit: (a) `<form id="new-job" novalidate @submit.prevent="create">` in `#default` and, in `#actions`, `<Button type="submit" form="new-job" variant="solid" :loading="…" label="Create job" />` — `form` is not a Button prop, so it falls through to the native `<button>` (Button.vue:340-347); do not use the `actions` array for it (an action without `onClick` closes, one with `onClick` runs as well as the submit); (b) put the buttons inside your form in `#default` and pass no `actions`; (c) `bare` and lay out the whole dialog in one form. `novalidate`, because a field's `required` is the native attribute (inputs.md §2).

---

## dialog() functions + Dialogs

**For** asking from code without a `<Dialog>` in the template. **Import** `import { dialog } from 'frappe-ui'`. Needs `<Dialogs />` mounted once — `FrappeUIProvider` mounts it.

| Function | Args | Returns |
|---|---|---|
| `dialog.confirm(args)` | `{ title?, message?, confirmLabel='Confirm', cancelLabel='Cancel', theme?, icon?, size='md', dismissible=true, onConfirm?(ctl), onCancel?(), actions? }` | `{ close }` |
| `dialog.danger(args)` | same minus `theme`/`icon`; forces red + alert icon, `confirmLabel` default `'Delete'` | `{ close }` |
| `dialog.prompt(args)` | `{ title?, message?, fields, confirmLabel='Submit', cancelLabel='Cancel', theme?, icon?, size='md', dismissible=true, onConfirm(ctl), onCancel? }` | `{ close }` |

- `ctl` = `{ close, setError(msg) }`; prompt adds `values` (a copy).
- `actions` (confirm/danger): `ImperativeDialogAction[]` = `ButtonProps & { label: string, onClick?(ctl) }`, rendered left→right; replaces confirm/cancel and ignores `onConfirm`.
- `PromptField`: `{ name, label?, placeholder?, required?, description?, validate?(value, allValues) → string|null, type? }` with `type`: `'text'` (default) \| `'textarea'` \| `'select'` (+ `options: {label,value}[]`) \| `'checkbox'` \| `'combobox'` (+ `options`, `allowCreate?`). Rendered through `FormControl`.

```ts
dialog.danger({
  title: 'Delete job?',
  message: 'This cannot be undone.',
  onConfirm: async () => { await deleteJob() }, // resolve → closes; throw → inline error
})

dialog.prompt({
  title: 'New folder',
  fields: [{ name: 'name', label: 'Name', required: true,
             validate: (v) => (v.includes('/') ? 'No slashes' : null) }],
  onConfirm: async ({ values }) => { await createFolder(values.name) },
})
```

**Gotchas**
- `dialog.alert` does **not** exist — the namespace is `{ confirm, prompt, danger }` (utils/dialog.ts:744). `FrappeUIProvider.md:31` mentions `dialog.alert`; the code wins.
- `onConfirm` / action `onClick`: resolve auto-closes, reject shows the error inline (Frappe `messages[0]`, else `.message`) and re-enables buttons (utils/dialog.ts:307).
- While a confirm button is loading, cancel/Escape are ignored (utils/dialog.ts:352); prompt's cancel is **not** guarded (utils/dialog.ts:574).
- prompt: an empty `required` field blocks submit **silently**, no message (utils/dialog.ts:556). Checkboxes are never "required". Validators run in parallel after the required check.
- prompt focuses the first text/textarea field; Enter in a single-line field submits (it is a real `<form>`).
- `theme: 'amber'` colors the icon but leaves the confirm button untinted (Button has no amber, utils/dialog.ts:226).
- `<Dialogs />`: only the first mounted host renders the stack; extras warn in dev (Dialogs.vue:93, 72). Don't add one if `FrappeUIProvider` is used.

---

## Popover

**For** a click-opened floating panel (filters, pickers, status editor). Hover → [HoverCard](#hovercard); short hint → [Tooltip](#tooltip--tooltipprovider); a menu of actions → [Dropdown](#dropdown).

**Import** `import { Popover } from 'frappe-ui'`

| Prop | Type | Default |
|---|---|---|
| `open` (v-model:open) | `boolean` | `undefined` = uncontrolled |
| `side` | `'top'\|'right'\|'bottom'\|'left'` | `'bottom'` |
| `align` | `'start'\|'center'\|'end'` | `'start'` |
| `offset` | px | `4` |
| `collisionPadding` | px | `10` |
| `dismissible` | outside click **and** Escape | `true` |
| `autoFocus` | content takes focus on open | `true` |
| `trigger` | `'click'\|'manual'` | `'click'` |
| `reference` | `Element` to position against | trigger |
| `matchTriggerWidth` | min-width = trigger width | `false` |
| `portalTo` | `string\|HTMLElement` | host target / body |
| `bare` | no panel shell | `false` |
| `arrow` | small arrow | `false` |

Emits `update:open`, `open`, `close`. Slots `#trigger` and `#default`, both `{ open, close, setOpen }`. Exposed: `open()`, `close()`, `contentEl`.

```vue
<Popover>
  <template #trigger="{ open }">
    <Button :label="open ? 'Close filters' : 'Filters'" />
  </template>
  <template #default="{ close }">
    <div class="w-64 p-3"><!-- form --><Button label="Apply" @click="apply(); close()" /></div>
  </template>
</Popover>
```

**Gotchas**
- `class` on `<Popover>` is dropped (Popover.vue:68). Size the panel from inside `#default`.
- Default `align: 'start'` (Popover.vue:74), not center.
- Controlled only when `open` is bound (Popover.vue:90); `@open`/`@close` report the state actually reached, so a parent that refuses `update:open` gets no `open` event (Popover.vue:115).
- `trigger="manual"` removes click toggle and `aria-expanded`/`aria-controls` (Popover.vue:11); pair with `:auto-focus="false"` for a typeahead.
- Removed v0 API: `#target`/`#body` slots → `#trigger`/`#default`; `togglePopover` slot prop → `setOpen`/`close` (`scripts/migrate-overlays-v1.js:154, 450`).

---

## Dropdown

**For** a menu of actions opened from a button. Right-click → [ContextMenu](#contextmenu). Picking a value → `Select`/`Combobox` (other reference).

**Import** `import { Dropdown } from 'frappe-ui'` (types `DropdownOptions`, `DropdownOption`, `DropdownGroupOption`…).

| Prop | Type | Default |
|---|---|---|
| `options` | `MenuOptions` (see below) | `[]` |
| `button` | `ButtonProps` for the default trigger | — label falls back to `'Options'` |
| `open` (v-model:open) | `boolean` | `false` |
| `side` / `align` | as Popover | `'bottom'` / `'start'` |
| `offset` | px | `4` |
| `matchTriggerWidth` | width = trigger | `false` |
| `portalTo` | `string\|HTMLElement` | host / body |

Slots: `#trigger` or `#default` = custom trigger, props `{ open, disabled, setOpen, close, ...attrs }`; `#item {item, close, selected}` (whole row), `#item-prefix`, `#item-label`, `#item-suffix`, `#item-<slot>` (per-option via `option.slot`, replaces label), `#group-label {group}`, `#empty`.

```vue
<Dropdown :options="[
  { label: 'Edit', icon: 'lucide-pencil', onClick: edit },
  { label: 'Duplicate', icon: 'lucide-copy', onClick: duplicate },
  { group: 'Danger', options: [{ label: 'Delete', icon: 'lucide-trash', theme: 'red', onClick: remove }] },
]">
  <Button variant="ghost" icon="lucide-more-horizontal" label="Actions" />
</Dropdown>
```

**Gotchas**
- `placement` is removed and ignored (dev warning); use `align` (`placement="right"` → `align="end"`) (Dropdown.vue:119).
- Attrs on `<Dropdown>` go to the default `Button`, or arrive as **slot props** of a custom trigger (Dropdown.vue:12-22) — bind them yourself if you need them. `disabled` on `<Dropdown>` disables the trigger (Dropdown.vue:115).
- Opens on mouse `pointerdown` (not click) to save ~100ms; touch keeps click (Dropdown.vue:148).
- An icon-only trigger needs a `label` for screen readers.

## Menu options shape (Dropdown + ContextMenu)

`Menu` (`components/Menu/`) is the internal renderer shared by Dropdown and ContextMenu; it is **not exported** from `frappe-ui`. Its option types are re-exported as `Dropdown*`/`ContextMenu*`.

| Item kind | Fields |
|---|---|
| action | `label` (req), `onClick?(event)`, `route?`, `icon?`, `description?`, `theme?: 'gray'\|'red'`, `disabled?`, `selected?`, `condition?(): boolean`, `slot?`, `slots?: { prefix, label, suffix, item }`, any extra field |
| switch | `label`, `switch: true`, `switchValue?: boolean`, `onClick?(value: boolean)` |
| submenu | `label`, `submenu: MenuOptions` (same shape, nests) |
| group | `{ group: string, options: MenuOption[], hideLabel?, key? }` |

Loose items between groups form unlabeled implicit groups; groups/items are separated by dividers.

**Gotchas**
- `route` wins over `onClick`: with a router installed the item does `router.push` and **never calls `onClick`** (Menu/Menu.vue:35-40). The item renders no `<a>` (a reka menu item, Menu.vue:160-170), so Ctrl/Cmd-click, middle-click and "Open in new tab" do nothing. Keep "Open" out of the menu as a real link — the row itself (`ListRow :route`, or the stretched `RouterLink` of list.md) or a `Button :route` (renders a `RouterLink`, Button.vue:251-252) — and use menu `route` only for places nobody opens in a second tab.
- Group key is `options` — `{ group, items }` is removed: the group does not render, dev warning only (Menu/types.ts:112, Menu/utils.ts:45).
- Group `theme` is typed "inherited by items" (Menu/types.ts:117) but the code never applies it: items default to `'gray'` (Menu/utils.ts:79). Set `theme: 'red'` on each item.
- `component:` rows are removed; they render as plain actions (Menu/utils.ts:66). Use `slots: { item }` or the `#item` slot.
- Switch items keep the menu open and call `onClick(newValue)`; submenu items ignore `onClick` (Menu/Menu.vue:112, Menu/MenuItemContent.vue:121).
- `condition()` runs inside a computed — reactive reads re-run it; a group with no visible items disappears (Menu/utils.ts:69).
- Rows are keyed `item.value ?? item.label` (Menu/Menu.vue:70): give duplicate labels a `value`.
- `#item` / `slots.item` replace the whole row and are rendered `as-child`; the first element gets the menu-item attrs.

---

## ContextMenu

**For** a right-click (long-press on touch) menu. Same `options` and slots as Dropdown.

**Import** `import { ContextMenu } from 'frappe-ui'`

Props: `options` (`[]`), `open` (v-model:open, `false`), `portalTo`. Slots: `#default` / `#trigger` = right-clickable area, props `{ open, setOpen, close }`, plus the menu slots of Dropdown.

```vue
<ContextMenu :options="rowOptions">
  <div class="divide-y">
    <div v-for="r in rows" :key="r.name" @contextmenu="rowOptions = optionsFor(r)">{{ r.title }}</div>
  </div>
</ContextMenu>
```

**Gotchas**
- One ContextMenu can wrap a whole list: `@contextmenu` on a row runs before the menu opens, so set `options` there.
- Setting `open` to `true` from the parent does not open it — reka's root keeps a private open state (ContextMenu.vue:99). Use the slot's `setOpen(true)` (opens at the trigger's lower-left, ContextMenu.vue:126).
- Wheel/touch scrolling of the page is blocked while open (ContextMenu.vue:144).
- No attr passthrough; style the element in the slot.

---

## HoverCard

**For** a preview card on hover/focus (person, link). Click → Popover; one-line hint → Tooltip.

**Import** `import { HoverCard } from 'frappe-ui'`

Props: `side='bottom'`, `align='start'`, `offset=4`, `collisionPadding=10`, `hoverDelay=300` ms, `leaveDelay=300` ms, `arrow=false`, `portalTo`, `open` (v-model:open, `false`). Slots `#trigger`, `#default` with `{ open, setOpen, close }`. Exposed `open()`, `close()`.

```vue
<HoverCard>
  <template #trigger><a :href="`/people/${p.name}`">{{ p.full_name }}</a></template>
  <div class="w-64 p-3">…</div>
</HoverCard>
```

**Gotchas**
- Opens on keyboard focus too; touch and screen readers may never show it — never put the only path to an action in it.
- Pointer can move into the card; it stays open while over trigger or card.

---

## Tooltip + TooltipProvider

**For** a short text label on hover/focus. Interactive content → HoverCard/Popover.

**Import** `import { Tooltip, TooltipProvider } from 'frappe-ui'`

| Tooltip prop | Type | Default |
|---|---|---|
| `text` | `string` | `''` |
| `hoverDelay` | ms | `500` |
| `side` | `'top'\|'right'\|'bottom'\|'left'` | `'top'` |
| `offset` | px | `4` |
| `bare` | no dark bubble (arrow stays) | `false` |
| `disabled` | render trigger only | `false` |

Slots: `#default` = **the trigger** (the only overlay where default is the trigger), `#content` = rich content (wins over `text`).
`TooltipProvider` props: `hoverDelay=500`, `skipDelay=300`, `disableHoverableContent=false`.

```vue
<Tooltip text="Delete job"><Button icon="lucide-trash" label="Delete" /></Tooltip>
<TooltipProvider><!-- toolbar: neighbours open instantly --> … </TooltipProvider>
```

**Gotchas**
- No `text` and no `#content` → no bubble at all (Tooltip.vue:60).
- Inside a `TooltipProvider` the Tooltip's own `hoverDelay` is ignored; the provider's applies (Tooltip.vue:36). `SidebarRail` wraps its items in one with `hoverDelay 0`.
- No `align` prop. The trigger must be focusable for keyboard users.
- `Button` has its own `tooltip` prop and joins a surrounding provider.

---

## BottomSheet (+ useSheetDrag)

**For** a mobile modal sliding from the bottom. Desktop → Dialog.

**Import** `import { BottomSheet } from 'frappe-ui'`

Props: `open` (**v-model:open only**, no `modelValue`), `title?` (centered heading = accessible name, else "Bottom sheet"), `dismissible=true` (outside click + Escape + swipe-down). Emits `update:open`, `after-leave`. Slot `#default` (scrolls). No `actions` prop — put buttons in the slot.

```vue
<BottomSheet v-model:open="open" title="Move to">
  <div class="p-4 space-y-2">…<Button label="Move" variant="solid" class="w-full" @click="move" /></div>
</BottomSheet>
```

**Gotchas**
- Height is content-sized up to `90dvh`, then the body scrolls (BottomSheet.vue:24).
- On open the **sheet itself** is focused (prevents the phone keyboard), so `[autofocus]` inside is not honored (BottomSheet.vue:131).
- Drag works from anywhere on the sheet; a drag in a scrolled list scrolls it until it is at top. Closes past 25% of height or at ≥0.5 px/ms (composables/useSheetDrag.ts:14-16). Inputs, textareas, selects, contenteditable and `[data-no-sheet-drag]` never start a drag (composables/useSheetDrag.ts:30).
- `useSheetDrag` is internal — not exported from `frappe-ui` (index.ts:156).
- `update:open` fires when the close starts; reset visible state in `@after-leave`.

---

## Toast

**For** a transient result message (bottom-right). Persistent in-page message → `Alert`.

**Import** `import { toast, ToastProvider, type ToastOptions, type ToastId } from 'frappe-ui'` — needs `<ToastProvider />` (in `FrappeUIProvider`).

| Call | Shows |
|---|---|
| `toast(msg, opts?)` / `toast.message` | no icon |
| `toast.success` / `.error` / `.warning` / `.info` | typed icon |
| `toast.loading(msg)` | spinner, stays until updated |
| `toast.promise(p, { loading, success, error })` | one toast through states; `success`/`error` may be fns returning a string or `{ message, action, … }` |
| `toast.custom(component, opts)` | your component |
| `toast.dismiss(id?)` | one, or all |

Options (vue-sonner `ExternalToast`): `description`, `duration` (ms, default 4000; `Infinity` = until closed), `action: { label, onClick }`, `cancel`, `id` (update in place), `icon: () => VNode`, `onDismiss`… Every call returns its id.

```ts
const id = toast.loading('Uploading…')
try { await upload(); toast.success('Uploaded', { id }) }
catch (e) { toast.error('Upload failed', { id, description: e.message }) }
```

**Gotchas**
- String `message`/`description` are sanitized to `a, em, strong, i, b, u` only (Toast/toast.ts:10): other tags are stripped, so a literal `<` must be written `&lt;`. `toast.promise` state strings are not sanitized (Toast/toast.ts:82).
- Fixed look: bottom-right, max 3 visible, close button; `ToastProvider` takes no props (Toast/ToastProvider.vue:3-7).
- Mount `ToastProvider` before the app content (FrappeUIProvider does) or toasts sent in `setup()` are lost; mount it once or every toast shows twice.

---

## KeyboardShortcutsDialog

**For** the "?" help listing every `useKeyboardShortcut` registration ([navigation.md](navigation.md#usekeyboardshortcut)).

**Import** `import { KeyboardShortcutsDialog } from 'frappe-ui'`

Props: `open` (v-model:open), `title='Keyboard Shortcuts'`, `paddingTop='5vh'`, `searchThreshold=20` (rows, not registrations). Slot `#default {groups}` replaces the grid (`groups: { name, shortcuts: { combo, altCombos, description, group }[] }[]`) — the only public read of the registry.

```ts
const open = ref(false)
useKeyboardShortcut({ combo: 'Mod+Shift+Slash', description: 'Show keyboard shortcuts',
  allowInDialog: true, handler: () => (open.value = !open.value) })
// <KeyboardShortcutsDialog v-model:open="open" />
```

**Gotchas**
- Shortcuts with `enabled` false are hidden as well as inert (composables/useKeyboardShortcut.ts:236).
- Same `group` + `description` merge into one row; later combos become `altCombos` (composables/useKeyboardShortcut.ts:248).
- Renders a `Dialog` size `5xl`, position top; the search clears on close.
- The key chip is `KeyboardShortcut` (`combo`, `altCombos`, `bg`, `showPlus`, `useIcons`).

---

## SettingsDialog family

**For** an app settings modal: grouped tab sidebar left, panel right.

**Import** `import { SettingsDialog, SettingsSidebar, SettingsNavGroup, SettingsNavItem, SettingsContent, SettingsPanel, SettingsHeader, SettingsBody, SettingsRow } from 'frappe-ui'`

| Part | Props / models | Slots |
|---|---|---|
| `SettingsDialog` | `v-model:open`, `v-model:tab` (`string\|number`, optional), `size='4xl'`, `keyboardShortcut='Mod+Shift+,'` \| combo \| `false`, `unmountOnHide=true` | `#default`, `#title` (sr-only, "Settings"), `#description` (sr-only) |
| `SettingsSidebar` | — (reka `TabsList`, vertical) | default |
| `SettingsNavGroup` | `label?` | default, `#label` |
| `SettingsNavItem` | `value` (req, = panel value) | default, `#prefix`, `#suffix` |
| `SettingsContent` | — | default |
| `SettingsPanel` | `value` (req) | default |
| `SettingsHeader` | `title?`, `description?` | default (replaces all), `#actions` |
| `SettingsBody` | — (ScrollArea); exposes `viewportElement` | default |
| `SettingsRow` | `title` (req), `description?`, `labelFor?` | default = the control |

```vue
<SettingsDialog v-model:open="open" v-model:tab="tab">
  <SettingsSidebar>
    <SettingsNavGroup label="Account">
      <SettingsNavItem value="profile">Profile</SettingsNavItem>
    </SettingsNavGroup>
  </SettingsSidebar>
  <SettingsContent>
    <SettingsPanel value="profile">
      <SettingsHeader title="Profile" />
      <SettingsBody>
        <SettingsRow title="Email digests" description="Daily summary"><Switch v-model="digest" /></SettingsRow>
      </SettingsBody>
    </SettingsPanel>
  </SettingsContent>
</SettingsDialog>
```

**Gotchas**
- Built on a **bare** Dialog (SettingsDialog/SettingsDialog.vue:2): there is no close (×) button — Escape, outside click or your own button close it.
- Every mounted SettingsDialog registers a global `Mod+Shift+Comma` toggle that fires even inside inputs and dialogs (SettingsDialog.vue:41, 72); two mounted instances → duplicate-shortcut warning. Pass `:keyboard-shortcut="false"` on extras.
- Tabs use manual activation: arrows move focus, Enter/Space selects (SettingsDialog.vue:13).
- Panels unmount when not selected (SettingsDialog.vue:42) — form state is lost on tab switch unless `:unmount-on-hide="false"`.
- `SettingsRow` turns its title into a `<label for>` automatically when the control has `data-slot="control"`, a switch/checkbox role, or is an input/select/textarea with an id (SettingsRow.vue:37).

---

## usePortalTarget

**For** embedding: send every overlay under a subtree into one container instead of `body`.

**Import** `import { usePortalTarget, providePortalTarget, portalTargetKey, type PortalTarget } from 'frappe-ui'`

- `providePortalTarget(target)` in a component, or `app.provide(portalTargetKey, el)` for the whole app (covers the root too).
- `usePortalTarget(override?)` → `ComputedRef<string|HTMLElement|undefined>`: `override ?? host target ?? undefined` (= reka's `body`) (composables/usePortalTarget.ts:48).
- Gotcha: a wrapper's own `portalTo` prop must stay **undefaulted** — a `'body'` default beats the host target and breaks embedding (composables/usePortalTarget.ts:41).

## vOnOutsideClick

**Import** `import { vOnOutsideClick } from 'frappe-ui'` → `<div v-on-outside-click="close">`.

- Listens to `click` on `document`; fires when the target is outside the element (directives/onOutsideClick.ts:28).
- The handler is read once at `beforeMount`; there is no `updated` hook (directives/onOutsideClick.ts:20-30) — a changed binding keeps the old handler. Bind a stable function.
- Clicks inside a teleported overlay (a Dropdown/Popover opened from inside the element) count as **outside**.

## useAutofocusOnOpen / vFocus

- `useAutofocusOnOpen(isOpen, getContainer)` (composables/useAutofocusOnOpen.ts:40) is **not exported** from `frappe-ui` (absent from index.ts). Consumers use it through `Dialog`: put `autofocus` on the field, or on a wrapper `<div autofocus>` (it walks to the first focusable descendant, composables/useAutofocusOnOpen.ts:54). Works on every reopen, unlike the native attribute.
- `vFocus` is exported: `v-focus` focuses the first focusable descendant on mount; `v-focus:autoselect` also selects text; `v-focus="false"` skips (directives/focus.ts:14).
