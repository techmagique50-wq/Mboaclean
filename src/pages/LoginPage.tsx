import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Mail, Lock, LogIn } from 'lucide-react'
import { currentAccount, useStore } from '../store'
import { AuthShell, Field } from '../components/AuthShell'

export function LoginPage() {
  const authId = useStore((s) => s.authId)
  const login = useStore((s) => s.login)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (authId) return <Navigate to="/" replace />

  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (busy) return
    setBusy(true)
    setError('')
    const res = await login(email, password)
    setBusy(false)
    if (!res.ok) {
      setError(res.error ?? 'Erreur')
      return
    }
    const acc = currentAccount(useStore.getState())
    navigate(
      acc?.role === 'decideur' ? '/tableau-de-bord' : acc?.role === 'ramasseur' ? '/demandes' : '/',
      { replace: true },
    )
  }

  const fillDemo = (e: string) => {
    setEmail(e)
    setPassword('demo1234')
    setError('')
  }

  return (
    <AuthShell title="Bon retour 👋" subtitle="Connecte-toi pour continuer">
      <div className="space-y-3">
        <Field label="Email" icon={<Mail size={16} />}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="toi@exemple.cm"
            className="w-full bg-transparent outline-none"
          />
        </Field>
        <Field label="Mot de passe" icon={<Lock size={16} />}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="••••••••"
            className="w-full bg-transparent outline-none"
          />
        </Field>

        {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

        <button
          onClick={submit}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
        >
          <LogIn size={18} /> {busy ? 'Connexion…' : 'Se connecter'}
        </button>
      </div>

      <p className="mt-4 text-center text-sm text-muted">
        Pas encore de compte ?{' '}
        <Link to="/signup" className="font-semibold text-brand">Créer un compte</Link>
      </p>

      {/* comptes de démonstration */}
      <div className="mt-5 rounded-xl border border-line bg-hover p-3 text-xs">
        <div className="mb-2 font-semibold text-muted">Comptes de démonstration (mot de passe : demo1234)</div>
        <div className="flex gap-2">
          <button onClick={() => fillDemo('citoyen@mboa.cm')} className="flex-1 rounded-lg bg-card px-2 py-1.5 font-medium ring-1 ring-line">
            👤 Ménage
          </button>
          <button onClick={() => fillDemo('ramasseur@mboa.cm')} className="flex-1 rounded-lg bg-card px-2 py-1.5 font-medium ring-1 ring-line">
            🛺 Ramasseur
          </button>
          <button onClick={() => fillDemo('decideur@mboa.cm')} className="flex-1 rounded-lg bg-card px-2 py-1.5 font-medium ring-1 ring-line">
            🏛️ Décideur
          </button>
        </div>
      </div>
    </AuthShell>
  )
}
