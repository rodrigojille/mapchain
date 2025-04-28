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
  TextInput,
  Card,
  Image,
  Badge,
  Select,
  Checkbox,
  RangeSlider,
  Pagination,
  Divider,
  Avatar,
  Rating
} from '@mantine/core';
import { useAuth } from '../../providers/AuthProvider';
import { IconSearch, IconFilter, IconMapPin, IconCertificate, IconCoin } from '@tabler/icons-react';
import { Valuator } from '../../types/user';

// Mock valuator data
const MOCK_VALUATORS: Valuator[] = Array(20).fill(null).map((_, index) => {
  const id = `val_${index + 1}`;
  const firstName = ['Sarah', 'Michael', 'Jessica', 'David', 'Emily', 'Robert', 'Jennifer', 'William', 'Amanda', 'James'][index % 10];
  const lastName = ['Johnson', 'Chen', 'Rodriguez', 'Smith', 'Brown', 'Davis', 'Miller', 'Wilson', 'Taylor', 'Anderson'][index % 10];
  const experience = 5 + Math.floor(Math.random() * 15);
  const completedValuations = 50 + Math.floor(Math.random() * 400);
  const rating = 3.5 + (Math.random() * 1.5);
  
  return {
    id,
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}@mapchain.com`,
    role: 'valuator' as any,
    authMethod: 'email' as any,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    isEmailVerified: true,
    walletAddresses: [`0.0.${1000000 + index}`],
    profileImage: `https://placehold.co/200x200?text=${firstName[0]}${lastName[0]}`,
    bio: `Professional property valuator with ${experience} years of experience in residential and commercial real estate.`,
    license: `VAL-${10000 + index}`,
    specializations: [
      ['Residential', 'Commercial', 'Land', 'Industrial', 'Retail'][Math.floor(Math.random() * 5)],
      ['Apartments', 'Single Family', 'Luxury', 'Historic', 'New Construction'][Math.floor(Math.random() * 5)]
    ],
    experience,
    rating,
    completedValuations,
    certifications: [
      ['Certified Residential Appraiser', 'Licensed Real Estate Appraiser', 'General Certified Appraiser'][Math.floor(Math.random() * 3)],
      ['USPAP Certified', 'FHA Approved', 'VA Approved'][Math.floor(Math.random() * 3)]
    ],
    availability: Math.random() > 0.2,
    fees: {
      standard: 200 + Math.floor(Math.random() * 200),
      urgent: 350 + Math.floor(Math.random() * 300)
    }
  };
});

// Filter options
interface FilterOptions {
  search: string;
  specialization: string;
  minRating: number;
  maxFee: number;
  availableOnly: boolean;
  sortBy: 'rating' | 'experience' | 'completedValuations' | 'fee';
}

export default function ValuatorMarketplace() {
  const router = useRouter();
  const auth = useAuth();
  const [valuators, setValuators] = useState<Valuator[]>([]);
  const [filteredValuators, setFilteredValuators] = useState<Valuator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    specialization: '',
    minRating: 0,
    maxFee: 500,
    availableOnly: false,
    sortBy: 'rating'
  });

  const ITEMS_PER_PAGE = 6;

  // Load valuators
  useEffect(() => {
    const loadValuators = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, this would fetch from an API
        // Using mock data for now
        setValuators(MOCK_VALUATORS);
      } catch (error) {
        console.error('Error loading valuators:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadValuators();
  }, []);

  // Apply filters
  useEffect(() => {
    const applyFilters = () => {
      let result = [...valuators];
      
      // Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter(valuator => 
          valuator.name.toLowerCase().includes(searchLower) ||
          valuator.bio.toLowerCase().includes(searchLower) ||
          valuator.specializations.some(s => s.toLowerCase().includes(searchLower))
        );
      }
      
      // Apply specialization filter
      if (filters.specialization) {
        result = result.filter(valuator => 
          valuator.specializations.some(s => 
            s.toLowerCase() === filters.specialization.toLowerCase()
          )
        );
      }
      
      // Apply rating filter
      if (filters.minRating > 0) {
        result = result.filter(valuator => valuator.rating >= filters.minRating);
      }
      
      // Apply fee filter
      if (filters.maxFee < 500) {
        result = result.filter(valuator => valuator.fees.standard <= filters.maxFee);
      }
      
      // Apply availability filter
      if (filters.availableOnly) {
        result = result.filter(valuator => valuator.availability);
      }
      
      // Apply sorting
      result.sort((a, b) => {
        switch (filters.sortBy) {
          case 'rating':
            return b.rating - a.rating;
          case 'experience':
            return b.experience - a.experience;
          case 'completedValuations':
            return b.completedValuations - a.completedValuations;
          case 'fee':
            return a.fees.standard - b.fees.standard;
          default:
            return 0;
        }
      });
      
      setFilteredValuators(result);
      setActivePage(1); // Reset to first page when filters change
    };
    
    applyFilters();
  }, [valuators, filters]);

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleSpecializationChange = (value: string) => {
    setFilters(prev => ({ ...prev, specialization: value }));
  };

  const handleRatingChange = (value: [number, number]) => {
    setFilters(prev => ({ ...prev, minRating: value[0] }));
  };

  const handleFeeChange = (value: [number, number]) => {
    setFilters(prev => ({ ...prev, maxFee: value[1] }));
  };

  const handleAvailabilityChange = (checked: boolean) => {
    setFilters(prev => ({ ...prev, availableOnly: checked }));
  };

  const handleSortChange = (value: string) => {
    setFilters(prev => ({ ...prev, sortBy: value as any }));
  };

  const handlePageChange = (page: number) => {
    setActivePage(page);
  };

  const getPaginatedValuators = () => {
    const start = (activePage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredValuators.slice(start, end);
  };

  const getSpecializationOptions = () => {
    const specializations = new Set<string>();
    
    valuators.forEach(valuator => {
      valuator.specializations.forEach(spec => {
        specializations.add(spec);
      });
    });
    
    return Array.from(specializations).map(spec => ({
      value: spec,
      label: spec
    }));
  };

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="sm">Find a Professional Valuator</Title>
      <Text color="dimmed" mb="xl">
        Connect with certified property valuators to get official valuations for your properties.
      </Text>
      
      <Grid>
        <Grid.Col span={12} md={3}>
          <Paper p="md" withBorder>
            <Title order={3} mb="md">Filters</Title>
            
            <TextInput
              label="Search"
              placeholder="Name, specialization, etc."
              icon={<IconSearch size={16} />}
              value={filters.search}
              onChange={(e) => handleSearchChange(e.currentTarget.value)}
              mb="md"
            />
            
            <Select
              label="Specialization"
              placeholder="All specializations"
              clearable
              data={getSpecializationOptions()}
              value={filters.specialization}
              onChange={handleSpecializationChange}
              mb="md"
            />
            
            <Text weight={500} size="sm" mb={5}>Minimum Rating</Text>
            <RangeSlider
              min={0}
              max={5}
              step={0.5}
              value={[filters.minRating, 5]}
              onChange={handleRatingChange}
              marks={[
                { value: 0, label: '0' },
                { value: 2.5, label: '2.5' },
                { value: 5, label: '5' }
              ]}
              mb="md"
            />
            
            <Text weight={500} size="sm" mb={5}>Maximum Fee</Text>
            <RangeSlider
              min={100}
              max={500}
              step={50}
              value={[100, filters.maxFee]}
              onChange={handleFeeChange}
              marks={[
                { value: 100, label: '$100' },
                { value: 300, label: '$300' },
                { value: 500, label: '$500' }
              ]}
              mb="md"
            />
            
            <Checkbox
              label="Available valuators only"
              checked={filters.availableOnly}
              onChange={(e) => handleAvailabilityChange(e.currentTarget.checked)}
              mb="md"
            />
            
            <Divider my="md" />
            
            <Text weight={500} size="sm" mb={5}>Sort By</Text>
            <Select
              data={[
                { value: 'rating', label: 'Highest Rating' },
                { value: 'experience', label: 'Most Experience' },
                { value: 'completedValuations', label: 'Most Valuations' },
                { value: 'fee', label: 'Lowest Fee' }
              ]}
              value={filters.sortBy}
              onChange={handleSortChange}
            />
          </Paper>
          
          <Paper p="md" withBorder mt="xl">
            <Title order={3} mb="md">Why Choose a Professional?</Title>
            <Text size="sm">
              While our AI valuations provide quick estimates, professional valuators offer:
            </Text>
            <ul style={{ paddingLeft: '1rem', marginTop: '0.5rem' }}>
              <li>Official documentation for legal purposes</li>
              <li>In-depth property analysis</li>
              <li>Expert knowledge of local markets</li>
              <li>Blockchain-verified valuation certificates</li>
            </ul>
            
            <Button 
              fullWidth 
              variant="light"
              mt="md"
              onClick={() => router.push('/about/valuations')}
            >
              Learn More
            </Button>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={12} md={9}>
          <Paper p="md" withBorder mb="md">
            <Group position="apart">
              <Text>
                Showing {filteredValuators.length} valuators
              </Text>
              
              <Group>
                <IconFilter size={16} />
                <Text size="sm">
                  {filters.availableOnly ? 'Available' : 'All'} 
                  {filters.specialization ? ` • ${filters.specialization}` : ''} 
                  {filters.minRating > 0 ? ` • ${filters.minRating}+ stars` : ''}
                </Text>
              </Group>
            </Group>
          </Paper>
          
          {isLoading ? (
            <Text align="center" py="xl">Loading valuators...</Text>
          ) : filteredValuators.length === 0 ? (
            <Paper p="xl" withBorder style={{ textAlign: 'center' }}>
              <Title order={3}>No valuators found</Title>
              <Text color="dimmed" mt="md">
                Try adjusting your filters to see more results.
              </Text>
              <Button 
                mt="xl"
                onClick={() => setFilters({
                  search: '',
                  specialization: '',
                  minRating: 0,
                  maxFee: 500,
                  availableOnly: false,
                  sortBy: 'rating'
                })}
              >
                Clear All Filters
              </Button>
            </Paper>
          ) : (
            <>
              <Grid>
                {getPaginatedValuators().map((valuator) => (
                  <Grid.Col key={valuator.id} span={12} md={6} lg={4}>
                    <Card p="md" radius="md" withBorder>
                      <Card.Section p="md">
                        <Group position="apart">
                          <Group>
                            <Avatar 
                              src={valuator.profileImage} 
                              size="lg" 
                              radius="xl"
                            />
                            <div>
                              <Text weight={500}>{valuator.name}</Text>
                              <Group spacing={5}>
                                <Rating value={valuator.rating} readOnly size="xs" />
                                <Text size="xs">({valuator.rating.toFixed(1)})</Text>
                              </Group>
                            </div>
                          </Group>
                          
                          {valuator.availability ? (
                            <Badge color="green">Available</Badge>
                          ) : (
                            <Badge color="gray">Unavailable</Badge>
                          )}
                        </Group>
                      </Card.Section>
                      
                      <Text size="sm" lineClamp={2} mt="sm">
                        {valuator.bio}
                      </Text>
                      
                      <Group spacing={5} mt="md">
                        <IconMapPin size={16} />
                        <Text size="xs">{valuator.experience} years experience</Text>
                      </Group>
                      
                      <Group spacing={5} mt={5}>
                        <IconCertificate size={16} />
                        <Text size="xs">{valuator.completedValuations} valuations completed</Text>
                      </Group>
                      
                      <Group spacing={5} mt={5}>
                        <IconCoin size={16} />
                        <Text size="xs">From ${valuator.fees.standard}/valuation</Text>
                      </Group>
                      
                      <Group mt="md" position="apart">
                        {valuator.specializations.map((spec, i) => (
                          <Badge key={i} variant="outline" size="sm">
                            {spec}
                          </Badge>
                        ))}
                      </Group>
                      
                      <Button 
                        fullWidth 
                        mt="md"
                        onClick={() => router.push(`/valuators/${valuator.id}`)}
                      >
                        View Profile
                      </Button>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
              
              <Group position="center" mt="xl">
                <Pagination 
                  total={Math.ceil(filteredValuators.length / ITEMS_PER_PAGE)} 
                  page={activePage}
                  onChange={handlePageChange}
                />
              </Group>
            </>
          )}
        </Grid.Col>
      </Grid>
    </Container>
  );
}
