import React from 'react';
import { IconArrowRight } from '@tabler/icons-react';

interface ValuationRequest {
  id: string;
  property: string;
  type: string;
  status: string;
  requested: string;
}

interface ValuationRequestsTableProps {
  requests: ValuationRequest[];
}

export default function ValuationRequestsTable({ requests }: ValuationRequestsTableProps) {
  return (
    <div style={{ background: 'var(--surface-color)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--shadow-md)', padding: 0, fontFamily: 'var(--font-main)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px 6px 24px' }}>
        <span style={{ fontWeight: 800, color: 'var(--primary-color)', fontSize: 18 }}>Pending Valuation Requests</span>
        <a href="/valuations" style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          View all <span style={{ display: 'inline-flex', verticalAlign: 'middle' }}><IconArrowRight size={14} /></span>
        </a>
      </div>
      <div style={{ padding: '0 24px' }}>
        {requests.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0' }}>No pending requests.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 15 }}>
            <thead>
              <tr style={{ background: 'var(--surface-alt)' }}>
                <th style={{ textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, padding: '10px 24px', borderBottom: '1.5px solid var(--border-color)' }}>Property</th>
                <th style={{ textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, padding: '10px 24px', borderBottom: '1.5px solid var(--border-color)' }}>Type</th>
                <th style={{ textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, padding: '10px 24px', borderBottom: '1.5px solid var(--border-color)' }}>Status</th>
                <th style={{ textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, padding: '10px 24px', borderBottom: '1.5px solid var(--border-color)' }}>Requested</th>
                <th style={{ textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, padding: '10px 24px', borderBottom: '1.5px solid var(--border-color)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td style={{ padding: '10px 24px', borderBottom: '1px solid var(--border-color)' }}>{req.property}</td>
                  <td style={{ padding: '10px 24px', borderBottom: '1px solid var(--border-color)' }}>{req.type}</td>
                  <td style={{ padding: '10px 24px', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ background: req.status === 'Pending' ? 'var(--yellow)' : 'var(--green)', color: 'var(--text-on-primary)', padding: '2px 6px', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>
                      {req.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 24px', borderBottom: '1px solid var(--border-color)' }}>{req.requested}</td>
                  <td style={{ padding: '10px 24px', borderBottom: '1px solid var(--border-color)' }}>
                    <button style={{ background: 'var(--primary-color)', color: 'var(--text-on-primary)', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: 'var(--shadow-sm)', transition: 'background 0.2s' }}>
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

