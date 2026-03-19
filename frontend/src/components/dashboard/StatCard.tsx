interface StatCardProps {
  label: string
  value: string
  subtitle?: string
  highlight?: 'gold' | 'red' | 'green' | 'default'
}

export default function StatCard({ label, value, subtitle, highlight = 'default' }: StatCardProps) {
  const borderColor = {
    gold: 'border-l-[#f1b300]',
    red: 'border-l-red-500',
    green: 'border-l-emerald-500',
    default: 'border-l-neutral-300',
  }[highlight]

  return (
    <div className={`bg-white rounded-lg border border-neutral-200 border-l-4 ${borderColor} p-5 shadow-sm`}>
      <p className="text-sm font-medium text-neutral-500 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-bold text-neutral-900">{value}</p>
      {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
    </div>
  )
}
