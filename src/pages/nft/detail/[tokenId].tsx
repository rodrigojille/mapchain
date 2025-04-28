import React from 'react';
import { NextPage } from 'next';
import {
  Container,
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Badge,
  Grid,
  Image,
  Button,
  Alert,
  Divider,
  Card,
  List,
} from '@mantine/core';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import { IconAlertCircle, IconCopy, IconExternalLink } from '@tabler/icons-react';

const NFTDetailPage: NextPage = () => {
  const router = useRouter();
  const { tokenId } = router.query;
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [nft, setNFT] = React.useState<any>(null);

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchNFTDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/nft/${tokenId}`);
        const data = await response.json();

        if (data.success) {
          setNFT(data.nft);
        } else {
          setError(data.error || 'Failed to fetch NFT details');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching NFT details');
      } finally {
        setLoading(false);
      }
    };

    if (tokenId) {
      fetchNFTDetails();
    }
  }, [tokenId, isAuthenticated, router]);

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Paper radius="md" p="xl" withBorder>
          <Text align="center">Loading NFT details...</Text>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
          {error}
        </Alert>
      </Container>
    );
  }

  if (!nft) {
    return (
      <Container size="xl" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="yellow" title="Not Found">
          NFT not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Grid>
          <Grid.Col md={6}>
            <Stack spacing="md">
              <Title order={2}>{nft.name}</Title>
              
              <Group>
                <Badge color="blue" size="lg">
                  Token ID: {nft.tokenId}
                </Badge>
                <Badge color="green" size="lg">
                  {nft.symbol}
                </Badge>
                <Badge color="violet" size="lg">
                  Serial #: {nft.serialNumber}
                </Badge>
              </Group>

              <Text size="lg">{nft.description}</Text>

              <Card withBorder>
                <Stack spacing="xs">
                  <Title order={4}>NFT Details</Title>
                  <Group position="apart">
                    <Text color="dimmed">Creator:</Text>
                    <Text weight={500}>{nft.metadata.creator}</Text>
                  </Group>
                  <Group position="apart">
                    <Text color="dimmed">Created:</Text>
                    <Text weight={500}>
                      {new Date(nft.metadata.createdAt).toLocaleDateString()}
                    </Text>
                  </Group>
                  <Group position="apart">
                    <Text color="dimmed">Royalty Fee:</Text>
                    <Text weight={500}>{nft.metadata.royaltyFee}%</Text>
                  </Group>
                </Stack>
              </Card>

              {nft.attributes && nft.attributes.length > 0 && (
                <Card withBorder>
                  <Stack spacing="xs">
                    <Title order={4}>Attributes</Title>
                    <List>
                      {nft.attributes.map((attr: any, index: number) => (
                        <List.Item key={index}>
                          <Group position="apart">
                            <Text>{attr.trait_type}:</Text>
                            <Text weight={500}>{attr.value}</Text>
                          </Group>
                        </List.Item>
                      ))}
                    </List>
                  </Stack>
                </Card>
              )}
            </Stack>
          </Grid.Col>

          <Grid.Col md={6}>
            <Stack spacing="md">
              {nft.image && (
                <Image
                  src={nft.image}
                  alt={nft.name}
                  radius="md"
                  height={400}
                  fit="contain"
                />
              )}

              <Card withBorder>
                <Stack spacing="xs">
                  <Title order={4}>Transaction History</Title>
                  <Group position="apart">
                    <Text color="dimmed">Minting Transaction:</Text>
                    <Button
                      variant="subtle"
                      compact
                      rightIcon={<IconExternalLink size={16} />}
                      component="a"
                      href={`https://${process.env.NEXT_PUBLIC_NETWORK_TYPE || 'testnet'}.mirrornode.hedera.com/api/v1/transactions/${nft.transactionId}`}
                      target="_blank"
                    >
                      View on Explorer
                    </Button>
                  </Group>
                </Stack>
              </Card>

              {user?.role === 'PROPERTY_OWNER' && (
                <>
                  <Divider />
                  <Group position="center">
                    <Button
                      onClick={() => router.push(`/nft/${tokenId}/transfer`)}
                    >
                      Transfer NFT
                    </Button>
                    {nft.ownerId === user.id && (
                      <Button
                        onClick={() => router.push(`/nft/${tokenId}/burn`)}
                        variant="light"
                        color="red"
                      >
                        Burn NFT
                      </Button>
                    )}
                  </Group>
                </>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </Paper>
    </Container>
  );
};

export default NFTDetailPage;
