import { SEO } from '../../components/SEO';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Link } from 'react-router';
import { 
  Store, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Camera,
  Save,
  AlertCircle,
  CheckCircle,
  Bell,
  Lock,
  CreditCard,
  Package,
  Upload,
  Clock,
  Facebook,
  Instagram,
  Twitter
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Separator } from '../../components/ui/separator';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { SellerLayout } from '../../components/SellerLayout';

export default function StoreSettingsPage() {

  const [selectedTab, setSelectedTab] = useState('general');

  return (
    <SellerLayout>
      <div className="max-w-screen-xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 md:pb-8">
      <SEO title="Store Settings — Ezyify Seller" description="Manage your Ezyify store settings, branding, and policies." />
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-1 sm:mb-2 text-xl sm:text-2xl text-foreground">Store Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your store information and preferences</p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-4 sm:mb-6 grid grid-cols-3 md:grid-cols-5 w-full h-auto gap-1">
            <TabsTrigger value="general" className="text-xs sm:text-sm">General</TabsTrigger>
            <TabsTrigger value="branding" className="text-xs sm:text-sm">Branding</TabsTrigger>
            <TabsTrigger value="contact" className="text-xs sm:text-sm">Contact</TabsTrigger>
            <TabsTrigger value="business" className="text-xs sm:text-sm md:col-span-1 col-span-3">Business</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm md:col-span-1 col-span-3">Notify</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>Basic information about your store</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Store Name */}
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    placeholder="My Awesome Store"
                    defaultValue="TechHub Store"
                  />
                </div>

                {/* Store Username */}
                <div className="space-y-2">
                  <Label htmlFor="storeUsername">Store Username</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-muted text-muted-foreground text-sm">
                      ezyify.com/seller/
                    </span>
                    <Input
                      id="storeUsername"
                      placeholder="my-store"
                      defaultValue="techhub-official"
                      className="rounded-l-none"
                    />
                  </div>
                </div>

                {/* Store Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Store Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell customers about your store..."
                    rows={4}
                    defaultValue="Your one-stop shop for premium electronics and gadgets. We offer the latest tech products with competitive prices and excellent customer service."
                  />
                  <p className="text-sm text-muted-foreground">
                    Write a brief description that appears on your store page
                  </p>
                </div>

                {/* Store Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Primary Category</Label>
                  <Select defaultValue="electronics">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="fashion">Fashion</SelectItem>
                      <SelectItem value="home">Home & Living</SelectItem>
                      <SelectItem value="beauty">Beauty</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="books">Books</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Store Status */}
                <div className="flex items-center justify-between p-4 border rounded-xl">
                  <div className="space-y-0.5">
                    <Label>Store Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Make your store visible to customers
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Button onClick={() => toast.success('General settings saved!')}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding */}
          <TabsContent value="branding">
            <div className="space-y-6">
              {/* Store Logo */}
              <Card>
                <CardHeader>
                  <CardTitle>Store Logo</CardTitle>
                  <CardDescription>Upload your store logo (recommended: 200x200px)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <Avatar className="w-24 h-24 rounded-xl">
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200" />
                      <AvatarFallback className="rounded-xl">
                        <Store className="w-12 h-12" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload New Logo
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        JPG, PNG or SVG. Max size 2MB.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cover Image */}
              <Card>
                <CardHeader>
                  <CardTitle>Cover Image</CardTitle>
                  <CardDescription>Upload a cover image for your store page (recommended: 1200x400px)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="w-full h-48 rounded-xl flex items-center justify-center relative overflow-hidden" style={{ background: "var(--brand-gradient)" }}>
                      <img loading="lazy"
                        src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200"
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="secondary"
                        className="absolute"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Change Cover
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      JPG or PNG. Max size 5MB.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Brand Colors */}
              <Card>
                <CardHeader>
                  <CardTitle>Brand Colors</CardTitle>
                  <CardDescription>Customize your store's color scheme</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <div className="flex gap-2">
                        <Input type="color" defaultValue="#3b82f6" className="w-20 h-10" />
                        <Input defaultValue="#3b82f6" className="flex-1" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input type="color" defaultValue="#8b5cf6" className="w-20 h-10" />
                        <Input defaultValue="#8b5cf6" className="flex-1" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={() => toast.success('Branding settings saved!')}>
                <Save className="w-4 h-4 mr-2" />
                Save Branding
              </Button>
            </div>
          </TabsContent>

          {/* Contact & Social */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>How customers can reach you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@store.com"
                      defaultValue="contact@techhub.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (888) 234-5678"
                      defaultValue="+1 (888) 712-3456"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <Textarea
                      id="address"
                      placeholder="Enter your business address"
                      rows={3}
                      defaultValue="123 Main Street, San Francisco, CA 94102, USA"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://yourwebsite.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Business Hours */}
                <div className="space-y-2">
                  <Label>Business Hours</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="Opening Time" defaultValue="9:00 AM" className="pl-10" />
                    </div>
                    <div className="relative">
                      <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="Closing Time" defaultValue="6:00 PM" className="pl-10" />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Social Media Links</h3>
                  <div className="space-y-4">
                    <div className="relative">
                      <Facebook className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Facebook Page URL"
                        className="pl-10"
                      />
                    </div>
                    <div className="relative">
                      <Instagram className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Instagram Profile URL"
                        className="pl-10"
                      />
                    </div>
                    <div className="relative">
                      <Twitter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Twitter/X Profile URL"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={() => toast.success('Contact information saved!')}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Contact Info
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Info */}
          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Legal and tax information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Business Name */}
                <div className="space-y-2">
                  <Label htmlFor="businessName">Legal Business Name</Label>
                  <Input
                    id="businessName"
                    placeholder="ABC Technologies Ltd."
                    defaultValue="TechHub Technologies Ltd."
                  />
                </div>

                {/* Business Type */}
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select defaultValue="company">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="company">Private Limited Company</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="sole">Sole Proprietorship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tax ID */}
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID / TIN</Label>
                  <Input
                    id="taxId"
                    placeholder="Enter your Tax Identification Number"
                    defaultValue="123456789012"
                  />
                </div>

                {/* Trade License */}
                <div className="space-y-2">
                  <Label htmlFor="tradeLicense">Trade License Number</Label>
                  <Input
                    id="tradeLicense"
                    placeholder="Enter your trade license number"
                    defaultValue="TL-2024-12345"
                  />
                </div>

                {/* Bank Details */}
                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Bank Account Details</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        placeholder="e.g., Dutch Bangla Bank"
                        defaultValue="Dutch Bangla Bank"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountName">Account Holder Name</Label>
                      <Input
                        id="accountName"
                        placeholder="Account holder name"
                        defaultValue="TechHub Technologies Ltd."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        placeholder="Bank account number"
                        defaultValue="1234567890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="routingNumber">Routing Number</Label>
                      <Input
                        id="routingNumber"
                        placeholder="Bank routing number"
                        defaultValue="123456789"
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={() => toast.success('Business information saved!')}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Business Info
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-xl">
                    <div className="space-y-0.5">
                      <Label>New Orders</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when you receive a new order
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-xl">
                    <div className="space-y-0.5">
                      <Label>Order Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Notifications about order status changes
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-xl">
                    <div className="space-y-0.5">
                      <Label>Customer Messages</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when customers send you messages
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-xl">
                    <div className="space-y-0.5">
                      <Label>Low Stock Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Alert when products are running low on stock
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-xl">
                    <div className="space-y-0.5">
                      <Label>Product Reviews</Label>
                      <p className="text-sm text-muted-foreground">
                        Notifications about new product reviews
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-xl">
                    <div className="space-y-0.5">
                      <Label>Marketing Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Tips, promotions, and platform updates
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-xl">
                    <div className="space-y-0.5">
                      <Label>Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Weekly summary of your store performance
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Button onClick={() => toast.success('Notification preferences saved!')}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SellerLayout>
  );
}