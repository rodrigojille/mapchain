import { useState } from 'react';
import {
  Container,
  Group,
  Burger,
  Paper,
  Button,
  Text,
  Avatar,
  Menu,
  UnstyledButton,
  Box,
  rem,
} from '@mantine/core';
import { useStyles } from '../styles/navigation.styles';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown, IconLogout, IconSettings, IconUser } from '@tabler/icons-react';
import { useWallet } from '../hooks/useWallet';
import { motion, AnimatePresence } from 'framer-motion';

const HEADER_HEIGHT = 80;

interface HeaderSearchProps {
  links: { link: string; label: string }[];
}

const links: HeaderSearchProps['links'] = [
  { link: '/properties', label: 'Properties' },
  { link: '/valuations', label: 'Valuations' },
  { link: '/become-valuator', label: 'Become a Valuator' },
  { link: '/contact', label: 'Contact' },
];

export function Navigation() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const { classes, cx } = useStyles();
  const wallet = useWallet();

  const items = links.map((link) => (
    <motion.a
      key={link.label}
      href={link.link}
      className={classes.link}
      onClick={(event) => {
        event.preventDefault();
        close();
        window.location.href = link.link;
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {link.label}
    </motion.a>
  ));

  return (
    <Box component="header" className={classes.header} style={{ height: HEADER_HEIGHT, marginBottom: 0 }}>
      <Container className={classes.inner} fluid>
        <Group>
          <Burger
            opened={opened}
            onClick={toggle}
            className={classes.burger}
            size="sm"
            color="white"
          />
          <a href="/" className={classes.logo}>
            MapChain
          </a>
        </Group>

        <Box className={classes.links}>
          <Group gap={5}>
            {items}
          </Group>
        </Box>

        {wallet.accountId ? (
          <Menu
            width={260}
            position="bottom-end"
            onClose={() => setUserMenuOpened(false)}
            onOpen={() => setUserMenuOpened(true)}
          >
            <Menu.Target>
              <UnstyledButton className={cx(classes.user, { [classes.userActive]: userMenuOpened })}>
                <Group gap="xs">
                  <Avatar radius="xl" size={30} />
                  <Text fw={500} size="sm" style={{ lineHeight: 1, marginRight: '0.75rem' }}>
                    {wallet.accountId.slice(0, 8)}...
                  </Text>
                  <IconChevronDown size={12} stroke={1.5} />
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconUser size={14} />}>Profile</Menu.Item>
              <Menu.Item leftSection={<IconSettings size={14} />}>Settings</Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<IconLogout size={14} />}>
                Disconnect
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        ) : (
          <Button
            variant="gradient"
            gradient={{ from: '#00ff87', to: '#60efff' }}
            onClick={() => wallet.connect()}
          >
            Connect Wallet
          </Button>
        )}

        <AnimatePresence>
          {opened && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              style={{ position: 'absolute', top: HEADER_HEIGHT, left: 0, right: 0 }}
            >
              <Paper className={classes.dropdown} withBorder>
                {items}
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </Box>
  );
}
