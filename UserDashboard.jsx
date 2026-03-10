// UserDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./UserDashboard.css";
import logo from "../images/logo1.jpg";

// Import APMC Markets Component
import APMCMarkets from "../pages/APMCMarkets";

// Import product images (keep your existing imports)
import tomatoesImg from "../images/tomatoes.jpg";
import tomatoesImg2 from "../images/tomatoes2.jpg";
import tomatoesImg3 from "../images/tomatoes3.jpg";
import applesImg from "../images/apples.jpg";
import applesImg2 from "../images/apples2.jpg";
import applesImg3 from "../images/apples3.jpg";
import carrotsImg from "../images/carrots.jpg";
import carrotsImg2 from "../images/carrots2.jpg";
import carrotsImg3 from "../images/carrots3.jpg";
import spinachImg from "../images/spinach.jpg";
import spinachImg2 from "../images/spinach2.jpg";
import broccoliImg from "../images/broccoli.jpg";
import broccoliImg2 from "../images/broccoli2.jpg";
import bananasImg from "../images/bananas.jpg";
import bananasImg2 from "../images/bananas2.jpg";
import potatoesImg from "../images/potatoes.jpg";
import potatoesImg2 from "../images/potatoes2.jpg";
import onionsImg from "../images/onions.jpg";
import onionsImg2 from "../images/onions2.jpg";
import mangoesImg from "../images/mangoes.jpg";
import mangoesImg2 from "../images/mangoes2.jpg";
import eggsImg from "../images/eggs.jpg";
import eggsImg2 from "../images/eggs2.jpg";
import milkImg from "../images/milk.jpg";
import milkImg2 from "../images/milk2.jpg";
import riceImg from "../images/rice.jpg";
import riceImg2 from "../images/rice2.jpg";

const UserDashboard = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [user] = useState({
    name: "Inchara",
    avatar: "👩‍🌾",
    email: "inchara@example.com",
    mobile: "+91 9876543210",
    address: "123 Farm Street, Green Valley, Bangalore",
  });

  // Simplified state management
  const [currentPage, setCurrentPage] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [realTimePrices, setRealTimePrices] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraMode, setCameraMode] = useState("device");
  const [imageSearchResults, setImageSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchConfidence, setSearchConfidence] = useState(0);
  const [recognition, setRecognition] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // NEW: Review and Comment States
  const [userReview, setUserReview] = useState({
    rating: 5,
    comment: "",
    userName: "Inchara",
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [productReviews, setProductReviews] = useState([]);

  const [couponCode, setCouponCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(0);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [priceUpdateTime, setPriceUpdateTime] = useState(null);

  // Enhanced products list with all imported images
  const products = [
    {
      _id: "1",
      id: "1",
      name: "Tomatoes",
      description: "Fresh, juicy tomatoes grown locally without pesticides. Rich in vitamins A, C, and antioxidants. Perfect for salads, sauces, and cooking. Harvested daily for maximum freshness.",
      price: 42,
      originalPrice: 60,
      discount: 30,
      category: "Vegetables",
      farmer: "Green Farms Co.",
      farmerName: "Rajesh Gowda",
      farmerRating: 4.8,
      images: [tomatoesImg, tomatoesImg2, tomatoesImg3],
      rating: 4.5,
      reviews: 128,
      stock: 50,
      unit: "kg",
      delivery: "Free delivery",
      organic: true,
      isOrganic: true,
      trending: true,
      nutrition: "Rich in Lycopene, Vitamin C, Potassium",
      shelfLife: "7-10 days",
      location: "Kolar, Karnataka",
      origin: "Kolar, Karnataka",
      searchKeywords: ["tomato", "tomatoes", "red", "vegetable", "fresh", "organic", "juicy", "kolar"],
      farmerDetails: {
        name: "Rajesh Gowda",
        experience: "15 years",
        farmSize: "50 acres",
        certification: "Organic Certified",
        location: "Kolar, Karnataka"
      },
      userReviews: [
        { userName: "Priya S", rating: 5, comment: "Best tomatoes ever! So fresh and tasty.", date: "2024-01-15", verified: true, helpful: 12 },
        { userName: "Rahul M", rating: 4, comment: "Good quality, reasonable price. Will buy again!", date: "2024-01-14", verified: true, helpful: 8 }
      ]
    },
    {
      _id: "2",
      id: "2",
      name: "Apples",
      description: "Crisp, sweet apples from Kodagu hills. Rich in fiber and antioxidants. Great for snacking, baking, or making fresh juice. Hand-picked at peak ripeness.",
      price: 115,
      originalPrice: 150,
      discount: 23,
      category: "Fruits",
      farmer: "Coorg Orchards",
      farmerName: "Sameer Ponnappa",
      farmerRating: 4.9,
      images: [applesImg, applesImg2, applesImg3],
      rating: 4.7,
      reviews: 89,
      stock: 35,
      unit: "kg",
      delivery: "Free delivery",
      organic: true,
      isOrganic: true,
      trending: true,
      nutrition: "High in Fiber, Vitamin C, Antioxidants",
      shelfLife: "2-3 weeks",
      location: "Kodagu, Karnataka",
      origin: "Kodagu, Karnataka",
      searchKeywords: ["apple", "apples", "fruit", "sweet", "coorg", "fresh", "crisp", "kodagu"],
      farmerDetails: {
        name: "Sameer Ponnappa",
        experience: "20 years",
        farmSize: "100 acres",
        certification: "Organic Certified",
        location: "Madikeri, Kodagu"
      },
      userReviews: [
        { userName: "Anita R", rating: 5, comment: "Sweet and crunchy! Perfect apples from Coorg.", date: "2024-01-16", verified: true, helpful: 15 },
        { userName: "Vikram P", rating: 4, comment: "Good quality apples, worth the price.", date: "2024-01-15", verified: true, helpful: 6 }
      ]
    },
    {
      _id: "3",
      id: "3",
      name: "Carrots",
      description: "Sweet and crunchy carrots from Hassan. Packed with beta-carotene and vitamins. Perfect for salads, juices, and cooking. Freshly harvested from organic farms.",
      price: 32,
      originalPrice: 45,
      discount: 29,
      category: "Vegetables",
      farmer: "Hassan Veggie Farms",
      farmerName: "Manjunath Gowda",
      farmerRating: 4.6,
      images: [carrotsImg, carrotsImg2, carrotsImg3],
      rating: 4.4,
      reviews: 67,
      stock: 40,
      unit: "kg",
      delivery: "Free delivery",
      organic: true,
      isOrganic: true,
      trending: false,
      nutrition: "Rich in Beta-Carotene, Vitamin A, Fiber",
      shelfLife: "2-3 weeks",
      location: "Hassan, Karnataka",
      origin: "Hassan, Karnataka",
      searchKeywords: ["carrot", "carrots", "vegetable", "orange", "fresh", "organic", "hassan"],
      farmerDetails: {
        name: "Manjunath Gowda",
        experience: "12 years",
        farmSize: "30 acres",
        certification: "Organic Certified",
        location: "Hassan, Karnataka"
      },
      userReviews: [
        { userName: "Lakshmi P", rating: 5, comment: "Very sweet and fresh carrots! My family loves them.", date: "2024-01-14", verified: true, helpful: 9 },
        { userName: "Suresh K", rating: 4, comment: "Good quality, reasonable price. Fresh delivery.", date: "2024-01-13", verified: true, helpful: 5 }
      ]
    },
    {
      _id: "4",
      id: "4",
      name: "Spinach",
      description: "Fresh green spinach leaves packed with iron and vitamins. Perfect for salads, smoothies, and cooking. Harvested daily from local farms.",
      price: 22,
      originalPrice: 35,
      discount: 37,
      category: "Vegetables",
      farmer: "Green Leaf Organics",
      farmerName: "Priya Reddy",
      farmerRating: 4.7,
      images: [spinachImg, spinachImg2],
      rating: 4.3,
      reviews: 45,
      stock: 25,
      unit: "bunch",
      delivery: "Free delivery",
      organic: true,
      isOrganic: true,
      trending: true,
      nutrition: "High in Iron, Vitamin K, Folate",
      shelfLife: "3-5 days",
      location: "Bangalore, Karnataka",
      origin: "Bangalore, Karnataka",
      searchKeywords: ["spinach", "palak", "greens", "leafy", "vegetable", "fresh", "organic"],
      farmerDetails: {
        name: "Priya Reddy",
        experience: "8 years",
        farmSize: "15 acres",
        certification: "Organic Certified",
        location: "Bangalore, Karnataka"
      },
      userReviews: [
        { userName: "Geeta M", rating: 5, comment: "Very fresh and green spinach! Perfect for smoothies.", date: "2024-01-15", verified: true, helpful: 7 },
        { userName: "Ramesh N", rating: 4, comment: "Good quality, lasts long. Fresh delivery.", date: "2024-01-14", verified: true, helpful: 3 }
      ]
    },
    {
      _id: "5",
      id: "5",
      name: "Broccoli",
      description: "Fresh green broccoli florets rich in vitamins and antioxidants. Perfect for stir-fries, soups, and healthy snacks. Grown in nutrient-rich soil.",
      price: 48,
      originalPrice: 65,
      discount: 26,
      category: "Vegetables",
      farmer: "Healthy Greens Farm",
      farmerName: "Arun Kumar",
      farmerRating: 4.5,
      images: [broccoliImg, broccoliImg2],
      rating: 4.2,
      reviews: 34,
      stock: 20,
      unit: "kg",
      delivery: "Free delivery",
      organic: true,
      isOrganic: true,
      trending: false,
      nutrition: "High in Vitamin C, K, Fiber",
      shelfLife: "5-7 days",
      location: "Chikkaballapur, Karnataka",
      origin: "Chikkaballapur, Karnataka",
      searchKeywords: ["broccoli", "green", "vegetable", "healthy", "fresh", "organic"],
      farmerDetails: {
        name: "Arun Kumar",
        experience: "10 years",
        farmSize: "25 acres",
        certification: "Organic Certified",
        location: "Chikkaballapur, Karnataka"
      },
      userReviews: [
        { userName: "Sanjay R", rating: 4, comment: "Fresh broccoli, good for healthy meals.", date: "2024-01-13", verified: true, helpful: 4 },
        { userName: "Meera K", rating: 5, comment: "Perfect for my diet plan! Very fresh.", date: "2024-01-12", verified: true, helpful: 6 }
      ]
    },
    {
      _id: "6",
      id: "6",
      name: "Bananas",
      description: "Sweet and nutritious bananas from Malnad region. Rich in potassium and natural sugars. Perfect for breakfast, smoothies, or as a healthy snack.",
      price: 28,
      originalPrice: 40,
      discount: 30,
      category: "Fruits",
      farmer: "Malnad Banana Farms",
      farmerName: "Suresh Nayak",
      farmerRating: 4.4,
      images: [bananasImg, bananasImg2],
      rating: 4.1,
      reviews: 78,
      stock: 60,
      unit: "dozen",
      delivery: "Free delivery",
      organic: true,
      isOrganic: true,
      trending: true,
      nutrition: "Rich in Potassium, Vitamin B6, Fiber",
      shelfLife: "3-5 days",
      location: "Shivamogga, Karnataka",
      origin: "Shivamogga, Karnataka",
      searchKeywords: ["banana", "bananas", "fruit", "sweet", "yellow", "fresh", "organic"],
      farmerDetails: {
        name: "Suresh Nayak",
        experience: "18 years",
        farmSize: "40 acres",
        certification: "Organic Certified",
        location: "Shivamogga, Karnataka"
      },
      userReviews: [
        { userName: "Rohit P", rating: 4, comment: "Sweet and perfectly ripe bananas!", date: "2024-01-16", verified: true, helpful: 8 },
        { userName: "Anjali M", rating: 5, comment: "Best bananas for morning breakfast.", date: "2024-01-15", verified: true, helpful: 5 }
      ]
    },
    {
      _id: "7",
      id: "7",
      name: "Potatoes",
      description: "Fresh potatoes from Hassan district. Perfect for curries, fries, and various dishes. Grown in rich soil with natural fertilizers.",
      price: 25,
      originalPrice: 35,
      discount: 29,
      category: "Vegetables",
      farmer: "Hassan Potato Farms",
      farmerName: "Ramesh Gowda",
      farmerRating: 4.3,
      images: [potatoesImg, potatoesImg2],
      rating: 4.0,
      reviews: 92,
      stock: 80,
      unit: "kg",
      delivery: "Free delivery",
      organic: true,
      isOrganic: true,
      trending: false,
      nutrition: "Rich in Carbohydrates, Vitamin C, Potassium",
      shelfLife: "2-3 weeks",
      location: "Hassan, Karnataka",
      origin: "Hassan, Karnataka",
      searchKeywords: ["potato", "potatoes", "vegetable", "fresh", "organic", "hassan"],
      farmerDetails: {
        name: "Ramesh Gowda",
        experience: "22 years",
        farmSize: "60 acres",
        certification: "Organic Certified",
        location: "Hassan, Karnataka"
      },
      userReviews: [
        { userName: "Kavitha S", rating: 4, comment: "Good quality potatoes for daily cooking.", date: "2024-01-14", verified: true, helpful: 7 },
        { userName: "Prakash N", rating: 5, comment: "Fresh and perfect for all dishes.", date: "2024-01-13", verified: true, helpful: 4 }
      ]
    },
    {
      _id: "8",
      id: "8",
      name: "Onions",
      description: "Fresh onions from Bangalore rural areas. Essential for Indian cooking with perfect flavor and aroma. Naturally grown without chemicals.",
      price: 30,
      originalPrice: 45,
      discount: 33,
      category: "Vegetables",
      farmer: "Bangalore Onion Farms",
      farmerName: "Mohammed Ali",
      farmerRating: 4.2,
      images: [onionsImg, onionsImg2],
      rating: 4.1,
      reviews: 56,
      stock: 45,
      unit: "kg",
      delivery: "Free delivery",
      organic: true,
      isOrganic: true,
      trending: false,
      nutrition: "Rich in Antioxidants, Vitamin C",
      shelfLife: "3-4 weeks",
      location: "Bangalore Rural, Karnataka",
      origin: "Bangalore Rural, Karnataka",
      searchKeywords: ["onion", "onions", "vegetable", "fresh", "organic", "cooking"],
      farmerDetails: {
        name: "Mohammed Ali",
        experience: "14 years",
        farmSize: "35 acres",
        certification: "Organic Certified",
        location: "Bangalore Rural, Karnataka"
      },
      userReviews: [
        { userName: "Fatima B", rating: 4, comment: "Good quality onions with strong flavor.", date: "2024-01-15", verified: true, helpful: 6 },
        { userName: "Rajesh K", rating: 5, comment: "Perfect for biryani and curries!", date: "2024-01-14", verified: true, helpful: 3 }
      ]
    },
    {
      _id: "9",
      id: "9",
      name: "Mangoes",
      description: "Sweet and juicy Alphonso mangoes from Karnataka. Known as the king of fruits with rich flavor and aroma. Seasonal delight.",
      price: 180,
      originalPrice: 250,
      discount: 28,
      category: "Fruits",
      farmer: "Karnataka Mango Orchards",
      farmerName: "Srinivas Rao",
      farmerRating: 4.8,
      images: [mangoesImg, mangoesImg2],
      rating: 4.6,
      reviews: 34,
      stock: 15,
      unit: "kg",
      delivery: "Free delivery",
      organic: true,
      isOrganic: true,
      trending: true,
      nutrition: "Rich in Vitamin C, A, Fiber",
      shelfLife: "4-6 days",
      location: "Kolar, Karnataka",
      origin: "Kolar, Karnataka",
      searchKeywords: ["mango", "mangoes", "fruit", "sweet", "alphonso", "fresh", "organic"],
      farmerDetails: {
        name: "Srinivas Rao",
        experience: "25 years",
        farmSize: "80 acres",
        certification: "Organic Certified",
        location: "Kolar, Karnataka"
      },
      userReviews: [
        { userName: "Priya M", rating: 5, comment: "Best mangoes I've ever tasted! So sweet.", date: "2024-01-16", verified: true, helpful: 12 },
        { userName: "Vikram S", rating: 4, comment: "Authentic Alphonso flavor, worth the price.", date: "2024-01-15", verified: true, helpful: 8 }
      ]
    },
    {
      _id: "10",
      id: "10",
      name: "Eggs",
      description: "Farm fresh eggs from free-range chickens. Rich in protein and essential nutrients. Perfect for breakfast and baking.",
      price: 60,
      originalPrice: 75,
      discount: 20,
      category: "Dairy",
      farmer: "Happy Hens Farm",
      farmerName: "Lakshmi Devi",
      farmerRating: 4.5,
      images: [eggsImg, eggsImg2],
      rating: 4.3,
      reviews: 67,
      stock: 100,
      unit: "dozen",
      delivery: "Free delivery",
      organic: true,
      isOrganic: true,
      trending: true,
      nutrition: "High in Protein, Vitamin D, B12",
      shelfLife: "2-3 weeks",
      location: "Tumkur, Karnataka",
      origin: "Tumkur, Karnataka",
      searchKeywords: ["eggs", "egg", "protein", "fresh", "organic", "farm"],
      farmerDetails: {
        name: "Lakshmi Devi",
        experience: "8 years",
        farmSize: "10 acres",
        certification: "Organic Certified",
        location: "Tumkur, Karnataka"
      },
      userReviews: [
        { userName: "Anita K", rating: 5, comment: "Fresh eggs with bright yellow yolks!", date: "2024-01-14", verified: true, helpful: 9 },
        { userName: "Rahul P", rating: 4, comment: "Good quality eggs for daily consumption.", date: "2024-01-13", verified: true, helpful: 5 }
      ]
    },
    {
      _id: "11",
      id: "11",
      name: "Milk",
      description: "Fresh pure milk from grass-fed cows. Rich in calcium and essential nutrients. Pasteurized and packed for maximum freshness.",
      price: 55,
      originalPrice: 70,
      discount: 21,
      category: "Dairy",
      farmer: "Pure Dairy Farms",
      farmerName: "Gopal Reddy",
      farmerRating: 4.6,
      images: [milkImg, milkImg2],
      rating: 4.4,
      reviews: 89,
      stock: 50,
      unit: "liter",
      delivery: "Free delivery",
      organic: true,
      isOrganic: true,
      trending: true,
      nutrition: "Rich in Calcium, Protein, Vitamin D",
      shelfLife: "3-4 days",
      location: "Mandya, Karnataka",
      origin: "Mandya, Karnataka",
      searchKeywords: ["milk", "dairy", "fresh", "organic", "pure", "cow"],
      farmerDetails: {
        name: "Gopal Reddy",
        experience: "12 years",
        farmSize: "50 cows",
        certification: "Organic Certified",
        location: "Mandya, Karnataka"
      },
      userReviews: [
        { userName: "Sunita R", rating: 5, comment: "Pure and fresh milk, my kids love it!", date: "2024-01-16", verified: true, helpful: 11 },
        { userName: "Mahesh K", rating: 4, comment: "Good quality milk for daily use.", date: "2024-01-15", verified: true, helpful: 6 }
      ]
    },
    {
      _id: "12",
      id: "12",
      name: "Rice",
      description: "Premium quality rice from Karnataka's rice bowl. Natural and aromatic, perfect for daily meals and special occasions.",
      price: 85,
      originalPrice: 110,
      discount: 23,
      category: "Grains",
      farmer: "Karnataka Rice Mills",
      farmerName: "Venkatesh Gowda",
      farmerRating: 4.4,
      images: [riceImg, riceImg2],
      rating: 4.2,
      reviews: 45,
      stock: 200,
      unit: "kg",
      delivery: "Free delivery",
      organic: true,
      isOrganic: true,
      trending: false,
      nutrition: "Rich in Carbohydrates, Fiber",
      shelfLife: "6-12 months",
      location: "Raichur, Karnataka",
      origin: "Raichur, Karnataka",
      searchKeywords: ["rice", "grain", "staple", "fresh", "organic", "premium"],
      farmerDetails: {
        name: "Venkatesh Gowda",
        experience: "30 years",
        farmSize: "100 acres",
        certification: "Organic Certified",
        location: "Raichur, Karnataka"
      },
      userReviews: [
        { userName: "Lakshmi N", rating: 4, comment: "Good quality rice, cooks well.", date: "2024-01-14", verified: true, helpful: 4 },
        { userName: "Suresh M", rating: 5, comment: "Aromatic and perfect for biryani.", date: "2024-01-13", verified: true, helpful: 7 }
      ]
    }
  ];

  // Categories with icons
  const categories = [
    { id: "all", name: "All Products", icon: "🛒" },
    { id: "Vegetables", name: "Vegetables", icon: "🥦" },
    { id: "Fruits", name: "Fruits", icon: "🍎" },
    { id: "Dairy", name: "Dairy", icon: "🥛" },
    { id: "Grains", name: "Grains", icon: "🌾" },
    { id: "Organic", name: "Organic", icon: "🌱" },
  ];

  // Available coupons
  const availableCoupons = [
    { code: "WELCOME50", discount: 50, minAmount: 0 },
    { code: "WEEKEND30", discount: 30, minAmount: 500 },
    { code: "ORGANIC25", discount: 25, minAmount: 300 },
    { code: "FREESHIP", discount: 40, minAmount: 200 },
  ];

  // NEW: Star Rating Component
  const StarRating = ({ rating, onRatingChange, editable = false, size = "medium" }) => {
    const starSize = size === "large" ? "28px" : "20px";
    
    return (
      <div className="star-rating" style={{ fontSize: starSize }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? "filled" : ""} ${editable ? "editable" : ""}`}
            onClick={() => editable && onRatingChange(star)}
            style={{ cursor: editable ? "pointer" : "default", marginRight: "2px" }}
          >
            {star <= rating ? "⭐" : "☆"}
          </span>
        ))}
      </div>
    );
  };

  // NEW: Calculate average rating
  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  // NEW: Load reviews from localStorage
  const loadProductReviews = (product) => {
    const savedReviews = localStorage.getItem(`reviews_${product._id}`);
    if (savedReviews) {
      const reviews = JSON.parse(savedReviews);
      setProductReviews(reviews);
      return reviews;
    }
    setProductReviews(product.userReviews || []);
    return product.userReviews || [];
  };

  // NEW: Submit review function
  const submitReview = (product) => {
    if (!userReview.comment.trim()) {
      alert("Please write a review before submitting.");
      return;
    }

    const newReview = {
      userName: userReview.userName,
      rating: userReview.rating,
      comment: userReview.comment,
      date: new Date().toISOString().split("T")[0],
      verified: true,
      helpful: 0
    };

    // Save review to localStorage
    const existingReviews = JSON.parse(localStorage.getItem(`reviews_${product._id}`) || "[]");
    const updatedReviews = [...existingReviews, newReview];
    localStorage.setItem(`reviews_${product._id}`, JSON.stringify(updatedReviews));

    // Update product reviews and rating
    const updatedProduct = {
      ...product,
      userReviews: updatedReviews,
      reviews: updatedReviews.length,
      rating: calculateAverageRating(updatedReviews)
    };

    setSelectedProduct(updatedProduct);
    setProductReviews(updatedReviews);
    setUserReview({ rating: 5, comment: "", userName: "Inchara" });
    setShowReviewForm(false);

    alert("Thank you for your review!");
  };

  // NEW: Mark review as helpful
  const markReviewHelpful = (reviewIndex) => {
    const updatedReviews = [...productReviews];
    updatedReviews[reviewIndex].helpful = (updatedReviews[reviewIndex].helpful || 0) + 1;
    setProductReviews(updatedReviews);
    if (selectedProduct) {
      localStorage.setItem(`reviews_${selectedProduct._id}`, JSON.stringify(updatedReviews));
    }
  };

  // UPDATED: Cart functions to use cartManager
  const loadCartItems = () => {
    try {
      let items = [];
      if (window.cartManager && typeof window.cartManager.getCart === 'function') {
        items = window.cartManager.getCart();
      } else {
        const savedCart = localStorage.getItem("cart");
        items = savedCart ? JSON.parse(savedCart) : [];
      }
      setCartItems(items);
    } catch (error) {
      console.error("Error loading cart:", error);
      setCartItems([]);
    }
  };

  const loadWishlistItems = () => {
    try {
      const savedWishlist = localStorage.getItem("wishlist");
      const items = savedWishlist ? JSON.parse(savedWishlist) : [];
      setWishlistItems(items);
    } catch (error) {
      console.error("Error loading wishlist:", error);
      setWishlistItems([]);
    }
  };

  // UPDATED: Add to cart function to use cartManager
  const handleAddToCart = (product, qty = quantity) => {
    try {
      // Prepare product data for cartManager
      const cartProduct = {
        id: product._id || product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images?.[0] || '',
        images: product.images || [],
        farmer: product.farmerName || product.farmer,
        location: product.location,
        organic: product.isOrganic || product.organic,
        rating: product.rating,
        unit: product.unit,
        category: product.category,
        stock: product.stock,
        deliveryTime: product.deliveryTime
      };

      // Use cartManager if available
      if (window.cartManager && typeof window.cartManager.addToCart === 'function') {
        window.cartManager.addToCart(cartProduct, qty);
        console.log('Added to cart via cartManager:', product.name);
      } else {
        // Fallback to localStorage
        const savedCart = localStorage.getItem("cart");
        let cart = savedCart ? JSON.parse(savedCart) : [];
        
        const existingItemIndex = cart.findIndex((item) => item.id === product._id);
        
        if (existingItemIndex > -1) {
          cart[existingItemIndex].quantity += qty;
        } else {
          cart.push({
            ...cartProduct,
            quantity: qty,
            addedAt: new Date().toISOString(),
          });
        }
        
        localStorage.setItem("cart", JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
      }
      
      // Show success message
      const message = document.createElement('div');
      message.className = 'cart-success-message';
      message.textContent = `✅ ${qty} ${product.unit} of ${product.name} added to cart!`;
      document.body.appendChild(message);
      
      setTimeout(() => {
        message.remove();
      }, 2000);
      
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add item to cart. Please try again.");
    }
  };

  // Add/Remove from wishlist
  const toggleWishlist = (product) => {
    const existingItem = wishlistItems.find((item) => item._id === product._id);
    let newWishlistItems;

    if (existingItem) {
      newWishlistItems = wishlistItems.filter((item) => item._id !== product._id);
    } else {
      newWishlistItems = [
        ...wishlistItems,
        {
          ...product,
          addedAt: new Date().toISOString(),
        },
      ];
    }

    try {
      localStorage.setItem("wishlist", JSON.stringify(newWishlistItems));
      setWishlistItems(newWishlistItems);

      if (!existingItem) {
        alert(`Added ${product.name} to wishlist!`);
      } else {
        alert(`Removed ${product.name} from wishlist!`);
      }
    } catch (error) {
      console.error("Error saving wishlist:", error);
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item._id === productId);
  };

  // Get product price with real-time data
  const getProductPrice = (product) => {
    if (realTimePrices[product._id]) {
      return realTimePrices[product._id].price;
    }
    return product.price;
  };

  // Get original price with real-time data
  const getOriginalPrice = (product) => {
    if (realTimePrices[product._id]) {
      return realTimePrices[product._id].originalPrice;
    }
    return product.originalPrice;
  };

  // Calculate discount
  const getDiscount = (product) => {
    const currentPrice = getProductPrice(product);
    const originalPrice = getOriginalPrice(product);
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.farmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.searchKeywords && product.searchKeywords.some((keyword) => 
        searchQuery.toLowerCase().includes(keyword.toLowerCase())
      ));
    const matchesCategory = activeCategory === "all" || 
      (activeCategory === "Organic" ? product.organic : product.category === activeCategory);
    return matchesSearch && matchesCategory;
  });

  // UPDATED: Get cart item count using cartManager
  const getCartItemCount = () => {
    try {
      if (window.cartManager && typeof window.cartManager.getCartCount === 'function') {
        return window.cartManager.getCartCount();
      }
      
      const savedCart = localStorage.getItem("cart");
      if (!savedCart) return 0;
      
      const cart = JSON.parse(savedCart);
      return cart.reduce((total, item) => total + (item.quantity || 1), 0);
    } catch (error) {
      console.error("Error getting cart count:", error);
      return 0;
    }
  };

  // Handle product detail view - UPDATED
  const handleProductDetail = (product) => {
    const productWithReviews = {
      ...product,
      userReviews: loadProductReviews(product),
    };
    setSelectedProduct(productWithReviews);
    setSelectedImageIndex(0);
    setShowProductDetail(true);
    setQuantity(1);
    setShowReviewForm(false);
  };

  const handleBuyNow = (product) => {
    // First add to cart
    handleAddToCart(product, quantity);
    // Then navigate to cart page
    setTimeout(() => {
      navigate('/cart');
    }, 500);
  };

  // Apply coupon code
  const applyCoupon = () => {
    const coupon = availableCoupons.find((c) => c.code === couponCode);
    if (coupon) {
      const subtotal = parseFloat(totalPrice);
      if (subtotal >= coupon.minAmount) {
        setDiscountApplied(coupon.discount);
        alert(`Coupon applied! You get ${coupon.discount}% discount.`);
      } else {
        alert(`Minimum order amount of ₹${coupon.minAmount} required for this coupon.`);
      }
    } else {
      alert("Invalid coupon code. Please try again.");
    }
  };

  // Calculate total with discount and GST
  const calculateTotal = () => {
    const subtotal = parseFloat(totalPrice);
    const discountAmount = (subtotal * discountApplied) / 100;
    const gstAmount = (subtotal - discountAmount) * 0.05;
    const finalTotal = subtotal - discountAmount + gstAmount;

    return {
      subtotal,
      discountAmount,
      gstAmount,
      finalTotal,
    };
  };

  // Process payment and create order
  const processPayment = () => {
    const order = {
      id: "ORD" + Date.now(),
      items: [
        {
          ...selectedProduct,
          quantity: quantity,
          totalPrice: totalPrice,
        },
      ],
      totalAmount: calculateTotal().finalTotal,
      paymentMethod: paymentMethod,
      status: "confirmed",
      orderDate: new Date().toISOString(),
      deliveryAddress: user.address,
      customer: {
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      },
      couponUsed: couponCode || null,
      discountApplied: discountApplied,
    };

    const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    existingOrders.push(order);
    localStorage.setItem("orders", JSON.stringify(existingOrders));

    setShowPaymentSuccess(true);
    setTimeout(() => {
      setShowPaymentSuccess(false);
      setShowPayment(false);
      setShowProductDetail(false);
      setCouponCode("");
      setDiscountApplied(0);
    }, 3000);
  };

  // Voice Search Functionality
  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice search is not supported in your browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {}
    }

    const newRecognition = new SpeechRecognition();
    
    newRecognition.continuous = false;
    newRecognition.interimResults = false;
    newRecognition.lang = i18n.language === 'hi' ? "hi-IN" : i18n.language === 'kn' ? "kn-IN" : "en-US";

    newRecognition.onstart = () => {
      setIsListening(true);
      setSearchQuery("🎤 Listening... Speak now");
    };

    newRecognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
    };

    newRecognition.onerror = (event) => {
      setIsListening(false);
      setSearchQuery("");
      alert("Voice recognition failed. Please try again.");
    };

    newRecognition.onend = () => {
      setIsListening(false);
      if (searchQuery === "🎤 Listening... Speak now") {
        setSearchQuery("");
      }
    };

    try {
      newRecognition.start();
      setRecognition(newRecognition);
    } catch (error) {
      console.error("Error starting voice recognition:", error);
      setIsListening(false);
      setSearchQuery("");
    }
  };

  const stopVoiceSearch = () => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (error) {
        console.error("Error stopping voice recognition:", error);
      }
    }
    setIsListening(false);
    setSearchQuery("");
  };

  // Camera functions (keep your existing camera functions)
  const startCamera = async () => {
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Cannot access camera. Please check permissions.");
      closeCamera();
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) {
      alert("Camera not ready. Please try again.");
      return;
    }

    try {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvas.toDataURL("image/jpeg", 0.8);
      setCapturedImage(imageData);
      
      if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
      }
      
    } catch (error) {
      console.error("Error capturing image:", error);
      alert("Failed to capture image. Please try again.");
    }
  };

  const closeCamera = () => {
    setShowCamera(false);
    setCapturedImage(null);
    setImageSearchResults([]);
    setIsSearching(false);

    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  const retakeImage = () => {
    setCapturedImage(null);
    setImageSearchResults([]);
    if (cameraMode === "device") {
      startCamera();
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
        setImageSearchResults([]);
      };
      reader.readAsDataURL(file);
    }
  };

  // FIXED: Real Image Classification with Backend API
  const searchWithImage = async (imageData) => {
    setIsSearching(true);
    setSearchConfidence(0);
    setImageSearchResults([]);

    try {
      // Convert base64 image to blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append('image', blob, 'captured-image.jpg');

      // Call your backend API
      const apiResponse = await fetch('/api/images/classify', {
        method: 'POST',
        body: formData
      });

      if (!apiResponse.ok) {
        throw new Error(`API error: ${apiResponse.status}`);
      }

      const result = await apiResponse.json();

      if (result.success) {
        // Use the actual prediction from backend
        const prediction = result.prediction;
        const confidence = result.confidence || 85; // Use actual confidence from API
        
        setSearchQuery(prediction);
        setSearchConfidence(confidence);
        
        // Find matching category
        const matchedProduct = products.find(p => 
          p.name.toLowerCase().includes(prediction.toLowerCase()) ||
          p.searchKeywords.some(keyword => 
            prediction.toLowerCase().includes(keyword.toLowerCase())
          )
        );
        
        if (matchedProduct) {
          setActiveCategory(matchedProduct.category);
        }
        
        alert(`🎯 AI identified: ${prediction} (${confidence}% confidence)`);
      } else {
        throw new Error(result.message || 'Classification failed');
      }

    } catch (error) {
      console.error("Image classification error:", error);
      
      // Fallback to mock data if API fails
      const mockResults = [
        { name: "tomato", confidence: 85, category: "Vegetables" },
        { name: "apple", confidence: 78, category: "Fruits" },
        { name: "carrot", confidence: 72, category: "Vegetables" },
        { name: "potato", confidence: 68, category: "Vegetables" }
      ];
      
      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      setSearchQuery(randomResult.name);
      setActiveCategory(randomResult.category);
      setSearchConfidence(randomResult.confidence);
      
      alert(`🔍 Image search failed. Showing sample result: ${randomResult.name}`);
    } finally {
      setIsSearching(false);
    }
  };

  const useCapturedImage = () => {
    searchWithImage(capturedImage);
  };

  // Price API functions (simplified)
  const fetchRealTimePrices = async () => {
    setIsLoadingPrices(true);
    try {
      // Mock prices for demo
      const mockPrices = {
        "1": { price: 42, originalPrice: 60, source: "Mock Data" },
        "2": { price: 115, originalPrice: 150, source: "Mock Data" },
        "3": { price: 32, originalPrice: 45, source: "Mock Data" },
        "4": { price: 22, originalPrice: 35, source: "Mock Data" },
      };

      setRealTimePrices(mockPrices);
      setPriceUpdateTime(new Date());
    } catch (error) {
      console.error("Error fetching real-time prices:", error);
    } finally {
      setIsLoadingPrices(false);
    }
  };

  const handleRefreshPrices = () => {
    fetchRealTimePrices();
  };

  const formatPriceUpdateTime = () => {
    if (!priceUpdateTime) return "Never";
    return priceUpdateTime.toLocaleTimeString();
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("preferredLanguage", lng);
  };

  // Navigation handler
  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  // UPDATED: Load data on component mount and listen for cart updates
  useEffect(() => {
    loadCartItems();
    loadWishlistItems();
    fetchRealTimePrices();

    // Listen for cart updates
    const handleCartUpdate = () => {
      loadCartItems();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  useEffect(() => {
    if (showCamera && cameraMode === "device") {
      startCamera();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    }
  }, [showCamera, cameraMode]);

  const totalPrice = selectedProduct ? (getProductPrice(selectedProduct) * quantity).toFixed(2) : 0;
  const cartItemCount = getCartItemCount();
  const { subtotal, discountAmount, gstAmount, finalTotal } = calculateTotal();

  // NEW: Enhanced Product Detail Modal with Reviews
  const renderProductDetailModal = () => (
    <div className="modal-overlay">
      <div className="product-detail-modal enhanced">
        <div className="modal-header">
          <h3>{selectedProduct.name}</h3>
          <button onClick={() => setShowProductDetail(false)}>×</button>
        </div>

        <div className="modal-body">
          <div className="image-gallery-enhanced">
            <div className="main-image-container">
              <img src={selectedProduct.images[selectedImageIndex]} alt={selectedProduct.name} className="main-product-image" />
              <div className="image-badges">
                <span className="discount-badge-large">-{getDiscount(selectedProduct)}% OFF</span>
                {selectedProduct.organic && <span className="organic-badge-large">🌱 Organic</span>}
              </div>
            </div>

            <div className="image-thumbnails-horizontal">
              {selectedProduct.images.map((image, index) => (
                <div key={index} className={`thumbnail-item ${selectedImageIndex === index ? "active" : ""}`} onClick={() => setSelectedImageIndex(index)}>
                  <img src={image} alt={`${selectedProduct.name} ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="product-details-enhanced">
            <div className="product-header-section">
              <div className="price-section-large">
                <div className="price-main-large">
                  <span className="current-price-large">₹{getProductPrice(selectedProduct)}/{selectedProduct.unit}</span>
                  <span className="original-price-large">₹{getOriginalPrice(selectedProduct)}</span>
                </div>
                <div className="product-meta-large">
                  <span className="rating-large">
                    <StarRating rating={parseFloat(selectedProduct.rating)} size="large" />
                    {selectedProduct.rating} ({selectedProduct.reviews} reviews)
                  </span>
                  <span className="stock-info">{selectedProduct.stock} {selectedProduct.unit} in stock</span>
                </div>
              </div>

              <div className="quick-actions">
                <button className="wishlist-btn-large" onClick={() => toggleWishlist(selectedProduct)}>
                  {isInWishlist(selectedProduct._id) ? "❤️" : "🤍"}
                  {isInWishlist(selectedProduct._id) ? "In Wishlist" : "Add to Wishlist"}
                </button>
              </div>
            </div>

            <div className="description-section">
              <h4>📖 Product Description</h4>
              <p className="product-description-full">{selectedProduct.description}</p>
            </div>

            <div className="quantity-section-enhanced">
              <h4>📦 Select Quantity</h4>
              <div className="quantity-controls-large">
                <button className="quantity-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                  −
                </button>
                <span className="quantity-display">
                  {quantity} {selectedProduct.unit}
                </span>
                <button className="quantity-btn" onClick={() => setQuantity(quantity + 1)} disabled={quantity >= selectedProduct.stock}>
                  +
                </button>
              </div>
              <div className="quantity-price">
                Total: <span className="total-price">₹{(getProductPrice(selectedProduct) * quantity).toFixed(2)}</span>
              </div>
            </div>

            {/* NEW: Reviews and Comments Section */}
            <div className="reviews-section">
              <div className="reviews-header">
                <h4>💬 Customer Reviews & Ratings</h4>
                <button 
                  className="add-review-btn" 
                  onClick={() => setShowReviewForm(!showReviewForm)}
                >
                  ✍️ Write a Review
                </button>
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <div className="review-form">
                  <h5>Share Your Experience</h5>
                  <div className="rating-input">
                    <label>Your Rating:</label>
                    <StarRating 
                      rating={userReview.rating} 
                      onRatingChange={(rating) => setUserReview({...userReview, rating})}
                      editable={true}
                      size="large"
                    />
                  </div>
                  <div className="comment-input">
                    <label>Your Review:</label>
                    <textarea 
                      placeholder="Share your experience with this product... What did you like? Any suggestions?"
                      value={userReview.comment}
                      onChange={(e) => setUserReview({...userReview, comment: e.target.value})}
                      rows="4"
                    />
                  </div>
                  <div className="review-actions">
                    <button 
                      className="submit-review-btn" 
                      onClick={() => submitReview(selectedProduct)}
                    >
                      Submit Review
                    </button>
                    <button 
                      className="cancel-review-btn" 
                      onClick={() => setShowReviewForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Reviews List */}
              <div className="reviews-list">
                {productReviews.length > 0 ? (
                  productReviews.map((review, index) => (
                    <div key={index} className="review-item">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <span className="reviewer-name">{review.userName}</span>
                          {review.verified && <span className="verified-badge">✅ Verified Buyer</span>}
                        </div>
                        <div className="review-meta">
                          <StarRating rating={review.rating} />
                          <span className="review-date">{review.date}</span>
                        </div>
                      </div>
                      <div className="review-comment">
                        {review.comment}
                      </div>
                      <div className="review-actions">
                        <button 
                          className="helpful-btn"
                          onClick={() => markReviewHelpful(index)}
                        >
                          👍 Helpful ({review.helpful || 0})
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-reviews">
                    <p>No reviews yet. Be the first to review this product!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer-enhanced">
          <button className="add-to-cart-btn-large" onClick={() => handleAddToCart(selectedProduct, quantity)}>
            🛒 Add to Cart ({quantity} {selectedProduct.unit})
          </button>
          <button className="buy-now-btn-large" onClick={() => handleBuyNow(selectedProduct)}>
            ⚡ Buy Now - ₹{(getProductPrice(selectedProduct) * quantity).toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );

  // Home Page
  const renderHomePage = () => (
    <div className="scrollable-content">
      {/* Real-time Prices Banner */}
      <div className="price-update-banner">
        <div className="price-banner-content">
          <div className="price-info">
            <span>🔄 Live Market Prices</span>
            <small>
              {isLoadingPrices ? "Updating..." : `Updated: ${formatPriceUpdateTime()}`}
            </small>
          </div>
          <button className="refresh-prices-btn" onClick={handleRefreshPrices} disabled={isLoadingPrices}>
            {isLoadingPrices ? "🔄" : "↻"} Refresh
          </button>
        </div>
      </div>

      {/* Categories Strip */}
      <section className="categories-strip">
        <div className="categories-scroll">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-strip-btn ${activeCategory === category.id ? "active" : ""}`}
              onClick={() => setActiveCategory(category.id)}
            >
              <span className="category-strip-icon">{category.icon}</span>
              <span className="category-strip-name">{category.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Products Section */}
      <section className="products-section">
        <div className="section-header">
          <h2>
            {activeCategory === "all" ? "🛒 All Products" : activeCategory === "Organic" ? "🌱 Organic Products" : `${categories.find((c) => c.id === activeCategory)?.icon} ${activeCategory}`}
            <span className="product-count">({filteredProducts.length} items)</span>
          </h2>
        </div>

        <div className="products-container">
          {filteredProducts.map((product) => {
            const currentPrice = getProductPrice(product);
            const originalPrice = getOriginalPrice(product);
            const discount = getDiscount(product);
            const inWishlist = isInWishlist(product._id);

            return (
              <div key={product._id} className="product-card" onClick={() => handleProductDetail(product)}>
                <div className="product-img">
                  <img src={product.images[0]} alt={product.name} />
                  <div className="product-badges">
                    <span className="discount-badge">-{discount}%</span>
                  </div>
                  <button
                    className={`wishlist-btn ${inWishlist ? "in-wishlist" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product);
                    }}
                  >
                    {inWishlist ? "❤️" : "🤍"}
                  </button>
                </div>

                <div className="product-info">
                  <div className="product-header">
                    <h3 className="product-title">{product.name}</h3>
                    <p className="product-description">
                      {product.description.length > 80 ? `${product.description.substring(0, 80)}...` : product.description}
                    </p>
                  </div>

                  <div className="product-meta">
                    <div className="product-rating">
                      <span className="rating-stars">⭐ {product.rating}</span>
                      <span className="rating-count">({product.reviews})</span>
                    </div>
                    <div className="farmer-info">
                      <span className="farmer-label">By</span>
                      <span className="farmer-name">{product.farmer}</span>
                    </div>
                  </div>

                  <div className="price-section">
                    <div className="price-main">
                      <span className="current-price">₹{currentPrice}/{product.unit}</span>
                      <span className="original-price">₹{originalPrice}</span>
                    </div>
                    <div className="price-extra">
                      <span className="delivery-info">{product.delivery}</span>
                      {product.stock < 10 && <span className="low-stock">Only {product.stock} left!</span>}
                    </div>
                  </div>

                  <div className="product-actions">
                    <button
                      className="add-to-cart-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product, 1);
                      }}
                    >
                      🛒 Add to Cart
                    </button>
                    <button
                      className="buy-now-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBuyNow(product);
                      }}
                    >
                      ⚡ Buy Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or filter criteria</p>
            <button
              className="clear-filters-btn"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );

  return (
    <div className="user-dashboard">
      {/* Top Header Bar */}
      <div className="top-header">
        <div className="top-header-content">
          <span>🌟 Download our app for better experience</span>
          <div className="top-header-actions">
            <span onClick={() => navigate("/dashboard/farmer")}>👨‍🌾 Farmer Portal</span>
            <span onClick={() => navigate("/help-support")}>Help & Support</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="dashboard-header">
        <div className="header-center">
          <div className="search-bar">
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Search for vegetables, fruits, dairy, grains and more..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                  ✕
                </button>
              )}
            </div>

            <div className="search-actions">
              <button 
                className={`voice-search-btn ${isListening ? "listening" : ""}`} 
                onClick={isListening ? stopVoiceSearch : startVoiceSearch}
              >
                <span className="btn-icon">
                  {isListening ? "🔴" : "🎤"}
                </span>
              </button>

              <button className="camera-search-btn" onClick={() => setShowCamera(true)}>
                <span className="btn-icon">📷</span>
              </button>

              <button className="search-submit-btn">
                <span className="btn-icon">🔍</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Render Current Page */}
      {renderHomePage()}

      {/* Product Detail Modal - UPDATED */}
      {showProductDetail && selectedProduct && renderProductDetailModal()}

      {/* Payment Modal */}
      {showPayment && selectedProduct && (
        <div className="modal-overlay">
          <div className="payment-modal">
            <div className="modal-header">
              <h3>💳 Checkout</h3>
              <button onClick={() => setShowPayment(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="order-summary">
                <h4>Order Summary</h4>
                <div className="order-item">
                  <span>
                    {selectedProduct.name} ({quantity} {selectedProduct.unit})
                  </span>
                  <span>₹{totalPrice}</span>
                </div>

                <div className="coupon-section">
                  <h4>🎫 Apply Coupon</h4>
                  <div className="coupon-input-group">
                    <input type="text" placeholder="Enter coupon code" className="coupon-input" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                    <button className="apply-coupon-btn" onClick={applyCoupon}>
                      Apply
                    </button>
                  </div>
                </div>

                <div className="price-breakdown-payment">
                  <div className="price-item">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="price-item discount">
                    <span>Discount ({discountApplied}%):</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="price-item">
                    <span>GST (5%):</span>
                    <span>₹{gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="price-item">
                    <span>Delivery:</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="price-item total">
                    <span>
                      <strong>Total Amount:</strong>
                    </span>
                    <span>
                      <strong>₹{finalTotal.toFixed(2)}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="payment-methods">
                <h4>Payment Method</h4>
                <div className="payment-options">
                  <label className="payment-option">
                    <input type="radio" value="card" checked={paymentMethod === "card"} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <span>💳 Credit/Debit Card</span>
                  </label>
                  <label className="payment-option">
                    <input type="radio" value="upi" checked={paymentMethod === "upi"} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <span>📱 UPI Payment</span>
                  </label>
                  <label className="payment-option">
                    <input type="radio" value="wallet" checked={paymentMethod === "wallet"} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <span>💰 Wallet</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="pay-now-btn" onClick={processPayment}>
                💰 Pay ₹{finalTotal.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Success Animation */}
      {showPaymentSuccess && (
        <div className="payment-success-animation">
          <div className="success-content">
            <div className="success-icon">✅</div>
            <h3>Payment Successful!</h3>
            <p>Your order has been confirmed</p>
            <p>Order ID: ORD{Date.now()}</p>
            <button onClick={() => setShowPaymentSuccess(false)}>Back to Dashboard</button>
          </div>
        </div>
      )}

      {/* Camera Search Modal */}
      {showCamera && (
        <div className="modal-overlay">
          <div className="camera-modal compact">
            <div className="modal-header">
              <h3>📷 Camera Search</h3>
              <button onClick={closeCamera}>×</button>
            </div>
            <div className="modal-body">
              {!capturedImage ? (
                <div className="camera-interface">
                  <div className="camera-options">
                    <button
                      className={`camera-option-btn ${cameraMode === "device" ? "active" : ""}`}
                      onClick={() => {
                        setCameraMode("device");
                        startCamera();
                      }}
                    >
                      📱 Use Camera
                    </button>
                    <button
                      className={`camera-option-btn ${cameraMode === "upload" ? "active" : ""}`}
                      onClick={() => setCameraMode("upload")}
                    >
                      📁 Upload Photo
                    </button>
                  </div>

                  {cameraMode === "device" ? (
                    <>
                      <div className="camera-preview-container">
                        <video ref={videoRef} autoPlay playsInline className="camera-video" />
                      </div>
                      <div className="camera-controls">
                        <button className="capture-btn" onClick={captureImage}>
                          📸 Capture Photo
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="upload-interface">
                      <div className="upload-area">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileUpload} 
                          className="file-input" 
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="upload-label">
                          <span className="upload-icon">📁</span>
                          <span className="upload-text">Click to upload an image</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="capture-preview">
                  <div className="preview-image-container">
                    <img src={capturedImage} alt="Captured" className="captured-image" />
                  </div>

                  {isSearching ? (
                    <div className="searching-overlay">
                      <div className="searching-spinner"></div>
                      <p>🔍 Analyzing image and searching for products...</p>
                    </div>
                  ) : (
                    <div className="capture-actions">
                      <button className="retake-btn" onClick={retakeImage}>
                        🔄 Retake
                      </button>
                      <button className="use-image-btn" onClick={useCapturedImage}>
                        ✅ Search with this Image
                      </button>
                      <button className="close-preview-btn" onClick={closeCamera}>
                        ❌ Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};    

export default UserDashboard;