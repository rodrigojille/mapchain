import { Modal, Stack, Text, Button } from '@mantine/core';

interface OnboardingModalProps {
  opened: boolean;
  onClose: () => void;
  userRole: string;
}

export function OnboardingModal({ opened, onClose, userRole }: OnboardingModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Welcome to MapChain!" centered size="md">
      <Stack gap="md">
        <Text fw={700} size="lg">
          Welcome, {userRole === 'admin' ? 'Admin' : userRole === 'valuator' ? 'Valuator' : 'Property Owner'}!
        </Text>
        <Text size="sm">Here's what you can do next:</Text>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {userRole === 'admin' && <li>View platform stats and manage users, properties, and valuations.</li>}
          {userRole === 'valuator' && <li>Browse and accept valuation requests, complete valuations, and track your earnings.</li>}
          {userRole === 'property_owner' && <li>Add properties, request valuations, and view your valuation history.</li>}
        </ul>
        <Button mt="md" onClick={onClose} fullWidth radius="xl" color="blue">
          Get Started
        </Button>
      </Stack>
    </Modal>
  );
}
