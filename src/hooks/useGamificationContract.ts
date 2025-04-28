import { ContractId, AccountId, Client } from '@hashgraph/sdk';
import { useEffect, useState } from 'react';
import { useWallet, WalletState } from './useWallet';
import { notifications } from '@mantine/notifications';
import { Contract } from '../contracts/Contract';
import { GamificationContractABI } from '../contracts';

type WalletStateWithClient = WalletState & {
  client: NonNullable<WalletState['client']>;
};

const contractId = process.env.NEXT_PUBLIC_GAMIFICATION_CONTRACT_ID || '';

export function useGamificationContract() {
  const { accountId, client } = useWallet() as WalletStateWithClient;
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (client && contractId) {
      initializeContract();
    }
  }, [client, contractId]);

  const initializeContract = async () => {
    try {
      const contractAddress = ContractId.fromString(contractId).toSolidityAddress();
      
      const contract = new Contract(contractAddress, GamificationContractABI, client);
      setContract(contract);
    } catch (error) {
      console.error('Error initializing gamification contract:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to initialize gamification contract',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserProfile = async (address: string) => {
    if (!contract) return null;

    try {
      const result = await contract.call('getUserProfile', [address]);
      return {
        totalPoints: Number(result[0]),
        propertyCount: Number(result[1]),
        valuationsReceived: Number(result[2]),
        valuationsGiven: Number(result[3]),
        accuracy: Number(result[4]),
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  };

  const hasAchievement = async (address: string, achievementId: string) => {
    if (!contract) return false;

    try {
      return await contract.call('hasAchievement', [address, achievementId]);
    } catch (error) {
      console.error('Error checking achievement:', error);
      return false;
    }
  };

  const recordValuation = async (accuracy: number) => {
    if (!contract || !accountId) return;

    try {
      await contract.execute(
        'recordValuation',
        [AccountId.fromString(accountId).toSolidityAddress(), accuracy],
        { gasLimit: 100000 }
      );

      notifications.show({
        title: 'Success',
        message: 'Valuation recorded successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Error recording valuation:', error);
      throw error;
    }
  };

  const addProperty = async () => {
    if (!contract || !accountId) return;

    try {
      await contract.execute(
        'addProperty',
        [AccountId.fromString(accountId).toSolidityAddress()],
        { gasLimit: 100000 }
      );

      notifications.show({
        title: 'Success',
        message: 'Property added successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Error adding property:', error);
      throw error;
    }
  };

  const receiveValuation = async () => {
    if (!contract || !accountId) return;

    try {
      await contract.execute(
        'receiveValuation',
        [AccountId.fromString(accountId).toSolidityAddress()],
        { gasLimit: 100000 }
      );
    } catch (error) {
      console.error('Error receiving valuation:', error);
      throw error;
    }
  };

  return {
    contract,
    loading,
    getUserProfile,
    hasAchievement,
    recordValuation,
    addProperty,
    receiveValuation,
  };
}
