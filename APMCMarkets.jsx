import React, { useState, useEffect } from 'react';
import './apmc.css';

const APMCMarkets = ({ userType = "buyer" }) => {
  // State variables
  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('Karnataka');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [showProducts, setShowProducts] = useState(false);
  const [marketProducts, setMarketProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [realPrices, setRealPrices] = useState({});
  const [priceLoading, setPriceLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [embeddedMapUrl, setEmbeddedMapUrl] = useState('');
  const [showEmbeddedMap, setShowEmbeddedMap] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    markets: 'loading',
    prices: 'ready',
    products: 'ready'
  });

  // Checkout Flow States
  const [checkoutStep, setCheckoutStep] = useState('cart');
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  // API Configuration
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.farmer-marketplace.com';
  const APMC_API_URL = import.meta.env.VITE_APMC_API_URL || 'https://api.data.gov.in/resource';
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const DATA_GOV_KEY = import.meta.env.VITE_DATA_GOV_KEY;

  // Enhanced Fallback data with nearby markets
  const fallbackAPMCData = {
    Karnataka: [
      {
        id: 1,
        name: 'Karwar APMC Market Yard',
        location: 'Karwar, Uttara Kannada',
        coordinates: { lat: 14.8136, lng: 74.1295 },
        address: 'APMC Market Yard, NH-66, Karwar, Karnataka 581301',
        contact: '+91-8382-220456',
        chairman: 'Shri. Ramesh Naik',
        chairmanMobile: '+91-9448123456',
        secretary: 'Shri. Mahesh Pujari',
        secretaryMobile: '+91-9480321456',
        helpline: '1800-3456-789',
        email: 'apmckarwar@karnataka.gov.in',
        marketDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
        marketTimings: '6:00 AM - 2:00 PM',
        commodities: ['Coconut', 'Areca Nut', 'Fish', 'Cashew', 'Mango', 'Jackfruit', 'Rice', 'Vegetables'],
        distance: '0 km from Karwar city',
        distanceValue: 0,
        rating: 4.2,
        facilities: ['Parking', 'Weighing', 'Digital Payments', 'Cold Storage', 'Banking'],
        established: 1985,
        totalTraders: 125,
        annualTurnover: '₹85 Crores',
        licenseNumber: 'APMC/KA/UK/001'
      },
      {
        id: 2,
        name: 'Sirsi APMC Market',
        location: 'Sirsi, Uttara Kannada',
        coordinates: { lat: 14.6189, lng: 74.8510 },
        address: 'APMC Yard, Sirsi, Karnataka 581401',
        contact: '+91-8384-245678',
        chairman: 'Shri. Prakash Hegde',
        chairmanMobile: '+91-9448123457',
        secretary: 'Shri. Suresh Bhat',
        secretaryMobile: '+91-9480321457',
        helpline: '1800-3456-790',
        email: 'apmcsirsi@karnataka.gov.in',
        marketDays: ['Tuesday', 'Thursday', 'Saturday'],
        marketTimings: '6:30 AM - 3:00 PM',
        commodities: ['Areca Nut', 'Pepper', 'Cardamom', 'Coconut', 'Rice', 'Turmeric', 'Ginger'],
        distance: '85 km from Karwar',
        distanceValue: 85,
        rating: 4.4,
        facilities: ['Parking', 'Weighing', 'Banking', 'Restaurant', 'Cold Storage'],
        established: 1978,
        totalTraders: 95,
        annualTurnover: '₹120 Crores',
        licenseNumber: 'APMC/KA/UK/002'
      },
      {
        id: 5,
        name: 'Kumta APMC Market',
        location: 'Kumta, Uttara Kannada',
        coordinates: { lat: 14.4289, lng: 74.4099 },
        address: 'APMC Market, Kumta, Karnataka 581343',
        contact: '+91-8386-222345',
        chairman: 'Shri. Anand Shetty',
        chairmanMobile: '+91-9448123458',
        secretary: 'Shri. Ramesh Kamath',
        secretaryMobile: '+91-9480321458',
        helpline: '1800-3456-791',
        email: 'apmckumta@karnataka.gov.in',
        marketDays: ['Monday', 'Wednesday', 'Friday'],
        marketTimings: '7:00 AM - 2:00 PM',
        commodities: ['Coconut', 'Areca Nut', 'Fish', 'Cashew', 'Rice'],
        distance: '45 km from Karwar',
        distanceValue: 45,
        rating: 4.1,
        facilities: ['Parking', 'Weighing', 'Digital Payments'],
        established: 1982,
        totalTraders: 75,
        annualTurnover: '₹60 Crores',
        licenseNumber: 'APMC/KA/UK/003'
      },
      {
        id: 6,
        name: 'Honnavar APMC Market',
        location: 'Honnavar, Uttara Kannada',
        coordinates: { lat: 14.2800, lng: 74.4500 },
        address: 'APMC Yard, Honnavar, Karnataka 581334',
        contact: '+91-8387-223456',
        chairman: 'Shri. Rajesh Poojary',
        chairmanMobile: '+91-9448123459',
        secretary: 'Shri. Suresh Nayak',
        secretaryMobile: '+91-9480321459',
        helpline: '1800-3456-792',
        email: 'apmchonnavar@karnataka.gov.in',
        marketDays: ['Tuesday', 'Thursday', 'Saturday'],
        marketTimings: '6:00 AM - 1:00 PM',
        commodities: ['Fish', 'Coconut', 'Areca Nut', 'Cashew', 'Vegetables'],
        distance: '65 km from Karwar',
        distanceValue: 65,
        rating: 4.0,
        facilities: ['Parking', 'Fish Market', 'Weighing'],
        established: 1975,
        totalTraders: 60,
        annualTurnover: '₹45 Crores',
        licenseNumber: 'APMC/KA/UK/004'
      },
      {
        id: 7,
        name: 'Bhatkal APMC Market',
        location: 'Bhatkal, Uttara Kannada',
        coordinates: { lat: 13.9856, lng: 74.5559 },
        address: 'APMC Market, Bhatkal, Karnataka 581320',
        contact: '+91-8385-224567',
        chairman: 'Shri. Ibrahim Mulla',
        chairmanMobile: '+91-9448123460',
        secretary: 'Shri. Abdul Razzak',
        secretaryMobile: '+91-9480321460',
        helpline: '1800-3456-793',
        email: 'apmcbhatkal@karnataka.gov.in',
        marketDays: ['Monday', 'Wednesday', 'Friday'],
        marketTimings: '7:00 AM - 2:00 PM',
        commodities: ['Fish', 'Coconut', 'Areca Nut', 'Rice', 'Spices'],
        distance: '95 km from Karwar',
        distanceValue: 95,
        rating: 4.2,
        facilities: ['Parking', 'Weighing', 'Cold Storage'],
        established: 1988,
        totalTraders: 85,
        annualTurnover: '₹70 Crores',
        licenseNumber: 'APMC/KA/UK/005'
      }
    ],
    Maharashtra: [
      {
        id: 3,
        name: 'Kolhapur APMC Market',
        location: 'Kolhapur, Maharashtra',
        coordinates: { lat: 16.7050, lng: 74.2433 },
        address: 'APMC Market, Shiroli, Kolhapur - 416005',
        contact: '+91-231-2645678',
        chairman: 'Shri. Rajendra Chavan',
        chairmanMobile: '+91-9422123456',
        secretary: 'Shri. Mahesh Jadhav',
        secretaryMobile: '+91-9586321456',
        helpline: '1800-2234-567',
        email: 'apmckolhapur@maharashtra.gov.in',
        marketDays: ['Daily'],
        marketTimings: '5:00 AM - 12:00 PM',
        commodities: ['Sugarcane', 'Grapes', 'Onion', 'Tomato', 'Turmeric', 'Pomegranate'],
        distance: '110 km from Karwar',
        distanceValue: 110,
        rating: 4.4,
        facilities: ['Parking', 'Cold Storage', 'Banking', 'Auction System', 'Quality Labs'],
        established: 1968,
        totalTraders: 180,
        annualTurnover: '₹300 Crores',
        licenseNumber: 'APMC/MH/KOP/001'
      },
      {
        id: 8,
        name: 'Sawantwadi APMC Market',
        location: 'Sawantwadi, Maharashtra',
        coordinates: { lat: 15.9000, lng: 73.8000 },
        address: 'APMC Market, Sawantwadi, Maharashtra - 416510',
        contact: '+91-2363-245678',
        chairman: 'Shri. Deepak Sawant',
        chairmanMobile: '+91-9422123457',
        secretary: 'Shri. Santosh Rane',
        secretaryMobile: '+91-9586321457',
        helpline: '1800-2234-568',
        email: 'apmcsawantwadi@maharashtra.gov.in',
        marketDays: ['Tuesday', 'Thursday', 'Saturday'],
        marketTimings: '6:00 AM - 1:00 PM',
        commodities: ['Cashew', 'Coconut', 'Mango', 'Kokum', 'Jackfruit'],
        distance: '50 km from Karwar',
        distanceValue: 50,
        rating: 4.1,
        facilities: ['Parking', 'Weighing', 'Digital Payments'],
        established: 1972,
        totalTraders: 70,
        annualTurnover: '₹55 Crores',
        licenseNumber: 'APMC/MH/SWN/001'
      }
    ],
    Goa: [
      {
        id: 4,
        name: 'Mapusa APMC Market',
        location: 'Mapusa, North Goa',
        coordinates: { lat: 15.5916, lng: 73.8086 },
        address: 'Mapusa Municipal Market, Mapusa, Goa - 403507',
        contact: '+91-832-2262345',
        chairman: 'Shri. Sudesh Kalangutkar',
        chairmanMobile: '+91-9822123456',
        secretary: 'Shri. Ramesh Talaulikar',
        secretaryMobile: '+91-9765321456',
        helpline: '1800-3456-123',
        email: 'mapusamarket@goa.gov.in',
        marketDays: ['Friday'],
        marketTimings: '7:00 AM - 1:00 PM',
        commodities: ['Fish', 'Coconut', 'Vegetables', 'Fruits', 'Spices', 'Local Produce'],
        distance: '75 km from Karwar',
        distanceValue: 75,
        rating: 4.2,
        facilities: ['Parking', 'Fish Market', 'Vegetable Section', 'Spice Market'],
        established: 1960,
        totalTraders: 80,
        annualTurnover: '₹65 Crores',
        licenseNumber: 'APMC/GA/MAP/001'
      },
      {
        id: 9,
        name: 'Panaji APMC Market',
        location: 'Panaji, Goa',
        coordinates: { lat: 15.4909, lng: 73.8278 },
        address: 'APMC Market, Panaji, Goa - 403001',
        contact: '+91-832-2424567',
        chairman: 'Shri. Vishnu Naik',
        chairmanMobile: '+91-9822123457',
        secretary: 'Shri. Mahesh Prabhu',
        secretaryMobile: '+91-9765321457',
        helpline: '1800-3456-124',
        email: 'apmcpanaji@goa.gov.in',
        marketDays: ['Daily'],
        marketTimings: '6:00 AM - 12:00 PM',
        commodities: ['Fish', 'Vegetables', 'Fruits', 'Groceries', 'Spices'],
        distance: '85 km from Karwar',
        distanceValue: 85,
        rating: 4.3,
        facilities: ['Parking', 'Cold Storage', 'Banking', 'Restaurant'],
        established: 1970,
        totalTraders: 120,
        annualTurnover: '₹90 Crores',
        licenseNumber: 'APMC/GA/PNJ/001'
      },
      {
        id: 10,
        name: 'Margao APMC Market',
        location: 'Margao, South Goa',
        coordinates: { lat: 15.2719, lng: 73.9583 },
        address: 'APMC Market, Margao, Goa - 403601',
        contact: '+91-832-2734567',
        chairman: 'Shri. Francisco Fernandes',
        chairmanMobile: '+91-9822123458',
        secretary: 'Shri. John D\'Souza',
        secretaryMobile: '+91-9765321458',
        helpline: '1800-3456-125',
        email: 'apmcmargao@goa.gov.in',
        marketDays: ['Monday', 'Wednesday', 'Friday'],
        marketTimings: '6:30 AM - 1:30 PM',
        commodities: ['Fish', 'Vegetables', 'Fruits', 'Local Produce', 'Spices'],
        distance: '120 km from Karwar',
        distanceValue: 120,
        rating: 4.1,
        facilities: ['Parking', 'Weighing', 'Cold Storage'],
        established: 1975,
        totalTraders: 95,
        annualTurnover: '₹75 Crores',
        licenseNumber: 'APMC/GA/MRG/001'
      }
    ]
  };

  const fallbackCommodityPrices = {
    'Coconut': { min: 25, max: 35, modal: 30, unit: 'per piece', trend: 'stable', source: 'e-NAM' },
    'Areca Nut': { min: 320, max: 380, modal: 350, unit: 'per kg', trend: 'rising', source: 'APMC Daily' },
    'Fish': { min: 120, max: 250, modal: 180, unit: 'per kg', trend: 'volatile', source: 'Marine Board' },
    'Cashew': { min: 140, max: 180, modal: 160, unit: 'per kg', trend: 'stable', source: 'Cashew Board' },
    'Mango': { min: 40, max: 120, modal: 80, unit: 'per kg', trend: 'seasonal', source: 'Horticulture Dept' },
    'Pepper': { min: 420, max: 480, modal: 450, unit: 'per kg', trend: 'rising', source: 'Spice Board' },
    'Cardamom': { min: 1200, max: 1400, modal: 1300, unit: 'per kg', trend: 'stable', source: 'Spice Board' },
    'Rice': { min: 35, max: 55, modal: 45, unit: 'per kg', trend: 'stable', source: 'FCI' },
    'Vegetables': { min: 20, max: 80, modal: 40, unit: 'per kg', trend: 'volatile', source: 'Horticulture Dept' }
  };

  const fallbackProducts = {
    1: [
      { id: 101, name: 'Fresh Coconuts', price: 30, unit: 'piece', stock: 150, farmer: 'Rajesh Gowda', quality: 'Grade A', image: '🥥', category: 'Coconut', organic: true },
      { id: 102, name: 'Premium Areca Nut', price: 350, unit: 'kg', stock: 80, farmer: 'Suresh Naik', quality: 'Premium', image: '🌰', category: 'Areca Nut', organic: false },
      { id: 103, name: 'Fresh Seafood', price: 180, unit: 'kg', stock: 50, farmer: 'Fisherman Co-op', quality: 'Fresh Catch', image: '🐟', category: 'Fish', organic: true },
      { id: 104, name: 'Organic Cashew', price: 160, unit: 'kg', stock: 40, farmer: 'Organic Farms', quality: 'Grade A', image: '🥜', category: 'Cashew', organic: true }
    ],
    2: [
      { id: 201, name: 'Black Pepper', price: 450, unit: 'kg', stock: 60, farmer: 'Spice Farms', quality: 'Premium', image: '🌶️', category: 'Pepper', organic: true },
      { id: 202, name: 'Green Cardamom', price: 1300, unit: 'kg', stock: 40, farmer: 'Western Ghats', quality: 'Premium', image: '🟢', category: 'Cardamom', organic: true },
      { id: 203, name: 'Fresh Turmeric', price: 80, unit: 'kg', stock: 100, farmer: 'Herbal Farms', quality: 'Organic', image: '🟡', category: 'Turmeric', organic: true }
    ],
    3: [
      { id: 301, name: 'Fresh Onions', price: 25, unit: 'kg', stock: 200, farmer: 'Veggie Farms', quality: 'Grade A', image: '🧅', category: 'Onion', organic: false },
      { id: 302, name: 'Sweet Grapes', price: 120, unit: 'kg', stock: 80, farmer: 'Vineyard Estate', quality: 'Premium', image: '🍇', category: 'Grapes', organic: true }
    ],
    4: [
      { id: 401, name: 'Fresh Fish', price: 200, unit: 'kg', stock: 60, farmer: 'Coastal Fishermen', quality: 'Fresh Catch', image: '🐠', category: 'Fish', organic: true },
      { id: 402, name: 'King Fish', price: 350, unit: 'kg', stock: 30, farmer: 'Deep Sea Co-op', quality: 'Premium', image: '🐟', category: 'Fish', organic: true }
    ]
  };

  // API Functions
  const fetchAPMCData = async () => {
    try {
      setLoading(true);
      setApiStatus(prev => ({ ...prev, markets: 'loading' }));

      // Try Government API first
      if (APMC_API_URL && DATA_GOV_KEY) {
        const response = await fetch(
          `${APMC_API_URL}/9ef84268-d588-465a-a308-a864a43d0070?api-key=${DATA_GOV_KEY}&format=json&filters[state]=${selectedState}&limit=50`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.records && data.records.length > 0) {
            const formattedMarkets = data.records.map((market, index) => ({
              id: market.market_id || index + 1,
              name: market.market_name || `APMC Market ${index + 1}`,
              location: market.district_name ? `${market.district_name}, ${market.state_name}` : selectedState,
              coordinates: { 
                lat: parseFloat(market.latitude) || (14.8136 + (index * 0.1)), 
                lng: parseFloat(market.longitude) || (74.1295 + (index * 0.1)) 
              },
              address: market.market_address || 'APMC Market Yard',
              contact: market.contact_number || '+91-XXXXXXXXXX',
              chairman: 'Market Chairman',
              chairmanMobile: '+91-XXXXXXXXXX',
              secretary: 'Market Secretary', 
              secretaryMobile: '+91-XXXXXXXXXX',
              helpline: '1800-XXXX-XXX',
              email: `apmc${index + 1}@${selectedState.toLowerCase()}.gov.in`,
              marketDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
              marketTimings: '6:00 AM - 2:00 PM',
              commodities: market.commodities ? market.commodities.split(',').slice(0, 6) : ['Agricultural Products'],
              distance: `${index * 50} km from Karwar`,
              distanceValue: index * 50,
              rating: 4.0 + (Math.random() * 0.5),
              facilities: ['Parking', 'Weighing', 'Digital Payments'],
              established: 1980 + index,
              totalTraders: 50 + (index * 25),
              annualTurnover: `₹${50 + (index * 25)} Crores`,
              licenseNumber: `APMC/${selectedState.slice(0, 2).toUpperCase()}/00${index + 1}`
            }));
            
            setMarkets(formattedMarkets);
            setApiStatus(prev => ({ ...prev, markets: 'success' }));
            setLoading(false);
            return;
          }
        }
      }

      // Fallback to our API
      try {
        const response = await fetch(`${API_BASE_URL}/api/apmc/markets?state=${selectedState}`);
        if (response.ok) {
          const data = await response.json();
          setMarkets(data);
          setApiStatus(prev => ({ ...prev, markets: 'success' }));
          setLoading(false);
          return;
        }
      } catch (apiError) {
        console.log('API failed, using fallback data');
      }

      // Final fallback
      setMarkets(fallbackAPMCData[selectedState] || []);
      setApiStatus(prev => ({ ...prev, markets: 'fallback' }));
      setLoading(false);

    } catch (error) {
      console.error('Error fetching APMC data:', error);
      setMarkets(fallbackAPMCData[selectedState] || []);
      setApiStatus(prev => ({ ...prev, markets: 'error' }));
      setLoading(false);
    }
  };

  const fetchRealTimePrices = async (marketId) => {
    setPriceLoading(true);
    setApiStatus(prev => ({ ...prev, prices: 'loading' }));
    
    try {
      // Try government price API
      if (APMC_API_URL && DATA_GOV_KEY) {
        const response = await fetch(
          `${APMC_API_URL}/9ef84268-d588-465a-a308-a864a43d0070?api-key=${DATA_GOV_KEY}&format=json&filters[market_id]=${marketId}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.records && data.records.length > 0) {
            const prices = {};
            data.records.forEach(record => {
              if (record.commodity && record.modal_price) {
                prices[record.commodity] = {
                  min: parseInt(record.min_price) || 0,
                  max: parseInt(record.max_price) || 0,
                  modal: parseInt(record.modal_price),
                  unit: record.unit || 'per kg',
                  trend: ['stable', 'rising', 'falling'][Math.floor(Math.random() * 3)],
                  source: 'Government Mandi'
                };
              }
            });
            setRealPrices(prices);
            setApiStatus(prev => ({ ...prev, prices: 'success' }));
            setPriceLoading(false);
            return;
          }
        }
      }

      // Fallback to mock data with realistic prices
      setTimeout(() => {
        const market = markets.find(m => m.id === marketId);
        if (market) {
          const prices = {};
          market.commodities.forEach(commodity => {
            if (fallbackCommodityPrices[commodity]) {
              prices[commodity] = fallbackCommodityPrices[commodity];
            } else {
              // Generate realistic prices for other commodities
              const basePrice = 50 + Math.random() * 200;
              prices[commodity] = {
                min: Math.floor(basePrice * 0.8),
                max: Math.floor(basePrice * 1.2),
                modal: Math.floor(basePrice),
                unit: 'per kg',
                trend: ['stable', 'rising', 'falling', 'volatile'][Math.floor(Math.random() * 4)],
                source: 'APMC Daily'
              };
            }
          });
          setRealPrices(prices);
        }
        setApiStatus(prev => ({ ...prev, prices: 'fallback' }));
        setPriceLoading(false);
      }, 1000);

    } catch (error) {
      console.error('Error fetching prices:', error);
      setApiStatus(prev => ({ ...prev, prices: 'error' }));
      setPriceLoading(false);
    }
  };

  const fetchMarketProducts = async (marketId) => {
    setApiStatus(prev => ({ ...prev, products: 'loading' }));
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/markets/${marketId}/products`);
      if (response.ok) {
        const products = await response.json();
        setMarketProducts(products);
        setApiStatus(prev => ({ ...prev, products: 'success' }));
        return;
      }
    } catch (error) {
      console.log('Products API failed, using mock data');
    }
    
    // Fallback to mock products
    setMarketProducts(fallbackProducts[marketId] || []);
    setApiStatus(prev => ({ ...prev, products: 'fallback' }));
  };

  // Google Maps Integration
  const openGoogleMaps = (market) => {
    const { lat, lng } = market.coordinates;
    
    if (GOOGLE_MAPS_API_KEY && !showEmbeddedMap) {
      const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${lat},${lng}&zoom=15&maptype=roadmap`;
      setEmbeddedMapUrl(embedUrl);
      setShowEmbeddedMap(true);
    } else {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
      window.open(url, '_blank');
    }
  };

  const openMapWithCoords = (market) => {
    const { lat, lng } = market.coordinates;
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.open(`geo:${lat},${lng}?q=${encodeURIComponent(market.name)}`);
    } else {
      window.open(`https://maps.google.com/maps?q=${lat},${lng}`);
    }
  };

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('apmcCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Fetch data when state or district changes
  useEffect(() => {
    fetchAPMCData();
  }, [selectedState, selectedDistrict]);

  // Market selection handler
  const handleMarketSelect = (market) => {
    setSelectedMarket(market);
    setShowProducts(false);
    setShowDirections(false);
    setShowEmbeddedMap(false);
    fetchRealTimePrices(market.id);
  };

  const handleBackToList = () => {
    setSelectedMarket(null);
    setShowProducts(false);
    setShowDirections(false);
    setShowEmbeddedMap(false);
  };

  const handleShowProducts = () => {
    if (selectedMarket) {
      fetchMarketProducts(selectedMarket.id);
    }
    setShowProducts(true);
    setShowDirections(false);
    setShowEmbeddedMap(false);
  };

  const handleShowDirections = () => {
    setShowDirections(true);
    setShowProducts(false);
  };

  // Shopping Cart Functions
  const handleAddToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    let newCart;
    
    if (existingItem) {
      newCart = cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { 
        ...product, 
        quantity: 1, 
        market: selectedMarket.name,
        marketId: selectedMarket.id,
        addedAt: new Date().toISOString()
      }];
    }
    
    setCart(newCart);
    localStorage.setItem('apmcCart', JSON.stringify(newCart));
    
    // Show toast notification
    showNotification(`✅ ${product.name} added to cart from ${selectedMarket.name}!`);
  };

  const handleRemoveFromCart = (productId) => {
    const newCart = cart.filter(item => item.id !== productId);
    setCart(newCart);
    localStorage.setItem('apmcCart', JSON.stringify(newCart));
    showNotification('🗑️ Item removed from cart');
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveFromCart(productId);
      return;
    }
    
    const newCart = cart.map(item => 
      item.id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    );
    setCart(newCart);
    localStorage.setItem('apmcCart', JSON.stringify(newCart));
  };

  // Notification system
  const showNotification = (message) => {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4a8c31;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  // Enhanced Checkout Flow Functions
  const handleProceedToAddress = () => {
    if (cart.length === 0) {
      showNotification('🛒 Your cart is empty! Add some products first.');
      return;
    }
    setCheckoutStep('address');
    setFormErrors({});
  };

  // Address Form Validation
  const validateAddressForm = () => {
    const errors = {};
    
    if (!deliveryAddress.fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (deliveryAddress.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }
    
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = deliveryAddress.phone.replace(/\D/g, '');
    if (!cleanPhone) {
      errors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(cleanPhone)) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (!deliveryAddress.address.trim()) {
      errors.address = 'Address is required';
    } else if (deliveryAddress.address.trim().length < 10) {
      errors.address = 'Please enter a complete address (min 10 characters)';
    }
    
    if (!deliveryAddress.city.trim()) {
      errors.city = 'City is required';
    }
    
    if (!deliveryAddress.state.trim()) {
      errors.state = 'State is required';
    }
    
    const pincodeRegex = /^\d{6}$/;
    if (!deliveryAddress.pincode) {
      errors.pincode = 'Pincode is required';
    } else if (!pincodeRegex.test(deliveryAddress.pincode)) {
      errors.pincode = 'Please enter a valid 6-digit pincode';
    }
    
    return errors;
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    const errors = validateAddressForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return;
    }
    
    setFormErrors({});
    setCheckoutStep('payment');
  };

  const handleInputChange = (field, value) => {
    setDeliveryAddress(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePhoneChange = (value) => {
    const numbersOnly = value.replace(/\D/g, '').slice(0, 10);
    handleInputChange('phone', numbersOnly);
  };

  const handlePincodeChange = (value) => {
    const numbersOnly = value.replace(/\D/g, '').slice(0, 6);
    handleInputChange('pincode', numbersOnly);
  };

  // Wallet Functions
  const connectMetaMask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setWalletAddress(accounts[0]);
        setWalletConnected(true);
        showNotification(`✅ Wallet connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
      } catch (error) {
        console.error('Wallet connection failed:', error);
        showNotification('❌ Failed to connect wallet. Please make sure MetaMask is installed.');
      }
    } else {
      // Redirect to MetaMask website
      window.open('https://metamask.io/download.html', '_blank');
      showNotification('❌ MetaMask not detected. Redirecting to download page...');
    }
  };

  // UPI Payment Functions - Redirect to official websites
  const openUPIApp = (appName) => {
    let websiteUrl = '';
    
    switch(appName) {
      case 'googlepay':
        websiteUrl = 'https://pay.google.com';
        break;
      case 'phonepay':
        websiteUrl = 'https://www.phonepe.com';
        break;
      case 'paytm':
        websiteUrl = 'https://paytm.com';
        break;
      default:
        websiteUrl = 'https://upilink.vercel.app';
    }
    
    window.open(websiteUrl, '_blank');
    showNotification(`Redirecting to ${appName} website...`);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    try {
      if (paymentMethod === 'card') {
        if (!cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
          showNotification('Please fill all card details');
          setIsProcessingPayment(false);
          return;
        }
        const cleanCardNumber = cardDetails.cardNumber.replace(/\s/g, '');
        if (cleanCardNumber.length !== 16 || !/^\d+$/.test(cleanCardNumber)) {
          showNotification('Please enter a valid 16-digit card number');
          setIsProcessingPayment(false);
          return;
        }
        if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
          showNotification('Please enter expiry date in MM/YY format');
          setIsProcessingPayment(false);
          return;
        }
        if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
          showNotification('Please enter a valid CVV');
          setIsProcessingPayment(false);
          return;
        }
      }

      if (paymentMethod === 'wallet' && !walletConnected) {
        showNotification('Please connect your wallet first');
        setIsProcessingPayment(false);
        return;
      }

      // For demo purposes, simulate successful payment
      setTimeout(() => {
        processOrder();
      }, 2000);
      
    } catch (error) {
      console.error('Payment error:', error);
      showNotification('❌ Payment failed. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  const processOrder = async () => {
    try {
      const orderData = {
        items: cart,
        totalAmount: getCartTotalPrice(),
        deliveryAddress: { ...deliveryAddress },
        paymentMethod,
        orderDate: new Date().toISOString(),
        status: 'confirmed'
      };

      // In a real app, you would send this to your backend
      const orderId = 'APMC' + Date.now();
      const completeOrderData = {
        orderId,
        ...orderData,
        deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        status: 'confirmed',
        trackingNumber: 'APMC' + Math.random().toString(36).substr(2, 9).toUpperCase()
      };
      
      setOrderDetails(completeOrderData);
      setCheckoutStep('confirmation');
      setOrderConfirmed(true);
      
      // Clear cart after successful order
      setCart([]);
      localStorage.setItem('apmcCart', JSON.stringify([]));
      
      showNotification('✅ Order placed successfully!');
      setIsProcessingPayment(false);
      
    } catch (error) {
      console.error('Order processing error:', error);
      showNotification('❌ Order processing failed. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  const handleContinueShopping = () => {
    setCheckoutStep('cart');
    setShowCart(false);
    setOrderConfirmed(false);
    setOrderDetails(null);
    setDeliveryAddress({
      fullName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    });
    setCardDetails({
      cardNumber: '',
      expiry: '',
      cvv: '',
      name: ''
    });
    setFormErrors({});
    setWalletConnected(false);
    setWalletAddress('');
  };

  // Utility Functions
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'rising': return '📈';
      case 'falling': return '📉';
      case 'stable': return '➡️';
      case 'seasonal': return '🔄';
      case 'volatile': return '⚡';
      default: return '➡️';
    }
  };

  const getCartTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getCartTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getApiStatusIcon = (status) => {
    switch (status) {
      case 'loading': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      case 'fallback': return '📋';
      default: return '⚡';
    }
  };

  // Contact functions
  const handleCall = (phoneNumber) => {
    window.open(`tel:${phoneNumber}`);
  };

  const handleEmail = (email) => {
    window.open(`mailto:${email}`);
  };

  const handleSMS = (phoneNumber) => {
    window.open(`sms:${phoneNumber}`);
  };

  // Filter markets based on search
  const filteredMarkets = markets.filter(market =>
    market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    market.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    market.commodities.some(commodity => 
      commodity.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Enhanced Components
  const ApiStatusIndicator = () => (
    <div className="api-status-indicator">
      <div className="status-item">
        <span>Markets: {getApiStatusIcon(apiStatus.markets)}</span>
      </div>
      <div className="status-item">
        <span>Prices: {getApiStatusIcon(apiStatus.prices)}</span>
      </div>
      <div className="status-item">
        <span>Products: {getApiStatusIcon(apiStatus.products)}</span>
      </div>
    </div>
  );

  const CheckoutAddressStep = () => (
    <div className="checkout-step">
      <div className="checkout-header">
        <h3>📍 Delivery Address</h3>
        <p>Enter your delivery details</p>
      </div>
      
      <form onSubmit={handleAddressSubmit} className="address-form">
        <div className="form-group">
          <label htmlFor="fullName">Full Name *</label>
          <input
            id="fullName"
            type="text"
            value={deliveryAddress.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            placeholder="Enter your full name"
            className={formErrors.fullName ? 'error' : ''}
          />
          {formErrors.fullName && <span className="error-text">{formErrors.fullName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number *</label>
          <input
            id="phone"
            type="tel"
            value={deliveryAddress.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="10-digit mobile number"
            className={formErrors.phone ? 'error' : ''}
            maxLength="10"
          />
          {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="address">Delivery Address *</label>
          <textarea
            id="address"
            value={deliveryAddress.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Full address with street, building, floor, etc."
            rows="3"
            className={formErrors.address ? 'error' : ''}
          />
          {formErrors.address && <span className="error-text">{formErrors.address}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city">City *</label>
            <input
              id="city"
              type="text"
              value={deliveryAddress.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="City"
              className={formErrors.city ? 'error' : ''}
            />
            {formErrors.city && <span className="error-text">{formErrors.city}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="state">State *</label>
            <input
              id="state"
              type="text"
              value={deliveryAddress.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="State"
              className={formErrors.state ? 'error' : ''}
            />
            {formErrors.state && <span className="error-text">{formErrors.state}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="pincode">Pincode *</label>
            <input
              id="pincode"
              type="text"
              value={deliveryAddress.pincode}
              onChange={(e) => handlePincodeChange(e.target.value)}
              placeholder="6-digit pincode"
              className={formErrors.pincode ? 'error' : ''}
              maxLength="6"
            />
            {formErrors.pincode && <span className="error-text">{formErrors.pincode}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="landmark">Landmark (Optional)</label>
            <input
              id="landmark"
              type="text"
              value={deliveryAddress.landmark}
              onChange={(e) => handleInputChange('landmark', e.target.value)}
              placeholder="Nearby landmark"
            />
          </div>
        </div>

        <div className="checkout-actions">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => setCheckoutStep('cart')}
          >
            ← Back to Cart
          </button>
          <button type="submit" className="btn-primary">
            Continue to Payment →
          </button>
        </div>
      </form>
    </div>
  );

  const CheckoutPaymentStep = () => (
    <div className="checkout-step">
      <div className="checkout-header">
        <h3> Payment Method</h3>
        <p>Choose your preferred payment option</p>
      </div>

      <form onSubmit={handlePaymentSubmit} className="payment-form">
        <div className="payment-methods">
          <div className="payment-option">
            <input
              type="radio"
              id="card"
              name="payment"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <label htmlFor="card" className="payment-label">
              <span className="payment-text">Credit/Debit Card</span>
            </label>
          </div>

          <div className="payment-option">
            <input
              type="radio"
              id="upi"
              name="payment"
              value="upi"
              checked={paymentMethod === 'upi'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <label htmlFor="upi" className="payment-label">
              <span className="payment-text">UPI Payment</span>
            </label>
          </div>

          <div className="payment-option">
            <input
              type="radio"
              id="wallet"
              name="payment"
              value="wallet"
              checked={paymentMethod === 'wallet'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <label htmlFor="wallet" className="payment-label">
              <span className="payment-text">Wallet</span>
            </label>
          </div>

          <div className="payment-option">
            <input
              type="radio"
              id="cod"
              name="payment"
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <label htmlFor="cod" className="payment-label">
              <span className="payment-text">Cash on Delivery</span>
            </label>
          </div>
        </div>

        {/* Card Details */}
        {paymentMethod === 'card' && (
          <div className="card-details">
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                value={cardDetails.cardNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                  const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
                  setCardDetails(prev => ({ ...prev, cardNumber: formatted }));
                }}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="text"
                  value={cardDetails.expiry}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    const formatted = value.replace(/(\d{2})(\d{0,2})/, '$1/$2');
                    setCardDetails(prev => ({ ...prev, expiry: formatted }));
                  }}
                  placeholder="MM/YY"
                  maxLength="5"
                />
              </div>

              <div className="form-group">
                <label>CVV</label>
                <input
                  type="text"
                  value={cardDetails.cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                    setCardDetails(prev => ({ ...prev, cvv: value }));
                  }}
                  placeholder="123"
                  maxLength="3"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Name on Card</label>
              <input
                type="text"
                value={cardDetails.name}
                onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter name as on card"
              />
            </div>
          </div>
        )}

        {/* UPI Options */}
        {paymentMethod === 'upi' && (
          <div className="upi-options">
            <h4>Choose UPI App</h4>
            <div className="upi-apps">
              <button type="button" className="upi-app" onClick={() => openUPIApp('googlepay')}>
                <span className="upi-icon">Google Pay</span>
              </button>
              <button type="button" className="upi-app" onClick={() => openUPIApp('phonepay')}>
                <span className="upi-icon">PhonePe</span>
              </button>
              <button type="button" className="upi-app" onClick={() => openUPIApp('paytm')}>
                <span className="upi-icon">Paytm</span>
              </button>
            </div>
            <div className="upi-id">
              <p>You will be redirected to the official payment website</p>
            </div>
          </div>
        )}

        {/* Wallet Payment */}
        {paymentMethod === 'wallet' && (
          <div className="wallet-payment">
            {!walletConnected ? (
              <div className="wallet-connect">
                <p>Connect your wallet to complete the payment</p>
                <button type="button" className="btn-metamask" onClick={connectMetaMask}>
                  <span>🦊</span>
                  Connect MetaMask
                </button>
                <p className="wallet-note">You will be redirected to MetaMask to complete the transaction</p>
              </div>
            ) : (
              <div className="wallet-connected">
                <p>✅ Wallet Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
                <p>Click "Pay Now" to proceed with wallet payment</p>
              </div>
            )}
          </div>
        )}

        {/* Order Summary */}
        <div className="order-summary-payment">
          <h4>Order Summary</h4>
          <div className="summary-line">
            <span>Items ({getCartTotalItems()}):</span>
            <span>₹{getCartTotalPrice().toFixed(2)}</span>
          </div>
          <div className="summary-line">
            <span>Delivery:</span>
            <span>₹50.00</span>
          </div>
          <div className="summary-line">
            <span>GST (18%):</span>
            <span>₹{(getCartTotalPrice() * 0.18).toFixed(2)}</span>
          </div>
          <div className="summary-line total">
            <span>Total:</span>
            <span>₹{(getCartTotalPrice() + 50 + (getCartTotalPrice() * 0.18)).toFixed(2)}</span>
          </div>
        </div>

        <div className="checkout-actions">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => setCheckoutStep('address')}
          >
            ← Back to Address
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isProcessingPayment || (paymentMethod === 'wallet' && !walletConnected)}
          >
            {isProcessingPayment ? 'Processing...' : `Pay ₹${(getCartTotalPrice() + 50 + (getCartTotalPrice() * 0.18)).toFixed(2)}`}
          </button>
        </div>
      </form>
    </div>
  );

  const CheckoutConfirmationStep = () => (
    <div className="checkout-step confirmation">
      <div className="confirmation-header">
        <div className="success-icon">✅</div>
        <h3>Order Confirmed!</h3>
        <p>Thank you for your purchase</p>
      </div>

      {orderDetails && (
        <div className="order-details">
          <div className="order-info">
            <div className="info-row">
              <span>Order ID:</span>
              <strong>{orderDetails.orderId}</strong>
            </div>
            <div className="info-row">
              <span>Order Date:</span>
              <span>{new Date(orderDetails.orderDate).toLocaleDateString()}</span>
            </div>
            <div className="info-row">
              <span>Estimated Delivery:</span>
              <span>{orderDetails.deliveryDate}</span>
            </div>
            <div className="info-row">
              <span>Tracking Number:</span>
              <span>{orderDetails.trackingNumber}</span>
            </div>
            <div className="info-row">
              <span>Payment Method:</span>
              <span>{orderDetails.paymentMethod}</span>
            </div>
            <div className="info-row total">
              <span>Total Amount:</span>
              <span>₹{orderDetails.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="delivery-address">
            <h4>Delivery Address</h4>
            <p>{orderDetails.deliveryAddress.fullName}</p>
            <p>{orderDetails.deliveryAddress.address}</p>
            <p>{orderDetails.deliveryAddress.city}, {orderDetails.deliveryAddress.state} - {orderDetails.deliveryAddress.pincode}</p>
            <p>Phone: {orderDetails.deliveryAddress.phone}</p>
          </div>

          <div className="order-items">
            <h4>Order Items</h4>
            {orderDetails.items.map(item => (
              <div key={item.id} className="order-item">
                <span>{item.name} × {item.quantity}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="confirmation-actions">
        <button className="btn-primary" onClick={handleContinueShopping}>
          Continue Shopping
        </button>
        <button className="btn-secondary">
          Download Invoice
        </button>
      </div>
    </div>
  );

  // Main render return statement
  return (
    <div className="apmc-container">
      {/* Header */}
      <div className="apmc-header">
        <h1>🏪 APMC Markets & Prices</h1>
        <p>Real-time agricultural market prices and direct purchasing</p>
      </div>

      {/* Shopping Cart Icon */}
      <div className="cart-icon" onClick={() => setShowCart(true)}>
        <span className="cart-badge">{getCartTotalItems()}</span>
        🛒
      </div>

      {/* Main Content */}
      {!selectedMarket ? (
        // Market List View
        <div className="market-list-view">
          <div className="filters-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search markets, commodities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span>🔍</span>
            </div>
            
            <div className="filter-controls">
              <select 
                value={selectedState} 
                onChange={(e) => setSelectedState(e.target.value)}
              >
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Goa">Goa</option>
                <option value="Kerala">Kerala</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
              </select>
              
              <select 
                value={selectedDistrict} 
                onChange={(e) => setSelectedDistrict(e.target.value)}
              >
                <option value="All Districts">All Districts</option>
                <option value="Uttara Kannada">Uttara Kannada</option>
                <option value="Belagavi">Belagavi</option>
                <option value="Dharwad">Dharwad</option>
                <option value="North Goa">North Goa</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading markets...</div>
          ) : (
            <div className="markets-grid">
              {filteredMarkets.map(market => (
                <div key={market.id} className="market-card" onClick={() => handleMarketSelect(market)}>
                  <div className="market-header">
                    <h3>{market.name}</h3>
                    <span className="rating">⭐ {market.rating}</span>
                  </div>
                  <p className="location">📍 {market.location}</p>
                  <p className="distance">{market.distance}</p>
                  
                  <div className="commodities">
                    {market.commodities.slice(0, 4).map(commodity => (
                      <span key={commodity} className="commodity-tag">{commodity}</span>
                    ))}
                    {market.commodities.length > 4 && (
                      <span className="commodity-tag">+{market.commodities.length - 4} more</span>
                    )}
                  </div>
                  
                  <div className="market-footer">
                    <span className="timings">🕒 {market.marketTimings}</span>
                    <span className="traders">👥 {market.totalTraders} traders</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Market Detail View
        <div className="market-detail-view">
          <button className="back-button" onClick={handleBackToList}>
            ← Back to Markets
          </button>

          <div className="market-detail-header">
            <h2>{selectedMarket.name}</h2>
            <p>📍 {selectedMarket.location} • {selectedMarket.distance}</p>
          </div>

          {/* Navigation Tabs */}
          <div className="detail-tabs">
            <button 
              className={!showProducts && !showDirections ? 'active' : ''}
              onClick={() => {
                setShowProducts(false);
                setShowDirections(false);
                setShowEmbeddedMap(false);
              }}
            >
              Market Info
            </button>
            <button 
              className={showProducts ? 'active' : ''}
              onClick={handleShowProducts}
            >
              Products
            </button>
            <button 
              className={showDirections ? 'active' : ''}
              onClick={handleShowDirections}
            >
              Directions
            </button>
          </div>

          {/* Market Info Tab */}
          {!showProducts && !showDirections && (
            <div className="market-info">
              <div className="info-grid">
                <div className="info-card">
                  <h4>📞 Contact Information</h4>
                  <div className="contact-buttons">
                    <button onClick={() => handleCall(selectedMarket.contact)}>
                      📞 Call Office
                    </button>
                    <button onClick={() => handleCall(selectedMarket.chairmanMobile)}>
                      👨‍💼 Call Chairman
                    </button>
                    <button onClick={() => handleSMS(selectedMarket.helpline)}>
                      💬 SMS Helpline
                    </button>
                    <button onClick={() => handleEmail(selectedMarket.email)}>
                      📧 Email
                    </button>
                  </div>
                </div>

                <div className="info-card">
                  <h4>🕒 Market Schedule</h4>
                  <p><strong>Market Days:</strong> {selectedMarket.marketDays.join(', ')}</p>
                  <p><strong>Timings:</strong> {selectedMarket.marketTimings}</p>
                  <p><strong>Established:</strong> {selectedMarket.established}</p>
                </div>

                <div className="info-card">
                  <h4>📊 Market Statistics</h4>
                  <p><strong>Total Traders:</strong> {selectedMarket.totalTraders}</p>
                  <p><strong>Annual Turnover:</strong> {selectedMarket.annualTurnover}</p>
                  <p><strong>License:</strong> {selectedMarket.licenseNumber}</p>
                </div>

                <div className="info-card">
                  <h4>🏪 Facilities</h4>
                  <div className="facilities">
                    {selectedMarket.facilities.map(facility => (
                      <span key={facility} className="facility-tag">✅ {facility}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Real-time Prices */}
              <div className="prices-section">
                <h4>📊 Real-time Commodity Prices</h4>
                {priceLoading ? (
                  <div className="loading">Loading prices...</div>
                ) : (
                  <div className="prices-grid">
                    {Object.entries(realPrices).map(([commodity, priceData]) => (
                      <div key={commodity} className="price-card">
                        <div className="commodity-header">
                          <span className="commodity-name">{commodity}</span>
                          <span className="price-trend">
                            {getTrendIcon(priceData.trend)} {priceData.trend}
                          </span>
                        </div>
                        <div className="price-range">
                          <span>Min: ₹{priceData.min}</span>
                          <span>Max: ₹{priceData.max}</span>
                          <span className="modal-price">Modal: ₹{priceData.modal}</span>
                        </div>
                        <div className="price-footer">
                          <span className="unit">{priceData.unit}</span>
                          <span className="source">Source: {priceData.source}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Products Tab */}
          {showProducts && (
            <div className="products-section">
              <h4>🛍️ Available Products</h4>
              {apiStatus.products === 'loading' ? (
                <div className="loading">Loading products...</div>
              ) : (
                <div className="products-grid">
                  {marketProducts.map(product => (
                    <div key={product.id} className="product-card">
                      <div className="product-image">
                        {product.image}
                      </div>
                      <div className="product-info">
                        <h5>{product.name}</h5>
                        <p className="farmer">By: {product.farmer}</p>
                        <p className="quality">Quality: {product.quality}</p>
                        {product.organic && <span className="organic-badge">🌱 Organic</span>}
                      </div>
                      <div className="product-pricing">
                        <p className="price">₹{product.price}/{product.unit}</p>
                        <p className="stock">Stock: {product.stock} {product.unit}</p>
                        <button 
                          className="add-to-cart-btn"
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0}
                        >
                          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Directions Tab */}
          {showDirections && (
            <div className="directions-section">
              <h4>🗺️ Get Directions</h4>
              <div className="address-card">
                <p><strong>Address:</strong> {selectedMarket.address}</p>
                <p><strong>Coordinates:</strong> {selectedMarket.coordinates.lat.toFixed(4)}, {selectedMarket.coordinates.lng.toFixed(4)}</p>
              </div>

              <div className="direction-buttons">
                <button 
                  className="btn-primary"
                  onClick={() => openGoogleMaps(selectedMarket)}
                >
                  {showEmbeddedMap ? 'Open in Google Maps' : 'Open Google Maps'}
                </button>
                
                <button 
                  className="btn-secondary"
                  onClick={() => openMapWithCoords(selectedMarket)}
                >
                  Open in Maps App
                </button>
              </div>

              {showEmbeddedMap && GOOGLE_MAPS_API_KEY && (
                <div className="embedded-map">
                  <iframe
                    src={embeddedMapUrl}
                    width="100%"
                    height="300"
                    style={{ border: 0, borderRadius: '8px' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Shopping Cart Sidebar */}
      {showCart && (
        <div className="cart-sidebar">
          <div className="cart-header">
            <h3>🛒 Your Cart ({getCartTotalItems()})</h3>
            <button className="close-cart" onClick={() => setShowCart(false)}>×</button>
          </div>

          {checkoutStep === 'cart' && (
            <>
              <div className="cart-items">
                {cart.length === 0 ? (
                  <div className="empty-cart">
                    <p>Your cart is empty</p>
                    <span>Add some products from the market!</span>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="item-info">
                        <h5>{item.name}</h5>
                        <p>From: {item.market}</p>
                        <p className="price">₹{item.price}/{item.unit}</p>
                      </div>
                      <div className="item-controls">
                        <div className="quantity-controls">
                          <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)}>
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)}>
                            +
                          </button>
                        </div>
                        <button 
                          className="remove-btn"
                          onClick={() => handleRemoveFromCart(item.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="cart-footer">
                  <div className="cart-total">
                    <span>Total: ₹{getCartTotalPrice().toFixed(2)}</span>
                  </div>
                  <button className="checkout-btn" onClick={handleProceedToAddress}>
                    Proceed to Checkout →
                  </button>
                </div>
              )}
            </>
          )}

          {/* Checkout Steps */}
          {checkoutStep === 'address' && <CheckoutAddressStep />}
          {checkoutStep === 'payment' && <CheckoutPaymentStep />}
          {checkoutStep === 'confirmation' && <CheckoutConfirmationStep />}
        </div>
      )}

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default APMCMarkets;