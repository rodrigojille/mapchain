import React, { useEffect, useRef } from "react";

// Neon animated arrow with glow
interface NeonArrowProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  delay?: number;
  label?: string;
}
const NeonArrow: React.FC<NeonArrowProps> = ({ x1, y1, x2, y2, color = "#00f0ff", delay = 0, label }) => {
  const lineRef = useRef<SVGLineElement | null>(null);
  useEffect(() => {
    if (lineRef.current) {
      const length = lineRef.current.getTotalLength();
      lineRef.current.style.strokeDasharray = String(length);
      lineRef.current.style.strokeDashoffset = String(length);
      setTimeout(() => {
        if (lineRef.current) {
          lineRef.current.style.transition = "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)";
          lineRef.current.style.strokeDashoffset = "0";
        }
      }, delay);
    }
  }, [delay]);
  return (
    <>
      <line
        ref={lineRef}
        x1={Number(x1)}
        y1={Number(y1)}
        x2={Number(x2)}
        y2={Number(y2)}
        stroke={color}
        strokeWidth={4}
        markerEnd="url(#arrowhead)"
        style={{
          filter: `drop-shadow(0px 0px 8px ${color}) drop-shadow(0px 0px 16px ${color}99)`
        } as React.CSSProperties}
      />
      {label && (
        <text
          x={(Number(x1) + Number(x2)) / 2}
          y={(Number(y1) + Number(y2)) / 2 - 14}
          textAnchor="middle"
          fontSize="15"
          fill="#b6faff"
          fontFamily="sans-serif"
          style={{ filter: `drop-shadow(0px 0px 6px #00f0ff)` }}
        >{label}</text>
      )}
    </>
  );
};

// Simple tooltip
interface TooltipProps {
  children: React.ReactNode;
  text: string;
}
const Tooltip: React.FC<TooltipProps> = ({ children, text }) => (
  <span style={{ position: 'relative', cursor: 'pointer' }}>
    {children}
    <span style={{
      visibility: 'hidden',
      opacity: 0,
      position: 'absolute',
      left: '50%',
      bottom: '120%',
      transform: 'translateX(-50%)',
      background: '#111827ee',
      color: '#fff',
      padding: '8px 16px',
      borderRadius: 8,
      fontSize: 15,
      whiteSpace: 'nowrap',
      zIndex: 10,
      transition: 'opacity 0.2s',
      pointerEvents: 'none',
    }}
      className="diagram-tooltip"
    >{text}</span>
  </span>
);

const roleCards = [
  {
    x: 60, y: 80, label: 'Owner', color: '#00f0ff', icon: '🏠', desc: 'Property Owners mint and manage their properties.'
  },
  {
    x: 60, y: 220, label: 'Valuator', color: '#ffb300', icon: '🧑‍💼', desc: 'Valuators provide trusted property valuations.'
  },
  {
    x: 60, y: 360, label: 'Admin', color: '#ff61a6', icon: '🛡️', desc: 'Admins oversee and resolve disputes.'
  }
];
const contractCards = [
  {
    x: 360, y: 40, label: 'Property NFT', color: '#00f0ff', icon: '🔗', desc: 'Tokenizes property ownership on Hedera.'
  },
  {
    x: 360, y: 160, label: 'Valuation Escrow', color: '#ffb300', icon: '💰', desc: 'Secures payments for valuations.'
  },
  {
    x: 360, y: 280, label: 'Valuation Token', color: '#00ff8b', icon: '🪙', desc: 'Represents completed valuations.'
  },
  {
    x: 360, y: 400, label: 'Gamification', color: '#ff61a6', icon: '🎮', desc: 'Rewards users for engagement.'
  }
];

const connections: [number, number, number, number, string, string, number][] = [
  [190, 110, 360, 70, '#00f0ff', 'Mint Property', 200],
  [190, 250, 360, 180, '#ffb300', 'Create Escrow', 600],
  [190, 250, 360, 300, '#00ff8b', 'Request Valuation', 1000],
  [190, 390, 360, 420, '#ff61a6', 'Award Points', 1400]
];

const ContractsDiagram: React.FC = () => (
  <div style={{ minHeight: 800, background: 'radial-gradient(circle at 60% 40%, #1e293b 60%, #0f172a 100%)', padding: 0 }}>
    <div style={{ textAlign: 'center', padding: '48px 0 16px 0' }}>
      <h1 style={{ fontSize: 44, color: '#00f0ff', margin: 0, fontWeight: 900, letterSpacing: 2, textShadow: '0 0 22px #00f0ff88' }}>
        MapChain Smart Contract Flow
      </h1>
      <p style={{ fontSize: 22, color: '#b6faff', margin: '18px 0 0 0', fontWeight: 400, textShadow: '0 0 6px #00f0ff44' }}>
        Visualize how users and contracts interact on Hedera. Hover for details.
      </p>
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: 650 }}>
      <svg width="900" height="520" viewBox="0 0 900 520" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ background: 'rgba(17,24,39,0.96)', borderRadius: 32, boxShadow: '0 4px 32px #00f0ff22', border: '1.5px solid #222a3a' }}>
        {/* Neon grid */}
        <g>
          {[...Array(10)].map((_, i) => (
            <line key={i} x1={0} y1={i*52} x2={900} y2={i*52} stroke="#23304a" strokeWidth="1" />
          ))}
          {[...Array(10)].map((_, i) => (
            <line key={i+10} x1={i*100} y1={0} x2={i*100} y2={520} stroke="#23304a" strokeWidth="1" />
          ))}
        </g>
        {/* Role cards */}
        {roleCards.map((role, i) => (
          <g key={role.label}>
            <rect x={role.x} y={role.y} width={120} height={90} rx={18} fill="#101e2e" stroke={role.color} strokeWidth="2.5" style={{ filter: `drop-shadow(0 0 12px ${role.color}99)` }} />
            <text x={role.x+60} y={role.y+38} textAnchor="middle" fontSize="38" fontFamily="sans-serif" fill={role.color}>{role.icon}</text>
            <text x={role.x+60} y={role.y+72} textAnchor="middle" fontSize="18" fontWeight="bold" fontFamily="sans-serif" fill="#fff" style={{ textShadow: `0 0 8px ${role.color}77` }}>{role.label}</text>
            <title>{role.desc}</title>
          </g>
        ))}
        {/* Contract cards */}
        {contractCards.map((c, i) => (
          <g key={c.label}>
            <rect x={c.x} y={c.y} width={180} height={90} rx={22} fill="#181f2e" stroke={c.color} strokeWidth="3" style={{ filter: `drop-shadow(0 0 20px ${c.color}88)` }} />
            <text x={c.x+90} y={c.y+44} textAnchor="middle" fontSize="38" fontFamily="sans-serif" fill={c.color}>{c.icon}</text>
            <text x={c.x+90} y={c.y+74} textAnchor="middle" fontSize="20" fontWeight="bold" fontFamily="sans-serif" fill="#fff" style={{ textShadow: `0 0 10px ${c.color}77` }}>{c.label}</text>
            <title>{c.desc}</title>
          </g>
        ))}
        {/* Animated neon arrows */}
        {connections.map(([x1, y1, x2, y2, color, label, delay], i) => (
          <NeonArrow key={i} x1={x1} y1={y1} x2={x2} y2={y2} color={color} delay={delay} label={label} />
        ))}
        {/* Arrow marker definition */}
        <defs>
          <marker id="arrowhead" markerWidth="12" markerHeight="9" refX="12" refY="4.5" orient="auto" markerUnits="strokeWidth">
            <polygon points="0 0, 12 4.5, 0 9" fill="#00f0ff" />
          </marker>
        </defs>
      </svg>
    </div>
    <div style={{ textAlign: 'center', marginTop: 40 }}>
      <button style={{ background: 'linear-gradient(90deg,#00f0ff 40%,#00ff8b 100%)', color: '#101e2e', border: 'none', borderRadius: 16, padding: '20px 48px', fontSize: 24, fontWeight: 800, boxShadow: '0 2px 32px #00f0ff44', cursor: 'pointer', letterSpacing: 1, transition: 'background 0.2s' }}
        onMouseOver={e => (e.currentTarget.style.background = 'linear-gradient(90deg,#00ff8b 40%,#00f0ff 100%)')}
        onMouseOut={e => (e.currentTarget.style.background = 'linear-gradient(90deg,#00f0ff 40%,#00ff8b 100%)')}
      >
        Get Started
      </button>
      <p style={{ color: '#b6faff', marginTop: 18, fontSize: 20, textShadow: '0 0 6px #00f0ff44' }}>
        Join MapChain and experience the future of property valuation.
      </p>
    </div>
  </div>
);

export default ContractsDiagram;
