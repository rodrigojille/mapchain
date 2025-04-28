import React from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Group,
  Button,
  Grid,
  Card,
  Stack,
  Table,
  Badge,
  Divider,
  Anchor,
  Center,
  Box,
} from '@mantine/core';
import { IconHome, IconPlus, IconBuildingBank, IconCoin, IconReportMoney, IconArrowRight } from '@tabler/icons-react';

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

const DashboardPage = () => {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Welcome and Stats */}
        <Paper radius="md" p="lg" withBorder>
          <Title order={2}>Welcome, {mockUser.name}!</Title>
          <Text color="dimmed" mb="md">
            Here is your property tokenization dashboard.
          </Text>
          <Group gap="md">
            <Card shadow="sm" padding="md" radius="md" withBorder>
              <Group>
                <IconHome size={28} />
                <div>
                  <Text size="lg" fw={700}>{mockStats.properties}</Text>
                  <Text size="xs" color="dimmed">Properties</Text>
                </div>
              </Group>
            </Card>
            <Card shadow="sm" padding="md" radius="md" withBorder>
              <Group>
                <IconCoin size={28} />
                <div>
                  <Text size="lg" fw={700}>{mockStats.tokenized}</Text>
                  <Text size="xs" color="dimmed">Tokenized Assets</Text>
                </div>
              </Group>
            </Card>
            <Card shadow="sm" padding="md" radius="md" withBorder>
              <Group>
                <IconReportMoney size={28} />
                <div>
                  <Text size="lg" fw={700}>{mockStats.pendingValuations}</Text>
                  <Text size="xs" color="dimmed">Pending Valuations</Text>
                </div>
              </Group>
            </Card>
          </Group>
        </Paper>

        {/* Shortcuts */}
        <Group gap="md" justify="flex-end">
          <Button leftSection={<IconPlus size={16} />} component="a" href="/properties/new">
            Add Property
          </Button>
          <Button leftSection={<IconBuildingBank size={16} />} component="a" href="/nft-studio">
            NFT Studio
          </Button>
          <Button leftSection={<IconReportMoney size={16} />} component="a" href="/valuations/request">
            Request Valuation
          </Button>
        </Group>

        <Grid>
          {/* Properties List */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper radius="md" p="md" withBorder>
              <Group justify="space-between" mb="sm">
                <Title order={4}>My Properties</Title>
                <Anchor href="/properties" size="sm" c="blue.7">
                  View all <IconArrowRight size={14} style={{ verticalAlign: 'middle' }} />
                </Anchor>
              </Group>
              <Divider mb="sm" />
              {mockProperties.length === 0 ? (
                <Center><Text color="dimmed">No properties found.</Text></Center>
              ) : (
                <Table highlightOnHover withColumnBorders>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Title</Table.Th>
                      <Table.Th>Address</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {mockProperties.map((prop) => (
                      <Table.Tr key={prop.id}>
                        <Table.Td>{prop.title}</Table.Td>
                        <Table.Td>{prop.address}</Table.Td>
                        <Table.Td>
                          <Badge color={prop.status === 'Tokenized' ? 'green' : 'gray'}>{prop.status}</Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <Button size="xs" variant="light" component="a" href={`/properties/${prop.id}`}>View</Button>
                            {prop.status !== 'Tokenized' && (
                              <Button size="xs" variant="outline" color="blue" component="a" href={`/nft-studio?property=${prop.id}`}>Tokenize</Button>
                            )}
                            <Button size="xs" variant="outline" color="orange" component="a" href={`/valuations/request?property=${prop.id}`}>Request Valuation</Button>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
            </Paper>
          </Grid.Col>

          {/* Tokenized Assets */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper radius="md" p="md" withBorder>
              <Group justify="space-between" mb="sm">
                <Title order={4}>Tokenized Assets</Title>
                <Anchor href="/nft-studio" size="sm" c="blue.7">
                  Go to NFT Studio <IconArrowRight size={14} style={{ verticalAlign: 'middle' }} />
                </Anchor>
              </Group>
              <Divider mb="sm" />
              {mockTokens.length === 0 ? (
                <Center><Text color="dimmed">No tokenized assets yet.</Text></Center>
              ) : (
                <Table highlightOnHover withColumnBorders>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Property</Table.Th>
                      <Table.Th>Token ID</Table.Th>
                      <Table.Th>Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {mockTokens.map((token) => (
                      <Table.Tr key={token.id}>
                        <Table.Td>{token.property}</Table.Td>
                        <Table.Td>{token.tokenId}</Table.Td>
                        <Table.Td><Badge color="green">{token.status}</Badge></Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Valuation Requests */}
        <Paper radius="md" p="md" withBorder>
          <Group justify="space-between" mb="sm">
            <Title order={4}>Valuation Requests</Title>
            <Anchor href="/valuations/request" size="sm" c="blue.7">
              Request New <IconArrowRight size={14} style={{ verticalAlign: 'middle' }} />
            </Anchor>
          </Group>
          <Divider mb="sm" />
          {mockValuations.length === 0 ? (
            <Center><Text color="dimmed">No valuation requests yet.</Text></Center>
          ) : (
            <Table highlightOnHover withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Property</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Requested</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {mockValuations.map((val) => (
                  <Table.Tr key={val.id}>
                    <Table.Td>{val.property}</Table.Td>
                    <Table.Td><Badge color={val.status === 'Pending' ? 'yellow' : 'green'}>{val.status}</Badge></Table.Td>
                    <Table.Td>{val.type}</Table.Td>
                    <Table.Td>{val.requested}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Paper>
      </Stack>
    </Container>
  );
};

export default DashboardPage;

