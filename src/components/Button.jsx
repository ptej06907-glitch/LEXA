import { Loader2 } from 'lucide-react'

/**
 * Reusable Button component for Lexa.
 * variant: 'primary' | 'secondary' | 'ghost'
 */
export default function Button({
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  fullWidth = false,
  children,
  className = '',
  type = 'button',
  ...props
}) {
  const isDisabled = disabled || loading

  const base = `
    inline-flex items-center justify-center gap-2
    rounded-lg px-8 py-3.5 text-[15px] font-semibold
    transition-all duration-150 ease-out
    active:scale-[0.98]
    disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100
    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
    ${fullWidth ? 'w-full' : ''}
  `

  const variants = {
    primary: `
      bg-[var(--color-gold)] text-black
      shadow-[0_2px_8px_rgba(201,168,76,0.15)]
      enabled:hover:bg-[var(--color-accent-hover)] enabled:hover:border-[var(--color-gold)] enabled:hover:text-[var(--color-bg)]
      focus-visible:outline-[var(--color-gold)]
    `,
    secondary: `
      bg-transparent text-[var(--color-text-primary)]
      border border-[var(--color-border)]
      enabled:hover:bg-[var(--color-accent-muted)] enabled:hover:border-[var(--color-gold)] enabled:hover:text-[var(--color-gold)]
      focus-visible:outline-[var(--color-text-primary)]
    `,
    ghost: `
      bg-transparent text-[var(--color-text-secondary)]
      enabled:hover:bg-[var(--color-accent-muted)] enabled:hover:text-[var(--color-gold)]
      focus-visible:outline-[var(--color-text-secondary)]
    `,
  }

  const variantClasses = {
    primary: 'lexa-button--primary',
    secondary: 'lexa-button--secondary',
    ghost: 'lexa-button--ghost',
  }

  return (
    <button
      type={type}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      aria-busy={loading}
      className={`lexa-button ${variantClasses[variant]} ${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span>Loading...</span>
        </>
      ) : children}
    </button>
  )
}
