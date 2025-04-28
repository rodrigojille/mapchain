import React, { useState } from 'react';
import { 
  Box, 
  Title, 
  Text, 
  Button, 
  Group, 
  TextInput, 
  Textarea, 
  FileInput, 
  Paper, 
  Stepper, 
  Alert, 
  Loader,
  SimpleGrid,
  Card,
  Badge,
  Image,
  Stack,
  Divider,
  Grid,
  ActionIcon,
  ColorInput
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { 
  IconAlertCircle, 
  IconCheck, 
  IconUpload, 
  IconBuildingEstate, 
  IconCertificate, 
  IconTrash, 
  IconPlus,
  IconPhoto
} from '@tabler/icons-react';
import { HederaService, PropertyNFTConfig } from '../../services/HederaIntegration';

interface NFTStudioProps {
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
    };
  };
  onNFTCreationComplete: (nftData: any) => void;
}

export const NFTStudio: React.FC<NFTStudioProps> = ({
  hederaService,
  propertyId,
  propertyData,
  onNFTCreationComplete
}) => {
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [nftData, setNftData] = useState<any>(null);
  const [nftImage, setNftImage] = useState<File | null>(null);
  const [nftImagePreview, setNftImagePreview] = useState<string | null>(
    propertyData.images.length > 0 ? propertyData.images[0] : null
  );

  // Form for NFT details
  const form = useForm({
    initialValues: {
      name: `${propertyData.title} NFT`,
      symbol: `PROP${propertyData.id.substring(0, 4).toUpperCase()}`,
      description: `NFT representing ${propertyData.title} located at ${propertyData.address.line1}, ${propertyData.address.city}, ${propertyData.address.state} ${propertyData.address.zipCode}`,
      attributes: [
        { trait_type: 'Property Type', value: propertyData.features.propertyType },
        { trait_type: 'Bedrooms', value: propertyData.features.bedrooms },
        { trait_type: 'Bathrooms', value: propertyData.features.bathrooms },
        { trait_type: 'Square Footage', value: propertyData.features.squareFootage },
        { trait_type: 'Year Built', value: propertyData.features.yearBuilt },
        { trait_type: 'Valuation', value: propertyData.valuation.value }
      ],
      backgroundColor: '#4DABF7'
    },
    validate: {
      name: (value) => (value.length < 3 ? 'Name must be at least 3 characters' : null),
      symbol: (value) => (value.length < 2 || value.length > 8 ? 'Symbol must be between 2-8 characters' : null),
      description: (value) => (value.length < 10 ? 'Description must be at least 10 characters' : null),
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

  // Handle NFT image upload
  const handleImageUpload = (file: File | null) => {
    setNftImage(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNftImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add attribute
  const addAttribute = () => {
    form.insertListItem('attributes', { trait_type: '', value: '' });
  };

  // Remove attribute
  const removeAttribute = (index: number) => {
    form.removeListItem('attributes', index);
  };

  // Handle NFT creation
  const handleSubmit = async () => {
    if (form.validate().hasErrors) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare form data for API
      const formData = new FormData();
      formData.append('propertyName', form.values.name);
      formData.append('propertySymbol', form.values.symbol);
      formData.append('propertyDescription', form.values.description);
      formData.append('propertyValue', propertyData.valuation.value.toString());
      formData.append('totalTokens', '1'); // You can adjust this if you want fractionalization
      if (nftImage) {
        formData.append('image', nftImage);
      }
      // Add any additional fields as needed

      // POST to backend
      const response = await fetch('/api/blockchain/tokenize', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to tokenize property');
      }

      setSuccess(true);
      setNftData(data.tokenizedAsset);
      if (onNFTCreationComplete) {
        onNFTCreationComplete(data.tokenizedAsset);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to tokenize property');
    } finally {
      setLoading(false);
    }
  };
      const nftImageUrl = nftImagePreview || (propertyData.images.length > 0 ? propertyData.images[0] : '');

      // Filter out empty attributes
      const filteredAttributes = form.values.attributes.filter(attr => 
        attr.trait_type.trim() !== '' && attr.value !== null && attr.value !== undefined && String(attr.value).trim() !== ''
      );

      // Prepare NFT config
      const nftConfig: PropertyNFTConfig = {
        name: form.values.name,
        symbol: form.values.symbol,
        description: form.values.description,
        propertyId: propertyId,
        metadata: {
          property_id: propertyId,
          address: `${propertyData.address.line1}, ${propertyData.address.city}, ${propertyData.address.state} ${propertyData.address.zipCode}`,
          location: {
            latitude: propertyData.location.lat,
            longitude: propertyData.location.lng
          },
          features: propertyData.features,
          valuation: propertyData.valuation,
          backgroundColor: form.values.backgroundColor
        },
        image: nftImageUrl,
        attributes: filteredAttributes
      };

      // Create the NFT
      const result = await hederaService.createPropertyNFT(nftConfig);
      setNftData(result);
      setSuccess(true);
      onNFTCreationComplete(result);
      nextStep();
    } catch (err: any) {
      setError(err.message || 'Failed to create NFT. Please try again.');
      console.error('NFT creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate NFT preview
  const renderNFTPreview = () => {
    return (
      <Card withBorder radius="md" p={0} style={{ overflow: 'hidden', maxWidth: 350 }}>
        <Box style={{ position: 'relative' }}>
          <Image
            src={nftImagePreview || (propertyData.images.length > 0 ? propertyData.images[0] : undefined)}
            height={200}
            alt={form.values.name}
            withPlaceholder={!nftImagePreview && propertyData.images.length === 0}
            style={{ 
              backgroundColor: form.values.backgroundColor,
              objectFit: 'cover'
            }}
          />
        </Box>
        
        <Box p="md">
          <Text weight={700} size="lg" mb={5}>{form.values.name}</Text>
          <Text size="sm" color="dimmed" lineClamp={2} mb="md">{form.values.description}</Text>
          
          <Group spacing={7} mb={5}>
            {form.values.attributes
              .filter(attr => attr.trait_type && attr.value)
              .slice(0, 4)
              .map((attr, index) => (
                <Badge key={index} color="blue" variant="light">
                  {attr.trait_type}: {attr.value}
                </Badge>
              ))}
            {form.values.attributes.length > 4 && (
              <Badge color="gray" variant="light">+{form.values.attributes.length - 4} more</Badge>
            )}
          </Group>
          
          <Group position="apart" mt="md">
            <Text size="sm" weight={500}>Token ID:</Text>
            <Text size="sm" color="dimmed">To be generated</Text>
          </Group>
          
          <Group position="apart" mt={5}>
            <Text size="sm" weight={500}>Symbol:</Text>
            <Text size="sm" color="dimmed">{form.values.symbol}</Text>
          </Group>
        </Box>
      </Card>
    );
  };

  return (
    <Box>
      <Title order={2} mb="md">NFT Studio</Title>
      <Text color="dimmed" mb="xl">
        Create a unique NFT for your property on the Hedera blockchain.
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
          label="NFT Details" 
          description="Configure NFT information"
          icon={<IconPhoto size={18} />}
        >
          <Paper p="md" withBorder mb="xl">
            <Grid gutter="xl">
              <Grid.Col span={7}>
                <form>
                  <SimpleGrid cols={2} breakpoints={[{ maxWidth: 'sm', cols: 1 }]} spacing="md">
                    <TextInput
                      label="NFT Name"
                      placeholder="Enter NFT name"
                      required
                      {...form.getInputProps('name')}
                    />
                    
                    <TextInput
                      label="NFT Symbol"
                      placeholder="Enter NFT symbol"
                      required
                      maxLength={8}
                      {...form.getInputProps('symbol')}
                    />
                  </SimpleGrid>
                  
                  <Textarea
                    label="Description"
                    placeholder="Enter NFT description"
                    required
                    minRows={3}
                    mt="md"
                    {...form.getInputProps('description')}
                  />
                  
                  <FileInput
                    label="NFT Image"
                    placeholder="Upload NFT image"
                    accept="image/*"
                    icon={<IconUpload size={14} />}
                    mt="md"
                    onChange={handleImageUpload}
                    description="Upload a custom image for your NFT, or use the property image by default"
                  />
                  
                  <ColorInput
                    label="Background Color"
                    format="hex"
                    swatches={['#4DABF7', '#1971C2', '#228BE6', '#FA5252', '#7950F2', '#12B886', '#40C057', '#FD7E14']}
                    mt="md"
                    {...form.getInputProps('backgroundColor')}
                  />
                  
                  <Divider my="lg" label="NFT Attributes" labelPosition="center" />
                  
                  {form.values.attributes.map((attribute, index) => (
                    <Group key={index} mt="xs" spacing="xs" noWrap>
                      <TextInput
                        placeholder="Trait name"
                        style={{ flex: 1 }}
                        {...form.getInputProps(`attributes.${index}.trait_type`)}
                      />
                      <TextInput
                        placeholder="Value"
                        style={{ flex: 1 }}
                        {...form.getInputProps(`attributes.${index}.value`)}
                      />
                      <ActionIcon color="red" onClick={() => removeAttribute(index)}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  ))}
                  
                  <Button 
                    leftIcon={<IconPlus size={14} />} 
                    variant="outline" 
                    mt="md" 
                    onClick={addAttribute}
                    size="sm"
                  >
                    Add Attribute
                  </Button>
                </form>
              </Grid.Col>
              
              <Grid.Col span={5}>
                <Text weight={500} mb="md">NFT Preview</Text>
                {renderNFTPreview()}
              </Grid.Col>
            </Grid>
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
                Your property NFT has been successfully created on the Hedera blockchain.
              </Alert>
              
              <Title order={4} mb="md">NFT Information</Title>
              
              <SimpleGrid cols={2} breakpoints={[{ maxWidth: 'sm', cols: 1 }]} spacing="md">
                <Card withBorder p="md">
                  <Text weight={500}>Token ID</Text>
                  <Text>{nftData?.tokenId}</Text>
                </Card>
                
                <Card withBorder p="md">
                  <Text weight={500}>Serial Number</Text>
                  <Text>{nftData?.serialNumber}</Text>
                </Card>
                
                <Card withBorder p="md">
                  <Text weight={500}>NFT Name</Text>
                  <Text>{form.values.name}</Text>
                </Card>
                
                <Card withBorder p="md">
                  <Text weight={500}>NFT Symbol</Text>
                  <Text>{form.values.symbol}</Text>
                </Card>
              </SimpleGrid>
              
              <Group position="center" mt="xl">
                <Box style={{ maxWidth: 350 }}>
                  {renderNFTPreview()}
                </Box>
              </Group>
              
              <Text mt="xl" size="sm" color="dimmed">
                You can now manage your property NFT in the dashboard, including transferring ownership and viewing transaction history.
              </Text>
            </Paper>
          ) : (
            <Paper p="md" withBorder mb="xl">
              <Title order={4} mb="md">Review NFT Details</Title>
              
              <Grid>
                <Grid.Col span={7}>
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
                      <Text weight={500}>NFT Name</Text>
                      <Text>{form.values.name}</Text>
                    </Box>
                    
                    <Box>
                      <Text weight={500}>NFT Symbol</Text>
                      <Text>{form.values.symbol}</Text>
                    </Box>
                  </SimpleGrid>
                  
                  <Box mt="md">
                    <Text weight={500}>Description</Text>
                    <Text>{form.values.description}</Text>
                  </Box>
                  
                  <Box mt="md">
                    <Text weight={500}>Attributes</Text>
                    <Group spacing={5} mt={5}>
                      {form.values.attributes
                        .filter(attr => attr.trait_type && attr.value)
                        .map((attr, index) => (
                          <Badge key={index} color="blue" variant="light">
                            {attr.trait_type}: {attr.value}
                          </Badge>
                        ))}
                    </Group>
                  </Box>
                </Grid.Col>
                
                <Grid.Col span={5}>
                  {renderNFTPreview()}
                </Grid.Col>
              </Grid>
              
              {error && (
                <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mt="lg">
                  {error}
                </Alert>
              )}
              
              <Alert icon={<IconAlertCircle size={16} />} title="Important" color="yellow" mt="lg">
                By proceeding, you are creating an NFT representation of this property on the Hedera blockchain. This action cannot be undone.
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
        
        {active < 2 && (
          <Button onClick={nextStep}>
            Next
          </Button>
        )}
        
        {active === 2 && !success && (
          <Button 
            onClick={handleSubmit} 
            loading={loading}
            color="blue"
          >
            Create NFT
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

export default NFTStudio;
