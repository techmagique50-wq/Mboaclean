import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs'
import { join } from 'path'

const repls = [
  ['bg-white/95', 'bg-card/95'],
  ['bg-white/90', 'bg-card/90'],
  ['bg-white', 'bg-card'],
  ['bg-slate-50', 'bg-hover'],
  ['bg-slate-100', 'bg-hover'],
  ['ring-slate-200', 'ring-line'],
  ['ring-slate-100', 'ring-line'],
  ['border-slate-200', 'border-line'],
  ['border-slate-100', 'border-line'],
  ['divide-slate-100', 'divide-line'],
  ['divide-slate-200', 'divide-line'],
  ['text-slate-700', 'text-ink'],
  ['text-slate-600', 'text-muted'],
  ['text-slate-500', 'text-muted'],
  ['text-slate-400', 'text-faint'],
  ['text-slate-300', 'text-faint'],
  ['text-[#0f4d2a]', 'text-brand-strong'],
  ['text-[#1b7a43]', 'text-brand'],
  ['bg-[#eaf3ec]', 'bg-brand-soft'],
  ['from-[#eaf3ec]', 'from-brand-soft'],
  ['to-white', 'to-card'],
]

const dirs = ['src/pages', 'src/components']
let changed = 0
for (const d of dirs) {
  for (const f of readdirSync(d)) {
    const p = join(d, f)
    if (!statSync(p).isFile() || !f.endsWith('.tsx')) continue
    let txt = readFileSync(p, 'utf8')
    const before = txt
    for (const [a, b] of repls) txt = txt.split(a).join(b)
    if (txt !== before) { writeFileSync(p, txt); changed++; console.log('  retheme', p) }
  }
}
console.log(`Fichiers modifiés: ${changed}`)
