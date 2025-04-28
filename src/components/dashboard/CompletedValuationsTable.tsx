import React from 'react';
import { Table, Badge, Anchor, Group, Title, Divider, Center, Text } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';

interface CompletedValuation {
  id: string;
  property: string;
  type: string;
  status: string;
  completed: string;
  fee: number;
}

interface CompletedValuationsTableProps {
  completed: CompletedValuation[];
}

export default function CompletedValuationsTable({ completed }: CompletedValuationsTableProps) {
  return (
    <div style={{ background: 'var(--surface-color)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--shadow-md)', padding: 0, fontFamily: 'var(--font-main)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px 6px 24px' }}>
        <span style={{ fontWeight: 800, color: 'var(--primary-color)', fontSize: 18 }}>Completed Valuations</span>
        <a href="/valuations" style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          View all <span style={{ display: 'inline-flex', verticalAlign: 'middle' }}><IconArrowRight size={14} /></span>
        </a>
      </div>
      <div style={{ borderTop: '1px solid var(--border-color)', margin: '0 24px' }} />
      {completed.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>No completed valuations yet.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 15, margin: '0 24px' }}>
          <thead>
            <tr style={{ background: 'var(--surface-alt)' }}>
              <th style={{ textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, padding: '10px 24px', borderBottom: '1.5px solid var(--border-color)' }}>Property</th>
              <th style={{ textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, padding: '10px 24px', borderBottom: '1.5px solid var(--border-color)' }}>Type</th>
              <th style={{ textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, padding: '10px 24px', borderBottom: '1.5px solid var(--border-color)' }}>Status</th>
              <th style={{ textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, padding: '10px 24px', borderBottom: '1.5px solid var(--border-color)' }}>Completed</th>
              <th style={{ textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, padding: '10px 24px', borderBottom: '1.5px solid var(--border-color)' }}>Fee</th>
            </tr>
          </thead>
          <tbody>
            {completed.map((item) => (
              <tr key={item.id}>
                <td style={{ padding: '10px 24px', borderBottom: '1px solid var(--border-color)' }}>{item.property}</td>
                <td style={{ padding: '10px 24px', borderBottom: '1px solid var(--border-color)' }}>{item.type}</td>
                <td style={{ padding: '10px 24px', borderBottom: '1px solid var(--border-color)', color: 'var(--secondary-color)', fontWeight: 700 }}>{item.status}</td>
                <td style={{ padding: '10px 24px', borderBottom: '1px solid var(--border-color)' }}>{item.completed}</td>
                <td style={{ padding: '10px 24px', borderBottom: '1px solid var(--border-color)', color: 'var(--secondary-color)', fontWeight: 700 }}>${item.fee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
