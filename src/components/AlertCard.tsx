import type { AlertType } from '@/lib/types'

const styles: Record<AlertType, { border: string; title: string; icon: string }> = {
  info: { border: 'border-indigo-500', title: 'text-indigo-300', icon: 'ℹ️' },
  warning: { border: 'border-amber-500', title: 'text-amber-300', icon: '⚠️' },
  error: { border: 'border-red-500', title: 'text-red-300', icon: '🚨' },
}

interface Props {
  type: AlertType
  title: string
  message: string
}

export default function AlertCard({ type, title, message }: Props) {
  const { border, title: titleColor, icon } = styles[type]
  return (
    <div className={`border-l-2 ${border} bg-slate-800 rounded-r-md px-3 py-2 mb-2`}>
      <p className={`text-xs font-semibold mb-0.5 ${titleColor}`}>
        <span>{icon}</span> <span>{title}</span>
      </p>
      <p className="text-xs text-slate-400">{message}</p>
    </div>
  )
}
