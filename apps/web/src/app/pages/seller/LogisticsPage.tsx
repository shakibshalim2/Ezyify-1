import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Truck, Package, CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { Field } from '../../components/primitives/Field';
import { Skeleton } from '../../components/primitives/Skeleton';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO, SEOConfigs } from '../../components/SEO';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { cn } from '../../components/ui/utils';

export default function LogisticsPage() {
  const reduce = useReducedMotion();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const shipments = [
    { id: 1, tracking: 'TRK001', order: 'ORD001', destination: 'New York', status: 'in-transit', cost: 90 },
    { id: 2, tracking: 'TRK002', order: 'ORD002', destination: 'LA', status: 'delivered', cost: 100 },
    { id: 3, tracking: 'TRK003', order: 'ORD003', destination: 'Chicago', status: 'pending', cost: 72 },
  ];

  if (isLoading) {
    return (
      <SellerLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
        </div>
      </SellerLayout>
    );
  }

  const getStatusColor = (status: string) => {
    if (status === 'delivered') return 'bg-success-subtle text-success';
    if (status === 'in-transit') return 'bg-primary-subtle text-primary';
    return 'bg-warning-subtle text-warning';
  };

  return (
    <SellerLayout>
      <SEO {...SEOConfigs.logistics} />
      <motion.div
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Logistics</h1>
            <p className="text-sm text-foreground-secondary mt-1">Manage shipping and deliveries</p>
          </div>
          <Button variant="gradient" size="lg" leftIcon={<Plus className="size-5" />} className="shadow-brand">
            Add Shipment
          </Button>
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <Package className="size-5 text-primary" />
              <div>
                <p className="text-xs text-foreground-secondary">Total</p>
                <p className="font-display font-bold text-2xl text-foreground">12</p>
              </div>
            </div>
          </Card>
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <Truck className="size-5 text-info" />
              <div>
                <p className="text-xs text-foreground-secondary">In Transit</p>
                <p className="font-display font-bold text-2xl text-foreground">3</p>
              </div>
            </div>
          </Card>
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <CheckCircle className="size-5 text-success" />
              <div>
                <p className="text-xs text-foreground-secondary">Delivered</p>
                <p className="font-display font-bold text-2xl text-foreground">8</p>
              </div>
            </div>
          </Card>
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <Clock className="size-5 text-warning" />
              <div>
                <p className="text-xs text-foreground-secondary">Pending</p>
                <p className="font-display font-bold text-2xl text-foreground">1</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Tabs defaultValue="shipments">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="shipments">Shipments</TabsTrigger>
              <TabsTrigger value="settings">Carriers</TabsTrigger>
            </TabsList>

            <TabsContent value="shipments" className="mt-6">
              <div className="space-y-3">
                {shipments.map(ship => (
                  <Card key={ship.id} variant="default" padding="md" interactive>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{ship.tracking}</p>
                        <p className="text-xs text-foreground-secondary mt-1">{ship.order} → {ship.destination}</p>
                      </div>
                      <div className="text-right">
                        <span className={cn('text-xs font-semibold px-2 py-1 rounded-lg', getStatusColor(ship.status))}>
                          {ship.status.charAt(0).toUpperCase() + ship.status.slice(1)}
                        </span>
                        <p className="text-sm font-semibold text-foreground mt-2 tabular-nums">${ship.cost}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-6 space-y-6">
              <Card variant="default" padding="lg">
                <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Shipping Carriers</h2>
                <div className="space-y-3">
                  {['FedEx', 'UPS', 'USPS'].map(carrier => (
                    <div key={carrier} className="flex items-center justify-between p-3 bg-background-elevated rounded-lg">
                      <p className="font-medium text-foreground">{carrier}</p>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  ))}
                </div>
              </Card>

              <Card variant="default" padding="lg">
                <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Shipping Settings</h2>
                <div className="space-y-4">
                  <Field label="Processing Time" type="select" placeholder="1-2 days" />
                  <Field label="Free Shipping Threshold" type="number" placeholder="100" />
                  <Button fullWidth>Save Settings</Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </SellerLayout>
  );
}
