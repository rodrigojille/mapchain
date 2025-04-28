import React, { useState, useEffect } from 'react';
import { Paper, Text, Title, Group, Badge, Loader, Button, Box, Accordion, ThemeIcon, List, Divider, Progress } from '@mantine/core';
import { IconBrain, IconChartLine, IconCoin, IconBuildingBank, IconArrowUpRight, IconChartPie, IconX } from '@tabler/icons-react';
import { getCompletePropertyInsights } from '../services/aiService';
import { motion } from 'framer-motion';

interface PropertyInsightsProps {
  propertyId: string;
  propertyData: any;
  onClose?: () => void;
}

export function PropertyInsights({ propertyId, propertyData, onClose }: PropertyInsightsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [valuation, setValuation] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      setError(null);
      try {
        const { valuation: valuationData, analysis: analysisData } = await getCompletePropertyInsights(propertyId, propertyData);
        setValuation(valuationData);
        setAnalysis(analysisData);
      } catch (err) {
        console.error('Error fetching property insights:', err);
        setError('Failed to load property insights. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (propertyId && propertyData) {
      fetchInsights();
    }
  }, [propertyId, propertyData]);

  if (loading) {
    return (
      <Paper p="xl" radius="md" withBorder style={{ background: 'linear-gradient(135deg, #0f1218 0%, #1c2331 100%)', borderColor: 'var(--dark-border)' }}>
        <Group justify="center" gap="md" style={{ minHeight: 200, flexDirection: 'column' }}>
          <Loader size="md" />
          <Text style={{ color: 'var(--text-secondary)' }}>Analyzing property with Nebius AI...</Text>
        </Group>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper p="xl" radius="md" withBorder style={{ background: 'linear-gradient(135deg, #0f1218 0%, #1c2331 100%)', borderColor: 'var(--dark-border)' }}>
        <Title order={3} mb="md" style={{ color: 'white' }}>AI Analysis Unavailable</Title>
        <Text color="red">{error}</Text>
        <Button mt="md" onClick={onClose}>Close</Button>
      </Paper>
    );
  }

  if (!valuation) {
    return (
      <Paper p="xl" radius="md" withBorder style={{ background: 'linear-gradient(135deg, #0f1218 0%, #1c2331 100%)', borderColor: 'var(--dark-border)' }}>
        <Title order={3} mb="md" style={{ color: 'white' }}>No Data Available</Title>
        <Text style={{ color: 'var(--text-secondary)' }}>Unable to generate insights for this property.</Text>
        <Button mt="md" onClick={onClose}>Close</Button>
      </Paper>
    );
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  // Format confidence as percentage
  const formatConfidence = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper p="xl" radius="md" withBorder style={{ background: 'linear-gradient(135deg, #0f1218 0%, #1c2331 100%)', borderColor: 'var(--dark-border)' }}>
        <Group justify="space-between" mb="lg">
          <Box>
            <Title order={3} style={{ color: 'white' }}>AI-Powered Property Insights</Title>
            <Text size="sm" color="dimmed">Powered by Nebius Studio</Text>
          </Box>
          <ThemeIcon size={48} radius="md" variant="light" color="blue">
            <IconBrain size={28} />
          </ThemeIcon>
        </Group>

        <Box mb="xl">
          <Group justify="space-between" mb="xs">
            <Text fw={500} style={{ color: 'white' }}>Estimated Value</Text>
            <Badge size="lg" radius="sm" gradient={{ from: '#00ff87', to: '#60efff' }} variant="gradient">
              {formatConfidence(valuation.confidence_score)} Confidence
            </Badge>
          </Group>
          <Title order={2} style={{ background: 'linear-gradient(90deg, #00ff87 0%, #60efff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {formatCurrency(valuation.estimated_value)}
          </Title>
          <Progress 
            value={valuation.confidence_score * 100} 
            size="sm" 
            mt="xs" 
            mb="md"
            color="cyan"
            style={{ width: '100%', background: 'rgba(0,0,0,0.2)' }}
          />
          {valuation.explanation && (
            <Text size="sm" mt="xs" fs="italic">
              {valuation.explanation}
            </Text>
          )}
        </Box>

        <Divider mb="lg" color="rgba(255,255,255,0.1)" />

        {analysis ? (
          <Accordion variant="separated" radius="md" styles={{
            item: { 
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)'
            },
            control: { 
              color: 'white' 
            },
            panel: { 
              color: 'var(--text-secondary)' 
            }
          }}>
            <Accordion.Item value="market">
              <Accordion.Control icon={<IconChartLine size={20} />}>
                Market Insights
              </Accordion.Control>
              <Accordion.Panel>
                {analysis.market_insights.summary && (
                  <Text mb="md">{analysis.market_insights.summary}</Text>
                )}
                {analysis.market_insights.trends && (
                  <>
                    <Text fw={500} mb="xs">Market Trends</Text>
                    <List spacing="xs" size="sm" mb="md">
                      {Object.entries(analysis.market_insights.trends).map(([key, value]: [string, any]) => (
                        <List.Item key={key}>
                          <Text span fw={500}>{key}:</Text> {value}
                        </List.Item>
                      ))}
                    </List>
                  </>
                )}
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="investment">
              <Accordion.Control icon={<IconCoin size={20} />}>
                Investment Potential
              </Accordion.Control>
              <Accordion.Panel>
                {analysis.investment_potential.summary && (
                  <Text mb="md">{analysis.investment_potential.summary}</Text>
                )}
                {analysis.investment_potential.metrics && (
                  <>
                    <Text fw={500} mb="xs">Key Metrics</Text>
                    <Group grow mb="md">
                      {Object.entries(analysis.investment_potential.metrics).map(([key, value]: [string, any]) => (
                        <Paper key={key} p="md" radius="md" withBorder>
                          <Text size="sm" color="dimmed">{key}</Text>
                          <Text fw={700}>{value}</Text>
                        </Paper>
                      ))}
                    </Group>
                  </>
                )}
              </Accordion.Panel>
            </Accordion.Item>

            {analysis.recommendations && (
              <Accordion.Item value="recommendations">
                <Accordion.Control icon={<IconBuildingBank size={20} />}>
                  Recommendations
                </Accordion.Control>
                <Accordion.Panel>
                  <List spacing="sm" size="sm">
                    {Array.isArray(analysis.recommendations) ? (
                      analysis.recommendations.map((rec: string, index: number) => (
                        <List.Item key={index} icon={<IconArrowUpRight size={16} />}>
                          {rec}
                        </List.Item>
                      ))
                    ) : (
                      <List.Item icon={<IconArrowUpRight size={16} />}>
                        No specific recommendations available.
                      </List.Item>
                    )}
                  </List>
                </Accordion.Panel>
              </Accordion.Item>
            )}
          </Accordion>
        ) : (
          <Box>
            <Text style={{ color: 'var(--text-secondary)' }}>Advanced analysis not available for this property.</Text>
            <Button 
              mt="md" 
              variant="light" 
              leftSection={<IconChartPie size={16} />}
              style={{ color: 'var(--text-primary-dark)' }}
            >
              Request Detailed Analysis
            </Button>
          </Box>
        )}

        <Group justify="flex-end" mt="xl">
          <Button variant="outline" color="gray" leftSection={<IconX size={16} />} onClick={onClose}>Close</Button>
          <Button 
            style={{ 
              background: 'linear-gradient(90deg, #00ff87 0%, #60efff 100%)',
              color: '#0f1218',
              fontWeight: 600 
            }}
          >
            Save to Dashboard
          </Button>
        </Group>
      </Paper>
    </motion.div>
  );
}
