# Setup, Vite plugins, Tailwind preset and design tokens (frappe-ui 1.2.0)

What is in this file: how a frappe-ui app is wired (package entries, `frappe-ui/vite`, `frappe-ui/tailwind`, `style.css`), and every design token the preset actually defines — colors, typography, radius, shadows, focus ring, spacing, screens, icons-as-classes, dark mode and `useColorScheme`. Source: `package.json`, `vite/*.js|d.ts`, `tailwind/{preset,plugin,tokens,colorPalette,content,iconPackPlugin}.js`, `tailwind/tokens/*.js`, `src/style.css`, `src/fonts/`, `src/composables/useColorScheme.ts`, `vitepress/css/style.css`.

Sections
1. Package entries
2. Wiring an app (minimal files)
3. Vite plugin `frappe-ui/vite`
4. Tailwind preset `frappe-ui/tailwind`
5. Color tokens
6. Typography
7. Radius
8. Shadows / elevation
9. Focus ring
10. Spacing, sizing, screens, misc utilities
11. Icon classes `lucide-*`
12. Dark mode: `[data-theme="dark"]`, `useColorScheme`, `useResolvedColorScheme`
13. Fonts and `style.css`
14. `frappe-ui/tailwind/tokens` (tokens as data)
15. Gotchas (ranked)
16. Tests, type-check, formatting, symlinked apps, `@framework/ui`

---

## 1. Package entries (`package.json` `exports`)

| Import | Resolves to | Contents |
|---|---|---|
| `frappe-ui` | `src/index.ts` | components, data composables, `dialog`, `toast`, `useColorScheme`, directives, `dayjs`, `upload` |
| `frappe-ui/experimental` | `experimental.ts` | unstable/parked parts (see editors.md §9) |
| `frappe-ui/editor` | `src/molecules/editor/index.ts` | TipTap editor (imports its CSS) |
| `frappe-ui/code-editor` | `src/molecules/code-editor/index.ts` | CodeMirror editor (imports its CSS) |
| `frappe-ui/list` | `src/molecules/list/index.ts` | composable List family |
| `frappe-ui/charts` | `src/charts/index.ts` | ECharts charts (imports `--chart-*` CSS) |
| `frappe-ui/icons` | `icons/index.ts` | 8 Frappe SVG icon components |
| `frappe-ui/tailwind` | `tailwind/index.js` | default export = preset; named `content` globs |
| `frappe-ui/tailwind/tokens` | `tailwind/tokens.js` | tokens as plain data, loadable in Node |
| `frappe-ui/vite` | `vite/index.js` | the Vite plugin (+ `lucideIcons`, `lucideIconsPlugin`, `barrelImports`, `codeLanguages`) |
| `frappe-ui/vite/lucideIconsPlugin` | `vite/lucideIconsPlugin.js` | `~icons/lucide/*` resolver alone |
| `frappe-ui/vitepress` | `vitepress/index.ts` | docs theme — marked UNSTABLE, "do not import from product apps" (`vitepress/index.ts:12-14`) |
| `frappe-ui/style.css` | `src/style.css` | Tailwind directives + Inter font + 2 rules |
| `frappe-ui/tsconfig.base.json` | | `moduleResolution: bundler`, `strict`, `allowImportingTsExtensions`, `noEmit` |

The package ships TypeScript/Vue source (no `dist`): your Vite build compiles it. It leaves out stories, tests, `docs/` and `skills/` (`package.json` `files`): read those in the repo at the tag. 1.2.0 dropped the dependencies `tippy.js` and `@tiptap/starter-kit` (the v0 editor's): declare them if your app imports them. Only the paths above are importable (no deep `frappe-ui/src/...`). Peer ranges: `vue >=3.5`, `tailwindcss >=3.4.2 <4`, `vite >=5`, `vue-router ^4.1.6`; the ten `@codemirror/lang-*` are optional peers.

## 2. Wiring an app

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import frappeui from 'frappe-ui/vite'
export default defineConfig({
  plugins: [frappeui({ frontendRoute: '/myapp' }), vue()],
})
```
```js
// tailwind.config.js
import preset, { content } from 'frappe-ui/tailwind'
export default {
  presets: [preset],
  content: [...content, './index.html', './src/**/*.{vue,js,ts}'],
}
```
```css
/* src/index.css — style.css already contains @tailwind base/components/utilities */
@import 'frappe-ui/style.css';
```
```ts
// src/main.ts
import { createApp } from 'vue'
import { FrappeUI, setConfig, frappeRequest } from 'frappe-ui'
import App from './App.vue'
import './index.css'
setConfig('resourceFetcher', frappeRequest) // only needed for v1 createResource & co (data.md §9)
createApp(App).use(FrappeUI).mount('#app')   // FrappeUI options: { resources?: boolean } only
```
```vue
<!-- App.vue: FrappeUIProvider mounts the Toaster (before the slot) and <Dialogs/> (after) -->
<script setup>
import { FrappeUIProvider, useColorScheme } from 'frappe-ui'
useColorScheme() // first call applies the saved/system scheme to <html data-theme>
</script>
<template>
  <FrappeUIProvider><RouterView /></FrappeUIProvider>
</template>
```
`src/style.css` sets no page background or text color; the docs theme does `body { background-color: var(--surface-base); color: var(--ink-gray-9) }` (`vitepress/css/style.css:41-44`) — do the same (`bg-surface-base text-ink-gray-9`) on your root.

Also wire before the first screen: Vitest, vue-tsc and Prettier settings, a build for an app symlinked into the bench, and Frappe v16's `@framework/ui` if the app uses it — §16.

## 3. Vite plugin `frappe-ui/vite`

`frappeui(options)` returns an array of plugins (`vite/index.js:11-115`).

| Option | Default | What it does |
|---|---|---|
| `frontendRoute` | — | e.g. `'/myapp'`: prints site URLs on dev start, infers `buildConfig.indexHtmlPath = ../<app>/www/<route>.html`, defines `__FRONTEND_ROUTE__` |
| `frappeProxy` | `true` | dev-server proxy to Frappe; `{ port?, source? }` |
| `buildConfig` | `true` | build output for Frappe; `{ outDir?, baseUrl?, indexHtmlPath?, emptyOutDir?, sourcemap? }` |
| `jinjaBootData` | `true` | production `index.html`: injects `{% for key in boot %}window[key] = boot[key]{% endfor %}` before `</body>` |
| `barrelImports` | `true` | dev only, and only when frappe-ui is a linked working copy (`linkedOnly: true`): rewrites `from 'frappe-ui'` to deep imports |
| `codeLanguages` | `true` | stubs `@codemirror/lang-*` packages you did not install so the build passes |
| `lucideIcons` | **`false`** | `true`/`{ componentGlobs }`: auto-import `<LucideArrowRight />` and `~icons/lucide/<name>` (stroke 1.5) |
| `frappeTypes` | `false` | `{ input: { app_name: ['doctype_folder', …] }, output? = 'src/types/doctypes.ts' }` |
| always | | `benchFiles` (resolve `../../sites/...` imports in a bench), `optimizeDeps.include: ['highlight.js/lib/core','reka-ui','vue-sonner','dompurify']` |

Details read from code
- Proxy (`frappeProxy.js`): `source` default `'^/(desk|app|login|api|assets|files|private)'` (README omits `desk`). Frappe port = `FRAPPE_WEB_SERVER_PORT` env, else `common_site_config.json` `webserver_port`, else 8000. Vite port = `8080 + (webserver_port − 8000)` (bench on 8200 → Vite on 8280). The proxy routes by the request's `Host` header (`http://<host>:<webserver_port>`), so open the dev server as `http://<site-name>:<vite-port>`, not `127.0.0.1`. `ws: true`.
- Build (`buildConfig.js`): `outDir` default = `<frappe app>/public/frontend` (found as the sibling folder with `public/` and `hooks.py`); `base` (production only) = `/assets/<app>/frontend/`; `sourcemap` default **`false`** (README says `true`; code wins); production throws when no `indexHtmlPath` (set `frontendRoute` or pass it; `buildConfig.js:54-58`); `index.html` is copied there after the bundle is written. The `frontendRoute` inference needs the bench: it walks up from the frontend folder to a directory with `apps/` and `sites/`, else reads `FRAPPE_BENCH_PATH` (`utils.js:27-49,60-77`, `buildConfig.js:14-21`) — an app symlinked into `apps/` from elsewhere finds none and the build throws; pass `indexHtmlPath` (with `outDir`, `baseUrl`) yourself or set the variable.
- Types (`frappeTypes.js`, `doctypeInterfaceGenerator.js`): runs only under `vite` dev (`mode === 'development'`), in a child process. `input` values are doctype **folder** names (`'sales_order'`): it looks for `doctype/<name>/<name>.json` under `apps/<app>`, since 1.2.0 in one walk of the app that skips `node_modules` and dot folders and does not follow symlinked folders (`doctypeInterfaceGenerator.js:227-268`; it used to take minutes on dev start). Interface name = DocType name without spaces, extending `DocType` (`name, creation, modified, owner, modified_by`) or `ChildDocType`. `Check` → `0 | 1`, `Select` → union of options, `Table` → `<Child>[]`, unknown types → `any`; non-`reqd` fields are optional. `frappeTypes: true` does nothing ("No type generation input specified").
- Boot data (`jinjaBootData.js`): only in builds (`!context.server`); the page must be rendered by Frappe with `context.boot` (e.g. `csrf_token`). In dev nothing is injected, so `window.csrf_token` is unset.

## 4. Tailwind preset `frappe-ui/tailwind`

`preset.js` + `plugin.js`:
- **Replaces** (not extends) Tailwind's `colors`, `fontSize`, `screens`, `borderRadius`, `boxShadow` (`index.d.ts:5-11`). Stock classes from those sections do not exist (`rounded-lg`, `shadow-inner`, `2xl:`, Tailwind's 16px `text-base`).
- `darkMode: ['selector', '[data-theme="dark"]']`; `future.hoverOnlyWhenSupported: true` → `hover:` only applies on devices with a fine pointer (`preset.js:16-23`).
- `theme.extend.spacing` (see §10); `safelist: ['prose', 'prose-v3']`.
- Plugins: `@tailwindcss/forms`, `@tailwindcss/typography`, the theme plugin, the `lucide-*` icon plugin.
- Base layer: `:root` = light CSS variables, `[data-theme="dark"]` = dark variables; `html { font-family: InterVar, <sans> }`; global `:focus-visible { outline: var(--focus-outline-default) }`; `p:not(:where(.prose, .ProseMirror) *) { line-height: 1.5 }`; a chevron background on every `<select>`; list-column rules for `frappe-ui/list`.
- Components layer: `.form-input/.form-textarea/.form-select` (h-7, rounded-4, `bg-surface-gray-2`, `text-base text-ink-gray-8`, focus to `bg-surface-base`), `.form-checkbox`, the `text-<size>-<weight>` classes, `.focus-ring*`, and (1.2.0) `truncate`, `text-ellipsis`, `overflow-ellipsis`, `text-clip`: Tailwind's `textOverflow` core plugin is off and `truncate` is `overflow-x: clip; text-overflow: ellipsis; white-space: nowrap; min-width: 0; min-height: 0` — it no longer clips vertically, so tight line heights keep their descenders; add `overflow-hidden` where `truncate` used to hide extra lines (`plugin.js:201-219,238,251`).
- `content` (`content.js`): globs for `src/**`, `icons/**`, the re-exported `experimental/*` folders and `vitepress/**`. Tailwind v3 does **not** merge a preset's `content`: spread it into yours or frappe-ui's own classes are purged.

## 5. Color tokens

Five semantic categories, each a CSS variable `--<category>-<name>` that flips under `[data-theme="dark"]`. Use them; they need no `dark:` variant. The opacity modifier works (`bg-surface-gray-2/50`) through `color-mix` (`colorPalette.js:84-96`).

| Category | Utilities that accept it (`plugin.js:271-307`) | Names |
|---|---|---|
| `surface` | `bg-`, `fill-`, gradient stops | `base`, `gray-1…10`, `sidebar`, `elevation-1…3`, `{red,blue,green,amber,violet,yellow,orange,teal,cyan,purple,pink}-1…10` |
| `surface-alpha` | `bg-`, gradient stops | `base`, `gray-1…10`, `sidebar`, `elevation-1…3` |
| `ink` | `text-`, `fill-`, `stroke-`, `placeholder-`, gradient stops | `base`, `gray-1…9`, `{11 hues}-1…9`, `blue-link` |
| `outline` | `border-`, `ring-`, `divide-`, gradient stops | `base`, `gray-1…9`, `{11 hues}-1…10`, `elevation-1…2` |
| `outline-alpha` | `border-`, `ring-`, `divide-`, gradient stops | `base`, `gray-1…9`, `elevation-1…2` |

So: `bg-surface-*`, `text-ink-*`, `border-outline-*`. There is no `text-surface-*`, `bg-ink-*`, `bg-outline-*`. Plain `border` = `var(--outline-gray-1)` (`plugin.js:295-299`).

What the gray steps are (light → dark theme), from `tokens/colors.js` `themedVariables`:

| Token | Light | Dark | Typical use |
|---|---|---|---|
| `surface-base` | white | gray-950 | page / card background |
| `surface-gray-1…3` | gray-50/100/200 | gray-900/700/600 | subtle fills, inputs (`gray-2`), hover (`gray-3`) |
| `surface-gray-7…10` | gray-600…900 | gray-300…50 | strong fills: solid gray Button `bg-surface-gray-10 text-ink-base` (`Button.vue:106`), tooltip (`TooltipBubble.vue:54`) |
| `surface-sidebar` | gray-50 | transparent | sidebar |
| `surface-elevation-1/2/3` | white | gray-900/800/600 | 1 = dialog (`Dialog.vue`), 2 = popover/menu/chart card (`PopoverPanel.vue:60`, `ChartCard.vue:22`), 3 = selected item (`SidebarItem.vue:9`, tabs) |
| `ink-gray-9` | gray-950 | gray-50 | strongest text |
| `ink-gray-8…5` | gray-900…600 | gray-100…400 | body → secondary text |
| `ink-gray-4…1` | gray-500…200 | gray-400…800 | muted, placeholder, disabled |
| `ink-base` | **white** | gray-950 | text on a dark/solid fill (inverse) |
| `outline-gray-1…4` | gray-200…500 | gray-800…450 | borders, light → strong |
| `outline-elevation-1/2` | gray-200 | gray-700/600 | border of raised panels |
| `ink-blue-link` | blue-500 | blue-500 | links |

Chromatic: `surface-<hue>-1…10` (1 = palest tint), `ink-<hue>-1…9`, `outline-<hue>-1…10`. Status hues used by the library: red, green, amber, blue, violet (focus-ring colors are those five).

Primitive ramps (`colorPalette.js:54-77`) are also in `theme.colors`: `gray, blue, green, red, orange, amber, yellow, teal, cyan, purple, pink, violet, gray-alpha` × `50…950` (light values), `dark-<family>-*` (dark values; `dark-gray` adds `450`), `white-overlay-*`, `black-overlay-*`, plus `inherit/current/transparent/black/white`. These **do not flip** with the theme — `bg-gray-100` stays light in dark mode. CSS vars: `--gray-500` (light ramps), `--dark-gray-500` (dark ramps).

Removed names (v2 token migration, `migrate-tokens-v2.js:88-131`) that now emit nothing: `surface-white` → `surface-base`, `surface-menu-bar` → `surface-sidebar`, `surface-cards` → `surface-elevation-1`, `surface-modal` → `surface-elevation-2`, `surface-selected` → `surface-elevation-3`, `ink-white` → `ink-base`, `outline-gray-modals` → `outline-elevation-2`. Chromatic `ink-*` were shifted down one step (`--ink-shift`): old `ink-red-2` ≈ new `ink-red-1`.

## 6. Typography

Font sizes (`tokens/typography.js` via `tokens.js:173-193`); each class also sets line-height, letter-spacing and `font-weight: 420`.

| Class | px | line-height | | Class | px | line-height |
|---|---|---|---|---|---|---|
| `text-2xs` | 11 | 1.35 | | `text-5xl` | 26 | 1.6 |
| `text-xs` | 12 | 1.35 | | `text-6xl` | 28 | 1.6 |
| `text-sm` | 13 | 1.35 | | `text-7xl` | 32 | 1.6 |
| `text-base` | **14** | 1.35 | | `text-8xl` | 40 | 1.4 |
| `text-md` | 15 | 1.35 | | `text-9xl` | 44 | 1.4 |
| `text-lg` | 16 | 1.35 | | `text-10xl` | 48 | 1.4 |
| `text-xl` | 17 | 1.35 | | `text-11xl` | 52 | 1.4 |
| `text-2xl` | 18 | 1.35 | | `text-12xl` | 56 | 1.4 |
| `text-3xl` | 20 | 1.35 | | | | |
| `text-4xl` | 24 | 1.35 | | | | |

- Paragraph family `text-p-2xs … text-p-4xl`: same sizes, looser line-height (1.6 for 2xs/xs, 1.5 for sm…2xl, 1.48 for 3xl, 1.4 for 4xl) — use for multi-line copy.
- Weights: `text-<size>-medium|semibold|bold` and `text-p-<size>-medium|semibold|bold` are self-contained classes (size + line-height + weight + the per-weight tracking) (`plugin.js:54-62,97-138`). Prefer them to `text-base font-medium` (works, but keeps regular tracking). `-black` classes were removed.
- Weights: regular **420**, medium 500, semibold 600, bold 700 (`tokens.js:195-200`).
- `leading-tighter` = 1.15 for single-line chrome (`plugin.js:264-270`).
- A bare `<p>` outside `.prose`/`.ProseMirror` gets line-height 1.5 (`plugin.js:156-163`).
- Prose: `prose` (colors from `--ink-gray-*`), `prose-sm`, `prose-v3` (editor style: 15px via `--prose-font-size`, zero paragraph margins, headings 600), `prose-p-spacing` (restores paragraph margins). `prose` and `prose-v3` are safelisted.

## 7. Radius

`rounded-<n>` only (`tokens/radius.js`), also per side (`rounded-t-4`, `rounded-ss-2`…). CSS var `--radius-<n>`.

| `0` | `1` | `2` | `3` | `4` | `5` | `6` | `7` | `8` | `9` | `full` | `none` |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 4px | 5px | 6px | **8px** | 10px | 12px | 16px | 20px | 100px | 9999px | 0 |

No bare `rounded`, no `rounded-sm/md/lg/xl/2xl` (`plugin.js:38-52`). Old → new: `rounded`→`4`, `sm`→`1`, `md`→`5`, `lg`→`6`, `xl`→`7`, `2xl`→`8` (`migrate-tokens-v2.js:226-232`). Bordered boxes in the library use `rounded-4` (`ChartCard.vue:18-22`); `lg` controls, toasts, tree and hovered list rows `rounded-5` (the list writes it `rounded-[10px]`). Which step for what: design.md §1.8.

## 8. Shadows / elevation

`shadow-none`, `shadow-sm`, `shadow` (= `base`), `shadow-base`, `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl` → `var(--elevation-<step>)` (`plugin.js:28-36`, `tokens.js:115-128`). No `shadow-inner`. Only the **light** elevation values ship and they do not change in dark mode (`tokens.js:110-113`). Library patterns: dialog `rounded-7 bg-surface-elevation-1 shadow-xl`; popover/menu `rounded-6 bg-surface-elevation-2 shadow-2xl ring-1 ring-black ring-opacity-5` (`PopoverPanel.vue:60`); card `rounded-4 border border-outline-gray-1 bg-surface-elevation-2` (`ChartCard.vue:22`); selected item `bg-surface-elevation-3 shadow-sm`.

## 9. Focus ring

Global `:focus-visible { outline: var(--focus-outline-default) }` (2px light / 3px dark). Classes: `focus-ring`, `focus-ring-red|green|amber|blue|violet` (outline-based, `plugin.js:77-95`). Remove with `focus-visible:outline-none`, recolor with `focus-visible:focus-ring-red`. Values (`tokens.js` `focusRing`): default `2px solid #c9c9c9e5` light, `3px solid #464646cc` dark — *measured* 1.6:1 on `surface-base` in both themes; a gray `outline-gray-3` is no better (1.7:1), so keep the token rather than hand-picking one.

## 10. Spacing, sizing, screens, misc

- Spacing (`tokens.js:212-230`) extends Tailwind: every integer `1…128` and half step `0.5…19.5`, at 0.25rem per step (`h-17`, `w-30`, `p-7.5`, `size-128` all exist). Tailwind's own `0`, `px` stay.
- Screens: `sm 640px`, `md 768px`, `lg 1024px`, `xl 1280px` only — no `2xl:` (`tokens.js:232-238`). No JS breakpoint helper is exported; read the same widths with VueUse `useBreakpoints` (design.md §2.7).
- `container` has `xl` padding `5rem`.
- List utilities: `list-gap-<spacing>`, `list-row-px-<spacing>` set `--list-gap` / `--list-row-padding-x` for `frappe-ui/list`.

## 11. Icon classes `lucide-*`

The preset adds a component class for every `lucide-static` icon (`tailwind/lucideIconsPlugin.js`, `iconPackPlugin.js`): `<span class="lucide-plus size-4 text-ink-gray-6" />` draws the icon as a CSS mask (`background-color: currentColor`, `display:block`, `1em` square, `flex-shrink:0`, stroke normalized to 1.5). Size with `size-*`, color with `text-*`. Applied only to non-`svg` elements (`&:where(:not(svg))`). Many component props (`icon-left="lucide-plus"`) take these names.
- Tailwind JIT only emits classes it finds as full strings in scanned files: `` `lucide-${name}` `` built at runtime renders nothing. Write the full class name somewhere scanned (or safelist it).
- An unknown name emits no CSS (`iconPackPlugin.js:81`).

## 12. Dark mode

- Tokens flip by variables on `[data-theme="dark"]` (`plugin.js:225-229`); `dark:` variants also key on that selector. Tailwind's `.dark` class is **not** used by the CSS.
- `useColorScheme()` (`src/composables/useColorScheme.ts`), from `frappe-ui`, singleton:

| Member | Type | Notes |
|---|---|---|
| `colorScheme` | `Readonly<Ref<'light'\|'dark'\|'system'>>` | the preference |
| `resolvedColorScheme` | `Readonly<Ref<'light'\|'dark'>>` | what is painted; follows the OS under `system` |
| `setColorScheme(s)` | | sets `<html data-theme>`, saves `localStorage.theme`, mutes transitions for 2 frames via `.no-transition` |
| `toggleColorScheme()` | | flips what is on screen (not the stored preference) |

  The first call restores `localStorage.theme` or defaults to **`'system'`** and starts the OS listener (`useColorScheme.ts:128-142`). Until something calls it, nothing sets `data-theme` and the page renders light.
- `useResolvedColorScheme()` — read-only observer of `data-theme`, then `.dark` class, then OS; writes nothing; for code that must not own the scheme.
- `ThemeSwitcher` is deprecated and parked in `frappe-ui/experimental`; build the control from `Select` + `useColorScheme`.
- Charts re-resolve their `--chart-*` colors on a scheme change (charts.md).

## 13. Fonts and `style.css`

- `src/style.css`: `@import './fonts/Inter/inter.css'`, `@tailwind base; components; utilities`, `.no-transition *{transition:none!important}` (used by `setColorScheme`), and an iOS standalone `html { min-height }` fix for `MobileShell`.
- `inter.css`: `InterVar` and `Inter` families (normal + italic) from `Inter.var.woff2` / `Inter-Italic.var.woff2`, weights 100–900, `font-display: swap`, Latin/Greek/Cyrillic/Hebrew/CJK/Hangul ranges.
- Base: `html { font-family: InterVar, <tailwind sans>; font-optical-sizing: auto }` and `font-variation-settings: 'opsz' 24, 'cv11' 1` on `html, body, button, p, span, div` (`plugin.js:140-149`).
- Sub-entries bring their own CSS when imported: `frappe-ui/editor`, `/code-editor`, `/list`, `/charts`.

## 14. `frappe-ui/tailwind/tokens`

Plain data, no Tailwind import, usable in Node (`tokens.js`): `colors` (`light`, `dark`, `overlay`, `neutral` ramps), `semanticColors.light|dark[category][name]` (resolved `oklch(...)`), `radius`, `shadows`, `focusRing.light|dark`, `fontSize` (`base`, `p-base`, …), `fontWeight`, `fontFamily` (`{ text: 'Inter Variable' }`), `tracking`, `spacing`, `screens`, `cssVariables.light|dark`. Additive-only until 2.0.

## 15. Gotchas (ranked)

1. Old names emit nothing, silently: `rounded-lg`, `rounded`, `shadow-inner`, `2xl:`, `bg-surface-white`, `bg-surface-cards`, `text-ink-white`, `border-outline-gray-modals` (`plugin.js:38-52`, `migrate-tokens-v2.js:88-131`).
2. `text-base` is 14px and `text-lg` 16px (preset replaces Tailwind's scale); body copy is `text-base`/`text-p-base`.
3. Category ↔ utility is fixed: `bg-surface-*`, `text-ink-*`, `border-outline-*` (`plugin.js:271-307`).
4. Primitive ramps (`bg-gray-100`, `text-red-600`) do not flip in dark mode; only semantic tokens do.
5. `content` from the preset is ignored by Tailwind v3 — spread `content` from `frappe-ui/tailwind` (`preset.js:7-11`).
6. Dynamic `lucide-${x}` class names are not generated (JIT, `iconPackPlugin.js:16-17`).
7. Nothing sets `data-theme` until `useColorScheme()` runs; first run defaults to `system` (`useColorScheme.ts:133-135`).
8. Shadows are light-only; in dark mode lean on `surface-elevation-*` + `outline-elevation-*`.
9. Vite dev: open `http://<site>:<8080 + port offset>`; the proxy routes by Host (`frappeProxy.js:16-41`). `window.csrf_token` exists only in Frappe-rendered builds (`jinjaBootData.js:5`).
10. `frappeTypes.input` takes doctype folder names and only runs under `vite` dev (`frappeTypes.js:15`, `doctypeInterfaceGenerator.js:262-268`).
11. `truncate` clips only horizontally since 1.2.0 (`plugin.js:208-215`): code that relied on it to cut a second line, or on an inline-block `truncate`'s old vertical position, needs `overflow-hidden`.

## Dates: `dayjs`, `dayjsLocal`, `dayjsSystem` (`src/utils/dayjs.ts`)

`import { dayjs, dayjsLocal, type Dayjs } from 'frappe-ui'` — `dayjs` is the library with the plugins frappe-ui extends once (updateLocale, relativeTime, localizedFormat, isToday, duration, utc, timezone, advancedFormat, customParseFormat; `dayjs.ts:20-28`): use it, never a second dayjs import, so `fromNow()`, `format('LL')` and `.tz()` work everywhere.

| Function | Reads | Answers |
|---|---|---|
| `dayjsLocal(s?)` | `s` as the server's time (`setConfig('systemTimezone')`) | the same instant in the viewer's zone (`setConfig('localTimezone')`, else the browser's) — for showing a server datetime (`dayjs.ts:34-42`) |
| `dayjsSystem(s?)` | `s` as the viewer's time | the instant in the server's zone — for sending (`dayjs.ts:44-52`; not exported from the root, `DateTimePicker` uses it) |

Gotcha: with no `systemTimezone` configured both are plain `dayjs(s)` — no conversion at all (`dayjs.ts:38,48`). A Frappe app that shows server datetimes across time zones calls `setConfig('systemTimezone', <the site's time zone>)` at boot.

## 16. Tests, type-check, formatting, symlinked apps, `@framework/ui`

Found while building a Frappe v16 app (Frappe 16.60) on frappe-ui 1.2.0; checked against the source, and the Vitest, vue-tsc and Prettier ones reproduced.

**Vitest.** In Node, `import … from 'frappe-ui'` fails: Vitest inlines frappe-ui's `.ts`/`.vue` files but hands its `.js` files to Node, and `resources/plugin.js:2` imports `'./resources'` without an extension → «Cannot find module …/src/resources/resources imported from …/src/resources/plugin.js». Either mock it in tests of app logic (`vi.mock('frappe-ui', () => ({ call: vi.fn(), toast: { success: vi.fn(), error: vi.fn() } }))` in a setup file), or let Vite transform all of it:
```ts
// vite.config.ts (the Vue plugin must be in the same config: frappe-ui is .vue source)
test: { environment: 'jsdom', server: { deps: { inline: ['frappe-ui'] } } }
```

**vue-tsc and `frappe-ui/experimental`.** The subpath is one barrel (`experimental.ts`); importing any name type-checks all of it. `experimental/ListView/index.ts:2-24` carries twelve `@ts-expect-error` lines for its JS SFCs; an app whose `env.d.ts` declares `declare module '*.vue'` types those imports, the directives go unused, and vue-tsc reports `TS2578 Unused '@ts-expect-error' directive` from `node_modules` (`skipLibCheck` does not cover `.ts` source). Drop the shim (vue-tsc reads `.vue` files itself), or point the subpath at the folder you use — the package exports no `frappe-ui/experimental/*`, so this is for the type-checker only; Vite still resolves the barrel:
```jsonc
// tsconfig.json
"paths": { "frappe-ui/experimental": ["node_modules/frappe-ui/experimental/CommandPalette/index.ts"] }
```

**Symlinked app.** `frappe-ui/vite` infers `indexHtmlPath` from the bench layout (§3); an app symlinked into `apps/` from elsewhere has no bench above its real path and `vite build` throws «indexHtmlPath is required». Pass all three:
```js
frappeui({ frontendRoute: '/myapp', buildConfig: {
  outDir: '../myapp/public/frontend', indexHtmlPath: '../myapp/www/myapp.html', baseUrl: '/assets/myapp/frontend/' } })
```
or run with `FRAPPE_BENCH_PATH=/path/to/bench` (`vite/utils.js:36-47`), which the proxy port and `frappeTypes` also need.

**Prettier.** A new Frappe app copies Frappe's `.editorconfig` to its root (Frappe `frappe/utils/boilerplate.py:192`), with `indent_style = tab`, `indent_size = 4`, `max_line_length = 99` for `*.js,*.vue,*.css`. Prettier reads it, so `prettier --write` turns the frontend to tabs. `.prettierrc` wins over `.editorconfig`: set `"useTabs": false, "tabWidth": 2` (and `printWidth` if 99 is not wanted), or add a `[frontend/**]` section with `indent_style = space`, `indent_size = 2`.

**`@framework/ui` (Frappe v16).** Frappe ships a shared Vue package in `apps/frappe/ui` (name `@framework/ui`, never on npm): link fields, form layout, filters, list view, activity timeline, built on frappe-ui and shipped as raw `.vue`/`.ts` like it. An app adds it with `"@framework/ui": "link:../../frappe/ui"`, then:
- `frappeui({ lucideIcons: true })`: its components import `~icons/lucide/*` (`src/components/ActivityTimeline/LogItem.vue`), which frappe-ui resolves only with that option (`vite/index.js:15-19,44-46`).
- `frameworkUI()` from `@framework/ui/vite` beside `frappeui()`: it dedupes `vue`, `vue-router`, `frappe-ui`, `reka-ui`, `dompurify` and resolves the package's own dependencies from the host app.
- Imports: the root `@framework/ui`, a named subpath (`/FormLayout`, `/fields`, `/utils`, `/ListView`…), or a full file path. The catch-all `./*` export maps to `./src/*` with no index resolution, so `@framework/ui/components/Fields` (a folder) does not resolve.
- Types: its source does not pass a `strict` vue-tsc (implicit `any`, unchecked `undefined`), and a `paths` entry pointing at it makes the app's type-check fail. Map `@framework/ui` and `@framework/ui/*` in `paths` to a hand-written `.d.ts` that declares what the app uses.

