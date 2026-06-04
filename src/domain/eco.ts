// ── Sensibilisation : conseils & assistant environnemental ───────────────────
// Base de connaissances locale (fonctionne hors-ligne). Conçue pour pouvoir
// être remplacée plus tard par un vrai modèle (API Claude) via askAssistant().

export type TipCategory =
  | 'tri'
  | 'recyclage'
  | 'reduction'
  | 'compost'
  | 'eau'
  | 'sante'
  | 'civisme'
  | 'general'

export const CATEGORY_LABEL: Record<TipCategory, { label: string; emoji: string }> = {
  tri: { label: 'Tri des déchets', emoji: '🗂️' },
  recyclage: { label: 'Recyclage', emoji: '♻️' },
  reduction: { label: 'Réduire', emoji: '✋' },
  compost: { label: 'Compost', emoji: '🪱' },
  eau: { label: 'Eau & drainage', emoji: '💧' },
  sante: { label: 'Santé', emoji: '🩺' },
  civisme: { label: 'Éco-civisme', emoji: '🤝' },
  general: { label: 'Environnement', emoji: '🌍' },
}

export interface EcoTip {
  id: string
  category: TipCategory
  title: string
  text: string
}

export const TIPS: EcoTip[] = [
  { id: 't1', category: 'tri', title: 'Séparez le sec et l’humide', text: "À la maison, gardez deux poubelles : une pour le sec (plastique, papier, métal) et une pour l’humide (restes alimentaires). C’est la base de tout recyclage." },
  { id: 't2', category: 'civisme', title: 'Ne brûlez pas vos ordures', text: "Brûler les déchets dégage des fumées toxiques (dioxines) dangereuses pour les poumons, surtout des enfants. Préférez le bac HYSACAM ou un point de collecte." },
  { id: 't3', category: 'eau', title: 'Un caniveau bouché = inondation', text: "Les sachets plastiques jetés dans les caniveaux bloquent l’eau et provoquent des inondations en saison des pluies. Ne jetez jamais de déchets dans les rigoles." },
  { id: 't4', category: 'reduction', title: 'Refusez le sachet plastique', text: "Gardez un panier ou un sac réutilisable pour le marché. Un sachet plastique sert 20 minutes mais pollue plus de 400 ans." },
  { id: 't5', category: 'compost', title: 'Vos épluchures sont de l’or', text: "Épluchures, restes de légumes et feuilles peuvent devenir du compost pour le jardin. Près de 60 % de nos ordures ménagères sont compostables." },
  { id: 't6', category: 'recyclage', title: 'La bouteille plastique a de la valeur', text: "Les bouteilles PET se recyclent. Rincez-les et regroupez-les : des récupérateurs les rachètent. Un déchet pour vous = une ressource pour un autre." },
  { id: 't7', category: 'sante', title: 'Les déchets attirent les moustiques', text: "Les eaux stagnantes dans les déchets (boîtes, pneus, sachets) sont des nids à moustiques et au paludisme. Évacuer les ordures protège la santé du quartier." },
  { id: 't8', category: 'tri', title: 'Les piles ne vont PAS à la poubelle', text: "Piles, batteries et ampoules contiennent des métaux lourds toxiques. Gardez-les à part et déposez-les dans un point de collecte spécialisé." },
  { id: 't9', category: 'civisme', title: 'Signalez, ça change tout', text: "Un dépôt sauvage signalé est un dépôt qui sera enlevé plus vite. Votre signalement sur MboaClean aide la mairie à prioriser." },
  { id: 't10', category: 'reduction', title: 'Réparez avant de jeter', text: "Un objet réparé, c’est un déchet en moins et de l’argent économisé. Soutenez les réparateurs de votre quartier." },
  { id: 't11', category: 'eau', title: 'Protégez les cours d’eau', text: "Les déchets près d’un cours d’eau finissent dans les rivières puis l’océan. Ne déposez jamais d’ordures au bord de l’eau." },
  { id: 't12', category: 'general', title: 'La règle des 3R', text: "Réduire, Réutiliser, Recycler — dans cet ordre. Le meilleur déchet est celui qu’on ne produit pas." },
  { id: 't13', category: 'recyclage', title: 'Le verre se recycle à l’infini', text: "Une bouteille en verre peut être refondue indéfiniment sans perdre en qualité. Ne la cassez pas dans la rue : regroupez-la." },
  { id: 't14', category: 'compost', title: 'Compost en ville aussi', text: "Même sans jardin, un petit composteur sur le balcon réduit vos ordures et les mauvaises odeurs de la poubelle." },
  { id: 't15', category: 'sante', title: 'Déchets médicaux : danger', text: "Seringues, médicaments périmés et pansements ne doivent jamais traîner. Ils peuvent blesser et transmettre des maladies — filière spéciale obligatoire." },
  { id: 't16', category: 'civisme', title: 'Donnez l’exemple aux enfants', text: "Les enfants imitent les adultes. Jeter au bon endroit devant eux installe le bon réflexe pour toute une génération." },
  { id: 't17', category: 'reduction', title: 'L’eau en sachet, modération', text: "Privilégiez une gourde réutilisable. Les sachets et bouteilles d’eau sont parmi les déchets les plus retrouvés dans les rues." },
  { id: 't18', category: 'tri', title: 'Aplatissez vos cartons', text: "Plier et aplatir cartons et bouteilles fait gagner de la place dans le bac et facilite la collecte." },
  { id: 't19', category: 'general', title: 'Un quartier propre attire', text: "La propreté améliore la santé, la fierté du quartier et même le commerce. C’est un investissement collectif." },
  { id: 't20', category: 'recyclage', title: 'Le métal a toujours preneur', text: "Boîtes de conserve, canettes, ferraille : le métal se revend et se recycle. Regroupez-le plutôt que de le jeter." },
  { id: 't21', category: 'eau', title: 'Avant la pluie, nettoyez', text: "En début de saison des pluies, dégagez les caniveaux près de chez vous. Cinq minutes peuvent éviter une inondation." },
  { id: 't22', category: 'civisme', title: 'Respectez les jours de collecte', text: "Sortez vos ordures aux horaires de passage du camion. Des sacs sortis trop tôt sont éventrés par les animaux et se dispersent." },
  { id: 't23', category: 'reduction', title: 'Achetez en vrac', text: "Acheter en grande quantité ou en vrac réduit les emballages. Moins d’emballage = moins de déchets." },
  { id: 't24', category: 'general', title: 'Chaque geste compte', text: "Un seul déchet bien jeté semble insignifiant ; multiplié par une ville entière, il change le cadre de vie." },
]

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000)
}

/** Conseil du jour : déterministe selon la date (change chaque jour). */
export function dailyTip(date = new Date()): EcoTip {
  return TIPS[dayOfYear(date) % TIPS.length]
}

// ── Personnalisation selon les habitudes ─────────────────────────────────────

/** Habitudes déclarées par l'utilisateur (tout est optionnel). */
export interface Habits {
  trie?: boolean // trie déjà ses déchets
  compost?: boolean // fait du compost
  sachets?: boolean // utilise des sachets plastiques
  brule?: boolean // brûle parfois ses ordures
  presEau?: boolean // habite près d'un cours d'eau / caniveau
  jardin?: boolean // dispose d'un jardin
  enfants?: boolean // a des enfants à la maison
}

export const HABIT_QUESTIONS: {
  key: keyof Habits
  question: string
  /** réponse qui déclenche des conseils (true = "oui", false = "non") */
  triggerOn: boolean
}[] = [
  { key: 'trie', question: 'Tu tries déjà tes déchets (sec / humide) ?', triggerOn: false },
  { key: 'compost', question: 'Tu fais du compost avec tes restes ?', triggerOn: false },
  { key: 'sachets', question: 'Tu utilises souvent des sachets plastiques ?', triggerOn: true },
  { key: 'brule', question: 'Il t’arrive de brûler tes ordures ?', triggerOn: true },
  { key: 'presEau', question: 'Tu habites près d’un cours d’eau ou d’un caniveau ?', triggerOn: true },
  { key: 'jardin', question: 'Tu as un jardin ou des plantes ?', triggerOn: true },
  { key: 'enfants', question: 'Il y a des enfants à la maison ?', triggerOn: true },
]

/** Catégories de conseils à prioriser, pondérées selon les habitudes. */
export function recommendedCategories(habits: Habits): TipCategory[] {
  const weight: Partial<Record<TipCategory, number>> = {}
  const add = (c: TipCategory, w: number) => (weight[c] = (weight[c] ?? 0) + w)

  if (habits.brule) add('civisme', 5)
  if (habits.trie === false) add('tri', 4)
  if (habits.compost === false) add('compost', 3)
  if (habits.jardin) add('compost', 2)
  if (habits.sachets) add('reduction', 3)
  if (habits.presEau) add('eau', 4)
  if (habits.enfants) add('sante', 2)
  add('general', 1) // toujours un peu de général

  return (Object.keys(weight) as TipCategory[]).sort((a, b) => weight[b]! - weight[a]!)
}

/**
 * Conseil du jour PERSONNALISÉ : choisi dans les catégories que l'utilisateur
 * gagnerait à améliorer, et qui change chaque jour.
 */
export function personalizedDailyTip(habits: Habits | undefined, date = new Date()): EcoTip {
  if (!habits || Object.keys(habits).length === 0) return dailyTip(date)
  const cats = recommendedCategories(habits)
  const pool = TIPS.filter((t) => cats.includes(t.category))
  const list = pool.length ? pool : TIPS
  return list[dayOfYear(date) % list.length]
}

// ── Assistant (base de connaissances locale) ─────────────────────────────────

export interface KbEntry {
  id: string
  topic: string
  keywords: string[]
  answer: string
}

const KB: KbEntry[] = [
  {
    id: 'k_tri',
    topic: 'Comment trier mes déchets ?',
    keywords: ['trier', 'tri', 'separer', 'separation', 'poubelle', 'organiser'],
    answer:
      "Le tri commence avec deux bacs :\n• 🟢 HUMIDE : restes alimentaires, épluchures (→ compost possible)\n• 🔵 SEC : plastique, papier/carton, métal, verre (→ recyclage)\nGardez à part les déchets dangereux (piles, médicaments). Aplatissez bouteilles et cartons pour gagner de la place.",
  },
  {
    id: 'k_plastique',
    topic: 'Que faire des plastiques ?',
    keywords: ['plastique', 'bouteille', 'sachet', 'pet', 'emballage'],
    answer:
      "Les bouteilles plastique (PET) se recyclent : rincez-les, regroupez-les, des récupérateurs les rachètent. Pour les sachets : le mieux est de les REFUSER (prenez un panier au marché). Ne jetez jamais de plastique dans les caniveaux — ils bouchent et provoquent des inondations.",
  },
  {
    id: 'k_brulage',
    topic: 'Puis-je brûler mes ordures ?',
    keywords: ['bruler', 'brulage', 'feu', 'fumee', 'incinerer', 'incineration'],
    answer:
      "Non, évitez de brûler vos ordures. La fumée contient des substances toxiques (dioxines) dangereuses pour les poumons, surtout ceux des enfants. Utilisez plutôt le bac HYSACAM, un point de collecte, ou signalez un dépôt sur MboaClean.",
  },
  {
    id: 'k_compost',
    topic: 'Comment faire du compost ?',
    keywords: ['compost', 'composter', 'epluchure', 'organique', 'jardin', 'engrais'],
    answer:
      "Le compost transforme vos déchets organiques en engrais :\n1. Mettez épluchures, restes de légumes, marc de café dans un bac aéré\n2. Évitez viande, poisson et huiles (odeurs)\n3. Mélangez de temps en temps et gardez humide\nEn 2 à 3 mois vous obtenez un terreau riche. ~60 % de nos ordures sont compostables !",
  },
  {
    id: 'k_inondation',
    topic: 'Déchets et inondations',
    keywords: ['inondation', 'caniveau', 'pluie', 'drainage', 'rigole', 'eau', 'drain'],
    answer:
      "Les déchets (surtout les sachets) bouchent les caniveaux et provoquent des inondations en saison des pluies. Gestes utiles : ne jetez rien dans les rigoles, dégagez le caniveau devant chez vous avant la pluie, et signalez les amas près des cours d'eau (urgence haute sur MboaClean).",
  },
  {
    id: 'k_piles',
    topic: 'Piles, batteries et déchets dangereux',
    keywords: ['pile', 'batterie', 'ampoule', 'dangereux', 'toxique', 'medicament', 'seringue'],
    answer:
      "Les piles, batteries, ampoules et déchets médicaux NE vont PAS dans la poubelle ordinaire : ils contiennent des métaux lourds toxiques. Gardez-les à part et déposez-les dans un point de collecte spécialisé. Sur MboaClean, classez-les en « déchets dangereux ».",
  },
  {
    id: 'k_sante',
    topic: 'Déchets et santé',
    keywords: ['sante', 'maladie', 'moustique', 'paludisme', 'microbe', 'odeur', 'danger'],
    answer:
      "Les tas d'ordures attirent rats, mouches et moustiques (paludisme), et les eaux stagnantes aggravent les risques. Évacuer rapidement les déchets protège la santé de tout le quartier — surtout près des écoles, marchés et centres de santé.",
  },
  {
    id: 'k_recyclage',
    topic: 'Qu’est-ce qui se recycle ?',
    keywords: ['recyclage', 'recycler', 'verre', 'metal', 'papier', 'carton', 'canette'],
    answer:
      "Se recyclent bien : le plastique PET, le papier/carton, le métal (canettes, conserves, ferraille) et le verre (recyclable à l'infini). L'astuce : nettoyez, séchez et regroupez par matière. Beaucoup de matières ont des acheteurs/récupérateurs : un déchet pour vous = une ressource pour un autre.",
  },
  {
    id: 'k_reduire',
    topic: 'Comment réduire mes déchets ?',
    keywords: ['reduire', 'reduction', 'moins', 'zero', 'eviter', 'consommer'],
    answer:
      "La règle des 3R, dans l'ordre : RÉDUIRE (achetez en vrac, refusez les sachets), RÉUTILISER (réparez, donnez), RECYCLER. Le meilleur déchet est celui qu'on ne produit pas. Une gourde et un panier réutilisables évitent déjà des centaines de déchets par an.",
  },
  {
    id: 'k_signaler',
    topic: 'Pourquoi signaler sur MboaClean ?',
    keywords: ['signaler', 'signalement', 'application', 'mboaclean', 'pourquoi', 'utilite'],
    answer:
      "Signaler un dépôt sauvage (photo + GPS) permet à la mairie/HYSACAM de le localiser, de prioriser les zones les plus urgentes et d'optimiser les tournées de collecte. Plus il y a de signalements, plus le quartier devient propre — et vous gagnez des EcoPoints 🌱.",
  },
  {
    id: 'k_hysacam',
    topic: 'Le rôle de HYSACAM',
    keywords: ['hysacam', 'collecte', 'camion', 'ramassage', 'mairie', 'commune'],
    answer:
      "HYSACAM assure la collecte des ordures dans plusieurs villes du Cameroun. Vous pouvez les aider : sortez vos ordures aux horaires de passage, ne mélangez pas les déchets dangereux, et signalez les points noirs pour que les camions passent là où c'est le plus utile.",
  },
]

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // enlève les accents
    .replace(/[^a-z0-9\s]/g, ' ')
}

export interface AssistantReply {
  answer: string
  matched?: string // topic trouvé
  suggestions: string[] // autres sujets proposés
}

/**
 * Répond à une question sur l'environnement / les déchets.
 * Implémentation locale (hors-ligne). Pourra être remplacée par une vraie IA
 * (API Claude) en gardant la même signature.
 */
export function askAssistant(query: string): AssistantReply {
  const q = normalize(query)
  const words = new Set(q.split(/\s+/).filter((w) => w.length > 2))

  let best: KbEntry | null = null
  let bestScore = 0
  for (const entry of KB) {
    let score = 0
    for (const kw of entry.keywords) {
      const nk = normalize(kw)
      if (q.includes(nk)) score += 2
      else if (words.has(nk)) score += 1
    }
    if (score > bestScore) {
      bestScore = score
      best = entry
    }
  }

  const suggestions = KB.filter((e) => e !== best)
    .slice(0, 3)
    .map((e) => e.topic)

  if (best && bestScore > 0) {
    return { answer: best.answer, matched: best.topic, suggestions }
  }

  return {
    answer:
      "Je n'ai pas bien saisi 🤔. Je peux t'aider sur : le tri des déchets, le recyclage, le compost, le brûlage, les inondations, les déchets dangereux, ou comment réduire tes déchets. Pose ta question autrement, ou choisis un sujet ci-dessous.",
    suggestions: KB.slice(0, 4).map((e) => e.topic),
  }
}

/** Questions de démarrage proposées à l'utilisateur. */
export const STARTER_QUESTIONS = [
  'Comment trier mes déchets ?',
  'Puis-je brûler mes ordures ?',
  'Comment faire du compost ?',
  'Que faire des plastiques ?',
]
