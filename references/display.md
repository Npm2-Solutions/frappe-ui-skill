# Display components and icons — frappe-ui 1.1.0

Components that show things rather than take input, plus how icons work end to end: `lucide-*` classes, the `Icon` component, `icon` props, and the `~icons` Vite plugin. Read from `src/components/*`, `src/utils/iconString.ts`, `tailwind/` and `vite/`. Paths are relative to `node_modules/frappe-ui/`.

Sections:
0. [Theme, size and variant values at a glance](#0-theme-size-and-variant-values)
1. [Icons: `lucide-*` classes, `Icon`, icon props, `~icons` plugin](#1-icons)
2. [Alert](#2-alert)
3. [Avatar](#3-avatar)
4. [Badge](#4-badge)
5. [Breadcrumbs](#5-breadcrumbs)
6. [Divider](#6-divider)
7. [Progress](#7-progress)
8. [Skeleton](#8-skeleton)
9. [Spinner / LoadingIndicator](#9-spinner--loadingindicator)
10. [LoadingText](#10-loadingtext)
11. [KeyboardShortcut](#11-keyboardshortcut)
12. [ItemListRow](#12-itemlistrow)

All imports are from the root: `import { X } from 'frappe-ui'`.

---

## 0. Theme, size and variant values

| Component | `theme` values | Default | Unknown value |
|---|---|---|---|
| Button | `gray` `blue` `green` `red` (no amber, no violet) | `gray` | classes dropped, renders unstyled |
| Badge | `gray` `blue` `green` `amber` `red` `violet` | `gray` | falls back to `gray` + dev warning (Badge.vue:93) |
| Alert (`StatusTheme`) | `gray` `blue` `green` `amber` `red` | `gray` | no icon, no tint |
| Avatar (`AvatarTheme`) | `gray` `blue` `green` `amber` `red` `violet` (initial only) | `gray` | no fallback color |
| Spinner | `gray` `red`, or unset to inherit `currentColor` | unset | — |

| Component | `size` | `variant` |
|---|---|---|
| Badge | `sm` (h-4) · `md` (h-5, default) · `lg` (h-6) | `solid` · `subtle` (default) · `outline` · `ghost` |
| Avatar | `xs` 16 · `sm` 20 · `md` 24 (default) · `lg` 28 · `xl` 32 · `2xl` 40 · `3xl` 46px | `shape`: `circle` (default) · `square` |
| Spinner | `xs` 12 · `sm` 14 · `md` 16 · `lg` 20px, or unset to size by class (16px base) | — |
| Progress | `sm` 2px (default) · `md` 4px · `lg` 8px · `xl` 12px bar height | — |
| ItemListRow | `InputSize` `xs`·`sm`(default)·`md`·`lg` (24/28/32/40px min-height) | — |

---

## 1. Icons

### 1a. Class icons: the canonical form
```vue
<span class="lucide-circle-check size-4 text-ink-green-5" aria-hidden="true" />
```
- The `frappe-ui/tailwind` preset registers the Tailwind plugin `tailwind/lucideIconsPlugin.js` (tailwind/preset.js:36). It turns every SVG in `lucide-static/icons/` into a class `lucide-<file-name>`. The installed lucide-static (1.68.0) has 2313 icons.
- Names are lucide's kebab-case file names: `lucide-plus`, `lucide-ellipsis`, `lucide-circle-help`, `lucide-arrow-big-up`.
- Each class draws the SVG as a CSS mask filled with `currentColor` (tailwind/iconPackPlugin.js:82–100):
  - `display: block`, `1em × 1em` by default, `flex-shrink: 0`;
  - the stroke width is normalized to 1.5;
  - it is registered in the components layer, so a `size-*` or `text-*` utility always wins.
- The rule is scoped `:where(:not(svg))`, so `<svg class="lucide-x">` elements rendered by lucide-vue-next are left alone (iconPackPlugin.js:107).

**App setup this needs**: use the preset, and spread frappe-ui's `content` globs into your own config. Tailwind v3 ignores `content` declared in a preset (tailwind/preset.js:7–12, tailwind/content.js):
```js
// tailwind.config.js
import frappeUIPreset, { content } from 'frappe-ui/tailwind'
export default { presets: [frappeUIPreset], content: [...content, './index.html', './src/**/*.{vue,js,ts}'] }
```

**Gotchas**
- **Tailwind generates CSS only for class names that appear literally in scanned files** (iconPackPlugin.js:16). Icon names built at runtime render empty unless the full class string appears somewhere in your source or in a `safelist`. Examples: `` `lucide-${name}` ``, or an icon name stored in a DocType.
- An unknown name, including brand icons removed in lucide v1, produces no CSS at all, so the `<span>` is silently empty (iconPackPlugin.js:40, :81).
- No size class means 1em, which follows the parent's font size.

### 1b. `icon` props on components
Accepted forms everywhere: a `'lucide-*'` string, or a Vue component (an SFC, a `~icons` import, a function component). The rules live in `src/utils/iconString.ts`:

| Value | `Icon` | Select/Combobox/MultiSelect `option.icon` | Button `icon`/`iconLeft`/`iconRight` | Alert `icon` | Switch `icon` |
|---|---|---|---|---|---|
| `'lucide-x'` | `<span class="lucide-x">` | span, `size-4 text-ink-gray-6` | span, sized per button size | span, theme-colored | span |
| emoji `'🚀'` (no ASCII letters or digits) | rendered as text | rendered as text | **nothing**, no warning (Button.vue:283) | nothing | empty span |
| bare name `'plus'`, old feather names | nothing + one dev warning (iconString.ts:35) | nothing, **silent** (shared/selection/OptionIcon.vue) | nothing + one dev warning | nothing + warning | used as a class, which draws nothing |
| Component | `<component :is>` | `<component :is>` | rendered with a height class | rendered | rendered |
| `{ name, theme }` object (removed in 1.0) | renders empty | renders empty | renders empty | renders empty | renders empty |

Only `Dialog` warns about the old object form (iconString.ts:97, Dialog.vue:273); everywhere else it fails silently.

`FeatherIcon` and bare feather names were removed in 1.0.0 (iconString.ts:8). Alert's `icon` also accepts `true` (the theme's auto glyph, same as unset) and `false` (no icon).

### 1c. `Icon` component
**For**: one icon outside an `icon` prop, when the value may be a lucide name, an emoji or a component (for example an icon a user picked).
**Import**: `import { Icon } from 'frappe-ui'`

| Prop | Type | Default |
|---|---|---|
| `icon` | `string \| Component \| null` | — |
| `name` | same, an alias | — |

No slots, no emits. `inheritAttrs: false`, but `class`, `style` and other attributes go onto the rendered element. Every form renders with `aria-hidden="true"`.

```vue
<Icon :icon="space.icon" class="size-4 text-ink-gray-6" />   <!-- 'lucide-folder' or '📁' -->
```

**Gotchas**
- `icon` wins over `name`. An explicit `icon=""` or `:icon="null"` renders nothing; only `undefined` falls back to `name` (Icon.vue:15).
- There are no size or color props; use classes. A lucide class icon is 1em until you size it.
- Since the icon is always `aria-hidden`, a button or link whose only content is an icon needs its own `aria-label`.

### 1d. `~icons/lucide/*` and `<LucideX />` (Vite plugin)
Use this to get real inline `<svg>` components, for example to pass as an `icon` prop or to have per-path stroke control. The plugin is **off by default** (vite/index.js:19).
```js
// vite.config.js
import frappeui from 'frappe-ui/vite'
export default defineConfig({ plugins: [frappeui({ lucideIcons: true }), vue()] })
```
```vue
<script setup>
import LucidePlus from '~icons/lucide/plus'      // explicit import
</script>
<template>
  <LucideArrowRight class="size-4" />            <!-- auto-imported, no import needed -->
  <Button :icon-left="LucidePlus" label="Add" />
</template>
```
- `lucideIcons: true` adds `unplugin-auto-import` and `unplugin-vue-components`, with `IconsResolver({ prefix: false, enabledCollections: ['lucide'] })`, plus the `~icons/lucide/<name>` resolver (vite/lucideIcons.js:7–28).
- `lucideIcons: { componentGlobs: [...] }` limits which files are scanned for auto-imports.
- For the resolver only, without auto-imports: `import { lucideIconsPlugin } from 'frappe-ui/vite/lucideIconsPlugin'`. Then `~icons/lucide/x` resolves, but `<LucideX/>` without an import does not.
- What the generated component renders: `<svg width="24" height="24" stroke="currentColor" stroke-width="1.5">` with your attributes spread on it, so size it with a class (vite/lucideIconsPlugin.js:101–129).
- Names: lucide's export names, converted to kebab-case. Both digit spellings resolve: `bar-chart-2` and `bar-chart2` (lucideIconsPlugin.js:156).
- A missing name renders a placeholder "circle-help" SVG with `data-lucide-missing="<name>"`, and the build logs a warning (lucideIconsPlugin.js:59–68).

### 1e. Other icon sources
- `frappe-ui/icons` exports a few Frappe SVG components: `CircleCheckIcon`, `DownSolidIcon`, `GreenCheckIcon`, `HelpIcon`, `LightningIcon`, `MaximizeIcon`, `MinimizeIcon`, `StepsIcon` (icons/index.ts).
- Sprite icons (`experimental/SpriteIcons`) are parked and scheduled for removal (experimental.ts:83). Do not build on them.

---

## 2. Alert
**For**: an inline status message, optionally with actions. For a transient message use `toast` (overlays reference). For a field error use the input's `error` prop.
**Import**: `import { Alert } from 'frappe-ui'`

| Prop | Type | Default |
|---|---|---|
| `title` | `string` | — |
| `description` | `string`; switches to the banner layout | — |
| `theme` | `'gray'\|'blue'\|'green'\|'amber'\|'red'` | `'gray'` |
| `icon` | `boolean \| 'lucide-*' \| Component`: unset/`true` = auto glyph, `false` = none | — |
| `primaryAction` | `AlertAction` = ButtonProps + `onClick({ dismiss })` | — |
| `secondaryAction` | same; forces the banner layout | — |
| `dismissible` | `boolean`; shows a × button | `false` |

Emits: `dismiss`. Slots: `prefix` (the icon area), `title`, `description`, `actions({ dismiss })`. The root carries `data-layout="row"|"banner"` and `data-color`.

Auto glyphs: `gray`/`blue` use AlertCircleSolid, `green` SuccessSolid, `amber` AlertTriangleSolid, `red` CloseCircleSolid (components/shared/statusIcon.ts:26).

```vue
<Alert v-if="!hidden" theme="amber" title="Drawing revision pending"
  description="Rev C is waiting for approval." dismissible @dismiss="hidden = true"
  :primary-action="{ label: 'Review', onClick: () => router.push(rev.route) }" />
```

**Gotchas**
- **The container never changes color with the theme.** It is always `bg-surface-gray-1` (Alert.vue:176). The theme tints only the icon and the label of the row action.
- `dismiss` only emits the event; the parent must hide the Alert, for example with a `v-if`.
- Layout: a one-line `row` (h-10) unless there is a `description`, a `#description` slot or a `secondaryAction`, which give the stacked `banner` (Alert.vue:36).
- The role is `alert` for `red`/`amber` and `status` for the other themes (Alert.vue:44).
- An async `onClick` shows `loading` on its button and ignores re-clicks until it settles (Alert.vue:87).
- `secondaryAction` without a `primaryAction` logs a dev warning.

---

## 3. Avatar
**For**: a person or workspace, shown as a photo or as the first letter of a name.
**Import**: `import { Avatar } from 'frappe-ui'`

| Prop | Type | Default |
|---|---|---|
| `image` | `string` (URL) | — |
| `label` | `string`; alt text and fallback letter | — |
| `size` | `'xs'\|'sm'\|'md'\|'lg'\|'xl'\|'2xl'\|'3xl'` | `'md'` |
| `shape` | `'circle'\|'square'` | `'circle'` |
| `theme` | `AvatarTheme` | `'gray'` |

Slots: `default` (replaces the initial; sized as an icon box), `indicator` (a dot at the bottom-right corner; the avatar cuts a transparent ring around it).

```vue
<Avatar :image="user.user_image" :label="user.full_name" size="lg">
  <template #indicator><span class="block size-full rounded-full bg-surface-green-5" /></template>
</Avatar>
```

**Gotchas**
- The fallback is **only the first character** of `label`, uppercased (Avatar.vue:24). Pass the full name, not initials.
- After an image fails to load, the failure flag is **never reset**, so a new `image` URL on the same instance still shows the letter (Avatar.vue:48, :7). Add `:key="image"` when the image can change.
- An unprefixed `size-*`, `w-*` or `h-*` class replaces the width and height of the `size` prop. `size` still sets the text size and the indicator size (Avatar.vue:79).
- `theme` colors the fallback letter only, never a photo.

---

## 4. Badge
**For**: a short status or count label. Badges are not clickable; use a Button for an action.
**Import**: `import { Badge } from 'frappe-ui'`

Props: `theme` (`'gray'`), `size` (`'sm'|'md'|'lg'`, `'md'`), `variant` (`'solid'|'subtle'|'outline'|'ghost'`, `'subtle'`), `label: string | number`. Slots: `prefix`, `default` (replaces `label`), `suffix`.

```vue
<Badge :theme="{ Open: 'blue', Closed: 'green', Blocked: 'red' }[job.status]" :label="job.status">
  <template #prefix><span class="lucide-circle size-full" /></template>
</Badge>
```

**Gotchas**
- There is no `icon` prop; put the icon in `#prefix` or `#suffix`. Those wrappers are fixed at `size-2.5`, or `size-3` at `lg` (Badge.vue:115), so give the icon `size-full`.
- Unknown `theme`, `variant` or `size` values fall back to `gray`/`subtle`/`md` with a dev warning, instead of crashing the page (Badge.vue:93).
- It renders a `<div>` with `whitespace-nowrap`, which never wraps.

---

## 5. Breadcrumbs
**For**: the trail above a page (`List / Item`). The page header and shell are in the navigation reference.
**Import**: `import { Breadcrumbs } from 'frappe-ui'`

Prop: `items: BreadcrumbItem[]`, each `{ label: string, route?: RouteDestination, href?: string, onClick?(event), ...any extra field }`. Slots: `prefix({ item })` and `suffix({ item })`, rendered for every crumb.

Each item renders as:
- `route` → `<router-link>`;
- `href` → `<a>` (a plain left click runs `onClick` instead, if one is set);
- neither → a `<button>` that runs `onClick`.

```vue
<Breadcrumbs :items="[{ label: 'Jobs', route: '/jobs' }, { label: job.name }]" />
```

**Gotchas**
- It requires vue-router: it calls `useRouter()` and renders `<router-link>` (Breadcrumbs.vue:104).
- Crumbs are keyed by `label`, so two crumbs with the same label collide (Breadcrumbs.vue:19).
- When the trail overflows and has more than two items, all but the last two move into a "…" dropdown (Breadcrumbs.vue:3). In that menu an item with only `href` does nothing; give it `onClick` or `route`.
- It adds no `<nav>` landmark and no `aria-current`. Wrap it in `<nav aria-label="Breadcrumb">` yourself.

---

## 6. Divider
**For**: a horizontal or vertical rule, optionally with a button on the line ("Show more").
**Import**: `import { Divider } from 'frappe-ui'`

Props:

| Prop | Type | Default |
|---|---|---|
| `orientation` | `'horizontal'\|'vertical'` | `'horizontal'` |
| `align` | `'start'\|'center'\|'end'`; used only with `action` | `'center'` |
| `flexItem` | `boolean`; `self-stretch` in a flex row | — |
| `action` | `DividerAction` = ButtonProps + `label` + `onClick()` | — |

No slots. The action button defaults to `variant="outline" size="sm"`.

**Gotchas**
- A plain divider is an `<hr>` (Divider.vue:16).
- A vertical divider is `h-full` of its own box. Inside a flex row whose items differ in height, add `flex-item`.

---

## 7. Progress
**For**: a determinate progress bar, continuous or in segments.
**Import**: `import { Progress } from 'frappe-ui'`

Props:

| Prop | Type | Default |
|---|---|---|
| `value` | `number`, **0–100 percent** (required) | — |
| `size` | `'sm'\|'md'\|'lg'\|'xl'` | `'sm'` |
| `label` | `string`; also the accessible name | `''` |
| `hint` | `boolean`; shows `value%` on the right | `false` |
| `intervals` | `number` of segments | — |

Slot: `hint` (renders even when `hint` is false).

```vue
<Progress :value="Math.round(done / total * 100)" label="Welds inspected" hint size="md" />
```

**Gotchas**
- The maximum is fixed at 100 (Progress.vue:63). Convert counts to a percent yourself.
- The hint prints the raw `value` followed by `%`, unrounded and unclamped (Progress.vue:16).
- The bar color is always gray-10; there is no theme prop.
- The type comment calls `hint` a "hint/tooltip" (types.ts:11), but **the code renders text, not a tooltip**.

---

## 8. Skeleton
**For**: a pulsing placeholder block shown while data loads.
**Import**: `import { Skeleton } from 'frappe-ui'`

It has no props and no slots. Set the size and shape with classes: `<Skeleton class="h-4 w-48 rounded-4" />` (a numbered step, as NumberCard.vue:114 — bare `rounded` has no CSS), or `class="size-8 rounded-full"` for an avatar. The block is `aria-hidden="true"` (Skeleton.vue:4), so put `aria-busy="true"` on the loading region.

---

## 9. Spinner / LoadingIndicator
**For**: an indeterminate loading mark. `LoadingIndicator` is the same component under its older name (components/LoadingIndicator/index.ts).
**Import**: `import { Spinner } from 'frappe-ui'`

Props: `size` (`'xs'|'sm'|'md'|'lg'`, 12/14/16/20px), `theme` (`'gray'|'red'`; unset inherits the text color), `track` (`boolean`, a faint ring behind the arc). It renders an `<svg role="status" aria-label="Loading">`.

**Gotchas**
- A valid `size` sets **inline** width and height, which beats any `size-*` class. Leave `size` out to size the spinner by class (Spinner.vue:41–56).
- Without `theme`, the spinner takes `currentColor`, so color it with `text-*` on the spinner or on a parent.

---

## 10. LoadingText
**For**: a spinner followed by text, for a loading row.
**Import**: `import { LoadingText } from 'frappe-ui'`

Prop: `text` (`'Loading...'`). It renders a 12px Spinner and the text in `text-base text-ink-gray-4` (LoadingText.vue:3). No slots.

---

## 11. KeyboardShortcut
**For**: **showing** a key combo as text or as key chips. To **bind** a shortcut, use `useKeyboardShortcut` from the root (see the shell/navigation reference).
**Import**: `import { KeyboardShortcut } from 'frappe-ui'`

Props:

| Prop | Type | Default |
|---|---|---|
| `combo` | `string`, e.g. `'Mod+Shift+K'` | — |
| `bg` | `boolean`; `<kbd>` chips | — |
| `showPlus` | `boolean \| 'auto'`; `+` only between two text keys | `'auto'` |
| `altCombos` | `string[]`, shown after `/` | `[]` |
| `useIcons` | `boolean`; arrows, Enter, Backspace, Delete as icons | `true` |

Slot: `default`, shown only when there is no `combo`.

Combo grammar (utils/keyboardShortcutCombo.ts):
- Modifiers first, in any order: `Mod` (⌘ on macOS, Ctrl elsewhere), `Ctrl`, `Alt`, `Shift`.
- Then exactly one key:
  - a letter or `F1`–`F12`;
  - a named key: `Escape`, `Enter`, `Tab`, `Space`, `Backspace`, `Delete`, `Insert`, `ArrowUp`/`Down`/`Left`/`Right`, `Home`, `End`, `PageUp`, `PageDown`;
  - a digit as `Digit0`–`Digit9`;
  - punctuation by name: `Slash`, `Comma`, `Period`, `Minus`, `Equal`, `Plus`, `Semicolon`, `Quote`, `Backslash`, `Backtick`, `BracketLeft`, `BracketRight`.

```vue
<KeyboardShortcut combo="Mod+K" bg />   <KeyboardShortcut combo="Mod+Slash" :alt-combos="['Shift+Slash']" />
```

**Gotchas**
- The old spellings `cmd`, `meta`, `option`, `esc` and `del`, a bare character such as `/`, and a key placed before a modifier are all invalid. They still draw, but log a dev warning, and such a combo would never fire in `useKeyboardShortcut` (keyboardShortcutCombo.ts:4, :448).
- The root is `role="img"` with `aria-label="Shortcut …"` (KeyboardShortcut.vue:6), so its inner chips are not read separately.

---

## 12. ItemListRow
**For**: one row of a custom menu or list that has to match the rows of Dropdown, Select, Combobox and MultiSelect, which all render it.
**Import**: `import { ItemListRow } from 'frappe-ui'`

Props: `as` (`'div'`, any tag or component), `size` (`InputSize`, `'sm'`), `active`, `selected`, `disabled`. Slots: `default` (the label), `label` (wins over `default`), `prefix`, `suffix`. The root carries `data-slot="item-list-row"`, `data-state="active|inactive"` and `data-disabled`.

```vue
<ItemListRow v-for="s in statuses" :key="s" as="button" type="button" :selected="s === current" @click="current = s">
  <template #prefix><span class="lucide-circle size-3" /></template>{{ s }}
</ItemListRow>
```

**Gotchas**
- **No hover of its own**: it styles rest, active/selected (`bg-surface-gray-3`) and disabled only (ItemListRow.vue:33-41); in menus the highlight comes from the menu item around it. Used `as="button"` on its own, add `hover:bg-surface-gray-2` and keep the focus ring — or do what the recipes' sheets do: a raw `<button class="flex w-full items-center gap-2 rounded-6 px-3 py-2.5 text-left" :class="active ? 'bg-surface-gray-3' : 'hover:bg-surface-gray-2'">` (recipe:FilesMobile.vue:681-688, MailMobile.vue:628-635).
- `disabled` only mutes the row. It neither stops clicks nor sets the `disabled` attribute, so skip the action in your handler.
- `active` and `selected` look the same, and the row tracks neither; you drive both.
- It sets no role. Add `role="option"` and `aria-selected` yourself inside a listbox.
- An empty `#prefix`/`#suffix` leaves no gap: it is checked with `hasRenderableContent` (ItemListRow.vue:66).
