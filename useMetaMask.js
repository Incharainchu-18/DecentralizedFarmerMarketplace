import { useState, useEffect } from 'react';

export const useMetaMask = () => {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const checkMetaMask = () => {
    return typeof window.ethereum !== 'undefined';
  };

  const connectMetaMask = async () => {
    if (!checkMetaMask()) {
      setError('MetaMask not installed');
      return null;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      setAccount(accounts[0]);
      setIsConnected(true);
      setError(null);
      return accounts[0];
    } catch (err) {
      if (err.code === 4001) {
        setError('Please connect to MetaMask to continue');
      } else {
        setError('Failed to connect to MetaMask');
      }
      return null;
    }
  };

  useEffect(() => {
    if (checkMetaMask()) {
      // Check if already connected
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
          }
        });

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setAccount(null);
          setIsConnected(false);
        } else {
          setAccount(accounts[0]);
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  return { account, isConnected, error, connectMetaMask, checkMetaMask };
};