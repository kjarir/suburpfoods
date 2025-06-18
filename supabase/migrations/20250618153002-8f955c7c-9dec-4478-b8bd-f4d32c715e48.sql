
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE public.user_role AS ENUM ('customer', 'admin');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image TEXT,
  category TEXT NOT NULL,
  ingredients TEXT[],
  nutrition_facts JSONB,
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  status order_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  payment_id TEXT,
  razorpay_order_id TEXT,
  shipping_address JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create cart table for persistent shopping cart
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Products policies
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all products" ON public.products
  FOR ALL USING (public.is_admin(auth.uid()));

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all orders" ON public.orders
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- Order items policies
CREATE POLICY "Users can view their own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for their orders" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all order items" ON public.order_items
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Cart items policies
CREATE POLICY "Users can manage their own cart" ON public.cart_items
  FOR ALL USING (auth.uid() = user_id);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample products data
INSERT INTO public.products (name, description, price, image, category, ingredients, nutrition_facts, stock_quantity) VALUES
('Artisan Sourdough Bread', 'Handcrafted sourdough bread made with organic flour and aged starter. Perfect for breakfast or as a side for any meal.', 8.99, 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500&h=500&fit=crop', 'Bakery', '{"Organic flour", "Water", "Sourdough starter", "Sea salt"}', '{"calories": 245, "protein": "8g", "carbs": "45g", "fat": "2g"}', 50),
('Organic Honey', 'Pure, raw organic honey sourced from local beekeepers. Rich in antioxidants and perfect for sweetening tea or toast.', 12.99, 'https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?w=500&h=500&fit=crop', 'Pantry', '{"100% Raw Honey"}', '{"calories": 64, "protein": "0g", "carbs": "17g", "fat": "0g"}', 30),
('Free-Range Eggs', 'Farm-fresh eggs from free-range chickens. Rich in protein and perfect for any meal of the day.', 6.49, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&h=500&fit=crop', 'Dairy & Eggs', '{"Free-range chicken eggs"}', '{"calories": 70, "protein": "6g", "carbs": "0g", "fat": "5g"}', 100),
('Grass-Fed Beef', 'Premium grass-fed beef from local farms. Tender, flavorful, and sustainably raised.', 24.99, 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=500&h=500&fit=crop', 'Meat', '{"100% Grass-fed beef"}', '{"calories": 250, "protein": "26g", "carbs": "0g", "fat": "15g"}', 20),
('Organic Vegetables Box', 'A curated selection of seasonal organic vegetables. Fresh, nutritious, and perfect for healthy meals.', 18.99, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&h=500&fit=crop', 'Produce', '{"Mixed organic vegetables (seasonal)"}', '{"calories": 35, "protein": "2g", "carbs": "7g", "fat": "0g"}', 25),
('Artisan Cheese Selection', 'A selection of artisan cheeses from local dairies. Perfect for cheese boards or cooking.', 16.99, 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&h=500&fit=crop', 'Dairy & Eggs', '{"Various artisan cheeses", "Milk", "Cultures", "Salt"}', '{"calories": 113, "protein": "7g", "carbs": "1g", "fat": "9g"}', 15),
('Cold-Pressed Juice', 'Fresh cold-pressed juice made from organic fruits and vegetables. Packed with vitamins and nutrients.', 7.99, 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=500&h=500&fit=crop', 'Beverages', '{"Organic fruits", "Organic vegetables"}', '{"calories": 120, "protein": "2g", "carbs": "28g", "fat": "0g"}', 40),
('Craft Coffee Beans', 'Single-origin coffee beans roasted to perfection. Rich, aromatic, and ethically sourced.', 14.99, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=500&fit=crop', 'Beverages', '{"100% Arabica coffee beans"}', '{"calories": 2, "protein": "0g", "carbs": "0g", "fat": "0g"}', 60);

-- Create an admin user (you'll need to sign up first, then update this)
-- INSERT INTO public.profiles (id, email, first_name, last_name, role) 
-- VALUES ('your-user-id-here', 'admin@subburpfood.com', 'Admin', 'User', 'admin')
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';
