import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Heart, Share2, Star, ChevronLeft, 
  Truck, Shield, Clock, CheckCircle, Minus, Plus
} from 'lucide-react';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');

  // Mock product data
  const mockProduct = {
    id: 1,
    name: 'Organic Tomatoes',
    category: 'vegetables',
    price: 40,
    originalPrice: 50,
    unit: 'kg',
    quantity: 150,
    images: [
      '/images/tomatoes.jpg',
      '/images/tomatoes2.jpg',
      '/images/tomatoes3.jpg'
    ],
    description: 'Fresh organic tomatoes grown using sustainable farming practices. These tomatoes are rich in lycopene, vitamins A and C, and are perfect for salads, cooking, and sauces.',
    fullDescription: `Our organic tomatoes are carefully cultivated in the fertile lands of Punjab using traditional farming methods combined with modern organic practices. 

Key Features:
• 100% Organic Certified
• No Chemical Pesticides
• Rich in Lycopene and Antioxidants
• Freshly Harvested Daily
• Sustainable Farming Practices

Nutritional Benefits:
- High in Vitamin C and Potassium
- Excellent source of Antioxidants
- Low in Calories
- Supports Heart Health

Storage Tips:
- Store at room temperature away from direct sunlight
- Do not refrigerate for best flavor
- Consume within 5-7 days of purchase`,
    rating: 4.5,
    reviews: 24,
    farmer: {
      name: 'Green Valley Farms',
      location: 'Punjab',
      rating: 4.8,
      joined: '2018',
      products: 45,
      verified: true
    },
    organic: true,
    discount: 20,
    featured: true,
    tags: ['organic', 'fresh', 'local', 'sustainable'],
    specifications: {
      'Origin': 'Punjab, India',
      'Harvest Date': '2024-01-15',
      'Expiry Date': '2024-01-25',
      'Storage': 'Room Temperature',
      'Certification': 'Organic India Certified',
      'Packaging': 'Eco-friendly'
    },
    reviewsList: [
      {
        id: 1,
        user: 'Priya Sharma',
        rating: 5,
        comment: 'Best tomatoes I have ever bought! So fresh and flavorful.',
        date: '2024-01-18',
        verified: true
      },
      {
        id: 2,
        user: 'Raj Kumar',
        rating: 4,
        comment: 'Good quality and fresh delivery. Will order again.',
        date: '2024-01-17',
        verified: true
      },
      {
        id: 3,
        user: 'Anita Patel',
        rating: 4.5,
        comment: 'Perfect for making pasta sauce. Organic and tasty!',
        date: '2024-01-16',
        verified: false
      }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProduct(mockProduct);
      setLoading(false);
    }, 800);
  }, [id]);

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.cartQuantity += quantity;
    } else {
      cart.push({
        ...product,
        cartQuantity: quantity
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    alert(`${quantity} ${product.unit} of ${product.name} added to cart!`);
  };

  const handleAddToWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const existingItem = wishlist.find(item => item.id === product.id);

    if (!existingItem) {
      wishlist.push(product);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      window.dispatchEvent(new Event('wishlistUpdated'));
      alert(`${product.name} added to wishlist!`);
    } else {
      alert(`${product.name} is already in your wishlist!`);
    }
  };

  const increaseQuantity = () => {
    if (quantity < product.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="error-container">
          <h2>Product not found</h2>
          <button onClick={() => navigate('/products')} className="back-to-products">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      {/* Navigation */}
      <div className="breadcrumb">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <span>Products / {product.category} / {product.name}</span>
      </div>

      <div className="product-detail-container">
        {/* Image Gallery */}
        <div className="image-gallery">
          <div className="main-image">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="product-main-image"
            />
            <div className="image-badges">
              {product.organic && (
                <span className="badge organic">Organic</span>
              )}
              {product.discount > 0 && (
                <span className="badge discount">-{product.discount}%</span>
              )}
              {product.featured && (
                <span className="badge featured">Featured</span>
              )}
            </div>
          </div>
          
          <div className="thumbnail-images">
            {product.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${product.name} ${index + 1}`}
                className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                onClick={() => setSelectedImage(index)}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>
          
          <div className="product-rating-overview">
            {renderStars(product.rating)}
            <span className="reviews-count">{product.reviews} reviews</span>
            <span className="verified-badge">
              <CheckCircle className="h-4 w-4" />
              Farmer Verified
            </span>
          </div>

          <div className="price-section">
            <div className="current-price">
              ₹{product.price}
              <span className="unit">/{product.unit}</span>
            </div>
            {product.originalPrice > product.price && (
              <div className="original-price">
                ₹{product.originalPrice}
              </div>
            )}
            {product.discount > 0 && (
              <div className="discount-badge">Save {product.discount}%</div>
            )}
          </div>

          <p className="product-short-description">{product.description}</p>

          {/* Farmer Info */}
          <div className="farmer-info">
            <h3>Sold by</h3>
            <div className="farmer-details">
              <div className="farmer-avatar">
                {product.farmer.name.charAt(0)}
              </div>
              <div className="farmer-text">
                <div className="farmer-name">
                  {product.farmer.name}
                  {product.farmer.verified && (
                    <Shield className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <div className="farmer-location">{product.farmer.location}</div>
                <div className="farmer-rating">
                  {renderStars(product.farmer.rating)}
                  <span>{product.farmer.products} products</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="quantity-section">
            <label>Quantity:</label>
            <div className="quantity-selector">
              <button 
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                className="quantity-btn"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="quantity-display">{quantity} {product.unit}</span>
              <button 
                onClick={increaseQuantity}
                disabled={quantity >= product.quantity}
                className="quantity-btn"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="stock-info">
              {product.quantity > 0 ? (
                <span className="in-stock">{product.quantity} available</span>
              ) : (
                <span className="out-of-stock">Out of stock</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={product.quantity === 0}
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart - ₹{(product.price * quantity).toFixed(2)}
            </button>
            
            <button 
              className="wishlist-btn"
              onClick={handleAddToWishlist}
            >
              <Heart className="h-5 w-5" />
            </button>
            
            <button className="share-btn">
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          {/* Delivery Info */}
          <div className="delivery-info">
            <div className="delivery-item">
              <Truck className="h-5 w-5" />
              <div>
                <strong>Free Delivery</strong>
                <p>On orders above ₹500</p>
              </div>
            </div>
            <div className="delivery-item">
              <Clock className="h-5 w-5" />
              <div>
                <strong>Delivery in 2-3 days</strong>
                <p>Across India</p>
              </div>
            </div>
            <div className="delivery-item">
              <Shield className="h-5 w-5" />
              <div>
                <strong>Quality Guarantee</strong>
                <p>Freshness assured</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="product-tabs">
        <div className="tab-headers">
          <button 
            className={`tab-header ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button 
            className={`tab-header ${activeTab === 'specifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('specifications')}
          >
            Specifications
          </button>
          <button 
            className={`tab-header ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({product.reviews})
          </button>
          <button 
            className={`tab-header ${activeTab === 'farmer' ? 'active' : ''}`}
            onClick={() => setActiveTab('farmer')}
          >
            Farmer Info
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'description' && (
            <div className="description-content">
              <h3>Product Description</h3>
              <p>{product.fullDescription}</p>
              
              <div className="tags-section">
                <h4>Tags</h4>
                <div className="tags">
                  {product.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="specifications-content">
              <h3>Product Specifications</h3>
              <div className="specs-grid">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="spec-item">
                    <span className="spec-label">{key}:</span>
                    <span className="spec-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-content">
              <h3>Customer Reviews</h3>
              <div className="reviews-list">
                {product.reviewsList.map(review => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <strong>{review.user}</strong>
                        {review.verified && (
                          <span className="verified-badge">Verified Purchase</span>
                        )}
                      </div>
                      {renderStars(review.rating)}
                    </div>
                    <p className="review-comment">{review.comment}</p>
                    <span className="review-date">{review.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'farmer' && (
            <div className="farmer-content">
              <h3>About the Farmer</h3>
              <div className="farmer-details-expanded">
                <div className="farmer-stats">
                  <div className="stat">
                    <strong>Rating</strong>
                    <span>{product.farmer.rating}/5</span>
                  </div>
                  <div className="stat">
                    <strong>Products</strong>
                    <span>{product.farmer.products}</span>
                  </div>
                  <div className="stat">
                    <strong>Joined</strong>
                    <span>{product.farmer.joined}</span>
                  </div>
                </div>
                <p className="farmer-bio">
                  {product.farmer.name} from {product.farmer.location} has been practicing 
                  sustainable farming for over 5 years. They are committed to providing 
                  fresh, organic produce while maintaining environmentally friendly practices.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;