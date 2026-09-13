import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Mail, Phone, MapPin, User, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { SEO } from '../../components/SEO';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export default function AccountManagementPage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    country: 'United States',
    city: 'New York',
    address: '123 Main St',
  });

  const handleSave = () => {
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Account Management — Ezyify" />

      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display text-xl font-semibold text-foreground">Account Management</h1>
              <p className="text-xs text-foreground-secondary">Update your account details</p>
            </div>
          </div>
          {isEditing && (
            <Button onClick={handleSave} size="sm">
              Save Changes
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Picture */}
        <Card className="border-border mb-6">
          <CardHeader>
            <CardTitle className="text-base">Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <Avatar className="w-16 h-16">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200" />
              <AvatarFallback className="bg-primary/20 text-primary font-bold">JD</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">
              <Camera className="w-4 h-4 mr-2" />
              Change Photo
            </Button>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Personal Information</CardTitle>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                >
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name Section */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Name
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="first-name" className="text-xs">First Name</Label>
                  <Input
                    id="first-name"
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={!isEditing}
                    className="mt-1 bg-muted/50"
                  />
                </div>
                <div>
                  <Label htmlFor="last-name" className="text-xs">Last Name</Label>
                  <Input
                    id="last-name"
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={!isEditing}
                    className="mt-1 bg-muted/50"
                  />
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Contact Information
              </p>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="email" className="text-xs">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className="mt-1 bg-muted/50"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-xs">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    className="mt-1 bg-muted/50"
                  />
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <Label htmlFor="country" className="text-xs">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                    disabled={!isEditing}
                    className="mt-1 bg-muted/50"
                  />
                </div>
                <div>
                  <Label htmlFor="city" className="text-xs">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    disabled={!isEditing}
                    className="mt-1 bg-muted/50"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address" className="text-xs">Street Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  disabled={!isEditing}
                  className="mt-1 bg-muted/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
