import { Property } from '../types/Property';
import { Contract } from '../types/Contract';

export interface UserAchievement {
  id: string;
  name: string;
  description: string;
  points: number;
  icon: string;
  unlockedAt?: Date;
}

export interface UserLevel {
  level: number;
  title: string;
  requiredPoints: number;
  benefits: string[];
}

export interface UserStats {
  totalPoints: number;
  currentLevel: UserLevel;
  achievements: UserAchievement[];
  propertyCount: number;
  valuationsReceived: number;
  valuationsGiven: number;
  accuracy: number;
}

export class GamificationService {
  private contract: Contract;

  constructor(contract: Contract) {
    this.contract = contract;
  }
  private static readonly LEVELS: UserLevel[] = [
    {
      level: 1,
      title: 'Novice Appraiser',
      requiredPoints: 0,
      benefits: ['Basic property listing', 'Request valuations']
    },
    {
      level: 2,
      title: 'Property Scout',
      requiredPoints: 100,
      benefits: ['Enhanced property visibility', '5% discount on valuations']
    },
    {
      level: 3,
      title: 'Market Analyst',
      requiredPoints: 300,
      benefits: ['Priority in valuation queue', '10% discount on valuations']
    },
    {
      level: 4,
      title: 'Property Expert',
      requiredPoints: 1000,
      benefits: ['Featured property listings', '15% discount on valuations']
    },
    {
      level: 5,
      title: 'Master Valuator',
      requiredPoints: 3000,
      benefits: ['Access to advanced analytics', '20% discount on valuations']
    }
  ];

  private static readonly ACHIEVEMENTS: UserAchievement[] = [
    {
      id: 'first_property',
      name: 'Property Pioneer',
      description: 'List your first property',
      points: 50,
      icon: '🏠'
    },
    {
      id: 'first_valuation',
      name: 'First Appraisal',
      description: 'Receive your first property valuation',
      points: 50,
      icon: '📊'
    },
    {
      id: 'accuracy_master',
      name: 'Accuracy Master',
      description: 'Maintain 90% valuation accuracy for 10 consecutive valuations',
      points: 500,
      icon: '🎯'
    },
    {
      id: 'property_collector',
      name: 'Property Mogul',
      description: 'List 10 properties on the platform',
      points: 300,
      icon: '🏘️'
    },
    {
      id: 'valuation_expert',
      name: 'Valuation Expert',
      description: 'Complete 50 property valuations',
      points: 1000,
      icon: '⭐'
    }
  ];

  public calculateUserLevel(points: number): UserLevel {
    return GamificationService.LEVELS
      .slice()
      .reverse()
      .find(level => points >= level.requiredPoints) || GamificationService.LEVELS[0];
  }

  public async awardPoints(userId: string, action: string, points: number): Promise<void> {
    try {
      await this.contract.execute('awardPoints', [userId, action, points]);
    } catch (error) {
      console.error('Error awarding points:', error);
      throw error;
    }
  }

  public async checkAchievements(userId: string, stats: UserStats): Promise<UserAchievement[]> {
    const newAchievements: UserAchievement[] = [];

    // Check each achievement condition
    if (stats.propertyCount === 1) {
      newAchievements.push(this.getAchievement('first_property'));
    }
    if (stats.valuationsReceived === 1) {
      newAchievements.push(this.getAchievement('first_valuation'));
    }
    if (stats.propertyCount >= 10) {
      newAchievements.push(this.getAchievement('property_collector'));
    }
    if (stats.valuationsGiven >= 50) {
      newAchievements.push(this.getAchievement('valuation_expert'));
    }
    if (stats.accuracy >= 90 && stats.valuationsGiven >= 10) {
      newAchievements.push(this.getAchievement('accuracy_master'));
    }

    return newAchievements.filter(achievement => achievement !== null);
  }

  private getAchievement(id: string): UserAchievement {
    return GamificationService.ACHIEVEMENTS.find(a => a.id === id);
  }

  public async getUserStats(userId: string): Promise<UserStats> {
    try {
      const profile = await this.contract.call('getUserProfile', [userId]);
      const achievements: UserAchievement[] = [];

      // Check each achievement
      for (const achievement of GamificationService.ACHIEVEMENTS) {
        const hasAchievement = await this.contract.call('hasAchievement', [userId, achievement.id]);
        if (hasAchievement) {
          achievements.push({ ...achievement });
        }
      }

      return {
        totalPoints: Number(profile[0]),
        currentLevel: this.calculateUserLevel(Number(profile[0])),
        achievements,
        propertyCount: Number(profile[1]),
        valuationsReceived: Number(profile[2]),
        valuationsGiven: Number(profile[3]),
        accuracy: Number(profile[4])
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }
}
