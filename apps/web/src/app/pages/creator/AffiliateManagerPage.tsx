import { motion, useReducedMotion } from 'motion/react';
import { Copy, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO } from '../../components/SEO';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { toast } from 'sonner';

export default function AffiliateManagerPage() {
  const reduce = useReducedMotion();

  const affiliateLinks = [
    { id: 1, product: 'Premium Headphones', link: 'https://ezyify.app/aff/xyz123', clicks: 245, conversions: 18, earnings: '$180' },
    { id: 2, product: 'Smart Watch', link: 'https://ezyify.app/aff/abc456', clicks: 189, conversions: 12, earnings: '$240' },
    { id: 3, product: 'Wireless Earbuds', link: 'https://ezyify.app/aff/def789', clicks: 456, conversions: 34, earnings: '$340' },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied!');
  };

  return (
    <SellerLayout>
      <SEO title="Affiliate Manager — Ezyify Creator" description="Manage your affiliate links and earnings." />
      <motion.div
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={fadeUp}>
          <h1 className="font-display text-2xl font-semibold text-foreground">Affiliate Manager</h1>
          <p className="text-sm text-foreground-secondary mt-1">Manage affiliate links and track earnings</p>
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <Users className="size-5 text-primary" />
              <div>
                <p className="text-xs text-foreground-secondary">Total Clicks</p>
                <p className="font-display font-bold text-2xl text-foreground">890</p>
              </div>
            </div>
          </Card>

          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <TrendingUp className="size-5 text-success" />
              <div>
                <p className="text-xs text-foreground-secondary">Conversions</p>
                <p className="font-display font-bold text-2xl text-foreground">64</p>
              </div>
            </div>
          </Card>

          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <DollarSign className="size-5 text-accent-brand" />
              <div>
                <p className="text-xs text-foreground-secondary">Total Earnings</p>
                <p className="font-display font-bold text-2xl text-foreground">$760</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card variant="default" padding="lg">
            <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Your Affiliate Links</h2>
            <div className="space-y-3">
              {affiliateLinks.map(link => (
                <div key={link.id} className="p-4 bg-background-elevated rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="font-semibold text-foreground text-sm">{link.product}</p>
                      <p className="text-xs text-foreground-secondary mt-1 break-all">{link.link}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Copy className="size-4" />}
                      onClick={() => copyToClipboard(link.link)}
                    >
                      Copy
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-foreground-secondary text-xs">Clicks</p>
                      <p className="font-semibold text-foreground">{link.clicks}</p>
                    </div>
                    <div>
                      <p className="text-foreground-secondary text-xs">Conversions</p>
                      <p className="font-semibold text-foreground">{link.conversions}</p>
                    </div>
                    <div>
                      <p className="text-foreground-secondary text-xs">Earnings</p>
                      <p className="font-semibold text-foreground">{link.earnings}</p>
                    </div>
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
