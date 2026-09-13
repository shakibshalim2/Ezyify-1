import { motion, useReducedMotion } from 'motion/react';
import { MessageSquare, Book, AlertCircle, Phone } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { Button } from '../../components/primitives/Button';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO, SEOConfigs } from '../../components/SEO';
import { fadeUp, staggerContainer } from '../../lib/motion';

export default function SellerSupport() {
  const reduce = useReducedMotion();

  return (
    <SellerLayout>
      <SEO {...SEOConfigs.support} />
      <motion.div
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={fadeUp}>
          <h1 className="font-display text-2xl font-semibold text-foreground">Support</h1>
          <p className="text-sm text-foreground-secondary mt-1">Get help with selling on Ezyify</p>
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="elevated" padding="lg" interactive className="text-center cursor-pointer space-y-3">
            <MessageSquare className="size-8 text-primary mx-auto" />
            <div>
              <h3 className="font-display font-semibold text-foreground">Contact Support</h3>
              <p className="text-xs text-foreground-secondary mt-1">Chat with our support team</p>
            </div>
            <Button fullWidth variant="primary">Start Chat</Button>
          </Card>

          <Card variant="elevated" padding="lg" interactive className="text-center cursor-pointer space-y-3">
            <Book className="size-8 text-primary mx-auto" />
            <div>
              <h3 className="font-display font-semibold text-foreground">Help Center</h3>
              <p className="text-xs text-foreground-secondary mt-1">Browse help articles</p>
            </div>
            <Button fullWidth variant="primary">Explore</Button>
          </Card>

          <Card variant="elevated" padding="lg" interactive className="text-center cursor-pointer space-y-3">
            <AlertCircle className="size-8 text-primary mx-auto" />
            <div>
              <h3 className="font-display font-semibold text-foreground">Report Issue</h3>
              <p className="text-xs text-foreground-secondary mt-1">Report a technical problem</p>
            </div>
            <Button fullWidth variant="primary">Report</Button>
          </Card>

          <Card variant="elevated" padding="lg" interactive className="text-center cursor-pointer space-y-3">
            <Phone className="size-8 text-primary mx-auto" />
            <div>
              <h3 className="font-display font-semibold text-foreground">Phone Support</h3>
              <p className="text-xs text-foreground-secondary mt-1">Call us directly</p>
            </div>
            <Button fullWidth variant="primary">Call</Button>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card variant="default" padding="lg">
            <h2 className="font-display font-semibold text-lg mb-4 text-foreground">FAQs</h2>
            <div className="space-y-3">
              {['How do I add a product?', 'How do I manage orders?', 'What are the shipping options?'].map((faq, i) => (
                <div key={i} className="p-3 bg-background-elevated rounded-lg cursor-pointer hover:bg-background-elevated/80 transition">
                  <p className="font-medium text-foreground text-sm">{faq}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </SellerLayout>
  );
}
