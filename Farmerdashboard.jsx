// src/components/FarmerDashboard.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Web3 from 'web3';
import { ethers } from 'ethers';
import axios from 'axios';
import './FarmerDashboard.css';

// Smart Contract ABI and Address
const PRODUCT_REGISTRY_ABI = [
  "event ProductRegistered(uint256 indexed productId, address indexed farmer, string name, string category, uint256 price, uint256 quantity, string memory batchNumber, string memory verificationId)",
  "event ProductVerified(uint256 indexed productId, address indexed admin)",
  "function registerProduct(string memory name, string category, uint256 price, uint256 quantity, string memory description, string memory batchNumber, string memory verificationId) external returns (uint256)",
  "function verifyProduct(uint256 productId) external",
  "function getProduct(uint256 productId) external view returns (address, string memory, string memory, uint256, uint256, string memory, string memory, string memory, bool, uint256)",
  "function getProductsByFarmer(address farmer) external view returns (uint256[] memory)",
  "function getAllProducts() external view returns (uint256[] memory)",
  "function getPendingProducts() external view returns (uint256[] memory)"
];

const CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890";

export default function FarmerDashboard() {
  const navigate = useNavigate();

  // UI state
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Chat
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimerRef = useRef(null);

  // User / loading
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Products state - Enhanced
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    variety: '',
    price: '',
    quantity: '',
    unit: 'kg',
    description: '',
    harvestDate: '',
    expiryDate: '',
    organicCertified: false,
    location: '',
    image: null,
    batchNumber: '',
    verificationId: ''
  });
  const [showProductModal, setShowProductModal] = useState(false);
  const [verificationId, setVerificationId] = useState('');
  const [verifiedProduct, setVerifiedProduct] = useState(null);

  // APMC Market state
  const [marketPrices, setMarketPrices] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState('');

  // Weather state
  const [weatherData, setWeatherData] = useState(null);
  const [weatherForecast, setWeatherForecast] = useState([]);
  const [weatherAlerts, setWeatherAlerts] = useState([]);

  // Community state
  const [communityGroups, setCommunityGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);

  // Govt Schemes state
  const [govtSchemes, setGovtSchemes] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [schemeCategories, setSchemeCategories] = useState([]);

  // Admin state
  const [adminStats, setAdminStats] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [verifiedProducts, setVerifiedProducts] = useState([]);
  const [adminLogs, setAdminLogs] = useState([]);

  // Blockchain state
  const [isBlockchainConnected, setIsBlockchainConnected] = useState(false);
  const [blockchainTx, setBlockchainTx] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [network, setNetwork] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletBalance, setWalletBalance] = useState('0');
  const [gasPrice, setGasPrice] = useState(null);

  // Farmer Dashboard enhancements
  const [farmAnalytics, setFarmAnalytics] = useState({
    revenueTrend: [],
    cropYield: {},
    waterUsage: {},
    pestAlerts: []
  });
  
  const [marketInsights, setMarketInsights] = useState({
    bestSelling: [],
    pricePredictions: [],
    demandTrends: []
  });

  const [irrigationSchedule, setIrrigationSchedule] = useState([]);
  const [pestControlTips, setPestControlTips] = useState([]);
  const [carbonCredit, setCarbonCredit] = useState(0);

  // Product categories for dropdown
  const productCategories = [
    'Cereals', 'Vegetables', 'Fruits', 'Pulses', 'Spices', 
    'Oil Seeds', 'Medicinal Plants', 'Flowers', 'Others'
  ];

  // Product units
  const productUnits = ['kg', 'quintal', 'ton', 'piece', 'bunch', 'litre'];

  // refs
  const chatbotRef = useRef(null);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const productModalRef = useRef(null);
  const communityRef = useRef(null);

  // Enhanced modules with proper navigation
  const modules = useMemo(() => [
    { 
      id: 1,
      name: "My Products", 
      description: "Manage your products & blockchain verification", 
      icon: "📦", 
      color: "blue",
      tab: "products"
    },
    { 
      id: 2,
      name: "Add Product", 
      description: "Register new product to blockchain", 
      icon: "➕", 
      color: "green",
      tab: "add-product"
    },
    { 
      id: 3,
      name: "Verify Product", 
      description: "Verify product using blockchain ID", 
      icon: "✅", 
      color: "teal",
      tab: "verify"
    },
    { 
      id: 4,
      name: "APMC Markets", 
      description: "Live commodity prices & trends", 
      icon: "📊", 
      color: "orange",
      tab: "apmc"
    },
    { 
      id: 5,
      name: "Weather Intelligence", 
      description: "Real-time weather & alerts", 
      icon: "🌤️", 
      color: "cyan",
      tab: "weather"
    },
    { 
      id: 6,
      name: "Market Insights", 
      description: "Price predictions & demand trends", 
      icon: "📈", 
      color: "purple",
      tab: "insights"
    },
    { 
      id: 7,
      name: "Farmer Community", 
      description: "Live chat with farmers", 
      icon: "👥", 
      color: "pink",
      tab: "community"
    },
    { 
      id: 8,
      name: "Govt Schemes", 
      description: "Live scheme updates & applications", 
      icon: "🏛️", 
      color: "indigo",
      tab: "govt-schemes"
    },
    {
      id: 9,
      name: "Carbon Credits",
      description: "Track & sell carbon credits",
      icon: "🌍",
      color: "emerald",
      tab: "carbon"
    },
    {
      id: 10,
      name: "Admin Panel",
      description: "Product verification & user management",
      icon: "👨‍💼",
      color: "red",
      adminOnly: true,
      tab: "admin"
    }
  ], []);

  const quickStats = useMemo(() => [
    { 
      id: 1,
      label: "Total Products", 
      value: products.length.toString(), 
      change: `${products.filter(p => p.status === 'pending').length} pending`,
      icon: "📦",
      description: "Blockchain registered products"
    },
    { 
      id: 2,
      label: "Verified Products", 
      value: products.filter(p => p.status === 'verified').length.toString(), 
      change: "+2 this week",
      icon: "✅",
      description: "Blockchain verified"
    },
    { 
      id: 3,
      label: "Total Revenue", 
      value: `₹${products.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0).toLocaleString()}`, 
      change: "+12%",
      icon: "💰",
      description: "Estimated value"
    },
    { 
      id: 4,
      label: "Carbon Credits", 
      value: `${carbonCredit} tons`, 
      change: "+5%",
      icon: "🌍",
      description: "CO2 sequestered"
    }
  ], [products, carbonCredit]);

  // Generate unique batch number
  const generateBatchNumber = () => {
    const prefix = 'BATCH';
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `${prefix}-${year}${month}${day}-${random}`;
  };

  // Generate unique verification ID
  const generateVerificationId = () => {
    const prefix = 'FARM';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  // Initialize batch number and verification ID when product modal opens
  useEffect(() => {
    if (showProductModal && !newProduct.batchNumber) {
      const batchNum = generateBatchNumber();
      const verifyId = generateVerificationId();
      setNewProduct(prev => ({
        ...prev,
        batchNumber: batchNum,
        verificationId: verifyId
      }));
    }
  }, [showProductModal]);

  // Real-time data fetching functions
  const fetchAPMCPrices = async () => {
    try {
      const mockPrices = [
        { id: 1, commodity: "Wheat", market: "Delhi APMC", price: "₹2,450/quintal", change: "+2.5%", trend: "up", minPrice: "2400", maxPrice: "2500", arrival: "Today" },
        { id: 2, commodity: "Rice", market: "Punjab APMC", price: "₹3,200/quintal", change: "+1.8%", trend: "up", minPrice: "3100", maxPrice: "3300", arrival: "Today" },
        { id: 3, commodity: "Tomato", market: "Bangalore APMC", price: "₹1,800/quintal", change: "+15.2%", trend: "up", minPrice: "1700", maxPrice: "1900", arrival: "Today" },
        { id: 4, commodity: "Potato", market: "Haryana APMC", price: "₹1,200/quintal", change: "-3.2%", trend: "down", minPrice: "1150", maxPrice: "1250", arrival: "Today" },
        { id: 5, commodity: "Onion", market: "Maharashtra APMC", price: "₹1,500/quintal", change: "+8.7%", trend: "up", minPrice: "1400", maxPrice: "1600", arrival: "Today" },
        { id: 6, commodity: "Cotton", market: "Gujarat APMC", price: "₹6,800/quintal", change: "+4.3%", trend: "up", minPrice: "6700", maxPrice: "6900", arrival: "Today" },
      ];
      setMarketPrices(mockPrices);
    } catch (error) {
      console.error('Error fetching APMC prices:', error);
    }
  };

  const fetchWeatherData = async () => {
    try {
      const mockWeather = {
        temperature: 28,
        condition: "Partly Cloudy",
        humidity: "65%",
        wind: "12 km/h",
        rainfall: "0 mm",
        pressure: "1013 hPa",
        feelsLike: 30
      };
      
      const mockForecast = [
        { day: "Today", high: 28, low: 18, condition: "Partly Cloudy", rain: "10%", icon: "🌤️" },
        { day: "Tomorrow", high: 30, low: 19, condition: "Sunny", rain: "0%", icon: "☀️" },
        { day: "Wed", high: 29, low: 20, condition: "Cloudy", rain: "30%", icon: "☁️" },
        { day: "Thu", high: 27, low: 19, condition: "Rainy", rain: "80%", icon: "🌧️" },
        { day: "Fri", high: 26, low: 18, condition: "Thunderstorms", rain: "90%", icon: "⛈️" }
      ];
      
      setWeatherData(mockWeather);
      setWeatherForecast(mockForecast);
      
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  };

  const fetchWeatherAlerts = async () => {
    try {
      const mockAlerts = [
        { id: 1, severity: "Moderate", headline: "Heat Wave Alert", description: "Temperature expected to rise above 40°C", area: "Northern Karnataka" },
        { id: 2, severity: "Low", headline: "Wind Advisory", description: "Wind speed may reach 25-30 km/h", area: "Coastal Regions" }
      ];
      setWeatherAlerts(mockAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const fetchGovtSchemes = async () => {
    try {
      const mockSchemes = [
        {
          id: 1,
          name: "PM-KISAN Scheme",
          description: "Income support scheme for farmers",
          eligibility: "All farmer families",
          benefits: "₹6,000 per year in three installments",
          deadline: "31st December 2024",
          category: "central",
          status: "active"
        },
        {
          id: 2,
          name: "Karnataka Raitha Belaku",
          description: "Crop insurance and support scheme",
          eligibility: "Karnataka farmers",
          benefits: "Premium subsidy and crop insurance",
          deadline: "Ongoing",
          category: "state",
          status: "active"
        }
      ];
      
      setGovtSchemes(mockSchemes);
      setFilteredSchemes(mockSchemes);
      setSchemeCategories(['central', 'state']);
      
    } catch (error) {
      console.error('Error fetching schemes:', error);
    }
  };

  const fetchMarketInsights = async () => {
    try {
      const mockInsights = {
        bestSelling: [
          { commodity: "Tomato", demand: 150 },
          { commodity: "Onion", demand: 120 },
          { commodity: "Potato", demand: 100 }
        ],
        pricePredictions: [
          { commodity: "Wheat", current: 2450, predicted: 2600, change: 6.12 },
          { commodity: "Rice", current: 3200, predicted: 3350, change: 4.69 },
          { commodity: "Tomato", current: 1800, predicted: 2100, change: 16.67 }
        ],
        demandTrends: [
          { commodity: "Tomato", demand: 85 },
          { commodity: "Onion", demand: 72 },
          { commodity: "Potato", demand: 65 }
        ]
      };
      setMarketInsights(mockInsights);
    } catch (error) {
      console.error('Error fetching market insights:', error);
    }
  };

  const fetchIrrigationSchedule = async () => {
    try {
      const mockSchedule = [
        { crop: 'Wheat', nextIrrigation: 'Tomorrow 6 AM', duration: '2 hours', method: 'Drip', waterRequired: '5000 liters' },
        { crop: 'Rice', nextIrrigation: 'Today 4 PM', duration: '3 hours', method: 'Flood', waterRequired: '8000 liters' }
      ];
      setIrrigationSchedule(mockSchedule);
    } catch (error) {
      console.error('Error fetching irrigation:', error);
    }
  };

  const fetchPestControlTips = async () => {
    try {
      const mockTips = [
        "Use neem oil spray for aphid control",
        "Install yellow sticky traps for whiteflies",
        "Practice crop rotation to break pest cycles",
        "Use garlic-chili spray as natural pesticide"
      ];
      setPestControlTips(mockTips);
    } catch (error) {
      console.error('Error fetching pest tips:', error);
    }
  };

  const calculateCarbonCredit = async () => {
    try {
      setCarbonCredit(15.5);
    } catch (error) {
      console.error('Error calculating carbon:', error);
      setCarbonCredit(15.5);
    }
  };

  // Blockchain Functions
  const initializeWeb3 = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        // Initialize contract
        const contractInstance = new web3Instance.eth.Contract(
          PRODUCT_REGISTRY_ABI,
          CONTRACT_ADDRESS
        );
        setContract(contractInstance);

        // Check current network
        const chainId = await web3Instance.eth.getChainId();
        setNetwork(getNetworkName(chainId));

        // Get gas price
        const gasPrice = await web3Instance.eth.getGasPrice();
        setGasPrice(web3Instance.utils.fromWei(gasPrice, 'gwei'));

        // Check if already connected
        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsBlockchainConnected(true);
          await getWalletBalance(accounts[0]);
          await loadBlockchainProducts();
        }

        // Event listeners
        window.ethereum.on('accountsChanged', async (accounts) => {
          setAccount(accounts[0] || '');
          setIsBlockchainConnected(!!accounts[0]);
          if (accounts[0]) {
            await getWalletBalance(accounts[0]);
            await loadBlockchainProducts();
          } else {
            setWalletBalance('0');
          }
        });

        window.ethereum.on('chainChanged', (chainId) => {
          setNetwork(getNetworkName(parseInt(chainId)));
          window.location.reload();
        });

      } catch (error) {
        console.error('Error initializing Web3:', error);
      }
    } else {
      console.warn('MetaMask not installed');
    }
  };

  const getNetworkName = (chainId) => {
    const networks = {
      1: 'Ethereum Mainnet',
      5: 'Goerli Testnet',
      80001: 'Polygon Mumbai',
      80002: 'Polygon Amoy',
      137: 'Polygon Mainnet',
      56: 'Binance Smart Chain',
      97: 'BSC Testnet',
      42161: 'Arbitrum',
      10: 'Optimism'
    };
    return networks[chainId] || `Chain ${chainId}`;
  };

  const getWalletBalance = async (address) => {
    try {
      if (web3) {
        const balance = await web3.eth.getBalance(address);
        const balanceInEth = web3.utils.fromWei(balance, 'ether');
        setWalletBalance(parseFloat(balanceInEth).toFixed(4));
      }
    } catch (error) {
      console.error('Error getting wallet balance:', error);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use blockchain features!');
      window.open('https://metamask.io/download.html', '_blank');
      return;
    }

    setIsConnecting(true);
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
      setIsBlockchainConnected(true);
      await getWalletBalance(accounts[0]);
      await loadBlockchainProducts();
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet: ' + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToPolygonAmoy = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x13882' }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x13882',
                chainName: 'Polygon Amoy Testnet',
                rpcUrls: ['https://rpc-amoy.polygon.technology'],
                blockExplorerUrls: ['https://amoy.polygonscan.com'],
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18
                },
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding network:', addError);
        }
      }
    }
  };

  const loadBlockchainProducts = async () => {
    if (!contract || !account) return;

    try {
      // Mock products for demo
      const mockProducts = [
        {
          id: '1',
          name: 'Organic Wheat Sharbati',
          category: 'Cereals',
          variety: 'Sharbati',
          price: '2450',
          quantity: '100',
          unit: 'kg',
          description: 'High quality organic wheat grown with natural fertilizers',
          harvestDate: '2024-01-15',
          expiryDate: '2024-12-15',
          organicCertified: true,
          location: 'Punjab, India',
          image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300',
          batchNumber: 'BATCH-240115-ABC123',
          verificationId: 'FARM-ABC123-XYZ789',
          isVerified: true,
          timestamp: new Date('2024-01-15'),
          farmer: account,
          status: 'verified',
          blockchainHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
        },
        {
          id: '2',
          name: 'Fresh Organic Tomatoes',
          category: 'Vegetables',
          variety: 'Cherry',
          price: '1800',
          quantity: '50',
          unit: 'kg',
          description: 'Freshly harvested organic cherry tomatoes',
          harvestDate: '2024-01-20',
          expiryDate: '2024-02-20',
          organicCertified: true,
          location: 'Maharashtra, India',
          image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300',
          batchNumber: 'BATCH-240120-DEF456',
          verificationId: 'FARM-DEF456-GHI789',
          isVerified: false,
          timestamp: new Date('2024-01-20'),
          farmer: account,
          status: 'pending'
        }
      ];
      setProducts(mockProducts);

      // If admin, load pending products
      if (user?.role === 'admin') {
        const mockPending = [
          {
            id: '3',
            name: 'Premium Basmati Rice',
            category: 'Cereals',
            variety: 'Basmati 1121',
            price: '3200',
            quantity: '80',
            unit: 'kg',
            description: 'Premium quality Basmati rice for export',
            harvestDate: '2024-01-25',
            expiryDate: '2025-01-25',
            organicCertified: false,
            location: 'Uttar Pradesh, India',
            image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300',
            batchNumber: 'BATCH-240125-GHI789',
            verificationId: 'FARM-GHI789-JKL012',
            farmer: '0xabcdef1234567890abcdef1234567890abcdef12',
            timestamp: new Date('2024-01-25')
          }
        ];
        setPendingProducts(mockPending);
      }

    } catch (error) {
      console.error('Error loading blockchain products:', error);
    }
  };

  // Register product on blockchain
  const registerProductOnBlockchain = async (productData) => {
    if (!contract || !account) {
      throw new Error('Wallet not connected');
    }

    try {
      // Simulate blockchain transaction
      const mockTransaction = {
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
        gasUsed: Math.floor(Math.random() * 100000) + 50000,
        status: true
      };

      setBlockchainTx(mockTransaction.transactionHash);
      
      // Simulate transaction confirmation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add product to local state
      const newProductObj = {
        id: Date.now().toString(),
        ...productData,
        status: 'pending',
        isVerified: false,
        timestamp: new Date(),
        farmer: account,
        blockchainHash: mockTransaction.transactionHash,
        blockNumber: mockTransaction.blockNumber
      };

      setProducts(prev => [...prev, newProductObj]);
      
      if (user?.role === 'admin') {
        setPendingProducts(prev => [...prev, newProductObj]);
      }
      
      return mockTransaction;
    } catch (error) {
      console.error('Blockchain registration failed:', error);
      throw error;
    }
  };

  // Admin: Verify product on blockchain
  const verifyProductOnBlockchain = async (productId) => {
    try {
      // Mock verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update product status
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, status: 'verified', isVerified: true } : p
      ));
      
      setPendingProducts(prev => prev.filter(p => p.id !== productId));
      setVerifiedProducts(prev => [
        ...prev,
        { ...pendingProducts.find(p => p.id === productId), status: 'verified' }
      ]);

      // Update admin logs
      const log = {
        id: Date.now(),
        action: 'product_verified',
        productId,
        admin: user?.name || 'Admin',
        timestamp: new Date().toISOString()
      };
      setAdminLogs(prev => [log, ...prev]);

      addNotification(`Product ${productId} verified successfully`, 'success');
      
    } catch (error) {
      console.error('Product verification failed:', error);
      throw error;
    }
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Initialize Web3
        await initializeWeb3();
        
        // Load user data
        const savedUser = localStorage.getItem('farmerProfile');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          
          // Fetch real-time data
          await Promise.all([
            fetchAPMCPrices(),
            fetchWeatherData(),
            fetchWeatherAlerts(),
            fetchGovtSchemes(),
            fetchMarketInsights(),
            fetchIrrigationSchedule(),
            fetchPestControlTips(),
            calculateCarbonCredit()
          ]);

          // Load notifications
          const savedNotifications = localStorage.getItem(`notifications_${userData.id}`);
          if (savedNotifications) {
            setNotifications(JSON.parse(savedNotifications));
          }

          // Load community groups
          const mockGroups = [
            { id: 1, name: "Organic Farmers", members: 245, unread: 3, lastActive: "2 min ago" },
            { id: 2, name: "Wheat Growers", members: 189, unread: 0, lastActive: "1 hour ago" },
            { id: 3, name: "Vegetable Farmers", members: 312, unread: 7, lastActive: "5 min ago" }
          ];
          setCommunityGroups(mockGroups);

        } else {
          // Mock user for demo
          const mockUser = {
            id: 1,
            name: "Suchitra",
            email: "Suchitra@Annadathafarms.com",
            farmName: "Annadatha Farms",
            location: "Karnataka, India",
            joinDate: "2025-01-15",
            avatar: "👨‍🌾",
            role: "farmer"
          };
          setUser(mockUser);
          localStorage.setItem('farmerProfile', JSON.stringify(mockUser));
        }

      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load dashboard. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();

    // Update time every minute
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 60000);
    
    // Refresh market prices every 5 minutes
    const marketInterval = setInterval(fetchAPMCPrices, 300000);
    
    // Refresh weather every 15 minutes
    const weatherInterval = setInterval(fetchWeatherData, 900000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(marketInterval);
      clearInterval(weatherInterval);
    };
  }, []);

  // Navigation
  const navigateToModule = useCallback((tabName) => {
    setActiveTab(tabName);
    setShowMobileMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToDashboard = useCallback(() => {
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Product Management
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.category || !newProduct.price || !newProduct.quantity) {
      alert('Please fill in all required fields');
      return;
    }

    if (!isBlockchainConnected) {
      const connect = confirm('Connect wallet to add product to blockchain. Connect now?');
      if (connect) await connectWallet();
      return;
    }

    try {
      // Register on blockchain
      const blockchainResult = await registerProductOnBlockchain(newProduct);

      // Reset form
      setNewProduct({
        name: '',
        category: '',
        variety: '',
        price: '',
        quantity: '',
        unit: 'kg',
        description: '',
        harvestDate: '',
        expiryDate: '',
        organicCertified: false,
        location: '',
        image: null,
        batchNumber: generateBatchNumber(),
        verificationId: generateVerificationId()
      });
      setShowProductModal(false);

      addNotification(`Product "${newProduct.name}" registered successfully! Batch: ${newProduct.batchNumber}`, 'success');

    } catch (error) {
      alert('Failed to register product: ' + error.message);
    }
  };

  // Verification
  const verifyProduct = async () => {
    if (!verificationId.trim()) {
      alert('Please enter a verification ID');
      return;
    }

    try {
      // Search in products
      const foundProduct = products.find(p => 
        p.verificationId === verificationId ||
        p.id === verificationId || 
        p.blockchainHash?.includes(verificationId) ||
        p.batchNumber?.includes(verificationId)
      );

      if (foundProduct) {
        setVerifiedProduct(foundProduct);
      } else {
        // Mock verification for demo
        const mockProduct = {
          name: 'Organic Wheat Sharbati',
          category: 'Cereals',
          variety: 'Sharbati',
          price: '₹2,450/quintal',
          quantity: '100 kg',
          description: 'High quality organic wheat grown with natural fertilizers',
          harvestDate: '2024-01-15',
          expiryDate: '2024-12-15',
          organicCertified: true,
          location: 'Punjab, India',
          batchNumber: verificationId.startsWith('BATCH') ? verificationId : `BATCH-${verificationId}`,
          verificationId: verificationId,
          isVerified: true,
          timestamp: new Date('2024-01-15'),
          blockchainHash: `0x${verificationId}${Math.random().toString(16).substr(2, 32)}`,
          status: 'verified'
        };
        setVerifiedProduct(mockProduct);
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('Error verifying product');
    }
  };

  // Admin Functions
  const handleVerifyProduct = async (productId) => {
    try {
      await verifyProductOnBlockchain(productId);
    } catch (error) {
      alert('Failed to verify product: ' + error.message);
    }
  };

  const handleRejectProduct = (productId) => {
    if (window.confirm('Are you sure you want to reject this product?')) {
      setPendingProducts(prev => prev.filter(p => p.id !== productId));
      
      // Update product status
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, status: 'rejected' } : p
      ));
      
      // Add to admin logs
      const log = {
        id: Date.now(),
        action: 'product_rejected',
        productId,
        admin: user?.name || 'Admin',
        timestamp: new Date().toISOString()
      };
      setAdminLogs(prev => [log, ...prev]);
      
      addNotification(`Product ${productId} rejected`, 'warning');
    }
  };

  // Helper functions
  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      read: false,
      time: 'Just now'
    };
    
    setNotifications(prev => [notification, ...prev]);
  };

  const getWeatherIcon = (condition) => {
    const icons = {
      Clear: '☀️',
      Clouds: '☁️',
      Rain: '🌧️',
      Drizzle: '🌦️',
      Thunderstorm: '⛈️',
      Snow: '❄️',
      Mist: '🌫️',
      'Partly Cloudy': '🌤️',
      Sunny: '☀️',
      Cloudy: '☁️',
      Rainy: '🌧️'
    };
    return icons[condition] || '🌤️';
  };

  // Filter schemes
  const filterSchemes = (category) => {
    if (category === 'all') {
      setFilteredSchemes(govtSchemes);
    } else {
      setFilteredSchemes(govtSchemes.filter(scheme => scheme.category === category));
    }
  };

  // Community Functions
  const joinGroup = (groupId) => {
    setActiveGroup(communityGroups.find(g => g.id === groupId));
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !activeGroup) return;

    const message = {
      id: Date.now(),
      user: user?.name || 'Farmer',
      message: newMessage,
      time: 'Just now',
      group: activeGroup.name
    };

    setGroupMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  // Chat functions
  const handleSendMessage = useCallback(async (e) => {
    e?.preventDefault();
    const message = chatInput.trim();
    if (!message) return;

    const userMessage = {
      id: Date.now(),
      content: message,
      isUser: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    setTimeout(() => {
      const aiResponses = [
        "Based on current market trends, I recommend focusing on tomato cultivation this season.",
        "Your soil report shows good potential for organic farming. Consider compost application.",
        "Weather forecast suggests rainfall in 3 days. Plan your irrigation accordingly.",
        "Current wheat prices are favorable. Consider selling your stock this week.",
        "I notice your crop health is improving. Continue with the current practices."
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      const aiMessage = {
        id: Date.now() + 1,
        content: randomResponse,
        isUser: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      setIsChatLoading(false);
    }, 1500);
  }, [chatInput]);

  const clearChat = useCallback(() => {
    setChatMessages([]);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('farmerProfile');
    navigate('/login');
  }, [navigate]);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewProduct(prev => ({
          ...prev,
          image: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setShowMobileMenu(false);
      }
      if (chatbotRef.current && !chatbotRef.current.contains(e.target)) {
        setShowChatbot(false);
      }
      if (productModalRef.current && !productModalRef.current.contains(e.target)) {
        setShowProductModal(false);
      }
    };

    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowProfileMenu(false);
        setShowMobileMenu(false);
        setShowChatbot(false);
        setShowProductModal(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatbotRef.current) {
      chatbotRef.current.scrollTop = chatbotRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Debounced search
  const handleSearchChange = (value) => {
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setSearchQuery(value);
    }, 300);
  };

  // Filter modules based on search and user role
  const filteredModules = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let filtered = modules;
    
    // Filter by role
    if (user?.role !== 'admin') {
      filtered = filtered.filter(module => !module.adminOnly);
    }
    
    // Filter by search query
    if (query) {
      filtered = filtered.filter(module =>
        module.name.toLowerCase().includes(query) ||
        module.description.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [modules, searchQuery, user]);

  // Render different content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return (
          <div className="products-tab">
            <div className="back-to-dashboard">
              <button 
                className="back-button"
                onClick={navigateToDashboard}
              >
                ← Back to Dashboard
              </button>
            </div>
            <div className="tab-header">
              <h2>📦 My Products</h2>
              <div className="header-actions">
                <div className="wallet-connection">
                  {!isBlockchainConnected ? (
                    <button 
                      className="connect-wallet-btn"
                      onClick={connectWallet}
                      disabled={isConnecting}
                    >
                      {isConnecting ? 'Connecting...' : '🔗 Connect Wallet'}
                    </button>
                  ) : (
                    <div className="connected-wallet-info">
                      <div className="wallet-details">
                        <span className="wallet-address">
                          {account.substring(0, 6)}...{account.substring(account.length - 4)}
                        </span>
                        <span className="wallet-balance">{walletBalance} MATIC</span>
                      </div>
                    </div>
                  )}
                </div>
                <button 
                  className="btn-primary"
                  onClick={() => navigateToModule('add-product')}
                >
                  ＋ Add New Product
                </button>
              </div>
            </div>
            
            {products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>No products yet</h3>
                <p>Add your first product to the blockchain</p>
                <button 
                  className="btn-primary"
                  onClick={() => navigateToModule('add-product')}
                >
                  Add First Product
                </button>
              </div>
            ) : (
              <div className="products-categories">
                {/* Pending Verification Section */}
                {products.filter(p => p.status === 'pending').length > 0 && (
                  <div className="category-section">
                    <div className="section-header">
                      <h3>⏳ Pending Verification ({products.filter(p => p.status === 'pending').length})</h3>
                      <button className="view-all">View All →</button>
                    </div>
                    <div className="products-grid">
                      {products.filter(p => p.status === 'pending').map(product => (
                        <div key={product.id} className="product-card pending">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="product-image" />
                          ) : (
                            <div className="product-image-placeholder">🌾</div>
                          )}
                          <div className="product-info">
                            <div className="product-header">
                              <h4>{product.name}</h4>
                              <span className="status-badge pending">Pending</span>
                            </div>
                            <p className="product-category">{product.category} • {product.variety}</p>
                            <p className="product-description">{product.description}</p>
                            <div className="product-details">
                              <div className="detail-row">
                                <span className="detail-label">Price:</span>
                                <span className="detail-value">₹{product.price}/{product.unit}</span>
                              </div>
                              <div className="detail-row">
                                <span className="detail-label">Quantity:</span>
                                <span className="detail-value">{product.quantity} {product.unit}</span>
                              </div>
                              {product.batchNumber && (
                                <div className="detail-row">
                                  <span className="detail-label">Batch:</span>
                                  <span className="detail-value batch-number">{product.batchNumber}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Verified Products Section */}
                <div className="category-section">
                  <div className="section-header">
                    <h3>✅ Verified Products ({products.filter(p => p.status === 'verified').length})</h3>
                    <button className="view-all">View All →</button>
                  </div>
                  <div className="products-grid">
                    {products.filter(p => p.status === 'verified').map(product => (
                      <div key={product.id} className="product-card verified">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="product-image" />
                        ) : (
                          <div className="product-image-placeholder">🌾</div>
                        )}
                        <div className="product-info">
                          <div className="product-header">
                            <h4>{product.name}</h4>
                            <span className="status-badge verified">Verified</span>
                          </div>
                          <p className="product-category">{product.category} • {product.variety}</p>
                          <p className="product-description">{product.description}</p>
                          <div className="product-details">
                            <div className="detail-row">
                              <span className="detail-label">Price:</span>
                              <span className="detail-value">₹{product.price}/{product.unit}</span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Quantity:</span>
                              <span className="detail-value">{product.quantity} {product.unit}</span>
                            </div>
                            {product.batchNumber && (
                              <div className="detail-row">
                                <span className="detail-label">Batch:</span>
                                <span className="detail-value batch-number">{product.batchNumber}</span>
                              </div>
                            )}
                            {product.verificationId && (
                              <div className="detail-row">
                                <span className="detail-label">Verification ID:</span>
                                <span className="detail-value verification-id">{product.verificationId}</span>
                              </div>
                            )}
                          </div>
                          <div className="blockchain-info">
                            <span className="blockchain-hash">🔗 {product.blockchainHash?.substring(0, 20)}...</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'add-product':
        return (
          <div className="add-product-tab">
            <div className="back-to-dashboard">
              <button 
                className="back-button"
                onClick={navigateToDashboard}
              >
                ← Back to Dashboard
              </button>
            </div>
            
            <div className="tab-content-wrapper">
              <div className="form-header">
                <h2>➕ Add New Product</h2>
                <p>Register your product on blockchain for transparency and verification</p>
              </div>

              {!isBlockchainConnected && (
                <div className="blockchain-alert">
                  <div className="alert-icon">🔗</div>
                  <div className="alert-content">
                    <h4>Wallet Not Connected</h4>
                    <p>Connect your wallet to register products on blockchain</p>
                    <button className="btn-primary" onClick={connectWallet}>
                      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                  </div>
                </div>
              )}

              <div className="form-container">
                <div className="form-section">
                  <h3>Basic Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Product Name *</label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct(prev => ({...prev, name: e.target.value}))}
                        placeholder="e.g., Organic Wheat Sharbati"
                        disabled={!isBlockchainConnected}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Category *</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct(prev => ({...prev, category: e.target.value}))}
                        disabled={!isBlockchainConnected}
                      >
                        <option value="">Select Category</option>
                        {productCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Variety/Type</label>
                      <input
                        type="text"
                        value={newProduct.variety}
                        onChange={(e) => setNewProduct(prev => ({...prev, variety: e.target.value}))}
                        placeholder="e.g., Sharbati, Basmati 1121"
                        disabled={!isBlockchainConnected}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Location *</label>
                      <input
                        type="text"
                        value={newProduct.location}
                        onChange={(e) => setNewProduct(prev => ({...prev, location: e.target.value}))}
                        placeholder="e.g., Punjab, India"
                        disabled={!isBlockchainConnected}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Pricing & Quantity</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Price (₹) *</label>
                      <input
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct(prev => ({...prev, price: e.target.value}))}
                        placeholder="e.g., 2450"
                        min="0"
                        disabled={!isBlockchainConnected}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Quantity *</label>
                      <input
                        type="number"
                        value={newProduct.quantity}
                        onChange={(e) => setNewProduct(prev => ({...prev, quantity: e.target.value}))}
                        placeholder="e.g., 100"
                        min="0"
                        disabled={!isBlockchainConnected}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Unit *</label>
                      <select
                        value={newProduct.unit}
                        onChange={(e) => setNewProduct(prev => ({...prev, unit: e.target.value}))}
                        disabled={!isBlockchainConnected}
                      >
                        <option value="">Select Unit</option>
                        {productUnits.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Dates & Certification</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Harvest Date</label>
                      <input
                        type="date"
                        value={newProduct.harvestDate}
                        onChange={(e) => setNewProduct(prev => ({...prev, harvestDate: e.target.value}))}
                        disabled={!isBlockchainConnected}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="date"
                        value={newProduct.expiryDate}
                        onChange={(e) => setNewProduct(prev => ({...prev, expiryDate: e.target.value}))}
                        disabled={!isBlockchainConnected}
                      />
                    </div>
                    
                    <div className="form-group checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={newProduct.organicCertified}
                          onChange={(e) => setNewProduct(prev => ({...prev, organicCertified: e.target.checked}))}
                          disabled={!isBlockchainConnected}
                        />
                        <span>Organic Certified</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Product Details</h3>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct(prev => ({...prev, description: e.target.value}))}
                      placeholder="Describe your product in detail..."
                      rows="4"
                      disabled={!isBlockchainConnected}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Product Image</h3>
                  <div className="image-upload-container">
                    {newProduct.image ? (
                      <div className="image-preview">
                        <img src={newProduct.image} alt="Product preview" />
                        <button 
                          type="button" 
                          className="remove-image"
                          onClick={() => setNewProduct(prev => ({...prev, image: null}))}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="image-upload-placeholder">
                        <div className="upload-icon">📷</div>
                        <p>Upload product image</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={!isBlockchainConnected}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-section">
                  <h3>Blockchain Information</h3>
                  <div className="blockchain-info-display">
                    <div className="info-item">
                      <span className="info-label">Batch Number:</span>
                      <span className="info-value batch-number-display">{newProduct.batchNumber || 'Generating...'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Verification ID:</span>
                      <span className="info-value verification-id-display">{newProduct.verificationId || 'Generating...'}</span>
                    </div>
                    <div className="info-note">
                      ℹ️ These IDs are generated automatically and will be stored on blockchain
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    className="btn-secondary"
                    onClick={navigateToDashboard}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={handleAddProduct}
                    disabled={!isBlockchainConnected || !newProduct.name || !newProduct.category || !newProduct.price || !newProduct.quantity || !newProduct.location}
                  >
                    {isBlockchainConnected ? 'Register on Blockchain' : 'Connect Wallet to Register'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'verify':
        return (
          <div className="verify-tab">
            <div className="back-to-dashboard">
              <button 
                className="back-button"
                onClick={navigateToDashboard}
              >
                ← Back to Dashboard
              </button>
            </div>
            <div className="verification-section">
              <div className="verification-header">
                <h2>✅ Verify Product</h2>
                <p>Enter verification ID or batch number to check product authenticity</p>
              </div>

              <div className="verification-container">
                <div className="verification-input-section">
                  <div className="wallet-connection">
                    {!isBlockchainConnected ? (
                      <div className="connect-prompt">
                        <p>Connect wallet for enhanced verification</p>
                        <button 
                          className="connect-wallet-btn"
                          onClick={connectWallet}
                          disabled={isConnecting}
                        >
                          {isConnecting ? 'Connecting...' : '🔗 Connect Wallet'}
                        </button>
                      </div>
                    ) : (
                      <div className="connected-wallet-info">
                        <span className="wallet-address">
                          {account.substring(0, 6)}...{account.substring(account.length - 4)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="verification-input-group">
                    <label>Enter Verification ID or Batch Number</label>
                    <div className="input-with-button">
                      <input
                        type="text"
                        placeholder="FARM-ABC123-XYZ789 or BATCH-240115-ABC123"
                        value={verificationId}
                        onChange={(e) => setVerificationId(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && verifyProduct()}
                      />
                      <button 
                        className="btn-primary"
                        onClick={verifyProduct}
                        disabled={!verificationId.trim()}
                      >
                        Verify Product
                      </button>
                    </div>
                    <p className="input-hint">
                      Find this on product packaging or seller documentation
                    </p>
                  </div>
                </div>

                {verifiedProduct && (
                  <div className="verification-result">
                    <div className="result-header success">
                      <h3>✅ Product Verified Successfully</h3>
                      <p>This product is registered on blockchain and verified authentic</p>
                    </div>
                    
                    <div className="verified-product-details">
                      <div className="product-basic-info">
                        <h4>{verifiedProduct.name}</h4>
                        <p className="product-category">{verifiedProduct.category} • {verifiedProduct.variety}</p>
                      </div>
                      
                      <div className="details-grid">
                        <div className="detail-item">
                          <span className="detail-label">Batch Number:</span>
                          <span className="detail-value batch-number">{verifiedProduct.batchNumber}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Verification ID:</span>
                          <span className="detail-value verification-id">{verifiedProduct.verificationId}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Status:</span>
                          <span className="detail-value status-badge verified">Verified</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Price:</span>
                          <span className="detail-value">₹{verifiedProduct.price}/{verifiedProduct.unit}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Quantity:</span>
                          <span className="detail-value">{verifiedProduct.quantity} {verifiedProduct.unit}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Location:</span>
                          <span className="detail-value">{verifiedProduct.location}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Harvest Date:</span>
                          <span className="detail-value">{verifiedProduct.harvestDate}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Organic Certified:</span>
                          <span className="detail-value">{verifiedProduct.organicCertified ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                      
                      {verifiedProduct.description && (
                        <div className="description-section">
                          <h5>Description:</h5>
                          <p>{verifiedProduct.description}</p>
                        </div>
                      )}
                      
                      {verifiedProduct.blockchainHash && (
                        <div className="blockchain-section">
                          <h5>Blockchain Information:</h5>
                          <div className="blockchain-hash-display">
                            🔗 Transaction: {verifiedProduct.blockchainHash}
                          </div>
                          <button className="btn-secondary" onClick={() => {
                            window.open(`https://amoy.polygonscan.com/tx/${verifiedProduct.blockchainHash}`, '_blank');
                          }}>
                            View on Explorer
                          </button>
                        </div>
                      )}
                      
                      <div className="verification-certificate">
                        <div className="certificate-header">
                          <h4>Verification Certificate</h4>
                          <span className="certificate-id">Cert-ID: {verifiedProduct.verificationId}</span>
                        </div>
                        <div className="certificate-body">
                          <p>This certifies that the above product is authentic and has been registered on the blockchain.</p>
                          <div className="certificate-footer">
                            <span>Verified on: {new Date(verifiedProduct.timestamp || new Date()).toLocaleDateString()}</span>
                            <button 
                              className="btn-secondary"
                              onClick={() => window.print()}
                            >
                              Print Certificate
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      // ... other tab cases remain similar but with updated UI ...

      default:
        return (
          <>
            {/* Dashboard Welcome Section */}
            <section className="dashboard-welcome">
              <div className="welcome-content">
                <h1 className="welcome-title">
                  Welcome back, {user?.name?.split(' ')[0] || 'Farmer'}! 👨‍🌾
                </h1>
                <p className="welcome-subtitle">
                  Manage your farm, track products, and access real-time market data
                </p>
              </div>
              <div className="welcome-actions">
                <div className="wallet-connection">
                  {!isBlockchainConnected ? (
                    <button 
                      className="connect-wallet-btn"
                      onClick={connectWallet}
                      disabled={isConnecting}
                    >
                      {isConnecting ? 'Connecting...' : '🔗 Connect Wallet'}
                    </button>
                  ) : (
                    <div className="connected-wallet-info">
                      <div className="wallet-details">
                        <span className="wallet-address">
                          {account.substring(0, 6)}...{account.substring(account.length - 4)}
                        </span>
                        <span className="wallet-balance">{walletBalance} MATIC</span>
                      </div>
                    </div>
                  )}
                </div>
                {weatherData && (
                  <div className="weather-widget">
                    <div className="weather-icon">{getWeatherIcon(weatherData.condition)}</div>
                    <div className="weather-info">
                      <div className="weather-temp">{weatherData.temperature}°C</div>
                      <div className="weather-desc">{weatherData.condition}</div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Quick Stats */}
            <section className="stats-section">
              <h2 className="section-title">Farm Analytics</h2>
              <div className="stats-grid">
                {quickStats.map(stat => (
                  <div key={stat.id} className="stat-card">
                    <div className="stat-header">
                      <div className="stat-icon">{stat.icon}</div>
                      <div className="stat-change">{stat.change}</div>
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{stat.value}</div>
                      <div className="stat-label">{stat.label}</div>
                      <p className="stat-description">{stat.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Actions */}
            <section className="quick-actions-section">
              <h2 className="section-title">Quick Actions</h2>
              <div className="actions-grid">
                <button 
                  className="action-card primary"
                  onClick={() => navigateToModule('add-product')}
                >
                  <div className="action-icon">➕</div>
                  <h3>Add Product</h3>
                  <p>Register new product to blockchain</p>
                </button>
                <button 
                  className="action-card secondary"
                  onClick={() => navigateToModule('products')}
                >
                  <div className="action-icon">📦</div>
                  <h3>My Products</h3>
                  <p>View & manage all your products</p>
                </button>
                <button 
                  className="action-card accent"
                  onClick={() => navigateToModule('verify')}
                >
                  <div className="action-icon">✅</div>
                  <h3>Verify Product</h3>
                  <p>Check product authenticity</p>
                </button>
              </div>
            </section>

            {/* Modules Grid */}
            <section className="modules-section">
              <div className="section-header">
                <h2 className="section-title">Smart Farming Tools</h2>
                <div className="search-container">
                  <input
                    type="search"
                    className="module-search"
                    placeholder="Search tools..."
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                  <div className="search-icon">🔍</div>
                </div>
              </div>

              <div className="modules-grid">
                {filteredModules.map(module => (
                  <div
                    key={module.id}
                    className={`module-card module-${module.color}`}
                    onClick={() => navigateToModule(module.tab)}
                  >
                    <div className="module-header">
                      <div className="module-icon">{module.icon}</div>
                      {module.tab === 'products' && products.filter(p => p.status === 'pending').length > 0 && (
                        <span className="module-badge">
                          {products.filter(p => p.status === 'pending').length}
                        </span>
                      )}
                    </div>
                    
                    <div className="module-content">
                      <h3 className="module-title">{module.name}</h3>
                      <p className="module-description">{module.description}</p>
                    </div>

                    <div className="module-footer">
                      <span className="module-cta">Open →</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        );
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your farming dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="farmer-dashboard">
      {/* Top Navigation Bar */}
      <nav className="dashboard-nav">
        <div className="nav-left">
          <button 
            className="menu-toggle"
            onClick={() => setShowMobileMenu(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <div className="logo">
            <span className="logo-icon">🌾</span>
            <span className="logo-text">Krishi Mitra</span>
          </div>
        </div>
        
        <div className="nav-center">
          <div className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => navigateToModule('dashboard')}
            >
              🏠 Dashboard
            </button>
            <button 
              className={`nav-tab ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => navigateToModule('products')}
            >
              📦 Products
            </button>
            <button 
              className={`nav-tab ${activeTab === 'add-product' ? 'active' : ''}`}
              onClick={() => navigateToModule('add-product')}
            >
              ＋ Add Product
            </button>
            <button 
              className={`nav-tab ${activeTab === 'verify' ? 'active' : ''}`}
              onClick={() => navigateToModule('verify')}
            >
              ✅ Verify
            </button>
          </div>
        </div>
        
        <div className="nav-right">
          <button 
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            🔔
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="notification-count">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
          
          <div className="user-profile">
            <div 
              className="profile-avatar"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              {user?.avatar || '👨‍🌾'}
            </div>
            {showProfileMenu && (
              <div className="profile-menu">
                <div className="profile-info">
                  <h4>{user?.name}</h4>
                  <p>{user?.farmName}</p>
                </div>
                <div className="profile-actions">
                  <button onClick={() => navigateToModule('dashboard')}>Dashboard</button>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          {renderTabContent()}
        </div>
      </main>

      {/* Chatbot */}
      {showChatbot && (
        <div className="chatbot-overlay">
          <div className="chatbot-container" ref={chatbotRef}>
            <div className="chatbot-header">
              <h3>Krishi AI Assistant</h3>
              <div className="chatbot-actions">
                <button onClick={clearChat} className="chatbot-action-btn">
                  🗑️
                </button>
                <button 
                  onClick={() => setShowChatbot(false)} 
                  className="chatbot-action-btn"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="chatbot-messages">
              {chatMessages.length === 0 ? (
                <div className="welcome-message">
                  <div className="welcome-icon">🤖</div>
                  <h4>Hello! I'm your farming assistant</h4>
                  <p>Ask me about crop management, market prices, weather forecasts, or any farming-related questions!</p>
                </div>
              ) : (
                chatMessages.map(message => (
                  <div
                    key={message.id}
                    className={`chat-message ${message.isUser ? 'user-message' : 'ai-message'}`}
                  >
                    <div className="message-avatar">
                      {message.isUser ? '👨‍🌾' : '🤖'}
                    </div>
                    <div className="message-content">
                      <p>{message.content}</p>
                      <span className="message-time">{message.time}</span>
                    </div>
                  </div>
                ))
              )}
              
              {isChatLoading && (
                <div className="chat-message ai-message">
                  <div className="message-avatar">🤖</div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <form onSubmit={handleSendMessage} className="chatbot-input">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about farming..."
                disabled={isChatLoading}
              />
              <button type="submit" disabled={isChatLoading}>
                {isChatLoading ? '⏳' : '📤'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button for Chatbot */}
      {!showChatbot && (
        <button 
          className="fab-chatbot"
          onClick={() => setShowChatbot(true)}
        >
          🤖
        </button>
      )}

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>🌾 Krishi Mitra</h4>
            <p>Empowering farmers with blockchain technology</p>
          </div>
          <div className="footer-section">
            <h4>📞 Support</h4>
            <p>Helpline: 1800-XXX-XXXX</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 Krishi Mitra. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}