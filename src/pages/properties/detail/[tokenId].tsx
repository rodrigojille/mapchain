import React from 'react';
import { NextPage } from 'next';
import {
  Container,
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Badge,
  Grid,
  Image,
  Button,
  Alert,
  Divider,
  Card,
  List,
} from '@mantine/core';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import { IconAlertCircle, IconCopy, IconExternalLink } from '@tabler/icons-react';

const PropertyDetailPage: NextPage = () => {
  const router = useRouter();
  const { tokenId } = router.query;
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [property, setProperty] = React.useState<any>(null);

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/properties/${tokenId}`);
        const data = await response.json();

        if (data.success) {
          setProperty(data.property);
        } else {
          setError(data.error || 'Failed to fetch property details');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching property details');
      } finally {
        setLoading(false);
      }
    };

    if (tokenId) {
      fetchPropertyDetails();
    }
  }, [tokenId, isAuthenticated, router]);

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Paper radius="md" p="xl" withBorder>
          <Text align="center">Loading property details...</Text>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
          {error}
        </Alert>
      </Container>
    );
  }

  if (!property) {
    return (
      <Container size="xl" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="yellow" title="Not Found">
          Property not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Grid>
          <Grid.Col md={6}>
            <Stack spacing="md">
              <Title order={2}>{property.name}</Title>
              
              <Group>
                <Badge color="blue" size="lg">
                  Token ID: {property.tokenId}
                </Badge>
                <Badge color="green" size="lg">
                  {property.symbol}
                </Badge>
              </Group>

              <Text size="lg">{property.description}</Text>

              <Card withBorder>
                <Stack spacing="xs">
                  <Title order={4}>Token Details</Title>
                  <Group position="apart">
                    <Text color="dimmed">Total Supply:</Text>
                    <Text weight={500}>{property.totalSupply} tokens</Text>
                  </Group>
                  <Group position="apart">
                    <Text color="dimmed">Price per Share:</Text>
                    <Text weight={500}>${property.pricePerShare}</Text>
                  </Group>
                  <Group position="apart">
                    <Text color="dimmed">Total Value:</Text>
                    <Text weight={500}>${property.totalValue}</Text>
                  </Group>
                </Stack>
              </Card>

              <Card withBorder>
                <Stack spacing="xs">
                  <Title order={4}>Property Features</Title>
                  <List>
                    <List.Item>
                      <Group position="apart">
                        <Text>Location:</Text>
                        <Text weight={500}>{property.location.address}</Text>
                      </Group>
                    </List.Item>
                    <List.Item>
                      <Group position="apart">
                        <Text>Property Type:</Text>
                        <Text weight={500}>{property.features.propertyType}</Text>
                      </Group>
                    </List.Item>
                    <List.Item>
                      <Group position="apart">
                        <Text>Size:</Text>
                        <Text weight={500}>{property.features.squareFootage} sq ft</Text>
                      </Group>
                    </List.Item>
                    <List.Item>
                      <Group position="apart">
                        <Text>Bedrooms:</Text>
                        <Text weight={500}>{property.features.bedrooms}</Text>
                      </Group>
                    </List.Item>
                    <List.Item>
                      <Group position="apart">
                        <Text>Bathrooms:</Text>
                        <Text weight={500}>{property.features.bathrooms}</Text>
                      </Group>
                    </List.Item>
                    <List.Item>
                      <Group position="apart">
                        <Text>Year Built:</Text>
                        <Text weight={500}>{property.features.yearBuilt}</Text>
                      </Group>
                    </List.Item>
                  </List>
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>

          <Grid.Col md={6}>
            <Stack spacing="md">
              {property.images && property.images.length > 0 && (
                <Image
                  src={property.images[0]}
                  alt={property.name}
                  radius="md"
                  height={300}
                  fit="cover"
                />
              )}

              <Card withBorder>
                <Stack spacing="xs">
                  <Title order={4}>Latest Valuation</Title>
                  <Group position="apart">
                    <Text color="dimmed">Amount:</Text>
                    <Text weight={500}>${property.valuation.amount}</Text>
                  </Group>
                  <Group position="apart">
                    <Text color="dimmed">Date:</Text>
                    <Text weight={500}>{new Date(property.valuation.date).toLocaleDateString()}</Text>
                  </Group>
                  <Group position="apart">
                    <Text color="dimmed">Valuator:</Text>
                    <Text weight={500}>{property.valuation.valuator}</Text>
                  </Group>
                  <Group position="apart">
                    <Text color="dimmed">Method:</Text>
                    <Text weight={500}>{property.valuation.method}</Text>
                  </Group>
                </Stack>
              </Card>

              <Card withBorder>
                <Stack spacing="xs">
                  <Title order={4}>Documents</Title>
                  <List>
                    {property.documents.map((doc: any, index: number) => (
                      <List.Item key={index}>
                        <Group position="apart">
                          <Text>{doc.title}</Text>
                          <Button
                            variant="light"
                            compact
                            rightIcon={<IconExternalLink size={16} />}
                            component="a"
                            href={doc.url}
                            target="_blank"
                          >
                            View
                          </Button>
                        </Group>
                      </List.Item>
                    ))}
                  </List>
                </Stack>
              </Card>

              {user?.role === 'PROPERTY_OWNER' && (
                <>
                  <Divider />
                  <Group position="center">
                    <Button
                      onClick={() => router.push(`/properties/${tokenId}/transfer`)}
                    >
                      Transfer Shares
                    </Button>
                    <Button
                      onClick={() => router.push(`/properties/${tokenId}/mint`)}
                      variant="light"
                    >
                      Mint Additional Shares
                    </Button>
                  </Group>
                </>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </Paper>
    </Container>
  );
};

export default PropertyDetailPage;
