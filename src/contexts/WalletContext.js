// src/contexts/WalletContext.js

import React, { createContext, useState } from 'react';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { TezosToolkit } from '@taquito/taquito';

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);

  const Tezos = new TezosToolkit('https://mainnet.api.tez.ie');

  const connectWallet = async () => {
    try {
      const options = { name: 'STWWA Art Prize' };
      const beaconWallet = new BeaconWallet(options);
      Tezos.setWalletProvider(beaconWallet);
      await beaconWallet.requestPermissions({ network: { type: 'mainnet' } });
      const address = await beaconWallet.getPKH();
      setWallet(beaconWallet);
      setWalletAddress(address);
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  };

  const disconnectWallet = async () => {
    if (wallet) {
      await wallet.clearActiveAccount();
      setWallet(null);
      setWalletAddress(null);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        walletAddress,
        connectWallet,
        disconnectWallet,
        Tezos,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
