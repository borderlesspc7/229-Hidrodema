import "./Toast.css";
import {
  FaCheck,
  FaExclamationTriangle,
  FaInfo,
  FaTimes,
} from "react-icons/fa";
import { useEffect } from "react";
import Button from "../Button/Button";

interface ToastProps {
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose?: () => void;
}

export default function Toast({
  message,
  type,
  duration,
  onClose,
}: ToastProps) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheck className="toast-icon" />;
      case "error":
        return <FaExclamationTriangle className="toast-icon" />;
      case "warning":
        return <FaExclamationTriangle className="toast-icon" />;
      case "info":
        return <FaInfo className="toast-icon" />;
      default:
        return <FaInfo className="toast-icon" />;
    }
  };

  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`toast toast--${type}`}>
      <div className="toast-content">
        <span className="toast-icon">{getIcon()}</span>
        <p className="toast-message">{message}</p>
        {onClose && (
          <Button className="toast-close" onClick={onClose} aria-label="Close">
            <FaTimes />
          </Button>
        )}
      </div>
    </div>
  );
}
