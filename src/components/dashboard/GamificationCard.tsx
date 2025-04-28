import React from 'react';

interface GamificationCardProps {
  totalValued: number;
  level: { name: string; next: number; color: string; label: string };
}

/**
 * GamificationCard: Uses global style variables for perfect brand match
 */
export const GamificationCard = ({ totalValued, level }: GamificationCardProps) => {
  const progress = Math.min((totalValued / level.next) * 100, 100);
  return (
    <div style={{ background: 'var(--surface-color)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--shadow-md)', padding: 24, fontFamily: 'var(--font-main)' }}>
      <div style={{ fontWeight: 800, color: 'var(--primary-color)', fontSize: 20, marginBottom: 6 }}>Gamification</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--secondary-color)', marginBottom: 8 }}>{totalValued} valued</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ background: level.color, color: '#fff', borderRadius: 16, padding: '4px 14px', fontWeight: 700, fontSize: 14 }}>Level: {level.name}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{level.label}</span>
      </div>
      <div style={{ width: '100%', height: 8, background: 'var(--border-color)', borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary-gradient)', borderRadius: 6, transition: 'width 0.3s' }} />
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
        {totalValued} / {level.next} to next level
      </div>
    </div>
  );
}
