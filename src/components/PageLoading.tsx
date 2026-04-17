import "./PageLoading.css";

export default function PageLoading({ label = "Carregando…" }: { label?: string }) {
  return (
    <div className="page-loading" role="status" aria-live="polite">
      <div className="page-loading__spinner" aria-hidden />
      <span className="page-loading__label">{label}</span>
    </div>
  );
}
