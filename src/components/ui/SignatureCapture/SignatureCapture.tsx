import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../Button/Button";
import "./SignatureCapture.css";

type Props = {
  value?: string;
  onChange: (dataUrl: string | null) => void;
  height?: number;
  disabled?: boolean;
};

export default function SignatureCapture({
  value,
  onChange,
  height = 180,
  disabled,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(Boolean(value));

  const ratio = useMemo(() => Math.max(1, Math.floor(window.devicePixelRatio || 1)), []);

  const resizeCanvas = () => {
    const c = canvasRef.current;
    if (!c) return;
    const cssW = c.clientWidth;
    const cssH = height;
    c.width = Math.floor(cssW * ratio);
    c.height = Math.floor(cssH * ratio);
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2.2;
  };

  const clear = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    lastRef.current = null;
    setHasInk(false);
    onChange(null);
  };

  const commit = () => {
    const c = canvasRef.current;
    if (!c) return;
    const dataUrl = c.toDataURL("image/png");
    onChange(dataUrl);
  };

  const loadFromValue = () => {
    if (!value) return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.clientWidth, height);
      setHasInk(true);
    };
    img.src = value;
  };

  useEffect(() => {
    resizeCanvas();
    loadFromValue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!value) return;
    loadFromValue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const pointFromEvent = (e: PointerEvent) => {
    const c = canvasRef.current;
    if (!c) return null;
    const rect = c.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    c.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    lastRef.current = pointFromEvent(e.nativeEvent);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    if (!drawingRef.current) return;
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const p = pointFromEvent(e.nativeEvent);
    const last = lastRef.current;
    if (!p || !last) {
      lastRef.current = p;
      return;
    }
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastRef.current = p;
    setHasInk(true);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastRef.current = null;
    commit();
    const c = canvasRef.current;
    if (c) c.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="signature-capture">
      <div className="signature-capture__canvasWrap" style={{ height }}>
        <canvas
          ref={canvasRef}
          className="signature-capture__canvas"
          style={{ height }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </div>
      <div className="signature-capture__actions">
        <Button variant="secondary" onClick={clear} disabled={disabled || !hasInk}>
          Limpar
        </Button>
      </div>
      <div className="obras-helper-text">
        Assine com o dedo/mouse. A assinatura será salva no relatório.
      </div>
    </div>
  );
}

