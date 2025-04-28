import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Grid,
  Card,
  Stack,
  Group,
  Button,
  Badge,
  Tabs,
  Progress,
  Center,
  Image,
  Divider,
  ScrollArea,
  Flex,
  Box
} from '@mantine/core';
import { IconHome, IconChartLine, IconMapPin, IconCalendar, IconUser } from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';
import { ForecastService } from '../../services/ForecastService';
import type { PropertyForecast } from '../../services/types';

// Types
interface PropertyData {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  yearBuilt: number;
  propertyType: string;
}

interface ForecastParams {
  propertyId: string;
  timeframe: number;
  includeMarketFactors?: boolean;
  includeNeighborhoodTrends?: boolean;
  includeEconomicIndicators?: boolean;
}

interface ForecastPanelProps {
  forecastType: 'short_term' | 'long_term';
  forecast: PropertyForecast | null;
  loading: boolean;
  handleGenerateForecast: (forecastType: 'short_term' | 'long_term') => void;
}

const ForecastPanel: React.FC<ForecastPanelProps> = ({
  forecastType,
  forecast,
  loading,
  handleGenerateForecast,
}) => {
  return (
    <Stack>
      <Button
        fullWidth
        size="lg"
        onClick={() => handleGenerateForecast(forecastType)}
        loading={loading}
      >
        Generate {forecastType.charAt(0).toUpperCase() + forecastType.slice(1)} Forecast
      </Button>

      {forecast && (
        <Stack>
          <Group align="center">
            <Text size="lg">
              Current Value
            </Text>
            <Badge color="blue">
              ${forecast.currentValue.toLocaleString()}
            </Badge>
          </Group>

          <Group align="center">
            <Text size="lg">
              Predicted Value
            </Text>
            <Badge
              color={forecast.growthRate >= 0 ? "green" : "red"}
              variant="light"
            >
              ${forecast.forecastValue.toLocaleString()}
            </Badge>
          </Group>

          <Text size="lg" mb="sm">
            Impact Factors
          </Text>

          <Stack>
            {forecast.factorImpact.map((factor) => (
              <Group key={factor.factor} align="center">
                <Text size="sm">
                  {factor.factor}
                </Text>
                <Progress
                  value={factor.impact * 100}
                  size="xs"
                />
                <Text size="sm">
                  {Math.round(factor.impact * 100)}%
                </Text>
              </Group>
            ))}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};

export default function PropertyForecast() {
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertyData | null>(null);
  const [forecast, setForecast] = useState<PropertyForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Fetch properties when component mounts
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await ForecastService.getProperties();
        setProperties(data);
      } catch (err) {
        setError('Failed to fetch properties');
      }
    };

    if (isAuthenticated) {
      fetchProperties();
    }
  }, [isAuthenticated]);

  // Handle property selection
  const handlePropertySelect = (property: PropertyData) => {
    setSelectedProperty(property);
    setForecast(null);
    setError(null);
  };

  // Handle forecast generation
  const handleGenerateForecast = async (forecastType: 'short_term' | 'long_term') => {
    if (!selectedProperty) return;

    try {
      setLoading(true);
      const params: ForecastParams = {
        propertyId: selectedProperty.id,
        timeframe: forecastType === 'short_term' ? 1 : 5,
        includeMarketFactors: true,
        includeNeighborhoodTrends: true,
        includeEconomicIndicators: true
      };

      const result = await ForecastService.generateForecast(params);
      setForecast(result);
      setError(null);
    } catch (err) {
      setError('Failed to generate forecast');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Container size="lg" py="xl">
        <Title order={2} mb="md">
          Please login to access property forecasts
        </Title>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="md">
        Select a property to forecast
      </Title>

      <Grid>
        <Grid.Col span={12}>
          <Card withBorder radius="md" p="xl" mb="xl">
            <Title order={3} mb="md">
              Your Properties
            </Title>

            <ScrollArea h={400}>
              <Stack>
                {properties.map((property) => (
                  <Card
                    key={property.id}
                    withBorder
                    radius="sm"
                    p="md"
                    onClick={() => handlePropertySelect(property)}
                    style={{
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      transform: selectedProperty?.id === property.id ? 'scale(1.02)' : 'scale(1)'
                    }}
                  >
                    <Group mb="xs">
                      <Text size="lg">
                        {property.address}
                      </Text>
                      <Badge color="blue">${property.price.toLocaleString()}</Badge>
                    </Group>

                    <Group>
                      <Group>
                        <IconHome size={16} />
                        <Text size="sm">{property.bedrooms} beds</Text>
                      </Group>
                      <Group>
                        <IconUser size={16} />
                        <Text size="sm">{property.bathrooms} baths</Text>
                      </Group>
                      <Group>
                        <IconMapPin size={16} />
                        <Text size="sm">{property.city}, {property.state}</Text>
                      </Group>
                    </Group>
                  </Card>
                ))}
              </Stack>
            </ScrollArea>
          </Card>
        </Grid.Col>

        <Grid.Col span={12}>
          {selectedProperty ? (
            <Card withBorder radius="md" p="xl" mb="xl">
              <Title order={3} mb="md">
                Property Details
              </Title>

              <Group mb="xl">
                <Text size="lg">
                  {selectedProperty.address}
                </Text>
                <Badge color="blue">
                  ${selectedProperty.price.toLocaleString()}
                </Badge>
              </Group>

              <Divider mb="xl" />

              <Tabs defaultValue="short_term">
                <Tabs.List>
                  <Tabs.Tab value="short_term" leftSection={<IconChartLine size={16} />}>Short Term</Tabs.Tab>
                  <Tabs.Tab value="long_term" leftSection={<IconCalendar size={16} />}>Long Term</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="short_term">
                  <ForecastPanel
                    forecastType="short_term"
                    forecast={forecast}
                    loading={loading}
                    handleGenerateForecast={handleGenerateForecast}
                  />
                </Tabs.Panel>

                <Tabs.Panel value="long_term">
                  <ForecastPanel
                    forecastType="long_term"
                    forecast={forecast}
                    loading={loading}
                    handleGenerateForecast={handleGenerateForecast}
                  />
                </Tabs.Panel>
              </Tabs>
            </Card>
          ) : (
            <Center>
              <Text size="lg" color="dimmed">
                Select a property to view its forecast
              </Text>
            </Center>
          )}
        </Grid.Col>
      </Grid>
    </Container>
  );
}
