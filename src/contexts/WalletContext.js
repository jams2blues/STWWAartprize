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
        preferredNetwork: 'mainnet', // Use 'mainnet' as per your requirement
      });

      const tezos = new TezosToolkit('https://mainnet.api.tez.ie'); // Mainnet RPC URL
      tezos.setWalletProvider(wallet);

      const activeAccount = await wallet.getActiveAccount();
      if (activeAccount) {
        setWalletAddress(activeAccount.address);
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

    await wallet.requestPermissions({
      network: {
        type: 'mainnet',
      },
    });

    const address = await wallet.getPKH();
    setWalletAddress(address);
    Tezos.setWalletProvider(wallet);
  };

  const disconnectWallet = async () => {
    const wallet = new BeaconWallet({
      name: 'Save The World With Art™ Art Prize',
      preferredNetwork: 'mainnet',
    });
    await wallet.clearActiveAccount();
    setWalletAddress(null);
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
