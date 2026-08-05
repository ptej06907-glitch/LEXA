import { Check } from 'lucide-react'

export default function Stepper({ steps, currentStep }) {
  const progress = steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 100

  return (
    <ol className="stepper" aria-label={`Step ${currentStep + 1} of ${steps.length}`} style={{ '--step-progress': `${progress}%` }}>
      <li className="stepper__progress" aria-hidden="true"><i /></li>
      {steps.map((step, index) => {
        const complete = index < currentStep
        const active = index === currentStep
        return (
          <li key={step} className={`stepper__item${active ? ' stepper__item--active' : ''}${complete ? ' stepper__item--complete' : ''}`} aria-current={active ? 'step' : undefined}>
            <span className="stepper__number">{complete ? <Check size={14} /> : index + 1}</span>
            <span className="stepper__label">{step}</span>
          </li>
        )
      })}
    </ol>
  )
}
