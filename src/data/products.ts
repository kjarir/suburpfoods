
import { Product } from '../contexts/CartContext';

export const products: Product[] = [
  {
    id: '1',
    name: 'Artisan Sourdough Bread',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500&h=500&fit=crop',
    category: 'Bakery',
    description: 'Handcrafted sourdough bread made with organic flour and aged starter. Perfect for breakfast or as a side for any meal.',
    ingredients: ['Organic flour', 'Water', 'Sourdough starter', 'Sea salt'],
    nutritionFacts: {
      calories: 245,
      protein: '8g',
      carbs: '45g',
      fat: '2g'
    }
  },
  {
    id: '2',
    name: 'Organic Honey',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?w=500&h=500&fit=crop',
    category: 'Pantry',
    description: 'Pure, raw organic honey sourced from local beekeepers. Rich in antioxidants and perfect for sweetening tea or toast.',
    ingredients: ['100% Raw Honey'],
    nutritionFacts: {
      calories: 64,
      protein: '0g',
      carbs: '17g',
      fat: '0g'
    }
  },
  {
    id: '3',
    name: 'Free-Range Eggs',
    price: 6.49,
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&h=500&fit=crop',
    category: 'Dairy & Eggs',
    description: 'Farm-fresh eggs from free-range chickens. Rich in protein and perfect for any meal of the day.',
    ingredients: ['Free-range chicken eggs'],
    nutritionFacts: {
      calories: 70,
      protein: '6g',
      carbs: '0g',
      fat: '5g'
    }
  },
  {
    id: '4',
    name: 'Grass-Fed Beef',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=500&h=500&fit=crop',
    category: 'Meat',
    description: 'Premium grass-fed beef from local farms. Tender, flavorful, and sustainably raised.',
    ingredients: ['100% Grass-fed beef'],
    nutritionFacts: {
      calories: 250,
      protein: '26g',
      carbs: '0g',
      fat: '15g'
    }
  },
  {
    id: '5',
    name: 'Organic Vegetables Box',
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&h=500&fit=crop',
    category: 'Produce',
    description: 'A curated selection of seasonal organic vegetables. Fresh, nutritious, and perfect for healthy meals.',
    ingredients: ['Mixed organic vegetables (seasonal)'],
    nutritionFacts: {
      calories: 35,
      protein: '2g',
      carbs: '7g',
      fat: '0g'
    }
  },
  {
    id: '6',
    name: 'Artisan Cheese Selection',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&h=500&fit=crop',
    category: 'Dairy & Eggs',
    description: 'A selection of artisan cheeses from local dairies. Perfect for cheese boards or cooking.',
    ingredients: ['Various artisan cheeses', 'Milk', 'Cultures', 'Salt'],
    nutritionFacts: {
      calories: 113,
      protein: '7g',
      carbs: '1g',
      fat: '9g'
    }
  },
  {
    id: '7',
    name: 'Cold-Pressed Juice',
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=500&h=500&fit=crop',
    category: 'Beverages',
    description: 'Fresh cold-pressed juice made from organic fruits and vegetables. Packed with vitamins and nutrients.',
    ingredients: ['Organic fruits', 'Organic vegetables'],
    nutritionFacts: {
      calories: 120,
      protein: '2g',
      carbs: '28g',
      fat: '0g'
    }
  },
  {
    id: '8',
    name: 'Craft Coffee Beans',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=500&fit=crop',
    category: 'Beverages',
    description: 'Single-origin coffee beans roasted to perfection. Rich, aromatic, and ethically sourced.',
    ingredients: ['100% Arabica coffee beans'],
    nutritionFacts: {
      calories: 2,
      protein: '0g',
      carbs: '0g',
      fat: '0g'
    }
  }
];

export const categories = [
  'All',
  'Bakery',
  'Pantry',
  'Dairy & Eggs',
  'Meat',
  'Produce',
  'Beverages'
];
