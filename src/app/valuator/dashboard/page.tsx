'use client';
import React, { useEffect, useState } from 'react';
import { useHederaContract } from '../../../hooks/useHederaContract';
import { useWallet } from '../../../hooks/useWallet';

interface Request {
  id: string;
  propertyId: string;
  propertyTitle: string;
  requestedAt: number;
  urgency: string;
  status: string;
  estimatedFee: number;
}

interface Stats {
  completedJobs: number;
  totalEarnings: number;
  averageRating: number;
  responseRate: number;
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if(diff >= 86400000) { // 1 day
    return '1 day ago';
  } else if(diff >= 43200000) { // 12 hours
    return '12 hours ago';
  } else {
    return 'just now';
  }
}

const ValuatorDashboard: React.FC = () => {
  const { accountId } = useWallet();
  const hedera = useHederaContract();

  // Ensure accountId is non-null
  const validAccountId = accountId!;

  const [stats, setStats] = useState<Stats | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [error, setError] = useState<string>('');

  const fetchData = async () => {
    try {
      // Fetch valuation requests
      const res = await fetch('/api/valuator/requests');
      if(!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRequests(data);
      setError('');
    } catch (err) {
      setError('Error loading dashboard data');
    }
  };

  useEffect(() => {
    // Fetch stats from hedera contract
    const fetchStats = async () => {
      if(hedera && hedera.getValuatorStats) {
        const s = await hedera.getValuatorStats(validAccountId);
        // Convert BigNumber values to numbers and provide default responseRate
        const statsObj: Stats = {
          completedJobs: Number(s.completedJobs),
          totalEarnings: Number(s.totalEarnings),
          averageRating: Number(s.averageRating),
          responseRate: 0
        };
        setStats(statsObj);
      }
    };
    fetchData();
    fetchStats();
  }, [hedera, accountId]);

  const handleAccept = async (reqId: string) => {
    if(hedera && (hedera as any).acceptValuationRequest) {
      await (hedera as any).acceptValuationRequest(validAccountId, reqId);
      await fetchData();
    }
  };

  const handleDecline = async (reqId: string) => {
    if(hedera && (hedera as any).declineValuationRequest) {
      await (hedera as any).declineValuationRequest(validAccountId, reqId);
      await fetchData();
    }
  };

  if(!accountId) {
    return <div>Please connect your wallet to view dashboard</div>;
  }

  if(error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Dashboard Stats</h2>
      {stats ? (
        <div>
          <div>{stats.completedJobs}</div>
          <div>{formatCurrency(stats.totalEarnings)}</div>
          <div>{stats.averageRating.toFixed(1)}/5.0</div>
          <div>{stats.responseRate}%</div>
        </div>
      ) : (
        <div>Loading stats...</div>
      )}

      <h2>Pending Valuation Requests</h2>
      {requests.length === 0 ? (
        <div>No pending requests at the moment.</div>
      ) : (
        <div>
          {requests.map((req) => (
            <div key={req.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
              <h3>{req.propertyTitle}</h3>
              <div>{formatCurrency(req.estimatedFee)}</div>
              <div>{req.urgency}</div>
              <div>{formatRelativeTime(req.requestedAt)}</div>
              <button onClick={() => handleAccept(req.id)}>Accept</button>
              <button onClick={() => handleDecline(req.id)}>Decline</button>
              {req.urgency.toLowerCase() === 'urgent' && (
                <span className="bg-red-100 text-red-800" style={{ padding: '2px 4px', marginLeft: '5px' }}>urgent</span>
              )}
            </div>
          ))}
        </div>
      )}
      <div data-testid="valuator-stats">
        <div>Completed Jobs: {stats ? stats.completedJobs : 0}</div>
        <div>Total Earnings: {stats ? stats.totalEarnings : 0}</div>
        <div>Average Rating: {stats ? stats.averageRating : 0}</div>
        <div>Response Rate: {stats ? stats.responseRate : 0}</div>
      </div>
    </div>
  );
};

export default ValuatorDashboard;
