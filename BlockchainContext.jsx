import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

// Smart Contract ABI - We'll use a simplified version for now
const MARKETPLACE_ABI = [
  "function listProduct(string name, uint256 price, uint256 quantity, string unit, string location) external returns (uint256)",
  "function buyProduct(uint256 productId, uint256 quantity) external payable",
  "function getProduct(uint256 productId) external view returns (string, uint256, uint256, string, address, string, bool)",
  "function getProducts() external view returns (uint256[])",
  "event ProductListed(uint256 indexed productId, address indexed farmer, string name, uint256 price, uint256 quantity)",
  "event ProductPurchased(uint256 indexed productId, address indexed buyer, uint256 quantity, uint256 totalPrice)"
];

// Testnet contract address (we'll use a mock for now)
const MARKETPLACE_ADDRESS = "0x0000000000000000000000000000000000000000";

const BlockchainContext = createContext();

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

export const BlockchainProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [network, setNetwork] = useState(null);

  // Connect to MetaMask
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast.error('Please install MetaMask!');
        return;
      }

      setIsLoading(true);
      
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const newSigner = await newProvider.getSigner();
      const newAccount = accounts[0];
      
      // Get network
      const network = await newProvider.getNetwork();
      
      // Initialize contract (mock for now)
      const marketplaceContract = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        newSigner
      );

      setProvider(newProvider);
      setSigner(newSigner);
      setAccount(newAccount);
      setContract(marketplaceContract);
      setIsConnected(true);
      setNetwork(network.name);

      // Save to localStorage
      localStorage.setItem('walletConnected', 'true');
      
      toast.success(`Wallet connected: ${newAccount.substring(0, 6)}...${newAccount.substring(38)}`);
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setContract(null);
    setIsConnected(false);
    setNetwork(null);
    localStorage.removeItem('walletConnected');
    toast.info('Wallet disconnected');
  };

  // Mock blockchain functions for demo
  const listProductOnBlockchain = async (productData) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return null;
    }

    try {
      setIsLoading(true);
      
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock transaction hash
      const mockTxHash = '0x' + Math.random().toString(16).substring(2, 42) + Math.random().toString(16).substring(2, 42);
      const mockBlockNumber = Math.floor(Math.random() * 1000000);
      const mockProductId = Math.floor(Math.random() * 1000);
      
      toast.success('Product listed on blockchain!');
      
      return {
        transactionHash: mockTxHash,
        blockNumber: mockBlockNumber,
        productId: mockProductId.toString(),
        status: 'success'
      };
      
    } catch (error) {
      console.error('Error listing product:', error);
      toast.error('Failed to list product on blockchain');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Mock buy product function
  const buyProductOnBlockchain = async (productId, quantity, totalPrice) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return null;
    }

    try {
      setIsLoading(true);
      
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock transaction hash
      const mockTxHash = '0x' + Math.random().toString(16).substring(2, 42) + Math.random().toString(16).substring(2, 42);
      const mockBlockNumber = Math.floor(Math.random() * 1000000);
      
      toast.success('Purchase completed on blockchain!');
      
      return {
        transactionHash: mockTxHash,
        blockNumber: mockBlockNumber,
        status: 'success'
      };
      
    } catch (error) {
      console.error('Error buying product:', error);
      toast.error('Failed to complete purchase');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Mock get product function
  const getProductFromBlockchain = async (productId) => {
    // Return mock data for demo
    return {
      id: productId,
      name: 'Mock Product',
      price: '0.1',
      quantity: '100',
      unit: 'kg',
      farmer: account,
      location: 'Karnataka',
      isActive: true
    };
  };

  // Check if wallet is already connected
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });

          if (accounts.length > 0) {
            // Auto-connect if previously connected
            const newProvider = new ethers.BrowserProvider(window.ethereum);
            const newSigner = await newProvider.getSigner();
            const network = await newProvider.getNetwork();
            
            const marketplaceContract = new ethers.Contract(
              MARKETPLACE_ADDRESS,
              MARKETPLACE_ABI,
              newSigner
            );

            setProvider(newProvider);
            setSigner(newSigner);
            setAccount(accounts[0]);
            setContract(marketplaceContract);
            setIsConnected(true);
            setNetwork(network.name);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkWalletConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  const value = {
    // State
    provider,
    signer,
    account,
    contract,
    isConnected,
    isLoading,
    network,
    
    // Methods
    connectWallet,
    disconnectWallet,
    listProductOnBlockchain,
    buyProductOnBlockchain,
    getProductFromBlockchain
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};

export default BlockchainContext;