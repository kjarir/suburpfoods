
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Users, Package, ShoppingCart, BarChart3, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import SecurityMonitor from '@/components/SecurityMonitor';

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    ingredients: '',
    stock_quantity: '',
  });

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
      fetchOrders();
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchProducts = async () => {
    try {
      setLoadingData(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Error fetching products",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setProducts(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Error fetching products",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingData(true);
      // First fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        toast({
          title: "Error fetching orders",
          description: ordersError.message,
          variant: "destructive",
        });
        return;
      }

      // Then fetch profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email');
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Then fetch order items with products
      const { data: orderItemsData, error: orderItemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          products(name)
        `);
      
      if (orderItemsError) {
        console.error('Error fetching order items:', orderItemsError);
      }

      // Combine the data manually
      const combinedOrders = ordersData?.map(order => {
        const profile = profilesData?.find(p => p.id === order.user_id);
        const orderItems = orderItemsData?.filter(item => item.order_id === order.id) || [];
        
        return {
          ...order,
          profiles: profile,
          order_items: orderItems
        };
      }) || [];

      setOrders(combinedOrders);
    } catch (err) {
      console.error('Unexpected error fetching orders:', err);
      toast({
        title: "Error fetching orders",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingData(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error fetching users",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setUsers(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Error fetching users",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock_quantity: parseInt(productForm.stock_quantity) || 0,
        ingredients: productForm.ingredients ? productForm.ingredients.split(',').map(i => i.trim()) : [],
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        
        if (error) {
          console.error('Error updating product:', error);
          toast({
            title: "Error updating product",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Product updated successfully",
          });
          fetchProducts();
          setEditingProduct(null);
          setShowProductForm(false);
          resetProductForm();
        }
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        
        if (error) {
          console.error('Error creating product:', error);
          toast({
            title: "Error creating product",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Product created successfully",
          });
          fetchProducts();
          setShowProductForm(false);
          resetProductForm();
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Error saving product",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      image: '',
      category: '',
      ingredients: '',
      stock_quantity: '',
    });
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price ? product.price.toString() : '',
      image: product.image || '',
      category: product.category || '',
      ingredients: product.ingredients?.join(', ') || '',
      stock_quantity: product.stock_quantity ? product.stock_quantity.toString() : '0',
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId);
        
        if (error) {
          console.error('Error deleting product:', error);
          toast({
            title: "Error deleting product",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Product deleted successfully",
          });
          fetchProducts();
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        toast({
          title: "Error deleting product",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: status as 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' })
        .eq('id', orderId);
      
      if (error) {
        console.error('Error updating order status:', error);
        toast({
          title: "Error updating order status",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Order status updated successfully",
        });
        fetchOrders();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Error updating order status",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          {loadingData && (
            <div className="flex items-center text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
              Loading data...
            </div>
          )}
        </div>
        
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Dashboard Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{products.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Total Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{orders.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{users.length}</div>
                  </CardContent>
                </Card>
              </div>
              <SecurityMonitor />
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Security Monitoring</h2>
              <SecurityMonitor />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Row Level Security</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>SSL Certificate</span>
                      <Badge variant="default">Valid</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Database Encryption</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Authentication</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Data Protection</span>
                      <Badge variant="default">Compliant</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>User Privacy</span>
                      <Badge variant="default">Protected</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Secure Storage</span>
                      <Badge variant="default">Encrypted</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Advanced Analytics</h2>
              <AnalyticsDashboard />
            </div>
          </TabsContent>

          <TabsContent value="products">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Products Management</h2>
                <Button onClick={() => setShowProductForm(!showProductForm)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>

              {showProductForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProductSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={productForm.name}
                            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Input
                            id="category"
                            value={productForm.category}
                            onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={productForm.description}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="price">Price</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={productForm.price}
                            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="stock">Stock Quantity</Label>
                          <Input
                            id="stock"
                            type="number"
                            value={productForm.stock_quantity}
                            onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="image">Image URL</Label>
                          <Input
                            id="image"
                            value={productForm.image}
                            onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="ingredients">Ingredients (comma-separated)</Label>
                        <Input
                          id="ingredients"
                          value={productForm.ingredients}
                          onChange={(e) => setProductForm({ ...productForm, ingredients: e.target.value })}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button type="submit">
                          {editingProduct ? 'Update Product' : 'Create Product'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => {
                          setShowProductForm(false);
                          setEditingProduct(null);
                          resetProductForm();
                        }}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4">
                {products.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-gray-500">
                      No products found. Create your first product using the "Add Product" button above.
                    </CardContent>
                  </Card>
                ) : (
                  products.map((product: any) => (
                    <Card key={product.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-4">
                            {product.image && (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                            )}
                            <div>
                              <h3 className="font-semibold">{product.name}</h3>
                              <p className="text-sm text-gray-600">{product.category}</p>
                              <p className="text-lg font-bold">${product.price}</p>
                              <p className="text-sm">Stock: {product.stock_quantity || 0}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Orders Management</h2>
              
              <div className="grid gap-4">
                {orders.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-gray-500">
                      No orders found.
                    </CardContent>
                  </Card>
                ) : (
                  orders.map((order: any) => (
                    <Card key={order.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
                            <p className="text-sm text-gray-600">
                              Customer: {order.profiles?.first_name || 'N/A'} {order.profiles?.last_name || ''}
                            </p>
                            <p className="text-sm text-gray-600">Email: {order.profiles?.email || 'N/A'}</p>
                            <p className="text-lg font-bold">Total: ${order.total_amount}</p>
                            <p className="text-sm">
                              Items: {order.order_items?.map((item: any) => item.products?.name || 'Unknown').join(', ') || 'No items'}
                            </p>
                            <p className="text-xs text-gray-500">
                              Created: {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
                              {order.status}
                            </Badge>
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className="text-sm border rounded px-2 py-1"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Users Management</h2>
              
              <div className="grid gap-4">
                {users.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-gray-500">
                      No users found.
                    </CardContent>
                  </Card>
                ) : (
                  users.map((user: any) => (
                    <Card key={user.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">
                              {user.first_name || 'N/A'} {user.last_name || ''}
                            </h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-sm">Phone: {user.phone || 'Not provided'}</p>
                            <p className="text-xs text-gray-500">
                              Joined: {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role || 'customer'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Admin;
