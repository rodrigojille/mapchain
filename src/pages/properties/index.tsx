import React from 'react';
import DashboardNavBar from '../../components/dashboard/DashboardNavBar';
import { useRouter } from 'next/router';

export default function PropertiesPage() {
  const router = useRouter();
  return (
    <>
      <DashboardNavBar />
      <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingTop: 64, fontFamily: 'Inter, Arial, sans-serif' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: 16 }}>
          <button
            onClick={() => router.back()}
            style={{ marginBottom: 24, background: '#4285F4', color: '#fff', fontWeight: 700, borderRadius: 8, padding: '10px 22px', fontSize: 16, border: 'none', boxShadow: '0 1px 8px #dbeafe', width: '100%' }}
          >
            Back to Dashboard
          </button>
          <h2 style={{ fontWeight: 800, fontSize: '2rem', color: '#222', marginBottom: 12 }}>My Properties</h2>
          <div style={{ color: '#5f6368', marginBottom: 24 }}>(Properties list coming soon)</div>
        </div>
      </div>
    </>
  );
}
