import React from 'react';
import { Table, Title, Badge } from '@mantine/core';

interface LeaderboardUser {
  name: string;
  count: number;
  you?: boolean;
}

interface LeaderboardTableProps {
  leaderboard: LeaderboardUser[];
}

export default function LeaderboardTable({ leaderboard }: LeaderboardTableProps) {
  return (
    <div style={{ background: 'var(--surface-color)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--shadow-md)', padding: 0, fontFamily: 'var(--font-main)' }}>
      <div style={{ fontWeight: 800, color: 'var(--primary-color)', fontSize: 18, padding: '18px 24px 6px 24px' }}>Leaderboard</div>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 15 }}>
        <thead>
          <tr style={{ background: 'var(--surface-alt)' }}>
            <th style={{ textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, padding: '10px 24px', borderBottom: '1.5px solid var(--border-color)' }}>Valuator</th>
            <th style={{ textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, padding: '10px 24px', borderBottom: '1.5px solid var(--border-color)' }}>Valued</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((item, idx) => (
            <tr
              key={item.name}
              style={item.you
                ? { background: 'rgba(66,133,244,0.09)', fontWeight: 800, color: 'var(--primary-color)' }
                : { background: 'none', color: 'var(--text-main)', fontWeight: 600 }}
            >
              <td style={{ padding: '10px 24px', borderBottom: '1px solid var(--border-color)' }}>{item.name}{item.you && <span style={{ color: 'var(--primary-color)', marginLeft: 8 }}>You</span>}</td>
              <td style={{ padding: '10px 24px', borderBottom: '1px solid var(--border-color)' }}>{item.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

