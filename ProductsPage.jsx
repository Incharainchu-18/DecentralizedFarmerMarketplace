import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ShoppingCart, Star, Heart, Share2 } from 'lucide-react';
import './ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);

  // Mock product data for e-commerce
  const mockProducts = [
    {
      id: 1,
      name: 'Organic Tomatoes',
      category: 'vegetables',
      price: 40,
      originalPrice: 50,
      unit: 'kg',
      quantity: 150,
      image: '/images/tomatoes.jpg',
      description: 'Fresh organic tomatoes from local farms, rich in flavor and nutrients',
      rating: 4.5,
      reviews: 24,
      farmer: 'Green Valley Farms',
      location: 'Punjab',
      organic: true,
      discount: 20,
      featured: true,
      tags: ['organic', 'fresh', 'local']
    },
    {
      id: 2,
      name: 'Premium Basmati Rice',
      category: 'grains',
      price: 80,
      originalPrice: 90,
      unit: 'kg',
      quantity: 500,
      image: '/images/rice.jpg',
      description: 'Aromatic long-grain basmati rice, perfect for biryani',
      rating: 4.8,
      reviews: 36,
      farmer: 'Rice Paradise',
      location: 'Haryana',
      organic: true,
      discount: 11,
      featured: false,
      tags: ['premium', 'aromatic', 'long-grain']
    },
    {
      id: 3,
      name: 'Fresh Cow Milk',
      category: 'dairy',
      price: 50,
      originalPrice: 50,
      unit: 'liter',
      quantity: 200,
      image: '/images/milk.jpg',
      description: 'Fresh pasteurized milk from grass-fed cows',
      rating: 4.3,
      reviews: 18,
      farmer: 'Dairy Fresh Co.',
      location: 'Maharashtra',
      organic: false,
      discount: 0,
      featured: true,
      tags: ['pasteurized', 'fresh', 'daily']
    },
    {
      id: 4,
      name: 'Alphonso Mangoes',
      category: 'fruits',
      price: 120,
      originalPrice: 150,
      unit: 'kg',
      quantity: 80,
      image: '/images/mangoes.jpg',
      description: 'King of mangoes from Ratnagiri, sweet and fiberless',
      rating: 4.9,
      reviews: 42,
      farmer: 'Mango Paradise',
      location: 'Maharashtra',
      organic: true,
      discount: 20,
      featured: true,
      tags: ['seasonal', 'premium', 'sweet']
    },
    {
      id: 5,
      name: 'Farm Fresh Eggs',
      category: 'poultry',
      price: 6,
      originalPrice: 7,
      unit: 'piece',
      quantity: 1000,
      image: '/images/eggs.jpg',
      description: 'Organic free-range eggs from happy hens',
      rating: 4.6,
      reviews: 29,
      farmer: 'Happy Hens Farm',
      location: 'Tamil Nadu',
      organic: true,
      discount: 14,
      featured: false,
      tags: ['free-range', 'organic', 'fresh']
    },
    {
      id: 6,
      name: 'Fresh Carrots',
      category: 'vegetables',
      price: 30,
      originalPrice: 35,
      unit: 'kg',
      quantity: 200,
      image: '/images/carrots.jpg',
      description: 'Sweet and crunchy organic carrots, rich in beta-carotene',
      rating: 4.4,
      reviews: 15,
      farmer: 'Roots & Shoots Farm',
      location: 'Uttar Pradesh',
      organic: true,
      discount: 14,
      featured: false,
      tags: ['crunchy', 'sweet', 'vitamin-rich']
    },
    {
      id: 7,
      name: 'Broccoli',
      category: 'vegetables',
      price: 60,
      originalPrice: 70,
      unit: 'kg',
      quantity: 75,
      image: '/images/broccoli.jpg',
      description: 'Fresh green broccoli packed with antioxidants',
      rating: 4.2,
      reviews: 12,
      farmer: 'Green Garden Farms',
      location: 'Himachal Pradesh',
      organic: true,
      discount: 14,
      featured: false,
      tags: ['antioxidants', 'fresh', 'green']
    },
    {
      id: 8,
      name: 'Bananas',
      category: 'fruits',
      price: 45,
      originalPrice: 50,
      unit: 'dozen',
      quantity: 300,
      image: '/images/bananas.jpg',
      description: 'Sweet and ripe bananas, perfect for smoothies',
      rating: 4.1,
      reviews: 22,
      farmer: 'Tropical Fruits Co.',
      location: 'Kerala',
      organic: false,
      discount: 10,
      featured: false,
      tags: ['ripe', 'sweet', 'energy']
    }
  ];

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'grains', label: 'Grains' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'poultry', label: 'Poultry' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Name A-Z' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [searchTerm, selectedCategory, sortBy, products]);

  const filterAndSortProducts = () => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.farmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Sort products
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'popular':
          return b.reviews - a.reviews;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        ...product,
        cartQuantity: 1
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    
    // Show success message
    alert(`${product.name} added to cart!`);
  };

  const handleAddToWishlist = (product) => {
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

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      {/* Hero Section */}
      <div className="products-hero">
        <div className="hero-content">
          <h1>Fresh Farm Products</h1>
          <p>Direct from farmers to your doorstep</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-container">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search products, farmers, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <Filter className="filter-icon" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-filter"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-filter"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="results-info">
          <p>Showing {filteredProducts.length} of {products.length} products</p>
        </div>
      </div>

      {/* Featured Products */}
      {filteredProducts.filter(p => p.featured).length > 0 && (
        <div className="featured-section">
          <h2>Featured Products</h2>
          <div className="featured-grid">
            {filteredProducts.filter(p => p.featured).map(product => (
              <div key={product.id} className="featured-product">
                <div className="product-badge">Featured</div>
                <img src={product.image} alt={product.name} />
                <div className="featured-info">
                  <h3>{product.name}</h3>
                  <p>₹{product.price}/{product.unit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="products-grid-section">
        <div className="products-grid">
          {filteredProducts.length === 0 ? (
            <div className="no-products">
              <p>No products found matching your criteria.</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSortBy('name');
                }}
                className="reset-filters-btn"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                      e.target.src = '/images/placeholder-product.jpg';
                    }}
                  />
                  
                  {/* Product Badges */}
                  <div className="product-badges">
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

                  {/* Quick Actions */}
                  <div className="quick-actions">
                    <button 
                      className="action-btn wishlist-btn"
                      onClick={() => handleAddToWishlist(product)}
                    >
                      <Heart className="h-4 w-4" />
                    </button>
                    <button className="action-btn share-btn">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  
                  <div className="product-meta">
                    <span className="farmer">By {product.farmer}</span>
                    <span className="location">{product.location}</span>
                  </div>

                  <div className="product-rating">
                    {renderStars(product.rating)}
                    <span className="reviews">({product.reviews})</span>
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
                  </div>

                  <div className="stock-info">
                    {product.quantity > 0 ? (
                      <span className="in-stock">{product.quantity} in stock</span>
                    ) : (
                      <span className="out-of-stock">Out of stock</span>
                    )}
                  </div>

                  <div className="product-actions">
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.quantity === 0}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </button>
                    
                    <Link 
                      to={`/product/${product.id}`}
                      className="view-details-btn"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Categories Section */}
      <div className="categories-section">
        <h2>Shop by Category</h2>
        <div className="categories-grid">
          {categories.filter(cat => cat.value !== 'all').map(category => (
            <div 
              key={category.value}
              className={`category-card ${selectedCategory === category.value ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.value)}
            >
              <div className="category-icon">
                {category.value === 'vegetables' && '🥦'}
                {category.value === 'fruits' && '🍎'}
                {category.value === 'grains' && '🌾'}
                {category.value === 'dairy' && '🥛'}
                {category.value === 'poultry' && '🥚'}
              </div>
              <h3>{category.label}</h3>
              <p>
                {products.filter(p => p.category === category.value).length} products
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;