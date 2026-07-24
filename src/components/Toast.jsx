import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2, X, XCircle } from 'lucide-react'

export default function Toast({ message, tone = 'success', onDismiss }) {
  useEffect(() => {
    if (!message) return undefined
    const timer = window.setTimeout(onDismiss, 3200)
    return () => window.clearTimeout(timer)
  }, [message, onDismiss])

  return (
    <AnimatePresence>
      {message && (
        <motion.div className={`toast toast--${tone}`} initial={{ opacity: 0, y: 16, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: .98 }} role="status">
          {tone === 'error' ? <XCircle size={18} aria-hidden="true" /> : <CheckCircle2 size={18} aria-hidden="true" />}
          <span>{message}</span>
          <button type="button" className="toast__close" onClick={onDismiss} aria-label="Dismiss notification"><X size={16} /></button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
