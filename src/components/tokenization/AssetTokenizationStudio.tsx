import React, { useState } from 'react';
import { 
  Box, 
  Title, 
  Text, 
  Button, 
  Group, 
  TextInput, 
  NumberInput, 
  Textarea, 
  Select, 
  FileInput, 
  Paper, 
  Stepper, 
  Divider, 
  Alert, 
  Loader,
  SimpleGrid,
  Card,
  Badge,
  Image,
  Stack
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconCheck, IconUpload, IconBuildingEstate, IconCoin, IconFileDescription, IconPhoto, IconCertificate } from '@tabler/icons-react';
import { HederaService, PropertyTokenizationConfig } from '../../services/HederaIntegration';

interface AssetTokenizationStudioProps {
  hederaService: HederaService;
  propertyId: string;
  propertyData: {
    id: string;
    title: string;
    address: {
      line1: string;
      city: string;
      state: string;
      zipCode: string;
    };
    location: {
      lat: number;
      lng: number;
    };
    features: {
      bedrooms: number;
      bathrooms: number;
      squareFootage: number;
      yearBuilt: number;
      propertyType: string;
    };
    images: string[];
    valuation: {
      value: number;
      date: string;
      valuator?: string;
      method?: string;
    };
  };
  onTokenizationComplete: (tokenData: any) => void;
}

export const AssetTokenizationStudio: React.FC<AssetTokenizationStudioProps> = ({
  hederaService,
  propertyId,
  propertyData,
  onTokenizationComplete
}) => {
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [tokenData, setTokenData] = useState<any>(null);
  const [documents, setDocuments] = useState<File[]>([]);

  // Form for tokenization details
  const form = useForm({
    initialValues: {
      name: `${propertyData.title} Token`,
      symbol: `PROP${propertyData.id.substring(0, 4).toUpperCase()}`,
      description: `Tokenized real estate asset representing ${propertyData.title} located at ${propertyData.address.line1}, ${propertyData.address.city}, ${propertyData.address.state} ${propertyData.address.zipCode}`,
      totalShares: 1000,
      pricePerShare: Math.round(propertyData.valuation.value / 1000),
      valuationAmount: propertyData.valuation.value,
      valuationDate: propertyData.valuation.date,
      valuator: propertyData.valuation.valuator || 'MapChain Certified Valuator',
      valuationMethod: propertyData.valuation.method || 'Comparative Market Analysis'
    },
    validate: {
      name: (value) => (value.length < 3 ? 'Name must be at least 3 characters' : null),
      symbol: (value) => (value.length < 2 || value.length > 8 ? 'Symbol must be between 2-8 characters' : null),
      description: (value) => (value.length < 10 ? 'Description must be at least 10 characters' : null),
      totalShares: (value) => (value < 1 ? 'Total shares must be at least 1' : null),
      pricePerShare: (value) => (value <= 0 ? 'Price per share must be greater than 0' : null),
    }
  });

  // Handle next step
  const nextStep = () => {
    if (active < 3) {
      setActive((current) => current + 1);
    }
  };

  // Handle previous step
  const prevStep = () => {
    if (active > 0) {
      setActive((current) => current - 1);
    }
  };

  // Handle document upload
  const handleDocumentUpload = (files: File[]) => {
    setDocuments(files);
  };

  // Handle tokenization submission
  const handleSubmit = async () => {
    if (form.validate().hasErrors) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare document metadata
      const documentMetadata = documents.map(doc => ({
        title: doc.name,
        url: URL.createObjectURL(doc), // In a real app, you'd upload to IPFS or similar
        hash: `placeholder-hash-${doc.name.replace(/\s+/g, '-')}` // In a real app, you'd compute a real hash
      }));

      // Prepare tokenization config
      const tokenizationConfig: PropertyTokenizationConfig = {
        name: form.values.name,
        symbol: form.values.symbol,
        description: form.values.description,
        propertyId: propertyId,
        totalShares: form.values.totalShares,
        pricePerShare: form.values.pricePerShare,
        location: {
          latitude: propertyData.location.lat,
          longitude: propertyData.location.lng,
          address: `${propertyData.address.line1}, ${propertyData.address.city}, ${propertyData.address.state} ${propertyData.address.zipCode}`
        },
        features: propertyData.features,
        images: propertyData.images,
        documents: documentMetadata,
        valuation: {
          amount: form.values.valuationAmount,
          date: form.values.valuationDate,
          valuator: form.values.valuator,
          method: form.values.valuationMethod
        }
      };

      // Create the token
      const result = await hederaService.createPropertyToken(tokenizationConfig);
      setTokenData(result);
      setSuccess(true);
      onTokenizationComplete(result);
      nextStep();
    } catch (err: any) {
      setError(err.message || 'Failed to tokenize property. Please try again.');
      console.error('Tokenization error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Title order={2} mb="md">Asset Tokenization Studio</Title>
      <Text color="dimmed" mb="xl">
        Tokenize your property on the Hedera blockchain to enable fractional ownership and trading.
      </Text>

      <Stepper active={active} onStepClick={setActive} breakpoint="sm" mb="xl">
        <Stepper.Step 
          label="Property Details" 
          description="Review property information"
          icon={<IconBuildingEstate size={18} />}
        >
          <Paper p="md" withBorder mb="xl">
            <SimpleGrid cols={2} breakpoints={[{ maxWidth: 'sm', cols: 1 }]} spacing="xl">
              <Box>
                <Title order={3}>{propertyData.title}</Title>
                <Text mt="xs">
                  {propertyData.address.line1}, {propertyData.address.city}, {propertyData.address.state} {propertyData.address.zipCode}
                </Text>
                
                <Group mt="md" spacing="xs">
                  <Badge>{propertyData.features.bedrooms} beds</Badge>
                  <Badge>{propertyData.features.bathrooms} baths</Badge>
                  <Badge>{propertyData.features.squareFootage} sq ft</Badge>
                  <Badge>{propertyData.features.propertyType}</Badge>
                </Group>
                
                <Text mt="lg" weight={500}>Current Valuation</Text>
                <Text size="xl" weight={700} color="blue">
                  ${propertyData.valuation.value.toLocaleString()}
                </Text>
                <Text size="xs" color="dimmed">
                  as of {new Date(propertyData.valuation.date).toLocaleDateString()}
                </Text>
              </Box>
              
              <Box>
                {propertyData.images.length > 0 && (
                  <Image 
                    src={propertyData.images[0]} 
                    alt={propertyData.title}
                    radius="md"
                    height={200}
                  />
                )}
              </Box>
            </SimpleGrid>
          </Paper>
        </Stepper.Step>
        
        <Stepper.Step 
          label="Tokenization" 
          description="Configure token details"
          icon={<IconCoin size={18} />}
        >
          <Paper p="md" withBorder mb="xl">
            <form>
              <SimpleGrid cols={2} breakpoints={[{ maxWidth: 'sm', cols: 1 }]} spacing="md">
                <TextInput
                  label="Token Name"
                  placeholder="Enter token name"
                  required
                  {...form.getInputProps('name')}
                />
                
                <TextInput
                  label="Token Symbol"
                  placeholder="Enter token symbol"
                  required
                  maxLength={8}
                  {...form.getInputProps('symbol')}
                />
              </SimpleGrid>
              
              <Textarea
                label="Description"
                placeholder="Enter token description"
                required
                minRows={3}
                mt="md"
                {...form.getInputProps('description')}
              />
              
              <SimpleGrid cols={2} breakpoints={[{ maxWidth: 'sm', cols: 1 }]} spacing="md" mt="md">
                <NumberInput
                  label="Total Shares"
                  placeholder="Enter total number of shares"
                  required
                  min={1}
                  {...form.getInputProps('totalShares')}
                />
                
                <NumberInput
                  label="Price Per Share"
                  placeholder="Enter price per share"
                  required
                  min={0.01}
                  precision={2}
                  icon="$"
                  {...form.getInputProps('pricePerShare')}
                />
              </SimpleGrid>
              
              <Divider my="lg" label="Valuation Details" labelPosition="center" />
              
              <SimpleGrid cols={2} breakpoints={[{ maxWidth: 'sm', cols: 1 }]} spacing="md">
                <NumberInput
                  label="Valuation Amount"
                  placeholder="Enter valuation amount"
                  required
                  min={1}
                  icon="$"
                  {...form.getInputProps('valuationAmount')}
                />
                
                <TextInput
                  label="Valuation Date"
                  placeholder="YYYY-MM-DD"
                  required
                  {...form.getInputProps('valuationDate')}
                />
                
                <TextInput
                  label="Valuator"
                  placeholder="Enter valuator name"
                  {...form.getInputProps('valuator')}
                />
                
                <Select
                  label="Valuation Method"
                  placeholder="Select valuation method"
                  data={[
                    { value: 'Comparative Market Analysis', label: 'Comparative Market Analysis' },
                    { value: 'Income Approach', label: 'Income Approach' },
                    { value: 'Cost Approach', label: 'Cost Approach' },
                    { value: 'AI-Powered Valuation', label: 'AI-Powered Valuation' }
                  ]}
                  {...form.getInputProps('valuationMethod')}
                />
              </SimpleGrid>
            </form>
          </Paper>
        </Stepper.Step>
        
        <Stepper.Step 
          label="Documentation" 
          description="Upload supporting documents"
          icon={<IconFileDescription size={18} />}
        >
          <Paper p="md" withBorder mb="xl">
            <Text mb="md">
              Upload supporting documents for your property tokenization. These documents will be referenced in the token metadata.
            </Text>
            
            <FileInput
              label="Property Documents"
              placeholder="Upload property documents"
              accept="application/pdf,image/*"
              multiple
              icon={<IconUpload size={14} />}
              onChange={handleDocumentUpload}
              mb="md"
            />
            
            {documents.length > 0 && (
              <Box mt="md">
                <Text weight={500} mb="xs">Uploaded Documents:</Text>
                <Stack spacing="xs">
                  {documents.map((doc, index) => (
                    <Group key={index} position="apart" p="xs" style={{ border: '1px solid #eee', borderRadius: '4px' }}>
                      <Text size="sm">{doc.name}</Text>
                      <Text size="xs" color="dimmed">{(doc.size / 1024).toFixed(2)} KB</Text>
                    </Group>
                  ))}
                </Stack>
              </Box>
            )}
            
            <Alert icon={<IconAlertCircle size={16} />} title="Important" color="blue" mt="xl">
              All documents will be referenced in the token metadata. For privacy and efficiency, only document references are stored on-chain, not the actual files.
            </Alert>
          </Paper>
        </Stepper.Step>
        
        <Stepper.Step 
          label="Confirmation" 
          description="Review and confirm"
          icon={<IconCertificate size={18} />}
        >
          {success ? (
            <Paper p="md" withBorder mb="xl">
              <Alert icon={<IconCheck size={16} />} title="Success!" color="green" mb="lg">
                Your property has been successfully tokenized on the Hedera blockchain.
              </Alert>
              
              <Title order={4} mb="md">Token Information</Title>
              
              <SimpleGrid cols={2} breakpoints={[{ maxWidth: 'sm', cols: 1 }]} spacing="md">
                <Card withBorder p="md">
                  <Text weight={500}>Token ID</Text>
                  <Text>{tokenData?.tokenId}</Text>
                </Card>
                
                <Card withBorder p="md">
                  <Text weight={500}>Token Name</Text>
                  <Text>{form.values.name}</Text>
                </Card>
                
                <Card withBorder p="md">
                  <Text weight={500}>Token Symbol</Text>
                  <Text>{form.values.symbol}</Text>
                </Card>
                
                <Card withBorder p="md">
                  <Text weight={500}>Total Shares</Text>
                  <Text>{form.values.totalShares}</Text>
                </Card>
                
                <Card withBorder p="md">
                  <Text weight={500}>Price Per Share</Text>
                  <Text>${form.values.pricePerShare}</Text>
                </Card>
                
                <Card withBorder p="md">
                  <Text weight={500}>Total Value</Text>
                  <Text>${form.values.valuationAmount.toLocaleString()}</Text>
                </Card>
              </SimpleGrid>
              
              <Text mt="xl" size="sm" color="dimmed">
                You can now manage your tokenized property in the dashboard, including transferring shares and viewing transaction history.
              </Text>
            </Paper>
          ) : (
            <Paper p="md" withBorder mb="xl">
              <Title order={4} mb="md">Review Tokenization Details</Title>
              
              <SimpleGrid cols={2} breakpoints={[{ maxWidth: 'sm', cols: 1 }]} spacing="md">
                <Box>
                  <Text weight={500}>Property</Text>
                  <Text>{propertyData.title}</Text>
                </Box>
                
                <Box>
                  <Text weight={500}>Location</Text>
                  <Text>{propertyData.address.line1}, {propertyData.address.city}</Text>
                </Box>
                
                <Box>
                  <Text weight={500}>Token Name</Text>
                  <Text>{form.values.name}</Text>
                </Box>
                
                <Box>
                  <Text weight={500}>Token Symbol</Text>
                  <Text>{form.values.symbol}</Text>
                </Box>
                
                <Box>
                  <Text weight={500}>Total Shares</Text>
                  <Text>{form.values.totalShares}</Text>
                </Box>
                
                <Box>
                  <Text weight={500}>Price Per Share</Text>
                  <Text>${form.values.pricePerShare}</Text>
                </Box>
                
                <Box>
                  <Text weight={500}>Total Value</Text>
                  <Text>${form.values.valuationAmount.toLocaleString()}</Text>
                </Box>
                
                <Box>
                  <Text weight={500}>Documents</Text>
                  <Text>{documents.length} document(s) attached</Text>
                </Box>
              </SimpleGrid>
              
              {error && (
                <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mt="lg">
                  {error}
                </Alert>
              )}
              
              <Alert icon={<IconAlertCircle size={16} />} title="Important" color="yellow" mt="lg">
                By proceeding, you are creating a tokenized representation of this property on the Hedera blockchain. This action cannot be undone.
              </Alert>
            </Paper>
          )}
        </Stepper.Step>
      </Stepper>

      <Group position="apart" mt="xl">
        {active > 0 && !success && (
          <Button variant="default" onClick={prevStep}>
            Back
          </Button>
        )}
        
        {active < 3 && (
          <Button onClick={nextStep}>
            Next
          </Button>
        )}
        
        {active === 3 && !success && (
          <Button 
            onClick={handleSubmit} 
            loading={loading}
            color="blue"
          >
            Tokenize Property
          </Button>
        )}
        
        {success && (
          <Button 
            color="green" 
            onClick={() => window.location.href = '/dashboard'}
          >
            Go to Dashboard
          </Button>
        )}
      </Group>
    </Box>
  );
};

export default AssetTokenizationStudio;
