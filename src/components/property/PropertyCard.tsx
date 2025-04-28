'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/types/Property';
import { MapPinIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urban':
        return 'bg-blue-100 text-blue-800';
      case 'solar':
        return 'bg-yellow-100 text-yellow-800';
      case 'building':
        return 'bg-green-100 text-green-800';
      case 'commercial':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Link href={`/properties/${property.tokenId}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg hover:translate-y-[-4px]">
        <div className="relative h-48">
          <Image
            src={`https://ipfs.io/ipfs/${property.images[currentImageIndex]}`}
            alt={property.title}
            fill
            className="object-cover"
          />
          
          {property.images.length > 1 && (
            <div className="absolute inset-x-0 bottom-0 flex justify-center space-x-2 p-2">
              {property.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {property.title}
            </h3>
            <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(property.landType)}`}>
              {property.landType}
            </span>
          </div>

          <p className="text-gray-600 mb-2 truncate flex items-center">
            <MapPinIcon className="h-4 w-4 mr-1" />
            {property.address.street}, {property.address.city}
          </p>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center text-gray-500">
              <span className="text-sm">{property.size} m²</span>
            </div>

            {property.latestValuation && (
              <div className="flex items-center text-green-600 font-medium">
                <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                {formatCurrency(property.latestValuation.amount)}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
