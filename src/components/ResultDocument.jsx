import { FileText } from 'lucide-react'

export default function ResultDocument({ title, badge = 'AI draft', actions, children, disclaimer }) {
  return (
    <section className="document-workspace" aria-labelledby="document-result-title">
      <div className="document-toolbar">
        <div className="document-toolbar__title"><FileText size={18} aria-hidden="true" /><div><span>Generated document</span><strong id="document-result-title">{title}</strong></div></div>
        <div className="result-actions">{actions}</div>
      </div>
      <article className="legal-paper">
        <span className="legal-paper__badge">{badge}</span>
        <div className="legal-paper__content">{children}</div>
        {disclaimer && <p className="legal-paper__disclaimer">{disclaimer}</p>}
      </article>
    </section>
  )
}
