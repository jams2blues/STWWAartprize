// src/contexts/WalletContext.js

import React, { createContext, useState, useEffect } from 'react';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [Tezos, setTezos] = useState(null);
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    const initWallet = async () => {
      try {
        // Minimal config: no custom walletConnectOptions
        const beaconWallet = new BeaconWallet({
          name: 'Save The World With Art Art Prize',
          preferredNetwork: 'mainnet',
        });

        const tezosToolkit = new TezosToolkit('https://mainnet.api.tez.ie');
        tezosToolkit.setWalletProvider(beaconWallet);
        setTezos(tezosToolkit);

        setWallet(beaconWallet);

        const activeAccount = await beaconWallet.client.getActiveAccount();
        if (activeAccount) {
          setWalletAddress(activeAccount.address);
        }
      } catch (error) {
        console.error('Failed to initialize wallet:', error);
      }
    };

    initWallet();
  }, []);

  const connectWallet = async () => {
    if (!wallet) {
      console.error('Wallet not initialized');
      return;
    }
    try {
      await wallet.requestPermissions({
        network: { type: 'mainnet' },
      });
      const address = await wallet.getPKH();
      setWalletAddress(address);
      console.log('Connected Wallet Address:', address);
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    if (!wallet) {
      console.error('Wallet not initialized');
      return;
    }
    try {
      await wallet.clearActiveAccount();
      setWalletAddress(null);
      console.log('Wallet disconnected');
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
      throw error;
    }
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        Tezos,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
