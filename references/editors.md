# Editors, experimental and icons (frappe-ui 1.2.0)

What is in this file: the rich-text editor `frappe-ui/editor` (TipTap 3: `Editor`, `useEditor`, `EditorContent`, menus, kits, extensions, mentions, uploads), the code editor `frappe-ui/code-editor` (CodeMirror 6) briefly, what `frappe-ui/experimental` exports and in what state, and `frappe-ui/icons`. Source: `src/molecules/editor/`, `src/molecules/code-editor/`, `experimental.ts`, `experimental/*/index.ts`, `icons/index.ts`.

Sections
1. Rich text: pick the pieces
2. `Editor` (component) and `useEditor`
3. `EditorContent`, menus, drop zone
4. Kits: CommentKit, RichTextKit, InlineKit
5. Extensions and triggers (mentions, tags, slash, emoji)
6. Uploads
7. Menu items and toolbar presets
8. Code editor `frappe-ui/code-editor`
9. `frappe-ui/experimental`
10. `frappe-ui/icons`
11. Gotchas (ranked)

---

## 1. Rich text: pick the pieces

**For** — comments, descriptions, notes, articles. The v0 `TextEditor` (one component with `fixedMenu`/`bubbleMenu` props) was removed from `frappe-ui/experimental` in 1.2.0 — an import of it fails at build time; use the composable editor below (`docs/content/docs/migration.md`, section Editor).
**Import** — `import { Editor, EditorContent, EditorFixedMenu, EditorBubbleMenu, EditorFloatingMenu, EditorTableMenu, EditorDropZone, useEditor, RichTextKit, CommentKit, InlineKit, articleToolbar, commentToolbar, minimalToolbar, tableToolbar } from 'frappe-ui/editor'` (importing the entry also loads its CSS, `index.ts:4`).

`<Editor>` is **renderless** (`Editor.vue:112-119`): it owns the TipTap instance, `v-model`, placeholder and upload wiring, and renders only its slot. You place `EditorContent` and any menus inside; they find the editor through provide/inject.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { upload } from 'frappe-ui'
import {
  Editor, EditorContent, EditorFixedMenu, EditorBubbleMenu,
  RichTextKit, articleToolbar, minimalToolbar, type UploadFunction,
} from 'frappe-ui/editor'

const html = ref<string | null>('<p>Hello</p>')
const people = ref([{ label: 'Jane Doe', value: 'jane@example.com' }])
const extensions = [RichTextKit.configure({ mention: { items: people } })]
const uploadFunction: UploadFunction = (file, opts) =>
  upload(file, { doctype: 'Task', docname: 'TASK-0001', ...opts }) // resolves { file_url, … }
</script>

<template>
  <Editor v-model="html" :extensions="extensions" placeholder="Write something…"
          :upload-function="uploadFunction">
    <div class="rounded-4 border border-outline-gray-2">
      <EditorFixedMenu :items="articleToolbar" class="border-b px-2 py-1" />
      <EditorContent class="min-h-40 px-3 py-2" />
    </div>
    <EditorBubbleMenu :items="minimalToolbar" />
  </Editor>
</template>
```

## 2. `Editor` and `useEditor`

`Editor` props (`Editor.vue:13-37`)

| Prop | Type | Default | Reactive? |
|---|---|---|---|
| `v-model` | `string \| JSONContent \| null` | — | yes, both ways (external writes are kept out of undo history) |
| `extensions` | TipTap `Extensions` | **required** | **no** — read once at setup |
| `format` | `'html'\|'json'\|'markdown'` | `'html'` | no |
| `placeholder` | string | — | yes (needs the `Placeholder` extension, which every kit includes) |
| `editable` | boolean | `true` | yes |
| `autofocus` | boolean | `false` | no |
| `uploadFunction` | `(file, { signal?, onProgress? }) => Promise<{ file_url, … }>` | — | no |

Emits: `change(value)` on every document update (same value as v-model), `focus(e)`, `blur(e)`, `transaction(editor)`.
Slot: default `{ editor: TiptapEditor | null, isEmpty: boolean }`.
Exposed (template ref): `{ editor, isEmpty }` (`Editor.vue:98`).

`useEditor(options)` → `ShallowRef<TiptapEditor | null>` (`useEditor.ts:63`): options `content` (a Ref), `format`, `editable` (MaybeRefOrGetter), `autofocus`, `uploadFunction`, `extensions`, `onUpdate`, `onFocus`, `onBlur`, `onTransaction`. Created with `element: null` (no DOM until an `EditorContent` mounts it), destroyed `onBeforeUnmount`. Use it when the editor must be created outside `<Editor>`; pass `:editor="editor"` to the parts.

- `format: 'markdown'` needs `Markdown` in `extensions` (dev warning otherwise, `useEditor.ts:81-89`).
- An extension named `collaboration` disables the v-model sync (`useEditor.ts:68-70,112`).

## 3. `EditorContent`, menus, drop zone

| Part | Props | Notes |
|---|---|---|
| `EditorContent` | `editor?` (else injected) | the ProseMirror element. Adds `prose max-w-none prose-v3`; a `prose-sm\|base\|lg\|xl\|2xl` in your `class` drops `prose-v3` (`EditorContent.vue:45-50`). Classes are synced with `classList`, so ProseMirror's own classes survive. Font size: `class="[--prose-font-size:1rem]"` |
| `EditorFixedMenu` | `editor?`, `items: MenuItem[]`, `size?: 'xs'\|'sm'` | a `flex items-center gap-1` toolbar |
| `EditorBubbleMenu` | `editor?`, `items`, `options?: EditorMenuOptions` | floats on the selection; default side `top` |
| `EditorFloatingMenu` | `editor?`, `items`, `options?` | on empty lines; default side `right` |
| `EditorTableMenu` | `editor?` | table toolbar shown while the selection is in a table (editable only) |
| `EditorDropZone` | `editor` (**required, not injected**), `disabled?`, `label?` = `'Drop files to upload'` | overlay for dropping files; wraps its slot |

`EditorMenuOptions` (`menu.ts:86-110`): `side`, `align`, `strategy`, `offset`, `flip`, `shift`, `hide`, `inline`, `scrollTarget`, `shouldShow(ctx)`.

## 4. Kits (`kits.ts`)

A kit is one TipTap extension that adds a bundle; configure each member with options, `{}` to keep it, `false` to remove it.

| Member | CommentKit | RichTextKit | Notes |
|---|---|---|---|
| `starterKit` (frappe StarterKit + `Code` + `CodeBlock`) | on | on | `StarterKitOptions` members: `blockquote, bold, bulletList, document, dropcursor, gapcursor, hardBreak, horizontalRule, italic, listItem, listJoin, listKeymap, orderedList, paragraph, strike, text, trailingNode, underline, undoRedo` (`extensions.ts:105-125`) |
| `heading` | on | on | top-level member; setting it inside `starterKit` is a type error |
| `placeholder`, `link` | on | on | |
| `image`, `imageGroup`, `imageViewer`, `video`, `attachment` (+ `MediaDrop`) | on | on | need an upload function to accept files (§6) |
| `table` (+ row/cell/header, navigation, cell color, selection overlay) | **off** | on | `CommentKit.configure({ table: {} })` to enable |
| `contentPaste`, `emoji` | on | on | |
| `mention`, `tag` | on but **inert** | on but inert | `{ items }` wires the `@` / `#` list (§5) |
| `taskList`, `iframe`, `slashCommands`, `color` (+ `TextStyle`), `highlight`, `typography`, `textAlign` | — | on | |
| `toc`, `styleClipboard` | — | off | opt in with `{}` |

`InlineKit` — single-line editor (the doc holds one block, Enter does nothing): `starterKit: { bold?, italic?, strike?, underline?, code?, dropcursor?, gapcursor?, undoRedo? }` (each only `false`), `placeholder`, `link`.

## 5. Extensions and triggers

Exported extensions (`extensions.ts`, `index.ts:42-101`): `StarterKit, EditorDropcursor, Placeholder, setPlaceholder, Heading, HeadingIds, Toc, Link, Code, CodeBlock, ListJoin, TaskList, TaskItem, Typography, Markdown, Table, TableRow, TableCell, TableHeader, TableNavigation, TableCellColor, TableSelectionOverlay, TextAlign, TextStyle, Color, Highlight, Image, ImageGroup, ImageViewer, Video, Attachment, MediaDrop, Iframe, Mention, Tag, Emoji, SlashCommands, ContentPaste, StyleClipboard, SuggestionExtension`.

| Trigger | Extension | Items |
|---|---|---|
| `@` | `Mention.configure({ items, nodeView? })` | `MaybeRefOrGetter<{ label, value, …extra }[]>`; filtered locally by `label`, first 10 (`mention-extension.ts:162-172`). Inserted as `<span class="mention" data-type="mention" data-id="<value>" data-label="<label>">@label</span>`. `editor.commands.getMentions()` → `[{ value, label }]`. `@` opens after a space, NBSP or opening bracket/quote |
| `#` | `Tag.configure({ items })` | `{ label, value? }[]` |
| `/` | `SlashCommands.configure({ items? })` | default: built-in registry; `items: CommandItem[]` (`{ title, icon, group?, isAvailable?, command({ editor, range }) }`) **replaces** it; `false` in a kit removes it |
| `:` | `Emoji` | built-in list |

`Iframe.configure({ allowlist })` replaces the embed host list (`IFRAME_ALLOWLIST`: YouTube, Vimeo, Figma, Google Docs/Drive, Notion, CodePen…, `extensions/iframe/iframe-allowlist.ts:22`). Since 1.2.0 the check runs on every way content arrives — HTML, JSON `v-model`, `setContent`, a collaborator — and an embed on the app's own origin is refused even when its host is listed (`iframe-allowlist.ts:91-111`): to embed your own pages, link them. Pasted HTML and markdown are parsed in a separate document, so their event handlers never run.

`Mention.component` was removed; use `nodeView` (`mention-extension.ts:203-205`). Without `items` (or `items: null`) the mention node still renders existing mentions, but `@` opens nothing.

## 6. Uploads

- `UploadFunction = (file: File, options?: { signal?: AbortSignal; onProgress?: (p: { loaded, total, percent }) => void }) => Promise<UploadedMedia>`; `UploadedMedia` needs a safe `file_url` (`media-upload-types.ts`, `media-upload-engine.ts:95-111`).
- Source order: the extension's own `uploadFunction` (e.g. `Image.configure({ uploadFunction })`) wins over the `Editor`/`useEditor` one (`media-upload-engine.ts:66-90`).
- No upload function → dropping/pasting/inserting an image, video or file logs `uploadFunction option is not provided` and does nothing (`media-upload-engine.ts:185-187`). The v0 `TextEditor` (removed in 1.2.0) had a built-in default; `Editor` has none.
- frappe-ui's `upload(file, { doctype, docname, fieldname, folder, private, signal, onProgress, … })` matches the shape and resolves `{ file_url, file_name, … }`; `private` defaults to **true** (`useFileUpload.ts:34`).

## 7. Menu items and presets (`menu.ts`)

`MenuItem = CommandMenuItem | { type: 'group', label, icon?, items } | { type: 'separator' }`; `CommandMenuItem = { label, icon?: 'lucide-…' | Component, action(editor, ctx?), isActive?, isDisabled?, isAvailable?, getLabel?, component? }`. Items whose `isAvailable` returns false are hidden, so presets adapt to the kit (`MenuItems.vue:68-71`).

Ready items: `Bold, Italic, Strike, InlineCode, Paragraph, H1…H6, HeadingGroup (H2–H4), BulletList, OrderedList, Blockquote, HorizontalRule, AlignLeft, AlignCenter, AlignRight, FontColor, FontHighlight, InsertImage, InsertVideo, InsertAttachment, InsertLink, InsertIframe, InsertTable, Undo, Redo, Separator`, table items `TableAddColumnBefore/After, TableDeleteColumn, TableAddRowBefore/After, TableDeleteRow, TableToggleHeaderRow, TableMergeOrSplit, TableDelete, CellColor`.

Presets: `minimalToolbar` = Bold, Italic, Link · `commentToolbar` = Bold, Italic, Strike | BulletList, OrderedList, Link · `articleToolbar` = Heading | Bold, Italic, Strike | BulletList, OrderedList, Blockquote, Link, Image, Table · `tableToolbar`.

Custom item: `{ label: 'Clear', icon: 'lucide-eraser', action: (e) => e.chain().focus().clearContent().run() }`.

## 8. Code editor `frappe-ui/code-editor`

**For** — JSON, SQL, Python, HTML… fields. **Import** — `import { CodeEditor, CodeEditorContent, CodeKit, loadLanguage, useCodeEditor, codeChrome, codeHighlight, codeKeymap } from 'frappe-ui/code-editor'`.

- `CodeEditor` (renderless, `CodeEditor.vue`): `v-model` string (default `''`), `extensions: Extension[]` (required, **reactive** — reconfigures without losing document/undo), `editable` (true), `autofocus` (false). Emits `change(value)` **on blur after an edit** (v-model updates on every keystroke), `focus`, `blur`. Slot `{ editor: EditorView | null }`. Exposed `{ editor }` (the `EditorView`).
- `CodeEditorContent`: `editor?` (else injected); emits `overflow(boolean)` and sets `data-overflowing` when content crosses its height cap.
- `CodeKit` — pass as is or `CodeKit.configure({ lineNumbers: {}, foldGutter, autocompletion, search, placeholder: 'text', chrome, highlight, keymap })`; members default: `lineNumbers: false`, `placeholder: false`, the rest on (`code-editor/kit.ts:76-87`). `chrome` adds the `frappe-code` class that the shipped CSS styles.
- `loadLanguage(key)` → `Promise<Extension | null>`: `json, html, javascript, python, sql, markdown, css, scss, yaml, xml`; packages are optional peers — install the ones you use (the Vite `codeLanguages` plugin stubs the rest; a stub throws `yarn add @codemirror/lang-…`).

```vue
<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { CodeEditor, CodeEditorContent, CodeKit, loadLanguage } from 'frappe-ui/code-editor'
const code = ref('{}')
const lang = shallowRef<any>(null)
loadLanguage('json').then((ext) => (lang.value = ext))
</script>
<template>
  <CodeEditor v-model="code" :extensions="[CodeKit, ...(lang ? [lang] : [])]" @change="save">
    <CodeEditorContent class="max-h-80" />
  </CodeEditor>
</template>
```

## 9. `frappe-ui/experimental` (`experimental.ts`)

"UNSTABLE. No backward-compatibility promise" (`experimental.ts:1`). Its directories are already in the preset's `content` globs.

| Export | Status (from the source comments) |
|---|---|
| `Accordion` | incubating |
| `FloatingWindow`, `useFloatingWindow` | incubating |
| `MultiEmailInput` (+ `isValidEmail`, `emailRegex`, `splitEmailTokens`, `extractEmail`) | incubating |
| `Stepper` | incubating, API under review |
| `InputLabel`, `InputDescription`, `InputError`, `useInputLabeling`, `inputFontSizeClasses` | internal input parts exposed |
| `Calendar` (+ `CalendarColorMap`, `CalendarActiveEvent`, `calendarDaySpan`) | parked, API unchanged, until a redesigned calendar |
| v1 charts `AxisChart`, `DonutChart`, `ECharts`, `FunnelChart`, `NumberChart`, `useAxisChartOptions` (`config` prop) | parked while apps move to `frappe-ui/charts` |
| `CommandPalette` + `Input`, `List`, `Group`, `Item`, `Empty`, `Footer` | rebuilt family, unstable (below) |
| `DateCalendar`, `DateRangeCalendar`, `PickerShell` | incubating |
| `List`/`ListView` + `ListHeader`, `ListHeaderItem`, `ListRows`, `ListRow`, `ListRowItem`, `ListGroups`, `ListGroupHeader`, `ListGroupRows`, `ListSelectBanner`, `ListEmptyState`, `ListFooter` | parked until `frappe-ui/list` reaches parity |
| `ThemeSwitcher` | deprecated (`warnDeprecated`): use `Select` + `useColorScheme` |
| `Icon`, `IconPicker`, `spritePlugin` (sprite icons) | parking spot, "will be removed"; `Icon` warns when the sprite is missing |

Gone in 1.2.0: `TextEditor`, `TextEditorBubbleMenu`, `TextEditorFixedMenu`, `TextEditorFloatingMenu`, `TextEditorContent`, `createEditorButton`, `ImageExtension`, `createSuggestionExtension` and their types (the v0 editor; parked here in 1.0.0 and 1.1.0). `IconPicker` now draws its icons in theme ink, so they show in dark mode.

Name clashes: experimental `Icon` ≠ root `Icon`; experimental `List` ≠ `frappe-ui/list` `List`; experimental `DonutChart`/`FunnelChart` ≠ `frappe-ui/charts` ones.

The subpath is one barrel: importing any name type-checks every folder, and with a `declare module '*.vue'` shim in the app vue-tsc reports `TS2578` from `experimental/ListView/index.ts:2-24` — workarounds in setup-and-tokens.md §16.

**CommandPalette** (`experimental/CommandPalette/`, docs in its `CommandPalette.md`): `CommandPalette v-model:open @select` > `CommandPaletteInput`, `CommandPaletteList` > `CommandPaletteGroup label` > `CommandPaletteItem :value`, then `CommandPaletteEmpty`, `CommandPaletteFooter` beside the list. It registers no shortcut: add `useKeyboardShortcut({ combo: 'Mod+K', allowInInput: true, handler })`. Items filter on their default-slot text (`#prefix`/`#suffix` are not searched; `keywords` adds aliases); `:filterable="false"` for server search.
- `#prefix` sits flush against the label: the item is `flex items-center` with no gap (`CommandPaletteItem.vue:16-26`). Give the icon its own margin, as frappe-ui's story does: `<span :class="[icon, 'mr-3 size-4 text-ink-gray-7']" />` (`experimental/CommandPalette/stories/Default.vue:74`; stories ship only in the repo).
- `as="a"` + `href` renders a real link (modifier-click opens a tab); since 1.2.0 the `href` is kept only when relative or `http(s)`/`mailto`/`tel` (`CommandPaletteItem.vue:17,181-183`).
- A pick closes the palette; `event.preventDefault()` in `@select` keeps it open.

## 10. `frappe-ui/icons`

Exports exactly eight components (`icons/index.ts`): `CircleCheckIcon`, `DownSolidIcon`, `GreenCheckIcon`, `HelpIcon`, `LightningIcon`, `MaximizeIcon`, `MinimizeIcon`, `StepsIcon`. Plain SVGs with fixed `width`/`height` attributes and `fill="currentColor"`, no props — size with a class (`class="size-4"`), color with `text-ink-*`. The other `.vue` files in `icons/` (`AlertCircleLineIcon`, `SuccessSolidIcon`, …) are not exported and not importable (no deep `exports` path). For everything else use `lucide-*` classes or the root `Icon` (setup-and-tokens.md §11).

## 11. Gotchas (ranked)

1. `<Editor>` renders nothing by itself — without an `<EditorContent>` in its slot there is no editing area (`Editor.vue:112-119`).
2. `extensions`, `format`, `uploadFunction`, `autofocus` are read once at setup (`Editor.vue:57-63`); changing them later does nothing — remount (`:key`) instead.
3. In `frappe-ui/editor`, `Bold`, `Italic`, `Strike`, `Paragraph`, `Blockquote`, `BulletList`, `OrderedList`, `HorizontalRule`, `H1`… are **menu items** (`index.ts:104-157`), not TipTap extensions — never put them in `extensions`; marks come from a kit.
4. No `uploadFunction` → image/file drop and paste silently do nothing but log (`media-upload-engine.ts:185-187`).
5. Mentions are inert until `mention: { items }` is given; items are filtered locally (top 10 by label), there is no server query hook (`mention-extension.ts:162-213`).
6. `EditorDropZone` needs `:editor` explicitly; the other parts inject it (`components/EditorDropZone.vue:27-35`).
7. `EditorContent` drops `prose-v3` when you add a `prose-<size>` class; `text-*` utilities on it fight `prose-v3` line-height (`EditorContent.vue:30-50`).
8. Rich `Editor` emits `change` on every update; `CodeEditor` emits `change` only on blur after an edit (`useCodeEditor.ts:118-134`).
9. CommentKit has no tables; RichTextKit has no TOC or format painter until opted in (`kits.ts:153-168,248-265`).
10. `frappe-ui/experimental` has no compatibility promise and reuses names from the stable entries.
