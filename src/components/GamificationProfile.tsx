import { Box, Paper, Text, Progress, Group, Badge, SimpleGrid, Skeleton, List } from '@mantine/core';
import { useGamification } from '../hooks/useGamification';
import { IconTrophy, IconStar, IconHome2, IconChartBar } from '@tabler/icons-react';

export function GamificationProfile() {
  const { userStats, loading, getProgressToNextLevel } = useGamification();
  const { progress, pointsNeeded } = getProgressToNextLevel();

  if (loading) {
    return (
      <Paper p="md" radius="md">
        <Skeleton height={150} radius="md" mb="sm" />
        <Skeleton height={20} radius="sm" mb="sm" />
        <Skeleton height={20} radius="sm" />
      </Paper>
    );
  }

  if (!userStats) {
    return (
      <Paper p="md" radius="md">
        <Text>Connect your wallet to view your profile</Text>
      </Paper>
    );
  }

  return (
    <Paper p="xl" radius="md" shadow="sm">
      <Box mb="lg">
        <Group justify="space-between" mb="xs">
          <Text size="xl" fw={700}>
            {userStats.currentLevel.title}
          </Text>
          <Badge size="lg" variant="filled">
            Level {userStats.currentLevel.level}
          </Badge>
        </Group>

        <Text color="dimmed" size="sm" mb="md">
          {pointsNeeded > 0
            ? `${pointsNeeded} points needed for next level`
            : 'Maximum level reached!'}
        </Text>

        <Progress
          value={progress}
          size="lg"
          radius="md"
          color="blue"
          animate
        />
      </Box>

      <SimpleGrid cols={2} spacing="lg" breakpoints={[{ maxWidth: 'xs', cols: 1 }]}>
        <Paper withBorder p="md" radius="md">
          <Group gap="xs">
            <IconStar size={20} />
            <Text>Total Points</Text>
          </Group>
          <Text size="xl" fw={700} mt="sm">
            {userStats.totalPoints}
          </Text>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Group gap="xs">
            <IconHome2 size={20} />
            <Text>Properties</Text>
          </Group>
          <Text size="xl" fw={700} mt="sm">
            {userStats.propertyCount}
          </Text>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Group gap="xs">
            <IconChartBar size={20} />
            <Text>Valuations</Text>
          </Group>
          <Text size="xl" fw={700} mt="sm">
            {userStats.valuationsGiven}
          </Text>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Group gap="xs">
            <IconTrophy size={20} />
            <Text>Achievements</Text>
          </Group>
          <Text size="xl" fw={700} mt="sm">
            {userStats.achievements.length}
          </Text>
        </Paper>
      </SimpleGrid>

      <Box mt="xl">
        <Text size="lg" fw={600} mb="md">
          Level Benefits
        </Text>
        <List spacing="xs" size="sm" withPadding>
          {userStats.currentLevel.benefits.map((benefit, index) => (
            <List.Item key={index}>{benefit}</List.Item>
          ))}
        </List>
      </Box>

      {userStats.achievements.length > 0 && (
        <Box mt="xl">
          <Text size="lg" fw={600} mb="md">
            Achievements Unlocked
          </Text>
          <SimpleGrid cols={2} spacing="md" breakpoints={[{ maxWidth: 'xs', cols: 1 }]}>
            {userStats.achievements.map((achievement) => (
              <Paper key={achievement.id} withBorder p="md" radius="md">
                <Group gap="sm">
                  <Text size="xl">{achievement.icon}</Text>
                  <Box>
                    <Text fw={500}>{achievement.name}</Text>
                    <Text size="sm" color="dimmed">
                      {achievement.description}
                    </Text>
                  </Box>
                </Group>
              </Paper>
            ))}
          </SimpleGrid>
        </Box>
      )}
    </Paper>
  );
}
