import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Title,
  Text,
  Button,
  Select,
  Paper,
  Group,
  NumberInput,
} from '@mantine/core';

interface Property {
  id: string;
  address: {
    line1: string;
    city: string;
    state: string;
    zipCode: string;
  };
  currentValue: number;
  lastValuationDate: string;
}

interface Forecast {
  propertyId: string;
  currentValue: number;
  timeframe: number;
  forecastValue: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  growthRate: number;
  factorImpact: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
  monthlyProjection?: Array<{
    month: number;
    value: number;
  }>;
  yearlyProjection?: Array<{
    year: number;
    value: number;
  }>;
}

interface ComparisonResult {
  propertyId: string;
  aiCurrentValue: number;
  professionalCurrentValue: number;
  timeframe: number;
  aiForecastValue: number;
  professionalForecastValue: number;
  difference: number;
  percentageDifference: number;
  yearlyProjection: Array<{
    year: number;
    aiValue: number;
    professionalValue: number;
  }>;
}

export default function PropertyForecastPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [timeframe, setTimeframe] = useState<string>('1');
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch user properties
    fetch('/api/user/properties')
      .then(res => res.json())
      .then(data => {
        setProperties(data);
        if (data.length > 0) {
          setSelectedPropertyId(data[0].id);
        }
      })
      .catch(err => console.error('Error fetching properties:', err));
  }, []);

  const handleGenerateForecast = () => {
    setLoading(true);
    
    fetch('/api/forecast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        propertyId: selectedPropertyId,
        timeframe: parseInt(timeframe)
      }),
    })
      .then(res => res.json())
      .then(data => {
        setForecast(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error generating forecast:', err);
        setLoading(false);
      });
  };

  const handleGenerateComparison = () => {
    setLoading(true);
    
    fetch('/api/forecast/compare', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        propertyId: selectedPropertyId,
        timeframe: parseInt(timeframe)
      }),
    })
      .then(res => res.json())
      .then(data => {
        setComparison(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error generating comparison:', err);
        setLoading(false);
      });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="md">Property Value Forecast</Title>
      <Text mb="xl">Select a property to forecast its future value</Text>

      <Paper p="md" withBorder mb="xl">
        <Group mb="md">
          <Select
            label="Select Property"
            placeholder="Choose a property"
            data={properties.map(p => ({ value: p.id, label: p.address.line1 }))}
            value={selectedPropertyId}
            onChange={(value) => setSelectedPropertyId(value || '')}
            name="propertyId"
            style={{ minWidth: 250 }}
          />
          
          <Select
            label="Timeframe"
            placeholder="Select timeframe"
            data={[
              { value: '1', label: '1 Year' },
              { value: '5', label: '5 Years' },
              { value: '10', label: '10 Years' },
            ]}
            value={timeframe}
            onChange={(value) => setTimeframe(value || '1')}
            name="timeframe"
            style={{ minWidth: 150 }}
          />
        </Group>

        <Group>
          <Button onClick={handleGenerateForecast} loading={loading}>
            Generate Forecast
          </Button>
          
          <Button onClick={handleGenerateComparison} loading={loading}>
            Generate Comparison
          </Button>
          
          <Button onClick={() => router.push(`/forecast/${selectedPropertyId}`)}>
            Factor Impact Analysis
          </Button>
        </Group>
      </Paper>

      {forecast && (
        <Paper p="md" withBorder mb="xl">
          <Title order={2} mb="md">Forecast Results</Title>
          
          <Text size="lg" mb="sm">Forecast Value: {formatCurrency(forecast.forecastValue)}</Text>
          <Text size="lg" mb="sm">Growth Rate: {forecast.growthRate}%</Text>
          <Text size="lg" mb="sm">
            Confidence Interval: {formatCurrency(forecast.confidenceInterval.lower)} - {formatCurrency(forecast.confidenceInterval.upper)}
          </Text>
          
          <Title order={3} mt="xl" mb="md">Impact Factors</Title>
          {forecast.factorImpact.map((factor, index) => (
            <div key={index}>
              <Text mb="xs">{factor.factor}: {(factor.impact * 100).toFixed(0)}%</Text>
              <Text size="sm" color="dimmed" mb="sm">{factor.description}</Text>
            </div>
          ))}
        </Paper>
      )}

      {comparison && (
        <Paper p="md" withBorder mb="xl">
          <Title order={2} mb="md">Comparison Results</Title>
          
          <Text size="lg" mb="sm">AI Forecast: {formatCurrency(comparison.aiForecastValue)}</Text>
          <Text size="lg" mb="sm">Professional Forecast: {formatCurrency(comparison.professionalForecastValue)}</Text>
          <Text size="lg" mb="sm">
            Difference: {formatCurrency(comparison.difference)} ({comparison.percentageDifference.toFixed(1)}%)
          </Text>
          
          <Title order={3} mt="xl" mb="md">5-Year Value Projection</Title>
          <Text mb="md">AI Valuation</Text>
          <Text mb="md">Professional Valuation</Text>
        </Paper>
      )}
    </Container>
  );
}
