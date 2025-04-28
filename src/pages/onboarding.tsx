import React, { useState } from 'react';
import { useRouter } from 'next/router';

const roles = [
  {
    key: 'owner',
    label: 'Property Owner',
    description: 'Value, tokenize, and manage your properties on MapChain.',
    icon: '🏠',
  },
  {
    key: 'valuator',
    label: 'Valuator',
    description: 'Accept valuation requests, perform valuations, and get paid.',
    icon: '📊',
  },
];

export default function OnboardingPage() {
  const router = useRouter();

  // Handle role selection and immediately route to dashboard
  const handleRoleSelect = (selectedRole: string) => {
    if (selectedRole === 'owner') {
      router.push('/dashboard/owner');
    } else if (selectedRole === 'valuator') {
      router.push('/dashboard/valuator');
    }
  };


  return (
    <div style={{ minHeight: '100vh', background: '#f6f8fa', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 32px #e0e7ef', padding: '40px 32px', maxWidth: 400, width: '100%' }}>
        <>
          <h1 style={{ fontSize: 28, color: '#222', fontWeight: 800, marginBottom: 18, textAlign: 'center' }}>Get Started</h1>
          <p style={{ color: '#5f6368', fontSize: 16, textAlign: 'center', marginBottom: 30 }}>Who are you?</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {roles.map((r) => (
              <button
                key={r.key}
                onClick={() => handleRoleSelect(r.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  background: '#f8f9fa',
                  border: '1.5px solid #e1e3e6',
                  borderRadius: 10,
                  padding: '18px 18px',
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#222',
                  cursor: 'pointer',
                  boxShadow: '0 1px 8px #e0e7ef',
                  transition: 'border 0.2s',
                }}
              >
                <span style={{ fontSize: 28 }}>{r.icon}</span>
                <span style={{ flex: 1, textAlign: 'left' }}>
                  {r.label}
                  <span style={{ display: 'block', fontWeight: 400, fontSize: 15, color: '#5f6368', marginTop: 4 }}>{r.description}</span>
                </span>
              </button>
            ))}
          </div>
        </>

      </div>
    </div>
  );
}
