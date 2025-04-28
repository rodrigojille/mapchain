import React from 'react';
import Link from 'next/link';

export default function DashboardNavBar() {
  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 5vw',
        background: '#f8f9fa',
        color: '#222',
        borderBottom: '1px solid #e1e3e6',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      <Link
        href="/"
        style={{
          fontWeight: 900,
          fontSize: 26,
          letterSpacing: 1,
          color: '#4285F4',
          fontFamily: 'Inter, Arial, sans-serif',
          textDecoration: 'none',
          display: 'block',
        }}
      >
        MapChain
      </Link>
      <div
        style={{
          display: 'flex',
          gap: '1.3rem',
          alignItems: 'center',
        }}
      >
        <Link
          href="/profile"
          style={{
            color: '#222',
            fontWeight: 600,
            fontSize: 16,
            textDecoration: 'none',
          }}
        >
          My Profile
        </Link>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#4285F4',
            fontWeight: 700,
            borderRadius: 8,
            padding: '10px 22px',
            fontSize: 16,
            textDecoration: 'none',
            marginLeft: 8,
            boxShadow: '0 1px 8px #dbeafe',
            cursor: 'pointer',
            fontFamily: 'Inter, Arial, sans-serif',
          }}
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.clear();
              sessionStorage.clear();
            }
            window.location.href = '/';
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
