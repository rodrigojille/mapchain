import { Container, Title, Text } from '@mantine/core';
import { IconClipboardCheck } from '@tabler/icons-react';

export default function ValuationsPage() {
  return (
    <Container size="lg" py="xl" style={{ textAlign: 'center' }}>
      <IconClipboardCheck size={48} stroke={1.5} color="#228be6" style={{ marginBottom: 16 }} />
      <Title order={2} mb="md">Valuations</Title>
      <Text size="md" color="dimmed">
        Browse and manage property valuations. Owners can request, valuators can complete, and all can view history.
      </Text>
    </Container>
  );
}
