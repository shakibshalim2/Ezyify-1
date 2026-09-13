import { SEO } from '../../components/SEO';
import { Link } from 'react-router';
import { Download, Newspaper, Mail, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function PressPage() {
  const pressReleases = [
    {
      id: 1,
      title: 'Ezyify Reaches 50 Million Users Milestone',
      date: 'January 10, 2026',
      excerpt: 'Ezyify announces a major growth milestone, cementing its position as the fastest-growing E-Commerce Social Media Ecosystem.',
      category: 'Company News'
    },
    {
      id: 2,
      title: 'Ezyify Launches Revolutionary AR Try-On Feature',
      date: 'December 15, 2025',
      excerpt: 'New augmented reality feature allows users to virtually try products before purchasing, transforming online shopping experience.',
      category: 'Product Launch'
    },
    {
      id: 3,
      title: 'Ezyify Expands to 25 New Markets',
      date: 'November 20, 2025',
      excerpt: 'Global expansion continues with platform now available in over 100 countries worldwide.',
      category: 'Expansion'
    },
    {
      id: 4,
      title: 'Ezyify Creator Fund Reaches $100M',
      date: 'October 5, 2025',
      excerpt: 'Platform announces major investment in creator economy, supporting thousands of content creators globally.',
      category: 'Creators'
    }
  ];

  const mediaAssets = [
    {
      title: 'Brand Guidelines',
      description: 'Official Ezyify brand assets and usage guidelines',
      type: 'PDF',
      size: '2.4 MB'
    },
    {
      title: 'Company Logos',
      description: 'High-resolution logos in various formats',
      type: 'ZIP',
      size: '8.1 MB'
    },
    {
      title: 'Product Screenshots',
      description: 'Official product screenshots and imagery',
      type: 'ZIP',
      size: '15.2 MB'
    },
    {
      title: 'Executive Photos',
      description: 'Leadership team professional photos',
      type: 'ZIP',
      size: '4.7 MB'
    }
  ];

  return (
          <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <SEO title="Press & Media" description="Ezyify press releases, media kit, and brand assets. E-Commerce Social Media Ecosystem news." />
      <div className="py-20 text-white" style={{ background: "var(--brand-gradient)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">Press & Media</h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-8">
              Latest news, press releases, and media resources from Ezyify
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                <Mail className="w-5 h-5 mr-2" />
                Contact Press Team
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Download className="w-5 h-5 mr-2" />
                Download Press Kit
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Quick Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Press Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <a href="mailto:press@ezyify.com" className="text-primary hover:underline font-medium">
                press@ezyify.com
              </a>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Phone</p>
              <p className="font-medium">+1 (555) 123-4567</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Office Hours</p>
              <p className="font-medium">Mon - Fri, 9 AM - 6 PM EST</p>
            </div>
          </CardContent>
        </Card>

        {/* Latest Press Releases */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8">Latest Press Releases</h2>
          <div className="space-y-6">
            {pressReleases.map((release) => (
              <Card key={release.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                          {release.category}
                        </span>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {release.date}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{release.title}</h3>
                      <p className="text-muted-foreground mb-4">{release.excerpt}</p>
                    </div>
                    <Button variant="outline">
                      Read More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Media Assets */}
        <div>
          <h2 className="text-3xl font-bold mb-8">Media Assets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mediaAssets.map((asset, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-2">{asset.title}</h3>
                      <p className="text-muted-foreground text-sm mb-3">{asset.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{asset.type}</span>
                        <span>•</span>
                        <span>{asset.size}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 rounded-2xl p-8 text-white text-center" style={{ background: "var(--brand-gradient)" }}>
          <Newspaper className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Subscribe to Press Updates</h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Get the latest Ezyify news and announcements delivered directly to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-white"
            />
            <Button className="bg-white text-primary hover:bg-white/90">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}