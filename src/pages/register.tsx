import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Divider,
  Alert,
  Box,
  Anchor
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '../providers/AuthProvider';

const Register = () => {
  const router = useRouter();
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
    },
    validate: {
      name: (value: string) => {
        if (!value) return 'Full Name is required';
        return null;
      },
      email: (value: string) => {
        if (!value) return 'Email is required';
        return /^\S+@\S+$/.test(value) ? null : 'Invalid email';
      },
      password: (value: string) => {
        if (!value) return 'Password is required';
        return value.length >= 6 ? null : 'Password must be at least 6 characters';
      },
      confirmPassword: (value: string, values: { password: string }) => {
        if (!value) return 'Password is required';
        if (value !== values.password) return 'Passwords do not match';
        return null;
      },
      role: (value: string) => {
        if (!value) return 'Role is required';
        return null;
      },
    },
  });

  const handleSubmit = async (values: { name: string; email: string; password: string; confirmPassword: string; role: string }) => {
    try {
      setLoading(true);
      setError(null);
      const success = await register(values.email, values.password);
      if (success) {
        window.location.href = '/dashboard';
      } else {
        alert('Registration failed. Email may already be in use.');
      }
    } catch (err: any) {
      setError('Registration failed. Email may already be in use.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xs" py="xl">
      <h1>Register for MapChain</h1>
      <Paper radius="md" p="xl" withBorder>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Full Name"
            placeholder="John Doe"
            required
            name="name"
            {...form.getInputProps('name')}
            mt="md"
          />
          {form.errors.name && (
            <div style={{ color: 'red', fontSize: '0.9em', marginBottom: 8 }}>{form.errors.name}</div>
          )}
          <TextInput
            label="Email"
            placeholder="your@email.com"
            required
            name="email"
            {...form.getInputProps('email')}
            mt="md"
          />
          {form.errors.email && (
            <div style={{ color: 'red', fontSize: '0.9em', marginBottom: 8 }}>{form.errors.email}</div>
          )}
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            name="password"
            {...form.getInputProps('password')}
            mt="md"
          />
          {form.errors.password && (
            <div style={{ color: 'red', fontSize: '0.9em', marginBottom: 8 }}>{form.errors.password}</div>
          )}
          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm your password"
            required
            name="confirmPassword"
            {...form.getInputProps('confirmPassword')}
            mt="md"
          />
          {form.errors.confirmPassword && (
            <div style={{ color: 'red', fontSize: '0.9em', marginBottom: 8 }}>{form.errors.confirmPassword}</div>
          )}
          <label htmlFor="role" style={{ marginTop: 16, display: 'block', fontWeight: 500 }}>
            I am a
          </label>
          <select
            id="role"
            name="role"
            required
            value={form.values.role}
            onChange={event => form.setFieldValue('role', event.currentTarget.value)}
            style={{ marginTop: 8, marginBottom: 16, width: '100%', padding: 8 }}
          >
            <option value="">Select your role</option>
            <option value="PROPERTY_OWNER">Property Owner</option>
            <option value="VALUATOR">Valuator</option>
          </select>
          {form.errors.role && (
            <div style={{ color: 'red', fontSize: '0.9em', marginBottom: 8 }}>{form.errors.role}</div>
          )}
          <Button fullWidth mt="xl" type="submit" loading={loading}>
            Register
          </Button>
        </form>
        <Anchor href="/login" style={{ display: 'block', textAlign: 'center', marginTop: 16, marginBottom: 8 }}>
          Login
        </Anchor>
        <Button fullWidth mt="md" variant="outline" color="gray">
          Register with Wallet
        </Button>
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mt="md">
            {error}
          </Alert>
        )}
        <Divider label="Already have an account?" labelPosition="center" my="lg" />
        <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Link href="/login" legacyBehavior>
            <a style={{fontSize: '0.9rem'}}>Login</a>
          </Link>
        </Box>
      </Paper>
    </Container>
  );
}

