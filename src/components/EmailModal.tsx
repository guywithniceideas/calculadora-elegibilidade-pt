'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface Props {
  onConfirm: (name: string, email: string) => void
  onClose: () => void
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function EmailModal({ onConfirm, onClose }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState({ name: false, email: false })

  const nameError = touched.name && !name.trim()
  const emailError = touched.email && (!email.trim() || !isValidEmail(email))

  function handleSubmit() {
    setTouched({ name: true, email: true })
    if (!name.trim() || !email.trim() || !isValidEmail(email)) return
    onConfirm(name.trim(), email.trim())
  }

  return (
    <>
      <motion.div
        className="fixed inset-0 z-50 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        <motion.div
          className="bg-white rounded-3xl p-6 w-full max-w-sm mx-4 shadow-xl relative pointer-events-auto"
          initial={{ scale: 0.95, y: 8 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 8 }}
          transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <button
            aria-label="Fechar modal"
            onClick={onClose}
            className="absolute top-4 right-4 text-[#AAA] hover:text-[#555] text-xl font-light leading-none transition-colors"
          >
            ×
          </button>

          <h2 className="text-base font-extrabold text-[#1A1A1A] mb-1">Receber meu relatório</h2>
          <p className="text-xs text-[#777] mb-5">
            Preencha os dados abaixo para receber seu relatório preliminar.
          </p>

          <div className="mb-3">
            <label className="block text-[11px] font-semibold text-[#555] mb-1.5">Seu nome completo</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, name: true }))}
              placeholder="Nome Sobrenome"
              className={`w-full bg-[#EFEFEF] rounded-xl px-3 py-2.5 text-sm font-semibold text-[#1A1A1A] placeholder:text-[#BBB] outline-none focus:ring-2 focus:ring-[#1A1A1A]/20 transition-all ${nameError ? 'ring-2 ring-red-300' : ''}`}
            />
            {nameError && <p className="text-[10px] text-red-500 mt-1">Nome obrigatório</p>}
          </div>

          <div className="mb-5">
            <label className="block text-[11px] font-semibold text-[#555] mb-1.5">Seu melhor email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, email: true }))}
              placeholder="seu@email.com"
              className={`w-full bg-[#EFEFEF] rounded-xl px-3 py-2.5 text-sm font-semibold text-[#1A1A1A] placeholder:text-[#BBB] outline-none focus:ring-2 focus:ring-[#1A1A1A]/20 transition-all ${emailError ? 'ring-2 ring-red-300' : ''}`}
            />
            {emailError && <p className="text-[10px] text-red-500 mt-1">Email inválido</p>}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-[#1A1A1A] text-white py-3 rounded-2xl text-sm font-bold hover:bg-[#333] active:scale-[0.98] transition-all"
          >
            Receber meu relatório →
          </button>
        </motion.div>
      </motion.div>
    </>
  )
}
