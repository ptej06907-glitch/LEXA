import { motion, useReducedMotion } from 'motion/react'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.045, delayChildren: 0.08 } },
}

const wordVariants = {
  hidden: { opacity: 0, y: 10, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.38, ease: 'easeOut' } },
}

export default function TextEffect({ children, className = '' }) {
  const reduceMotion = useReducedMotion()
  const words = String(children).split(' ')

  if (reduceMotion) return <h1 className={className}>{children}</h1>

  return (
    <motion.h1
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label={children}
    >
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          variants={wordVariants}
          aria-hidden="true"
          style={{ display: 'inline-block', marginRight: index === words.length - 1 ? 0 : '.25em' }}
        >
          {word}
        </motion.span>
      ))}
    </motion.h1>
  )
}
