import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Group,
  Divider,
  Tabs,
  Alert,
  Box,
  Center,
  Image
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconLogin, IconWallet } from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';
import HederaWalletConnect from '../components/wallet/HederaWalletConnect';
import { HederaService } from '../services/HederaIntegration';

const Login: NextPage = () => {
  const router = useRouter();
  const { login, loginWithWallet, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string | null>('email');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  
  // Initialize Hedera service with env vars
  const operatorId = process.env.NEXT_PUBLIC_HEDERA_OPERATOR_ID;
  const operatorKey = process.env.NEXT_PUBLIC_HEDERA_OPERATOR_KEY;
  let hederaService: HederaService | null = null;
  let hederaError: string | null = null;
  if (operatorId && operatorKey) {
    hederaService = new HederaService(operatorId, operatorKey);
  } else {
    hederaError = 'Hedera operator credentials are not set in environment variables.';
  }

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Form for email/password login
  const form = useForm({
    initialValues: {
      email: '',
      password: ''
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null)
    }
  });

  // Handle form submission
  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      setError(null);
      
      const success = await login(values.email, values.password);
      
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle wallet connection
  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
    setWalletConnected(true);
  };

  // Handle wallet login
  const handleWalletLogin = async () => {
    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const success = await loginWithWallet(walletAddress);
      
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Failed to login with wallet');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during wallet login');
      console.error('Wallet login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xs" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Center mb="lg">
          <Image src="/logo.png" alt="MapChain Logo" width={120} height={120} />
        </Center>
        
        <Title order={2} ta="center" mb="md">
          MapChain Login
        </Title>
        
        <Text color="dimmed" size="sm" ta="center" mb="xl">
          Login to access your property dashboard and tokenization tools
        </Text>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List grow mb="md">
            <Tabs.Tab value="email" leftSection={<IconLogin size={14} />}>
              Email Login
            </Tabs.Tab>
            <Tabs.Tab value="wallet" leftSection={<IconWallet size={14} />}>
              Wallet Login
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="email">
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <TextInput
                label="Email"
                placeholder="your@email.com"
                required
                name="email"
                {...form.getInputProps('email')}
              />
              
              <PasswordInput
                label="Password"
                placeholder="Your password"
                required
                mt="md"
                name="password"
                {...form.getInputProps('password')}
              />
              
              <Button 
                fullWidth 
                mt="xl" 
                type="submit"
                loading={loading}
              >
                Login
              </Button>
            </form>
          </Tabs.Panel>

          <Tabs.Panel value="wallet">
            <Box mb="xl">
              <HederaWalletConnect 
                projectId="mapchain-hedera"
                onConnect={handleWalletConnect}
                networkType="testnet"
              />
            </Box>
            
            {walletConnected && (
              <Alert color="green" mb="md">
                Wallet connected: {walletAddress?.substring(0, 8)}...{walletAddress?.substring(walletAddress.length - 6)}
              </Alert>
            )}
            
            <Button 
              fullWidth 
              mt="md" 
              onClick={handleWalletLogin}
              loading={loading}
              disabled={!walletConnected}
            >
              Login with Wallet
            </Button>
          </Tabs.Panel>
        </Tabs>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mt="md">
            {error}
          </Alert>
        )}

        <Divider label="Don't have an account?" labelPosition="center" my="lg" />
        
        <Group justify="center">
          <Button variant="subtle" component={Link} href="/register">
            Create Account
          </Button>
        </Group>
      </Paper>
    </Container>
  );
};

export default Login;

