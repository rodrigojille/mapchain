import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Title,
  Text,
  Button,
  Paper,
  Group,
  Accordion,
} from '@mantine/core';

interface FactorDetail {
  subfactor: string;
  impact: number;
  value: number;
}

interface FactorImpact {
  factor: string;
  impact: number;
  value: number;
  description: string;
  details: FactorDetail[];
}

interface FactorAnalysis {
  propertyId: string;
  currentValue: number;
  timeframe: number;
  forecastValue: number;
  factorImpact: FactorImpact[];
}

export default function PropertyFactorAnalysis() {
  const router = useRouter();
  const { id } = router.query;
  const [factorAnalysis, setFactorAnalysis] = useState<FactorAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchFactorAnalysis();
    }
  }, [id]);

  const fetchFactorAnalysis = () => {
    setLoading(true);
    
    fetch('/api/forecast/factors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        propertyId: id,
        timeframe: 5
      }),
    })
      .then(res => res.json())
      .then(data => {
        setFactorAnalysis(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching factor analysis:', err);
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

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(0)}%`;
  };

  if (!factorAnalysis) {
    return (
      <Container size="lg" py="xl">
        <Paper p="md" withBorder>
          <Title order={1} mb="md">Factor Impact Analysis</Title>
          {loading ? (
            <Text>Loading factor analysis...</Text>
          ) : (
            <Group>
              <Button onClick={fetchFactorAnalysis}>Factor Impact Analysis</Button>
            </Group>
          )}
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Paper p="md" withBorder mb="xl">
        <Title order={1} mb="md">Factor Impact Analysis</Title>
        <Text mb="xl">
          Detailed breakdown of factors affecting the {formatCurrency(factorAnalysis.forecastValue)} forecast value
        </Text>

        <Accordion>
          {factorAnalysis.factorImpact.map((factor, index) => (
            <Accordion.Item key={index} value={factor.factor}>
              <Accordion.Control>
                <Text>
                  {factor.factor}: {formatCurrency(factor.value)} ({formatPercentage(factor.impact)})
                </Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Text mb="md">{factor.description}</Text>
                
                {factor.details.map((detail, detailIndex) => (
                  <div key={detailIndex}>
                    <Text>
                      {detail.subfactor}: {formatCurrency(detail.value)} ({formatPercentage(detail.impact)})
                    </Text>
                  </div>
                ))}
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>

        <Group mt="xl">
          <Button onClick={() => router.push('/forecast')}>
            Back to Forecast
          </Button>
        </Group>
      </Paper>
    </Container>
  );
}
