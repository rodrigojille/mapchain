import { useEffect, useRef } from 'react';
import { Box, Container, Title, Text, Button, Group, Badge, Stack, MantineSpacing } from '@mantine/core';
import { createStyles } from '@mantine/styles';
import { motion } from 'framer-motion';
import { IconBuildingSkyscraper, IconChartBar, IconCertificate } from '@tabler/icons-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const useStyles = createStyles((theme) => ({
  hero: {
    position: 'relative',
    minHeight: '100vh',
    overflow: 'hidden',
    backgroundColor: theme.colors.dark[8],
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.6,
    filter: 'brightness(0.4)',
  },
  content: {
    position: 'relative',
    zIndex: 1,
    padding: theme.spacing.xl,
    [theme.fn.smallerThan('sm')]: {
      padding: theme.spacing.xl,
    },
  },
  title: {
    color: theme.white,
    fontSize: 72,
    fontWeight: 900,
    lineHeight: 1.1,
    marginBottom: theme.spacing.md,
    [theme.fn.smallerThan('sm')]: {
      fontSize: 42,
      lineHeight: 1.2,
    },
  },
  description: {
    color: theme.colors.gray[4],
    fontSize: 24,
    maxWidth: 600,
    marginBottom: theme.spacing.xl,
    [theme.fn.smallerThan('sm')]: {
      fontSize: 18,
    },
  },
  glowButton: {
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(45deg, #00ff87 0%, #60efff 100%)',
    transition: 'transform 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
    },
  },
  secondaryButton: {
    borderColor: theme.colors.gray[5],
    color: theme.white,
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: theme.fn.rgba(theme.white, 0.1),
      transform: 'translateY(-2px)',
    },
  },
  feature: {
    padding: theme.spacing.lg,
    backgroundColor: theme.fn.rgba(theme.white, 0.03),
    borderRadius: theme.radius.md,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
    transition: 'transform 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      backgroundColor: theme.fn.rgba(theme.white, 0.05),
    },
  },
  featureIcon: {
    color: theme.fn.primaryColor(),
  },
  badge: {
    textTransform: 'uppercase',
    fontSize: theme.fontSizes.xs,
    background: theme.fn.linearGradient(45, '#00ff87', '#60efff'),
    marginBottom: theme.spacing.md,
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: theme.spacing.lg,
    [theme.fn.smallerThan('sm')]: {
      gridTemplateColumns: '1fr',
    },
  },
}));

export function Hero() {
  const { classes } = useStyles();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v10',
      center: [-74.5, 40],
      zoom: 9,
      pitch: 45,
    });

    map.current.on('load', () => {
      if (!map.current) return;
      
      // Add 3D building layer
      map.current.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 15,
        paint: {
          'fill-extrusion-color': '#00ff87',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.6,
        },
      });
    });

    return () => map.current?.remove();
  }, []);

  return (
    <Box className={classes.hero}>
      <div ref={mapContainer} className={classes.map} />
      <Container size="xl" className={classes.content}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Badge className={classes.badge}>Trusted by Professional Valuators</Badge>
          <Title className={classes.title}>
            The Future of{' '}
            <Text component="span" inherit variant="gradient" gradient={{ from: '#00ff87', to: '#60efff' }}>
              Property Valuation
            </Text>
          </Title>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Text className={classes.description}>
            Join the revolution in real estate. Leverage AI-powered insights and blockchain technology to deliver accurate, transparent property valuations.
          </Text>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Group mb="xl">
            <Button
              size="xl"
              radius="md"
              className={classes.glowButton}
              onClick={() => window.location.href = '/valuators/register'}
            >
              Start Earning as a Valuator
            </Button>
            <Button
              size="xl"
              radius="md"
              variant="outline"
              className={classes.secondaryButton}
              onClick={() => window.location.href = '/properties'}
            >
              Explore Properties
            </Button>
          </Group>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Box className={classes.featureGrid}>
            <Box className={classes.feature}>
              <IconBuildingSkyscraper size={32} className={classes.featureIcon} />
              <Box>
                <Text size="lg" fw={600} c="white">Access Premium Properties</Text>
                <Text size="sm" c="dimmed">Get exclusive access to high-value property listings</Text>
              </Box>
            </Box>
            <Box className={classes.feature}>
              <IconChartBar size={32} className={classes.featureIcon} />
              <Box>
                <Text size="lg" fw={600} c="white">AI-Powered Insights</Text>
                <Text size="sm" c="dimmed">Make data-driven decisions with our advanced AI</Text>
              </Box>
            </Box>
            <Box className={classes.feature}>
              <IconCertificate size={32} className={classes.featureIcon} />
              <Box>
                <Text size="lg" fw={600} c="white">Earn More</Text>
                <Text size="sm" c="dimmed">10% commission on every successful valuation</Text>
              </Box>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
