import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Title, 
  Text, 
  Button, 
  Group, 
  TextInput, 
  NumberInput, 
  Select, 
  Paper, 
  Code, 
  Alert, 
  Loader,
  Tabs,
  Stack,
  Divider,
  Badge,
  ActionIcon,
  Table,
  ScrollArea,
  CopyButton,
  Tooltip
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { 
  IconTerminal, 
  IconCoin, 
  IconWallet, 
  IconAlertCircle, 
  IconCheck, 
  IconCopy, 
  IconRefresh,
  IconSend,
  IconLink,
  IconUnlink,
  IconInfoCircle
} from '@tabler/icons-react';
import { HederaService } from '../../services/HederaIntegration';

interface HederaCLIProps {
  hederaService: HederaService;
}

export const HederaCLI: React.FC<HederaCLIProps> = ({ hederaService }) => {
  const [activeTab, setActiveTab] = useState<string | null>('account');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [accountBalance, setAccountBalance] = useState<any>(null);
  const [commandHistory, setCommandHistory] = useState<{command: string, result: any, timestamp: string}[]>([]);
  
  // Network status
  const networkStatus = hederaService.getNetworkStatus();
  
  // Transfer HBAR form
  const transferForm = useForm({
    initialValues: {
      receiverId: '',
      amount: 1
    },
    validate: {
      receiverId: (value) => (!value ? 'Receiver account ID is required' : null),
      amount: (value) => (value <= 0 ? 'Amount must be greater than 0' : null),
    }
  });
  
  // Associate token form
  const associateForm = useForm({
    initialValues: {
      accountId: '',
      tokenId: ''
    },
    validate: {
      accountId: (value) => (!value ? 'Account ID is required' : null),
      tokenId: (value) => (!value ? 'Token ID is required' : null),
    }
  });

  // Load account balance on initial render
  useEffect(() => {
    fetchAccountBalance();
  }, []);

  // Fetch account balance
  const fetchAccountBalance = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const balance = await hederaService.getAccountBalance();
      setAccountBalance(balance);
      
      // Add to command history
      addToCommandHistory('getAccountBalance()', balance);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch account balance');
      console.error('Account balance error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle HBAR transfer
  const handleTransferHbar = async () => {
    if (transferForm.validate().hasErrors) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    setResult(null);
    
    try {
      const receiverId = transferForm.values.receiverId;
      const amount = transferForm.values.amount;
      
      const result = await hederaService.transferHbar(receiverId, amount);
      
      setResult(result);
      setSuccess(`Successfully transferred ${amount} HBAR to ${receiverId}`);
      
      // Add to command history
      addToCommandHistory(`transferHbar("${receiverId}", ${amount})`, result);
      
      // Refresh account balance
      fetchAccountBalance();
    } catch (err: any) {
      setError(err.message || 'Failed to transfer HBAR');
      console.error('HBAR transfer error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle token association
  const handleAssociateToken = async () => {
    if (associateForm.validate().hasErrors) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    setResult(null);
    
    try {
      const accountId = associateForm.values.accountId;
      const tokenId = associateForm.values.tokenId;
      
      const result = await hederaService.associateToken(accountId, tokenId);
      
      setResult(result);
      setSuccess(`Successfully associated token ${tokenId} with account ${accountId}`);
      
      // Add to command history
      addToCommandHistory(`associateToken("${accountId}", "${tokenId}")`, result);
    } catch (err: any) {
      setError(err.message || 'Failed to associate token');
      console.error('Token association error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Add command to history
  const addToCommandHistory = (command: string, result: any) => {
    const timestamp = new Date().toISOString();
    setCommandHistory(prev => [
      { command, result, timestamp },
      ...prev.slice(0, 9) // Keep only the last 10 commands
    ]);
  };
  
  return (
    <Box>
      <Title order={2} mb="md">Hedera CLI</Title>
      <Text color="dimmed" mb="xl">
        Streamlined interface for common Hedera blockchain operations.
      </Text>
      
      <Paper withBorder p="md" mb="md">
        <Group justify="space-between">
          <div>
            <Text>Network</Text>
            <Badge color={networkStatus.network === 'mainnet' ? 'green' : 'blue'}>
              {networkStatus.network}
            </Badge>
          </div>
          
          <div>
            <Text>Operator Account</Text>
            <Group>
              <Text>{networkStatus.operatorAccount}</Text>
              <CopyButton value={networkStatus.operatorAccount} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="top">
                    <ActionIcon color={copied ? 'teal' : 'gray'} size="xs" onClick={copy}>
                      {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
          </div>
          
          <div>
            <Text>Status</Text>
            <Badge color={networkStatus.clientConnected ? 'green' : 'red'}>
              {networkStatus.clientConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          
          <Button 
            variant="light" 
            size="xs"
            onClick={fetchAccountBalance}
            loading={loading}
          >
            Refresh
          </Button>
        </Group>
      </Paper>
      
      {accountBalance && (
        <Paper withBorder p="md" mb="xl">
          <Group justify="space-between" mb="xs">
            <Text>Account Balance</Text>
            <Text size="lg">{accountBalance.hbars} HBAR</Text>
          </Group>
          
          {Object.keys(accountBalance.tokens).length > 0 && (
            <>
              <Divider my="sm" label="Tokens" labelPosition="center" />
              <ScrollArea h={100}>
                <Table>
                  <thead>
                    <tr>
                      <th>Token ID</th>
                      <th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(accountBalance.tokens).map(([tokenId, balance]) => (
                      <tr key={tokenId}>
                        <td>{tokenId}</td>
                        <td>{String(balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </ScrollArea>
            </>
          )}
        </Paper>
      )}
      
      <Tabs value={activeTab} onChange={setActiveTab} mb="xl">
        <Tabs.List>
          <Tabs.Tab value="account">Account</Tabs.Tab>
          <Tabs.Tab value="transfer">Transfer</Tabs.Tab>
          <Tabs.Tab value="tokens">Tokens</Tabs.Tab>
          <Tabs.Tab value="history">Command History</Tabs.Tab>
        </Tabs.List>
        
        <Tabs.Panel value="account" pt="md">
          <Alert icon={<IconInfoCircle size={16} />} color="blue" mb="lg">
            View and manage your Hedera account information.
          </Alert>
          
          <Button 
            onClick={fetchAccountBalance}
            loading={loading}
            mb="md"
          >
            Refresh Account Balance
          </Button>
          
          {/* Additional account management features can be added here */}
        </Tabs.Panel>
        
        <Tabs.Panel value="transfer" pt="md">
          <form>
            <TextInput
              label="Receiver Account ID"
              placeholder="Enter receiver account ID (e.g., 0.0.12345)"
              required
              {...transferForm.getInputProps('receiverId')}
            />
            
            <NumberInput
              label="Amount (HBAR)"
              placeholder="Enter amount to transfer"
              mt="md"
              required
              min={0.00001}
              step={0.1}
              {...transferForm.getInputProps('amount')}
            />
            
            <Button 
              mt="lg" 
              onClick={handleTransferHbar}
              loading={loading}
            >
              Transfer HBAR
            </Button>
          </form>
        </Tabs.Panel>
        
        <Tabs.Panel value="tokens" pt="md">
          <Tabs defaultValue="associate">
            <Tabs.List>
              <Tabs.Tab value="associate">Associate Token</Tabs.Tab>
              <Tabs.Tab value="dissociate">Dissociate Token</Tabs.Tab>
            </Tabs.List>
            
            <Tabs.Panel value="associate" pt="md">
              <form>
                <TextInput
                  label="Account ID"
                  placeholder="Enter account ID (e.g., 0.0.12345)"
                  required
                  {...associateForm.getInputProps('accountId')}
                />
                
                <TextInput
                  label="Token ID"
                  placeholder="Enter token ID (e.g., 0.0.67890)"
                  mt="md"
                  required
                  {...associateForm.getInputProps('tokenId')}
                />
                
                <Button 
                  mt="lg" 
                  onClick={handleAssociateToken}
                  loading={loading}
                >
                  Associate Token
                </Button>
              </form>
            </Tabs.Panel>
            
            <Tabs.Panel value="dissociate" pt="md">
              <form>
                <TextInput
                  label="Account ID"
                  placeholder="Enter account ID (e.g., 0.0.12345)"
                  required
                />
                
                <TextInput
                  label="Token ID"
                  placeholder="Enter token ID (e.g., 0.0.67890)"
                  mt="md"
                  required
                />
                
                <Button 
                  mt="lg" 
                  color="red"
                >
                  Dissociate Token
                </Button>
              </form>
            </Tabs.Panel>
          </Tabs>
        </Tabs.Panel>
        
        <Tabs.Panel value="history" pt="md">
          <Text mb="md">Command History</Text>
          
          {commandHistory.length === 0 ? (
            <Text color="dimmed" style={{ fontStyle: 'italic' }}>No commands executed yet</Text>
          ) : (
            <Stack>
              {commandHistory.map((item, index) => (
                <Paper key={index} withBorder p="md">
                  <Group justify="space-between" mb="xs">
                    <Group>
                      <Badge color="blue">Command</Badge>
                      <Code>{item.command}</Code>
                    </Group>
                    <Text size="xs" color="dimmed">
                      {new Date(item.timestamp).toLocaleString()}
                    </Text>
                  </Group>
                  
                  <Divider my="xs" />
                  
                  <Text size="sm" mb="xs">Result:</Text>
                  <Code block>{JSON.stringify(item.result, null, 2)}</Code>
                </Paper>
              ))}
            </Stack>
          )}
        </Tabs.Panel>
      </Tabs>
      
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md">
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert icon={<IconCheck size={16} />} title="Success" color="green" mb="md">
          {success}
        </Alert>
      )}
      
      {result && (
        <Paper withBorder p="md">
          <Title order={4} mb="md">Result</Title>
          <Code block>{JSON.stringify(result, null, 2)}</Code>
        </Paper>
      )}
    </Box>
  );
};

export default HederaCLI;
