import { useEffect, useMemo, useState } from "react";

export default function ScrollToBottomFab() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop || 0;
      const height = doc.scrollHeight - doc.clientHeight;
      // aparece quando já rolou um pouco e ainda não chegou perto do fim
      setVisible(scrollTop > 300 && scrollTop < Math.max(0, height - 300));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const style = useMemo(
    () => ({
      position: "fixed" as const,
      right: 18,
      bottom: 18,
      zIndex: 9999,
      width: 46,
      height: 46,
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.25)",
      background: "rgba(15, 23, 42, 0.75)",
      color: "#fff",
      display: visible ? "flex" : "none",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
      backdropFilter: "blur(10px)",
      fontWeight: 900,
      userSelect: "none" as const,
    }),
    [visible]
  );

  return (
    <button
      type="button"
      style={style}
      onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}
      aria-label="Ir ao final da página"
    >
      ↓
    </button>
  );
}

