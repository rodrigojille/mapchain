import { Box, Text, Badge, Group, ActionIcon, Tooltip, useMantineTheme, Modal, Button } from '@mantine/core';
import { createStyles } from '@mantine/styles';
import dynamic from 'next/dynamic';
import { Property } from '../types/Property';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconMaximize, IconMinimize, IconRefresh, IconChartLine, IconBuildingSkyscraper, IconBrain } from '@tabler/icons-react';
import { PropertyInsights } from './PropertyInsights';

// Define prop types for Mantine components to fix TypeScript errors
type TextWithWeightProps = {
  size?: string;
  weight?: number;
  color?: string;
  mb?: number;
  children: React.ReactNode;
};

type GroupWithSpacingProps = {
  spacing?: number;
  position?: string;
  mb?: number;
  className?: string;
  children: React.ReactNode;
};

const MapComponent = dynamic(
  () => import('./map/MapComponent'),
  { ssr: false }
);

const useStyles = createStyles((theme) => ({
  mapWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  mapContainer: {
    height: '100%',
    width: '100%',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid var(--dark-border)',
    position: 'relative',
    zIndex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at center, transparent 30%, var(--dark-bg) 100%)',
    pointerEvents: 'none',
    opacity: 0.4,
    zIndex: 2,
  },
  controlsContainer: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    zIndex: 3,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  controlButton: {
    backgroundColor: 'var(--dark-surface)',
    border: '1px solid var(--dark-border)',
    color: 'var(--text-primary)',
    '&:hover': {
      backgroundColor: 'rgba(96, 239, 255, 0.1)',
    },
  },
  statsPanel: {
    position: 'absolute',
    bottom: '16px',
    left: '16px',
    zIndex: 3,
    backgroundColor: 'rgba(15, 18, 24, 0.8)',
    backdropFilter: 'blur(10px)',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid var(--dark-border)',
    maxWidth: '280px',
  },
  statsBadge: {
    background: 'var(--primary-gradient)',
    color: '#000',
    fontWeight: 600,
  },
  dataLine: {
    position: 'absolute',
    height: '2px',
    width: '100%',
    background: 'var(--primary-gradient)',
    bottom: 0,
    left: 0,
    opacity: 0.7,
  },
  legendContainer: {
    position: 'absolute',
    bottom: '16px',
    right: '16px',
    zIndex: 3,
    backgroundColor: 'rgba(15, 18, 24, 0.8)',
    backdropFilter: 'blur(10px)',
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid var(--dark-border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  legendDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },
}));

interface PropertyMapProps {
  properties: Property[];
  onPropertySelect?: (property: Property) => void;
  initialCenter?: [number, number];
  initialZoom?: number;
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function PropertyMap({ 
  properties, 
  onPropertySelect, 
  initialCenter = [40.7128, -74.0060], 
  initialZoom = 12,
  fullscreen = false,
  onToggleFullscreen
}: PropertyMapProps) {
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const [isExpanded, setIsExpanded] = useState(fullscreen);
  const [mapKey, setMapKey] = useState(Date.now()); // For map refresh
  const [showStats, setShowStats] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showInsightsModal, setShowInsightsModal] = useState(false);

  useEffect(() => {
    setIsExpanded(fullscreen);
  }, [fullscreen]);

  const handleToggleFullscreen = () => {
    setIsExpanded(!isExpanded);
    if (onToggleFullscreen) {
      onToggleFullscreen();
    }
  };

  const refreshMap = () => {
    setMapKey(Date.now());
  };

  const toggleStats = () => {
    setShowStats(!showStats);
  };

  // Calculate some statistics for display
  const avgPrice = properties.length > 0 
    ? Math.round(properties.reduce((sum, prop) => sum + (prop.price || 0), 0) / properties.length) 
    : 0;

  return (
    <motion.div 
      className={classes.mapWrapper}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      layout
    >
      <Box className={classes.mapContainer}>
        <MapComponent
          key={mapKey}
          center={initialCenter}
          zoom={initialZoom}
          properties={properties}
          onPropertySelect={(property) => {
            setSelectedProperty(property);
            if (onPropertySelect) {
              onPropertySelect(property);
            }
          }}
        />
        <div className={classes.mapOverlay} />
        <div className="data-line" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2 }} />
      </Box>

      <div className={classes.controlsContainer}>
        <Tooltip label={isExpanded ? "Minimize" : "Maximize"} position="left">
          <ActionIcon 
            size="lg" 
            className={`${classes.controlButton} glow-effect`}
            onClick={handleToggleFullscreen}
          >
            {isExpanded ? <IconMinimize size={20} /> : <IconMaximize size={20} />}
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Refresh Map" position="left">
          <ActionIcon 
            size="lg" 
            className={classes.controlButton}
            onClick={refreshMap}
          >
            <IconRefresh size={20} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label={showStats ? "Hide Stats" : "Show Stats"} position="left">
          <ActionIcon 
            size="lg" 
            className={classes.controlButton}
            onClick={toggleStats}
          >
            <IconChartLine size={20} />
          </ActionIcon>
        </Tooltip>
        {selectedProperty && (
          <Tooltip label="AI Property Analysis" position="left">
            <ActionIcon 
              size="lg" 
              className={`${classes.controlButton} glow-effect`}
              onClick={() => setShowInsightsModal(true)}
              color="primary"
            >
              <IconBrain size={20} />
            </ActionIcon>
          </Tooltip>
        )}
      </div>

      <AnimatePresence>
        {showStats && (
          <motion.div 
            className={classes.statsPanel}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="stats-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Text size="sm" className="stats-title" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>MapChain Analytics</Text>
              <Badge className={classes.statsBadge} size="sm">LIVE</Badge>
            </div>
            <Text size="xs" className="stats-subtitle" style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Real-time property insights powered by blockchain</Text>
            <div className="stats-row" style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
              <Text size="sm" style={{ color: 'var(--text-primary)' }}>Properties:</Text>
              <Text size="sm" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{properties.length}</Text>
            </div>
            <div className="stats-row" style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
              <Text size="sm" style={{ color: 'var(--text-primary)' }}>Avg. Value:</Text>
              <Text size="sm" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>${avgPrice.toLocaleString()}</Text>
            </div>
            <div className={classes.dataLine}></div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className={classes.legendContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Text size="xs" style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Property Types</Text>
        <div className={classes.legendItem}>
          <div className={classes.legendDot} style={{ background: 'var(--primary-gradient)' }}></div>
          <Text size="xs" style={{ color: 'var(--text-secondary)' }}>Residential</Text>
        </div>
        <div className={classes.legendItem}>
          <div className={classes.legendDot} style={{ background: 'var(--secondary-gradient)' }}></div>
          <Text size="xs" style={{ color: 'var(--text-secondary)' }}>Commercial</Text>
        </div>
        <div className={classes.legendItem}>
          <div className={classes.legendDot} style={{ background: 'var(--accent-gradient)' }}></div>
          <Text size="xs" style={{ color: 'var(--text-secondary)' }}>Industrial</Text>
        </div>
      </motion.div>

      {/* AI Insights Modal */}
      <Modal
        opened={showInsightsModal}
        onClose={() => setShowInsightsModal(false)}
        title=""
        size="lg"
        padding={0}
        radius="md"
        withCloseButton={false}
        styles={{
          modal: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
          },
          body: {
            padding: 0,
          },
        }}
      >
        {selectedProperty && (
          <PropertyInsights
            propertyId={selectedProperty.id}
            propertyData={{
              features: {
                squareFootage: selectedProperty.squareFeet || 0,
                bedrooms: selectedProperty.bedrooms || 0,
                bathrooms: selectedProperty.bathrooms || 0,
                yearBuilt: 2000, // Default if not available
                propertyType: selectedProperty.type || 'residential'
              },
              location: {
                lat: selectedProperty.coordinates ? selectedProperty.coordinates[0] : 0,
                lng: selectedProperty.coordinates ? selectedProperty.coordinates[1] : 0
              },
              address: {
                line1: selectedProperty.address || '',
                city: '',
                state: '',
                zip: ''
              },
              valuation: {
                value: selectedProperty.price || 0
              },
              images: selectedProperty.image ? [selectedProperty.image] : []
            }}
            onClose={() => setShowInsightsModal(false)}
          />
        )}
      </Modal>
    </motion.div>
  );
}
