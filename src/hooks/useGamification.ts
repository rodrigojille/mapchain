import { useState, useEffect } from 'react';
import { GamificationService, UserStats, UserAchievement } from '../services/GamificationService';
import { useWallet } from './useWallet';
import { notifications } from '@mantine/notifications';

export function useGamification() {
  const { accountId } = useWallet();
  const [userStats, setUserStats] = useState<UserStats>(null);
  const [loading, setLoading] = useState(true);
  const gamificationService = new GamificationService();

  useEffect(() => {
    if (accountId) {
      loadUserStats();
    }
  }, [accountId]);

  const loadUserStats = async () => {
    try {
      const stats = await gamificationService.getUserStats(accountId);
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load gamification stats',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const awardPoints = async (action: string, points: number) => {
    if (!accountId) return;

    try {
      await gamificationService.awardPoints(accountId, action, points);
      await loadUserStats(); // Reload stats after awarding points

      notifications.show({
        title: 'Points Awarded!',
        message: `You earned ${points} points for ${action}!`,
        color: 'green',
      });
    } catch (error) {
      console.error('Error awarding points:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to award points',
        color: 'red',
      });
    }
  };

  const checkAchievements = async () => {
    if (!userStats) return;

    try {
      const newAchievements = await gamificationService.checkAchievements(accountId, userStats);
      
      // Show notifications for new achievements
      newAchievements.forEach((achievement) => {
        notifications.show({
          title: 'New Achievement Unlocked! 🏆',
          message: `${achievement.name}: ${achievement.description}`,
          color: 'blue',
        });
      });

      await loadUserStats(); // Reload stats to include new achievements
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  const getProgressToNextLevel = () => {
    if (!userStats) return { progress: 0, pointsNeeded: 0 };

    const currentLevel = userStats.currentLevel;
    const nextLevel = gamificationService.calculateUserLevel(userStats.totalPoints + 1);

    if (currentLevel.level === nextLevel.level) {
      return { progress: 100, pointsNeeded: 0 }; // Max level reached
    }

    const pointsForCurrentLevel = currentLevel.requiredPoints;
    const pointsForNextLevel = nextLevel.requiredPoints;
    const pointsNeeded = pointsForNextLevel - userStats.totalPoints;
    const progress = ((userStats.totalPoints - pointsForCurrentLevel) /
      (pointsForNextLevel - pointsForCurrentLevel)) * 100;

    return { progress, pointsNeeded };
  };

  return {
    userStats,
    loading,
    awardPoints,
    checkAchievements,
    getProgressToNextLevel,
  };
}
