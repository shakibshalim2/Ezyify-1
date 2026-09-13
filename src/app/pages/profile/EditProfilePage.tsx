import { SEO } from '../../components/SEO';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, Camera, Upload, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent } from '../../components/ui/card';

export default function EditProfilePage() {

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: 'Emma Wilson',
    username: 'fashionista_emma',
    bio: 'Fashion & Lifestyle Content Creator 👗✨ | Sharing daily outfit inspiration',
    location: 'New York, USA',
    website: 'emmastyle.com',
    email: 'emma@example.com',
    phone: '+1 234 567 8900'
  });

  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1632163506775-db3341414ffb?w=300');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=400&fit=crop');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    // Save logic here
    navigate(`/profile/${formData.username}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Edit Profile — Ezyify" description="Update your Ezyify profile information, photo, and bio." />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${formData.username}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold text-foreground">Edit Profile</h1>
              <p className="text-muted-foreground">Update your profile information</p>
            </div>
          </div>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>

        {/* Cover Image */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <Label className="block mb-2">Cover Photo</Label>
            <div className="relative h-48 rounded-2xl overflow-hidden" style={{ background: "var(--brand-gradient)" }}>
              <img
                      loading="lazy" 
                src={coverImage} 
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Button variant="secondary" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Change Cover
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Picture */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <Label className="block mb-2">Profile Picture</Label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                      loading="lazy" 
                  src={avatar} 
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover"
                />
                <button aria-label="Change profile photo" className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Recommended size: 400x400px</p>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your profile URL: ezyify.com/@{formData.username}
                </p>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.bio.length}/150 characters
                </p>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                />
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => navigate(`/profile/${formData.username}`)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}