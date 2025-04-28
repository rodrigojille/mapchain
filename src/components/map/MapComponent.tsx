'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useRouter } from 'next/navigation';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Demo Property interface (should match src/types/Property for demo)
interface Property {
  id: string;
  tokenId: string;
  title: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode?: string;
    country?: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  size: number;
  price: number;
  landType: 'urban' | 'solar' | 'building' | 'commercial' | 'residential' | 'industrial';
  images: string[];
  latestValuation?: {
    amount: number;
    currency: string;
    timestamp: number;
    validatorId: string;
    transactionId: string;
  };
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
  lastSalePrice?: number;
  lastSaleDate?: number;
  features?: {
    floors?: number;
    hasParking?: boolean;
    hasGarden?: boolean;
  };
  owner: {
    accountId: string;
    name?: string;
  };
  metadata: {
    createdAt: number;
    updatedAt: number;
    ipfsHash: string;
  };
  createdAt: number;
  updatedAt: number;
  ipfsHash: string;
}

interface MapComponentProps {
  properties: Property[];
  center?: [number, number];
  zoom?: number;
}

export default function MapComponent({ 
  properties,
  center = [19.4326, -99.1332], // Default to Mexico City
  zoom = 12 
}: MapComponentProps) {
  const router = useRouter();

  useEffect(() => {
    // Fix Leaflet icon loading issue in Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getMarkerColor = (property: Property) => {
    if (!property.latestValuation) return 'gray';
    
    // Color based on valuation type
    return property.latestValuation.validatorId ? 'blue' : 'green';
  };

  const createCustomIcon = (property: Property) => {
    const color = getMarkerColor(property);
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">
          ${property.latestValuation ? '$' : '?'}
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {properties.map((property) => (
        <Marker
          key={property.tokenId}
          position={[
            property.address.coordinates?.latitude || 0,
            property.address.coordinates?.longitude || 0
          ]}
          icon={createCustomIcon(property)}
          eventHandlers={{
            click: () => {
              router.push(`/properties/${property.tokenId}`);
            }
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {property.address.street}, {property.address.city}
              </p>
              {property.latestValuation ? (
                <div className="text-sm">
                  <p className="font-medium text-green-600">
                    {formatCurrency(property.latestValuation.amount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {property.latestValuation.validatorId 
                      ? 'Official Valuation'
                      : 'AI Valuation'}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No valuation yet</p>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/properties/${property.tokenId}`);
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                View Details →
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
