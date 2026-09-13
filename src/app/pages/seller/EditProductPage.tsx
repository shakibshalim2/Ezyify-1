import { SEO } from '../../components/SEO';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Upload, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { SellerLayout } from '../../components/SellerLayout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { mockProducts } from '../../data/enhanced-mock-data';

export default function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  
  // Find the product
  const product = mockProducts.find(p => p.id === id);

  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: `Premium quality ${product?.name || 'product'} with excellent features and durability.`,
    category: product?.category || '',
    price: product?.price.toString() || '',
    originalPrice: product?.originalPrice?.toString() || '',
    stock: '45',
    sku: `SKU-${id}`,
    brand: product?.seller || '',
    weight: '1.5',
    shipping: true,
    inStock: product?.inStock ?? true,
  });

  const handleSave = () => {
    if (!formData.name.trim() || !formData.price) {
      toast.error('Product name and price are required');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Product updated successfully');
      navigate('/seller/products');
    }, 1500);
  };

  if (!product) {
    return (
      <SellerLayout>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Product not found</p>
            <Link to="/seller/products">
              <Button>Back to Products</Button>
            </Link>
          </div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 md:pb-8">
      <SEO title="Edit Product — Ezyify Seller" description="Update your product listing on Ezyify." />
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="mb-1 sm:mb-2 font-semibold">Edit Product</h1>
            <p className="text-sm text-muted-foreground">Update product details and settings</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Premium Wireless Headphones"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your product, features, benefits..."
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Fashion">Fashion</SelectItem>
                        <SelectItem value="Home & Living">Home & Living</SelectItem>
                        <SelectItem value="Beauty">Beauty & Personal Care</SelectItem>
                        <SelectItem value="Sports">Sports & Outdoors</SelectItem>
                        <SelectItem value="Books">Books & Media</SelectItem>
                        <SelectItem value="Toys">Toys & Games</SelectItem>
                        <SelectItem value="Health">Health & Wellness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      placeholder="e.g. Nike, Apple, Generic"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="originalPrice">Original Price ($)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      placeholder="0.00"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Show discount badge if different
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stock">Stock Quantity *</Label>
                    <Input
                      id="stock"
                      type="number"
                      placeholder="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                    <Input
                      id="sku"
                      placeholder="e.g. WH-2024-001"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Existing Image */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div className="relative group">
                    <img
                      loading="lazy"
                      src={product.image}
                      alt={product.name}
                      className="w-full aspect-square rounded-xl object-cover"
                    />
                    <button className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Upload More */}
                <div className="border-2 border-dashed rounded-2xl p-8 text-center">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Add more images
                  </p>
                  <Button variant="outline" size="sm">
                    Choose Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Product Status */}
            <Card>
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">In Stock</p>
                    <p className="text-xs text-muted-foreground">
                      Show as available for purchase
                    </p>
                  </div>
                  <Switch
                    checked={formData.inStock}
                    onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Free Shipping</p>
                    <p className="text-xs text-muted-foreground">
                      Offer free shipping
                    </p>
                  </div>
                  <Switch
                    checked={formData.shipping}
                    onCheckedChange={(checked) => setFormData({ ...formData, shipping: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Details */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Product Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">📊 Product Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Views:</span>
                  <span className="font-medium">{Math.floor(Math.random() * 1000) + 500}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Sales:</span>
                  <span className="font-medium">{product.reviews}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating:</span>
                  <span className="font-medium flex items-center gap-1">{product.rating}<Star className="w-4 h-4 fill-amber-400 text-amber-400" /></span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}