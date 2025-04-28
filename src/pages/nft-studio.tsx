import React, { useState } from 'react';
import { NextPage } from 'next';
import {
  Container,
  Paper,
  Title,
  TextInput,
  NumberInput,
  Textarea,
  Button,
  Group,
  FileInput,
  Alert,
  Text,
  Stack,
  Divider,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconUpload } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

interface NFTFormValues {
  nftName: string;
  nftSymbol: string;
  nftDescription: string;
  royaltyFee: number;
  nftImage: File | null;
}

import DashboardNavBar from '../components/dashboard/DashboardNavBar';

const NFTStudioPage: NextPage = () => {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    tokenId: string;
    transactionId: string;
    serialNumber: string;
  } | null>(null);

  // Redirect if not authenticated or not a property owner
  React.useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== 'PROPERTY_OWNER') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  const form = useForm<NFTFormValues>({
    initialValues: {
      nftName: '',
      nftSymbol: '',
      nftDescription: '',
      royaltyFee: 0,
      nftImage: null,
    },
    validate: {
      nftName: (value) => (!value ? 'NFT name is required' : null),
      nftSymbol: (value) => {
        if (!value) return 'NFT symbol is required';
        if (!/^[A-Z0-9]+$/.test(value)) return 'Symbol must contain only uppercase letters and numbers';
        return null;
      },
    },
  });

  const handleSubmit = async (values: NFTFormValues) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== null) {
          formData.append(key, value);
        }
      });

      const response = await fetch('/api/blockchain/create-nft', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess({
          tokenId: data.tokenId,
          transactionId: data.transactionId,
          serialNumber: data.serialNumber,
        });
        setTimeout(() => {
          router.push(`/nft/detail/${data.tokenId}`);
        }, 3000);
      } else {
        setError(data.error || 'Failed to create NFT');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the NFT');
      console.error('NFT creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <DashboardNavBar />
        <div style={{ maxWidth: 600, margin: '0 auto', padding: 16 }}>
          <button
            onClick={() => router.back()}
            style={{ marginBottom: 24, background: '#4285F4', color: '#fff', fontWeight: 700, borderRadius: 8, padding: '10px 22px', fontSize: 16, border: 'none', boxShadow: '0 1px 8px #dbeafe', width: '100%' }}
          >
            Back to Dashboard
          </button>
        </div>
        <Container size="sm" py="xl" style={{ textAlign: 'center' }}>
          <Title>NFT Studio</Title>
          <Text color="dimmed" mt="md">Loading...</Text>
        </Container>
      </>
    );
  }
  return (
    <>
      <DashboardNavBar />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 16 }}>
        <button
          onClick={() => router.back()}
          style={{ marginBottom: 24, background: '#4285F4', color: '#fff', fontWeight: 700, borderRadius: 8, padding: '10px 22px', fontSize: 16, border: 'none', boxShadow: '0 1px 8px #dbeafe', width: '100%' }}
        >
          Back to Dashboard
        </button>
      </div>
      <Container size="sm" py="xl">
        <Paper radius="md" p="xl" withBorder>
          <Title order={2} mb="xl" style={{ textAlign: 'center' }}>
            NFT Studio
          </Title>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="NFT Name"
                placeholder="Enter NFT name"
                required
                {...form.getInputProps('nftName')}
              />

              <TextInput
                label="NFT Symbol"
                placeholder="Enter NFT symbol (e.g., VILLA)"
                required
                {...form.getInputProps('nftSymbol')}
              />

              <Textarea
                label="NFT Description"
                placeholder="Enter NFT description"
                minRows={4}
                {...form.getInputProps('nftDescription')}
              />

              <NumberInput
                label="Royalty Fee (%)"
                placeholder="Enter royalty fee percentage"
                min={0}
                max={100}
                step={0.01}
                {...form.getInputProps('royaltyFee')}
              />

              <FileInput
                label="NFT Image"
                placeholder="Upload NFT image"
                accept="image/*"
                leftSection={<IconUpload size={14} />}
                {...form.getInputProps('nftImage')}
              />

              {error && (
                <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
                  {error}
                </Alert>
              )}

              {success && (
                <Alert color="green" title="Success">
                  <Text>NFT successfully created!</Text>
                  <Text size="sm">Token ID: {success.tokenId}</Text>
                  <Text size="sm">Serial Number: {success.serialNumber}</Text>
                  <Text size="sm" color="dimmed">
                    Transaction ID: {success.transactionId}
                  </Text>
                </Alert>
              )}

              <Divider />

              <Group style={{ justifyContent: 'center' }}>
                <Button type="submit" loading={loading}>
                  Create NFT
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Container>
    </>
  );
};

export default NFTStudioPage;
