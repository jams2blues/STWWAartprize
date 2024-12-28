// artprize.savetheworldwithart.io/src/contexts/WalletContext.js

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
        // Initialize BeaconWallet
        const beaconWallet = new BeaconWallet({
          name: 'Save The World With Art™ Art Prize',
          preferredNetwork: 'mainnet', // Ensure this matches your desired network
        });

        console.log('BeaconWallet initialized:', beaconWallet);

        // Set BeaconWallet as the wallet provider
        const tezosToolkit = new TezosToolkit('https://mainnet.api.tez.ie');
        tezosToolkit.setWalletProvider(beaconWallet);
        setTezos(tezosToolkit);

        // Set the wallet instance in state
        setWallet(beaconWallet);

        // Check for an active account
        const activeAccount = await beaconWallet.getActiveAccount();
        console.log('Active Account:', activeAccount);

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
        network: {
          type: 'mainnet', // Ensure this matches your desired network
        },
      });

      const address = await wallet.getPKH();
      setWalletAddress(address);
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error; // Propagate error to be handled in the calling component
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
