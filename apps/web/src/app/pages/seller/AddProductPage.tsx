import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { Save, Upload, Plus, X, Image as ImageIcon, Lightbulb } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { Field } from '../../components/primitives/Field';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO, SEOConfigs } from '../../components/SEO';
import { fadeUp, staggerContainer } from '../../lib/motion';

export default function AddProductPage() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    compareAtPrice: '',
    stock: '',
    sku: '',
    brand: '',
    weight: '',
    shipping: true,
    inStock: true,
  });

  const handleSave = () => {
    if (!formData.name.trim() || !formData.description.trim() || !formData.category || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Product added successfully');
      navigate('/seller/products');
    }, 1500);
  };

  return (
    <SellerLayout>
      <SEO {...SEOConfigs.addProduct} />
      <motion.div
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeUp}>
          <h1 className="font-display text-2xl font-semibold text-foreground">Add Product</h1>
          <p className="text-sm text-foreground-secondary mt-1">List a new product for sale</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Media */}
            <motion.div variants={fadeUp}>
              <Card variant="default" padding="lg">
                <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Product Media</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className="aspect-square border-2 border-dashed border-border rounded-card flex items-center justify-center hover:bg-background-elevated transition-colors cursor-pointer"
                    >
                      <div className="text-center">
                        <Upload className="size-5 text-foreground-tertiary mx-auto mb-2" />
                        <p className="text-xs text-foreground-secondary">{i === 1 ? 'Main' : `Alt ${i}`}</p>
                      </div>
                    </div>
                  ))}
                  <div className="aspect-square border-2 border-dashed border-primary/50 rounded-card flex items-center justify-center hover:bg-primary-subtle transition-colors cursor-pointer">
                    <Plus className="size-5 text-primary" />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Basic Information */}
            <motion.div variants={fadeUp}>
              <Card variant="default" padding="lg">
                <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Basic Information</h2>
                <div className="space-y-4">
                  <Field
                    label="Product Name"
                    required
                    placeholder="e.g. Premium Wireless Headphones"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Description <span className="text-error">*</span>
                    </label>
                    <textarea
                      placeholder="Describe features, benefits, specifications..."
                      rows={5}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 bg-background-elevated border border-border rounded-xl font-medium resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Category <span className="text-error">*</span>
                      </label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="fashion">Fashion</SelectItem>
                          <SelectItem value="home">Home & Living</SelectItem>
                          <SelectItem value="beauty">Beauty & Personal Care</SelectItem>
                          <SelectItem value="sports">Sports & Outdoors</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Field
                      label="Brand"
                      placeholder="e.g. Nike, Apple"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Pricing */}
            <motion.div variants={fadeUp}>
              <Card variant="default" padding="lg">
                <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Pricing</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Selling Price"
                    required
                    type="number"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />

                  <Field
                    label="Compare at Price"
                    type="number"
                    placeholder="0.00"
                    hint="Leave empty to hide"
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                  />
                </div>
                {formData.compareAtPrice && formData.price && (
                  <div className="mt-3 text-xs text-success bg-success-subtle px-3 py-2 rounded-lg">
                    Saving ${(parseFloat(formData.compareAtPrice) - parseFloat(formData.price)).toFixed(2)}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Inventory & Variants */}
            <motion.div variants={fadeUp}>
              <Card variant="default" padding="lg">
                <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Inventory</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Stock Quantity"
                    required
                    type="number"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />

                  <Field
                    label="SKU"
                    placeholder="e.g. PROD-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
              </Card>
            </motion.div>

            {/* Shipping */}
            <motion.div variants={fadeUp}>
              <Card variant="default" padding="lg">
                <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Shipping</h2>
                <div className="space-y-4">
                  <Field
                    label="Weight"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    hint="in kg"
                  />
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <motion.div variants={fadeUp}>
              <Card variant="elevated" padding="lg">
                <h3 className="font-display font-semibold text-lg mb-4 text-foreground">Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">In Stock</p>
                      <p className="text-xs text-foreground-secondary">Show as available</p>
                    </div>
                    <Switch
                      checked={formData.inStock}
                      onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Free Shipping</p>
                      <p className="text-xs text-foreground-secondary">Offer free shipping</p>
                    </div>
                    <Switch
                      checked={formData.shipping}
                      onCheckedChange={(checked) => setFormData({ ...formData, shipping: checked })}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Tips */}
            <motion.div variants={fadeUp}>
              <Card variant="featured" padding="lg">
                <h3 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-1.5"><Lightbulb className="size-4 text-warning" /> Tips</h3>
                <ul className="text-xs text-foreground-secondary space-y-2">
                  <li>• Use clear, descriptive names</li>
                  <li>• Add 3-5 high-quality images</li>
                  <li>• Write detailed descriptions</li>
                  <li>• Set competitive pricing</li>
                  <li>• Keep stock updated</li>
                </ul>
              </Card>
            </motion.div>

            {/* Save Button */}
            <motion.div variants={fadeUp} className="sticky bottom-0 lg:static">
              <Button
                variant="gradient"
                size="lg"
                fullWidth
                loading={isSaving}
                onClick={handleSave}
                leftIcon={<Save className="size-5" />}
                className="shadow-brand"
              >
                Save Product
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </SellerLayout>
  );
}
