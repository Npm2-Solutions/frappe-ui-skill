# Design sources: the outside UI/UX guides behind design.md

What is in this file: where the outside rules in [design.md](design.md) came from — the guides and skills opened (with URLs and licences), the map from each researched principle to the design.md section that now holds it, the principles that were left out because they do not fit app screens built with frappe-ui, and the conflicts between the guides with the side frappe-ui takes. The principles themselves, and the frappe-ui gotchas they exposed, now live in design.md, each with its source names in [brackets]; this file is for checking a rule's origin.

Sections
1. [Sources](#1-sources)
2. [Where each principle went in design.md](#2-where-each-principle-went-in-designmd)
3. [Principles that do not fit](#3-principles-that-do-not-fit)
4. [Conflicts, and which side frappe-ui takes](#4-conflicts-and-which-side-frappe-ui-takes)

Research done on 10 Nov 2026; principles written in our own words with attribution. Paths in `file:line` are relative to `node_modules/frappe-ui/src/` unless they start with `tailwind/`.

---

## 1. Sources

All opened on 10 Nov 2026. A search snippet was never used as a source. "Rel." = how much is relevant to app screens.

| Key | Name | URL (opened) | License | Covers | Rel. |
|---|---|---|---|---|---|
| AFD | Anthropic skill `frontend-design` | https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md (+ `LICENSE.txt` beside it) | Apache-2.0 | art direction, type, motion, writing for interfaces, quality floor | Low–mid: mostly web pages; its "writing for interfaces", quality floor and "structure carries information" apply |
| AWB | Anthropic skill `web-artifacts-builder` | https://raw.githubusercontent.com/anthropics/skills/main/skills/web-artifacts-builder/SKILL.md | see its LICENSE.txt (not opened) | one anti-slop line (centred layouts, purple gradients, uniform radius, Inter) | Low |
| AWT | Anthropic skill `webapp-testing` | https://raw.githubusercontent.com/anthropics/skills/main/skills/webapp-testing/SKILL.md | see its LICENSE.txt (not opened) | reconnaissance-then-action: wait for network idle, screenshot, then pick selectors from what rendered | Low (verification method) |
| VWG | Vercel Web Interface Guidelines (site) + `command.md` (the rules the `web-design-guidelines` skill fetches) | https://vercel.com/design/guidelines · https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md · repo https://github.com/vercel-labs/web-interface-guidelines | MIT (repo label) | interactions, focus, forms, loading, URL state, content, performance, copy | **High** |
| IMP | impeccable (pbakaus), v4.8.2: `SKILL.md`, `reference/operate.md`, `craft-floor.md`, `harden.md`, `clarify.md` | https://github.com/pbakaus/impeccable · https://raw.githubusercontent.com/pbakaus/impeccable/main/.claude/skills/impeccable/reference/operate.md (and the others in that folder) | Apache-2.0 (built on AFD) | "Operate" mode = app UI; edge cases; UX writing; bans | **High** (operate, harden, clarify) |
| UUX | ui-ux-pro-max (nextlevelbuilder): `SKILL.md` + `data/ux-guidelines.csv` | https://github.com/nextlevelbuilder/ui-ux-pro-max-skill · https://raw.githubusercontent.com/nextlevelbuilder/ui-ux-pro-max-skill/main/.claude/skills/ui-ux-pro-max/data/ux-guidelines.csv | MIT | priority-ordered rule list (a11y, touch, perf…); 120 UX rows; style/palette catalogues | Mid (UX rows yes; style catalogue no) |
| NNG | Jakob Nielsen, 10 usability heuristics | https://www.nngroup.com/articles/ten-usability-heuristics/ | © Nielsen; reuse allowed with credit + link | the classic heuristics H1–H10 | **High** (foundation) |
| PRI | GitHub Primer, product UI patterns: Saving, Loading, Empty states, Forms; component DataTable | https://primer.style/product/ui-patterns/saving/ · …/loading/ · …/empty-states/ · …/forms/ · https://primer.style/product/components/data-table/ | MIT (primer/design repo) | save, loading thresholds, empty states, validation, tables | **High** |
| ATL | Atlassian Design: Designing messages; Error messages | https://atlassian.design/foundations/content/designing-messages/ · …/designing-messages/error-messages | © Atlassian (no open license stated) | message types and where they live; error writing | Mid–high |
| POL | Shopify Polaris, Index table (docs source in the Polaris repo; the site 301s to shopify.dev) | https://raw.githubusercontent.com/Shopify/polaris/main/polaris.shopify.com/content/components/tables/index-table.mdx · LICENSE.md in same repo | modified MIT (use limited to apps that work with Shopify), so paraphrase only | index vs data table vs resource list, bulk actions, paging | Mid |
| HIG | Apple Human Interface Guidelines, Modality (page JSON) | https://developer.apple.com/tutorials/data/design/human-interface-guidelines/modality.json | © Apple | when to go modal, dismissal, no stacking | Mid |
| LIN | Linear: "How we redesigned the Linear UI (part II)" and "Behind the latest design refresh" (2026) | https://linear.app/now/how-we-redesigned-the-linear-ui · https://linear.app/now/behind-the-latest-design-refresh | © Linear | density with calm, dimmer sidebar, few icons, predictable action places | Mid |
| RUI | Refactoring UI (book site: chapter list only) | https://refactoringui.com/ | © The UI Company | chapter titles used only as pointers (the book is not open) | Mid (titles only) |
| GOV | GOV.UK Design System, Validation pattern | https://design-system.service.gov.uk/patterns/validation/ | OGL v3.0 | when to validate, error summary, keep input | Mid–high (forms) |

Tried and not used: Material 3 Dialogs (`m3.material.io`, a JS-only page that returned only its title); the Refactoring UI
Medium article (403); the Polaris site pages (301 to a generic shopify.dev page); web.archive.org (blocked). Material is
therefore **not** a source here.

Local frappe-ui files read to name things right: `references/{setup-and-tokens,inputs,display,overlays,navigation,list,data,charts}.md`,
plus `components/{Badge,PageHeader,TextInput,Textarea,Dialog,Spinner,Sidebar}/*.vue`, `utils/dialog.ts`, `charts/docs/States.md`,
`components/{Toast,Alert,Dialog,Badge,Skeleton}/*.md`, and the colour data in `tailwind/tokens.js`.

Names used in design.md's [brackets]: [Anthropic] = AFD, AWB, AWT · [Vercel] = VWG · [impeccable] = IMP · [ui-ux-pro-max] = UUX · [Nielsen H1–H10] = NNG · [Primer] = PRI · [Atlassian] = ATL · [Polaris] = POL · [Apple HIG] = HIG · [Linear] = LIN · [Refactoring UI] = RUI · [GOV.UK] = GOV.

---

## 2. Where each principle went in design.md

The research listed about 85 principles (A1–M5; ★ = most worth carrying). All that fit were merged into design.md; those already said there by the design skill or by frappe-ui were not repeated, only tagged.

| Group | Principles → design.md section |
|---|---|
| A Hierarchy and layout | A1 → 1.2 · A2★ → 1.3 · A3 → 1.2 · A4 → 1.2, §4 · A5 → 1.8 · A6 → §4 (lookalikes), SKILL contract · A7 → 1.5 · A8 → 1.5 |
| B Density and spacing | B1 → 1.4 · B2 → 1.4 · B3 → 1.5, 1.8 (concentric radii) |
| C Typography | C1 → 1.6 · C2★ → 1.6, 2.1 · C3 → 1.6, 2.2 · C4 → 1.6 · C5 → 1.6 |
| D Colour and state | D1 → 1.7 · D2★ → 1.7 · D3★ → 1.7 · D4★ → 1.2 (contrast table), 1.7 · D5 → 1.8 · D6 → 1.13 |
| E Forms and input | E1 → 1.13, 2.5 · E2 → 2.5 · E3★ → 2.5 · E4 → 2.5 · E5 → 2.5 · E6★ → 2.4, 2.2 · E7 → 2.5 · E8 → 2.5 · E9 → 2.5 · E10 → 2.5 · E11 → 1.13 · E12 → 1.9, 2.4 |
| F Feedback, loading, empty, error | F1 → 1.10 · F2★ → 1.9 · F3★ → 1.9 · F4★ → 1.9 · F5 → 1.9, 1.12 · F6★ → 1.10 · F7★ → 1.10, 2.5 · F8 → 1.10 · F9 → 1.10, 2.1 |
| G Navigation and wayfinding | G1 → 1.14 · G2★ → 1.14, 2.1 · G3 → 1.14 · G4 → 1.14, 2.7 · G5 → 1.3, 2.2 · G6 → 1.14 · G7 → 1.1 |
| H Tables and lists | H1 → 2.1 · H2 → 2.1 · H3 → 2.1 · H4 → 2.1 · H5 → 2.1 · H6 → 2.1 · H7 → 2.1 · H8 → 2.7 |
| I Dialogs and overlays | I1★ → 2.5 · I2 → 2.5, 1.12 · I3 → 2.5 · I4 → 2.5 · I5 → 2.5 · I6 → overlays.md (`portalTo`) · I7 → 1.13 |
| J Accessibility and keyboard | J1 → 1.13 · J2 → 1.13 · J3 → 1.13 · J4 → 1.13 · J5 → 1.13, 2.6 · J6 → 1.11 |
| K Mobile | K1 → 2.7 · K2★ → 2.7 · K3★ → 2.7 · K4 → 2.7 · K5 → 1.13 · K6 → 2.7 · K7 → 2.7 |
| L Copy and microcopy | L1 → 1.12 · L2★ → 1.12 · L3 → 1.12 · L4 → 1.10 · L5 → 1.12 |
| M Performance as felt | M1 → 1.9, 2.3 · M2 → 2.1 (per-row writes), 1.10 · M3 → 1.14 · M4 → 1.9 · M5 → §3 checklist intro |
| Gotchas found (research §5) | PageHeaderTitle span → 1.13 · 13/14px inputs on phones → 2.7 · placeholder/meta/amber contrast → 1.2, 1.7 · `dialog.*` button order and generic labels → 2.5, 1.12 · `autocomplete="off"` → 2.5 · no CSS `color-scheme` → 1.13 · `List` without tabular figures, empty, loading → 1.6, 2.1 · exact-match `SidebarItem` → 1.14 |

One correction made while merging (checked in source): an empty `required` field in `dialog.prompt` is blocked before any `validate` runs (utils/dialog.ts:524-567), so a `validate` cannot supply its message — design.md 2.5 says to leave `required` off or use a `Dialog`.

---

## 3. Principles that do not fit

- **Hero-first page, one bold aesthetic direction, a memorable focal moment** (AFD; IMP "Persuade/Experience" modes). App
  screens are "Operate" (IMP itself says so), and frappe-ui is already the visual world.
- **A distinctive typeface, or "avoid Inter"** (AFD; AWB). frappe-ui is built on Inter, with its own weight (420), tracking
  and size classes. A second family breaks that scale.
- **A per-project palette of 4–6 hex colours, or a style chosen from a catalogue** (AFD plan step; UUX's 50+ styles and
  192 palettes). frappe-ui's colours are fixed semantic tokens. Raw hex bypasses dark mode.
- **Title Case for buttons and headings, "&" instead of "and"** (VWG; Vercel itself marks these as its own brand choices).
  frappe-ui writes sentence case.
- **Two-layer shadows tinted toward the background hue** (VWG design). frappe-ui's shadows are fixed light-only tokens, and
  elevation comes from the `surface-elevation-*` steps.
- **Accent borders and decorated backgrounds as finishing touches** (RUI chapter titles). IMP bans thick coloured side
  borders, and frappe-ui's `Alert` container is neutral by design (Alert.vue:176).
- **A 16px base font with 1.5 line height everywhere** (UUX). frappe-ui's body is 14px at 1.35 for single-line UI, with
  `text-p-*` for paragraphs. The 16px rule matters only for mobile inputs (K3).
- **Mobile-first for every screen** (UUX). Business apps are designed per role. `DesktopShell` and `MobileShell` are two
  layouts, not one fluid layout.
- **Theme the caret, text selection and scrollbars from the palette** (IMP craft-floor, "browser surfaces"). `ScrollArea`
  owns the scrollbars, and the rest is best left native in tools.
- **Image, video, GIF, preconnect and font-preload rules** (VWG performance; UUX #46–#51). They are about page media, not
  app screens. frappe-ui bundles Inter with `font-display: swap`.
- **React and SSR specifics** (VWG hydration, `nuqs`, `suppressHydrationWarning`). frappe-ui apps are Vue SPAs.
- **Warm, illustrated first-use empty states** (PRI, with its Octocat art). frappe-ui has no illustration set. For trade
  tools an icon and one plain sentence are enough (F4).
- **Feature-discovery spotlights** (ATL). There is no such part. At most a dismissible `SidebarCard`.
- **`touch-action: manipulation` and tap-highlight tweaks** (VWG; UUX #25). Little value in modern browsers with a
  `width=device-width` viewport. Harmless, but not worth a rule.

---

## 4. Conflicts, and which side frappe-ui takes

| Topic | One side | Other side | frappe-ui's intent and the rule to keep |
|---|---|---|---|
| Capitalisation | VWG: Title Case for buttons and headings in product UI | AFD, PRI forms, ATL: sentence case | **Sentence case.** frappe-ui's labels and examples use it ("New job", "Delete project", default `'Cancel'`). Older parts are the exception: the editor toolbar ("Bullet List") and `KeyboardShortcutsDialog` title `'Keyboard Shortcuts'`. |
| When to validate | GOV: on submit only | PRI: submit first, then inline on change/blur; UUX #56: on blur | **Submit first, then re-check the fields that had errors as they change.** No timing is built in; `dialog.prompt` checks on confirm, and an empty required field blocks silently (utils/dialog.ts:566), so add your own message. |
| Toasts | PRI: avoid toasts on github.com and confirm inline | ATL flags; VWG announces toasts; UUX: auto-dismiss after 3–5s | **Both, by role.** frappe-ui ships `toast` for the result of an action (4s, max 3) and `Alert` for a lasting message (Toast.md, Alert.md). When the page stays, confirm in place too: the saved field and the "Saved" state. |
| Disabled buttons | PRI: avoid them, keep save enabled and explain on click | VWG: disable once submitting starts; UUX #32: disable while processing | **`loading` during the request, not `disabled`.** `loading` blocks clicks without dimming (Button.vue:238). For "can't yet", keep the button enabled and explain, because a disabled native button takes no hover or tooltip. |
| How often to use modals | IMP: a modal is the last resort | HIG, ATL: fine for short focused tasks | **Short tasks yes.** frappe-ui uses dialogs for rename and delete from a list (Dialog.md) and for settings (`SettingsDialog`). Long record forms go on a page. |
| Contrast metric | VWG: prefer APCA | UUX, IMP: WCAG 4.5:1 | **WCAG 2** is the legal baseline (EN 301 549 / WCAG 2.1 AA). The token ratios are in D4. |
| Typeface | AFD: distinctive type; AWB: avoid Inter | IMP operate: one sans for UI; LIN: Inter | **Inter**, the library's font. |
| Spinner or skeleton | PRI: the spinner is the flexible default, skeletons for large areas | IMP: skeletons, not spinners in the middle of content | **A region gets a placeholder of its shape; a button or inline wait gets a spinner.** That is frappe-ui's own chart rule (States.md). |
| Reduced motion | VWG, UUX: reduce or turn off | PRI: keep subtle animation, since loaders mean status | **Reduce, don't remove status motion.** The Spinner slows to 1.6s instead of stopping (Spinner.vue:163); menus and popovers drop their motion. |
| Button order | PRI page forms: Save bottom-left, Cancel to its right | PRI dialogs: bottom-right, Cancel left of Save | **In dialogs, primary rightmost** (utils/dialog.ts:388; Dialog.vue:120 `justify-end`). On pages, the primary goes in `PageHeader` at the right, so pages follow the same end-aligned rule rather than Primer's bottom-left. |
| White space | RUI: "start with too much white space" | IMP operate, LIN: dense is right for tools | **Compact controls, air between groups.** frappe-ui defaults to 14px text and 28px controls; spacing goes between sections, not inside rows. |
| Hit targets | VWG: 24px with a mouse, 44px on touch | UUX: 44pt/48dp, 24px floor on web | **By pointer.** `sm` (28px) on desktop, `lg` with 44px hit areas on touch (K2). |

