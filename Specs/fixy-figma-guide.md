# 📐 Fixy.tn Figma Mockup Reference Guide

**Purpose:** Quick visual mockups for stakeholder review (optional)  
**Time Required:** 2-4 hours for 5 key screens  
**Alternative:** Skip to browser-based design (recommended for solo/small teams)

---

## 🎯 When to Use Figma

### **Use Figma If:**
- ✅ You have investors who need to see designs
- ✅ You're working with a team and need alignment
- ✅ You want to test flows with users before coding
- ✅ You need design approval before development

### **Skip Figma If:**
- ✅ You're building solo or with just developers
- ✅ You're comfortable designing in browser with ShadCN
- ✅ You want to iterate fast and ship quickly
- ✅ You're using the components I provided above

**My Recommendation:** Skip Figma for MVP. Design directly in Next.js with ShadCN components.

---

## 🚀 Quick Figma Setup (If You Need It)

### **Step 1: Create Figma Account**
1. Go to figma.com
2. Sign up (free plan is enough)
3. Create new design file: "Fixy.tn MVP"

---

### **Step 2: Install ShadCN Figma Kit**

**Option A: Community File (Free)**
1. Search Figma Community for "shadcn ui"
2. Duplicate to your files
3. You'll get all button/card/input components

**Option B: Manual Setup**
1. Create frames for components
2. Use the color palette from the Tailwind config
3. Match the specs from the Style Guide

---

### **Step 3: Set Up Design System**

#### **Colors (Create Color Styles)**
```
Primary/500:    #10B981
Primary/600:    #059669
Secondary/500:  #3B82F6
Accent/500:     #F59E0B
Success/500:    #22C55E
Error/500:      #EF4444
Neutral/50:     #F8FAFC
Neutral/700:    #334155
Neutral/900:    #0F172A
```

**How to add:**
1. Select → Color → Create Style
2. Name: "Primary/500"
3. Hex: #10B981

#### **Typography (Create Text Styles)**
```
Heading/3XL:  Inter, 30px, Semibold, 36px line height
Heading/2XL:  Inter, 24px, Semibold, 32px line height
Heading/XL:   Inter, 20px, Semibold, 28px line height
Body/Base:    Inter, 16px, Regular, 24px line height
Body/SM:      Inter, 14px, Regular, 20px line height
Label/SM:     Inter, 14px, Medium, 20px line height
```

#### **Components to Create**
1. **Button/Primary** (bg: Primary/500, text: white, 24px padding horizontal, 12px vertical, 12px radius)
2. **Button/Secondary** (bg: white, border: Neutral/300, text: Neutral/700)
3. **Card** (bg: white, 12px radius, shadow)
4. **Badge** (12px padding horizontal, 4px vertical, full radius)
5. **Input** (border: Neutral/300, 16px padding, 8px radius)

---

### **Step 4: Set Up Frames**

Create these 5 key screens (mobile-first):

#### **Frame Sizes:**
```
Mobile:  375 × 812 (iPhone 13 size)
Tablet:  768 × 1024
Desktop: 1440 × 900
```

**Start with mobile!**

---

## 📱 5 Essential Screens to Mock Up

### **1. Homepage (Worker Search)**

**Frame:** 375×812 mobile

**Layout:**
```
┌─────────────────────┐
│ 🏠 Fixy.tn      [👤]│  ← Header (60px)
├─────────────────────┤
│ What do you need?   │  ← Heading
│                     │
│ [🔧] [⚡] [❄️] [🧹] │  ← Category buttons (4 columns)
│                     │
│ Available Workers   │  ← Section heading
│                     │
│ ┌─────────────────┐ │
│ │ [Photo] Ahmed   │ │  ← Worker Card
│ │ ⭐ 4.8 (23)    │ │
│ │ 🔧 Plumbing    │ │
│ │ ✅ 45 jobs     │ │
│ │ [Contact]       │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ [Photo] Sarah   │ │  ← Worker Card
│ │ ...             │ │
│ └─────────────────┘ │
│                     │
├─────────────────────┤
│ 🏠  💼  💬  👤      │  ← Bottom Nav (60px)
└─────────────────────┘
```

**Key Elements:**
- Header: 60px height, logo left, profile right
- Category grid: 4 columns, 16px gap
- Worker cards: Use WorkerCard component design
- Bottom nav: 60px height, 4 icons

---

### **2. Job Creation Form**

**Frame:** 375×812 mobile

**Layout:**
```
┌─────────────────────┐
│ ← Create Job Request│  ← Header with back
├─────────────────────┤
│                     │
│ Service Type        │  ← Label
│ [🔧 Plumbing    ▼]  │  ← Dropdown
│                     │
│ Describe the Issue  │
│ ┌─────────────────┐ │
│ │                 │ │  ← Textarea (100px)
│ └─────────────────┘ │
│                     │
│ Upload Photos       │
│ [+ Add Photo]       │  ← Upload button
│                     │
│ Your Address        │
│ ┌─────────────────┐ │
│ │ Mourouj 5...    │ │  ← Input
│ └─────────────────┘ │
│                     │
│ Preferred Date      │
│ [📅 Tomorrow    ▼]  │  ← Date picker
│                     │
│ Preferred Time      │
│ [Morning] [After...│  ← Time slot buttons
│                     │
│                     │
│ [Submit Request] →  │  ← Primary button (bottom)
└─────────────────────┘
```

**Key Elements:**
- Back button top-left
- Form fields: 16px gap between
- Input height: 48px (touch-friendly)
- Submit button: Fixed at bottom, 56px height

---

### **3. Worker Profile**

**Frame:** 375×812 mobile

**Layout:**
```
┌─────────────────────┐
│ ← Worker Profile [⋮]│  ← Header
├─────────────────────┤
│                     │
│     ┌─────┐         │  ← Photo (96px)
│     │Photo│         │
│     └─────┘         │
│   Ahmed Ben Ali     │  ← Name
│   ⭐⭐⭐⭐⭐ 4.8     │  ← Rating
│                     │
│ ┌─────────────────┐ │
│ │ 45 Jobs │ Member│ │  ← Stats row
│ │Completed│ 2 yrs │ │
│ └─────────────────┘ │
│                     │
│ 🛡️ 7-Day Guarantee  │  ← Badge
│                     │
│ About               │
│ Experienced plumber │  ← Bio (3 lines)
│ with 10 years...    │
│                     │
│ Services            │
│ • Leak repairs      │  ← List
│ • Pipe installation │
│ • Drain cleaning    │
│                     │
│ Availability        │
│ [M] [T] [W] [T] [F] │  ← Calendar
│                     │
│ Reviews (23)        │
│ ┌─────────────────┐ │
│ │ ⭐⭐⭐⭐⭐      │ │  ← Review card
│ │ "Excellent work"│ │
│ │ - John, 2 days  │ │
│ └─────────────────┘ │
│                     │
│ [Contact Worker] →  │  ← Fixed button
└─────────────────────┘
```

**Key Elements:**
- Centered photo at top
- Stats in 2-column grid
- Badge below stats
- Reviews at bottom
- Fixed CTA button

---

### **4. Chat/Inbox (Price Negotiation)**

**Frame:** 375×812 mobile

**Layout:**
```
┌─────────────────────┐
│ ← Ahmed Ben Ali  [⋮]│  ← Header
├─────────────────────┤
│                     │
│  ┌──────────────┐   │  ← Message (left)
│  │Hello, I can  │   │
│  │help you      │   │
│  │10:30 AM   ✓✓ │   │
│  └──────────────┘   │
│                     │
│          ┌────────┐ │  ← Message (right)
│          │What's  │ │
│          │price?  │ │
│          │10:32 ✓✓│ │
│          └────────┘ │
│                     │
│  ┌──────────────┐   │  ← Price proposal
│  │Price Proposal│   │
│  │  45.00 TND   │   │
│  │Includes parts│   │
│  │10:35 AM   ✓✓ │   │
│  └──────────────┘   │
│                     │
│ ┌─────────────────┐ │  ← System message
│ │✅ Price Agreed:  │ │
│ │   45.00 TND     │ │
│ │ [Confirm Book]  │ │
│ └─────────────────┘ │
│                     │
├─────────────────────┤
│ [Type message... 📎]│  ← Input (fixed)
└─────────────────────┘
```

**Key Elements:**
- WhatsApp-style bubbles
- Left bubbles: gray background
- Right bubbles: green background
- Price proposals: highlighted
- System messages: centered
- Input: fixed at bottom

---

### **5. Admin Dashboard**

**Frame:** 1440×900 desktop

**Layout:**
```
┌────────────────────────────────────────────┐
│ 📊 Fixy Admin                      [⚙️] [👤]│  ← Header
├──────┬─────────────────────────────────────┤
│ 📊   │ Dashboard                           │
│      │                                     │
│ 👷   │ ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
│Workers│ │ 23 │ │ 12 │ │ 45 │ │  3 │       │  ← Stats
│      │ │Jobs│ │New │ │Done│ │Disp│       │
│ 💼   │ └────┘ └────┘ └────┘ └────┘       │
│ Jobs │                                     │
│      │ Pending Worker Verifications        │
│ ⚠️   │ ┌──────────────────────────────┐   │
│Dispute│ │ Ahmed - ID Pending           │   │
│      │ │ [Photo] [ID Doc] [Bio]       │   │
│ 💳   │ │ [✓ Approve] [✗ Reject]      │   │
│ Fees │ └──────────────────────────────┘   │
│      │                                     │
│ ⭐   │ Active Disputes                     │
│Reviews│ ┌──────────────────────────────┐   │
│      │ │ Job#123│Customer: ...│Worker│   │
│      │ │ [View] [Resolve]            │   │
│      │ └──────────────────────────────┘   │
└──────┴─────────────────────────────────────┘
```

**Key Elements:**
- Sidebar: 240px width
- Stats: 4 columns
- Tables: Sortable, filterable
- Action buttons: Always visible

---

## 🎨 Design Tokens to Use

### **In Figma, create these:**

**Spacing:**
```
4px   (1)
8px   (2)
12px  (3)
16px  (4)  ← Default gap
24px  (6)  ← Card padding
32px  (8)
48px  (12)
```

**Corner Radius:**
```
6px   (sm) - Badges
8px   (md) - Inputs
12px  (lg) - Cards, buttons
9999px     - Pills, avatars
```

**Shadows:**
```
sm:  0 1px 2px rgba(0,0,0,0.05)
md:  0 2px 8px rgba(0,0,0,0.1)   ← Default
lg:  0 4px 12px rgba(0,0,0,0.1)
xl:  0 8px 24px rgba(0,0,0,0.1)
```

---

## 🚀 Export to Development

### **Option 1: Figma → Dev Mode (Recommended)**
1. Click "Dev Mode" in Figma
2. Select element
3. Copy CSS/Tailwind classes
4. Paste into your components

### **Option 2: Export Assets**
1. Select icons/images
2. Export as SVG or PNG
3. Save to `/public/images/`

### **Option 3: Handoff Tool**
- Use Zeplin (paid)
- Use Figma Inspect (built-in)

---

## ⚡ Time-Saving Tips

### **1. Use Auto Layout**
- Select frame → Add Auto Layout
- Set spacing, padding automatically
- Mimics flexbox in CSS

### **2. Create Components**
- Button → Create Component
- Reuse across all screens
- Change once, updates everywhere

### **3. Use Variants**
- Button → Add Variants
- Primary, Secondary, Disabled states
- Matches your CSS classes

### **4. Plugins to Install**
```
- Iconify (free icons)
- Unsplash (stock photos)
- Lorem Ipsum (placeholder text)
- Contrast (check accessibility)
```

---

## 📏 Mobile Design Checklist

Before finishing mobile mockups:

- [ ] Minimum touch target: 44×44px
- [ ] Text is readable: 16px minimum body text
- [ ] Buttons are thumb-friendly (bottom half of screen)
- [ ] Forms have proper keyboard types (tel, email)
- [ ] Safe areas respected (notches, home indicators)
- [ ] One-handed use considered

---

## 🌍 RTL (Arabic) Design

### **To Create RTL Version:**

1. **Duplicate Frame**
   - Copy "Homepage" → Name "Homepage (Arabic)"

2. **Flip Horizontally**
   - Select all → Right-click → Flip Horizontal
   - OR manually mirror layout

3. **Check These:**
   - [ ] Icons flipped (arrows, chevrons)
   - [ ] Text aligned right
   - [ ] Margins/padding reversed
   - [ ] Flex direction reversed

4. **Don't Flip:**
   - [ ] Photos/avatars
   - [ ] Logos
   - [ ] Numbers
   - [ ] Progress bars (0-100 still left-to-right)

---

## 🎯 Figma Alternatives

If you don't want to use Figma:

### **1. Sketch** (macOS only)
- Similar to Figma
- One-time purchase
- Local files

### **2. Penpot** (Free, Open Source)
- Figma alternative
- Web-based
- Export to SVG

### **3. Skip Design Tools Entirely**
- Use ShadCN components
- Design in browser with Tailwind
- Iterate with real code
- **This is my recommendation for your MVP**

---

## ✅ Final Recommendation

**For Fixy.tn MVP:**

### **Skip Figma. Here's why:**

1. **You have working components** (I created them)
2. **ShadCN is visual** - You can see designs immediately
3. **Figma adds 1-2 weeks** to timeline
4. **Code is the truth** - Mockups can lie

### **Instead:**

1. ✅ Use the React components I provided
2. ✅ Build pages directly in Next.js
3. ✅ Test on real devices
4. ✅ Iterate based on user feedback

### **When to Create Figma Mockups:**

- **Before investor meetings** (make 3 key screens)
- **For user testing** (cheaper than coding)
- **For developer handoff** (if outsourcing)

---

## 🛠️ Quick Figma Template

If you DO decide to use Figma, here's a 30-minute template:

### **Frame 1: Style Guide**
- Show all colors
- Show all typography
- Show all components (buttons, cards, inputs)

### **Frame 2: Homepage (Mobile)**
- Use components from Frame 1
- 375×812 size

### **Frame 3: Worker Profile (Mobile)**
- Reuse components

### **Frame 4: Job Creation (Mobile)**
- Reuse components

### **Frame 5: Admin Dashboard (Desktop)**
- 1440×900 size

**Done. Ship it to investors or developers.**

---

**Bottom Line:** For your MVP, I recommend **skipping Figma** and building directly with the components I provided. You'll ship 2-3 weeks faster. Add Figma mockups only if you need them for stakeholder buy-in.

Use the React components above as your "living mockups" instead.