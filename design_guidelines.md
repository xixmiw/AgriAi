# Design Guidelines: Kazakhstan Agricultural AI Platform

## Design Approach

**Selected System**: Material Design adapted for agricultural/enterprise context
**Rationale**: Data-intensive dashboard requiring clear hierarchy, robust form patterns, and mobile-responsive layouts suitable for field use by farmers.

**Core Principles**:
- Clarity over decoration: Information density with breathing room
- Data-first hierarchy: Critical metrics and AI recommendations front and center
- Accessibility: Large touch targets, clear labels for outdoor/mobile use
- Trust through professionalism: Clean, systematic layouts that inspire confidence

---

## Typography System

**Font Stack**: 
- Primary: Inter (via Google Fonts CDN)
- Fallback: system-ui, -apple-system, sans-serif

**Hierarchy**:
- Page Titles: text-3xl font-bold (Dashboard, Field Management)
- Section Headers: text-xl font-semibold (My Fields, Livestock Inventory)
- Card Titles: text-lg font-medium
- Body Text: text-base font-normal
- Helper Text/Labels: text-sm
- Data Values/Metrics: text-2xl font-bold for key numbers

**Multi-language Support**: Consistent font-size across Russian, English, Kazakh with adequate line-height (leading-relaxed)

---

## Layout System

**Spacing Primitives**: Tailwind units of 3, 4, 6, 8, 12, 16
- Component padding: p-4 to p-6
- Section margins: mb-6 to mb-8
- Card spacing: gap-4 to gap-6
- Page containers: p-6 to p-8

**Grid System**:
- Dashboard: 2-column on desktop (lg:grid-cols-2), single column mobile
- Data cards: 3-column grid for metrics (lg:grid-cols-3)
- Forms: Single column with max-w-2xl centering
- Livestock/Field lists: Cards in responsive grid

**Container Widths**:
- Main app: max-w-7xl mx-auto
- Forms: max-w-2xl
- Content sections: w-full with internal max-width control

---

## Component Library

### Navigation
**Top Navigation Bar**:
- Fixed header with app logo/name, language switcher (RU/EN/KZ flags), user profile
- Height: h-16
- Shadow: shadow-md
- Padding: px-6

**Sidebar Navigation** (Desktop):
- w-64 fixed sidebar with module links
- Icons from Heroicons (via CDN) + labels
- Modules: Dashboard, Fields, Livestock, Weather, Recommendations, About
- Active state: subtle background treatment

**Mobile Navigation**:
- Hamburger menu converting sidebar to drawer
- Full-screen overlay on mobile

### Dashboard Components

**Metric Cards**:
- Elevated cards with shadow-sm, rounded-lg
- Each card: p-6, min-h-32
- Layout: Icon + Label + Large Value + Trend indicator
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4

**AI Recommendation Panels**:
- Prominent cards with border-l-4 accent
- Icon (lightbulb/sparkles) + "AI Suggestion" label
- Content: p-6 with organized list structure
- Action buttons at bottom

**Weather Widget**:
- Compact card showing current conditions + 5-day forecast
- Icons from weather API or Heroicons
- Temperature prominent with text-3xl
- Horizontal scroll for forecast on mobile

### Forms

**Field/Livestock Entry Forms**:
- Vertical layout with clear label-input pairing
- Input fields: p-3, border, rounded-md, w-full
- Labels: text-sm font-medium mb-2
- Required fields: asterisk indicator
- Coordinate inputs: 2-column grid (lat/lon)
- Submit buttons: w-full md:w-auto, px-8 py-3

**Dropdowns/Selects**:
- Native select with custom styling
- Height: h-12 for easy mobile tapping

### Data Display

**Field/Livestock Lists**:
- Card-based grid layout
- Each card: Image placeholder + Title + Key stats + Actions
- Quick actions: Edit, Delete icons (Heroicons)
- Hover state: subtle elevation change

**Animal Simulation Display**:
- Separate tab/page with visual representation
- Status indicators using badges (Healthy/At Risk/Critical)
- Grid of animal cards with health metrics
- Filter/sort controls at top

**Tables** (for detailed data):
- Responsive tables with horizontal scroll on mobile
- Zebra striping for readability
- Sticky headers on scroll
- Compact: py-3 px-4 cell padding

### Alerts & Feedback

**AI Insights/Warnings**:
- Toast notifications for new recommendations
- Alert boxes with icon + message + action
- Risk warnings: border-l-4 treatment

**Loading States**:
- Skeleton screens for data-heavy sections
- Spinner for AI analysis in progress
- Progress bars for multi-step forms

---

## Page Layouts

### Login/Registration Page
- Centered card (max-w-md) on neutral background
- Logo at top
- Tabbed interface (Login/Register)
- "Continue with Google" button with icon
- Email/password inputs with proper spacing (space-y-4)
- Language selector in top-right corner

### Main Dashboard
- Grid of metric cards (4 across on desktop)
- Weather widget (top-right or dedicated section)
- Recent AI recommendations feed
- Quick actions: "Add Field", "Add Livestock"
- Chart/graph section for trends (using chart library)

### Field Management
- Header with "Add New Field" button
- Grid of field cards (3 columns desktop)
- Each card: Map thumbnail + Field name + Size + Crop type + AI score/status
- Click card for detailed view with full recommendations

### Livestock Module
- Similar card grid structure
- Animal type icons
- Count badges
- Health status indicators
- "Simulate Herd Health" prominent button leading to simulation view

### Simulation View
- Header with herd summary stats
- Grid of individual animal status cards
- Visual health indicators (icon + status badge)
- Filter controls (by type, health status)

### About Page
- Single column layout (max-w-4xl)
- Section blocks with icon + heading + description
- Feature highlights in 2-column grid
- Contact/support information

---

## Images

**Hero/Header Images**: None needed - this is a functional dashboard
**Field Cards**: Placeholder images for field aerial views (can be user-uploaded or satellite imagery)
**Livestock Icons**: SVG icons representing animal types (cow, sheep, etc.) from Heroicons
**About Page**: Illustrative images showing farmers using technology, agricultural landscapes of Kazakhstan

---

## Responsive Behavior

**Breakpoints**:
- Mobile: base (< 768px) - single column, stacked layout
- Tablet: md (768px+) - 2-column grids
- Desktop: lg (1024px+) - full multi-column layouts, persistent sidebar

**Mobile Optimizations**:
- Bottom navigation bar alternative for key modules
- Larger touch targets (min h-12)
- Simplified forms with progressive disclosure
- Collapsible sections for lengthy AI recommendations

---

## Interactions

**Minimal Animations**:
- Subtle transitions on card hover (shadow increase, slight scale)
- Smooth drawer/modal open/close
- Loading spinners for async operations
- No decorative animations that distract from data

**Focus States**: 
- Clear ring/outline for keyboard navigation
- High contrast for accessibility

This design creates a professional, data-focused agricultural platform that prioritizes farmer productivity and AI-powered insights while maintaining excellent usability across devices and languages.