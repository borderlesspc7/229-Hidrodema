import "./LoadingScreen.css";

type Props = {
  label?: string;
};

export default function LoadingScreen({ label = "Carregando..." }: Props) {
  return (
    <div className="loading-screen">
      <div className="loading-screen__panel" role="status" aria-live="polite">
        <div className="loading-screen__spinner" aria-hidden="true">
          <div className="ring ring--outer" />
          <div className="ring ring--inner" />
          <div className="dot" />
        </div>
        <div className="loading-screen__label">{label}</div>
      </div>
    </div>
  );
}

