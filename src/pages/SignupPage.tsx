import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Building2, Lock, Mail, MapPin, User as UserIcon, UserPlus } from 'lucide-react'
import { useStore } from '../store'
import type { Role } from '../domain/types'
import { AuthShell, Field } from '../components/AuthShell'

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
  const [error, setError] = useState('')

  if (authId) return <Navigate to="/" replace />

  const submit = () => {
    if (!name.trim() || !email.trim() || password.length < 4) {
      setError('Renseigne ton nom, un email et un mot de passe (4 caractères min).')
      return
    }
    const res = signup({
      name,
      email,
      password,
      role,
      ville,
      quartier: role === 'citoyen' ? quartier.trim() || 'Non précisé' : '—',
      organisation: role === 'decideur' ? organisation.trim() || undefined : undefined,
    })
    if (!res.ok) {
      setError(res.error ?? 'Erreur')
      return
    }
    navigate(role === 'decideur' ? '/tableau-de-bord' : '/', { replace: true })
  }

  return (
    <AuthShell title="Créer un compte" subtitle="Choisis ton profil pour commencer">
      {/* choix du rôle */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <RoleCard
          active={role === 'citoyen'}
          onClick={() => setRole('citoyen')}
          emoji="👤"
          title="Citoyen"
          desc="Je signale les déchets"
        />
        <RoleCard
          active={role === 'decideur'}
          onClick={() => setRole('decideur')}
          emoji="🏛️"
          title="Décideur"
          desc="Commune / HYSACAM"
        />
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
              <option>Yaoundé</option>
              <option>Douala</option>
            </select>
          </Field>
          {role === 'citoyen' ? (
            <Field label="Quartier">
              <input value={quartier} onChange={(e) => setQuartier(e.target.value)} placeholder="ex. Mokolo" className="w-full bg-transparent outline-none" />
            </Field>
          ) : (
            <Field label="Organisation" icon={<Building2 size={16} />}>
              <input value={organisation} onChange={(e) => setOrganisation(e.target.value)} placeholder="ex. Commune III" className="w-full bg-transparent outline-none" />
            </Field>
          )}
        </div>

        {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

        <button
          onClick={submit}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 font-semibold text-white transition active:scale-[0.98]"
        >
          <UserPlus size={18} /> Créer mon compte
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
      <div className="text-2xl">{emoji}</div>
      <div className="mt-1 font-semibold text-ink">{title}</div>
      <div className="text-xs text-faint">{desc}</div>
    </button>
  )
}
