import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, test, jest } from '@jest/globals';
import PropertyMap from '../components/map/PropertyMap';
import { useHederaContract } from '../hooks/useHederaContract';
import { Property } from '../types/Property';

// Mock Leaflet
jest.mock('leaflet', () => ({
  map: jest.fn(() => ({
    setView: jest.fn(),
    remove: jest.fn(),
    on: jest.fn(),
    off: jest.fn()
  })),
  tileLayer: jest.fn(() => ({
    addTo: jest.fn()
  })),
  marker: jest.fn(() => ({
    addTo: jest.fn(),
    bindPopup: jest.fn(),
    setLatLng: jest.fn(),
    remove: jest.fn(),
    on: jest.fn()
  })),
  divIcon: jest.fn(() => ({})),
  Marker: {
    prototype: {
      options: {
        icon: {}
      }
    }
  }
}));

jest.mock('../hooks/useHederaContract');

describe('PropertyMap Component', () => {
  const mockProperties: Property[] = [
    {
      id: '1',
      tokenId: '0.0.123456',
      title: 'Modern Villa',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        coordinates: {
          latitude: 19.4326,
          longitude: -99.1332
        }
      },
      size: 150,
      landType: 'urban' as const,
      images: ['test-hash-1'],
      latestValuation: {
        amount: 500000,
        currency: 'USD',
        timestamp: Date.now(),
        validatorId: '0.0.54321',
        transactionId: 'tx-1'
      },
      owner: {
        accountId: '0.0.12345',
        name: 'Test Owner'
      },
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ipfsHash: 'test-metadata-hash-1'
      },
      price: 500000
    },
    {
      id: '2',
      tokenId: '0.0.123457',
      title: 'Commercial Space',
      address: {
        street: '456 Test Ave',
        city: 'Test City',
        state: 'TS',
        coordinates: {
          latitude: 19.4327,
          longitude: -99.1333
        }
      },
      size: 300,
      landType: 'commercial' as const,
      images: ['test-hash-2'],
      latestValuation: {
        amount: 1000000,
        currency: 'USD',
        timestamp: Date.now() - 86400000,
        validatorId: '0.0.54322',
        transactionId: 'tx-2'
      },
      owner: {
        accountId: '0.0.12346',
        name: 'Test Owner 2'
      },
      metadata: {
        createdAt: Date.now() - 604800000,
        updatedAt: Date.now() - 86400000,
        ipfsHash: 'test-metadata-hash-2'
      },
      price: 1000000
    }
  ];

  beforeEach(() => {
    // Mock Hedera contract interactions
    (useHederaContract as jest.Mock).mockReturnValue({
      getPropertyValuations: jest.fn().mockResolvedValue([]),
      isReady: true
    });

    // Create map container for tests
    const container = document.createElement('div');
    container.id = 'property-map';
    document.body.appendChild(container);

    // Mock Leaflet map creation
    const mockMap = {
      setView: jest.fn(),
      remove: jest.fn(),
      on: jest.fn(),
      off: jest.fn()
    };
    (globalThis as any).L = {
      map: jest.fn(() => mockMap),
      tileLayer: jest.fn(() => ({
        addTo: jest.fn()
      })),
      marker: jest.fn(() => ({
        addTo: jest.fn(),
        bindPopup: jest.fn(),
        setLatLng: jest.fn(),
        remove: jest.fn(),
        on: jest.fn()
      })),
      divIcon: jest.fn(() => ({})),
      Marker: {
        prototype: {
          options: {
            icon: {}
          }
        }
      }
    };
  });

  afterEach(() => {
    // Clean up map container
    const container = document.getElementById('property-map');
    if (container) {
      container.remove();
    }
    
    // Reset mocks
    jest.clearAllMocks();
  });

  test('renders map with property markers', async () => {
    render(<PropertyMap properties={mockProperties} />);

    // Wait for map initialization
    await waitFor(() => {
      expect(screen.getByTestId('property-map')).toBeInTheDocument();
    });

    // Check if markers are created
    expect((globalThis as any).L.marker).toHaveBeenCalledTimes(mockProperties.length);
  });

  test('displays property info in popup', async () => {
    render(<PropertyMap properties={mockProperties} />);

    // Simulate marker click
    const mockMarker = (globalThis as any).L.marker.mock.results[0].value;
    const bindPopupFn = mockMarker.bindPopup;

    expect(bindPopupFn).toHaveBeenCalledWith(
      expect.stringContaining('Modern Villa')
    );
    expect(bindPopupFn).toHaveBeenCalledWith(
      expect.stringContaining('$500,000')
    );
  });

  test('updates markers when properties change', async () => {
    const { rerender } = render(<PropertyMap properties={mockProperties} />);

    // Add a new property
    const newProperties = [
      ...mockProperties,
      {
        id: '3',
        tokenId: '0.0.123458',
        title: 'New Property',
        address: {
          street: '789 Test Blvd',
          city: 'Test City',
          state: 'TS',
          coordinates: {
            latitude: 19.4328,
            longitude: -99.1334
          }
        },
        size: 200,
        landType: 'urban' as const,
        images: ['test-hash-3'],
        owner: {
          accountId: '0.0.12347'
        },
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          ipfsHash: 'test-metadata-hash-3'
        },
        price: 300000
      }
    ];

    rerender(<PropertyMap properties={newProperties} />);

    expect((globalThis as any).L.marker).toHaveBeenCalledTimes(newProperties.length);
  });

  test('creates different marker styles based on valuation status', async () => {
    render(<PropertyMap properties={mockProperties} />);

    expect((globalThis as any).L.divIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        className: expect.stringContaining('official-valuation')
      })
    );

    expect((globalThis as any).L.divIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        className: expect.stringContaining('pending-valuation')
      })
    );
  });

  test('handles property selection', async () => {
    const onSelectProperty = jest.fn();
    render(
      <PropertyMap
        properties={mockProperties}
        onSelectProperty={onSelectProperty}
      />
    );

    // Simulate marker click
    const mockMarker = (globalThis as any).L.marker.mock.results[0].value;
    const clickFn = mockMarker.on.mock.calls[0][1];

    clickFn();
    expect(onSelectProperty).toHaveBeenCalledWith(mockProperties[0]);
  });

  test('handles errors gracefully', async () => {
    render(<PropertyMap properties={mockProperties} />);

    // Remove map container to trigger error
    const container = document.getElementById('property-map');
    if (container) {
      container.remove();
    }

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/Error loading map/i)).toBeInTheDocument();
    });
  });

  test('updates map view on center change', async () => {
    render(<PropertyMap properties={mockProperties} center={[19.4326, -99.1332]} />);

    // Get mock map instance
    const mockMap = (globalThis as any).L.map.mock.results[0].value;

    // Check if view was set correctly
    expect(mockMap.setView).toHaveBeenCalledWith(
      [19.4326, -99.1332],
      expect.any(Number)
    );
  });
});
