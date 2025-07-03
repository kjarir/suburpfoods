
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { toast } from '@/hooks/use-toast';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, loading } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (product: any) => {
    addItem(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="text-xl text-gray-600">Loading wishlist...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <Heart className="h-24 w-24 text-gray-300 mx-auto mb-8" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your wishlist is empty</h1>
            <p className="text-xl text-gray-600 mb-8">
              Save items you love to your wishlist.
            </p>
            <Link to="/products">
              <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">My Wishlist</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="relative mb-4">
                  <img
                    src={item.image && item.image.trim() !== '' ? item.image : '/placeholder.svg'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-2 right-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <Link to={`/products/${item.id}`} className="hover:text-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                </Link>
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">
                  {item.category}
                </p>
                <p className="text-lg font-bold text-gray-900 mb-4">
                  ₹{item.price.toFixed(2)}
                </p>

                <Button
                  onClick={() => handleAddToCart(item)}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Wishlist;
