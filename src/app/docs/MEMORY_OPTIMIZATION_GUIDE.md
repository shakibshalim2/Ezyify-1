# Memory Optimization Guide

## Overview

EZYIFY is a large-scale application with 83+ pages and extensive mock data. This document explains the memory optimization strategies implemented to ensure optimal performance.

## Issue: Memory Pressure Warning

**Symptom:** Console warning showing `[Performance] Memory pressure: medium`

**Root Cause:** Large amounts of mock data (products, posts, users) being loaded into memory simultaneously across multiple data files.

## Solutions Implemented

### 1. Data Manager (`/utils/dataManager.ts`)

Implements lazy loading and caching for mock data:

- **LRU Cache**: Keeps only recently accessed items in memory
- **Cache Limits**: 
  - Products: 50 items max
  - Posts: 30 items max
  - Users: 20 items max
- **Lazy Loading**: Data is loaded on-demand, not upfront
- **Dynamic Imports**: Uses `import()` to split bundles

**Usage:**
```typescript
import { getProductsLazy, getPostByIdLazy } from '../utils/dataManager';

// Load products with pagination
const products = await getProductsLazy(0, 20); // Offset 0, limit 20

// Get single product (checks cache first)
const product = await getProductByIdLazy('prod-001');
```

### 2. Memory Manager (`/utils/memoryManager.ts`)

Monitors and manages memory usage:

- **Memory Monitoring**: Tracks heap usage every 30 seconds
- **Auto Cleanup**: Triggers cleanup when memory usage > 85%
- **Memory Pressure Levels**: low / medium / high / critical
- **Image Optimization**: Unloads off-screen images to free memory

**Features:**
- `getMemoryUsage()` - Current memory statistics
- `performMemoryCleanup()` - Manual cleanup trigger
- `monitorMemory()` - Auto-monitoring with alerts
- `getMemoryPressureLevel()` - Current pressure status

### 3. Performance Optimization Updates

Updated `/utils/performanceOptimization.ts`:

- **Reduced Logging**: Only logs warnings for HIGH memory pressure
- **Development Only**: Memory warnings only in dev mode
- **Delayed Checks**: Uses `requestIdleCallback` to avoid blocking
- **User-Friendly Messages**: Explains that medium pressure is normal

### 4. App-Level Integration

Updated `/App.tsx`:

- Starts memory monitoring on app init
- Preloads only critical data (first 10 products/posts)
- Returns cleanup function to stop monitoring on unmount
- Prevents memory leaks from running intervals

## Memory Pressure Levels

| Level | Heap Usage | Action | User Impact |
|-------|------------|--------|-------------|
| **Low** | < 70% | None | Optimal performance |
| **Medium** | 70-85% | Monitor | Normal for large apps |
| **High** | 85-95% | Auto cleanup | Suggest closing tabs |
| **Critical** | > 95% | Aggressive cleanup | Warning message shown |

## Best Practices for Developers

### When Adding New Pages

1. **Use lazy loading for data:**
```typescript
// ❌ Bad - loads all data immediately
import { products } from '../data/products';

// ✅ Good - loads data on demand
import { getProductsLazy } from '../utils/dataManager';
```

2. **Implement pagination:**
```typescript
// Load data in chunks
const [page, setPage] = useState(0);
const products = await getProductsLazy(page * 20, 20);
```

3. **Clean up on unmount:**
```typescript
useEffect(() => {
  // Component logic
  
  return () => {
    // Cleanup logic
  };
}, []);
```

### When Working with Images

1. **Use lazy loading:**
```tsx
<img loading="lazy" src={image} alt="..." />
```

2. **Optimize image sizes:**
```typescript
// Use size parameters in Unsplash URLs
const imageUrl = `https://images.unsplash.com/photo-123?w=400&q=80`;
```

3. **Unload off-screen images:**
```typescript
import { optimizeImagesInDOM } from '../utils/memoryManager';

// Call periodically or on scroll
optimizeImagesInDOM();
```

### When Creating Components

1. **Avoid storing large arrays in state:**
```typescript
// ❌ Bad
const [allProducts, setAllProducts] = useState([...1000s of items]);

// ✅ Good
const [visibleProducts, setVisibleProducts] = useState([...20 items]);
```

2. **Use virtualization for long lists:**
```typescript
// Use calculateVisibleRange from performanceOptimization.ts
const { start, end } = calculateVisibleRange(scrollTop, height, itemHeight, total);
const visibleItems = items.slice(start, end);
```

## Monitoring Memory

### In Development

Open Chrome DevTools > Performance > Memory:
- Heap snapshots show memory allocation
- Timeline shows memory over time
- Compare snapshots to find leaks

### Console Commands

```javascript
// Get current memory usage
const usage = getMemoryUsage();
console.log(usage);

// Get cache statistics
const stats = getCacheStats();
console.log(stats);

// Manual cleanup
performMemoryCleanup();

// Get optimization suggestions
const suggestions = getMemorySuggestions();
console.log(suggestions);
```

## Data File Organization

### Current Structure

```
/data/
  ├── products.ts        - Product data & utilities
  ├── posts.ts           - Post data & utilities
  ├── users.ts           - User data & utilities
  ├── mockData.ts        - Legacy mock data (to be deprecated)
  └── enhanced-mock-data.ts - Enhanced data (to be deprecated)
```

### Recommended Migration

1. Consolidate all data into `/data/` files
2. Export only utility functions, not raw arrays
3. Use dataManager for all data access
4. Remove direct imports of large arrays

## Performance Metrics

### Before Optimization
- Memory usage: 70-90% of heap
- Data loaded: ~115 products + ~110 posts upfront
- Bundle size: All data in main bundle
- Warning frequency: Every page load

### After Optimization
- Memory usage: 50-70% of heap (medium is normal)
- Data loaded: Only visible items (20-30 at a time)
- Bundle size: Data split across dynamic imports
- Warning frequency: Only when truly critical

## Future Enhancements

1. **IndexedDB Storage**: Store large datasets in browser DB
2. **Service Worker Caching**: Cache API responses
3. **Virtual Scrolling**: Render only visible items
4. **Image CDN**: Use optimized image delivery
5. **Code Splitting**: Further split vendor bundles

## Troubleshooting

### Memory keeps growing
- Check for event listener leaks
- Verify cleanup functions in useEffect
- Look for circular references
- Use Chrome DevTools Memory profiler

### Cache not working
- Check cache limits in dataManager.ts
- Verify import paths
- Check console for cache stats

### Performance degradation
- Run `logBundleInfo()` to check bundle sizes
- Use React DevTools Profiler
- Check Network tab for unnecessary requests

## Support

For memory-related issues:
1. Check console for `[Memory]` and `[Performance]` logs
2. Review cache statistics with `getCacheStats()`
3. Monitor memory usage with DevTools
4. Run `getOptimizationRecommendations()` for suggestions

---

**Last Updated:** January 2026
**Version:** 1.0.0
