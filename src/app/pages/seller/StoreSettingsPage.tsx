import { motion, useReducedMotion } from 'motion/react';
import { Store, Lock, Bell, Save } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { Field } from '../../components/primitives/Field';
import { Button } from '../../components/primitives/Button';
import { Switch } from '../../components/ui/switch';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO, SEOConfigs } from '../../components/SEO';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { toast } from 'sonner';
import { useState } from 'react';

export default function StoreSettingsPage() {
  const reduce = useReducedMotion();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    storeName: 'My Store',
    description: 'Welcome to my store',
    email: 'seller@example.com',
    phone: '+1234567890',
    notifications: true,
    sms: false,
    autoResponse: true,
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Settings saved');
    }, 1000);
  };

  return (
    <SellerLayout>
      <SEO {...SEOConfigs.settings} />
      <motion.div
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto space-y-6"
      >
        <motion.div variants={fadeUp}>
          <h1 className="font-display text-2xl font-semibold text-foreground">Store Settings</h1>
          <p className="text-sm text-foreground-secondary mt-1">Configure your store</p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card variant="default" padding="lg">
            <h2 className="font-display font-semibold text-lg mb-4 text-foreground flex items-center gap-2">
              <Store className="size-5" /> Store Information
            </h2>
            <div className="space-y-4">
              <Field
                label="Store Name"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
              />
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                <textarea
                  rows={4}
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  className="w-full px-4 py-3 bg-background-elevated border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <Field
                label="Email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
              <Field
                label="Phone"
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card variant="default" padding="lg">
            <h2 className="font-display font-semibold text-lg mb-4 text-foreground flex items-center gap-2">
              <Bell className="size-5" /> Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Email Notifications</p>
                  <p className="text-xs text-foreground-secondary">Get updates about orders</p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">SMS Notifications</p>
                  <p className="text-xs text-foreground-secondary">Receive SMS alerts</p>
                </div>
                <Switch
                  checked={settings.sms}
                  onCheckedChange={(checked) => setSettings({ ...settings, sms: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Auto-Response</p>
                  <p className="text-xs text-foreground-secondary">Auto reply when offline</p>
                </div>
                <Switch
                  checked={settings.autoResponse}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoResponse: checked })}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Button
            variant="gradient"
            size="lg"
            fullWidth
            loading={isSaving}
            onClick={handleSave}
            leftIcon={<Save className="size-5" />}
            className="shadow-brand"
          >
            Save Settings
          </Button>
        </motion.div>
      </motion.div>
    </SellerLayout>
  );
}
