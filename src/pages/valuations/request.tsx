import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Paper,
  Title,
  Text,
  Stepper,
  RadioGroup,
  Radio,
  Card,
  Group,
  Image,
  Badge,
  Divider,
  Alert,
  Checkbox,
  Button,
  Textarea
} from '@mantine/core';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';
import { PropertyData } from '../../services/propertyApi';

import DashboardNavBar from '../../components/dashboard/DashboardNavBar';

export default function ValuationRequestPage() {
  // --- HOOKS & STATE ---
  const router = useRouter();
  const auth = { isLoading: false };
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<any>({
    validate: () => ({ hasErrors: false }),
    values: { valuatorId: '', urgency: 'standard', acceptTerms: false },
    errors: {},
    getInputProps: () => ({})
  });
  const [valuators, setValuators] = useState<any[]>([]);
  useEffect(() => {
    async function fetchValuators() {
      try {
        const res = await fetch('/api/valuator/list');
        const data = await res.json();
        if (data.success && Array.isArray(data.valuators)) {
          setValuators(data.valuators);
        }
      } catch (error) {
        console.error('Failed to fetch valuators:', error);
      }
    }
    fetchValuators();
  }, []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [escrowCreated, setEscrowCreated] = useState(false);
  const [active, setActive] = useState(0);
  const [properties, setProperties] = useState<any[]>([]);
  const nextStep = () => setActive((prev) => prev + 1);
  const prevStep = () => setActive((prev) => prev - 1);
  const hederaContract = { createEscrow: async () => ({}) };

  // --- HELPERS ---
  const handleSubmit = async () => {
    if (!form.validate().hasErrors) {
      try {
        setIsSubmitting(true);
        const selectedValuator = valuators.find(v => v.id === form.values.valuatorId);
        if (!selectedValuator) throw new Error('Selected valuator not found');
        const fee = form.values.urgency === 'urgent' ? selectedValuator.fees.urgent : selectedValuator.fees.standard;
        const requestId = `req_${Math.random().toString(36).substr(2, 9)}`;
        const result = await hederaContract.createEscrow();
        setEscrowCreated(true);
        nextStep();
      } catch (error) {
        console.error('Error submitting valuation request:', error);
        alert('Failed to submit valuation request. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  const getSelectedValuator = () => valuators.find(v => v.id === form.values.valuatorId);
  const calculateFee = () => {
    const valuator = getSelectedValuator();
    if (!valuator) return 0;
    return form.values.urgency === 'urgent' ? valuator.fees.urgent : valuator.fees.standard;
  };

  // --- RENDER ---
  return (
    <>
      <DashboardNavBar />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 16 }}>
        <button
          onClick={() => window.history.back()}
          style={{ marginBottom: 24, background: '#4285F4', color: '#fff', fontWeight: 700, borderRadius: 8, padding: '10px 22px', fontSize: 16, border: 'none', boxShadow: '0 1px 8px #dbeafe', width: '100%' }}
        >
          Back to Dashboard
        </button>
      </div>

      <Container size="lg" py="xl">
        {auth.isLoading || isLoading ? (
          <Container size="md" py="xl" style={{ textAlign: 'center' }}>
            <Title order={2} mb="md">Request Valuation</Title>
            <Text color="dimmed">Loading...</Text>
          </Container>
        ) : (
          <form onSubmit={handleSubmit}>
            <Paper p="xl" withBorder>
              <Title order={2} ta="center" mb="xl">Request a Professional Valuation</Title>
            </Paper>
          </form>
        )}
      </Container>
    </>
  );
}
