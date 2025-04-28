import React, { useState, useEffect } from 'react';
import {
  AppShell,
  Group,
  Select,
  Tooltip,
  ActionIcon,
  Avatar,
  Button,
  Burger,
  Text,
  Container,
  Divider,
  Box,
  Anchor,
  Menu
} from '@mantine/core';
import { IconSun, IconMoonStars, IconLogout } from '@tabler/icons-react';
import Link from 'next/link';
import Logo from './Logo';
import { useRouter } from 'next/router';
import { useMantineColorScheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
// Dummy translation hook (replace with your own or i18n)
const useTranslation = () => {
  const [language, setLanguage] = useState('en');
  const t = (key: string) => key;
  return { t, language, setLanguage };
};
// Dummy auth context (replace with your real auth)
const useAuth = () => ({ isAuthenticated: false, user: null, logout: () => {} });
// Dummy nav links (replace with your real links)
const userNavLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: IconSun },
  { href: '/profile', label: 'Profile', icon: IconMoonStars }
];
const socialLinks = [];
const footerLinks = [];

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShellComponent({ children }: AppShellProps) {
  // Mantine color scheme
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { t, language, setLanguage } = useTranslation();
  const router = useRouter();
  const [opened, { toggle }] = useDisclosure(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const auth = useAuth();

  // Example logic for isHomePage and isAuthPage
  const isHomePage = router.pathname === '/';
  const isAuthPage = router.pathname.startsWith('/auth');

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };

  const handleLogout = () => {
    auth.logout();
    router.push('/');
  };

  return (
    <AppShell
      navbar={<AppShell.Navbar p="lg"><Group justify="space-between" p="sm">
            <Select
              value={language}
              onChange={(value) => value && handleLanguageChange(value)}
              data={[
                { value: 'en', label: 'EN' },
                { value: 'es', label: 'ES' }
              ]}
              size="xs"
            />
            <Tooltip label={colorScheme === 'dark' ? t('theme.light') : t('theme.dark')}>
              <ActionIcon 
                variant="transparent" 
                color={colorScheme === 'dark' ? 'yellow' : 'blue'} 
                onClick={() => toggleColorScheme()}
                title="Toggle color scheme"
              >
                {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoonStars size={18} />}
              </ActionIcon>
            </Tooltip>
          </Group>
        </AppShell.Navbar>
      }
      header={<AppShell.Header p="lg">
                onChange={(value) => value && handleLanguageChange(value)}
                data={[
                  { value: 'en', label: 'EN' },
                  { value: 'es', label: 'ES' }
                ]}
                size="xs"
              />
              
              <Tooltip label={colorScheme === 'dark' ? t('theme.light') : t('theme.dark')}>
                <ActionIcon 
                  variant="transparent" 
                  color={colorScheme === 'dark' ? 'yellow' : 'blue'} 
                  onClick={() => toggleColorScheme()}
                  title="Toggle color scheme"
                >
                  {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoonStars size={18} />}
                </ActionIcon>
              </Tooltip>
            </Group>
          </AppShell.Navbar>
        )}
        
        <AppShell.Header>
          <Group justify="space-between" p="md">
            <Group>
              <Burger
                opened={opened}
                onClick={toggle}
                size="sm"
              />
              <Logo size={30} />
              <Text fw={700} size="lg">MapChain</Text>
            </Group>
            <Group>
              <Tooltip label={colorScheme === 'dark' ? t('theme.light') : t('theme.dark')}>
                <ActionIcon 
                  variant="subtle" 
                  color={colorScheme === 'dark' ? 'yellow' : 'blue'} 
                  onClick={() => toggleColorScheme()}
                  style={{ padding: 10, borderRadius: 10, '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)' } }}
                >
                  {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoonStars size={18} />}
                </ActionIcon>
              </Tooltip>
              {auth.isAuthenticated && (
                <Menu position="bottom-end" withArrow>
                  <Menu.Target>
                    <Avatar 
                      radius="xl" 
                      src={auth.user?.profileImage || undefined} 
                      alt={auth.user?.name || 'User'}
                      style={{ cursor: 'pointer', filter: 'drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.1))' }}
                    />
                  </Menu.Target>
                  <Menu.Dropdown>
                    {userNavLinks.map((link) => (
                      <Menu.Item 
                        key={link.href} 
                        leftSection={<link.icon size={16} />}
                        onClick={() => router.push(link.href)}
                        style={{ padding: 10, borderRadius: 10, '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)' } }}
                      >
                        {link.label}
                      </Menu.Item>
                    ))}
                    <Menu.Divider />
                    <Menu.Item 
                      leftSection={<IconLogout size={16} />}
                      onClick={handleLogout}
                      style={{ padding: 10, borderRadius: 10, '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)' } }}
                    >
                      {t('nav.logout')}
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              )}
              {!auth.isAuthenticated && (
                <Group>
                  <Button 
                    variant="subtle" 
                    color={isHomePage && !isScrolled ? 'white' : 'blue'}
                    onClick={() => router.push('/auth/login')}
                    style={{ padding: 10, borderRadius: 10, '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)' } }}
                  >
                    Login
                  </Button>
                  <Button 
                    variant="filled" 
                    color="blue"
                    onClick={() => router.push('/auth/register')}
                    style={{ padding: 10, borderRadius: 10, '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)' } }}
                  >
                    Register
                  </Button>
                </Group>
              )}
            </Group>
          </Group>
        </AppShell.Header>
        
        <AppShell.Main>
          {/* Footer Content */}
          {!isAuthPage && (
            <Container size="lg" p="md" style={{ marginTop: 'auto', backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 10, padding: 20, boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)' }}>
              <Group justify="space-between" py="lg">
                <div>
                  <Group>
                    <Logo size={30} />
                    <Text fw={700} size="lg">MapChain</Text>
                  </Group>
                  <Text size="sm" c="dimmed" mt="xs" style={{ maxWidth: 400 }}>
                    {t('footer.description')}
                  </Text>
                  <Group align="center" gap={12}>
                    {socialLinks.map((link, index) => (
                      <ActionIcon 
                        key={index} 
                        component="a" 
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="lg"
                        variant="default"
                      >
                        <link.icon size={18} />
                      </ActionIcon>
                    ))}
                  </Group>
                </div>
                
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Text fw={500}>{t('footer.links')}</Text>
                  {footerLinks.map((link) => (
                    <Link href={link.href} key={link.href} passHref legacyBehavior>
                      <Anchor component="a" size="sm">
                        {link.label}
                      </Anchor>
                    </Link>
                  ))}
                </Box>
              </Group>
              
              <Divider my="sm" />
              
              <Group justify="space-between" py="md">
                <Text size="xs" c="dimmed">
                  © {new Date().getFullYear()} MapChain. {t('footer.rights')}
                </Text>
                <Group>
                  <Select
                    value={language}
                    onChange={(value) => value && handleLanguageChange(value)}
                    data={[
                      { value: 'en', label: 'English' },
                      { value: 'es', label: 'Español' }
                    ]}
                    size="xs"
                  />
                </Group>
              </Group>
            </Container>
          )}
          
          {children}
        </AppShell.Main>
      </AppShell>
    </>
  );
}
