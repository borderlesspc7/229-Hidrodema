import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import "./ScrollToBottomFab.css";

const SCROLL_REVEAL_PX = 160;
const NEAR_BOTTOM_PX = 96;
const MIN_SCROLLABLE_PX = 140;

function getScrollMetrics() {
  const docEl = document.documentElement;
  const body = document.body;
  const scrollTop = window.scrollY ?? docEl.scrollTop ?? body.scrollTop ?? 0;
  const scrollHeight = Math.max(
    docEl.scrollHeight,
    body.scrollHeight,
    docEl.offsetHeight,
    body.offsetHeight
  );
  const clientHeight = window.innerHeight || docEl.clientHeight || body.clientHeight;
  return { scrollTop, scrollHeight, clientHeight };
}

function shouldShowFab(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number
): boolean {
  const maxScroll = Math.max(0, scrollHeight - clientHeight);
  if (maxScroll < MIN_SCROLLABLE_PX) return false;
  if (scrollTop < SCROLL_REVEAL_PX) return false;
  return scrollTop < maxScroll - NEAR_BOTTOM_PX;
}

export default function ScrollToBottomFab() {
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  const update = useCallback(() => {
    const { scrollTop, scrollHeight, clientHeight } = getScrollMetrics();
    setVisible(shouldShowFab(scrollTop, scrollHeight, clientHeight));
  }, []);

  useEffect(() => {
    update();
  }, [update, location.pathname]);

  useEffect(() => {
    const onScroll = () => update();
    const onResize = () => update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [update]);

  const scrollToBottom = () => {
    const docEl = document.documentElement;
    const top = Math.max(docEl.scrollHeight, document.body.scrollHeight);
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top, behavior: prefersReduced ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      className={`scroll-to-bottom-fab${visible ? " scroll-to-bottom-fab--visible" : ""}`}
      onClick={scrollToBottom}
      title="Ir ao final da página"
      aria-label="Ir ao final da página"
    >
      <ChevronDown size={26} strokeWidth={2.4} aria-hidden />
    </button>
  );
}
