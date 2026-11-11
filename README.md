# frappe-ui-screens — an Agent Skill for building app screens with frappe-ui

An Agent Skill ([what skills are](https://github.com/anthropics/skills)) that teaches a coding agent (Claude Code, or any tool that loads `SKILL.md` skills) to build and review Vue screens with [frappe-ui](https://github.com/frappe/frappe-ui) **1.1.0** — lists, record pages, forms, dialogs, shells and sidebars, tabs, trees, menus, toasts, charts, editors — and to fetch Frappe data with `useCall`, `useList`, `useDoc`, `useDoctype` and `useNewDoc`.

frappe-ui mistakes usually fail silently: a class that produces no CSS, a slot that is never drawn, a `useCall` that returns `null` with no error. Everything here was read from frappe-ui's own source, and every gotcha cites the file and line, so the agent can check it instead of guessing.

## What is inside

| Path | Holds |
|---|---|
| `SKILL.md` | How to work, the contracts true across the library, the house style, which component for what, the gotchas that fail silently |
| `references/inputs.md`, `display.md`, `overlays.md`, `navigation.md`, `list.md` | Every component's props, slots, events and option shapes, with `file:line` |
| `references/data.md` | The v2 data composables, the frozen v1 resources, caching, errors, dates |
| `references/setup-and-tokens.md` | Package entries, Vite plugins, the Tailwind preset and every semantic token, dark mode |
| `references/charts.md`, `editors.md` | `frappe-ui/charts`, `frappe-ui/editor`, `frappe-ui/code-editor`, `frappe-ui/experimental` |
| `references/recipes.md` + `assets/recipes/` | frappe-ui's eight full recipe screens (mail, tickets, deals, accounting, files, tasks, discussions, compose), desktop and mobile, with screenshots |
| `references/design.md` | UI/UX rules for app screens, written in frappe-ui's tokens and components: principles, a composition per screen type, a review checklist, what not to do |
| `references/design-sources.md` | Where each design rule comes from (14 sources, with URLs and licences) and where they disagree |
| `scripts/slotscan.cjs` | Scans a whole Vue app for slot content that is never drawn |

## Install

Personal (every project):

```bash
git clone https://github.com/Npm2-Solutions/frappe-ui-skill ~/.claude/skills/frappe-ui-screens
```

One project only: clone it into `.claude/skills/frappe-ui-screens` inside the project.

The agent loads it when a task touches a frappe-ui screen; you can also ask for it by name.

## How it relates to frappe-ui's own skill

frappe-ui ships a short skill of its own in its repo (`skills/frappe-ui`: core rules, data, setup). This one goes further — every component's API read from source, the gotchas, the recipes walked through, design rules for app screens — and cites frappe-ui's skill where it agrees. It has a different name, so both can be installed side by side.

## Version

Written against frappe-ui **1.1.0**. Later versions may change props, slots and line numbers: where this skill and the installed code disagree, the code wins.

## Licence and credits

MIT — see [LICENSE](LICENSE). frappe-ui is © Frappe Technologies Pvt. Ltd. (MIT); the recipe screenshots show its screens. taste-skill is © Leonxlnx (MIT). The other design guides are paraphrased with attribution. Details in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Not affiliated with or endorsed by Frappe Technologies.

Issues and pull requests are welcome.
