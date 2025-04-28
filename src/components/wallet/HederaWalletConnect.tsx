import React, { useState, useEffect, useCallback } from 'react';
import { Button, Text, Modal, Group, Stack, Loader, Alert, CopyButton, Tooltip, ActionIcon, Box, Image, Title, Paper, Divider } from '@mantine/core';
import { IconWallet, IconCopy, IconCheck, IconAlertCircle, IconExternalLink } from '@tabler/icons-react';
import { QRCodeCanvas } from 'qrcode.react';

interface HederaWalletConnectProps {
  projectId: string;
  onConnect: (accountId: string) => void;
  networkType?: 'mainnet' | 'testnet' | 'previewnet';
}

export const HederaWalletConnect: React.FC<HederaWalletConnectProps> = ({ 
  projectId, 
  onConnect,
  networkType = 'testnet'
}) => {
  const [opened, setOpened] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionUri, setConnectionUri] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);

  // Generate connection URI
  const generateConnectionUri = useCallback(() => {
    // In a real implementation, this would use the WalletConnect SDK
    // This is a placeholder URI format
    return `hedera://wallet-connect?projectId=${projectId}&network=${networkType}&timestamp=${Date.now()}`;
  }, [projectId, networkType]);

  // Initialize connection
  const initConnection = useCallback(async () => {
    try {
      setConnecting(true);
      setError(null);
      
      // Generate a connection URI
      const uri = generateConnectionUri();
      setConnectionUri(uri);
      
      // In a real implementation, you would:
      // 1. Initialize WalletConnect client
      // 2. Create a new session
      // 3. Get the connection URI from the session
      // 4. Listen for connection events
      
      // Simulate connection process
      setTimeout(() => {
        // For demo purposes, we'll simulate a successful connection
        // In a real implementation, this would come from the WalletConnect event
        const mockAccountId = "0.0.12345";
        setAccountId(mockAccountId);
        setConnecting(false);
        onConnect(mockAccountId);
      }, 3000);
      
    } catch (err) {
      setConnecting(false);
      setError("Failed to initialize wallet connection. Please try again.");
      console.error("Wallet connection error:", err);
    }
  }, [generateConnectionUri, onConnect]);

  // Handle modal open
  const handleOpen = () => {
    setOpened(true);
    initConnection();
  };

  // Handle modal close
  const handleClose = () => {
    setOpened(false);
    setConnecting(false);
    setConnectionUri(null);
    setError(null);
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccountId(null);
    // In a real implementation, you would also disconnect the WalletConnect session
  };

  return (
    <>
      {accountId ? (
        <Group spacing="xs">
          <Text size="sm">Connected: {accountId}</Text>
          <Button variant="subtle" color="red" compact onClick={disconnectWallet}>
            Disconnect
          </Button>
        </Group>
      ) : (
        <Button 
          leftIcon={<IconWallet size={16} />} 
          onClick={handleOpen}
          variant="light"
          color="blue"
        >
          Connect Hedera Wallet
        </Button>
      )}

      <Modal
        opened={opened}
        onClose={handleClose}
        title="Connect to Hedera Wallet"
        size="md"
        centered
      >
        <Stack spacing="lg">
          {error && (
            <Alert icon={<IconAlertCircle size={16} />} title="Connection Error" color="red">
              {error}
            </Alert>
          )}

          {connecting ? (
            <Stack align="center" spacing="md" my="xl">
              <Loader size="lg" />
              <Text>Initializing connection...</Text>
            </Stack>
          ) : connectionUri ? (
            <Stack align="center" spacing="md">
              <Paper withBorder p="md" radius="md" shadow="sm">
                <Stack align="center" spacing="xs">
                  <Title order={4}>Scan with your Hedera Wallet</Title>
                  <Box my="md">
                    <QRCodeCanvas value={connectionUri} size={200} />
                  </Box>
                  <Text size="sm" color="dimmed">
                    Scan this QR code with your Hedera wallet app to connect
                  </Text>
                </Stack>
              </Paper>
              
              <Divider label="or" labelPosition="center" my="sm" w="100%" />
              
              <Paper withBorder p="md" radius="md" shadow="sm" w="100%">
                <Stack spacing="xs">
                  <Text size="sm" weight={500}>Connection URI</Text>
                  <Group position="apart" spacing="xs">
                    <Text size="xs" color="dimmed" style={{ wordBreak: 'break-all' }}>
                      {connectionUri}
                    </Text>
                    <Group spacing={4}>
                      <CopyButton value={connectionUri} timeout={2000}>
                        {({ copied, copy }) => (
                          <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="top">
                            <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </CopyButton>
                      <Tooltip label="Open in wallet" withArrow position="top">
                        <ActionIcon 
                          component="a" 
                          href={connectionUri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <IconExternalLink size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>
                </Stack>
              </Paper>
              
              <Group position="center" mt="md">
                <Button variant="subtle" onClick={handleClose}>Cancel</Button>
              </Group>
            </Stack>
          ) : null}
        </Stack>
      </Modal>
    </>
  );
};

export default HederaWalletConnect;
