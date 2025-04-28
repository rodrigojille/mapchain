import React from 'react';
import { IconHome, IconPlus, IconBuildingBank, IconCoin, IconReportMoney, IconArrowRight } from '@tabler/icons-react';
import DashboardNavBar from '../../components/dashboard/DashboardNavBar';
import './dashboard.mobile.css';

// MOCK DATA (replace with API calls later)
const mockUser = { name: 'Test User' };
const mockStats = {
  properties: 2,
  tokenized: 1,
  pendingValuations: 1,
};
const mockProperties = [
  {
    id: '1',
    title: '123 Main St',
    address: '123 Main St, Springfield',
    status: 'Tokenized',
  },
  {
    id: '2',
    title: '456 Oak Ave',
    address: '456 Oak Ave, Shelbyville',
    status: 'Not Tokenized',
  },
];
const mockTokens = [
  {
    id: 'nft1',
    property: '123 Main St',
    tokenId: '0.0.123456',
    status: 'Active',
  },
];
const mockValuations = [
  {
    id: 'val1',
    property: '456 Oak Ave',
    status: 'Pending',
    type: 'AI',
    requested: '2025-04-20',
  },
];

const OwnerDashboard = () => {
  return (
    <>
      <DashboardNavBar />
      <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingTop: 64, paddingBottom: 64, fontFamily: 'Inter, Arial, sans-serif' }}>

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Welcome and Stats */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #e0e7ef', padding: '36px 24px', marginBottom: 36 }}>
          <h2 style={{ color:'#222', fontWeight:800, fontSize: '2rem', marginBottom: 8 }}>Welcome, {mockUser.name}!</h2>
          <div style={{ color: '#5f6368', marginBottom: 24, fontSize: 16 }}>Here is your property tokenization dashboard.</div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 12 }}>
            <div style={{ background:'#f8f9fa', borderRadius: 16, boxShadow: 'none', padding: '24px 18px', flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <IconHome size={28} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 22 }}>{mockStats.properties}</div>
                <div style={{ color: '#5f6368', fontSize: 14 }}>Properties</div>
              </div>
            </div>
            <div style={{ background:'#f8f9fa', borderRadius: 16, boxShadow: 'none', padding: '24px 18px', flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <IconCoin size={28} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 22 }}>{mockStats.tokenized}</div>
                <div style={{ color: '#5f6368', fontSize: 14 }}>Tokenized Assets</div>
              </div>
            </div>
            <div style={{ background:'#f8f9fa', borderRadius: 16, boxShadow: 'none', padding: '24px 18px', flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <IconReportMoney size={28} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 22 }}>{mockStats.pendingValuations}</div>
                <div style={{ color: '#5f6368', fontSize: 14 }}>Pending Valuations</div>
              </div>
            </div>
          </div>
        </div>

        {/* Shortcuts */}
        <div style={{ display: 'flex', gap: 18, justifyContent: 'flex-end', marginBottom: 32, flexWrap: 'wrap' }}>
          <a href="/properties/new" style={{ background:'#4285F4', color:'#fff', fontWeight:700, borderRadius:8, padding:'10px 22px', fontSize:16, textDecoration:'none', boxShadow:'0 1px 8px #dbeafe', display:'inline-flex', alignItems:'center', gap:8, fontFamily:'Inter, Arial, sans-serif' }}><IconPlus size={16} /> Add Property</a>
          <a href="/nft-studio" style={{ background:'#4285F4', color:'#fff', fontWeight:700, borderRadius:8, padding:'10px 22px', fontSize:16, textDecoration:'none', boxShadow:'0 1px 8px #dbeafe', display:'inline-flex', alignItems:'center', gap:8, fontFamily:'Inter, Arial, sans-serif' }}><IconBuildingBank size={16} /> NFT Studio</a>
          <a href="/valuations/request" style={{ background:'#4285F4', color:'#fff', fontWeight:700, borderRadius:8, padding:'10px 22px', fontSize:16, textDecoration:'none', boxShadow:'0 1px 8px #dbeafe', display:'inline-flex', alignItems:'center', gap:8, fontFamily:'Inter, Arial, sans-serif' }}><IconReportMoney size={16} /> Request Valuation</a>
        </div>

        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 40 }}>
          {/* Properties List */}
          <div style={{ flex: 1, minWidth: 340 }}>
            <div style={{ background:'#fff', borderRadius: 16, boxShadow: '0 2px 16px #e0e7ef', padding: '36px 24px', marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h4 style={{ color:'#4285F4', fontWeight:700, fontSize:'1.25rem', margin:0 }}>Your Properties</h4>
                <a href="/properties/new" style={{ color:'#4285F4', fontWeight:600, fontSize:14, textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>Add Property <IconPlus size={14} style={{ verticalAlign: 'middle' }} /></a>
              </div>
              {mockProperties.length === 0 ? (
                <div style={{ color: '#5f6368', textAlign: 'center', padding: 18 }}>No properties yet.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, minWidth: 340 }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa' }}>
                        <th style={{ textAlign: 'left', padding: '8px 6px', color: '#5f6368', fontWeight: 700 }}>Title</th>
                        <th style={{ textAlign: 'left', padding: '8px 6px', color: '#5f6368', fontWeight: 700 }}>Address</th>
                        <th style={{ textAlign: 'left', padding: '8px 6px', color: '#5f6368', fontWeight: 700 }}>Status</th>
                        <th style={{ textAlign: 'left', padding: '8px 6px', color: '#5f6368', fontWeight: 700 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockProperties.map((prop) => (
                        <tr key={prop.id} style={{ borderBottom: '1px solid #e1e3e6' }}>
                          <td style={{ padding: '8px 6px', color: '#222' }}>{prop.title}</td>
                          <td style={{ padding: '8px 6px', color: '#222' }}>{prop.address}</td>
                          <td style={{ padding: '8px 6px', color: prop.status === 'Tokenized' ? '#34A853' : '#FBBC05', fontWeight: 600 }}>{prop.status}</td>
                          <td style={{ padding: '8px 6px' }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <a href={`/properties/${prop.id}`} style={{ background:'#4285F4', color:'#fff', fontWeight:700, borderRadius:8, padding:'8px 16px', fontSize:14, textDecoration:'none', boxShadow:'0 1px 8px #dbeafe', display:'inline-flex', alignItems:'center', gap:4, fontFamily:'Inter, Arial, sans-serif' }}>View</a>
                              {prop.status !== 'Tokenized' && (
                                <a href={`/nft-studio?property=${prop.id}`} style={{ background:'#4285F4', color:'#fff', fontWeight:700, borderRadius:8, padding:'8px 16px', fontSize:14, textDecoration:'none', boxShadow:'0 1px 8px #dbeafe', display:'inline-flex', alignItems:'center', gap:4, fontFamily:'Inter, Arial, sans-serif' }}>Tokenize</a>
                              )}
                              <a href={`/valuations/request?property=${prop.id}`} style={{ background:'#4285F4', color:'#fff', fontWeight:700, borderRadius:8, padding:'8px 16px', fontSize:14, textDecoration:'none', boxShadow:'0 1px 8px #dbeafe', display:'inline-flex', alignItems:'center', gap:4, fontFamily:'Inter, Arial, sans-serif' }}>Request Valuation</a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Tokenized Assets */}
          <div style={{ flex: 1, minWidth: 340 }}>
            <div style={{ background:'#fff', borderRadius: 16, boxShadow: '0 2px 16px #e0e7ef', padding: '36px 24px', marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h4 style={{ color:'#4285F4', fontWeight:700, fontSize:'1.25rem', margin:0 }}>Tokenized Assets</h4>
                <a href="/nft-studio" style={{ color:'#4285F4', fontWeight:600, fontSize:14, textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>Go to NFT Studio <IconArrowRight size={14} style={{ verticalAlign: 'middle' }} /></a>
              </div>
              {mockTokens.length === 0 ? (
                <div style={{ color: '#5f6368', textAlign: 'center', padding: 18 }}>No tokenized assets yet.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, minWidth: 340 }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa' }}>
                        <th style={{ textAlign: 'left', padding: '8px 6px', color: '#5f6368', fontWeight: 700 }}>Property</th>
                        <th style={{ textAlign: 'left', padding: '8px 6px', color: '#5f6368', fontWeight: 700 }}>Token ID</th>
                        <th style={{ textAlign: 'left', padding: '8px 6px', color: '#5f6368', fontWeight: 700 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockTokens.map((token) => (
                        <tr key={token.id} style={{ borderBottom: '1px solid #e1e3e6' }}>
                          <td style={{ padding: '8px 6px', color: '#222' }}>{token.property}</td>
                          <td style={{ padding: '8px 6px', color: '#222' }}>{token.tokenId}</td>
                          <td style={{ padding: '8px 6px', color: '#34A853', fontWeight: 600 }}>{token.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Valuation Requests */}
        <div style={{ background:'#fff', borderRadius: 16, boxShadow: '0 2px 16px #e0e7ef', padding: '36px 24px', marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h4 style={{ color:'#4285F4', fontWeight:700, fontSize:'1.25rem', margin:0 }}>Valuation Requests</h4>
            <a href="/valuations/request" style={{ color:'#4285F4', fontWeight:600, fontSize:14, textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>Request New <IconArrowRight size={14} style={{ verticalAlign: 'middle' }} /></a>
          </div>
          {mockValuations.length === 0 ? (
            <div style={{ color: '#5f6368', textAlign: 'center', padding: 18 }}>No valuation requests yet.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ textAlign: 'left', padding: '8px 6px', color: '#5f6368', fontWeight: 700 }}>Property</th>
                  <th style={{ textAlign: 'left', padding: '8px 6px', color: '#5f6368', fontWeight: 700 }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '8px 6px', color: '#5f6368', fontWeight: 700 }}>Type</th>
                  <th style={{ textAlign: 'left', padding: '8px 6px', color: '#5f6368', fontWeight: 700 }}>Requested</th>
                </tr>
              </thead>
              <tbody>
                {mockValuations.map((val) => (
                  <tr key={val.id} style={{ borderBottom: '1px solid #e1e3e6' }}>
                    <td style={{ padding: '8px 6px', color: '#222' }}>{val.property}</td>
                    <td style={{ padding: '8px 6px', color: val.status === 'Pending' ? '#FBBC05' : '#34A853', fontWeight: 600 }}>{val.status}</td>
                    <td style={{ padding: '8px 6px', color: '#222' }}>{val.type}</td>
                    <td style={{ padding: '8px 6px', color: '#222' }}>{val.requested}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default OwnerDashboard;
