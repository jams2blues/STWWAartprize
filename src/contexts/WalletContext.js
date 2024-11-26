// src/contexts/WalletContext.js

import React, { createContext, useState, useEffect } from 'react';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [Tezos, setTezos] = useState(null);

  useEffect(() => {
    const initWallet = async () => {
      const wallet = new BeaconWallet({
        name: 'Save The World With Art™ Art Prize',
        preferredNetwork: 'mainnet',
      });

      const tezos = new TezosToolkit('https://mainnet.api.tez.ie');
      tezos.setWalletProvider(wallet);

      try {
        const address = await wallet.getPKH();
        if (address) {
          setWalletAddress(address);
        }
      } catch (error) {
        console.error('Failed to get wallet address:', error);
      }

      setTezos(tezos);
    };

    initWallet();
  }, []);

  const connectWallet = async () => {
    const wallet = new BeaconWallet({
      name: 'Save The World With Art™ Art Prize',
      preferredNetwork: 'mainnet',
    });

    try {
      await wallet.requestPermissions({
        network: {
          type: 'mainnet',
        },
      });

      const address = await wallet.getPKH();
      setWalletAddress(address);
      Tezos.setWalletProvider(wallet);
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error; // Propagate error to be handled in the calling component
    }
  };

  const disconnectWallet = async () => {
    const wallet = new BeaconWallet({
      name: 'Save The World With Art™ Art Prize',
      preferredNetwork: 'mainnet',
    });
    try {
      await wallet.clearActiveAccount();
      setWalletAddress(null);
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
      throw error; // Propagate error to be handled in the calling component
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
