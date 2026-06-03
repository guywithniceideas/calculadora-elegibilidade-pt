import type { AlertType } from '@/lib/types'

const styles: Record<AlertType, { border: string; titleColor: string; iconBg: string }> = {
  info:    { border: 'border-[#E0E0E0]', titleColor: 'text-[#1A1A1A]', iconBg: 'bg-[#1A1A1A]' },
  warning: { border: 'border-[#DCDCDC]', titleColor: 'text-[#1A1A1A]', iconBg: 'bg-[#1A1A1A]' },
  error:   { border: 'border-[#D4D4D4]', titleColor: 'text-[#1A1A1A]', iconBg: 'bg-[#1A1A1A]' },
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
      <div className={`w-6 h-6 ${iconBg} rounded-lg flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 mt-0.5`}>
        !
      </div>
      <div>
        <p className={`text-xs font-bold mb-0.5 ${titleColor}`}>{title}</p>
        <p className="text-xs text-[#555] leading-relaxed">{message}</p>
      </div>
    </div>
  )
}
