# Charts — `frappe-ui/charts` (frappe-ui 1.1.0)

What is in this file: the eleven chart components, the four chrome parts (`ChartCard`, `ChartContainer`, `ChartLegend`, `ChartTooltip`), `useChart`/`useChartTokens`/`paletteColors`, their props, data shapes, events, slots, colors and theming. Source: `src/charts/` (`types.ts` is the prop source of truth; `docs/*.md` are the docs), `src/charts/style.css`, `core/useChart.ts`, `tokens.ts`.

Sections
1. Overview and import
2. Props every chart shares
3. Axis charts: BarChart, LineChart, AreaChart
4. DonutChart, PercentageBarChart
5. FunnelChart
6. HeatmapChart, CalendarHeatmapChart
7. ScatterChart
8. SankeyChart
9. NumberCard
10. Chrome parts: ChartCard, ChartContainer, ChartLegend, ChartTooltip
11. Custom plots: useChart, registerChartModules, useChartTokens, paletteColors, OTHERS_KEY
12. Colors and theming
13. Gotchas (ranked)

---

## 1. Overview

**For** — dashboards and report blocks fed by rows (`Record<string, any>[]`) whose columns you name in props (`x`, `y`, `category`, `value`…), so a chart can be saved as one object and rendered with `v-bind`. The v1 `AxisChart`/`DonutChart`/`NumberChart` with a `config` prop are parked in `frappe-ui/experimental` — do not mix them up with these.
**Import** — `import { BarChart, LineChart, AreaChart, DonutChart, PercentageBarChart, FunnelChart, HeatmapChart, CalendarHeatmapChart, ScatterChart, SankeyChart, NumberCard, ChartCard, ChartContainer, ChartLegend, ChartTooltip, useChart, registerChartModules, useChartTokens, paletteColors, OTHERS_KEY } from 'frappe-ui/charts'` (types: `BarChartProps`, `ChartExposed`, `ChartDatapointEvent`, …).

| Chart | Renders with | Use for |
|---|---|---|
| BarChart / LineChart / AreaChart | ECharts (SVG renderer) | categories or time; grouped/stacked/combo |
| DonutChart | ECharts pie | share of a total (≤ 9 slices) |
| PercentageBarChart | divs | share of a total as one bar |
| FunnelChart | own SVG | stage drop-off |
| HeatmapChart | ECharts | value across two category axes |
| CalendarHeatmapChart | ECharts | a value per day |
| ScatterChart | ECharts | two measures (+ size) |
| SankeyChart | ECharts | flows source → target |
| NumberCard | own SVG | one KPI with delta, sparkline, progress |

Importing the subpath loads `style.css` with the `--chart-*` tokens (`index.ts:3`). Each chart registers only the ECharts modules it needs; the renderer is SVG only (`core/useChart.ts:17-19`).

**Charts draw no card and have no height of their own** (except `NumberCard`): the root is `ChartContainer` with `h-full w-full` (`BarChart.vue:2`, `ChartContainer.vue:5-9`). Put each chart in a `ChartCard` (or your own box) **with a height**, or the plot is 0px tall.

```vue
<script setup lang="ts">
import { BarChart, ChartCard } from 'frappe-ui/charts'
const rows = [
  { month: '2026-01-01', sales: 120, returns: 8 },
  { month: '2026-02-01', sales: 150, returns: 11 },
]
</script>
<template>
  <ChartCard class="h-80">
    <BarChart
      title="Sales"
      :data="rows"
      x="month"
      :y="['sales', 'returns']"
      palette="categorical"
      :y-axis="{ format: (v) => '€ ' + v }"
      :loading="loading"
      :error="errorMessage"
      @select="(e) => openRows(e.row)"
    />
  </ChartCard>
</template>
```

## 2. Props every chart shares (`ChartBaseProps`, `types.ts:814-828`)

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | string | — | no title/subtitle/actions → no header row |
| `subtitle` | string | — | not on NumberCard |
| `loading` | boolean | — | placeholder the size of the plot (no spinner) |
| `error` | `string \| null` | — | non-empty → error state with the message; wins over `loading` |
| `dir` | `'ltr'\|'rtl'` | `document.documentElement.dir` | |

Empty state is derived, there is no `empty` prop: no rows, a column no row has, no numeric values, or every series hidden (`docs/States.md`).
Slots on every chart: `#actions` (top right of the header), `#title-suffix` (after the title), `#loading`, `#error="{ error }"`, `#empty`; plus `#tooltip="{ label, items, rows }"` on every plotted chart (not NumberCard).
Template ref: `ref<ChartExposed>()` → `.chart` is the ECharts instance, `undefined` until the plot has a size and fonts loaded. Not on Funnel/NumberCard/PercentageBar (`docs/Overview.md`).
Numbers print with `Intl.NumberFormat(<html lang> or 'en-US')` (`utils.ts:130-143`, `format.ts:115-135`) — set `<html lang="it">` for `1.234,5`.

## 3. Axis charts — BarChart, LineChart, AreaChart

One component, three default marks (`BarChart.vue:108-114`). `AreaChartProps = LineChartProps = AxisChartProps`; `BarChartProps` adds `horizontal`.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `data` | `Record<string, any>[]` | — | one row = one x position (wide) or one point (long) |
| `x` | string | — | category/time column |
| `y` | `string \| string[]` | — | wide data: one series per column; long data: one value column + `splitBy` |
| `y2` | `string \| string[]` | — | second value axis (ignored on horizontal bars) |
| `splitBy` | string | — | long data: one series per distinct value |
| `maxSeries` | number | uncapped | caps `splitBy` series; rest summed into `OTHERS_KEY` (`'__others__'`) |
| `seriesConfig` | `Record<seriesKey, SeriesStyle>` | — | per series: `label`, `color`, `type: 'bar'\|'line'\|'area'`, `format`, `showDataLabels`, `stackName`, `dashed`, `showDataPoints`, `smooth`, `connectNulls`, `echartOptions` |
| `showDataLabels`, `smooth`, `showDataPoints`, `dashed`, `connectNulls` | boolean | — | chart-wide defaults, overridden per series |
| `stacked` | `boolean \| 'normalized'` | — | bars and areas stack; lines never; `'normalized'` = 100% with axis pinned 0–100 |
| `horizontal` (Bar) | boolean | — | category axis on Y; bars only |
| `hiddenSeries` | `string[]` | legend-owned | `v-model:hiddenSeries` |
| `tooltipColumns` | `{ name, label?, format? }[]` | — | extra columns shown only in the tooltip |
| `xAxis` | `{ title?, type?: 'category'\|'time'\|'value', timeGrain?, format?, echartOptions? }` | type inferred | `time` when every x is a `Date` or ISO date string; `value` only when asked |
| `yAxis`, `y2Axis` | `{ title?, min?, max?, format?, integer?, echartOptions? }` | — | `format` prints ticks, tooltip, labels |
| `palette` | `'sequential'\|'categorical'\|'diverging'\| string[]` | `'sequential'`; categorical when ≥2 series and all are lines | |
| `referenceLines` | `{ value, axis?: 'y'\|'y2'\|'x', label?, labelPlacement?, color?, dashed? }[]` | — | targets/thresholds; no legend entry |
| `echartOptions` | object | — | deep-merged; arrays replace |

Emits: `update:hiddenSeries(string[])`, `select({ name, value, row })` on click or Enter/Space on the keyboard cursor.
`timeGrain`: `second|minute|hour|day|week|month|quarter|year` (`format.ts:5-13`).

```vue
<!-- long data, stacked, a target line -->
<ChartCard class="h-72">
  <BarChart :data="rows" x="week" y="hours" split-by="department" :max-series="5"
            stacked :reference-lines="[{ value: 40, label: 'Target', dashed: true }]" />
</ChartCard>
```

Notes
- Legend only when there is more than one series (`BarChart.vue:56`).
- Values are coerced with `Number()`; `''`/`null`/non-numeric → gap (`axisChartCommon.ts:1129-1133`). Strings like `"12.5"` from the server plot fine.
- Category labels truncate or tilt automatically; there is no angle prop.
- A `y2` or `tooltipColumns` column with `splitBy` is read once per x (first row wins; dev warning on disagreement).

## 4. DonutChart, PercentageBarChart

| Prop | Type | Default | Notes |
|---|---|---|---|
| `data`, `category`, `value` | rows, column names | — | one row = one slice |
| `maxSlices` | number | 9 | keeps the largest `maxSlices-1`, rest → `OTHERS_KEY` slice (`slices.ts:37,175`) |
| `order` | `'size'\|'rows'` | `'size'` | `'rows'` keeps your order (months, ageing buckets) |
| `hiddenSlices` | `string[]` | — | `v-model:hiddenSlices` |
| `format` | `(n) => string` | — | readout + tooltip |
| `palette` | `ChartPalette` | `'categorical'` | |
| `colors` | `Record<category, color>` | — | pin a color to a slice, e.g. `{ Overdue: 'var(--ink-red-5)' }` |
| Donut only: `showDataLabels` (off), `centerLabel` (default = `value` key), `variant: 'full'\|'half'`, `echartOptions` | | | |

Emits: `update:hiddenSlices`, `select({ name, label, value, percent, rows })` — the Others slice carries all its rows. Donut slot `#center="{ label, value, formattedValue, percent? }"`.

## 5. FunnelChart

Props: `data` (one row per stage, in process order), `category`, `value`, `format`, `palette` (default sequential reversed). Emits `select({ name, label, value, row })`. Tooltip items carry the two conversion rates as `kind: 'context'`. No ECharts instance.

## 6. HeatmapChart, CalendarHeatmapChart

Heatmap: `data`, `x`, `y`, `value`, `min` (0 unless negatives), `max`, `xAxis`/`yAxis: { format? }`, `showDataLabels` (labels that collide are dropped), `format`, `palette: 'sequential'|'diverging'|string[]` (default sequential; diverging centers on 0), `echartOptions`. Emits `select({ x, y, value, row })`.

CalendarHeatmap: `data`, `date` (Date or ISO; time part ignored; later row wins on the same day), `value`, `start`/`end` (default: whole months of the data; both given → range drawn even with no data), `weekStart` (dayjs locale, else `'sunday'`), `min`, `max` (days above → deepest color, scale reads `≥ max`), `format`, `palette`, `echartOptions`. Emits `select({ date, value, row })` for days with data.

## 7. ScatterChart

Props: `data`, `x`, `y`, `size?`, `splitBy?`, `label?` (point name column; needed by `showDataLabels`), `hiddenSeries` (`v-model`), `xAxis`/`yAxis: ChartValueAxisOptions`, `palette` (default categorical), `referenceLines` (`axis: 'x'` takes a number — quadrants), `format`, `echartOptions`. Emits `update:hiddenSeries`, `select({ name, x, y, size, label?, row })`.

## 8. SankeyChart

Props: `data` (one row per flow), `source`, `target`, `value`, `vertical`, `nodeAlign: 'left'|'right'|'justify'` (default justify), `format`, `palette` (categorical), `echartOptions`. Emits `select({ source, target, value, row })` for bands only (nodes emit nothing).

## 9. NumberCard

Draws its own `ChartCard` (`NumberCard.vue:2`); `card` defaults to `true` (`NumberCard.vue:246`).

| Prop | Type | Notes |
|---|---|---|
| `title` | string | required |
| `value` | `number \| string \| null` | `null` → empty state; a string renders as given (no formatting) |
| `format` | `(n) => string` | value and target |
| `prefix`, `suffix` | string | around the value |
| `target` | `number \| string` | muted ` / target` |
| `delta` | `number \| null` | sign drives the arrow |
| `deltaPrefix`, `deltaSuffix`, `deltaCaption`, `deltaFormat` | | `deltaFormat` gets the absolute value |
| `negativeIsBetter` | boolean | flips delta colors |
| `color` | string | ink of the number only |
| `sparkline` | `{ data: (number\|null)[], type?: 'area'\|'line'\|'bar', color? }` | oldest first; default area |
| `progress` | `{ value: percent, color? }` | bar under the number; >100 fills with a gap at 100 |
| `card` | boolean | `false` inside your own card |
| `loading`, `error`, `dir`, `title` | | no `subtitle` |

Slots: `#actions`, `#title-suffix`, `#caption="{ caption }"` (e.g. a period Dropdown), state slots.

```vue
<NumberCard title="Open jobs" :value="42" :delta="-3" delta-caption="vs last week"
            :sparkline="{ data: [30, 35, 41, 45, 42] }" />
```

## 10. Chrome parts

| Part | Props | Slots / emits |
|---|---|---|
| `ChartCard` | `card` (default `true`), `dir` | default. Surface = `rounded-4 border border-outline-gray-1 bg-surface-elevation-2 px-4 py-3`; always `relative overflow-hidden` (`ChartCard.vue:18-24`) |
| `ChartContainer` | `title`, `subtitle`, `yAxisTitle`, `y2AxisTitle`, `axisTitlePlacement: 'top'\|'bottom'`, `loading`, `error`, `empty`, `centered`, `dir` | default (plot), `#legend`, `#actions`, `#title-suffix`, `#loading`, `#error`, `#empty`; sets `data-state` = ready/loading/error/empty; plot stays mounted in every state |
| `ChartLegend` | `items: { name, label, color, hidden, hint?, weight?, formattedValue? }[]` | emits `change(name)`, `highlight(name \| null)`; overflow → "+N more" ranked by `weight` |
| `ChartTooltip` | `open`, `x`, `y` (viewport px), `label?`, `items: ChartTooltipItem[]`, `rows`, `dir` | default slot `{ label, items, rows }` replaces the body |

## 11. Custom plots

- `registerChartModules([...])` = ECharts `use`; `useChart` registers nothing for you.
- `useChart({ container: Ref<HTMLElement>, option: () => option, events?, onZrEvents? })` → `{ chart, dispatch, resize, width, height }`. Inits once the box has a size and fonts settled, resizes on `ResizeObserver`, disposes on unmount, `setOption(..., { notMerge: true })` on every change (only the first draw animates). `events` are bound once.
- `useChartTokens(elRef)` → `{ tokens }` (computed; re-reads when `<html>` `data-theme|dir|lang|class` change): `categorical`, `sequential`, `diverging` ramps plus `axisLabel`, `axisTitle`, `axisLine`, `gridline`, `dataLabel`, `insideLabel`, `backdrop`.
- `paletteColors(palette, tokens, count, fallback = 'sequential')` → `count` colors; lists and categorical cycle, sequential/diverging spread evenly.
- `OTHERS_KEY` — key of the "Others" series/slice; style it with `seriesConfig[OTHERS_KEY]` / `colors[OTHERS_KEY]`.
See `docs/Overview.md` "Custom charts" for a full radar example.

## 12. Colors and theming

- Ramps in `style.css`: `--chart-categorical-1…10` (5 hue families blue, emerald, violet, amber, red, each dark then light), `--chart-sequential-1…9` (dark → light blue), `--chart-diverging-1…9` (blue → pale yellow → red); `--chart-gridline` (`--outline-gray-1`, dark `--outline-gray-2`), `--chart-axis-line`, `--chart-inside-label`, optional `--chart-backdrop`. Dark values under `[data-theme='dark']`.
- Rebrand every chart: redefine the `--chart-*` variables (globally or on a subtree — tokens are read from the plot element). Per chart: `palette` (name or color list), `seriesConfig[key].color`, donut/bar `colors`. Any color may be `var(--token)`.
- Default palettes: axis charts `sequential` (lines get the dark end, bars the light end — `axisChartCommon.ts:112-196`), categorical when ≥2 series and all are lines; donut, percentage bar, scatter, sankey `categorical`; funnel sequential reversed; heatmaps sequential.

## 13. Gotchas (ranked)

1. No height → no chart: plotted charts fill their parent (`ChartContainer.vue:5-9`); wrap in `<ChartCard class="h-80">` or give the parent a height.
2. Built-in plotted charts draw no card; only `NumberCard` does (`NumberCard.vue:2`). Use `ChartCard` around the others; `card=false` on NumberCard inside your own card.
3. Multi-series bars default to shades of one blue (`axisChartCommon.ts:112`); pass `palette="categorical"` for unrelated categories.
4. `echartOptions.series: [...]` at chart level replaces all generated series; use `seriesConfig[key].echartOptions` for one series (`docs/Overview.md`).
5. Instance changes do not survive: every prop/data/theme change rebuilds with `notMerge: true` (`core/useChart.ts`); `chart` is `undefined` until sized — watch it, do not read it once in `onMounted`.
6. `maxSeries` applies only with `splitBy`; with a `y` list it only warns (`docs/BarChart.md`).
7. `frappe-ui/charts` `DonutChart`/`FunnelChart` ≠ `frappe-ui/experimental` `DonutChart`/`FunnelChart` (v1, `config` prop) — same names, different APIs.
8. Numbers format in `<html lang>`; an empty `lang` means `en-US` (`utils.ts:130-143`).
