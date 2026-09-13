import { SEO } from '../../components/SEO';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Truck, MapPin, Clock, Package, CheckCircle, AlertCircle, Settings, Plus, Download, Star } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { SellerLayout } from '../../components/SellerLayout';

interface ShippingProvider {
  id: string;
  name: string;
  logo: string;
  status: 'active' | 'inactive';
  shipments: number;
  avgDeliveryTime: string;
  rating: number;
  costPerKg: number;
}

interface Shipment {
  id: string;
  trackingNumber: string;
  orderNumber: string;
  customer: string;
  destination: string;
  provider: string;
  status: 'pending' | 'picked-up' | 'in-transit' | 'delivered' | 'delayed';
  estimatedDelivery: string;
  weight: number;
  cost: number;
}

const shippingProviders: ShippingProvider[] = [
  {
    id: 'sp1',
    name: 'Pathao Courier',
    logo: '📦',
    status: 'active',
    shipments: 245,
    avgDeliveryTime: '2-3 days',
    rating: 4.5,
    costPerKg: 60
  },
  {
    id: 'sp2',
    name: 'Sundarban Courier',
    logo: '🚚',
    status: 'active',
    shipments: 189,
    avgDeliveryTime: '3-4 days',
    rating: 4.3,
    costPerKg: 50
  },
  {
    id: 'sp3',
    name: 'SA Paribahan',
    logo: '🚛',
    status: 'active',
    shipments: 156,
    avgDeliveryTime: '4-5 days',
    rating: 4.2,
    costPerKg: 45
  },
  {
    id: 'sp4',
    name: 'DHL Express',
    logo: '✈️',
    status: 'inactive',
    shipments: 12,
    avgDeliveryTime: '1-2 days',
    rating: 4.8,
    costPerKg: 250
  },
];

const mockShipments: Shipment[] = [
  {
    id: 'ship1',
    trackingNumber: 'TRK-2024-001',
    orderNumber: 'ORD-2024-001',
    customer: 'Sarah Ahmed',
    destination: 'New York, USA',
    provider: 'FedEx',
    status: 'in-transit',
    estimatedDelivery: 'Jan 6, 2024',
    weight: 1.5,
    cost: 90
  },
  {
    id: 'ship2',
    trackingNumber: 'TRK-2024-002',
    orderNumber: 'ORD-2024-002',
    customer: 'Karim Hassan',
    destination: 'Los Angeles, USA',
    provider: 'UPS',
    status: 'picked-up',
    estimatedDelivery: 'Jan 7, 2024',
    weight: 2.0,
    cost: 100
  },
  {
    id: 'ship3',
    trackingNumber: 'TRK-2024-003',
    orderNumber: 'ORD-2024-003',
    customer: 'Fatima Khan',
    destination: 'Chicago, USA',
    provider: 'USPS',
    status: 'delivered',
    estimatedDelivery: 'Jan 3, 2024',
    weight: 0.8,
    cost: 36
  },
  {
    id: 'ship4',
    trackingNumber: 'TRK-2024-004',
    orderNumber: 'ORD-2024-004',
    customer: 'Rashid Ali',
    destination: 'Houston, USA',
    provider: 'FedEx',
    status: 'pending',
    estimatedDelivery: 'Jan 8, 2024',
    weight: 1.2,
    cost: 72
  },
];

export default function LogisticsPage() {

  const [selectedTab, setSelectedTab] = useState('shipments');

  const stats = {
    totalShipments: mockShipments.length,
    inTransit: mockShipments.filter(s => s.status === 'in-transit').length,
    delivered: mockShipments.filter(s => s.status === 'delivered').length,
    pending: mockShipments.filter(s => s.status === 'pending').length,
  };

  const getStatusBadge = (status: Shipment['status']) => {
    const statusConfig = {
      pending: { color: 'bg-accent text-foreground', icon: Clock },
      'picked-up': { color: 'bg-accent text-foreground', icon: Package },
      'in-transit': { color: 'bg-accent text-foreground', icon: Truck },
      delivered: { color: 'bg-primary text-primary-foreground', icon: CheckCircle },
      delayed: { color: 'bg-error text-error-foreground', icon: AlertCircle },
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
      </Badge>
    );
  };

  return (
    <SellerLayout>
      <div className="max-w-screen-xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 md:pb-8">
      <SEO title="Logistics — Ezyify Seller" description="Manage shipping, delivery, and logistics for your Ezyify store." />
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="mb-1 sm:mb-2 font-semibold text-foreground">Logistics & Shipping</h1>
            <p className="text-sm text-muted-foreground">Manage shipping providers and track deliveries</p>
          </div>
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Shipment
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-primary bg-accent p-2 rounded-xl" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Shipments</p>
                  <p className="text-2xl text-foreground">{stats.totalShipments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Truck className="w-8 h-8 text-primary bg-accent p-2 rounded-xl" />
                <div>
                  <p className="text-sm text-muted-foreground">In Transit</p>
                  <p className="text-2xl text-foreground">{stats.inTransit}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-primary bg-accent p-2 rounded-xl" />
                <div>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                  <p className="text-2xl text-foreground">{stats.delivered}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-primary bg-accent p-2 rounded-xl" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl text-foreground">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="shipments">Shipments</TabsTrigger>
            <TabsTrigger value="providers">Shipping Providers</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Shipments Tab */}
          <TabsContent value="shipments" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Active Shipments</CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tracking Number</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Est. Delivery</TableHead>
                        <TableHead>Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockShipments.map((shipment) => (
                        <TableRow key={shipment.id}>
                          <TableCell className="font-medium">
                            {shipment.trackingNumber}
                          </TableCell>
                          <TableCell>{shipment.orderNumber}</TableCell>
                          <TableCell>{shipment.customer}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              {shipment.destination}
                            </div>
                          </TableCell>
                          <TableCell>{shipment.provider}</TableCell>
                          <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                          <TableCell>{shipment.estimatedDelivery}</TableCell>
                          <TableCell>${shipment.cost}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Providers Tab */}
          <TabsContent value="providers" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shippingProviders.map((provider) => (
                <Card key={provider.id} className={provider.status === 'inactive' ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{provider.logo}</div>
                        <div>
                          <CardTitle className="text-lg">{provider.name}</CardTitle>
                          <Badge className={
                            provider.status === 'active' 
                              ? 'bg-primary text-primary-foreground mt-1' 
                              : 'bg-muted text-muted-foreground mt-1'
                          }>
                            {provider.status}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Shipments</p>
                        <p className="text-xl font-medium text-foreground">{provider.shipments}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Avg. Delivery</p>
                        <p className="text-xl font-medium text-foreground">{provider.avgDeliveryTime}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Rating</p>
                        <p className="text-xl font-medium text-foreground flex items-center gap-1"><Star className="w-5 h-5 fill-amber-400 text-amber-400" />{provider.rating}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Cost/kg</p>
                        <p className="text-xl font-medium text-foreground">${provider.costPerKg}</p>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      variant={provider.status === 'active' ? 'outline' : 'default'}
                    >
                      {provider.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button className="mt-6">
              <Plus className="w-4 h-4 mr-2" />
              Add New Provider
            </Button>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Default Provider */}
                <div className="space-y-2">
                  <Label>Default Shipping Provider</Label>
                  <Select defaultValue="sp1">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {shippingProviders.filter(p => p.status === 'active').map(provider => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.logo} {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Processing Time */}
                <div className="space-y-2">
                  <Label>Order Processing Time</Label>
                  <Select defaultValue="1-2">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="same-day">Same Day</SelectItem>
                      <SelectItem value="1-2">1-2 Days</SelectItem>
                      <SelectItem value="2-3">2-3 Days</SelectItem>
                      <SelectItem value="3-5">3-5 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Free Shipping Threshold */}
                <div className="space-y-2">
                  <Label>Free Shipping Threshold ($)</Label>
                  <Input type="number" placeholder="100" defaultValue="100" />
                  <p className="text-sm text-muted-foreground">
                    Orders above this amount get free shipping
                  </p>
                </div>

                {/* Warehouse Address */}
                <div className="space-y-2">
                  <Label>Warehouse/Pickup Address</Label>
                  <Input placeholder="Street Address" defaultValue="123 Main Street" />
                  <Input placeholder="City" defaultValue="San Francisco" className="mt-2" />
                  <Input placeholder="Postal Code" defaultValue="94102" className="mt-2" />
                </div>

                <Button onClick={() => toast.success('Shipping settings saved')}>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Tips */}
        <Card className="mt-8 bg-accent">
          <CardHeader>
            <CardTitle>📦 Logistics Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2 text-foreground">
              <li>• Update tracking information promptly to reduce customer inquiries</li>
              <li>• Compare shipping providers to find the best rates and delivery times</li>
              <li>• Offer free shipping on orders above a certain threshold to increase cart value</li>
              <li>• Package items securely to prevent damage during transit</li>
              <li>• Keep customers informed about shipping delays or issues</li>
              <li>• Maintain accurate inventory across all warehouses</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </SellerLayout>
  );
}