import React, { useState } from 'react';
import { 
  Box, 
  Title, 
  Text, 
  Button, 
  Group, 
  Tabs, 
  Paper, 
  Textarea, 
  TextInput, 
  Select, 
  Code, 
  Alert, 
  Loader,
  Stack,
  JsonInput,
  NumberInput,
  Divider,
  Badge
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCode, IconCoin, IconFileCode, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { HederaService } from '../../services/HederaIntegration';

interface HederaPlaygroundProps {
  hederaService: HederaService;
}

export const HederaPlayground: React.FC<HederaPlaygroundProps> = ({ hederaService }) => {
  const [activeTab, setActiveTab] = useState<string | null>('contracts');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  
  // Contract deployment form
  const deployForm = useForm({
    initialValues: {
      bytecode: '',
      constructorParams: ''
    },
    validate: {
      bytecode: (value) => (!value ? 'Bytecode is required' : null),
    }
  });
  
  // Contract execution form
  const executeForm = useForm({
    initialValues: {
      contractId: '',
      functionName: '',
      params: ''
    },
    validate: {
      contractId: (value) => (!value ? 'Contract ID is required' : null),
      functionName: (value) => (!value ? 'Function name is required' : null),
    }
  });
  
  // Token creation form
  const tokenForm = useForm({
    initialValues: {
      tokenName: 'Test Token',
      tokenSymbol: 'TEST',
      tokenType: 'fungible',
      initialSupply: 1000,
      decimals: 0
    },
    validate: {
      tokenName: (value) => (!value ? 'Token name is required' : null),
      tokenSymbol: (value) => (!value ? 'Token symbol is required' : null),
    }
  });
  
  // Network status
  const networkStatus = hederaService.getNetworkStatus();
  
  // Handle contract deployment
  const handleDeployContract = async () => {
    if (deployForm.validate().hasErrors) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    setResult(null);
    
    try {
      const bytecode = deployForm.values.bytecode;
      const result = await hederaService.deployTestContract(bytecode);
      
      setResult(result);
      setSuccess('Contract deployed successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to deploy contract');
      console.error('Contract deployment error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle contract execution
  const handleExecuteContract = async () => {
    if (executeForm.validate().hasErrors) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    setResult(null);
    
    try {
      const contractId = executeForm.values.contractId;
      const functionName = executeForm.values.functionName;
      let params: any[] = [];
      
      if (executeForm.values.params) {
        try {
          params = JSON.parse(executeForm.values.params);
          if (!Array.isArray(params)) {
            params = [params];
          }
        } catch (e) {
          throw new Error('Invalid parameters format. Must be a valid JSON array.');
        }
      }
      
      const result = await hederaService.executeContract(contractId, functionName, params);
      
      setResult(result);
      setSuccess('Contract executed successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to execute contract');
      console.error('Contract execution error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle token creation
  const handleCreateToken = async () => {
    if (tokenForm.validate().hasErrors) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    setResult(null);
    
    try {
      // This is a simplified token creation for testing
      // In a real implementation, you would use the appropriate method based on token type
      let result;
      
      if (tokenForm.values.tokenType === 'fungible') {
        // Create a basic fungible token for testing
        const tokenCreateTx = {
          name: tokenForm.values.tokenName,
          symbol: tokenForm.values.tokenSymbol,
          initialSupply: tokenForm.values.initialSupply,
          decimals: tokenForm.values.decimals
        };
        
        // This is a placeholder - in a real implementation, you would call the appropriate method
        result = {
          tokenId: `0.0.${Math.floor(Math.random() * 1000000)}`,
          name: tokenCreateTx.name,
          symbol: tokenCreateTx.symbol,
          initialSupply: tokenCreateTx.initialSupply,
          decimals: tokenCreateTx.decimals,
          status: 'SUCCESS'
        };
      } else {
        // Create a basic NFT for testing
        const nftConfig = {
          name: tokenForm.values.tokenName,
          symbol: tokenForm.values.tokenSymbol,
          description: 'Test NFT created in Developer Playground',
          propertyId: 'test-property',
          metadata: {},
          image: '',
          attributes: []
        };
        
        result = await hederaService.createPropertyNFT(nftConfig);
      }
      
      setResult(result);
      setSuccess('Token created successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to create token');
      console.error('Token creation error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box>
      <Title order={2} mb="md">Hedera Developer Playground</Title>
      <Text color="dimmed" mb="xl">
        Test and experiment with Hedera smart contracts and tokens in a sandbox environment.
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
            <Text>{networkStatus.operatorAccount}</Text>
          </div>
          
          <div>
            <Text>Status</Text>
            <Badge color={networkStatus.clientConnected ? 'green' : 'red'}>
              {networkStatus.clientConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
        </Group>
      </Paper>
      
      <Tabs value={activeTab} onChange={setActiveTab} mb="xl">
        <Tabs.List>
          <Tabs.Tab value="contracts">Smart Contracts</Tabs.Tab>
          <Tabs.Tab value="tokens">Tokens</Tabs.Tab>
          <Tabs.Tab value="files">Files</Tabs.Tab>
        </Tabs.List>
        
        <Tabs.Panel value="contracts" pt="md">
          <Tabs defaultValue="deploy">
            <Tabs.List>
              <Tabs.Tab value="deploy">Deploy Contract</Tabs.Tab>
              <Tabs.Tab value="execute">Execute Contract</Tabs.Tab>
              <Tabs.Tab value="query">Query Contract</Tabs.Tab>
            </Tabs.List>
            
            <Tabs.Panel value="deploy" pt="md">
              <form>
                <Textarea
                  label="Contract Bytecode"
                  placeholder="Enter contract bytecode (hex format)"
                  minRows={5}
                  required
                  {...deployForm.getInputProps('bytecode')}
                />
                
                <JsonInput
                  label="Constructor Parameters (optional)"
                  placeholder="Enter constructor parameters as JSON array"
                  minRows={3}
                  mt="md"
                  validationError="Invalid JSON"
                  formatOnBlur
                  {...deployForm.getInputProps('constructorParams')}
                />
                
                <Button 
                  mt="lg" 
                  onClick={handleDeployContract}
                  loading={loading}
                >
                  Deploy Contract
                </Button>
              </form>
            </Tabs.Panel>
            
            <Tabs.Panel value="execute" pt="md">
              <form>
                <TextInput
                  label="Contract ID"
                  placeholder="Enter contract ID (e.g., 0.0.12345)"
                  required
                  {...executeForm.getInputProps('contractId')}
                />
                
                <TextInput
                  label="Function Name"
                  placeholder="Enter function name to execute"
                  mt="md"
                  required
                  {...executeForm.getInputProps('functionName')}
                />
                
                <JsonInput
                  label="Parameters (optional)"
                  placeholder="Enter parameters as JSON array"
                  minRows={3}
                  mt="md"
                  validationError="Invalid JSON"
                  formatOnBlur
                  {...executeForm.getInputProps('params')}
                />
                
                <Button 
                  mt="lg" 
                  onClick={handleExecuteContract}
                  loading={loading}
                >
                  Execute Contract
                </Button>
              </form>
            </Tabs.Panel>
            
            <Tabs.Panel value="query" pt="md">
              <form>
                <TextInput
                  label="Contract ID"
                  placeholder="Enter contract ID (e.g., 0.0.12345)"
                  required
                />
                
                <TextInput
                  label="Function Name"
                  placeholder="Enter function name to query"
                  mt="md"
                  required
                />
                
                <JsonInput
                  label="Parameters (optional)"
                  placeholder="Enter parameters as JSON array"
                  minRows={3}
                  mt="md"
                  validationError="Invalid JSON"
                  formatOnBlur
                />
                
                <Button mt="lg">
                  Query Contract
                </Button>
              </form>
            </Tabs.Panel>
          </Tabs>
        </Tabs.Panel>
        
        <Tabs.Panel value="tokens" pt="md">
          <form>
            <TextInput
              label="Token Name"
              placeholder="Enter token name"
              required
              {...tokenForm.getInputProps('tokenName')}
            />
            
            <TextInput
              label="Token Symbol"
              placeholder="Enter token symbol"
              mt="md"
              required
              maxLength={8}
              {...tokenForm.getInputProps('tokenSymbol')}
            />
            
            <Select
              label="Token Type"
              placeholder="Select token type"
              mt="md"
              data={[
                { value: 'fungible', label: 'Fungible Token' },
                { value: 'nft', label: 'Non-Fungible Token (NFT)' }
              ]}
              {...tokenForm.getInputProps('tokenType')}
            />
            
            {tokenForm.values.tokenType === 'fungible' && (
              <>
                <NumberInput
                  label="Initial Supply"
                  placeholder="Enter initial supply"
                  mt="md"
                  min={0}
                  {...tokenForm.getInputProps('initialSupply')}
                />
                
                <NumberInput
                  label="Decimals"
                  placeholder="Enter number of decimals"
                  mt="md"
                  min={0}
                  max={18}
                  {...tokenForm.getInputProps('decimals')}
                />
              </>
            )}
            
            <Button 
              mt="lg" 
              onClick={handleCreateToken}
              loading={loading}
            >
              Create Token
            </Button>
          </form>
        </Tabs.Panel>
        
        <Tabs.Panel value="files" pt="md">
          <form>
            <Textarea
              label="File Content"
              placeholder="Enter file content"
              minRows={5}
              required
            />
            
            <Button mt="lg">
              Upload File
            </Button>
          </form>
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

export default HederaPlayground;
