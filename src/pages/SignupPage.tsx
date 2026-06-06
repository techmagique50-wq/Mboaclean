import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Building2, Lock, Mail, MapPin, Phone, User as UserIcon, UserPlus } from 'lucide-react'
import { useStore } from '../store'
import type { Role } from '../domain/types'
import { CITY_NAMES } from '../domain/cities'
import { AuthShell, Field } from '../components/AuthShell'

const OPERATORS = ['MTN MoMo', 'Orange Money']

export function SignupPage() {
  const authId = useStore((s) => s.authId)
  const signup = useStore((s) => s.signup)
  const navigate = useNavigate()

  const [role, setRole] = useState<Role>('citoyen')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [ville, setVille] = useState('Yaoundé')
  const [quartier, setQuartier] = useState('')
  const [organisation, setOrganisation] = useState('')
  const [phone, setPhone] = useState('')
  const [operator, setOperator] = useState(OPERATORS[0])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (authId) return <Navigate to="/" replace />

  const submit = async () => {
    if (busy) return
    if (!name.trim() || !email.trim() || password.length < 4) {
      setError('Renseigne ton nom, un email et un mot de passe (4 caractères min).')
      return
    }
    if (role === 'ramasseur' && phone.replace(/\D/g, '').length < 8) {
      setError('Le ramasseur doit indiquer un numéro Mobile Money (pour être payé).')
      return
    }
    setBusy(true)
    setError('')
    const res = await signup({
      name,
      email,
      password,
      role,
      ville,
      quartier: role === 'decideur' ? '—' : quartier.trim() || 'Non précisé',
      organisation: role === 'decideur' ? organisation.trim() || undefined : undefined,
      phone: role === 'ramasseur' ? phone.trim() : undefined,
      operator: role === 'ramasseur' ? operator : undefined,
    })
    setBusy(false)
    if (!res.ok) {
      setError(res.error ?? 'Erreur')
      return
    }
    navigate(role === 'decideur' ? '/tableau-de-bord' : role === 'ramasseur' ? '/demandes' : '/', {
      replace: true,
    })
  }

  return (
    <AuthShell title="Créer un compte" subtitle="Choisis ton profil pour commencer">
      {/* choix du rôle */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        <RoleCard active={role === 'citoyen'} onClick={() => setRole('citoyen')} emoji="👤" title="Ménage" desc="Signaler / demander" />
        <RoleCard active={role === 'ramasseur'} onClick={() => setRole('ramasseur')} emoji="🛺" title="Ramasseur" desc="Collecter & gagner" />
        <RoleCard active={role === 'decideur'} onClick={() => setRole('decideur')} emoji="🏛️" title="Décideur" desc="Commune" />
      </div>

      <div className="space-y-3">
        <Field label={role === 'decideur' ? 'Nom du responsable / service' : 'Nom complet'} icon={<UserIcon size={16} />}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ton nom" className="w-full bg-transparent outline-none" />
        </Field>
        <Field label="Email" icon={<Mail size={16} />}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="toi@exemple.cm" className="w-full bg-transparent outline-none" />
        </Field>
        <Field label="Mot de passe" icon={<Lock size={16} />}>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-transparent outline-none" />
        </Field>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Ville" icon={<MapPin size={16} />}>
            <select value={ville} onChange={(e) => setVille(e.target.value)} className="w-full bg-transparent outline-none">
              {CITY_NAMES.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </Field>
          {role === 'decideur' ? (
            <Field label="Organisation" icon={<Building2 size={16} />}>
              <input value={organisation} onChange={(e) => setOrganisation(e.target.value)} placeholder="ex. Commune III" className="w-full bg-transparent outline-none" />
            </Field>
          ) : (
            <Field label="Quartier">
              <input value={quartier} onChange={(e) => setQuartier(e.target.value)} placeholder="ex. Mokolo" className="w-full bg-transparent outline-none" />
            </Field>
          )}
        </div>

        {role === 'ramasseur' && (
          <div className="grid grid-cols-2 gap-2">
            <Field label="N° Mobile Money" icon={<Phone size={16} />}>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+237 6XX…" className="w-full bg-transparent outline-none" />
            </Field>
            <Field label="Opérateur">
              <select value={operator} onChange={(e) => setOperator(e.target.value)} className="w-full bg-transparent outline-none">
                {OPERATORS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </Field>
          </div>
        )}

        {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

        <button
          onClick={submit}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
        >
          <UserPlus size={18} /> {busy ? 'Création…' : 'Créer mon compte'}
        </button>
      </div>

      <p className="mt-4 text-center text-sm text-muted">
        Déjà inscrit ?{' '}
        <Link to="/login" className="font-semibold text-brand">Se connecter</Link>
      </p>
    </AuthShell>
  )
}

function RoleCard({
  active,
  onClick,
  emoji,
  title,
  desc,
}: {
  active: boolean
  onClick: () => void
  emoji: string
  title: string
  desc: string
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border p-3 text-left transition active:scale-[0.98] ${
        active ? 'border-brand bg-brand-soft ring-1 ring-brand' : 'border-line bg-card'
      }`}
    >
      <div className="text-xl">{emoji}</div>
      <div className="mt-1 text-sm font-semibold text-ink">{title}</div>
      <div className="text-[10px] leading-tight text-faint">{desc}</div>
    </button>
  )
}
