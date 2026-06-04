import { planRoute, urgency } from '../src/domain/engine'
import { DEPOT, seedReports } from '../src/domain/seed'

console.log('— Score d\'urgence (top 5) —')
seedReports
  .filter((r) => r.status !== 'resolu')
  .map((r) => ({ r, u: urgency(r, seedReports) }))
  .sort((a, b) => b.u.score - a.u.score)
  .slice(0, 5)
  .forEach(({ r, u }) =>
    console.log(`  ${r.quartier.padEnd(14)} score=${u.score} (${u.level}) récurrence=${u.recurrence}`),
  )

const active = seedReports.filter((r) => r.ville === 'Yaoundé' && r.status !== 'resolu')
const plan = planRoute(active, DEPOT)
console.log('\n— Tournée Yaoundé —')
console.log(`  points: ${active.length}`)
console.log(`  non optimisée: ${plan.naiveKm.toFixed(1)} km`)
console.log(`  optimisée:     ${plan.optimizedKm.toFixed(1)} km`)
console.log(`  économisé:     ${plan.savedKm.toFixed(1)} km = ${plan.litersSaved.toFixed(1)} L = ${Math.round(plan.fcfaSaved)} FCFA = ${plan.co2SavedKg.toFixed(1)} kg CO2`)
