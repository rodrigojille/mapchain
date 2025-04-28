import React, { useEffect, useRef } from 'react';
import { useHederaContract } from '../../hooks/useHederaContract';
import { Property } from '../../types/Property';
// Do not import L from 'leaflet' at the top level to avoid SSR errors

interface PropertyMapProps {
  properties: Property[];
  onSelectProperty?: (property: Property) => void;
  center?: [number, number];
}

export default function PropertyMap({ properties, onSelectProperty, center = [19.4326, -99.1332] }: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (typeof window === 'undefined') return;

    // Dynamically import Leaflet only on the client
    import('leaflet').then(L => {
      try {
        // Remove existing map if it exists
        if (map.current) {
          map.current.remove();
          markers.current.forEach(marker => marker.remove());
          markers.current = [];
        }

        // Create new map
        map.current = L.map(mapContainer.current!).setView(center, 13);

        // Add tile layer
        if (map.current) {
          const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'OpenStreetMap contributors'
          });
          tileLayer.addTo(map.current);
        }

        // Render markers
        renderMarkers(L, properties);

        // Clean up on unmount
        return () => {
          if (map.current) {
            map.current.remove();
          }
        };
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    });
  }, [center, properties]);

  const renderMarkers = (L: typeof import('leaflet'), properties: Property[]) => {
    if (!map.current) return;

    properties.forEach(property => {
      const { address, latestValuation } = property;
      const { coordinates } = address;
      const { latitude, longitude } = coordinates;

      const markerClass = latestValuation ? 'official-valuation' : 'pending-valuation';
      const icon = L.divIcon({ className: markerClass });

      const marker = L.marker([latitude, longitude], { icon }).addTo(map.current!);
      markers.current.push(marker);

      const valuationText = latestValuation
        ? `$${latestValuation.amount.toLocaleString()} ${latestValuation.currency}`
        : 'No valuation yet';

      marker.bindPopup(
        `<div>
          <strong>${property.title}</strong><br/>
          ${valuationText}
        </div>`
      );

      if (onSelectProperty) {
        marker.on('click', () => onSelectProperty(property));
      }
    });
  };

  return (
    <div
      id="property-map"
      ref={mapContainer}
      style={{ height: '400px', width: '100%' }}
      data-testid="property-map"
    />
  );
}
