import React from 'react';
import dynamic from 'next/dynamic';

// --- Mock property data for demo map ---
import type { Property } from '../types/Property';
import './_landing.mobile.css';

const mockProperties: Property[] = [
  {
    id: '1',
    tokenId: '1',
    title: 'Modern Loft in CDMX',
    address: {
      street: 'Av. Reforma 123',
      city: 'Mexico City',
      state: 'CDMX',
      zipCode: '06600',
      country: 'Mexico',
      coordinates: { latitude: 19.4326, longitude: -99.1332 }
    },
    size: 110,
    price: 420000,
    landType: 'residential',
    images: [],
    latestValuation: {
      amount: 420000,
      currency: 'USD',
      timestamp: 1714230000,
      validatorId: '',
      transactionId: 'tx-001',
    },
    bedrooms: 2,
    bathrooms: 2,
    yearBuilt: 2018,
    lastSalePrice: 410000,
    lastSaleDate: 1710000000,
    features: { floors: 1, hasParking: true, hasGarden: false },
    owner: { accountId: '0.0.1001', name: 'Alice P.' },
    metadata: { createdAt: 1714000000, updatedAt: 1714230000, ipfsHash: 'QmFakeHash1' },
  },
  {
    id: '2',
    tokenId: '2',
    title: 'Beach House Cancun',
    address: {
      street: 'Calle del Mar 456',
      city: 'Cancun',
      state: 'Quintana Roo',
      zipCode: '77500',
      country: 'Mexico',
      coordinates: { latitude: 21.1619, longitude: -86.8515 }
    },
    size: 220,
    price: 980000,
    landType: 'residential',
    images: [],
    latestValuation: {
      amount: 980000,
      currency: 'USD',
      timestamp: 1714231000,
      validatorId: '0.0.2002',
      transactionId: 'tx-002',
    },
    bedrooms: 4,
    bathrooms: 3,
    yearBuilt: 2012,
    lastSalePrice: 950000,
    lastSaleDate: 1700000000,
    features: { floors: 2, hasParking: true, hasGarden: true },
    owner: { accountId: '0.0.1002', name: 'Carlos V.' },
    metadata: { createdAt: 1713000000, updatedAt: 1714231000, ipfsHash: 'QmFakeHash2' },
  },
  {
    id: '3',
    tokenId: '3',
    title: 'Industrial Warehouse',
    address: {
      street: 'Zona Industrial 789',
      city: 'Monterrey',
      state: 'Nuevo León',
      zipCode: '64000',
      country: 'Mexico',
      coordinates: { latitude: 25.6866, longitude: -100.3161 }
    },
    size: 900,
    price: 1500000,
    landType: 'industrial',
    images: [],
    latestValuation: {
      amount: 1500000,
      currency: 'USD',
      timestamp: 1714232000,
      validatorId: '0.0.2003',
      transactionId: 'tx-003',
    },
    bedrooms: 0,
    bathrooms: 1,
    yearBuilt: 2005,
    lastSalePrice: 1300000,
    lastSaleDate: 1690000000,
    features: { floors: 1, hasParking: true, hasGarden: false },
    owner: { accountId: '0.0.1003', name: 'Sophie L.' },
    metadata: { createdAt: 1712000000, updatedAt: 1714232000, ipfsHash: 'QmFakeHash3' },
  }
];

// Dynamically import PropertyMap for SSR compatibility
const DynamicPropertyMap = dynamic(() => import('../components/PropertyMap').then(mod => mod.PropertyMap), { ssr: false });

// --- Navigation Bar ---
import { useState } from 'react';

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Detect window width for SSR-safe mobile menu
  const [isMobile, setIsMobile] = useState(false);
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 700);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <nav
      className="landing-navbar"
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
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 26, letterSpacing: 1, color: '#4285F4', fontFamily: 'Inter, Arial, sans-serif' }}>
        MapChain
      </div>
      {/* Hamburger icon for mobile */}
      {isMobile && (
        <button
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'none',
            border: 'none',
            padding: 8,
            marginLeft: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            zIndex: 110,
          }}
        >
          <span style={{fontSize: 28, color: '#4285F4'}}>
            {menuOpen ? '\u2715' : '\u2630'}
          </span>
        </button>
      )}
      {/* Nav links */}
      <div
        style={{
          display: isMobile ? (menuOpen ? 'flex' : 'none') : 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '1rem' : '1.3rem',
          alignItems: isMobile ? 'stretch' : 'center',
          position: isMobile ? 'absolute' : 'static',
          top: isMobile ? 64 : undefined,
          right: isMobile ? 0 : undefined,
          background: isMobile ? '#f8f9fa' : undefined,
          width: isMobile ? '100vw' : undefined,
          boxShadow: isMobile && menuOpen ? '0 2px 16px #e0e7ef' : undefined,
        }}
      >
        <a href="#how-it-works" style={{ color: '#222', fontWeight: 600, fontSize: 16, textDecoration: 'none', padding: isMobile ? '12px 0' : undefined }}>
          How It Works
        </a>
        <a href="#features" style={{ color: '#222', fontWeight: 600, fontSize: 16, textDecoration: 'none', padding: isMobile ? '12px 0' : undefined }}>
          Features
        </a>
        <a href="#testimonials" style={{ color: '#222', fontWeight: 600, fontSize: 16, textDecoration: 'none', padding: isMobile ? '12px 0' : undefined }}>
          Testimonials
        </a>
        <a
          href="/onboarding"
          style={{
            background: '#4285F4',
            color: '#fff',
            fontWeight: 700,
            borderRadius: 8,
            padding: isMobile ? '14px 0' : '10px 22px',
            fontSize: 16,
            textDecoration: 'none',
            marginLeft: isMobile ? 0 : 8,
            marginTop: isMobile ? 8 : 0,
            boxShadow: '0 1px 8px #dbeafe',
            textAlign: 'center',
          }}
        >
          Get Started
        </a>
      </div>
    </nav>
  );
}

// --- Hero Section ---
function HeroSection() {
  return (
    <section
      className="landing-hero"
      style={{
        background: '#f6f8fa',
        padding: '48px 0 24px 0',
        textAlign: 'center',
        borderBottom: '1px solid #e1e3e6',
      }}
    >
      <h1
        style={{
          fontSize: 'clamp(2.1rem, 6vw, 3rem)',
          color: '#222',
          fontWeight: 800,
          letterSpacing: 1,
          marginBottom: 16,
          fontFamily: 'Inter, Arial, sans-serif',
        }}
      >
        Get Instant AI & Official Property Valuations
      </h1>
      <p
        style={{
          fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
          color: '#5f6368',
          fontWeight: 400,
          marginBottom: 32,
          maxWidth: 560,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        The world’s easiest way to value, buy, and sell property — powered by blockchain & AI
      </p>
      <div
        className="hero-cta"
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 20,
          marginBottom: 32,
          flexWrap: 'wrap',
        }}
      >
        <a
          href="/onboarding?role=owner"
          style={{
            background: '#4285F4',
            color: '#fff',
            fontWeight: 700,
            borderRadius: 10,
            padding: '14px 32px',
            fontSize: 18,
            textDecoration: 'none',
            boxShadow: '0 2px 16px #e0e7ef',
            letterSpacing: 0.5,
          }}
        >
          Get My Property Valued
        </a>
        <a
          href="/onboarding?role=valuator"
          style={{
            background: '#fff',
            color: '#4285F4',
            fontWeight: 700,
            borderRadius: 10,
            padding: '14px 32px',
            fontSize: 18,
            textDecoration: 'none',
            border: '1.5px solid #4285F4',
            marginLeft: 0,
          }}
        >
          Become a Valuator
        </a>
      </div>
      {/* Interactive Property Map */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          className="map-container"
          style={{
            width: '99vw',
            maxWidth: 800,
            height: '400px',
            background: '#fff',
            borderRadius: 20,
            margin: '0 auto',
            boxShadow: '0 4px 24px #e0e7ef',
            border: '1.5px solid #e1e3e6',
            overflow: 'hidden',
          }}
        >
          {/* Interactive Property Map integration */}
          <React.Suspense
            fallback={
              <div style={{ color: '#5f6368', fontSize: 20, textAlign: 'center', paddingTop: 100 }}>
                [Loading map...]
              </div>
            }
          >
            {typeof window !== 'undefined' && <DynamicPropertyMap properties={mockProperties} />}
          </React.Suspense>
        </div>
      </div>
    </section>
  );
}

// --- How It Works ---
function HowItWorks() {
  const steps = [
    {icon: '📍', title: 'Enter Details', desc: 'Tell us about your property'},
    {icon: '🤖', title: 'Get AI Valuation', desc: 'Instant estimate using advanced AI'},
    {icon: '🧑‍💼', title: 'Connect with Valuator', desc: 'Request an official, certified valuation'},
    {icon: '🔗', title: 'Everything on Blockchain', desc: 'All data secured on Hedera'},
  ];
  return (
    <section id="how-it-works" style={{ padding: '64px 0', background: '#fff', borderBottom: '1px solid #e1e3e6' }}>
      <h2 style={{ color: '#4285F4', fontSize: 36, fontWeight: 800, textAlign: 'center', marginBottom: 40 }}>
        How It Works
      </h2>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 28,
          flexWrap: 'wrap',
        }}
      >
        {steps.map((s, i) => (
          <div
            key={s.title}
            style={{
              background: '#f8f9fa',
              borderRadius: 16,
              padding: '36px 24px',
              minWidth: 210,
              maxWidth: 270,
              flex: '1 1 210px',
              textAlign: 'center',
              boxShadow: '0 2px 16px #e0e7ef',
              margin: 12,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontWeight: 700, color: '#222', fontSize: 17, marginBottom: 6 }}>{s.title}</div>
            <div style={{ color: '#5f6368', fontSize: 14 }}>{s.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// --- Feature Highlights ---
function FeatureHighlights() {
  const features = [
    {icon: '⚡', title: 'Dual Valuation', desc: 'AI + official professional valuations'},
    {icon: '🔒', title: 'Blockchain Transparency', desc: 'All valuations and ownership on Hedera'},
    {icon: '📧', title: 'Frictionless Onboarding', desc: 'Email-only login, no wallet required'},
    {icon: '🌍', title: 'Global Coverage', desc: 'Works anywhere in the world'},
    {icon: '💸', title: 'Secure Payments', desc: 'Escrow and instant settlement'},
  ];
  return (
    <section id="features" style={{ background: '#f6f8fa', padding: '64px 0', borderBottom: '1px solid #e1e3e6' }}>
      <h2 style={{ color: '#4285F4', fontSize: 36, fontWeight: 800, textAlign: 'center', marginBottom: 40 }}>
        Features
      </h2>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 28,
          flexWrap: 'wrap',
        }}
      >
        {features.map((f, i) => (
          <div
            key={f.title}
            className="feature-card"
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: '36px 24px',
              minWidth: 210,
              maxWidth: 270,
              flex: '1 1 210px',
              textAlign: 'center',
              boxShadow: '0 2px 16px #e0e7ef',
              margin: 12,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 10 }}>{f.icon}</div>
            <div style={{ fontWeight: 700, color: '#222', fontSize: 17, marginBottom: 6 }}>{f.title}</div>
            <div style={{ color: '#5f6368', fontSize: 14 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// --- Testimonials ---
function Testimonials() {
  const testimonials = [
    {name: 'Alice P.', avatar: '🧑‍🦰', quote: 'MapChain gave me a valuation in minutes and connected me with a real expert.'},
    {name: 'Carlos V.', avatar: '🧔', quote: 'I love the transparency and ease of use — blockchain makes it trustworthy.'},
    {name: 'Sophie L.', avatar: '👩‍💼', quote: 'As a valuator, I get paid instantly and my clients are happy!'},
  ];
  return (
    <section id="testimonials" style={{ background: '#fff', padding: '64px 0', borderBottom: '1px solid #e1e3e6' }}>
      <h2 style={{ color: '#4285F4', fontSize: 36, fontWeight: 800, textAlign: 'center', marginBottom: 40 }}>
        What Our Users Say
      </h2>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 28,
          flexWrap: 'wrap',
        }}
      >
        {testimonials.map((t, i) => (
          <div
            key={t.name}
            className="testimonial-card"
            style={{
              background: '#f8f9fa',
              borderRadius: 16,
              padding: '36px 24px',
              minWidth: 210,
              maxWidth: 270,
              flex: '1 1 210px',
              textAlign: 'center',
              boxShadow: '0 2px 16px #e0e7ef',
              margin: 12,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 10 }}>{t.avatar}</div>
            <div style={{ fontWeight: 700, color: '#222', fontSize: 17, marginBottom: 6 }}>{t.name}</div>
            <div style={{ color: '#5f6368', fontSize: 14, fontStyle: 'italic' }}>&quot;{t.quote}&quot;</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// --- Footer ---
function Footer() {
  return (
    <footer style={{ background: '#f8f9fa', color: '#5f6368', padding: '32px 0 16px 0', textAlign: 'center', borderTop: '1px solid #e1e3e6' }}>
      <div style={{ marginBottom: 18 }}>
        <a href="/about" style={{ color: '#4285F4', margin: '0 12px', textDecoration: 'none', fontWeight: 600 }}>About</a>
        <a href="/faq" style={{ color: '#4285F4', margin: '0 12px', textDecoration: 'none', fontWeight: 600 }}>FAQ</a>
        <a href="/privacy" style={{ color: '#4285F4', margin: '0 12px', textDecoration: 'none', fontWeight: 600 }}>Privacy</a>
        <a href="/terms" style={{ color: '#4285F4', margin: '0 12px', textDecoration: 'none', fontWeight: 600 }}>Terms</a>
        <a href="/contact" style={{ color: '#4285F4', margin: '0 12px', textDecoration: 'none', fontWeight: 600 }}>Contact</a>
      </div>
      <div style={{ marginBottom: 8, fontSize: 14 }}>
        <span style={{ margin: '0 8px' }}>🌐</span>
        <span style={{ margin: '0 8px' }}>© {new Date().getFullYear()} MapChain</span>
        <span style={{ margin: '0 8px' }}>Built on Hedera</span>
      </div>
    </footer>
  );
}

// --- Main Landing Page Component ---
export default function LandingPage() {
  return (
    <div style={{fontFamily: 'Inter, Arial, sans-serif', background: '#0f172a'}}>
      <NavBar />
      <HeroSection />
      <HowItWorks />
      <FeatureHighlights />
      <Testimonials />
      <Footer />
    </div>
  );
}
