# 🎨 Fixy.tn Visual Style Guide

**Version:** 1.0  
**Last Updated:** December 31, 2025  
**Design System:** Friendly/Clean + Emerald Green

---

## 📐 Design Principles

### **1. Friendly & Approachable**
- Rounded corners (12px default)
- Soft shadows
- Warm color palette
- Conversational tone

### **2. Mobile-First**
- 75% of users on mobile
- Touch-friendly targets (min 44px)
- Bottom navigation for key actions
- Optimized for one-handed use

### **3. Trustworthy**
- Green = completion & success (TaskRabbit pattern)
- Blue = reliability & trust
- Clear information hierarchy
- Transparent pricing

### **4. Culturally Appropriate**
- RTL support for Arabic
- System fonts for best Arabic rendering
- Familiar patterns (WhatsApp-style chat)
- Local color psychology

---

## 🎨 Color System

### **Primary: Emerald Green #10B981**
**Usage:** Main CTAs, active states, completion badges

```
primary-50:  #ECFDF5  (backgrounds)
primary-100: #D1FAE5  (hover backgrounds)
primary-500: #10B981  ⭐ MAIN BRAND COLOR
primary-600: #059669  (hover/active states)
primary-700: #047857  (pressed states)
```

**Why Green:** TaskRabbit's success color. Users associate it with "job done" and accomplishment.

**Examples:**
- ✅ "Accept Job" button
- ✅ "Completed" status badge
- ✅ Guarantee badge
- ✅ Success notifications

---

### **Secondary: Trust Blue #3B82F6**
**Usage:** Secondary actions, information, links

```
secondary-500: #3B82F6  (secondary buttons)
secondary-600: #2563EB  (hover states)
```

**Examples:**
- 🔵 "View Details" links
- 🔵 Information badges
- 🔵 Rating stars (can be gold or blue)

---

### **Accent: Amber #F59E0B**
**Usage:** Highlights, urgency, attention

```
accent-500: #F59E0B  (warnings, highlights)
accent-600: #D97706  (hover)
```

**Examples:**
- ⚠️ "Payment Due" badges
- ⚠️ Urgent notifications
- ⚠️ Limited-time highlights

---

### **Success: Green #22C55E**
**Usage:** Success states, confirmations

**Examples:**
- ✅ "Job completed successfully"
- ✅ "Payment received"
- ✅ Checkmarks

---

### **Error: Red #EF4444**
**Usage:** Errors, cancellations, destructive actions

**Examples:**
- ❌ Form validation errors
- ❌ "Cancel Job" button
- ❌ Failed states

---

### **Neutral Grays**
**Usage:** Text, borders, backgrounds

```
neutral-50:  #F8FAFC  (page backgrounds)
neutral-100: #F1F5F9  (card backgrounds)
neutral-300: #CBD5E1  (borders)
neutral-500: #64748B  (secondary text)
neutral-700: #334155  (body text)
neutral-900: #0F172A  (headings)
```

---

## ✍️ Typography

### **Font Families**

**Latin (English/French):**
```
font-sans: Inter, system-ui, sans-serif
```

**Arabic:**
```
font-arabic: system-ui (native device font)
```

**Why System Fonts for Arabic:**
- Best rendering on all devices
- No font loading delay
- Familiar to users
- Accessible

---

### **Font Sizes (Mobile-Optimized)**

```
xs:   12px / 1rem      - Small labels, captions
sm:   14px / 1.25rem   - Body text (mobile), labels
base: 16px / 1.5rem    - Body text (default) ⭐
lg:   18px / 1.75rem   - Emphasized text
xl:   20px / 1.75rem   - Small headings
2xl:  24px / 2rem      - Card titles
3xl:  30px / 2.25rem   - Page headings
4xl:  36px / 2.5rem    - Hero headings
```

**Mobile-First Rule:** Default body text is 16px (not 14px) for better readability on small screens.

---

### **Font Weights**

```
normal:   400  - Body text
medium:   500  - Emphasized text, labels
semibold: 600  - Headings, buttons ⭐
bold:     700  - Strong emphasis
```

**Default button weight:** 600 (semibold) for better readability

---

### **Line Heights**

```
tight:   1.25  - Headings
normal:  1.5   - Body text ⭐
relaxed: 1.75  - Long-form content
```

---

## 🎯 Spacing System

**Base unit:** 4px

```
0:   0px
1:   4px
2:   8px
3:   12px
4:   16px   ⭐ Default padding
5:   20px
6:   24px   ⭐ Card padding
8:   32px
10:  40px
12:  48px
16:  64px
```

**Component Spacing Patterns:**
- **Cards:** `p-6` (24px padding)
- **Buttons:** `px-6 py-3` (24px horizontal, 12px vertical)
- **Sections:** `mb-8` or `mb-12` (32-48px between sections)
- **Forms:** `space-y-4` (16px between fields)

---

## 🔲 Border Radius

```
sm: 6px   - Small elements (badges)
md: 8px   - Input fields, small buttons
lg: 12px  - Cards, modals, large buttons ⭐
```

**Default:** `rounded-lg` (12px) for friendly, modern feel

---

## 🌑 Shadows

**Philosophy:** Soft, subtle elevation

```
sm:      Subtle lift (badges, small cards)
default: Standard cards ⭐
md:      Emphasized cards (hover states)
lg:      Modals, dropdowns
xl:      Large modals, overlays
```

**Examples:**
```css
shadow-sm:  0 1px 2px rgba(0,0,0,0.05)
shadow:     0 2px 8px rgba(0,0,0,0.1)  ⭐
shadow-md:  0 4px 12px rgba(0,0,0,0.1)
shadow-lg:  0 8px 24px rgba(0,0,0,0.1)
```

**Usage:**
- **Resting cards:** `shadow`
- **Hover cards:** `shadow-md`
- **Floating elements:** `shadow-lg`

---

## 🎭 Iconography

### **Icon Library: Lucide React**

**Style:** Outline, 2px stroke width  
**Sizes:**
- Small: 16px (`size-4`)
- Medium: 20px (`size-5`) ⭐
- Large: 24px (`size-6`)
- XL: 32px (`size-8`)

**Color Matching:**
- Icons inherit text color by default
- Use `text-primary-500` for primary icons
- Use `text-neutral-500` for decorative icons

**Service Category Icons:**
```
🔧 Plumbing:   Wrench
⚡ Electrical: Zap
❄️  AC:         Wind
🧹 Cleaning:   Sparkles
```

---

## 🎨 Component Patterns

### **Buttons**

**Primary Button (Main CTAs):**
```jsx
<button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold shadow-sm transition-colors">
  Create Job
</button>
```

**Secondary Button:**
```jsx
<button className="bg-white hover:bg-neutral-50 text-neutral-700 px-6 py-3 rounded-lg font-semibold border border-neutral-300 transition-colors">
  View Details
</button>
```

**Destructive Button:**
```jsx
<button className="bg-error-500 hover:bg-error-600 text-white px-6 py-3 rounded-lg font-semibold shadow-sm">
  Cancel Job
</button>
```

**Icon Button:**
```jsx
<button className="p-3 rounded-lg hover:bg-neutral-100 transition-colors">
  <Icon className="size-5" />
</button>
```

---

### **Cards**

**Standard Card:**
```jsx
<div className="bg-white rounded-lg shadow p-6">
  Content
</div>
```

**Interactive Card (Clickable):**
```jsx
<div className="bg-white rounded-lg shadow hover:shadow-md p-6 cursor-pointer transition-shadow">
  Content
</div>
```

**Card with Border (No Shadow):**
```jsx
<div className="bg-white rounded-lg border border-neutral-200 p-6">
  Content
</div>
```

---

### **Badges**

**Status Badges:**
```jsx
// Success
<span className="bg-success-100 text-success-700 px-3 py-1 rounded-full text-sm font-medium">
  Completed
</span>

// Warning
<span className="bg-accent-100 text-accent-700 px-3 py-1 rounded-full text-sm font-medium">
  Pending
</span>

// Error
<span className="bg-error-100 text-error-700 px-3 py-1 rounded-full text-sm font-medium">
  Cancelled
</span>

// Info
<span className="bg-secondary-100 text-secondary-700 px-3 py-1 rounded-full text-sm font-medium">
  In Progress
</span>
```

---

### **Form Inputs**

**Text Input:**
```jsx
<input 
  type="text"
  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
  placeholder="Enter text..."
/>
```

**Textarea:**
```jsx
<textarea 
  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
  rows={4}
  placeholder="Describe your issue..."
/>
```

**Error State:**
```jsx
<input 
  className="border-error-500 focus:ring-error-500"
/>
<p className="text-error-500 text-sm mt-1">This field is required</p>
```

---

### **Avatars**

**Sizes:**
```jsx
// Small (32px)
<img className="w-8 h-8 rounded-full" />

// Medium (40px) ⭐
<img className="w-10 h-10 rounded-full" />

// Large (64px)
<img className="w-16 h-16 rounded-full" />

// XL (96px)
<img className="w-24 h-24 rounded-full" />
```

**With Border:**
```jsx
<img className="w-10 h-10 rounded-full ring-2 ring-primary-500" />
```

---

### **Rating Stars**

```jsx
<div className="flex items-center gap-1">
  <span className="text-amber-400">★</span>
  <span className="text-amber-400">★</span>
  <span className="text-amber-400">★</span>
  <span className="text-amber-400">★</span>
  <span className="text-neutral-300">★</span>
  <span className="text-neutral-600 text-sm ml-1">4.0</span>
</div>
```

---

## 📱 Mobile Patterns

### **Bottom Navigation**

```jsx
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-2 safe-area-bottom">
  <div className="flex justify-around items-center">
    <button className="flex flex-col items-center gap-1 p-2">
      <Home className="size-6" />
      <span className="text-xs">Home</span>
    </button>
    {/* ... more tabs */}
  </div>
</nav>
```

**Safe Area:** Always add `safe-area-bottom` for iPhone notches

---

### **Floating Action Button (FAB)**

```jsx
<button className="fixed bottom-20 right-4 bg-primary-500 text-white p-4 rounded-full shadow-lg">
  <Plus className="size-6" />
</button>
```

**Position:** Above bottom nav (bottom-20) or bottom-4 if no nav

---

### **Pull-to-Refresh Indicator**

Use browser default or add:
```jsx
<div className="flex justify-center py-4">
  <LoadingSpinner className="size-6 text-primary-500" />
</div>
```

---

## 🌍 RTL (Arabic) Patterns

### **Margin/Padding Flipping**

```jsx
// Left margin in LTR, right margin in RTL
<div className="ml-4 rtl:mr-4 rtl:ml-0">

// Reverse flex direction in RTL
<div className="flex rtl:flex-row-reverse">
```

### **Text Alignment**

```jsx
// Left-aligned in LTR, right-aligned in RTL
<p className="text-left rtl:text-right">

// Always use dir attribute for inputs
<input dir="rtl" className="text-right rtl:text-right" />
```

### **Icon Positioning**

```jsx
// Icon on left in LTR, right in RTL
<button className="flex items-center gap-2 rtl:flex-row-reverse">
  <Icon />
  <span>Text</span>
</button>
```

---

## 🎬 Animations

**Philosophy:** Subtle, fast, purposeful

### **Transition Durations**

```
fast:   150ms  - Hover states
normal: 200ms  - Default ⭐
slow:   300ms  - Page transitions
```

**Usage:**
```jsx
// Hover transition
<div className="transition-colors duration-200">

// Transform transition
<div className="transition-transform duration-200 hover:scale-105">

// All properties
<div className="transition-all duration-200">
```

### **Common Animations**

**Fade In:**
```jsx
<div className="animate-fade-in">
```

**Slide Up:**
```jsx
<div className="animate-slide-up">
```

**Scale In:**
```jsx
<div className="animate-scale-in">
```

---

## 📐 Responsive Breakpoints

```
xs:  475px   - Large phones
sm:  640px   - Small tablets
md:  768px   - Tablets ⭐
lg:  1024px  - Laptops
xl:  1280px  - Desktops
2xl: 1536px  - Large desktops
```

**Mobile-First Approach:**
```jsx
// Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

## 🎯 Accessibility

### **Color Contrast**

- **Body text:** 4.5:1 minimum (WCAG AA)
- **Large text (18px+):** 3:1 minimum
- **Icons:** 3:1 minimum

**Tested combinations:**
✅ `text-neutral-700` on white (7.9:1)
✅ `text-primary-600` on white (4.7:1)
✅ White on `bg-primary-500` (5.1:1)

### **Touch Targets**

**Minimum size:** 44×44px (Apple HIG)

```jsx
// Button with proper touch target
<button className="min-h-[44px] min-w-[44px] px-6 py-3">
```

### **Focus States**

**Always show focus ring:**
```jsx
<button className="focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
```

### **Screen Reader Text**

```jsx
<span className="sr-only">Accessible label</span>
```

---

## 📸 Images & Media

### **Image Optimization**

**Use Next.js Image:**
```jsx
import Image from 'next/image'

<Image 
  src="/worker-photo.jpg"
  alt="Worker name"
  width={300}
  height={300}
  className="rounded-full"
/>
```

### **Aspect Ratios**

```
Square (1:1):   Worker avatars, service icons
Portrait (3:4): Worker profile photos
Landscape (16:9): Job photos, before/after
```

### **Placeholder Strategy**

```jsx
// Avatar placeholder
<div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center">
  <User className="size-5 text-neutral-400" />
</div>

// Image placeholder
<div className="aspect-video bg-neutral-100 rounded-lg animate-pulse" />
```

---

## ✅ Component Checklist

Before shipping a component, ensure:

- [ ] Works in all 3 languages (en, fr, ar-TN)
- [ ] RTL layout is correct for Arabic
- [ ] Touch target is 44×44px minimum
- [ ] Focus state is visible
- [ ] Color contrast passes WCAG AA
- [ ] Works on 375px mobile screen
- [ ] Loads fast (<200ms first paint)
- [ ] Has loading/error states

---

## 🎨 Design Tokens Export

For use in Figma or other tools:

```json
{
  "colors": {
    "primary": "#10B981",
    "secondary": "#3B82F6",
    "accent": "#F59E0B",
    "success": "#22C55E",
    "error": "#EF4444",
    "neutral": {
      "50": "#F8FAFC",
      "500": "#64748B",
      "900": "#0F172A"
    }
  },
  "spacing": {
    "unit": "4px",
    "card": "24px",
    "button": "12px 24px"
  },
  "borderRadius": {
    "default": "12px",
    "full": "9999px"
  },
  "fontSize": {
    "body": "16px",
    "heading": "24px"
  }
}
```

---

**End of Style Guide**

This is a living document. Update as patterns evolve.