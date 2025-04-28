import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  TextInput, 
  PasswordInput, 
  Button, 
  Box, 
  Divider, 
  Stack,
  Alert
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '../../providers/AuthProvider';
import { useWallet } from '../../hooks/useWallet';
import { IconAlertCircle } from '@tabler/icons-react';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function LoginForm({ onSuccess, redirectTo = '/dashboard' }: LoginFormProps) {
  const router = useRouter();
  const auth = useAuth();
  const wallet = useWallet();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => {
        if (!value) return 'Email is required';
        return /^\S+@\S+$/.test(value) ? null : 'Invalid email';
      },
      password: (value) => {
        if (!value) return 'Password is required';
        return value.length >= 6 ? null : 'Password must be at least 6 characters';
      },
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setError(null);
      setIsLoading(true);

      // Optionally, post to /api/auth/login here if needed
      await auth.login(values.email, values.password);

      if (onSuccess) {
        onSuccess();
      } else if (redirectTo) {
        router.push(redirectTo);
      }
    } catch (err) {
      setError('Invalid email or password');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletLogin = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      if (!wallet.accountId) {
        await wallet.connect();
      }
      
      if (wallet.accountId) {
        await auth.loginWithWallet(wallet.accountId);
        
        if (onSuccess) {
          onSuccess();
        } else if (redirectTo) {
          router.push(redirectTo);
        }
      }
    } catch (err) {
      setError('Wallet login failed. Please try again.');
      console.error('Wallet login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <h1>Login to MapChain</h1>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
              {error}
            </Alert>
          )}

          <TextInput
            label="Email"
            placeholder="your@email.com"
            required
            name="email"
            {...form.getInputProps('email')}
            error={form.errors.email}
          />

          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            name="password"
            {...form.getInputProps('password')}
            error={form.errors.password}
          />

          <Button type="submit" fullWidth loading={isLoading}>
            Login
          </Button>

          <Divider label="Or continue with" labelPosition="center" />

          <Button 
            variant="outline" 
            onClick={handleWalletLogin} 
            loading={isLoading}
            fullWidth
          >
            Login with wallet
          </Button>

          <Box mt="md" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link href="/register" legacyBehavior>
              <a style={{fontSize: '0.9rem'}}>Register</a>
            </Link>
          </Box>
        </Stack>
      </form>
    </Box>
  );
}
