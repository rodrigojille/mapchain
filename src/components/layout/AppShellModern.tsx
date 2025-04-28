import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { 
  AppShell,
  Text, 
  Burger, 
  useMantineTheme, 
  Group, 
  Button, 
  ActionIcon, 
  Menu, 
  Avatar, 
  Divider, 
  Select, 
  Container, 
  Anchor, 
  Box, 
  Tooltip,
  Stack,
  useMantineColorScheme
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  IconHome, 
  IconMap, 
  IconChartBar, 
  IconUsers, 
  IconBuildingEstate,
  IconUser,
  IconLogout,
  IconSettings,
  IconDashboard,
  IconSun,
  IconMoonStars
} from '@tabler/icons-react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

// Logo component
const Logo = ({ size = 30 }: { size?: number }) => {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(45deg, #4DABF7 0%, #1971C2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'white', fontWeight: 'bold', fontSize: size * 0.6 }}>M</span>
    </div>
  );
};

// Translation hook (simplified for now)
const useTranslation = () => {
  const [language, setLanguage] = useState('en');
  
  const translations = {
    en: {
      'nav.home': 'Home',
      'nav.properties': 'Properties',
      'nav.valuators': 'Valuators',
      'nav.forecast': 'Forecast',
      'nav.map': 'Map',
      'nav.dashboard': 'Dashboard',
      'nav.profile': 'Profile',
      'nav.settings': 'Settings',
      'nav.admin': 'Admin',
      'nav.logout': 'Logout',
      'theme.light': 'Light mode',
      'theme.dark': 'Dark mode'
    },
    es: {
      'nav.home': 'Inicio',
      'nav.properties': 'Propiedades',
      'nav.valuators': 'Valuadores',
      'nav.forecast': 'Pronóstico',
      'nav.map': 'Mapa',
      'nav.dashboard': 'Panel',
      'nav.profile': 'Perfil',
      'nav.settings': 'Configuración',
      'nav.admin': 'Admin',
      'nav.logout': 'Cerrar sesión',
      'theme.light': 'Modo claro',
      'theme.dark': 'Modo oscuro'
    }
  };
  
  const t = (key: string) => {
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations.en] || key;
  };
  
  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mapchain-language', newLanguage);
    }
  };
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('mapchain-language');
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
    }
  }, []);
  
  return { t, changeLanguage, language };
};

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function AppShellModern({ 
  children, 
  title = 'MapChain', 
  description = 'Blockchain-powered property valuation platform'
}: AppShellProps) {
  const theme = useMantineTheme();
  const router = useRouter();
  const { t, changeLanguage, language } = useTranslation();
  const [opened, { toggle }] = useDisclosure(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const auth = useAuth();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  
  const isHomePage = router.pathname === '/';
  const isAuthPage = router.pathname.includes('/login') || router.pathname.includes('/register');
  
  // Handle scroll event to change header appearance
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 10);
  };
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleLanguageChange = (value: string | null) => {
    if (value) {
      changeLanguage(value);
    }
  };
  
  const handleLogout = () => {
    auth.logout();
    router.push('/');
  };

  // Navigation links
  const navLinks = [
    { href: '/', label: t('nav.home'), icon: IconHome },
    { href: '/properties', label: t('nav.properties'), icon: IconBuildingEstate },
    { href: '/valuators', label: t('nav.valuators'), icon: IconUsers },
    { href: '/forecast', label: t('nav.forecast'), icon: IconChartBar },
    { href: '/map', label: t('nav.map'), icon: IconMap },
  ];

  // User navigation links
  const userNavLinks = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: IconDashboard },
    { href: '/profile', label: t('nav.profile'), icon: IconUser },
    { href: '/settings', label: t('nav.settings'), icon: IconSettings },
  ];

  const header = (
    <Box>
      <Group justify="space-between" px="md" h={isHomePage ? 80 : 70}>
        <Group>
          {!isAuthPage && (
            <Burger
              opened={opened}
              onClick={toggle}
              size="sm"
              color={theme.colors.gray[6]}
              mr="xl"
              display={{ base: 'block', sm: 'none' }}
            />
          )}
          
          <Link href="/" passHref legacyBehavior>
            <Anchor style={{ textDecoration: 'none' }}>
              <Group gap="xs">
                <Logo size={30} />
                <Text
                  fw={700}
                  size="lg"
                  c={isHomePage && !isScrolled && !opened ? 
                    'white' : undefined}
                >
                  MapChain
                </Text>
              </Group>
            </Anchor>
          </Link>
        </Group>
        
        <Group>
          <Box display={{ base: 'none', sm: 'block' }}>
            <Group>
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} passHref legacyBehavior>
                  <Anchor
                    style={{
                      textDecoration: 'none',
                      fontWeight: router.pathname === link.href ? 700 : 400
                    }}
                  >
                    {link.label}
                  </Anchor>
                </Link>
              ))}
            </Group>
          </Box>
          
          <Tooltip label={colorScheme === 'dark' ? t('theme.light') : t('theme.dark')}>
            <ActionIcon
              variant="outline"
              color={colorScheme === 'dark' ? 'yellow' : 'blue'}
              onClick={() => toggleColorScheme()}
              title="Toggle color scheme"
            >
              {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoonStars size={18} />}
            </ActionIcon>
          </Tooltip>
          
          {auth.isAuthenticated ? (
            <Menu position="bottom-end" shadow="md" width={200}>
              <Menu.Target>
                <Avatar 
                  radius="xl" 
                  color="blue"
                  style={{ cursor: 'pointer' }}
                >
                  {auth.user?.name?.charAt(0) || 'U'}
                </Avatar>
              </Menu.Target>
              <Menu.Dropdown>
                {userNavLinks.map((link) => (
                  <Menu.Item 
                    key={link.href} 
                    leftSection={<link.icon size={14} />}
                    onClick={() => router.push(link.href)}
                  >
                    {link.label}
                  </Menu.Item>
                ))}
                <Menu.Divider />
                <Menu.Item 
                  leftSection={<IconLogout size={14} />}
                  onClick={handleLogout}
                >
                  {t('nav.logout')}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <Group>
              <Box display={{ base: 'none', sm: 'block' }}>
                <Link href="/login" passHref legacyBehavior>
                  <Button 
                    variant="subtle" 
                    color="blue"
                  >
                    Login
                  </Button>
                </Link>
              </Box>
              <Link href="/register" passHref legacyBehavior>
                <Button 
                  variant="filled" 
                  color="blue"
                >
                  Register
                </Button>
              </Link>
            </Group>
          )}
        </Group>
      </Group>
    </Box>
  );

  const navbar = !isAuthPage ? (
    <Box p="md">
      <Group mb="md">
        <Logo size={30} />
        <Text fw={700}>MapChain</Text>
      </Group>
      
      <Divider my="sm" />
      
      <Stack>
        {navLinks.map((link) => (
          <Button
            key={link.href}
            variant={router.pathname === link.href ? "light" : "subtle"}
            leftSection={<link.icon size={16} />}
            onClick={() => router.push(link.href)}
            styles={{
              root: {
                justifyContent: 'flex-start',
                borderRadius: 0
              }
            }}
          >
            {link.label}
          </Button>
        ))}
      </Stack>
      
      <Divider my="sm" />
      
      <Group justify="space-between" mt="md">
        <Select
          value={language}
          onChange={handleLanguageChange}
          data={[
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Español' }
          ]}
          size="xs"
        />
        
        <Tooltip label={colorScheme === 'dark' ? t('theme.light') : t('theme.dark')}>
          <ActionIcon 
            variant="outline" 
            color={colorScheme === 'dark' ? 'yellow' : 'blue'} 
            onClick={() => toggleColorScheme()}
            title="Toggle color scheme"
          >
            {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoonStars size={18} />}
          </ActionIcon>
        </Tooltip>
      </Group>
    </Box>
  ) : undefined;

  const footer = !isAuthPage ? (
    <Container>
      <Group justify="space-between" py="md">
        <Text size="xs" color="dimmed">
          © {new Date().getFullYear()} MapChain. All rights reserved.
        </Text>
        <Group>
          <Link href="/about" passHref legacyBehavior>
            <Anchor size="xs">About</Anchor>
          </Link>
          <Link href="/contact" passHref legacyBehavior>
            <Anchor size="xs">Contact</Anchor>
          </Link>
          <Link href="/privacy" passHref legacyBehavior>
            <Anchor size="xs">Privacy</Anchor>
          </Link>
          <Link href="/terms" passHref legacyBehavior>
            <Anchor size="xs">Terms</Anchor>
          </Link>
        </Group>
      </Group>
    </Container>
  ) : undefined;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>
      <AppShell
        header={header}
        navbar={navbar}
        footer={footer}
        padding="md"
        styles={(theme) => ({
          main: {
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
          },
        })}
      >
        {children}
      </AppShell>
    </>
  );
}
