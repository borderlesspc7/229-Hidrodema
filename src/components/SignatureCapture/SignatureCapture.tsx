import { useRef, useState, useEffect } from "react";
import Button from "../ui/Button/Button";

const fileInputId = "signature-capture-file-input";

interface SignatureCaptureProps {
  open: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
  title?: string;
}

export default function SignatureCapture({
  open,
  onClose,
  onSave,
  title = "Assinatura",
}: SignatureCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasStroke, setHasStroke] = useState(false);

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    setHasStroke(false);
  }, [open]);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setHasStroke(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => setDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#000";
    setHasStroke(false);
  };

  const confirm = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasStroke) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
    onClose();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onSave(dataUrl);
      onClose();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  if (!open) return null;

  return (
    <div
      className="signature-capture-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="signature-capture-modal"
        style={{
          background: "#fff",
          padding: "24px",
          borderRadius: "8px",
          maxWidth: "90vw",
          maxHeight: "90vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "12px" }}>
          Desenhe no quadro abaixo ou envie uma imagem da assinatura.
        </p>
        <canvas
          ref={canvasRef}
          width={400}
          height={180}
          style={{
            border: "1px solid #cbd5e1",
            borderRadius: "4px",
            display: "block",
            cursor: "crosshair",
            touchAction: "none",
          }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
        />
        <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
          <Button variant="secondary" onClick={clear}>
            Limpar
          </Button>
          <input
            id={fileInputId}
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            style={{ display: "none" }}
          />
          <Button variant="secondary" type="button" onClick={triggerFileInput}>
            Enviar imagem
          </Button>
          <Button variant="primary" onClick={confirm} disabled={!hasStroke}>
            Usar esta assinatura
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
