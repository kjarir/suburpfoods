
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { itemCount } = useCart();
  const { user, signOut, isAdmin, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">Subburpfood</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link to="/products" className="text-gray-700 hover:text-gray-900 transition-colors">
                Products
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-gray-900 transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-gray-900 transition-colors">
                Contact
              </Link>
              <Link to="/faq" className="text-gray-700 hover:text-gray-900 transition-colors">
                FAQ
              </Link>
              {user && (
                <Link to="/razorpay-test" className="text-gray-700 hover:text-gray-900 transition-colors">
                  Payment Test
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              )}
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="hidden md:flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Welcome, {profile?.first_name || user.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-gray-700 hover:text-gray-900"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAuthModal(true)}
                  className="hidden md:flex text-gray-700 hover:text-gray-900"
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )}

              <Link to="/cart" className="relative">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 border-t">
              <div className="flex flex-col space-y-4 pt-4">
                <Link 
                  to="/" 
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/products" 
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Products
                </Link>
                <Link 
                  to="/about" 
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  to="/contact" 
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link 
                  to="/faq" 
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  FAQ
                </Link>
                {user && (
                  <Link 
                    to="/razorpay-test" 
                    className="text-gray-700 hover:text-gray-900 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Payment Test
                  </Link>
                )}
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                
                {user ? (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Welcome, {profile?.first_name || user.email}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="text-gray-700 hover:text-gray-900 justify-start p-0"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="border-t pt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowAuthModal(true);
                        setIsMenuOpen(false);
                      }}
                      className="text-gray-700 hover:text-gray-900 justify-start p-0"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default Navbar;
