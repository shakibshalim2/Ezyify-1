import { motion, useReducedMotion } from 'motion/react';
import { Users, Mail, ShoppingCart } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { Field } from '../../components/primitives/Field';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO, SEOConfigs } from '../../components/SEO';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';

export default function SellerCustomers() {
  const reduce = useReducedMotion();

  const customers = [
    { id: 1, name: 'Ahmed Hassan', email: 'ahmed@email.com', avatar: 'https://i.pravatar.cc/150?img=1', orders: 5, spent: '$450' },
    { id: 2, name: 'Sarah Ahmed', email: 'sarah@email.com', avatar: 'https://i.pravatar.cc/150?img=2', orders: 3, spent: '$250' },
    { id: 3, name: 'Mike Johnson', email: 'mike@email.com', avatar: 'https://i.pravatar.cc/150?img=3', orders: 8, spent: '$890' },
  ];

  return (
    <SellerLayout>
      <SEO {...SEOConfigs.customers} />
      <motion.div
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={fadeUp}>
          <h1 className="font-display text-2xl font-semibold text-foreground">Customers</h1>
          <p className="text-sm text-foreground-secondary mt-1">Manage your customer relationships</p>
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <Users className="size-5 text-primary" />
              <div>
                <p className="text-xs text-foreground-secondary">Total Customers</p>
                <p className="font-display font-bold text-2xl text-foreground">89</p>
              </div>
            </div>
          </Card>
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <ShoppingCart className="size-5 text-success" />
              <div>
                <p className="text-xs text-foreground-secondary">Repeat Customers</p>
                <p className="font-display font-bold text-2xl text-foreground">34</p>
              </div>
            </div>
          </Card>
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <Mail className="size-5 text-info" />
              <div>
                <p className="text-xs text-foreground-secondary">Avg. Order Value</p>
                <p className="font-display font-bold text-2xl text-foreground">$125</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Field label="Search customers" type="text" placeholder="Name or email..." />
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card variant="default" padding="lg">
            <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Top Customers</h2>
            <div className="space-y-3">
              {customers.map(customer => (
                <div key={customer.id} className="flex items-center justify-between p-3 bg-background-elevated rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarImage src={customer.avatar} />
                      <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground text-sm">{customer.name}</p>
                      <p className="text-xs text-foreground-secondary">{customer.email}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold text-foreground">{customer.orders} orders</p>
                    <p className="text-foreground-secondary text-xs">{customer.spent}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </SellerLayout>
  );
}
