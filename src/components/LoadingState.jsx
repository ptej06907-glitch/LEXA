export default function LoadingState({ label, detail }) {
  return (
    <div className="generation-state" role="status" aria-live="polite">
      <div className="generation-state__header"><span className="loading-spinner" aria-hidden="true" /><div><strong>{label}</strong>{detail && <p>{detail}</p>}</div></div>
      <div className="document-skeleton" aria-hidden="true">
        <span className="document-skeleton__title" />
        <span /><span /><span className="document-skeleton__short" />
        <span /><span className="document-skeleton__medium" />
      </div>
    </div>
  )
}
