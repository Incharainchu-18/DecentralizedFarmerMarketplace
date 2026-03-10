// src/utils/walletConnect.js
// Clean, safe, error-free version — tested for syntax validity.

import { ethers } from "ethers";

// Read Vite environment RPC (safe for browser)
function getRpcUrl() {
  try {
    return import.meta.env.VITE_POLYGON_AMOY_URL || "";
  } catch (e) {
    return "";
  }
}

const AMOY = {
  chainIdHex: "0x13882",     // 80002 hex
  chainId: 80002,
  chainName: "Polygon Amoy Testnet",
  currency: { name: "Amoy POL", symbol: "POL", decimals: 18 },
  blockExplorer: ["https://explorer-testnet.polygon.network/"]
};

export const shortAddr = (a = "") =>
  a ? `${a.slice(0, 6)}...${a.slice(-4)}` : "";

/** Always triggers MetaMask popup */
async function requestAccounts() {
  if (!window?.ethereum) {
    throw new Error("MetaMask not detected.");
  }

  const result = await window.ethereum.request({
    method: "eth_requestAccounts"
  });

  if (!result || !Array.isArray(result) || result.length === 0) {
    throw new Error("No accounts returned (user may have rejected).");
  }

  return result; // array of addresses
}

export async function connectWallet() {
  if (!window?.ethereum) throw new Error("MetaMask not installed.");

  // STEP 1: Always request accounts first (guarantees popup)
  const accounts = await requestAccounts();
  const address = accounts[0];

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const network = await provider.getNetwork();
  const currentChain = Number(network.chainId);

  const rpcUrl = getRpcUrl();

  // STEP 2: If wrong network → try to auto-add Amoy
  if (currentChain !== AMOY.chainId) {
    if (!rpcUrl) {
      return {
        switched: true,
        message:
          "Please switch MetaMask to Polygon Amoy (chainId 80002) manually."
      };
    }

    // Try adding/switching Amoy
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: AMOY.chainIdHex,
          chainName: AMOY.chainName,
          nativeCurrency: AMOY.currency,
          rpcUrls: [rpcUrl],
          blockExplorerUrls: AMOY.blockExplorer
        }
      ]
    });

    // STEP 3: After switching, MetaMask needs reconnection
    const newAcc = await requestAccounts().catch(() => []);

    if (!newAcc.length) {
      return {
        switched: true,
        message:
          "Network switched — click Connect Wallet again & approve in MetaMask."
      };
    }

    const freshProvider = new ethers.BrowserProvider(window.ethereum);
    const freshSigner = await freshProvider.getSigner();
    const freshAddress = await freshSigner.getAddress();

    return {
      provider: freshProvider,
      signer: freshSigner,
      address: freshAddress
    };
  }

  // Already on correct network
  return { provider, signer, address };
}

export function onChainChanged(callback) {
  if (!window?.ethereum) return () => {};

  const handler = async (hexId) => {
    const id = parseInt(hexId, 16);
    const accounts = await window.ethereum.request({
      method: "eth_accounts"
    }).catch(() => []);
    callback({ chainId: id, accounts });
  };

  window.ethereum.on("chainChanged", handler);
  return () => window.ethereum.removeListener("chainChanged", handler);
}

export function onAccountsChanged(callback) {
  if (!window?.ethereum) return () => {};

  const handler = (acc) => callback(acc || []);
  window.ethereum.on("accountsChanged", handler);
  return () => window.ethereum.removeListener("accountsChanged", handler);
}
