import { personalizedDailyTip, recommendedCategories } from '../src/domain/eco'
const cases = [
  { label: 'brûle + ne trie pas', h: { brule: true, trie: false } },
  { label: 'sachets + près eau', h: { sachets: true, presEau: true } },
  { label: 'jardin, pas de compost', h: { jardin: true, compost: false } },
  { label: 'aucune habitude', h: {} },
]
for (const c of cases) {
  console.log(`\n[${c.label}]`)
  console.log('  catégories ciblées:', recommendedCategories(c.h).join(', '))
  const t = personalizedDailyTip(c.h)
  console.log('  conseil du jour:', `[${t.category}] ${t.title}`)
}
