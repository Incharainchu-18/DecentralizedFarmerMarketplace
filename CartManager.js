// In your ProductCard component
const handleAddToCart = async () => {
  if (product.stock === 0) return;
  
  setIsAddingToCart(true);
  
  try {
    console.log('Adding to cart:', product.name);
    
    // Use CartManager directly
    CartManager.addToCart(product);
    
    // Call parent handler if provided
    if (onAddToCart) {
      onAddToCart(product);
    }
    
    // Reset loading state
    setTimeout(() => setIsAddingToCart(false), 500);
    
  } catch (error) {
    console.error('Error adding to cart:', error);
    setIsAddingToCart(false);
  }
};