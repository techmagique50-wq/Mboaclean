import { Recycle } from 'lucide-react'

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/30">
            <Recycle size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-brand">MboaClean</h1>
          <p className="text-xs text-faint">Cameroun propre, piloté par la donnée</p>
        </div>

        <div className="rounded-2xl border border-line bg-card p-6 shadow-xl shadow-black/5">
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          {subtitle && <p className="mb-4 mt-0.5 text-sm text-muted">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  )
}

export function Field({
  label,
  icon,
  children,
}: {
  label: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2.5 text-sm focus-within:border-brand focus-within:ring-1 focus-within:ring-brand">
        {icon && <span className="text-faint">{icon}</span>}
        {children}
      </div>
    </label>
  )
}
