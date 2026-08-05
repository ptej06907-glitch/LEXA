export default function LoadingState({ label, detail }) {
  return (
    <div className="generation-state" role="status" aria-live="polite">
      <div className="generation-state__meta"><span>Lexa analysis desk</span><small>Processing record</small></div>
      <div className="generation-state__header"><span className="loading-spinner" aria-hidden="true" /><div><strong>{label}</strong>{detail && <p>{detail}</p>}</div><span className="generation-state__pulse" aria-hidden="true"><i /><i /><i /></span></div>
      <div className="document-skeleton" aria-hidden="true">
        <small>Draft record / preliminary</small>
        <span className="document-skeleton__title" />
        <span /><span /><span className="document-skeleton__short" />
        <span /><span className="document-skeleton__medium" /><span className="document-skeleton__short" />
      </div>
    </div>
  )
}
