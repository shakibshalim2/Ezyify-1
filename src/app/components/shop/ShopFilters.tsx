import React, { useState } from 'react';
import { X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '../ui/sheet';
import { VisuallyHidden } from '../ui/visually-hidden';
import { Slider } from '../ui/slider';

interface ShopFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApply: () => void;
  onReset: () => void;
}

export interface FilterState {
  priceRange: [number, number];
  categories: string[];
  brands: string[];
  ratings: number[];
  inStockOnly: boolean;
  freeShipping: boolean;
  onSale: boolean;
}

const brands = [
  'TechStore Official',
  'Fashion Hub',
  'GlowCare Beauty',
  'HomeStyle Co',
  'FitLife Gear',
  'Stationery Plus',
  'WorkSpace Pro'
];

const ratingOptions = [
  { value: 4.5, label: '4.5★ & above' },
  { value: 4.0, label: '4.0★ & above' },
  { value: 3.5, label: '3.5★ & above' },
  { value: 3.0, label: '3.0★ & above' },
];

export function ShopFilters({ open, onOpenChange, filters, onFiltersChange, onApply, onReset }: ShopFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    brand: true,
    rating: true,
    options: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleBrandToggle = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand];
    onFiltersChange({ ...filters, brands: newBrands });
  };

  const handleRatingToggle = (rating: number) => {
    const newRatings = filters.ratings.includes(rating)
      ? filters.ratings.filter(r => r !== rating)
      : [...filters.ratings, rating];
    onFiltersChange({ ...filters, ratings: newRatings });
  };

  const FilterSection = ({ title, sectionKey, children }: { title: string; sectionKey: keyof typeof expandedSections; children: React.ReactNode }) => (
    <div className="border-b border-border pb-4">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between py-2 text-left"
      >
        <h3 className="font-semibold text-foreground">{title}</h3>
        {expandedSections[sectionKey] ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      {expandedSections[sectionKey] && (
        <div className="mt-3 space-y-2">{children}</div>
      )}
    </div>
  );

  const activeFiltersCount = 
    (filters.brands.length) +
    (filters.ratings.length) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.freeShipping ? 1 : 0) +
    (filters.onSale ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:w-96 p-0 flex flex-col">
        <VisuallyHidden>
          <SheetTitle>Product Filters</SheetTitle>
        </VisuallyHidden>
        <VisuallyHidden>
          <SheetDescription>
            Filter products by price, brand, rating, and other options
          </SheetDescription>
        </VisuallyHidden>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">Filters</h2>
            {activeFiltersCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Filters Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Price Range */}
          <FilterSection title="Price Range" sectionKey="price">
            <div className="space-y-4">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => onFiltersChange({ ...filters, priceRange: value as [number, number] })}
                min={0}
                max={500}
                step={10}
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground font-medium">${filters.priceRange[0]}</span>
                <span className="text-muted-foreground">to</span>
                <span className="text-foreground font-medium">${filters.priceRange[1]}</span>
              </div>
            </div>
          </FilterSection>

          {/* Brand */}
          <FilterSection title="Brand" sectionKey="brand">
            {brands.map(brand => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer hover:bg-muted px-2 py-1.5 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand)}
                  onChange={() => handleBrandToggle(brand)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                />
                <span className="text-sm text-foreground">{brand}</span>
              </label>
            ))}
          </FilterSection>

          {/* Rating */}
          <FilterSection title="Rating" sectionKey="rating">
            {ratingOptions.map(option => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer hover:bg-muted px-2 py-1.5 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={filters.ratings.includes(option.value)}
                  onChange={() => handleRatingToggle(option.value)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                />
                <span className="text-sm text-foreground">{option.label}</span>
              </label>
            ))}
          </FilterSection>

          {/* Other Options */}
          <FilterSection title="Options" sectionKey="options">
            <label className="flex items-center gap-2 cursor-pointer hover:bg-muted px-2 py-1.5 rounded transition-colors">
              <input
                type="checkbox"
                checked={filters.inStockOnly}
                onChange={(e) => onFiltersChange({ ...filters, inStockOnly: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
              />
              <span className="text-sm text-foreground">In Stock Only</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-muted px-2 py-1.5 rounded transition-colors">
              <input
                type="checkbox"
                checked={filters.freeShipping}
                onChange={(e) => onFiltersChange({ ...filters, freeShipping: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
              />
              <span className="text-sm text-foreground">Free Shipping</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-muted px-2 py-1.5 rounded transition-colors">
              <input
                type="checkbox"
                checked={filters.onSale}
                onChange={(e) => onFiltersChange({ ...filters, onSale: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
              />
              <span className="text-sm text-foreground">On Sale</span>
            </label>
          </FilterSection>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border p-4 bg-card sticky bottom-0" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
          <div className="flex gap-2">
            <button
              onClick={onReset}
              className="flex-1 px-4 py-3 border border-border rounded-xl hover:bg-muted transition-colors font-medium text-foreground"
            >
              Reset
            </button>
            <button
              onClick={() => {
                onApply();
                onOpenChange(false);
              }}
              className="flex-1 px-4 py-3 text-white rounded-xl font-semibold shadow-brand hover:shadow-brand-lg transition-all"
              style={{ background: 'var(--brand-gradient)' }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
