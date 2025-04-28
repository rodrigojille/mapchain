import { Container, Title, Text, Button } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <Container size="xs" py="xl" style={{ textAlign: 'center' }}>
      <IconAlertTriangle size={48} stroke={1.5} color="#fa5252" style={{ marginBottom: 16 }} />
      <Title order={2} mb="md">404 - Page Not Found</Title>
      <Text size="md" color="dimmed" mb="xl">
        Sorry, the page you are looking for does not exist.
      </Text>
      <Button component={Link} href="/" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
        Go Home
      </Button>
    </Container>
  );
}
