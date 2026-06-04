import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Check, ChevronLeft, Loader2, MapPin, Send } from 'lucide-react'
import { useStore } from '../store'
import { compressImage } from '../lib/photo'
import { urgency } from '../domain/engine'
import {
  VOLUME_LABEL,
  WASTE_LABEL,
  ZONE_LABEL,
  type Volume,
  type WasteType,
  type ZoneSensitivity,
} from '../domain/types'
import { UrgencyPill } from '../ui/ui'

export function ReportPage() {
  const navigate = useNavigate()
  const addReport = useStore((s) => s.addReport)
  const reports = useStore((s) => s.reports)
  const online = useStore((s) => s.online)

  const [step, setStep] = useState(1)
  const [photo, setPhoto] = useState<string>()
  const [loadingPhoto, setLoadingPhoto] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [coords, setCoords] = useState<{ lat: number; lng: number }>()
  const [geoState, setGeoState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [ville, setVille] = useState('Yaoundé')
  const [quartier, setQuartier] = useState('')

  const [wasteType, setWasteType] = useState<WasteType>('menager')
  const [volume, setVolume] = useState<Volume>('moyen')
  const [zone, setZone] = useState<ZoneSensitivity>('normale')
  const [description, setDescription] = useState('')

  const onPickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoadingPhoto(true)
    try {
      setPhoto(await compressImage(file))
    } finally {
      setLoadingPhoto(false)
    }
  }

  const locate = () => {
    setGeoState('loading')
    if (!navigator.geolocation) {
      setGeoState('error')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGeoState('ok')
      },
      () => {
        // repli : centre de Yaoundé (démo) si refus/échec
        setCoords({ lat: 3.866 + (Math.random() - 0.5) * 0.04, lng: 11.516 + (Math.random() - 0.5) * 0.04 })
        setGeoState('error')
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  // aperçu d'urgence en direct
  const preview = coords
    ? urgency(
        {
          id: '_preview', lat: coords.lat, lng: coords.lng, ville, quartier, wasteType, volume, zone,
          status: 'signale', createdAt: 0, updatedAt: 0, reporterName: '', sync: 'synced', history: [],
        },
        reports,
      )
    : null

  const submit = () => {
    if (!coords) return
    const id = addReport({
      lat: coords.lat,
      lng: coords.lng,
      ville,
      quartier: quartier.trim() || 'Non précisé',
      wasteType,
      volume,
      zone,
      description: description.trim() || undefined,
      photo,
    })
    navigate(`/signalement/${id}`)
  }

  return (
    <div className="mx-auto max-w-lg">
      {/* progression */}
      <div className="mb-5 flex items-center gap-2">
        {step > 1 ? (
          <button onClick={() => setStep((s) => s - 1)} className="rounded-lg p-1.5 hover:bg-hover">
            <ChevronLeft size={20} />
          </button>
        ) : (
          <span className="w-8" />
        )}
        <div className="flex flex-1 gap-1.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-brand' : 'bg-line'}`}
            />
          ))}
        </div>
        <span className="text-xs font-medium text-faint">{step}/3</span>
      </div>

      {/* Étape 1 : photo */}
      {step === 1 && (
        <section>
          <h1 className="mb-1 text-xl font-bold text-brand-strong">📸 Prends une photo</h1>
          <p className="mb-4 text-sm text-muted">Une preuve visuelle du dépôt sauvage.</p>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={onPickPhoto}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed border-line bg-card text-faint transition hover:border-brand/50"
          >
            {loadingPhoto ? (
              <Loader2 className="animate-spin" />
            ) : photo ? (
              <img src={photo} alt="aperçu" className="h-full w-full object-cover" />
            ) : (
              <>
                <Camera size={40} />
                <span className="text-sm font-medium">Toucher pour photographier</span>
              </>
            )}
          </button>

          <button
            onClick={() => setStep(2)}
            disabled={!photo}
            className="mt-5 w-full rounded-xl bg-[#1b7a43] py-3 font-semibold text-white disabled:opacity-40"
          >
            Continuer
          </button>
          <button onClick={() => setStep(2)} className="mt-2 w-full text-sm text-faint">
            Passer (sans photo)
          </button>
        </section>
      )}

      {/* Étape 2 : position */}
      {step === 2 && (
        <section>
          <h1 className="mb-1 text-xl font-bold text-brand-strong">📍 Où se trouve le dépôt ?</h1>
          <p className="mb-4 text-sm text-muted">On récupère automatiquement ta position GPS.</p>

          <button
            onClick={locate}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0fa3a3] py-3 font-semibold text-white"
          >
            {geoState === 'loading' ? <Loader2 className="animate-spin" size={18} /> : <MapPin size={18} />}
            {coords ? 'Reprendre ma position' : 'Localiser automatiquement'}
          </button>

          {coords && (
            <div className="mt-3 rounded-xl bg-card p-3 text-sm ring-1 ring-line">
              <div className="flex items-center gap-2 text-brand">
                <Check size={16} /> Position enregistrée
              </div>
              <div className="mt-1 text-xs text-muted">
                {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                {geoState === 'error' && ' (position approximative — GPS indisponible)'}
              </div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted">Ville</span>
              <select value={ville} onChange={(e) => setVille(e.target.value)} className="w-full rounded-xl border border-line px-3 py-2 text-sm">
                <option>Yaoundé</option>
                <option>Douala</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted">Quartier</span>
              <input value={quartier} onChange={(e) => setQuartier(e.target.value)} placeholder="ex. Mokolo" className="w-full rounded-xl border border-line px-3 py-2 text-sm" />
            </label>
          </div>

          <button
            onClick={() => setStep(3)}
            disabled={!coords}
            className="mt-5 w-full rounded-xl bg-[#1b7a43] py-3 font-semibold text-white disabled:opacity-40"
          >
            Continuer
          </button>
        </section>
      )}

      {/* Étape 3 : détails + envoi */}
      {step === 3 && (
        <section>
          <h1 className="mb-1 text-xl font-bold text-brand-strong">🗑️ Détails du dépôt</h1>
          <p className="mb-4 text-sm text-muted">Ces infos aident à prioriser l'intervention.</p>

          <Picker label="Type de déchet" value={wasteType} onChange={setWasteType} options={WASTE_LABEL} />
          <Picker label="Volume" value={volume} onChange={setVolume} options={VOLUME_LABEL} />
          <Picker label="Zone" value={zone} onChange={setZone} options={ZONE_LABEL} />

          <label className="mt-4 block">
            <span className="mb-1 block text-xs font-medium text-muted">Description (optionnel)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="ex. odeurs fortes, gêne le passage…"
              className="w-full resize-none rounded-xl border border-line px-3 py-2 text-sm"
            />
          </label>

          {preview && (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-soft px-3 py-2">
              <span className="text-sm text-muted">Urgence estimée</span>
              <UrgencyPill level={preview.level} score={preview.score} />
            </div>
          )}

          <button
            onClick={submit}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#e8552d] py-3.5 font-bold text-white"
          >
            <Send size={18} /> {online ? 'Envoyer le signalement' : 'Enregistrer (hors-ligne)'}
          </button>
          {!online && (
            <p className="mt-2 text-center text-xs text-faint">
              Sera synchronisé automatiquement au retour du réseau.
            </p>
          )}
        </section>
      )}
    </div>
  )
}

function Picker<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: Record<T, { label: string; emoji: string }>
}) {
  return (
    <div className="mt-4">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(options) as T[]).map((k) => (
          <button
            key={k}
            onClick={() => onChange(k)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm ${
              value === k ? 'border-[#1b7a43] bg-brand-soft text-brand' : 'border-line text-muted'
            }`}
          >
            <span>{options[k].emoji}</span> {options[k].label}
          </button>
        ))}
      </div>
    </div>
  )
}
