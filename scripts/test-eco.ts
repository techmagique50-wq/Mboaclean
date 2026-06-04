import { askAssistant, dailyTip } from '../src/domain/eco'

console.log('Conseil du jour :', dailyTip().title)
console.log('---')
for (const q of [
  'comment je trie mes ordures ?',
  'est-ce que je peux bruler les dechets',
  'parle moi du compost',
  'les sachets plastiques',
  'inondation caniveau',
  'bonjour ça va ?',
]) {
  const r = askAssistant(q)
  console.log(`Q: ${q}\n→ [${r.matched ?? 'aucun'}] ${r.answer.slice(0, 70)}...\n`)
}
