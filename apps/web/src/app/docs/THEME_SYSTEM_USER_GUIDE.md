# 🌗 EZYIFY THEME SYSTEM - USER GUIDE

**Platform:** EZYIFY - AI-First Social Commerce  
**Version:** 1.0.0  
**Last Updated:** January 19, 2026  

---

## 📚 TABLE OF CONTENTS

1. [Quick Start](#quick-start)
2. [User Guide - Switching Themes](#user-guide)
3. [Developer Guide - Using the Theme System](#developer-guide)
4. [Color System Reference](#color-system-reference)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 QUICK START

### For Users

**Default Experience:**
- EZYIFY loads in **dark mode** by default
- Your preference is saved automatically
- Switch anytime in Settings

**Switching Themes:**
1. Go to **Settings** (tap your profile icon → Settings)
2. Select **Appearance** tab
3. Toggle **Dark Mode** switch
4. Theme changes instantly!

---

## 👤 USER GUIDE

### Accessing Theme Settings

**Desktop:**
```
Profile Icon (top right) → Settings → Appearance tab → Dark Mode toggle
```

**Mobile:**
```
Menu (☰) → Settings → Appearance → Dark Mode toggle
```

### Theme Options

#### Dark Mode (Default) 🌙
**Best for:**
- Low-light environments
- Night-time browsing
- Reducing eye strain
- Saving battery on OLED screens

**Features:**
- Deep charcoal backgrounds (#0a0a0a)
- Soft white text for readability
- Reduced blue light
- Professional, modern aesthetic

#### Light Mode ☀️
**Best for:**
- Bright environments
- Daytime use
- Outdoor viewing
- Personal preference

**Features:**
- Soft off-white backgrounds (#fafafa)
- Near-black text for clarity
- Clean, minimal aesthetic
- Instagram-inspired design

### Theme Behavior

**Automatic Saving:**
- Your theme choice is saved automatically
- Persists across browser sessions
- Syncs across tabs (same browser)

**Instant Switching:**
- No page reload required
- Smooth transitions
- All elements update immediately

---

## 💻 DEVELOPER GUIDE

### Using the Theme System in Code

#### 1. Accessing Current Theme

```tsx
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

#### 2. Using CSS Variables (RECOMMENDED)

**Always use CSS variables, never hardcoded colors:**

```tsx
// ✅ CORRECT - Theme-aware
<div className="bg-card text-foreground border border-border">
  <h2 className="text-foreground">Title</h2>
  <p className="text-muted-foreground">Description</p>
</div>

// ❌ WRONG - Hardcoded colors
<div className="bg-white text-black border border-gray-200">
  <h2 className="text-black">Title</h2>
  <p className="text-gray-600">Description</p>
</div>
```

#### 3. Available CSS Classes

**Backgrounds:**
```tsx
bg-background        // Main page background
bg-card              // Card backgrounds
bg-muted             // Subtle backgrounds
bg-accent            // Accent backgrounds
bg-primary           // Primary action backgrounds
bg-secondary         // Secondary backgrounds
```

**Text Colors:**
```tsx
text-foreground              // Primary text
text-muted-foreground        // Secondary text
text-card-foreground         // Text on cards
text-primary-foreground      // Text on primary backgrounds
```

**Borders:**
```tsx
border-border         // Standard borders
border-input          // Input field borders
```

**Semantic Colors:**
```tsx
bg-success / text-success       // Green - success states
bg-warning / text-warning       // Amber - warning states
bg-error / text-error           // Red - error states
bg-info / text-info             // Blue - info states
bg-destructive / text-destructive  // Red - destructive actions
```

#### 4. Using CSS Variables in Custom Styles

```css
/* In your CSS file or styled component */
.my-custom-element {
  background-color: var(--background);
  color: var(--foreground);
  border: 1px solid var(--border);
}

.my-custom-card {
  background-color: var(--card);
  color: var(--card-foreground);
  border-radius: var(--radius);
}
```

#### 5. Conditional Styling Based on Theme

```tsx
// Only if absolutely necessary (CSS variables preferred)
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { theme } = useTheme();
  
  return (
    <div className={theme === 'dark' ? 'custom-dark-style' : 'custom-light-style'}>
      Content
    </div>
  );
}
```

---

## 🎨 COLOR SYSTEM REFERENCE

### Dark Mode Colors

**Backgrounds:**
```css
--background: #0a0a0a          /* Deep charcoal - main background */
--background-elevated: #1a1a1a  /* Cards, modals */
--background-subtle: #141414    /* Subtle sections */
```

**Text:**
```css
--foreground: #fafafa           /* Near-white - primary text */
--foreground-secondary: #a3a3a3 /* Muted gray - secondary text */
--foreground-tertiary: #737373  /* Darker gray - tertiary text */
```

**UI Elements:**
```css
--border: #262626               /* Dark borders */
--card: #1a1a1a                 /* Card backgrounds */
--primary: #0095f6              /* Blue - primary actions */
--muted: #1a1a1a                /* Muted backgrounds */
```

### Light Mode Colors

**Backgrounds:**
```css
--background: #fafafa           /* Soft off-white - main background */
--background-elevated: #ffffff  /* Pure white - cards, modals */
--background-subtle: #f5f5f5    /* Subtle sections */
```

**Text:**
```css
--foreground: #0a0a0a           /* Near-black - primary text */
--foreground-secondary: #737373 /* Muted gray - secondary text */
--foreground-tertiary: #a3a3a3  /* Lighter gray - tertiary text */
```

**UI Elements:**
```css
--border: #e5e5e5               /* Light borders */
--card: #ffffff                 /* White cards */
--primary: #0095f6              /* Blue - primary actions */
--muted: #f5f5f5                /* Muted backgrounds */
```

### Semantic Colors (Both Modes)

```css
/* Success - Green */
--success: #10b981 (light) / #22c55e (dark)

/* Warning - Amber */
--warning: #f59e0b (light) / #fbbf24 (dark)

/* Error - Red */
--error: #ef4444 (light) / #f87171 (dark)

/* Info - Blue */
--info: #3b82f6 (light) / #60a5fa (dark)
```

---

## ✅ BEST PRACTICES

### DO's ✅

1. **Always use CSS variables**
   ```tsx
   <div className="bg-card text-foreground">
   ```

2. **Use semantic class names**
   ```tsx
   <button className="bg-primary text-primary-foreground">
   ```

3. **Test in both themes**
   - Always check dark and light mode during development
   - Use Settings → Appearance to toggle while testing

4. **Use semantic colors for states**
   ```tsx
   <Alert className="bg-success text-success-foreground">
   ```

5. **Follow the existing pattern**
   - Check other pages for examples
   - Match the existing color usage

### DON'Ts ❌

1. **Don't use hardcoded colors**
   ```tsx
   ❌ <div className="bg-white text-black">
   ❌ <div className="bg-gray-100 text-gray-900">
   ❌ <div style={{backgroundColor: '#ffffff'}}>
   ```

2. **Don't use manual dark mode classes**
   ```tsx
   ❌ <div className="bg-white dark:bg-gray-900">
   ✅ <div className="bg-card">
   ```

3. **Don't assume a specific theme**
   ```tsx
   ❌ // Designing only for dark mode
   ✅ // Design works in both modes
   ```

4. **Don't use inline styles for colors**
   ```tsx
   ❌ <div style={{color: '#000000'}}>
   ✅ <div className="text-foreground">
   ```

---

## 🔧 TROUBLESHOOTING

### Common Issues

#### Issue: Colors not changing when switching themes

**Cause:** Using hardcoded colors instead of CSS variables

**Solution:**
```tsx
// Change this:
<div className="bg-white text-black">

// To this:
<div className="bg-card text-foreground">
```

---

#### Issue: Text is invisible in one theme mode

**Cause:** Not using theme-aware text colors

**Solution:**
```tsx
// Change this:
<p className="text-gray-600">

// To this:
<p className="text-muted-foreground">
```

---

#### Issue: Theme not persisting after refresh

**Cause:** localStorage may be disabled or blocked

**Solution:**
- Check browser settings allow localStorage
- Theme will default to dark mode if localStorage fails

---

#### Issue: Borders not visible in dark mode

**Cause:** Using light-mode-only border colors

**Solution:**
```tsx
// Change this:
<div className="border border-gray-200">

// To this:
<div className="border border-border">
```

---

#### Issue: Custom component doesn't adapt to theme

**Cause:** Not using CSS variables in custom styles

**Solution:**
```css
/* Change this: */
.my-component {
  background: #ffffff;
  color: #000000;
}

/* To this: */
.my-component {
  background: var(--card);
  color: var(--card-foreground);
}
```

---

## 📖 QUICK REFERENCE

### Most Common Classes

```tsx
// Backgrounds
bg-background        // Page background
bg-card              // Cards, panels
bg-muted             // Subtle sections
bg-primary           // Primary buttons

// Text
text-foreground          // Primary text
text-muted-foreground    // Secondary text

// Borders
border border-border     // Standard border

// States
bg-success               // Success states
bg-warning               // Warning states
bg-error                 // Error states
```

### Color Variable Quick Copy

```css
/* Use these in your CSS */
var(--background)
var(--foreground)
var(--card)
var(--border)
var(--primary)
var(--muted)
var(--muted-foreground)
```

---

## 🎯 EXAMPLES

### Example 1: Simple Card

```tsx
function ProductCard() {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-foreground text-lg font-semibold">
        Product Name
      </h3>
      <p className="text-muted-foreground text-sm">
        Product description
      </p>
      <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg">
        Add to Cart
      </button>
    </div>
  );
}
```

### Example 2: Alert Component

```tsx
function SuccessAlert() {
  return (
    <div className="bg-success/10 border border-success/20 text-success rounded-lg p-4">
      <p>Your order was successful!</p>
    </div>
  );
}
```

### Example 3: Form Input

```tsx
function FormInput() {
  return (
    <div>
      <label className="text-foreground text-sm font-medium">
        Email Address
      </label>
      <input 
        type="email"
        className="w-full bg-background border border-input text-foreground rounded-lg px-3 py-2"
        placeholder="you@example.com"
      />
    </div>
  );
}
```

---

## 📞 SUPPORT

### Need Help?

**For Users:**
- Check FAQs in Settings → Help
- Contact support if theme not working

**For Developers:**
- Review this guide
- Check `/styles/globals.css` for all available variables
- Look at existing components for examples
- Ensure you're using CSS variables, not hardcoded colors

---

## 🔄 Updates

**Version 1.0.0** (January 19, 2026)
- Initial theme system release
- Dark mode as default
- Light mode available
- Complete CSS variable system
- 98% theme coverage

---

**🌗 EZYIFY - Beautiful in Dark. Perfect in Light. 🌗**

---

**Document Version:** 1.0  
**Last Updated:** January 19, 2026  
**Maintained By:** EZYIFY Engineering Team
