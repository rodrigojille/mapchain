import { useState } from 'react';
import { Box, Paper, Text, Button } from '@mantine/core';
import { createStyles } from '@mantine/styles';
import { Property } from '../../types/Property';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const useStyles = createStyles((theme) => ({
  marker: {
    width: '20px',
    height: '20px',
    background: 'linear-gradient(45deg, #00ff87, #60efff)',
    borderRadius: '50%',
    boxShadow: '0 0 20px rgba(0, 255, 135, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    padding: '1rem',
    backgroundColor: theme.colors.dark[7],
    width: 250,
  },
  title: {
    color: theme.white,
    marginBottom: theme.spacing.xs,
  },
  details: {
    color: theme.colors.gray[6],
    marginBottom: theme.spacing.xs,
  },
  address: {
    color: theme.colors.gray[6],
    marginBottom: theme.spacing.md,
  },
  button: {
    background: 'linear-gradient(45deg, #00ff87, #60efff)',
    '&:hover': {
      opacity: 0.9,
    },
  },
}));

interface PropertyMarkerProps {
  property: Property;
  onSelect?: (property: Property) => void;
}

export function PropertyMarker({ property, onSelect }: PropertyMarkerProps) {
  const { classes } = useStyles();
  const [isOpen, setIsOpen] = useState(false);

  const icon = L.divIcon({
    className: 'property-marker',
    html: `<div style="width: 20px; height: 20px; background: linear-gradient(45deg, #00ff87, #60efff); border-radius: 50%; box-shadow: 0 0 20px rgba(0, 255, 135, 0.5); display: flex; align-items: center; justify-content: center;"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg></div>`,
  });

  return (
    <Marker
      position={[property.address.coordinates?.latitude || 0, property.address.coordinates?.longitude || 0]}
      icon={icon}
      eventHandlers={{
        click: () => setIsOpen(true),
      }}
    >
      <Popup>
        <Paper className={classes.paper}>
          <Text size="lg" fw={700} className={classes.title}>
            {property.title}
          </Text>
          <Text size="sm" className={classes.details}>
            {property.size} sqft • {property.bedrooms} beds • {property.bathrooms} baths
          </Text>
          <Text size="sm" className={classes.address}>
            {property.address.street}, {property.address.city}
          </Text>
          <Button
            fullWidth
            className={classes.button}
            onClick={() => onSelect?.(property)}
          >
            View Details
          </Button>
        </Paper>
      </Popup>
    </Marker>
  );
}

export default PropertyMarker;
