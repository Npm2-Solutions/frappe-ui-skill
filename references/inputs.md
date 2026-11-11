# Form controls — frappe-ui 1.1.0

Every form control in frappe-ui (buttons, text, selection, toggles, pickers, upload), read from `src/components/*` and `src/utils/*`. Paths below are relative to `node_modules/frappe-ui/src/`.

Sections:
0. [Shared rules: sizes, variants, labels, attrs, refs](#0-shared-rules)
1. [Button](#1-button)
2. [TextInput](#2-textinput)
3. [Textarea](#3-textarea)
4. [Password](#4-password)
5. [FormControl (what each `type` renders)](#5-formcontrol)
6. [FormLabel](#6-formlabel)
7. [InputLabeling parts + `useInputLabeling`](#7-inputlabeling--useinputlabeling)
8. [ErrorMessage](#8-errormessage)
9. [Select](#9-select)
10. [Combobox](#10-combobox)
11. [MultiSelect](#11-multiselect)
12. [Checkbox](#12-checkbox)
13. [RadioGroup + Radio](#13-radiogroup--radio)
14. [Switch](#14-switch)
15. [Slider](#15-slider)
16. [Rating](#16-rating)
17. [DatePicker, DateRangePicker, DateTimePicker](#17-datepicker-daterangepicker-datetimepicker)
18. [TimePicker](#18-timepicker)
19. [Duration](#19-duration)
20. [FileUploader, `useFileUpload`, `upload`, `FileUploadHandler`](#20-fileuploader--useFileUpload--upload--fileuploadhandler)

All imports are from the root: `import { X } from 'frappe-ui'`, except where stated (`frappe-ui/experimental`).

---

## 0. Shared rules

### Size scales (`composables/inputTypes.ts`)

| Scale | Values (default) | Heights | Used by |
|---|---|---|---|
| `InputSize` | `xs` `sm` `md` `lg` (`sm`) | 24 / 28 / 32 / 40px | TextInput, Password, Select, Combobox, MultiSelect, the 3 date pickers, TimePicker, Duration, FormControl, ItemListRow. Textarea: spacing, radius, min-height only (text fixed 13px). Rating: star 14/16/20/24px |
| Button `size` | `xs` `sm` `md` `lg` (`sm`) | h-6 / h-7 / h-8 / h-10 (same heights) | Button |
| `ToggleSize` | `xs` `sm` `md` (`sm`) | — | Checkbox, RadioGroup, Switch |
| `RangeSize` | `sm` `md` (`sm`) | — | Slider |

- `xl` was removed in 1.0.0 (inputTypes.ts:10). On the input family, an unknown size falls back to the default and logs one dev warning (`utils/resolvePropValue.ts:56`). **Button does not do this.** An unknown `size`/`theme`/`variant` drops its classes, and the button renders unstyled (Button.vue:105–229).
- Type exports: `InputSize`, `InputVariant`, `ToggleSize`, `RangeSize`, `InputExposed` (index.ts:177).

### Variants
- `InputVariant` = `subtle` (default) · `outline` · `ghost`. Accepted by TextInput, Textarea, Password, Select, Combobox, MultiSelect, the date pickers, TimePicker and Duration. `ghost` has no border and no background (TextInput.vue:248). `disabled` replaces the variant look with `bg-surface-gray-1`.
- Button: `variant` `solid`·`subtle`(default)·`outline`·`ghost` × `theme` `gray`(default)·`blue`·`green`·`red`. Button has no `amber` or `violet`.
- Checkbox, Radio and Switch have no variant.

### Labeling props (`InputLabelingProps`, composables/useInputLabeling.ts:8)
`label`, `description`, `error`, `required`, `id`. Inputs that take them: TextInput, Textarea, Password, Select, Combobox, MultiSelect, Checkbox, RadioGroup, Switch, Slider, Rating, the 3 date pickers, TimePicker, Duration. `Radio` takes only `label`/`description`/`id`. Button and FileUploader take none.

- `error`: `string | string[] | Error & { messages?: string | string[] }`. An `Error` renders its `messages` when it has any, and its `message` otherwise. `''`, `[]` and an Error with neither mean no error (utils/errorLines.ts:23).
- When `error` is set: the `description` prop is hidden, but a `#description` slot still renders, above the error (useInputLabeling.ts:85). The control gets `aria-invalid`, `aria-errormessage="<id>-error"` and `data-state="invalid"`.
- `required` draws a red `*` with sr-only "(required)" and sets `required`/`aria-required` on the control, where its role allows it.
- Generated ids: `<id>-label`, `<id>-description`, `<id>-error`. Without an `id`, it is `frappe-ui-<vue useId>` (utils/useId.ts).
- `#label="{ required }"` replaces the label text **and** the asterisk. `#description` replaces the description text. The 3 date pickers have neither slot.
- Labels are always 13px (`text-sm`), whatever the control `size` (InputLabeling/InputLabel.vue:44). The input `error` renders as plain text in `text-ink-red-5` with `role="alert"` (InputError.vue:8). Compare `ErrorMessage` (§8).
- State attributes on the control: `data-state` (`valid|invalid|checked|unchecked|indeterminate`), `data-size`, `data-variant`, `data-disabled`, `data-required`.

### Where attributes go
Most inputs set `inheritAttrs: false`:
- `class` and `style` go on the **outer wrapper while a label, description or error renders**, and otherwise on the control box. Your `class` therefore moves when a label or an error appears (TextInput.vue:1–20, Select.vue:316–343).
- Every other attribute and listener (`name`, `aria-*`, `@blur`, `@keydown`…) goes on the native control: the `<input>`, the trigger `<button>`, or the reka root.
- Checkbox, Switch and RadioGroup always put `class`/`style` on their outer wrapper.

### Template refs
Every input exposes `focus(options?)` (`InputExposed`). On top of that:

| Exposes | Components |
|---|---|
| `inputElement` | TextInput, Textarea, Password |
| `clear()` (`SelectionExposed`) | Select, Combobox, MultiSelect |
| `open()`, `close()` (`PickerExposed`) | the 3 date pickers, TimePicker |

`FormControl` forwards `focus()` to whatever it rendered.

---

## 1. Button
**For**: an action, a submit, or a link. Use it for icon-only buttons too, through `icon` plus `label`. For a menu trigger, pass it to `Dropdown` (see overlays reference).
**Import**: `import { Button } from 'frappe-ui'`

| Prop | Type | Default |
|---|---|---|
| `theme` | `'gray'\|'blue'\|'green'\|'red'` | `'gray'` |
| `size` | `'xs'\|'sm'\|'md'\|'lg'` | `'sm'` |
| `variant` | `'solid'\|'subtle'\|'outline'\|'ghost'` | `'subtle'` |
| `label` | `string` | — |
| `icon` | `'lucide-*'` string \| Component | — **makes it icon-only** |
| `iconLeft` / `iconRight` | same | — |
| `tooltip` | `string` | — |
| `loading` / `loadingText` | `boolean` / `string` | `false` / — |
| `disabled` | `boolean` | `false` |
| `route` | `string \| { name, params, path, query, hash }` | — → `<RouterLink>` |
| `href` | `string` | — → `<a target="_blank">` |
| `type` | `'button'\|'submit'\|'reset'` | `'button'` |

Slots: `prefix`, `icon`, `default` (replaces `label`), `suffix`. None take props. No declared emits: `@click` is a native listener on the root. Pressed look: set the attribute `data-state="active"` (or `"open"`); there is no `active` prop (Button.vue:99).

```vue
<Button variant="solid" icon-left="lucide-plus" label="New job" @click="create" />
<Button variant="ghost" icon="lucide-ellipsis" label="More actions" />
<Button variant="solid" theme="blue" type="submit" :loading="saving" loading-text="Saving…" label="Save" />
```

**Gotchas**
- `icon` means icon-only. The `label` becomes `sr-only` text plus `aria-label` (Button.vue:71, :327). For an icon next to visible text, use `icon-left` or `icon-right`.
- Icon strings must start with `lucide-`. Any other string renders nothing, and that includes an emoji: Button skips the dev warning for emoji but still renders nothing (Button.vue:275–286). A Component also works (`:icon-left="LucidePlus"`).
- `href` always opens a new tab (`target="_blank"`) (Button.vue:259). For in-app links use `route`.
- When `disabled` or `loading`, the button always renders a native `<button disabled>`, and `route`/`href` are ignored (Button.vue:247–268).
- `loading` does **not** dim the button. It shows a spinner in place of `icon-left`, sets `aria-busy` and `pointer-events-none`. Only `disabled` dims (Button.vue:238).
- The `label` prop wins over an `aria-label` attribute (Button.vue:347).
- With `tooltip` set, the button is wrapped in a reka `TooltipProvider`, unless it already sits inside one.

---

## 2. TextInput
**For**: a one-line text, number, email or search field. Use `Textarea` for multi-line text, `Password` for secrets, and the pickers for dates and times.
**Import**: `import { TextInput } from 'frappe-ui'`

| Prop | Type | Default |
|---|---|---|
| `type` | `'text'\|'number'\|'email'\|'password'\|'search'\|'tel'\|'url'\|'date'\|'datetime-local'\|'month'\|'week'\|'time'\|'file'\|'range'` | `'text'` |
| `size` / `variant` | `InputSize` / `InputVariant` | `'sm'` / `'subtle'` |
| `placeholder`, `disabled` | | |
| `modelValue` | `string \| number` | — |
| `debounce` | `number` (ms) | — |
| + labeling props | | |

Emits: `update:modelValue` [string]. Slots: `prefix`, `suffix`, `label({required})`, `description`. Exposed: `focus`, `inputElement`.

```vue
<TextInput v-model="search" placeholder="Search jobs" :debounce="300" aria-label="Search">
  <template #prefix><span class="lucide-search size-4" /></template>
</TextInput>
```

**Gotchas**
- It always emits a **string**, even with `type="number"`. Use `v-model.number`, and expect `''` when the field is empty (TextInput.vue:286).
- It emits on both `input` and `change` (TextInput.vue:49–50). A side effect bound to `@update:modelValue` runs on every keystroke and once more on blur.
- `debounce` is read once, at setup (TextInput.vue:281). Changing it later has no effect.
- The input is bound one way, `:value="modelValue"` (TextInput.vue:39): whenever it renders, the field shows exactly the parent's value. A model the parent normalises — trimmed, or read back from `route.query` — eats the trailing space while the person types "steel bea…". Bind a local ref that is never rewritten, derive the trimmed value from it (design.md §1.14 has the URL-synced search).
- `required` is the native attribute on the `<input>` (TextInput.vue:41; Textarea.vue:27): inside your own `<form>` the browser blocks the submit with its own bubble before your validation runs — write `<form novalidate @submit.prevent="…">`, as `dialog.prompt` does (utils/dialog.ts:667-671).
- `autocomplete="off" is set by default. Pass your own `autocomplete` to override it (TextInput.vue:47).
- `#prefix`/`#suffix` are absolutely positioned, and the input reserves a fixed padding for them (`ps-8` at `sm`). Content wider than one icon overlaps the text.
- `type="date"`/`"time"` give the browser's native picker. For the library pickers see §17 and §18.

---

## 3. Textarea
**For**: multi-line plain text. For rich text use the editor (`frappe-ui/editor`).
**Import**: `import { Textarea } from 'frappe-ui'`

Props: `size` (`'sm'`), `variant` (`'subtle'`), `placeholder`, `disabled`, `modelValue: string`, `debounce`, `rows` (`3`), plus the labeling props. Emits `update:modelValue` [string]. Slots: `label`, `description`. Exposed: `focus`, `inputElement` (`HTMLTextAreaElement`).

**Gotchas**
- `size` changes padding, radius and min-height only. Text stays 13px at every size (Textarea.vue:78).
- There are no `prefix`/`suffix` slots and no auto-grow. It sets no `autocomplete` default.
- Like TextInput, it emits on both `input` and `change`, and `debounce` is read once.

---

## 4. Password
**For**: a password field with a show/hide eye. It wraps `TextInput`.
**Import**: `import { Password } from 'frappe-ui'`

Props: `size`, `variant`, `placeholder`, `disabled`, plus the labeling props. `v-model: string`. Slots: `prefix`, `label`, `description` (the eye takes the suffix). Exposed: `focus`, `inputElement`.

**Gotchas**
- The eye is hidden while the value contains `*` (Password.vue:74), so a Frappe masked value `*****` cannot be revealed.
- `Mod+I` toggles visibility (Password.vue:15).
- There is no `debounce` prop.
- `FormControl type="password"` renders a plain TextInput with no eye (§5).

---

## 5. FormControl
**For**: rendering many field types from one `type` prop, for example a `v-for` over field definitions. When you need a field's full props or slots, use the component directly.
**Import**: `import { FormControl } from 'frappe-ui'`

Declared props: `type` (`'text'`), `size` (`'sm'`), `variant` (`'subtle'`, typed `'subtle'|'outline'`), `label`, `description`, `error`, `required`. Everything else (`v-model`, `options`, `placeholder`, `min`/`max`, listeners) passes through as attributes. Slots are forwarded by name. Exposed: `focus`.

| `type` | Renders | Notes |
|---|---|---|
| `text` (default), `email`, `password`, `number`, `search`, `tel`, `url`, `file`, `range`, `month`, `week`, `datetime-local`, any other string | `TextInput` with that HTML `type` | `password` gets no eye toggle |
| `textarea` | `Textarea` | |
| `select` | `Select` | `w-full` |
| `combobox` | `Combobox` | `w-full` |
| `multiselect` | `MultiSelect` | `w-full`, value is an array |
| `checkbox` | `Checkbox` | no `variant` forwarded; `size="lg"` becomes `md` (FormControl.vue:114) |
| `date` | `DatePicker` | **not** the native input; `w-full` |
| `daterange` | `DateRangePicker` | `w-full` |
| `datetime` | `DateTimePicker` | `w-full` |
| `time` | `TimePicker` | **not** the native input; `w-full` |

(FormControl.vue:66–101.)

```vue
<FormControl v-for="f in fields" :key="f.name" v-model="doc[f.name]"
  :type="f.type" :label="f.label" :options="f.options" :required="f.reqd" :error="errors[f.name]" />
```

**Gotchas**
- `type="autocomplete"` was removed in 1.0. It falls through to a plain text box and logs `console.error` in dev (FormControl.vue:50). Use `combobox`.
- A `#default` slot is declared (FormControl.vue:170), but none of the rendered controls has a default slot, so it renders nothing.
- For a native date input, use `type="datetime-local"`, or `<TextInput type="date">`.
- Nothing checks the `v-model` shape for each type. It follows the child component.

---

## 6. FormLabel
**For**: a standalone `<label>` styled like the input labels. Inputs draw their own labels from `label`.
**Import**: `import { FormLabel } from 'frappe-ui'`

Props: `label: string` (required), `id` (becomes `for`), `required`. No slots. It is always 13px `text-ink-gray-6`; the `size` prop was removed (FormLabel.vue:5).

---

## 7. InputLabeling + `useInputLabeling`
**For**: building your own input that labels, describes and reports errors like the built-in ones.
**Import**: `import { InputLabel, InputDescription, InputError, useInputLabeling } from 'frappe-ui/experimental'`. These are unstable. The root exports only the type `InputLabelingProps`. `RequiredIndicator` and `LabelingWrapper` are internal.

| Part | Props | Slot |
|---|---|---|
| `InputLabel` | `id` (req), `forId`, `label`, `required`, `color: 'gray-6'\|'gray-7'` (`gray-6`), `disabled` | default `{ required }`; renders only with `label` or the slot |
| `InputDescription` | `id` (req), `description`, `disabled` | default |
| `InputError` | `id` (req), `lines: string[]` | — (`role="alert"`, plain text) |

`useInputLabeling(props, options?)`:
- `options`: getters `size`, `variant`, `disabled`, `state`, `hasLabelSlot`, `hasDescriptionSlot`.
- Returns `{ inputId, labelId, descriptionId, errorMessageId, labelledBy, describedBy, hasError, errorLines, showDescription, rendersDescription, dataAttrs }`, all computed.

```vue
<script setup lang="ts">
import { useSlots } from 'vue'
import type { InputLabelingProps } from 'frappe-ui'
import { InputLabel, InputDescription, InputError, useInputLabeling } from 'frappe-ui/experimental'
const props = defineProps<InputLabelingProps>()
const slots = useSlots()
const { inputId, labelId, descriptionId, errorMessageId, describedBy, hasError, errorLines, showDescription, dataAttrs } =
  useInputLabeling(props, { hasLabelSlot: () => !!slots.label })
</script>
<template>
  <div class="space-y-1.5">
    <InputLabel :id="labelId" :for-id="inputId" :label="label" :required="required" />
    <input :id="inputId" :aria-describedby="describedBy" :aria-invalid="hasError || undefined"
      :aria-errormessage="hasError ? errorMessageId : undefined" v-bind="dataAttrs" />
    <InputDescription v-if="showDescription" :id="descriptionId" :description="description" />
    <InputError v-if="hasError" :id="errorMessageId" :lines="errorLines" />
  </div>
</template>
```

**Gotcha**: pass `hasLabelSlot`/`hasDescriptionSlot` when you offer those slots. Without them, `labelledBy`/`describedBy` point at nothing (useInputLabeling.ts:58–65).

---

## 8. ErrorMessage
**For**: an error block outside an input, for example a form-level or server error. For an input's own error, use its `error` prop.
**Import**: `import { ErrorMessage } from 'frappe-ui'`

Prop: `message?: string | string[] | Error & { messages }`. It renders nothing when the message is empty. `role="alert"`, `text-sm text-ink-red-7`, one line per message.

```vue
<ErrorMessage :message="saveResource.error" />
```

**Gotchas**
- It renders **HTML**, sanitized with DOMPurify (ErrorMessage.vue:6, :40). The input `error` prop renders plain text in a different red (`ink-red-5`, InputError.vue:8).
- An Error's `messages` take priority over its `message`. A v2 `FrappeResponseError` has no `messages`, so it shows `"ValidationError: …"` with the type in front: pass `serverMessage(err, fallback)` (data.md §2).

---

## 9. Select
**For**: one value from a short flat list, with no search. Use `Combobox` for search, groups or async options, and `MultiSelect` for several values.
**Import**: `import { Select } from 'frappe-ui'`

| Prop | Type | Default |
|---|---|---|
| `modelValue` | `string \| number \| null` | none; empty means `null` |
| `options` | `Array<string \| { label, value, disabled?, icon?, description?, slot?, ...any }>` | `[]` |
| `placeholder` | `string` | `'Select option'` |
| `emptyText` | `string` | `'No options'` |
| `size`, `variant`, `disabled` | | `'sm'`, `'subtle'` |
| `open` | `boolean` (`v-model:open`) | `false` |
| `side`, `align`, `offset` | `'top'\|'right'\|'bottom'\|'left'`, `'start'\|'center'\|'end'`, `number` | unset (see gotcha) |
| `portalTo` | teleport target | embedding host, else `body` |
| + labeling props | | |

Emits: `update:modelValue`, `update:open`. At runtime the payload is the option's value or `null`; its declared type is `string | number | null | undefined` (`defineModel` on an optional prop, Select/types.ts:182-188, Select.api.md:184-187), so a typed handler takes that union: `(v) => save(v ?? null)`, not `(v: string) => …`.

Slots:

| Slot | Props |
|---|---|
| `trigger`, `prefix`, `suffix`, `footer` | `{ open, disabled, selectedOption, clear, setOpen, close }` |
| `item`, `item-prefix`, `item-label`, `item-suffix`, `item-<option.slot>` | `{ item, selected }` |
| `empty`, `label`, `description` | — |

Exposed: `clear`, `focus`. The attributes `name` and `autocomplete` go to the root, for native form submit. All other attributes go to the trigger.

```vue
<Select v-model="status" label="Status" :options="[
  { label: 'Open', value: 'Open', icon: 'lucide-circle' },
  { label: 'Closed', value: 'Closed' }]" />
```

**Gotchas**
- By default the menu is **item-aligned**: it opens over the trigger. Setting any of `side`, `align` or `offset` switches to popper placement below the trigger (Select.vue:85).
- `#suffix` replaces the chevron (Select.vue:426).
- The trigger hugs its value. It goes full-width only when a label, description or error shows, or with `class="w-full"` (Select.vue:340).
- Options whose `value` is `null` or `undefined` are dropped. There are no groups.
- `''` is a real value: a `{ label: 'None', value: '' }` option round-trips.
- `#item-prefix` also renders on the trigger for the selected option, and so does `option.icon`.
- Row precedence: an `#item-<option.slot>` slot fills the label region, then `#item` replaces the whole row, then the default row.

---

## 10. Combobox
**For**: picking one value with search, groups, server results or action rows ("Create …").
**Import**: `import { Combobox } from 'frappe-ui'`

| Prop | Type | Default |
|---|---|---|
| `modelValue` | `string \| number \| null` | none; empty means `null` |
| `options` | `ComboboxOption[]` (below) | `[]` |
| `trigger` | `'input' \| 'button'` | `'input'` |
| `query` | `string` (`v-model:query`, optional) | internal |
| `open` | `boolean` (`v-model:open`) | `false` |
| `openOnFocus` / `openOnClick` | `boolean` | `false` / `true` |
| `filterable` | `boolean`, client substring filter | `true` |
| `loading` | `boolean` | `false` |
| `hideSearch` | `boolean` (button mode only) | `false` |
| `placeholder` / `emptyText` | `string` | `'Select option'` / `'No results'` |
| `size`, `variant`, `disabled`, `side`, `align`, `offset`, `portalTo` | | `'sm'`, `'subtle'`, `false`, `'bottom'`, `'start'`, `4` |
| + labeling props | | |

Option shapes:
- a plain `string`;
- `{ label, value, icon?, description?, disabled?, slot?, slots?: { prefix?, label?, suffix?, item? } }`;
- a custom action row: `{ type: 'custom', key, label, onClick({ query }), keepOpen?, condition?({ query }), icon?, slot? }`;
- a group: `{ group, options: [...], key?, hideLabel? }`.

Emits: `update:modelValue` (declared `string | number | null | undefined`, as `Select`; Combobox.api.md:262-265), `update:open`, `update:query`, `update:selectedOption` (option or `null`), `focus`, `blur`.

Slots:

| Slot | Props |
|---|---|
| `trigger` (forces button mode), `prefix`, `suffix`, `footer` | `{ open, disabled, query, selectedOption, displayValue, clear, setOpen, close }` |
| `search-prefix`, `search-suffix` | `{ query, setQuery, disabled, focus }` |
| `item`, `item-prefix`, `item-label`, `item-suffix`, `item-<slot>` | `{ item, query, selected }` |
| `group-label` | `{ group }` |
| `empty` | `{ query }` |
| `label`, `description` | — |

Exposed: `clear`, `focus`.

```vue
<Combobox v-model="customer" label="Customer" :options="customers"
  :filterable="false" :loading="search.loading" v-model:query="q" />
<!-- action row -->
const options = computed(() => [...tags.value, { type: 'custom', key: 'new', label: `Create "${q.value}"`,
  condition: ({ query }) => !!query, onClick: ({ query }) => createTag(query) }])
```

**Gotchas**
- Typed text never becomes the value. Only picking an option, or a custom row's `onClick`, commits (Combobox.vue:340, :376).
- In input mode, clearing the input text clears the model (Combobox.vue:359).
- A `#trigger` slot switches the component into button mode, with the search input moved into the popover (Combobox.vue:228).
- Binding or listening to `update:query` makes you the owner of the query: the component stops resetting it on open (Combobox.vue:427+, docs "Search query").
- For server search, pass `:filterable="false"` and keep the selected option in `options`. Otherwise the trigger falls back to showing the raw value (Combobox.vue:196).
- A group written `{ group, items }` (the old Autocomplete shape) throws a `TypeError` (shared/selection/utils.ts:162).
- A custom row's `condition` still runs when `filterable` is `false`.
- `#suffix` replaces the chevron. In a clear button placed there, use `@click.stop` and `@pointerdown.stop`.

---

## 11. MultiSelect
**For**: several values from a list, with a search box in the popover.
**Import**: `import { MultiSelect } from 'frappe-ui'`

| Prop | Type | Default |
|---|---|---|
| `modelValue` | `Array<string \| number>` | `[]` |
| `options` | `Array<{ label, value, icon?, description?, disabled?, slot?, slots? } \| { group, options, key?, hideLabel? }>` | `[]` |
| `query`, `open` | `v-model:query`, `v-model:open` | internal / `false` |
| `hideSearch`, `loading`, `filterable` | `boolean` | `false`, `false`, `true` |
| `placeholder`, `emptyText` | `string` | `'Select option'`, `'No results'` |
| `size`, `variant`, `disabled`, `side`, `align`, `offset`, `portalTo` | | `'sm'`, `'subtle'`, `false`, `'bottom'`, `'start'`, `4` |
| + labeling props | | |

Emits: `update:modelValue`, `update:selectedOptions` (the original option objects), `update:open`, `update:query`, `highlight` (option or `null`).

Slots:
- `trigger`, `prefix`, `suffix`: `{ open, disabled, query, selectedOptions, clear, setOpen, close }`.
- `summary`: the same plus `summary`.
- `footer`: the same plus `selectAll`.
- `search-prefix`, `search-suffix`: `{ query, setQuery, disabled, focus }`.
- `item`, `item-prefix`, `item-label`, `item-suffix`, `item-<slot>`: `{ item, query, selected }`.
- `group-label`, `empty`, `label`, `description`.

Exposed: `clear`, `focus`.

**Gotchas**
- **Plain string options are silently dropped.** Options must be objects with a `value` (MultiSelect/utils.ts:48).
- The trigger shows the label when one option is picked, and "N selected" for two or more (MultiSelect.vue:188). Use `#summary` for something else.
- The default footer has Clear All and Select All. `selectAll` picks every enabled option in every group, including options hidden by the current search (MultiSelect.vue:251). A `#footer` slot replaces both buttons.
- A value missing from `options` stays in the model but does not show in the trigger.
- `loading` shows a spinner in the search row and keeps the options pickable. With `hideSearch`, a loading row replaces the list instead.

---

## 12. Checkbox
**For**: one boolean. Use `Switch` for a setting that applies at once.
**Import**: `import { Checkbox } from 'frappe-ui'`

Props:

| Prop | Type | Default |
|---|---|---|
| `modelValue` | `boolean \| 1 \| 0` | — |
| `size` | `ToggleSize` | `'sm'` |
| `padded` | `boolean`; a clickable row surface | `false` |
| `disabled` | `boolean` | — |
| `indeterminate` | `boolean` | `false` |
| + labeling props | | |

Emits: `update:modelValue` [boolean]. Slots: `label`, `description`. Exposed: `focus`.

**Gotchas**
- It always **emits a boolean**, even when bound to `1`/`0` (Checkbox.vue:105), so a Frappe Check field comes back as `true`/`false`. The docs only say "1 and 0 also work".
- There is no array or group model; one checkbox holds one boolean.
- `indeterminate` is visual only, set through the DOM property. A click does not clear it; the parent must (Checkbox.vue:98).

---

## 13. RadioGroup + Radio
**For**: one value among a few visible options.
**Import**: `import { RadioGroup, Radio } from 'frappe-ui'`

`RadioGroup` props:

| Prop | Type | Default |
|---|---|---|
| `modelValue` | `string \| number \| boolean` | — |
| `size` | `ToggleSize` | `'sm'` |
| `padded` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |
| `orientation` | `'vertical'\|'horizontal'` | `'vertical'` |
| `loop` | `boolean` | `true` |
| `name` | `string` | auto-generated |
| + labeling props | | |

Emits: `update:modelValue` (value or `undefined`). Slots: `default` (the Radios), `label`, `description`. Exposed: `focus` (moves to the checked radio, or the first enabled one).

`Radio` props: `value` (required), `disabled`, `label`, `description`, `id`. Slots: `label`, `description` (no props).

```vue
<RadioGroup v-model="priority" label="Priority" orientation="horizontal">
  <Radio value="Low" label="Low" /><Radio value="High" label="High" />
</RadioGroup>
```

**Gotchas**
- A `<Radio>` outside a `RadioGroup` **throws** (Radio.vue:61).
- There is no `options` prop; write the Radio children yourself.
- `required` and `error` go on the group, not on a Radio.
- The group label is not a `<label for>`: it names the group through `aria-labelledby`.

---

## 14. Switch
**For**: an on/off setting, usually in a settings row.
**Import**: `import { Switch } from 'frappe-ui'`

Props:

| Prop | Type | Default |
|---|---|---|
| `modelValue` | `boolean` | `false` |
| `size` | `ToggleSize` | `'sm'` |
| `padded` | `boolean` | `false` |
| `controlPosition` | `'start'\|'end'` | `'end'` |
| `disabled` | `boolean` | `false` |
| `icon` | `'lucide-*'` \| Component | — |
| + labeling props | | |

Emits: `update:modelValue`. Slots: `label`, `description`. Exposed: `focus`.

**Gotchas**
- The switch trails its label by default, in a full-width `justify-between` row (Switch.vue:188). Use `control-position="start"` for a leading switch.
- The `icon` string is used as a class without checking for the `lucide-` prefix.

---

## 15. Slider
**For**: a number, or a range of two numbers, on a track.
**Import**: `import { Slider } from 'frappe-ui'`

Props: `modelValue: number[]`, `min` (`0`), `max` (`100`), `step` (`1`), `size` (`'sm'|'md'`, `'sm'`), `disabled`, plus the labeling props. Emits: `update:modelValue` on every step, and `value-commit` [number[]] once when a drag ends. Exposed: `focus` (the first thumb).

```vue
<Slider v-model="pct" label="Completion" />        <!-- pct = ref([40]) -->
<Slider v-model="range" :min="0" :max="500" />      <!-- range = ref([50, 200]) -->
```

**Gotchas**
- The value is **always an array**, `[n]` even for one handle. An empty model shows `[min]` without emitting anything (Slider.vue:112).
- `aria-*` attributes go to every thumb, not to the root.
- The slider is `w-full`. That default is dropped when you pass your own unprefixed `w-*` class (Slider.vue:86).

---

## 16. Rating
**For**: a star score.
**Import**: `import { Rating } from 'frappe-ui'`

Props:

| Prop | Type | Default |
|---|---|---|
| `modelValue` | `number` | `0` |
| `max` | `number` | `5` |
| `step` | `1 \| 0.5` | `1` |
| `disabled` | `boolean` | `false` |
| `icon` | `'lucide-*'` \| Component | filled star |
| `size` | `InputSize` | `'sm'` |
| + labeling props | | |

Emits: `update:modelValue`. Slots: `label`, `description`, `icon({ index, side, state, leftState, rightState, value, previewValue, max })`. Exposed: `focus`.

**Gotchas**
- Clicking the current value, or pressing `0`, resets the value to **0** (Rating.vue:290). To prevent that, bind `:model-value` and ignore the `0` update.
- There is no `readonly` prop; use `disabled` for display.
- `lucide-star` is an outline mask and cannot draw a filled star, which is why the default icon is an inline SVG.
- `step="0.5"` switches the role from `radiogroup` to `slider` (Rating.vue:186).

---

## 17. DatePicker, DateRangePicker, DateTimePicker
**For**: picking a date, a date range, or a date and time from a calendar popover. For a time alone use `TimePicker`.
**Import**: `import { DatePicker, DateRangePicker, DateTimePicker } from 'frappe-ui'`. The calendars without the input, `DateCalendar` and `DateRangeCalendar`, and the shared input-plus-popover `PickerShell`, come from `frappe-ui/experimental`.

Common props (`CommonDatePickerProps`):

| Prop | Type | Default |
|---|---|---|
| `format` | dayjs format, **display only** | — |
| `size`, `variant` | | `sm`, `'subtle'` |
| `placeholder` | `string` | per picker, below |
| `open` | `boolean` | — |
| `openOnFocus` / `openOnClick` | `boolean` | `false` / `true` |
| `typeable` | `boolean` | `true` |
| `disabled` | `boolean` | `false` |
| `clearable` | `boolean` | `true` |
| `keepOpen` | `boolean` | `false` |
| `min` / `max` | `'YYYY-MM-DD'` (DateTimePicker also takes `'YYYY-MM-DD HH:mm:ss'`) | — |
| `isDateUnavailable` | `(d: Dayjs) => boolean` | — |
| `side` / `align` / `offset` | | `'bottom'` / `'start'` / `4` |
| + labeling props | | |

| Picker | `v-model` | Empty value | Default placeholder | Extra `#actions` props |
|---|---|---|---|---|
| `DatePicker` | `'YYYY-MM-DD'` | `''` | `'Select date'` | `selected`, `setDate` |
| `DateTimePicker` | `'YYYY-MM-DD HH:mm:ss'` | `''` | `'Select date & time'` | `selected`, `time`, `setDate` |
| `DateRangePicker` (+ `dualPane`) | `[from, to]` or `[]` (`DateRangeValue`) | `[]` | `'Select range'` | `fromDate`, `toDate`, `setDate`, `setRange` |

Every `#actions` slot also receives `open`, `disabled`, `setOpen`, `close` and `clear`.

Emits: `update:modelValue`, `update:open`, `change`. Slots: `trigger`, `prefix`, `suffix`, each `{ open, disabled, setOpen, close, displayLabel, inputValue }`, plus `actions` (a shortcut column beside the calendar). Exposed: `open`, `close`, `focus`.

```vue
<DatePicker v-model="doc.delivery_date" label="Delivery" format="DD/MM/YYYY" :min="today" />
<DateRangePicker v-model="period" dual-pane>
  <template #actions="{ setRange }">
    <Button variant="ghost" label="Last 7 days" @click="setRange([dayjs().subtract(6,'day'), dayjs()])" />
  </template>
</DateRangePicker>
```

**Gotchas**
- A cleared value is `''`, not `null` (DatePicker.vue:239), or `[]` for a range.
- With `:clearable="false"` and an empty model, the field **shows today** without emitting anything (DatePicker.vue:188).
- `DateRangePicker` emits only when both ends are set, and shows "A to B" (DateRangePicker.vue:311, :253).
- `DateTimePicker` stays open after a date click and moves focus to the time input.
- Timezones: `DateTimePicker` emits through `dayjsSystem`, converting local time to `setConfig('systemTimezone')` (DateTimePicker.vue:362). It reads the model back with plain `dayjs`, without converting it back (DateTimePicker.vue:240). When `systemTimezone` differs from the browser's zone, the field shows the system-zone string after a pick, so test that case before relying on it.
- The pickers have no `#label` or `#description` slot. A `#trigger` slot replaces the TextInput, and the label, description and error go with it.
- Typed text commits on blur or Enter. Text that does not parse, or a date outside `min`/`max`, reverts.
- `class` and other attributes land on a wrapper `<div>` around the trigger (shared/picker/PickerShell.vue:15).

---

## 18. TimePicker
**For**: a time of day, typed or picked from a list.
**Import**: `import { TimePicker } from 'frappe-ui'`

Props:

| Prop | Type | Default |
|---|---|---|
| `modelValue` | `'HH:mm'`, or `'HH:mm:ss'` if seconds were typed | `''` |
| `interval` | `number` (minutes) | `15` |
| `options` | `Array<{ value, label? }>`; replaces the generated list | `[]` |
| `format` | dayjs format for display; `'h:mm A'` gives a 12-hour clock | `'HH:mm'` |
| `min` / `max` | `'HH:mm[:ss]'` | — |
| `typeable` | `boolean` | `true` |
| `keepOpen` | `boolean` | — |
| `open` | `boolean` | — |
| `openOnFocus` / `openOnClick` | `boolean` | `false` / `true` |
| `placeholder` | `string` | `'Select time'` |
| `size`, `variant`, `disabled`, `side`, `align`, `offset` | | |
| + labeling props | | |

Emits: `update:modelValue`, `update:open`, `change`. Slots: `label`, `description`, `prefix`, `suffix({ open, disabled, setOpen, close })`. Exposed: `open`, `close`, `focus`.

**Gotchas**
- types.ts:2 says TimePicker is "a thin wrapper around Combobox". **The code is not:** it is a TextInput with a reka Popover (TimePicker.vue:2), and Combobox props do not apply.
- The value stays in 24-hour form whatever the `format`. Empty is `''`.
- `update:modelValue` fires on every commit, even when the value is unchanged. `change` fires only on a real change (TimePicker.vue:336).
- There is no `portalTo` prop.

---

## 19. Duration
**For**: a length of time stored in seconds, typed as "1h 30m".
**Import**: `import { Duration, formatDuration, parseDuration } from 'frappe-ui'`

Props:

| Prop | Type | Default |
|---|---|---|
| `modelValue` | `number \| null` (seconds) | `null` |
| `format` | `'short'` (`1h 30m 45s`) · `'long'` · `'colon'` · a template such as `"hh:mm:ss"` | `'short'` |
| `largestUnit` | `'day'\|'hour'` | `'hour'` |
| `smallestUnit` | `'minute'\|'second'` | `'second'` |
| `placeholder` | `string` | `'1h 30m 45s'`, or `'1h 30m'` with `smallestUnit` minute |
| `size`, `variant`, `disabled` | | |
| + labeling props | | |

Emits: `update:modelValue` [number|null]. Slots: `label`, `description`. Exposed: `focus`.

Helpers: `formatDuration(seconds, format?, { largestUnit?, smallestUnit? }?) → string` and `parseDuration(text, units?) → number | null`.

**Gotchas**
- The value commits only on blur or Enter. Escape cancels the edit (Duration.vue:111). An empty input saves `null`.
- Unreadable text shows a built-in error message (Duration.vue:136), unless your `error` prop is set, which wins (Duration.vue:8). Focus then leaves the field; it is not kept open as the docs say. Focusing again discards the rejected text.
- `smallestUnit="minute"` rounds the saved value to whole minutes (Duration.vue:147).

---

## 20. FileUploader / useFileUpload / upload / FileUploadHandler
**For**: uploading one file to Frappe's `upload_file`. Use `FileUploader` for UI with a slot, `useFileUpload()` for reactive state in your own UI, and `upload()` for a bare promise.
**Import**: `import { FileUploader, useFileUpload, upload, UploadError, FileUploadHandler } from 'frappe-ui'`. Types: `UploadedFile`, `UploadOptions`, `UploadState`, `UploadErrorKind`.

`FileUploader` props:

| Prop | Type | Default |
|---|---|---|
| `fileTypes` | `string \| string[]` (`accept`) | — |
| `private` | `boolean` | **`true`** |
| `folder` | `string` | `'Home'` (sent as is) |
| `doctype`, `docname`, `fieldname` | `string` | — |
| `uploadEndpoint` | `string` | `'/api/method/upload_file'` |
| `optimize` | `boolean` | — |
| `validateFile` | `(file) => string \| Error \| null \| void \| Promise<…>` | — |

Emits: `success` [UploadedFile: `{ file_name, file_url, file_size, name?, is_private?, … }`], `failure` [error]. Default slot: `{ file, uploading, progress, uploaded, total, message, error, success, openFileSelector }`. The root carries `data-state="idle|uploading|success|error"`.

```vue
<FileUploader :file-types="['.pdf']" doctype="Job" :docname="job.name" @success="(f) => attach(f.file_url)">
  <template #default="{ openFileSelector, uploading, progress, error }">
    <Button :loading="uploading" icon-left="lucide-upload" :label="uploading ? `${progress}%` : 'Upload drawing'" @click="openFileSelector" />
    <ErrorMessage :message="error" />
  </template>
</FileUploader>
```

`useFileUpload()` returns `{ upload(file, options), reset, state, isUploading, progress, error, result }`. `state` is reactive: `{ uploading, progress, uploaded, total, error: UploadError | null, result }`.

`upload(file, options)` returns `Promise<UploadedFile>`. `UploadOptions` keys are snake_case: `private` (default true), `folder`, `file_url`, `doctype`, `docname`, `fieldname`, `method`, `type`, `upload_endpoint`, `optimize`, `max_width`, `max_height`, `params`, `signal`, `onProgress({ loaded, total, percent })`.

`UploadError` has `kind: 'file-size' | 'network' | 'server' | 'abort'`, `status`, `messages[]` and `response`.

`FileUploadHandler` is the class FileUploader is built on. The package exports it under this name; there is no `fileUploadHandler` export. Use `new FileUploadHandler()`, then `.on('start'|'progress'|'finish'|'error', fn)` and `.upload(file, options)`.

**Gotchas**
- **Uploads are private by default** (`useFileUpload.ts:33`, `FileUploader.vue:51`).
- FileUploader takes one file. Its `<input>` value is never reset, so **choosing the same file again does not fire** (FileUploader.vue:106–125).
- The slot prop `message` is always `''` (FileUploader.vue:66).
- FileUploader props are camelCase (`uploadEndpoint`); `UploadOptions` are snake_case (`upload_endpoint`). FileUploader has no `max_width`/`max_height`.
- `FileUploadHandler.upload` ignores `params`, `signal` and `onProgress`, which only `upload()`/`useFileUpload()` honour (fileUploadHandler.ts:158–199).
- Size limit: `setConfig('maxFileSize', bytes)` rejects a file before any request, with `kind: 'file-size'` (utils/fileSize.ts:31). The CSRF header comes from `window.csrf_token`.
