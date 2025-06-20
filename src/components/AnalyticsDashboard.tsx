
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  activeUsers: number;
  monthlyData: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  categoryData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    activeUsers: 0,
    monthlyData: [],
    categoryData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
    
    // Set up real-time subscriptions
    const ordersSubscription = supabase
      .channel('analytics-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchAnalyticsData();
      })
      .subscribe();

    const productsSubscription = supabase
      .channel('analytics-products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchAnalyticsData();
      })
      .subscribe();

    return () => {
      ordersSubscription.unsubscribe();
      productsSubscription.unsubscribe();
    };
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch completed orders with proper type handling
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, created_at, status')
        .eq('payment_status', 'completed');

      if (ordersError) throw ordersError;

      // Fetch all users count
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Fetch products with categories
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('category, price, is_active')
        .eq('is_active', true);

      if (productsError) throw productsError;

      // Calculate real metrics from database
      const totalRevenue = orders?.reduce((sum, order) => {
        const amount = typeof order.total_amount === 'string' 
          ? parseFloat(order.total_amount) 
          : Number(order.total_amount);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0) || 0;

      const totalOrders = orders?.length || 0;
      const activeUsers = usersCount || 0;

      // Generate monthly data from real orders
      const monthlyData = generateMonthlyData(orders || []);
      
      // Generate category distribution from real products
      const categoryData = generateCategoryData(products || []);

      setAnalytics({
        totalRevenue,
        totalOrders,
        activeUsers,
        monthlyData,
        categoryData
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyData = (orders: any[]) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const monthlyStats: { [key: string]: { sales: number; revenue: number } } = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = monthNames[date.getMonth()];
      monthlyStats[monthKey] = { sales: 0, revenue: 0 };
    }

    // Populate with actual order data
    orders.forEach(order => {
      const orderDate = new Date(order.created_at);
      const monthKey = monthNames[orderDate.getMonth()];
      if (monthlyStats[monthKey]) {
        const amount = typeof order.total_amount === 'string' 
          ? parseFloat(order.total_amount) 
          : Number(order.total_amount);
        monthlyStats[monthKey].sales += 1;
        monthlyStats[monthKey].revenue += isNaN(amount) ? 0 : amount;
      }
    });

    return Object.entries(monthlyStats).map(([name, data]) => ({
      name,
      sales: data.sales,
      revenue: Math.round(data.revenue)
    }));
  };

  const generateCategoryData = (products: any[]) => {
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];
    const categoryStats: { [key: string]: number } = {};

    products.forEach(product => {
      const category = product.category || 'Other';
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });

    return Object.entries(categoryStats).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From completed orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Completed orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Total registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.totalOrders > 0 ? (analytics.totalRevenue / analytics.totalOrders).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">Average per order</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#8884d8" name="Orders" />
                  <Bar dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No sales data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {analytics.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No category data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} name="Revenue ($)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No revenue data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
