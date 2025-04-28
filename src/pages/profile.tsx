import { Container, Title, Text } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';

import DashboardNavBar from '../components/dashboard/DashboardNavBar';

export default function ProfilePage() {
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
      <Container size="sm" py="xl" style={{ textAlign: 'center' }}>
        <IconUser size={48} stroke={1.5} color="#228be6" style={{ marginBottom: 16 }} />
        <Title order={2} mb="md">My Profile</Title>
        <Text color="dimmed">(Profile details coming soon)</Text>
      </Container>
    </>
  );
}
