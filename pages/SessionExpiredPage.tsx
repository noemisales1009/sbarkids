import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function BgGear({ size, top, left, right, speed, reverse, opacity }: {
  size: number; top?: number | string; left?: number | string;
  right?: number | string; speed: number; reverse?: boolean; opacity: number;
}) {
  const teeth = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  const animationRule = `spin ${speed}s linear infinite ${reverse ? "reverse" : ""}`;
  return (
    <svg
      width={size} height={size} viewBox="0 0 100 100" fill="none"
      style={{ position: "absolute", top, left, right, opacity, pointerEvents: "none" }}
    >
      <g style={{ transformOrigin: "50px 50px", animation: animationRule }}>
        {teeth.map(a => (
          <rect key={a} x="44" y="2" width="12" height="16" rx="3" fill="#C4B580" transform={`rotate(${a} 50 50)`} />
        ))}
        <circle cx="50" cy="50" r="28" fill="#C4B580" />
        <circle cx="50" cy="50" r="13" fill="#FFFDF5" />
      </g>
    </svg>
  );
}

export default function SessionExpiredPage() {
  const [redirecting, setRedirecting] = useState(false);
  const navigate = useNavigate();

  const handleLoginClick = async () => {
    setRedirecting(true);
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div style={{
      background: "#FFFDF5",
      fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
      position: "relative",
      padding: "36px 20px 48px",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden"
    }}>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(22px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes floatY { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-9px) } }

        .a0 { animation: fadeUp 0.5s 0.0s ease both; }
        .a1 { animation: fadeUp 0.5s 0.13s ease both; }
        .a3 { animation: fadeUp 0.5s 0.28s ease both; }
        .a4 { animation: fadeUp 0.5s 0.42s ease both; }
        .a5 { animation: fadeUp 0.5s 0.55s ease both; }

        .rob { animation: floatY 4s 1.2s ease-in-out infinite; }

        .btn {
          display: inline-block; padding: 15px 62px; background: #FFC800; color: #1a1a1a;
          font-family: 'Segoe UI', 'Helvetica Neue', sans-serif; font-weight: 800; font-size: 17px;
          border: 2.5px solid #1a1a1a; border-radius: 14px; cursor: pointer;
          box-shadow: 0 5px 0 #1a1a1a; transition: background 0.15s, transform 0.1s, box-shadow 0.1s;
          letter-spacing: 0.01em;
        }
        .btn:hover { background: #f0bc00; }
        .btn:active { transform: translateY(5px); box-shadow: none; }

        .scene-container {
          position: relative; width: 100%; display: flex; justify-content: center; align-items: flex-end;
          min-height: 380px; padding-top: 40px; margin-bottom: 32px;
        }
        .item-flowers { position: absolute; left: 2%; bottom: 10px; width: 22%; max-width: 90px; z-index: 1; }
        .item-roses   { position: absolute; right: 2%; bottom: 10px; width: 22%; max-width: 90px; z-index: 1; }
        .item-robot   { width: 60%; max-width: 300px; z-index: 2; }
        .item-bubble  { position: absolute; right: -5%; top: 0; width: 45%; max-width: 220px; z-index: 3; }

        @media (max-width: 900px) {
          .item-bubble  { width: 50%; right: -2%; }
          .item-robot   { width: 65%; }
        }

        @media (max-width: 600px) {
          .scene-container { min-height: 280px; padding-top: 30px; }
          .item-flowers { width: 26%; left: -4%; }
          .item-roses   { width: 26%; right: -4%; }
          .item-robot   { width: 75%; }
          .item-bubble  { width: 55%; right: -8%; top: -15%; }
        }
      `}</style>

      {/* Fundo ponteado */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dp" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.1" fill="#C8BA88" opacity=".38" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dp)" />
      </svg>

      {/* Engrenagens de fundo */}
      <BgGear size={112} top={12} left={12} opacity={0.14} speed={26} />
      <BgGear size={76} top={8} right={48} opacity={0.12} speed={17} reverse />
      <BgGear size={46} top={70} right={16} opacity={0.10} speed={11} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 580, width: "100%", margin: "0 auto", position: "relative", zIndex: 2 }}>

        {/* Badge de aviso */}
        <div className="a0" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#FFF3C0", border: "1.5px solid #E8C000", borderRadius: 999, padding: "5px 14px 5px 10px", marginBottom: 18 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="8" cy="8.5" r="5.5" stroke="#9A7000" strokeWidth="1.6" fill="none" />
            <path d="M8 5.5 L8 9 L10.2 10.2" stroke="#9A7000" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "#7A5800", letterSpacing: ".07em", textTransform: "uppercase" }}>Sessão expirada</span>
        </div>

        <h1 className="a1" style={{ fontSize: "clamp(1.9rem,5vw,2.75rem)", fontWeight: 800, color: "#1a1a1a", textAlign: "center", lineHeight: 1.16, margin: "0 0 20px", letterSpacing: "-.025em" }}>
          A sua sessão expirou<br />por segurança
        </h1>

        {/* Ilustração */}
        <div className="a3 scene-container">

          {/* Flores amarelas */}
          <div className="item-flowers">
            <svg viewBox="0 0 90 148" width="100%" style={{ display: "block" }} fill="none">
              <path d="M 30 88 Q 16 92 14 108 L 16 142 L 74 142 L 76 108 Q 74 92 60 88 Z" fill="#DAD4C6" />
              <ellipse cx="45" cy="88" rx="16" ry="5.5" fill="#C8C2B4" />
              <path d="M 42 84 Q 28 66 22 36" stroke="#4B5563" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 45 84 Q 44 62 42 26" stroke="#4B5563" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 48 84 Q 62 66 66 38" stroke="#4B5563" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 36 64 Q 20 54 24 40" stroke="#4B5563" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 54 64 Q 70 54 66 42" stroke="#4B5563" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <ellipse cx="9.6" cy="31.8" rx="8" ry="5" fill="#FFC800" transform="rotate(0 9.6 31.8)" />
              <ellipse cx="25" cy="22.4" rx="8" ry="5" fill="#FFC800" transform="rotate(72 25 22.4)" />
              <ellipse cx="34.8" cy="37.4" rx="8" ry="5" fill="#FFC800" transform="rotate(144 34.8 37.4)" />
              <ellipse cx="13.8" cy="45.8" rx="8" ry="5" fill="#FFC800" transform="rotate(216 13.8 45.8)" />
              <ellipse cx="3.6" cy="34.2" rx="8" ry="5" fill="#FFC800" transform="rotate(288 3.6 34.2)" />
              <circle cx="22" cy="36" r="7" fill="#E5A000" /><circle cx="22" cy="36" r="3.5" fill="#1F2937" opacity=".9" />
              <ellipse cx="54.8" cy="26" rx="8" ry="5" fill="#FFC800" transform="rotate(0 54.8 26)" />
              <ellipse cx="50.2" cy="13.8" rx="8" ry="5" fill="#FFC800" transform="rotate(72 50.2 13.8)" />
              <ellipse cx="36.4" cy="15.8" rx="8" ry="5" fill="#FFC800" transform="rotate(144 36.4 15.8)" />
              <ellipse cx="31.2" cy="28.4" rx="8" ry="5" fill="#FFC800" transform="rotate(216 31.2 28.4)" />
              <ellipse cx="40.6" cy="38.2" rx="8" ry="5" fill="#FFC800" transform="rotate(288 40.6 38.2)" />
              <circle cx="42" cy="26" r="7" fill="#E5A000" /><circle cx="42" cy="26" r="3.5" fill="#1F2937" opacity=".9" />
              <ellipse cx="78.8" cy="38" rx="8" ry="5" fill="#FFC800" transform="rotate(0 78.8 38)" />
              <ellipse cx="74.2" cy="25.8" rx="8" ry="5" fill="#FFC800" transform="rotate(72 74.2 25.8)" />
              <ellipse cx="60.4" cy="27.8" rx="8" ry="5" fill="#FFC800" transform="rotate(144 60.4 27.8)" />
              <ellipse cx="55.2" cy="40.4" rx="8" ry="5" fill="#FFC800" transform="rotate(216 55.2 40.4)" />
              <ellipse cx="64.6" cy="50.2" rx="8" ry="5" fill="#FFC800" transform="rotate(288 64.6 50.2)" />
              <circle cx="66" cy="38" r="7" fill="#E5A000" /><circle cx="66" cy="38" r="3.5" fill="#1F2937" opacity=".9" />
            </svg>
          </div>

          {/* Rosas vermelhas */}
          <div className="item-roses">
            <svg viewBox="0 0 90 148" width="100%" style={{ display: "block" }} fill="none">
              <path d="M 30 88 Q 16 92 14 108 L 16 142 L 74 142 L 76 108 Q 74 92 60 88 Z" fill="#DAD4C6" />
              <ellipse cx="45" cy="88" rx="16" ry="5.5" fill="#C8C2B4" />
              <path d="M 42 84 Q 28 66 25 30" stroke="#4B5563" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 45 84 Q 45 55 48 20" stroke="#4B5563" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 48 84 Q 62 66 70 35" stroke="#4B5563" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 34 65 Q 20 60 15 50" stroke="#4B5563" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 46 55 Q 65 50 60 65" stroke="#4B5563" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 52 40 Q 70 35 75 50" stroke="#4B5563" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <g transform="translate(25, 30)">
                <circle r="12" fill="#E11D48" />
                <circle cx="-1" cy="2" r="9" fill="#BE123C" />
                <circle cx="1" cy="-1" r="5" fill="#9F1239" />
                <path d="M -1.5 1 Q 0 -2 1.5 1 Z" fill="#FDA4AF" />
              </g>
              <g transform="translate(48, 20)">
                <circle r="14" fill="#E11D48" />
                <circle cx="1" cy="-2" r="10" fill="#BE123C" />
                <circle cx="-1" cy="1" r="6" fill="#9F1239" />
                <path d="M -2 1.5 Q 0 -3 2 1.5 Z" fill="#FDA4AF" />
              </g>
              <g transform="translate(70, 35)">
                <circle r="11" fill="#E11D48" />
                <circle cx="-2" cy="-1" r="8" fill="#BE123C" />
                <circle cx="1" cy="1" r="4" fill="#9F1239" />
                <path d="M -1 1 Q 0 -2 1 1 Z" fill="#FDA4AF" />
              </g>
            </svg>
          </div>

          {/* Robô */}
          <div className="rob item-robot">
            <svg viewBox="0 0 300 380" width="100%" style={{ display: "block" }} fill="none">
              <ellipse cx="150" cy="368" rx="104" ry="10" fill="#E2D9C4" />
              <path d="M 50 354 Q 55 342 60 354 T 70 354 T 80 354" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
              <g transform="translate(118,358) rotate(15)">
                <rect x="-6" y="-3.5" width="12" height="7" rx="1.8" fill="#374151" />
                <line x1="-5" y1="0" x2="5" y2="0" stroke="#FFFDF5" strokeWidth="1.2" />
              </g>
              <path d="M 145 354 L 151 349 L 157 354 L 151 360 Z" fill="#6B7280" />
              <g transform="translate(232,352) rotate(-12)">
                <path d="M 0 0 L 13 -4.5 L 15 0 L 2 4.5 Z" fill="#3B82F6" />
                <path d="M 13 -4.5 L 17 -7 L 19 -2 L 15 0 Z" fill="#1D4ED8" />
                <line x1="3.5" y1="-1" x2="5.8" y2="3.2" stroke="#1D4ED8" strokeWidth="1.4" />
                <line x1="7.8" y1="-2.2" x2="10" y2="1.8" stroke="#1D4ED8" strokeWidth="1.4" />
              </g>
              <rect x="96" y="330" width="44" height="24" rx="12" fill="#A87C00" />
              <rect x="160" y="330" width="44" height="24" rx="12" fill="#A87C00" />
              <line x1="118" y1="272" x2="118" y2="346" stroke="#DDA800" strokeWidth="32" strokeLinecap="round" />
              <line x1="118" y1="272" x2="118" y2="344" stroke="#FFC800" strokeWidth="23" strokeLinecap="round" />
              <line x1="182" y1="272" x2="182" y2="346" stroke="#DDA800" strokeWidth="32" strokeLinecap="round" />
              <line x1="182" y1="272" x2="182" y2="344" stroke="#FFC800" strokeWidth="23" strokeLinecap="round" />
              <line x1="90" y1="182" x2="62" y2="272" stroke="#DDA800" strokeWidth="28" strokeLinecap="round" />
              <line x1="90" y1="182" x2="64" y2="270" stroke="#FFC800" strokeWidth="20" strokeLinecap="round" />
              <line x1="210" y1="182" x2="238" y2="272" stroke="#DDA800" strokeWidth="28" strokeLinecap="round" />
              <line x1="210" y1="182" x2="236" y2="270" stroke="#FFC800" strokeWidth="20" strokeLinecap="round" />
              <rect x="88" y="162" width="124" height="116" rx="14" fill="#FFC800" />
              <rect x="88" y="162" width="124" height="23" rx="14" fill="white" opacity=".22" />
              <rect x="100" y="178" width="100" height="92" rx="10" fill="#1F2937" />
              <g transform="translate(128, 208)">
                <g>
                  <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="8s" repeatCount="indefinite" />
                  {[0, 45, 90, 135].map(a => (
                    <rect key={a} x="-4" y="-18" width="8" height="36" rx="2" fill="#FFC800" transform={`rotate(${a})`} />
                  ))}
                  <circle r="13" fill="#FFC800" />
                  <circle r="5" fill="#1F2937" />
                </g>
              </g>
              <g transform="translate(156, 242)">
                <g>
                  <animateTransform attributeName="transform" type="rotate" from="360 0 0" to="0 0 0" dur="5s" repeatCount="indefinite" />
                  {[0, 45, 90, 135].map(a => (
                    <rect key={a} x="-3" y="-12" width="6" height="24" rx="1.5" fill="#D1D5DB" transform={`rotate(${a})`} />
                  ))}
                  <circle r="8" fill="#D1D5DB" />
                  <circle r="3" fill="#1F2937" />
                </g>
              </g>
              <g transform="translate(178, 212)">
                <g>
                  <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="7s" repeatCount="indefinite" />
                  {[0, 45, 90, 135].map(a => (
                    <rect key={a} x="-3.5" y="-15" width="7" height="30" rx="1.5" fill="#DDA800" transform={`rotate(${a})`} />
                  ))}
                  <circle r="10" fill="#DDA800" />
                  <circle r="4" fill="#1F2937" />
                </g>
              </g>
              <rect x="196" y="178" width="10" height="92" rx="4" fill="#A87C00" />
              <rect x="204" y="176" width="56" height="96" rx="8" fill="#FFC800" stroke="#CC9E00" strokeWidth="2.5" />
              <rect x="212" y="184" width="40" height="72" rx="5" fill="#FFDB55" opacity=".45" />
              <circle cx="215" cy="228" r="5.5" fill="#CC9E00" />
              <circle cx="215" cy="228" r="2.5" fill="#A87C00" />
              <path d="M 154 270 C 156 294 172 280 170 312" stroke="#374151" strokeWidth="3" fill="none" />
              <g transform="translate(172,318)">
                <rect x="-3.5" y="-12" width="7" height="8" rx="1.5" fill="#1F2937" />
                <rect x="-3.5" y="-12" width="7" height="8" rx="1.5" fill="#1F2937" transform="rotate(45 0 0)" />
                <rect x="-3.5" y="-12" width="7" height="8" rx="1.5" fill="#1F2937" transform="rotate(90 0 0)" />
                <rect x="-3.5" y="-12" width="7" height="8" rx="1.5" fill="#1F2937" transform="rotate(135 0 0)" />
                <circle r="8.5" fill="#1F2937" /><circle r="3.5" fill="#FFFDF5" />
              </g>
              <g transform="rotate(-6 150 98)">
                <rect x="136" y="134" width="28" height="32" rx="5" fill="#CC9E00" />
                <rect x="70" y="36" width="160" height="104" rx="16" fill="#FFC800" />
                <rect x="70" y="36" width="160" height="21" rx="16" fill="white" opacity=".22" />
                <rect x="84" y="52" width="132" height="78" rx="10" fill="#1F2937" />
                <line x1="102" y1="68" x2="138" y2="102" stroke="#FFC800" strokeWidth="9" strokeLinecap="round" />
                <line x1="138" y1="68" x2="102" y2="102" stroke="#FFC800" strokeWidth="9" strokeLinecap="round" />
                <line x1="155" y1="89" x2="198" y2="89" stroke="#FFC800" strokeWidth="9" strokeLinecap="round" />
                <rect x="56" y="80" width="16" height="26" rx="5" fill="#CC9E00" />
                <rect x="228" y="80" width="16" height="26" rx="5" fill="#CC9E00" />
                <rect x="186" y="12" width="10" height="28" rx="4" fill="#CC9E00" />
                <g transform="translate(191,9)">
                  <rect x="-3.5" y="-11" width="7" height="8" rx="2" fill="#CC9E00" />
                  <rect x="-3.5" y="-11" width="7" height="8" rx="2" fill="#CC9E00" transform="rotate(45 0 0)" />
                  <rect x="-3.5" y="-11" width="7" height="8" rx="2" fill="#CC9E00" transform="rotate(90 0 0)" />
                  <rect x="-3.5" y="-11" width="7" height="8" rx="2" fill="#CC9E00" transform="rotate(135 0 0)" />
                  <circle r="7.5" fill="#CC9E00" /><circle r="3.5" fill="#FFC800" />
                </g>
              </g>
            </svg>
          </div>

          {/* Balão de fala */}
          <div className="item-bubble">
            <svg viewBox="0 0 220 150" width="100%" style={{ display: "block" }} fill="none">
              <ellipse cx="110" cy="70" rx="100" ry="60" fill="white" stroke="#1a1a1a" strokeWidth="2.5" />
              <path d="M 60 120 L 20 150 L 90 128 Z" fill="white" />
              <path d="M 60 120 L 20 150" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 90 128 L 20 150" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <text x="110" y="55" textAnchor="middle" fontWeight="800" fontSize="17" fill="#1a1a1a" fontFamily="'Segoe UI','Helvetica Neue',sans-serif">Por favor,</text>
              <text x="110" y="77" textAnchor="middle" fontWeight="800" fontSize="17" fill="#1a1a1a" fontFamily="'Segoe UI','Helvetica Neue',sans-serif">faça login</text>
              <text x="110" y="99" textAnchor="middle" fontWeight="800" fontSize="17" fill="#1a1a1a" fontFamily="'Segoe UI','Helvetica Neue',sans-serif">novamente.</text>
            </svg>
          </div>
        </div>

        {/* Botão */}
        <button
          className="btn a4"
          onClick={handleLoginClick}
          disabled={redirecting}
          style={{
            marginTop: 14,
            background: redirecting ? "#f0bc00" : "#FFC800",
            transform: redirecting ? "translateY(5px)" : "translateY(0)",
            boxShadow: redirecting ? "none" : "0 5px 0 #1a1a1a",
            opacity: redirecting ? 0.8 : 1,
          }}
        >
          {redirecting ? "A redirecionar..." : "Fazer login novamente"}
        </button>
      </div>
    </div>
  );
}
