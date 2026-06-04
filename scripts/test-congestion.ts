import { bestInterventionWindow, departureAdvice, congestionAt, fmtHour, travelMinutes } from '../src/domain/congestion'
for (const z of ['normale','marche','ecole'] as const) {
  const w = bestInterventionWindow(z)
  console.log(`zone ${z.padEnd(8)} → créneau ${fmtHour(w.hour)}-${fmtHour(w.endHour)} (${w.level}) : ${w.reason}`)
}
console.log('\nCongestion marché:', [6,8,12,17,20].map(h=>`${fmtHour(h)}=${congestionAt('marche',h).toFixed(2)}`).join('  '))
const d = departureAdvice(28.3)
console.log(`\nTournée 28.3km → départ ${fmtHour(d.bestHour)}: ${Math.round(d.minutesBest)}min ; pointe ${fmtHour(d.peakHour)}: ${Math.round(d.minutesPeak)}min → ${Math.round(d.minutesSaved)}min gagnées`)
console.log('Trajet 5km à 8h vs 5h:', Math.round(travelMinutes(5,8)), 'vs', Math.round(travelMinutes(5,5)), 'min')
