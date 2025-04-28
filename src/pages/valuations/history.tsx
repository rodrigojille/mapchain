import DashboardNavBar from '../../components/dashboard/DashboardNavBar';
import { Container, Title, Text } from '@mantine/core';

export default function ValuationHistoryPage() {
  return (
    <>
      <DashboardNavBar />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 16 }}>
        <button
          onClick={() => window.history.back()}
          style={{ marginBottom: 24, background: '#4285F4', color: '#fff', fontWeight: 700, borderRadius: 8, padding: '10px 22px', fontSize: 16, border: 'none', boxShadow: '0 1px 8px #dbeafe', width: '100%' }}
        >
          Back to Dashboard
        </button>
      </div>
      <Container size="lg" py="xl" style={{ textAlign: 'center' }}>
        <Title order={2} mb="md">Valuation History</Title>
        <Text color="dimmed">(Valuation history table coming soon)</Text>
      </Container>
    </>
  );
}
