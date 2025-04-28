import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Container, 
  Grid, 
  Paper, 
  Title, 
  Text, 
  Button, 
  Group, 
  Tabs, 
  Loader, 
  Card, 
  Badge,
  Image,
  List,
  ThemeIcon,
  Divider,
  Box,
  SimpleGrid,
  Progress,
  Stack
} from '@mantine/core';
import { useAuth } from '../../providers/AuthProvider';
import { UserRole, AuthMethod } from '../../services/auth';
import { PropertyData, getPropertyById } from '../../services/propertyApi';
import { AIValuationService } from '../../services/AIValuation';
import { useHederaContract } from '../../hooks/useHederaContract';
import { IconCheck, IconHome, IconChartBar, IconHistory, IconMap, IconCoin, IconFileReport } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import ValuationReport from '../../components/valuation/ValuationReport';
import { useTranslation } from '../../hooks/useTranslation';

import DashboardNavBar from '../../components/dashboard/DashboardNavBar';

import DashboardNavBar from '../../components/dashboard/DashboardNavBar';

function PropertyPage() {
  const router = useRouter();
  const { id } = router.query;
  const auth = useAuth();
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestingValuation, setIsRequestingValuation] = useState(false);
  const [aiValuation, setAiValuation] = useState<any>(null);
  const [valuationHistory, setValuationHistory] = useState<any[]>([]);
  const hederaContract = useHederaContract();
  const { t } = useTranslation();

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getPropertyById(id as string).then((data) => {
      setProperty(data);
      setIsLoading(false);
      // Fetch AI valuation and history if needed
    });
  }, [id]);

  const handleRequestValuation = async () => {
    if (!auth.isAuthenticated) {
      router.push(`/auth/login?redirect=/properties/${id}`);
      return;
    }
    
    router.push(`/valuations/request?propertyId=${id}`);
  };

  const handleTokenizeProperty = async () => {
    if (!property) return;
    
    try {
      setIsRequestingValuation(true);
      
      // Create property metadata
      const metadata = JSON.stringify({
        address: property.address,
        location: property.location,
        features: property.features,
        images: property.images,
        lastValuation: property.valuation.value
      });
      
      // Create NFT for the property
      const tokenId = await hederaContract.createValuationToken(
        `Property ${property.address.line1}`,
        `PROP${property.id.substring(0, 4).toUpperCase()}`
      );
      
      if (tokenId) {
        // Mint the NFT with property metadata
        await hederaContract.mintValuationToken(tokenId, metadata);
        
        alert(`Property successfully tokenized! Token ID: ${tokenId}`);
      }
    } catch (error) {
      console.error('Error tokenizing property:', error);
      alert('Failed to tokenize property. Please try again.');
    } finally {
      setIsRequestingValuation(false);
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
        <Container size="lg" py="xl" style={{ textAlign: 'center' }}>
          <Loader size="xl" />
          <Text mt="md">Loading property details...</Text>
        </Container>
      </>
    );
  }

  if (!property) {
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
        <Container size="lg" py="xl" style={{ textAlign: 'center' }}>
          <Title order={2}>Property Not Found</Title>
          <Text mt="md">The property you're looking for doesn't exist or has been removed.</Text>
          <Button mt="xl" onClick={() => router.push('/properties')}>
            View All Properties
          </Button>
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
      <Container size="lg" py="xl">
        <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper p={0} withBorder style={{ overflow: 'hidden' }}>
            <Image
              src={property.images?.[0] || 'https://placehold.co/800x400?text=Property+Image'}
              height={400}
              alt={property.address.line1}
            />
            
            <Box p="md">
              <Title order={2}>{property.address.line1}</Title>
              <Text size="lg">
                {property.address.city}, {property.address.state} {property.address.zipCode}
              </Text>
              
              <Group justify="space-between" mt="md">
                <div>
                  <Text size="sm" c="dimmed">Current Valuation</Text>
                  <Text size="xl" fw={700} c="blue">
                    ${property.valuation.value.toLocaleString()}
                  </Text>
                </div>
                
                <div>
                  <Text size="sm" c="dimmed" ta="right">Rent Estimate</Text>
                  <Text size="xl" fw={700} ta="right">
                    ${property.valuation.rentEstimate.toLocaleString()}/mo
                  </Text>
                </div>
              </Group>
            </Box>
          </Paper>
          
          <Tabs defaultValue="details" mt="xl">
            <Tabs.List grow>
              <Tabs.Tab value="details" leftSection={<IconHome size={14} />}>{t('property.details')}</Tabs.Tab>
              <Tabs.Tab value="valuation" leftSection={<IconChartBar size={14} />}>{t('property.valuation')}</Tabs.Tab>
              <Tabs.Tab value="history" leftSection={<IconHistory size={14} />}>{t('property.history')}</Tabs.Tab>
              <Tabs.Tab value="map" leftSection={<IconMap size={14} />}>{t('property.map')}</Tabs.Tab>
              <Tabs.Tab value="blockchain" leftSection={<IconCoin size={14} />}>{t('property.blockchain')}</Tabs.Tab>
              <Tabs.Tab value="reports" leftSection={<IconFileReport size={14} />}>Reports</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="details" pt="md">
              <Paper p="md" withBorder>
                <Title order={3} mb="md">Property Features</Title>
                
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <div>
                    <Text fw={500} mb="xs">Basic Information</Text>
                    <List spacing="xs" size="sm">
                      <List.Item>Property Type: {property.features?.propertyType || 'Residential'}</List.Item>
                      <List.Item>Year Built: {property.features?.yearBuilt || '2005'}</List.Item>
                      <List.Item>Lot Size: {property.features?.lotSize || '0.25'} acres</List.Item>
                      <List.Item>Square Feet: {property.features?.squareFootage || '2,200'}</List.Item>
                    </List>
                  </div>
                  
                  <div>
                    <Text fw={500} mb="xs">Interior Features</Text>
                    <List spacing="xs" size="sm">
                      <List.Item>Bedrooms: {property.features?.bedrooms || '3'}</List.Item>
                      <List.Item>Bathrooms: {property.features?.bathrooms || '2.5'}</List.Item>
                      <List.Item>Garage: {'2-car attached'}</List.Item>
                      <List.Item>Basement: {'Yes'}</List.Item>
                    </List>
                  </div>
                </SimpleGrid>
                
                <Divider my="md" />
                
                <Text fw={500} mb="xs">Additional Features</Text>
                <List
                  spacing="xs"
                  size="sm"
                  icon={
                    <ThemeIcon color="blue" size={20} radius="xl">
                      <IconCheck size={12} />
                    </ThemeIcon>
                  }
                >
                  {([
                    'Central Air Conditioning',
                    'Hardwood Floors',
                    'Updated Kitchen',
                    'Fenced Backyard',
                    'Deck/Patio'
                  ]).map((feature: string, index: number) => (
                    <List.Item key={index}>{feature}</List.Item>
                  ))}
                </List>
              </Paper>
            </Tabs.Panel>

            <Tabs.Panel value="valuation" pt="md">
              <Paper p="md" withBorder>
                <Title order={3} mb="md">Property Valuation Analysis</Title>
                
                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Card withBorder p="md">
                      <Text fw={500} size="lg">AI Valuation</Text>
                      <Text size="xl" fw={700} c="blue" mt="xs">
                        ${aiValuation?.value.toLocaleString() || property.valuation.value.toLocaleString()}
                      </Text>
                      <Text size="xs" color="dimmed">
                        Generated on {new Date().toLocaleDateString()}
                      </Text>
                      
                      <Text mt="md" fw={500}>Confidence Score</Text>
                      <Group justify="space-between" gap="xs">
                        <Text size="sm">Low</Text>
                        <Text size="sm">High</Text>
                      </Group>
                      <Progress 
                        value={(aiValuation?.confidence || 0.85) * 100} 
                        color="blue" 
                        size="lg" 
                      />
                      
                      <Button variant="light" fullWidth mt="lg">
                        View Full AI Report
                      </Button>
                    </Card>
                  </Grid.Col>
                  
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Card withBorder p="md">
                      <Text fw={500} size="lg">Official Valuation</Text>
                      {valuationHistory.find(v => v.type === 'official') ? (
                        <>
                          <Text size="xl" fw={700} c="green" mt="xs">
                            ${valuationHistory.find(v => v.type === 'official')?.value.toLocaleString()}
                          </Text>
                          <Text size="xs" c="dimmed">
                            Certified by {valuationHistory.find(v => v.type === 'official')?.valuator} on {
                              new Date(valuationHistory.find(v => v.type === 'official')?.date).toLocaleDateString()
                            }
                          </Text>
                          
                          <Button variant="light" fullWidth mt="lg">
                            View Official Report
                          </Button>
                        </>
                      ) : (
                        <>
                          <Text c="dimmed" mt="xs">
                            No official valuation has been performed yet.
                          </Text>
                          
                          <Button 
                            fullWidth 
                            mt="lg"
                            loading={isRequestingValuation}
                            onClick={handleRequestValuation}
                          >
                            Request Official Valuation
                          </Button>
                        </>
                      )}
                    </Card>
                  </Grid.Col>
                </Grid>
                
                <Title order={4} mt="xl" mb="md">Valuation Factors</Title>
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  {Object.entries(aiValuation?.factors || {
                    location: 0.4,
                    size: 0.3,
                    condition: 0.2,
                    market: 0.1
                  }).map(([factor, weight]) => (
                    <div key={factor}>
                      <Group justify="space-between">
                        <Text tt="capitalize">{factor}</Text>
                        <Text fw={500}>{(Number(weight) * 100).toFixed(0)}%</Text>
                      </Group>
                      <Progress value={Number(weight) * 100} size="sm" mt={5} />
                    </div>
                  ))}
                </SimpleGrid>
              </Paper>
            </Tabs.Panel>

            <Tabs.Panel value="history" pt="md">
              <Paper p="md" withBorder>
                <Title order={3} mb="md">Valuation History</Title>
                
                {valuationHistory.length > 0 ? (
                  <List spacing="lg">
                    {valuationHistory.map((item, index) => (
                      <List.Item key={index}>
                        <Card withBorder p="sm">
                          <Group justify="space-between">
                            <div>
                              <Text fw={500}>
                                ${item.value.toLocaleString()}
                                {' '}
                                <Badge 
                                  color={
                                    item.type === 'official' ? 'green' : 
                                    item.type === 'ai' ? 'blue' : 
                                    'gray'
                                  }
                                  size="sm"
                                >
                                  {item.type === 'official' ? 'OFFICIAL' : 
                                   item.type === 'ai' ? 'AI' : 
                                   'SALE'}
                                </Badge>
                              </Text>
                              <Text size="sm" c="dimmed">
                                {new Date(item.date).toLocaleDateString()}
                              </Text>
                            </div>
                            
                            {item.type === 'official' && (
                              <Text size="sm">
                                Valuator: {item.valuator}
                              </Text>
                            )}
                            
                            {item.type === 'sale' && (
                              <Text size="sm">
                                Sale Price
                              </Text>
                            )}
                          </Group>
                        </Card>
                      </List.Item>
                    ))}
                  </List>
                ) : (
                  <Text c="dimmed">No valuation history available for this property.</Text>
                )}
              </Paper>
            </Tabs.Panel>

            <Tabs.Panel value="map" pt="md">
              <Paper p="md" withBorder>
                <Title order={3} mb="md">Property Location</Title>
                
                <div style={{ height: '400px', marginBottom: '1rem' }}>
                  <MapWithNoSSR 
                    center={[property.location.lat, property.location.lng]} 
                    zoom={15}
                    properties={[{
                      tokenId: '0.0.12345',
                      title: property.address.line1,
                      size: property.features.squareFootage,
                      price: property.valuation.value,
                      landType: "residential",
                      owner: 'current-user',
                      metadata: JSON.stringify(property),
                      address: {
                        street: property.address.line1,
                        city: property.address.city,
                        coordinates: {
                          latitude: property.location.lat,
                          longitude: property.location.lng
                        }
                      },
                      images: property.images
                    }]}
                  />
                </div>
                
                <Group justify="space-between">
                  <div>
                    <Text fw={500}>Address</Text>
                    <Text>
                      {property.address.line1}, {property.address.city}, {property.address.state} {property.address.zipCode}
                    </Text>
                  </div>
                  
                  <Button variant="light">
                    Get Directions
                  </Button>
                </Group>
              </Paper>
            </Tabs.Panel>

            <Tabs.Panel value="blockchain" pt="md">
              <Paper p="md" withBorder>
                <Title order={3} mb="md">Blockchain Information</Title>
                
                {true ? (
                  <>
                    <Text>This property has been tokenized on the Hedera blockchain.</Text>
                    
                    <Group mt="lg" justify="flex-start">
                      <div>
                        <Text fw={500}>Token ID</Text>
                        <Text>0.0.12345</Text>
                      </div>
                      
                      <div>
                        <Text fw={500}>Token Type</Text>
                        <Text>Non-Fungible Token (NFT)</Text>
                      </div>
                    </Group>
                    
                    <Button 
                      mt="xl"
                      variant="light"
                      component="a"
                      href="https://hashscan.io/testnet/token/0.0.12345"
                      target="_blank"
                    >
                      View on HashScan
                    </Button>
                  </>
                ) : (
                  <>
                    <Text>This property has not been tokenized on the blockchain yet.</Text>
                    <Text size="sm" c="dimmed" mt="xs">
                      Tokenizing your property creates a digital representation on the Hedera blockchain,
                      providing a transparent and immutable record of ownership and valuation history.
                    </Text>
                    
                    <Button 
                      mt="xl"
                      onClick={handleTokenizeProperty}
                      loading={isRequestingValuation}
                    >
                      Tokenize Property
                    </Button>
                  </>
                )}
              </Paper>
            </Tabs.Panel>
            <Tabs.Panel value="reports" pt="xs">
              <Paper p="md" withBorder>
                <Title order={3} mb="md">Valuation Reports</Title>
                
                <Text mb="lg">
                  Download, print or share official valuation reports for this property. These reports are secured on the Hedera blockchain for authenticity verification.
                </Text>
                
                <SimpleGrid cols={1} spacing="md">
                  {/* AI Valuation Report */}
                  <ValuationReport
                    property={property}
                    valuationAmount={property.valuation.value}
                    valuationDate={new Date().toISOString()}
                    isOfficial={false}
                    confidenceScore={0.92}
                    factors={{
                      location: 0.35,
                      size: 0.25,
                      condition: 0.15,
                      market: 0.25
                    }}
                    methodology="This AI valuation uses a proprietary algorithm that analyzes comparable properties, historical sales data, and market trends to provide an estimated property value."
                  />
                  
                  {/* Official Valuation Report (if available) */}
                  {valuationHistory.some(v => v.type === 'official') && (
                    <ValuationReport
                      property={property}
                      valuationAmount={valuationHistory.find(v => v.type === 'official')?.value || 0}
                      valuationDate={valuationHistory.find(v => v.type === 'official')?.date || ''}
                      isOfficial={true}
                      valuator={{
                        id: 'val123',
                        name: valuationHistory.find(v => v.type === 'official')?.valuator || 'John Smith',
                        email: 'john.smith@valuators.com',
                        role: UserRole.VALUATOR,
                        authMethod: AuthMethod.EMAIL,
                        createdAt: new Date().toISOString(),
                        isEmailVerified: true,
                        walletAddresses: []
                      }}
                      tokenId="0.0.1234567"
                      notes="This property was inspected on-site and valuation was performed according to industry standards and local market conditions."
                    />
                  )}
                </SimpleGrid>
              </Paper>
            </Tabs.Panel>
          </Tabs>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="md" withBorder>
            <Title order={3} mb="md">Actions</Title>
            
            <Button fullWidth mb="md" onClick={handleRequestValuation}>
              {t('property.request')}
            </Button>
            
            <Button fullWidth mb="md" variant="outline" onClick={() => router.push(`/forecast?propertyId=${property.id}`)}>
              {t('forecast.title')}
            </Button>
            
            <Button fullWidth mb="md" variant="subtle" onClick={() => router.push(`/properties/${property.id}?tab=reports`)}>
              {t('valuation.download')}
            </Button>
            
            <Divider my="xl" label="Quick Info" labelPosition="center" />
            
            <List spacing="md">
              <List.Item>
                <Text fw={500}>Last Sale Price</Text>
                <Text>
                  ${(property.valuation.value * 0.85).toLocaleString()} 
                  <Text component="span" size="xs" c="dimmed"> (2 years ago)</Text>
                </Text>
              </List.Item>
              
              <List.Item>
                <Text fw={500}>Property Taxes</Text>
                <Text>
                  ${(property.valuation.value * 0.012).toLocaleString()} 
                  <Text component="span" size="xs" c="dimmed"> per year</Text>
                </Text>
              </List.Item>
              
              <List.Item>
                <Text fw={500}>Neighborhood Average</Text>
                <Text>
                  ${(property.valuation.value * 1.05).toLocaleString()}
                </Text>
              </List.Item>
              
              <List.Item>
                <Text fw={500}>Price per Sq Ft</Text>
                <Text>
                  ${Math.round(property.valuation.value / (property.features?.squareFootage || 2200)).toLocaleString()}
                </Text>
              </List.Item>
            </List>
          </Paper>
          
          <Paper p="md" withBorder mt="xl">
            <Title order={3} mb="md">Similar Properties</Title>
            
            <Stack gap="md">
              {[1, 2, 3].map((i) => (
                <Card key={i} p="sm" withBorder>
                  <Group wrap="nowrap" gap="sm">
                    <Image
                      src={`https://placehold.co/100x100?text=Property+${i}`}
                      width={80}
                      height={80}
                      radius="md"
                    />
                    <div>
                      <Text fw={500} size="sm">
                        {property.address.city} Property {i}
                      </Text>
                      <Text size="xs" color="dimmed">
                        {3 + i} bed, {2 + (i % 2)} bath
                      </Text>
                      <Text fw={500} size="sm" mt={5}>
                        ${(property.valuation.value * (0.9 + i * 0.1)).toLocaleString()}
                      </Text>
                    </div>
                  </Group>
                </Card>
              ))}
            </Stack>
            
            <Button fullWidth variant="subtle" mt="md">
              View More Similar Properties
            </Button>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}


