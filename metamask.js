class MetaMaskService {
  constructor() {
    this.provider = null;
    this.account = null;
    this.init();
  }

  init() {
    if (typeof window.ethereum !== 'undefined') {
      this.provider = window.ethereum;
    }
  }

  async connect() {
    if (!this.provider) {
      throw new Error('MetaMask not found. Please install MetaMask to use this dApp!');
    }

    try {
      const accounts = await this.provider.request({
        method: 'eth_requestAccounts'
      });
      
      this.account = accounts[0];
      return this.account;
    } catch (error) {
      if (error.code === 4001) {
        throw new Error('Please connect your MetaMask wallet to continue.');
      }
      throw error;
    }
  }

  isConnected() {
    return !!this.account;
  }

  // Listen for account changes
  onAccountsChanged(callback) {
    if (this.provider) {
      this.provider.on('accountsChanged', callback);
    }
  }

  // Listen for chain changes
  onChainChanged(callback) {
    if (this.provider) {
      this.provider.on('chainChanged', callback);
    }
  }
}

// Create a global instance
const metaMaskService = new MetaMaskService();

export default metaMaskService;