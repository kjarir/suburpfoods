import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RecommendationEngine from '../components/RecommendationEngine';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { toast } from '@/hooks/use-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { products, loading, error } = useProducts();
  const product = products.find(p => p.id === id);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="text-xl text-gray-600">Loading product...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="text-xl text-red-600">Error loading product: {error}</p>
          <Link to="/products">
            <Button className="mt-4">Back to Products</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Link to="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link to="/products" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="animate-fade-in">
            <img
              src={product.image && product.image.trim() !== '' ? product.image : '/placeholder.svg'}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </div>

          {/* Product Information */}
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="mb-4">
              <span className="text-sm text-gray-500 uppercase tracking-wide">
                {product.category}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            
            <p className="text-2xl font-bold text-gray-900 mb-6">
            ₹{product.price.toFixed(2)}
            </p>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                size="lg"
                onClick={handleAddToCart}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant={isInWishlist(product.id) ? "default" : "outline"}
                onClick={handleWishlistToggle}
                className="flex-1"
              >
                <Heart className={`h-5 w-5 mr-2 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                {isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </Button>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {product.ingredients && product.ingredients.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Ingredients</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {product.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {product.nutritionFacts && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Nutrition Facts</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Calories:</span>
                        <span className="ml-2 text-gray-600">{product.nutritionFacts.calories}</span>
                      </div>
                      <div>
                        <span className="font-medium">Protein:</span>
                        <span className="ml-2 text-gray-600">{product.nutritionFacts.protein}</span>
                      </div>
                      <div>
                        <span className="font-medium">Carbs:</span>
                        <span className="ml-2 text-gray-600">{product.nutritionFacts.carbs}</span>
                      </div>
                      <div>
                        <span className="font-medium">Fat:</span>
                        <span className="ml-2 text-gray-600">{product.nutritionFacts.fat}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-16">
          <RecommendationEngine 
            currentProductId={product.id}
            category={product.category}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
