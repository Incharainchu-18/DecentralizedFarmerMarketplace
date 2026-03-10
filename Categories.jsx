import React, { useState } from 'react';
import './Categories.css';

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    {
      id: 1,
      name: 'Fresh Vegetables',
      icon: '🥦',
      description: 'Organic and locally grown vegetables',
      products: [
        { id: 101, name: 'Spinach', price: 40, unit: 'bunch', farmer: 'Happy Farms', organic: true },
        { id: 102, name: 'Broccoli', price: 70, unit: 'kg', farmer: 'Sharavathi Farms', organic: true },
        { id: 103, name: 'Carrots', price: 50, unit: 'kg', farmer: 'Annadhata Farms', organic: true },
        { id: 104, name: 'Tomatoes', price: 80, unit: 'kg', farmer: 'Happy Farms', organic: true },
        { id: 105, name: 'Potatoes', price: 30, unit: 'kg', farmer: 'Sharavathi Farms', organic: false },
        { id: 106, name: 'Onions', price: 35, unit: 'kg', farmer: 'Annadhata Farms', organic: false }
      ]
    },
    {
      id: 2,
      name: 'Fresh Fruits',
      icon: '🍎',
      description: 'Seasonal fruits and fresh produce',
      products: [
        { id: 201, name: 'Bananas', price: 40, unit: 'dozen', farmer: 'Happy Farms', organic: true },
        { id: 202, name: 'Mangoes', price: 300, unit: 'kg', farmer: 'Sharavathi Farms', organic: true },
        { id: 203, name: 'Apples', price: 180, unit: 'kg', farmer: 'Annadhata Farms', organic: true },
        { id: 204, name: 'Oranges', price: 120, unit: 'kg', farmer: 'Happy Farms', organic: false },
        { id: 205, name: 'Strawberries', price: 150, unit: 'box', farmer: 'Sharavathi Farms', organic: true },
        { id: 206, name: 'Grapes', price: 200, unit: 'kg', farmer: 'Annadhata Farms', organic: true }
      ]
    },
    {
      id: 3,
      name: 'Dairy Products',
      icon: '🥛',
      description: 'Fresh dairy and milk products',
      products: [
        { id: 301, name: 'Milk', price: 60, unit: 'liter', farmer: 'Happy Farms', organic: true },
        { id: 302, name: 'Eggs', price: 120, unit: 'dozen', farmer: 'Sharavathi Farms', organic: true },
        { id: 303, name: 'Paneer', price: 280, unit: 'kg', farmer: 'Annadhata Farms', organic: true },
        { id: 304, name: 'Curd', price: 85, unit: 'kg', farmer: 'Happy Farms', organic: false },
        { id: 305, name: 'Butter', price: 100, unit: '500g', farmer: 'Sharavathi Farms', organic: true },
        { id: 306, name: 'Cheese', price: 350, unit: '500g', farmer: 'Annadhata Farms', organic: true }
      ]
    },
    {
      id: 4,
      name: 'Poultry & Meat',
      icon: '🍗',
      description: 'Fresh poultry and meat products',
      products: [
        { id: 401, name: 'Chicken Breast', price: 350, unit: 'kg', farmer: 'Happy Farms', organic: true },
        { id: 402, name: 'Chicken Legs', price: 280, unit: 'kg', farmer: 'Sharavathi Farms', organic: true },
        { id: 403, name: 'Fresh Fish', price: 450, unit: 'kg', farmer: 'Annadhata Farms', organic: false },
        { id: 404, name: 'Mutton', price: 800, unit: 'kg', farmer: 'Happy Farms', organic: true },
        { id: 405, name: 'Eggs (Large)', price: 130, unit: 'dozen', farmer: 'Sharavathi Farms', organic: true }
      ]
    },
  ];

  const formatIndianPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = (product) => {
    alert(`${product.name} added to cart! 🛒\nPrice: ${formatIndianPrice(product.price)}/${product.unit}\nFarm: ${product.farmer}`);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.products.some(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  // Get all products for featured section
  const featuredProducts = categories.flatMap(category => 
    category.products.slice(0, 2).map(product => ({
      ...product,
      category: category.name
    }))
  );

  return (
    <div className="categories-page">
      {/* Header Section */}
      <div className="categories-header text-center mb-5">
        <h1 className="display-4 fw-bold text-white">
          <i className="bi bi-grid-3x3-gap me-3"></i>
          Farm Categories
        </h1>
        <p className="lead text-white-50">Discover fresh, organic products from local farmers</p>
      </div>

      {/* Search Bar */}
      <div className="container">
        <div className="row justify-content-center mb-5">
          <div className="col-md-8">
            <div className="search-box">
              <i className="bi bi-search"></i>
              <input 
                type="text" 
                className="form-control form-control-lg" 
                placeholder="Search categories or products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="search-clear"
                  onClick={() => setSearchTerm('')}
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        {!selectedCategory && (
          <div className="categories-grid mb-5">
            <h3 className="section-title mb-4">
              <i className="bi bi-grid me-2"></i>
              Product Categories
            </h3>
            <div className="row g-4">
              {filteredCategories.length > 0 ? (
                filteredCategories.map(category => (
                  <div key={category.id} className="col-lg-3 col-md-4 col-sm-6">
                    <div 
                      className={`category-card ${selectedCategory === category.id ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div className="category-icon">
                        <span className="icon-emoji">{category.icon}</span>
                      </div>
                      <div className="category-content">
                        <h5 className="category-name">{category.name}</h5>
                        <p className="category-description">{category.description}</p>
                        <div className="category-products">
                          {category.products.slice(0, 3).map((product, index) => (
                            <span key={product.id} className="product-tag">{product.name}</span>
                          ))}
                          {category.products.length > 3 && (
                            <span className="product-tag more">+{category.products.length - 3} more</span>
                          )}
                        </div>
                        <div className="category-stats">
                          <small>
                            <i className="bi bi-shop me-1"></i>
                            {new Set(category.products.map(p => p.farmer)).size} farms
                          </small>
                          <small>
                            <i className="bi bi-basket me-1"></i>
                            {category.products.length} products
                          </small>
                        </div>
                      </div>
                      <div className="category-arrow">
                        <i className="bi bi-chevron-right"></i>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center py-5">
                  <i className="bi bi-search display-1 text-muted"></i>
                  <h4 className="text-muted mt-3">No categories found</h4>
                  <p className="text-muted">Try adjusting your search terms</p>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => setSearchTerm('')}
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Category Products View */}
        {selectedCategoryData && (
          <div className="category-products-view mb-5">
            <div className="section-header d-flex justify-content-between align-items-center mb-4">
              <div>
                <h3 className="section-title mb-0">
                  <span className="category-icon-small me-2">{selectedCategoryData.icon}</span>
                  {selectedCategoryData.name}
                </h3>
                <p className="text-muted mb-0">{selectedCategoryData.description}</p>
              </div>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => setSelectedCategory(null)}
              >
                <i className="bi bi-arrow-left me-1"></i>
                Back to Categories
              </button>
            </div>

            {/* Products Grid */}
            <div className="row g-4">
              {selectedCategoryData.products.map(product => (
                <div key={product.id} className="col-lg-3 col-md-4 col-sm-6">
                  <div className="product-card">
                    <div className="product-image">
                      <div className="image-placeholder">
                        {product.name.split(' ')[0].charAt(0)}
                      </div>
                      {product.organic && <div className="product-badge organic">Organic</div>}
                      <div className="product-badge farmer">{product.farmer}</div>
                    </div>
                    <div className="product-content">
                      <h6 className="product-name">{product.name}</h6>
                      <p className="product-farmer">
                        <i className="bi bi-geo-alt me-1"></i>
                        {product.farmer}
                      </p>
                      <div className="product-price">
                        {formatIndianPrice(product.price)}<small>/{product.unit}</small>
                      </div>
                      <button 
                        className="btn btn-success btn-sm w-100 mt-2"
                        onClick={() => handleAddToCart(product)}
                      >
                        <i className="bi bi-cart-plus me-1"></i>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Products */}
        {!selectedCategory && filteredCategories.length > 0 && (
          <div className="featured-products">
            <h3 className="section-title mb-4">
              <i className="bi bi-star me-2"></i>
              Featured Products
            </h3>
            <div className="row g-4">
              {featuredProducts.map(product => (
                <div key={product.id} className="col-lg-3 col-md-4 col-sm-6">
                  <div className="product-card">
                    <div className="product-image">
                      <div className="image-placeholder">
                        {product.name.split(' ')[0].charAt(0)}
                      </div>
                      {product.organic && <div className="product-badge organic">Organic</div>}
                      <div className="category-badge">{product.category}</div>
                    </div>
                    <div className="product-content">
                      <h6 className="product-name">{product.name}</h6>
                      <p className="product-farmer">
                        <i className="bi bi-shop me-1"></i>
                        {product.farmer}
                      </p>
                      <div className="product-price">
                        {formatIndianPrice(product.price)}<small>/{product.unit}</small>
                      </div>
                      <button 
                        className="btn btn-success btn-sm w-100 mt-2"
                        onClick={() => handleAddToCart(product)}
                      >
                        <i className="bi bi-cart-plus me-1"></i>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {!selectedCategory && (
          <div className="quick-stats mt-5">
            <div className="row text-center">
              <div className="col-md-3 col-6">
                <div className="stat-item">
                  <i className="bi bi-shop"></i>
                  <h4>3</h4>
                  <p>Local Farms</p>
                </div>
              </div>
              <div className="col-md-3 col-6">
                <div className="stat-item">
                  <i className="bi bi-basket"></i>
                  <h4>30+</h4>
                  <p>Products</p>
                </div>
              </div>
              <div className="col-md-3 col-6">
                <div className="stat-item">
                  <i className="bi bi-truck"></i>
                  <h4>24/7</h4>
                  <p>Delivery</p>
                </div>
              </div>
              <div className="col-md-3 col-6">
                <div className="stat-item">
                  <i className="bi bi-award"></i>
                  <h4>80%</h4>
                  <p>Organic</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;