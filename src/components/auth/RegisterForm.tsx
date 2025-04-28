import { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  TextInput, 
  PasswordInput, 
  Button, 
  Group, 
  Box, 
  Text, 
  Divider, 
  Stack,
  Alert,
  Radio,
  RadioGroup
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '../../providers/AuthProvider';
import { useWallet } from '../../hooks/useWallet';
import { IconAlertCircle } from '@tabler/icons-react';
import { UserRole } from '../../services/auth';

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function RegisterForm({ onSuccess, redirectTo = '/dashboard' }: RegisterFormProps) {
  const router = useRouter();
  const auth = useAuth();
  const wallet = useWallet();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: UserRole.PROPERTY_OWNER,
    },
    validate: {
      name: (value) => (value.length > 0 ? null : 'Name is required'),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters'),
      confirmPassword: (value, values) => 
        value === values.password ? null : 'Passwords do not match',
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setError(null);
      setIsLoading(true);
      
      await auth.register(values.email, values.password, values.name, values.role as UserRole);
      
      if (onSuccess) {
        onSuccess();
      } else if (redirectTo) {
        router.push(redirectTo);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletRegister = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      if (!wallet.accountId) {
        await wallet.connect();
      }
      
      if (wallet.accountId) {
        await auth.registerWithWallet(
          wallet.accountId, 
          form.values.name || `User ${wallet.accountId.substring(0, 6)}`,
          form.values.role as UserRole
        );
        
        if (onSuccess) {
          onSuccess();
        } else if (redirectTo) {
          router.push(redirectTo);
        }
      }
    } catch (err) {
      setError('Wallet registration failed. Please try again.');
      console.error('Wallet registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
              {error}
            </Alert>
          )}
          
          <TextInput
            label="Full Name"
            placeholder="John Doe"
            required
            {...form.getInputProps('name')}
          />
          
          <TextInput
            label="Email"
            placeholder="your@email.com"
            required
            {...form.getInputProps('email')}
          />
          
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            {...form.getInputProps('password')}
          />
          
          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm your password"
            required
            {...form.getInputProps('confirmPassword')}
          />
          
          <Radio.Group
            label="I am registering as a"
            required
            {...form.getInputProps('role')}
          >
            <Group mt="xs">
              <Radio value={UserRole.PROPERTY_OWNER} label="Property Owner" />
              <Radio value={UserRole.VALUATOR} label="Professional Valuator" />
            </Group>
          </Radio.Group>
          
          <Button type="submit" fullWidth loading={isLoading}>
            Create Account
          </Button>
          
          <Divider label="Or continue with" labelPosition="center" />
          
          <Button 
            variant="outline" 
            onClick={handleWalletRegister} 
            loading={isLoading}
            fullWidth
          >
            Register with Hedera Wallet
          </Button>
          
          <Text size="sm" style={{ textAlign: 'center' }}>
            Already have an account?{' '}
            <Text component="a" href="/auth/login" style={{ cursor: 'pointer' }}>
              Sign In
            </Text>
          </Text>
        </Stack>
      </form>
    </Box>
  );
}
