import type { AlertType } from '@/lib/types'

const styles: Record<AlertType, { border: string; titleColor: string; iconBg: string }> = {
  info:    { border: 'border-[#E0E0E0]', titleColor: 'text-[#1A1A1A]', iconBg: 'bg-[#1A1A1A]' },
  warning: { border: 'border-[#DCDCDC]', titleColor: 'text-[#1A1A1A]', iconBg: 'bg-[#998a72]' },
  error:   { border: 'border-[#D4D4D4]', titleColor: 'text-[#1A1A1A]', iconBg: 'bg-[#C9785A]' },
}

function AlertIcon({ type }: { type: AlertType }) {
  if (type === 'info') {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="11" />
        <circle cx="12" cy="8" r="0.5" fill="white" />
      </svg>
    )
  }
  if (type === 'warning') {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <circle cx="12" cy="17" r="0.5" fill="white" />
      </svg>
    )
  }
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}

interface Props {
  type: AlertType
  title: string
  message: string
}

export default function AlertCard({ type, title, message }: Props) {
  const { border, titleColor, iconBg } = styles[type]
  return (
    <div className={`flex gap-3 items-start bg-[#EFEFEF] border ${border} rounded-2xl px-3.5 py-3 mb-2`}>
      <div className={`w-6 h-6 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <AlertIcon type={type} />
      </div>
      <div>
        <p className={`text-xs font-bold mb-0.5 ${titleColor}`}>{title}</p>
        <p className="text-xs text-[#555] leading-relaxed">{message}</p>
      </div>
    </div>
  )
}
