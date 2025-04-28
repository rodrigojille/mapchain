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
import { useAuth } from '../../contexts/AuthContext';

interface TokenizeFormValues {
  propertyName: string;
  propertySymbol: string;
  propertyValue: number;
  totalTokens: number;
  propertyDescription: string;
  propertyImage: File | null;
}

const TokenizePage: NextPage = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    tokenId: string;
    transactionId: string;
  } | null>(null);

  // Redirect if not authenticated or not a property owner
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user?.role !== 'PROPERTY_OWNER') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const form = useForm<TokenizeFormValues>({
    initialValues: {
      propertyName: '',
      propertySymbol: '',
      propertyValue: 0,
      totalTokens: 0,
      propertyDescription: '',
      propertyImage: null,
    },
    validate: {
      propertyName: (value) => (!value ? 'Property name is required' : null),
      propertySymbol: (value) => (!value ? 'Property symbol is required' : null),
      propertyValue: (value) => (!value ? 'Property value is required' : null),
      totalTokens: (value) => (!value ? 'Total tokens is required' : null),
    },
  });

  const handleSubmit = async (values: TokenizeFormValues) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== null) {
          formData.append(key, value);
        }
      });

      const response = await fetch('/api/blockchain/tokenize', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess({
          tokenId: data.tokenId,
          transactionId: data.transactionId,
        });
        setTimeout(() => {
          router.push(`/properties/detail/${data.tokenId}`);
        }, 3000);
      } else {
        setError(data.error || 'Failed to tokenize property');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during tokenization');
      console.error('Tokenization error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Title order={2} align="center" mb="xl">
          Tokenize Your Property
        </Title>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack spacing="md">
            <TextInput
              label="Property Name"
              placeholder="Enter property name"
              required
              {...form.getInputProps('propertyName')}
            />

            <TextInput
              label="Property Symbol"
              placeholder="Enter property symbol (e.g., VILLA)"
              required
              {...form.getInputProps('propertySymbol')}
            />

            <NumberInput
              label="Property Value (USD)"
              placeholder="Enter property value"
              required
              min={0}
              precision={2}
              {...form.getInputProps('propertyValue')}
            />

            <NumberInput
              label="Total Tokens"
              placeholder="Enter total number of tokens"
              required
              min={1}
              {...form.getInputProps('totalTokens')}
            />

            <Textarea
              label="Property Description"
              placeholder="Enter property description"
              minRows={4}
              {...form.getInputProps('propertyDescription')}
            />

            <FileInput
              label="Property Image"
              placeholder="Upload property image"
              accept="image/*"
              icon={<IconUpload size={14} />}
              {...form.getInputProps('propertyImage')}
            />

            {error && (
              <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
                {error}
              </Alert>
            )}

            {success && (
              <Alert color="green" title="Success">
                <Text>Property successfully tokenized!</Text>
                <Text size="sm">Token ID: {success.tokenId}</Text>
                <Text size="sm" color="dimmed">
                  Transaction ID: {success.transactionId}
                </Text>
              </Alert>
            )}

            <Divider />

            <Group position="center">
              <Button type="submit" loading={loading}>
                Tokenize Property
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default TokenizePage;
