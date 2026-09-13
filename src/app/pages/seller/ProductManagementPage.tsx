import { SEO } from '../../components/SEO';
import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Plus, Search, Filter, Edit, Trash2, MoreVertical, Eye, Package, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { mockProducts } from '../../data/enhanced-mock-data';
import { SellerLayout } from '../../components/SellerLayout';

export default function ProductManagementPage() {

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');

  // Mock seller products (first 20 products)
  const sellerProducts = mockProducts.slice(0, 20).map((product, idx) => ({
    ...product,
    stock: Math.floor(Math.random() * 200) + 10,
    sales: Math.floor(Math.random() * 500) + 50,
    revenue: Math.floor(product.price * (Math.random() * 500 + 50)),
    status: idx % 15 === 0 ? 'out-of-stock' : (idx % 10 === 0 ? 'low-stock' : 'active'),
    views: Math.floor(Math.random() * 5000) + 500,
  }));

  const stats = {
    total: sellerProducts.length,
    active: sellerProducts.filter(p => p.status === 'active').length,
    lowStock: sellerProducts.filter(p => p.status === 'low-stock').length,
    outOfStock: sellerProducts.filter(p => p.status === 'out-of-stock').length,
  };

  const filteredProducts = sellerProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = selectedTab === 'all' || product.status === selectedTab;
    return matchesSearch && matchesTab;
  });

  return (
    <SellerLayout>
      <div className="max-w-screen-xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 md:pb-8">
      <SEO title="Product Management — Ezyify Seller" description="Manage your product catalog in your Ezyify store." />
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="font-semibold text-foreground text-xl sm:text-2xl">Product Management</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your inventory and listings</p>
          </div>
          <div className="flex gap-2">
            <Link to="/seller/add-product" className="flex-1 sm:flex-none">
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </Link>
            <Button variant="outline" className="flex-1 sm:flex-none">
              <Filter className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Products', value: stats.total, icon: Package, accent: 'bg-primary/10 text-primary' },
            { label: 'Active', value: stats.active, icon: TrendingUp, accent: 'bg-success/10 text-success' },
            { label: 'Low Stock', value: stats.lowStock, icon: AlertCircle, accent: 'bg-warning/10 text-warning' },
            { label: 'Out of Stock', value: stats.outOfStock, icon: AlertCircle, accent: 'bg-error/10 text-error' },
          ].map(({ label, value, icon: Icon, accent }) => (
            <Card key={label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-xl font-bold text-foreground">{value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and Tabs */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-3 sm:px-6">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="w-full grid grid-cols-4 h-auto">
                <TabsTrigger value="all" className="text-xs sm:text-sm px-2 sm:px-3 py-2.5 min-h-[44px]">
                  <span className="hidden sm:inline">All</span>
                  <span className="sm:hidden">All</span>
                  <span className="ml-1">({stats.total})</span>
                </TabsTrigger>
                <TabsTrigger value="active" className="text-xs sm:text-sm px-2 sm:px-3 py-2.5 min-h-[44px]">
                  <span className="hidden sm:inline">Active</span>
                  <span className="sm:hidden">✓</span>
                  <span className="ml-1">({stats.active})</span>
                </TabsTrigger>
                <TabsTrigger value="low-stock" className="text-xs sm:text-sm px-2 sm:px-3 py-2.5 min-h-[44px]">
                  <span className="hidden sm:inline">Low</span>
                  <span className="sm:hidden">⚠</span>
                  <span className="ml-1">({stats.lowStock})</span>
                </TabsTrigger>
                <TabsTrigger value="out-of-stock" className="text-xs sm:text-sm px-2 sm:px-3 py-2.5 min-h-[44px]">
                  <span className="hidden sm:inline">Out</span>
                  <span className="sm:hidden">✕</span>
                  <span className="ml-1">({stats.outOfStock})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="mt-4 sm:mt-6">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Sales</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                      loading="lazy"
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 rounded-xl object-cover bg-muted"
                              />
                              <div>
                                <Link
                                  to={`/product/${product.id}`}
                                  className="font-medium hover:text-primary line-clamp-1"
                                >
                                  {product.name}
                                </Link>
                                <p className="text-xs text-muted-foreground">ID: {product.id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{product.category}</Badge>
                          </TableCell>
                          <TableCell>${product.price.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className={
                              product.stock < 20 ? 'text-error font-medium' :
                              product.stock < 50 ? 'text-warning font-medium' :
                              'text-foreground'
                            }>
                              {product.stock}
                            </span>
                          </TableCell>
                          <TableCell>{product.sales}</TableCell>
                          <TableCell className="font-medium">
                            ${product.revenue.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {product.status === 'active' && (
                              <Badge className="bg-success/10 text-success dark:bg-success/20">Active</Badge>
                            )}
                            {product.status === 'low-stock' && (
                              <Badge className="bg-warning/10 text-warning dark:bg-warning/20">Low Stock</Badge>
                            )}
                            {product.status === 'out-of-stock' && (
                              <Badge className="bg-error/10 text-error dark:bg-error/20">Out of Stock</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link to={`/product/${product.id}`}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/seller/edit-product/${product.id}`}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-error">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          <img
                      loading="lazy"
                            src={product.image}
                            alt={product.name}
                            className="w-20 h-20 rounded-xl object-cover bg-muted flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1 min-w-0">
                                <Link
                                  to={`/product/${product.id}`}
                                  className="font-medium text-sm hover:text-primary line-clamp-1 block"
                                >
                                  {product.name}
                                </Link>
                                <p className="text-xs text-muted-foreground">ID: {product.id}</p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link to={`/product/${product.id}`}>
                                      <Eye className="w-4 h-4 mr-2" />
                                      View
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link to={`/seller/edit-product/${product.id}`}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-error">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">{product.category}</Badge>
                              {product.status === 'active' && (
                                <Badge className="bg-success/10 text-success dark:bg-success/20 text-xs">Active</Badge>
                              )}
                              {product.status === 'low-stock' && (
                                <Badge className="bg-warning/10 text-warning dark:bg-warning/20 text-xs">Low</Badge>
                              )}
                              {product.status === 'out-of-stock' && (
                                <Badge className="bg-error/10 text-error dark:bg-error/20 text-xs">Out</Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <p className="text-muted-foreground">Price</p>
                                <p className="font-semibold">${product.price}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Stock</p>
                                <p className={`font-semibold ${
                                  product.stock < 20 ? 'text-error' :
                                  product.stock < 50 ? 'text-warning' :
                                  ''
                                }`}>{product.stock}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Sales</p>
                                <p className="font-semibold">{product.sales}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No products found</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="mt-6 sm:mt-8 bg-primary/5 border-primary/20 dark:bg-primary/10">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-foreground text-base sm:text-lg">💡 Product Management Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-xs sm:text-sm space-y-1.5 sm:space-y-2 text-foreground">
              <li>• Use high-quality images (minimum 800x800px) for better conversion</li>
              <li>• Write detailed product descriptions with key features and benefits</li>
              <li>• Keep stock levels updated to avoid overselling</li>
              <li className="hidden sm:list-item">• Set competitive prices based on market research</li>
              <li className="hidden sm:list-item">• Use relevant tags and categories for better discoverability</li>
              <li className="hidden sm:list-item">• Monitor low stock alerts and restock popular items promptly</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </SellerLayout>
  );
}