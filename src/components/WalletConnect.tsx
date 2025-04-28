'use client';

import { useState, useEffect } from 'react';
import { HashConnect } from 'hashconnect';

interface WalletConnectProps {
  onConnect: (accountId: string) => void;
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [hashConnect] = useState(new HashConnect());
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [accountId, setAccountId] = useState<string>('');

  useEffect(() => {
    initializeHashConnect();
  }, []);

  const initializeHashConnect = async () => {
    try {
      const appMetadata = {
        name: "MapChain",
        description: "Property Valuation Platform",
        icon: "https://www.mapchain.com/logo.png"
      };

      const initData = await hashConnect.init(appMetadata);
      await hashConnect.connect();

      hashConnect.pairingEvent.once((pairingData) => {
        setAccountId(pairingData.accountIds[0]);
        setConnectionState('connected');
        onConnect(pairingData.accountIds[0]);
      });

    } catch (error) {
      console.error("Failed to initialize HashConnect:", error);
      setConnectionState('disconnected');
    }
  };

  const connectWallet = async () => {
    if (connectionState === 'disconnected') {
      setConnectionState('connecting');
      try {
        await hashConnect.connectToLocalWallet();
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        setConnectionState('disconnected');
      }
    }
  };

  return (
    <div className="flex items-center justify-center">
      <button
        onClick={connectWallet}
        disabled={connectionState === 'connecting'}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          connectionState === 'connected'
            ? 'bg-green-500 text-white'
            : connectionState === 'connecting'
            ? 'bg-gray-300 text-gray-600'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {connectionState === 'connected'
          ? `Connected: ${accountId.slice(0, 6)}...${accountId.slice(-4)}`
          : connectionState === 'connecting'
          ? 'Connecting...'
          : 'Connect Wallet'}
      </button>
    </div>
  );
}
