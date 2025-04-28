import React from 'react';
import { Container, Stack } from '@mantine/core';
import DashboardNavBar from '../../components/dashboard/DashboardNavBar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StatsCards from '../../components/dashboard/StatsCards';
import { GamificationCard } from '../../components/dashboard/GamificationCard';
import LeaderboardTable from '../../components/dashboard/LeaderboardTable';
import ValuationRequestsTable from '../../components/dashboard/ValuationRequestsTable';
import CompletedValuationsTable from '../../components/dashboard/CompletedValuationsTable';
import './dashboard.mobile.css';


export default function ValuatorDashboard() {
  // MOCK DATA for Valuator
  const mockUser = { name: 'Valuator Jane' };
  const mockStats = {
    pending: 2,
    completed: 8,
    earnings: 1200,
    totalValued: 28,
  };
  const mockLevel = {
    name: 'Silver',
    next: 50,
    color: '#C0C0C0',
    label: 'Next: Gold',
  };
  const mockLeaderboard = [
    { name: 'Jane V.', count: 28, you: true },
    { name: 'Alex P.', count: 45 },
    { name: 'Chris T.', count: 22 },
    { name: 'Sam R.', count: 18 },
    { name: 'Morgan S.', count: 12 },
  ];
  const mockRequests = [
    { id: 'req1', property: '789 Pine Rd', type: 'AI', status: 'Pending', requested: '2025-04-25' },
    { id: 'req2', property: '321 Cedar Blvd', type: 'Official', status: 'Pending', requested: '2025-04-26' },
  ];
  const mockCompleted = [
    { id: 'c1', property: '456 Oak Ave', type: 'AI', status: 'Completed', completed: '2025-04-20', fee: 150 },
    { id: 'c2', property: '123 Main St', type: 'Official', status: 'Completed', completed: '2025-04-18', fee: 250 },
  ];

  return (
    <>
      <DashboardNavBar />
      <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingTop: 64, paddingBottom: 64, fontFamily: 'Inter, Arial, sans-serif' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <DashboardHeader userName={mockUser.name} subtitle="Here is your valuation dashboard." />
          <div style={{ marginBottom: 40 }}>
            <StatsCards pending={mockStats.pending} completed={mockStats.completed} earnings={mockStats.earnings} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginBottom: 40 }}>
            <div style={{ flex: 1, minWidth: 300 }}>
              <div className="card rounded shadow" style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #e0e7ef', padding: '36px 24px', marginBottom: 24 }}>
                <GamificationCard totalValued={mockStats.totalValued} level={mockLevel} />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 300 }}>
              <div className="card rounded shadow" style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #e0e7ef', padding: '36px 24px', marginBottom: 24 }}>
                <LeaderboardTable leaderboard={mockLeaderboard} />
              </div>
            </div>
          </div>
          <div className="card rounded shadow" style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #e0e7ef', padding: '36px 24px', marginBottom: 40 }}>
            <ValuationRequestsTable requests={mockRequests} />
          </div>
          <div className="card rounded shadow" style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #e0e7ef', padding: '36px 24px' }}>
            <CompletedValuationsTable completed={mockCompleted} />
          </div>
        </div>
      </div>
    </>
  );
}
;

