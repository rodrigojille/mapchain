import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Container, 
  Grid, 
  Paper, 
  Title, 
  Text, 
  Button, 
  Group, 
  Tabs, 
  Table,
  Badge,
  ActionIcon,
  Menu,
  Modal,
  TextInput,
  Select,
  Textarea,
  Switch,
  Card,
  RingProgress,
  Divider,
  Pagination,
  Alert,
  Loader,
  Image,
  List,
  ThemeIcon,
  Box,
  SimpleGrid,
  Progress,
  Stack
} from '@mantine/core';
import { useAuth } from '../../providers/AuthProvider';
import { UserRole } from '../../services/auth';
import { IconDotsVertical, IconEdit, IconTrash, IconCheck, IconX, IconAlertCircle, IconUser, IconHome, IconChartBar, IconCoin } from '@tabler/icons-react';
import { User, Valuator, PropertyOwner, ValuationRequest, ValuationRequestStatus } from '../../types/user';
import { PropertyData, getMockProperties } from '../../services/propertyApi';

// Mock data for admin dashboard
const MOCK_USERS: User[] = [
  {
    id: 'user_1',
    name: 'John Smith',
    email: 'john@example.com',
    role: UserRole.PROPERTY_OWNER,
    authMethod: 'email' as any,
    createdAt: '2023-01-15T10:30:00Z',
    isEmailVerified: true,
    walletAddresses: []
  },
  {
    id: 'user_2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: UserRole.VALUATOR,
    authMethod: 'email' as any,
    createdAt: '2023-02-20T14:45:00Z',
    isEmailVerified: true,
    walletAddresses: ['0.0.123456']
  },
  {
    id: 'user_3',
    name: 'Michael Chen',
    email: 'michael@example.com',
    role: UserRole.PROPERTY_OWNER,
    authMethod: 'wallet' as any,
    createdAt: '2023-03-10T09:15:00Z',
    isEmailVerified: false,
    walletAddresses: ['0.0.789012']
  },
  {
    id: 'user_4',
    name: 'Admin User',
    email: 'admin@mapchain.com',
    role: UserRole.ADMIN,
    authMethod: 'email' as any,
    createdAt: '2023-01-01T00:00:00Z',
    isEmailVerified: true,
    walletAddresses: []
  }
];

const MOCK_VALUATION_REQUESTS: ValuationRequest[] = [
  {
    id: 'req_1',
    propertyId: 'prop_1',
    requesterId: 'user_1',
    valuatorId: 'user_2',
    status: ValuationRequestStatus.COMPLETED,
    createdAt: '2023-04-15T10:30:00Z',
    updatedAt: '2023-04-18T14:20:00Z',
    completedAt: '2023-04-18T14:20:00Z',
    isUrgent: false,
    price: 299,
    aiValuation: {
      value: 450000,
      confidence: 0.85,
      factors: {
        location: 0.4,
        size: 0.3,
        condition: 0.2,
        market: 0.1
      }
    },
    officialValuation: {
      value: 465000,
      tokenId: '0.0.123456',
      report: 'QmHash123'
    }
  },
  {
    id: 'req_2',
    propertyId: 'prop_2',
    requesterId: 'user_3',
    valuatorId: 'user_2',
    status: ValuationRequestStatus.IN_PROGRESS,
    createdAt: '2023-04-20T11:45:00Z',
    updatedAt: '2023-04-21T09:30:00Z',
    isUrgent: true,
    price: 499
  },
  {
    id: 'req_3',
    propertyId: 'prop_3',
    requesterId: 'user_1',
    status: ValuationRequestStatus.PENDING,
    createdAt: '2023-04-22T16:15:00Z',
    updatedAt: '2023-04-22T16:15:00Z',
    isUrgent: false,
    price: 299
  }
];

import { IconShield } from '@tabler/icons-react';

export default function AdminPanelPage() {
  // Dashboard summary stats (mocked for now)
  const totalUsers = MOCK_USERS.length;
  const totalProperties = 12; // Replace with real property count
  const totalValuations = MOCK_VALUATION_REQUESTS.length;
  const totalRevenue = 18900; // Replace with real revenue

  const [activeTab, setActiveTab] = useState<string>('users');

  return (
    <Container size="lg" py="xl">
      <Group align="center" mb="xl" gap="md">
        <IconShield size={40} stroke={1.5} color="#228be6" />
        <Title order={2}>Admin Dashboard</Title>
      </Group>
      <Text size="md" color="dimmed" mb="lg">
        Manage users, properties, and valuations. Analytics and platform controls for admins only.
      </Text>
      {/* Summary Cards */}
      <Grid mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder shadow="xs" p="md">
            <Group>
              <IconUser size={28} color="#228be6" />
              <Stack gap={0}>
                <Text size="xs" color="dimmed">Total Users</Text>
                <Text fw={700} size="lg">{totalUsers}</Text>
              </Stack>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder shadow="xs" p="md">
            <Group>
              <IconHome size={28} color="#12b886" />
              <Stack gap={0}>
                <Text size="xs" color="dimmed">Properties</Text>
                <Text fw={700} size="lg">{totalProperties}</Text>
              </Stack>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder shadow="xs" p="md">
            <Group>
              <IconChartBar size={28} color="#ae3ec9" />
              <Stack gap={0}>
                <Text size="xs" color="dimmed">Valuations</Text>
                <Text fw={700} size="lg">{totalValuations}</Text>
              </Stack>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder shadow="xs" p="md">
            <Group>
              <IconCoin size={28} color="#fab005" />
              <Stack gap={0}>
                <Text size="xs" color="dimmed">Revenue</Text>
                <Text fw={700} size="lg">${totalRevenue.toLocaleString()}</Text>
              </Stack>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>
      {/* Management Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="users" leftSection={<IconUser size={16} />}>Users</Tabs.Tab>
          <Tabs.Tab value="properties" leftSection={<IconHome size={16} />}>Properties</Tabs.Tab>
          <Tabs.Tab value="valuations" leftSection={<IconChartBar size={16} />}>Valuations</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="users" pt="md">
          <Paper withBorder p="md">
            <Title order={4} mb="md">User Management</Title>
            <Table striped highlightOnHover withBorder>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Auth</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_USERS.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.authMethod}</td>
                    <td>
                      <Badge color={user.isEmailVerified ? 'green' : 'yellow'}>
                        {user.isEmailVerified ? 'Verified' : 'Pending'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Paper>
        </Tabs.Panel>
        <Tabs.Panel value="properties" pt="md">
          <Paper withBorder p="md">
            <Title order={4} mb="md">Property Management</Title>
            <Table striped highlightOnHover withBorder>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Owner</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {/* Placeholder rows for now */}
                <tr>
                  <td>prop_1</td>
                  <td>John Smith</td>
                  <td><Badge color="green">active</Badge></td>
                </tr>
                <tr>
                  <td>prop_2</td>
                  <td>Michael Chen</td>
                  <td><Badge color="gray">inactive</Badge></td>
                </tr>
              </tbody>
            </Table>
          </Paper>
        </Tabs.Panel>
        <Tabs.Panel value="valuations" pt="md">
          <Paper withBorder p="md">
            <Title order={4} mb="md">Valuation Requests</Title>
            <Table striped highlightOnHover withBorder>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Property</th>
                  <th>Requester</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_VALUATION_REQUESTS.map((req) => (
                  <tr key={req.id}>
                    <td>{req.id}</td>
                    <td>{req.propertyId}</td>
                    <td>{req.requesterId}</td>
                    <td>
                      <Badge color={req.status === ValuationRequestStatus.COMPLETED ? 'green' : req.status === ValuationRequestStatus.IN_PROGRESS ? 'blue' : 'yellow'}>
                        {req.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
