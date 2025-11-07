import "./LoadingScreen.css";

interface LoadingScreenProps {
  message?: string;
  fullscreen?: boolean;
  size?: "small" | "medium" | "large";
}

export default function LoadingScreen({
  message = "Carregando...",
  fullscreen = true,
  size = "medium",
}: LoadingScreenProps) {
  const sizeClasses = {
    small: "loading-small",
    medium: "loading-medium",
    large: "loading-large",
  };

  return (
    <div className={`loading-overlay ${fullscreen ? "loading-fullscreen" : ""}`}>
      <div className={`loading-content ${sizeClasses[size]}`}>
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
}

