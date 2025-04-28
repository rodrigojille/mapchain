import React from 'react';
import { IconReportMoney, IconCheck, IconCoin } from '@tabler/icons-react';

/**
 * StatsCards: Uses global style variables for perfect brand match
 * 
 * @param {number} pending - Number of pending requests
 * @param {number} completed - Number of completed requests
 * @param {number} earnings - Total earnings
 */
interface StatsCardsProps {
  pending: number;
  completed: number;
  earnings: number;
}

export const StatsCards = ({ pending, completed, earnings }: StatsCardsProps) => {
  const stats = [
    { label: 'Pending Requests', value: pending, icon: <span style={{ color: 'var(--primary-color)' }}><IconReportMoney size={28} /></span> },
    { label: 'Completed', value: completed, icon: <span style={{ color: 'var(--secondary-color)' }}><IconCheck size={28} /></span> },
    { label: 'Earnings', value: `$${earnings}`, icon: <span style={{ color: 'var(--accent-color)' }}><IconCoin size={28} /></span> },
  ];

  return (
    <div style={{ display: 'flex', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
      {stats.map((stat, idx) => (
        <div
          key={stat.label}
          className="card shadow rounded"
          style={{
            background: 'var(--surface-color)',
            borderRadius: 'var(--card-radius)',
            boxShadow: 'var(--shadow-md)',
            padding: '28px 20px',
            minWidth: 180,
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          {stat.icon}
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary-color)', fontFamily: 'var(--font-main)' }}>{stat.value}</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
