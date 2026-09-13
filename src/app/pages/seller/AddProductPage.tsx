import { SEO } from '../../components/SEO';
import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { Save, X, Upload, Plus, Trash2 } from 'lucide-react';
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

export default function AddProductPage() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    originalPrice: '',
    stock: '',
    sku: '',
    brand: '',
    weight: '',
    shipping: true,
    inStock: true,
  });

  const handleSave = () => {
    if (!formData.name.trim() || !formData.description.trim() || !formData.category || !formData.price) {
      toast.error('Please fill in all required fields (name, description, category, price)');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      navigate('/seller/products');
    }, 1500);
  };

  return (
    <SellerLayout>
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 md:pb-8">
      <SEO title="Add Product — Ezyify Seller" description="Add a new product to your Ezyify store." />
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-1 sm:mb-2 font-semibold">Add New Product</h1>
          <p className="text-sm text-muted-foreground">List a new product for sale on your store</p>
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
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="fashion">Fashion</SelectItem>
                        <SelectItem value="home">Home & Living</SelectItem>
                        <SelectItem value="beauty">Beauty & Personal Care</SelectItem>
                        <SelectItem value="sports">Sports & Outdoors</SelectItem>
                        <SelectItem value="books">Books & Media</SelectItem>
                        <SelectItem value="toys">Toys & Games</SelectItem>
                        <SelectItem value="health">Health & Wellness</SelectItem>
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
                <div className="border-2 border-dashed rounded-2xl p-8 text-center">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag & drop images here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Recommended: 1000x1000px, PNG or JPG, max 5MB
                  </p>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
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

            {/* Quick Tips */}
            <Card className="bg-primary/10 border-primary/30">
              <CardHeader>
                <CardTitle className="text-sm">💡 Quick Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-xs text-muted-foreground space-y-2">
                  <li>• Use clear, descriptive product names</li>
                  <li>• Add high-quality product images</li>
                  <li>• Write detailed descriptions</li>
                  <li>• Set competitive pricing</li>
                  <li>• Keep stock levels updated</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}