// Slots that are never drawn, in a whole Vue app built on frappe-ui (skill frappe-ui-screens). Two checks:
// 1. loose children inside a component that has NO default slot (they vanish);
// 2. a named `<template #name>` for a slot the component does not declare (it vanishes too).
// Slots are read from the component's own source: frappe-ui's `src/components/<Name>/<Name>.vue` (and molecules), and the
// app's components by their import path. A component with a dynamic slot name (`:name="…"`) is checked for loose children only.
// Run from the frontend folder: NODE_PATH=$PWD/node_modules node -e "require('module').Module._initPaths(); require('<this file>')"
const { parse } = require('@vue/compiler-sfc')
const fs = require('fs'), path = require('path')
const ROOT = process.cwd(), SRC = path.join(ROOT, 'src'), FUI = path.join(ROOT, 'node_modules/frappe-ui/src')
function files(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => d.isDirectory() ? files(path.join(dir, d.name)) : d.name.endsWith('.vue') ? [path.join(dir, d.name)] : []) }
const slotCache = new Map()
function slotsOf(file) {
  if (slotCache.has(file)) return slotCache.get(file)
  let out = null
  try {
    const src = fs.readFileSync(file, 'utf8')
    const tpl = (src.match(/<template>[\s\S]*<\/template>/) || [''])[0]
    const names = new Set(); let dynamic = false, hasDefault = false
    // A render-function component (Button) declares its slots as `SlotsType<{ name?: …; … }>`: read them there.
    const typed = src.match(/SlotsType<\{([\s\S]*?)\}>/)
    if (!/<slot\b/.test(tpl)) {
      if (!typed) { slotCache.set(file, null); return null }
      for (const m of typed[1].matchAll(/(?:^|[\s;,{])['"]?([\w-]+)['"]?\??\s*:/g)) (m[1] === 'default' ? (hasDefault = true) : names.add(m[1]))
      out = { names, dynamic: false, hasDefault }
      slotCache.set(file, out); return out
    }
    for (const m of tpl.matchAll(/<slot\b([^>]*?)\/?>/g)) {
      const attrs = m[1]
      const named = attrs.match(/(?:^|\s)name="([^"]+)"/)
      if (/:name=|v-bind:name=/.test(attrs)) dynamic = true
      else if (named) names.add(named[1]); else hasDefault = true
    }
    // a component that forwards every slot (v-for over $slots / slots) accepts any name
    if (/v-for="\(\s*_?,?\s*\w*\s*\)?\s*(in|of)\s*(\$slots|slots)/.test(tpl) || /#\[\w+\]/.test(tpl)) dynamic = true
    out = { names, dynamic, hasDefault }
  } catch { out = null }
  slotCache.set(file, out); return out
}
// Family members live in their family's folder (`SettingsDialog/SettingsRow.vue`, `Sidebar/SidebarItem.vue`).
let fuiDirs = null
function fuiFile(tag) {
  for (const base of [path.join(FUI, 'components', tag, tag + '.vue'), path.join(FUI, 'molecules/list', tag + '.vue')]) if (fs.existsSync(base)) return base
  if (!fuiDirs) { try { fuiDirs = fs.readdirSync(path.join(FUI, 'components'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name) } catch { fuiDirs = [] } }
  for (const dir of fuiDirs) { const f = path.join(FUI, 'components', dir, tag + '.vue'); if (fs.existsSync(f)) return f }
  return null
}
let hits = 0
for (const f of files(SRC)) {
  const src = fs.readFileSync(f, 'utf8')
  const { descriptor } = parse(src)
  if (!descriptor.template || !descriptor.template.ast) continue
  const imports = new Map()
  for (const m of (descriptor.scriptSetup?.content || descriptor.script?.content || '').matchAll(/import\s+(\w+)\s+from\s+['"]([^'"]+\.vue)['"]/g)) {
    const p = m[2].startsWith('@/') ? path.join(SRC, m[2].slice(2)) : path.resolve(path.dirname(f), m[2])
    imports.set(m[1], p)
  }
  const walk = (node) => {
    for (const child of node.children || []) {
      if (child.type === 1 && /^[A-Z]/.test(child.tag)) {
        const file = imports.get(child.tag) || fuiFile(child.tag)
        const s = file && slotsOf(file)
        if (s) {
          const named = (child.children || []).filter((c) => c.type === 1 && c.tag === 'template' && c.props.some((p) => p.type === 7 && p.name === 'slot'))
          if (!s.hasDefault && !s.dynamic) {
            const loose = (child.children || []).filter((c) => (c.type === 1 && !named.includes(c)) || (c.type === 2 && c.content.trim()) || c.type === 5)
            if (loose.length) { hits++; console.log(`${path.relative(ROOT, f)}:${child.loc.start.line} <${child.tag}> has no default slot; holds ${loose.map((c) => c.tag || 'text').join(', ')}`) }
          }
          if (!s.dynamic) for (const t of named) {
            const dir = t.props.find((p) => p.type === 7 && p.name === 'slot')
            const name = dir.arg ? (dir.arg.isStatic ? dir.arg.content : null) : 'default'
            if (name && name !== 'default' && !s.names.has(name)) { hits++; console.log(`${path.relative(ROOT, f)}:${t.loc.start.line} <${child.tag}> has no slot «${name}» (it has: ${[...s.names].join(', ') || 'none'})`) }
            if (name === 'default' && !s.hasDefault) { hits++; console.log(`${path.relative(ROOT, f)}:${t.loc.start.line} <${child.tag}> has no default slot`) }
          }
        }
      }
      walk(child)
    }
  }
  walk(descriptor.template.ast)
}
console.log('hits', hits)
