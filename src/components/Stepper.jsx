import { Check } from 'lucide-react'

export default function Stepper({ steps, currentStep }) {
  return (
    <ol className="stepper" aria-label={`Step ${currentStep + 1} of ${steps.length}`}>
      {steps.map((step, index) => {
        const complete = index < currentStep
        const active = index === currentStep
        return (
          <li key={step} className={`stepper__item${active ? ' stepper__item--active' : ''}${complete ? ' stepper__item--complete' : ''}`} aria-current={active ? 'step' : undefined}>
            <span className="stepper__number">{complete ? <Check size={14} /> : index + 1}</span>
            <span>{step}</span>
          </li>
        )
      })}
    </ol>
  )
}
