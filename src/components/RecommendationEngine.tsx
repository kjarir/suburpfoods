
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProductCard from './ProductCard';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface RecommendationEngineProps {
  currentProductId?: string;
  category?: string;
}

const RecommendationEngine: React.FC<RecommendationEngineProps> = ({ 
  currentProductId, 
  category 
}) => {
  const { products } = useProducts();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateRecommendations();
  }, [products, currentProductId, category, user]);

  const generateRecommendations = async () => {
    if (products.length === 0) return;

    setLoading(true);
    try {
      let recommendedProducts = [];

      if (user) {
        // Get user's order history for personalized recommendations
        const { data: orderHistory } = await supabase
          .from('order_items')
          .select(`
            products (*)
          `)
          .eq('orders.user_id', user.id);

        // Get frequently bought together items
        if (orderHistory && orderHistory.length > 0) {
          const categories = orderHistory.map(item => item.products.category);
          const uniqueCategories = [...new Set(categories)];
          
          recommendedProducts = products.filter(product => 
            uniqueCategories.includes(product.category) && 
            product.id !== currentProductId
          ).slice(0, 4);
        }
      }

      // Fallback to category-based recommendations
      if (recommendedProducts.length < 4) {
        const categoryProducts = products.filter(product => 
          product.category === category && product.id !== currentProductId
        );
        
        const randomProducts = products
          .filter(product => product.id !== currentProductId)
          .sort(() => 0.5 - Math.random())
          .slice(0, 4 - recommendedProducts.length);

        recommendedProducts = [...recommendedProducts, ...categoryProducts, ...randomProducts]
          .slice(0, 4);
      }

      setRecommendations(recommendedProducts);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Fallback to random products
      const randomProducts = products
        .filter(product => product.id !== currentProductId)
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
      setRecommendations(randomProducts);
    } finally {
      setLoading(false);
    }
  };

  if (loading || recommendations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended for You</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationEngine;
