import React, { useEffect, useState } from "react";

const words = [
  "Poder interior",
  "Magia nórdica reinventada",
  "Energía astral",
  "Tus guías de siempre",
  "Luz ancestral en tu camino",
  "Sabiduría y misterio",
  "Constelaciones y runas",
  "Mente y universo alineados",
];

export default function AnimatedSubtitle() {
  const [idx, setIdx] = useState(0);
  const [animate, setAnimate] = useState(true); // true=entrando, false=saliendo

  useEffect(() => {
    const showDuration = 1800; // tiempo palabra visible
    const animDuration = 400; // tiempo para animar entrada y salida

    let timeout1 = setTimeout(() => setAnimate(false), showDuration); // empezar salida
    let timeout2 = setTimeout(() => {
      setIdx((prev) => (prev + 1) % words.length);
      setAnimate(true);
    }, showDuration + animDuration); // cambiar palabra y entrar

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [idx]);

  return (
    <div
      className="animated-subtitle"
      style={{
        fontSize: "1.35rem",
        lineHeight: "1.22",
        margin: "15px 0 8px 0",
        color: "var(--primary)",
        minHeight: "2.2em",
        fontWeight: 600,
        letterSpacing: "-0.5px",
        overflow: "hidden",
        display: "flex",
        fontFamily: 'var(--font-title)'
      }}
    >
      <span
        key={idx}
        className={`word ${animate ? "enter" : "exit"}`}
        style={{
          position: "absolute",
          width: "100%",
          transformOrigin: "center",
          transition: "transform 0.4s ease, opacity 0.4s ease",
          opacity: animate ? 1 : 0,
          transform: animate ? "translateY(0)" : "translateY(100%)",
        }}
      >
        {words[idx]}
      </span>
    </div>
  );
}