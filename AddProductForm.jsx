// src/components/ProductCard.js
import React from 'react';
import { ethers } from 'ethers';
import axios from 'axios';

export default function ProductCard({ product }) {

  // UPI / INR Payment
  async function buyWithUPI() {
    try {
      const resp = await axios.post('http://localhost:5000/payments/razorpay/create-order', {
        amount: Math.round(product.priceINR * 100),
        meta: { productId: product.id || product._id }
      });

      const { key, order } = resp.data;
      const options = {
        key,
        amount: order.amount,
        order_id: order.id,
        name: 'Farmer Marketplace',
        handler: async function (response) {
          await axios.post('http://localhost:5000/payments/razorpay/verify', response);
          alert('Payment success!');
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert('UPI payment failed: ' + err.message);
    }
  }

  // Crypto Payment
  async function buyWithCrypto() {
    try {
      if (!window.ethereum) throw new Error('MetaMask required');
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contractAddress = process.env.REACT_APP_MARKETPLACE_CONTRACT;
      const abi = ["function buyWithCrypto(uint256 productId) payable"];
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const tx = await contract.buyWithCrypto(
        product.id || product._id,
        { value: ethers.parseEther(String(product.priceCrypto)) }
      );
      await tx.wait();

      // Notify backend
      await axios.post('http://localhost:5000/payments/crypto/confirm', {
        productId: product.id || product._id,
        txHash: tx.hash
      });
      alert('Crypto purchase successful');
    } catch (err) {
      alert('Crypto payment failed: ' + err.message);
    }
  }

  return (
    <div className="product-card" style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
      <h4>{product.name}</h4>
      <div>Price: ₹{product.priceINR} | Crypto: {product.priceCrypto} MATIC</div>
      <button onClick={buyWithUPI}>Buy with UPI</button>
      <button onClick={buyWithCrypto}>Buy with Crypto</button>
    </div>
  );
}
