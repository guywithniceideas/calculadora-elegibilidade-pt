'use client'
import { motion } from 'framer-motion'

interface Props {
  checked: boolean
  onChange: () => void
  label: string
}

export default function Switch({ checked, onChange, label }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative w-9 h-5 rounded-full flex-shrink-0 transition-colors ${checked ? 'bg-[#1A1A1A]' : 'bg-[#CCC]'}`}
    >
      <motion.div
        className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
        animate={{ x: checked ? 16 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}
