# AI Compass — Frontend Structure (Next.js)

**Brand:** AI Native Foundation  
**Design:** Premium Gold & Black (matching Excellere)

---

## Design System

### Color Palette (Premium Gold & Black)

| Name | Hex | Usage |
|------|-----|-------|
| Primary Background | `#0a0a0a` | Main background |
| Surface | `#0e1420` | Cards, panels |
| Surface Elevated | `#141c2a` | Hover states |
| Gold | `#d4af37` | Primary accent, CTAs |
| Gold Light | `#e5c76b` | Hover states |
| Gold Dim | `#8b7355` | Muted accents |
| White | `#ffffff` | Primary text |
| Silver | `#a0a0a0` | Secondary text |
| Grey | `#666666` | Tertiary text |
| Border | `#222222` | Dividers |
| Success | `#4ade80` | Confirmed states |
| Warning | `#fbbf24` | Pending states |
| Error | `#ef4444` | Error states |

### Tier Colors

| Tier | Background | Text | Border |
|------|------------|------|--------|
| Beginner | `#1a0a0a` | `#ef4444` | `#ef4444` |
| Developing | `#1a1408` | `#fbbf24` | `#fbbf24` |
| Intermediate | `#0a1a0a` | `#4ade80` | `#4ade80` |
| Advanced | `#0a0a1a` | `#d4af37` | `#d4af37` |

### Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Display | Cormorant Garamond | 600 | 48-72px |
| Heading 1 | Outfit | 600 | 32px |
| Heading 2 | Outfit | 500 | 24px |
| Body | Outfit | 400 | 16px |
| Caption | Outfit | 400 | 14px |
| Mono | JetBrains Mono | 400 | 14px |

### Spacing

- Base unit: 4px
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px, 3xl: 64px

### Effects

- Border radius: 8px (cards), 4px (buttons), 50% (avatars)
- Shadows: `0 4px 24px rgba(0,0,0,0.4)` (elevated)
- Transitions: 200ms ease-out
- Hover: scale(1.02) + gold glow

---

## Route Structure

```
app/
├── page.tsx                      # Screen 1: Landing
├── layout.tsx                    # Global layout
├── assess/
│   ├── page.tsx                # Redirect /assess → /profile
│   ├── profile/
│   │   └── page.tsx           # Screen 2: Profile
│   ├── intelligence/
│   │   └── page.tsx           # Screen 3: Intelligence
│   ├── validate/
│   │   └── page.tsx           # Screen 4: Validation
│   ├── questions/
│   │   └── page.tsx           # Screen 5: Questions
│   └── generating/
│       └── page.tsx           # Screen 6: Generating
├── report/
│   └── [id]/
│       └── page.tsx           # Screen 7: Report
└── dashboard/
    └── [companyId]/
        └── page.tsx            # Screen 8: Dashboard

components/
├── ui/                         # Reusable UI components
│   ├── button.tsx            # Gold CTA buttons
│   ├── input.tsx            # Form inputs
│   ├── card.tsx             # Surface cards
│   ├── badge.tsx            # Tier badges
│   └── progress.tsx          # Progress ring
├── assess/                    # Assessment-specific
│   ├── header.tsx            # Sticky header
│   ├── profile-form.tsx      # Profile form
│   ├── intelligence-grid.tsx  # Scraped data grid
│   ├── validation-panel.tsx   # Validation UI
│   ├── question-card.tsx      # Question display
│   └── radar-chart.tsx       # 5-dimension radar
└── report/
    ├── score-ring.tsx        # Animated score
    ├── dimension-breakdown.tsx
    └── recommendations.tsx
```

---

## 8 Screens Detail

### Screen 1: Landing (`/`)

- Full-screen hero with gradient overlay
- Large display text: "Know where you stand. Know where to go."
- Gold CTA button: "Start Assessment"
- Animated particles/glow effect in background
- Stats row: "25 Questions • 15 Minutes • 5 Dimensions"

### Screen 2: Profile (`/assess/profile`)

- Minimal form card (centered, max-width: 480px)
- Gold underline inputs (premium feel)
- Fields: First Name, Last Name, Email, Job Title, Company
- "Continue" gold button

### Screen 3: Intelligence (`/assess/intelligence`)

- Animated orb/pulse in center
- 12 intelligence categories loading in sequence
- Each category: icon + name + status (loading ✓)
- "Collecting intelligence on your company..."

### Screen 4: Validation (`/assess/validate`) — MOST COMPLEX

- Grid layout: 3 columns
- Each intelligence card:
  - Category icon + name
  - Scraped data (expandable)
  - Confidence score (percentage)
  - Three buttons: ✓ Confirm (gold), ✎ Edit, ⚠ Flag
- User corrections saved in real-time
- "Continue to Assessment" gold button

### Screen 5: Questions (`/assess/questions`)

- Fixed header: Logo (left), Progress (right)
- Dimension pill: "🧠 AI Literacy — Q3 of 5"
- Question card (centered, max-width: 640px)
- Option cards (A-D) with hover glow
- Navigation: ← Back | Next →

### Screen 6: Generating (`/assess/generating`)

- Large animated gold orb
- 5 stages in sequence:
  1. "Analyzing your profile..."
  2. "Evaluating dimensions..."
  3. "Generating insights..."
  4. "Creating recommendations..."
  5. "Finalizing report..."

### Screen 7: Report (`/report/[id]`) — PREMIUM

- Score ring (animated counter, gold ring)
- Tier badge (colored based on tier)
- Radar chart (5 dimensions, gold fill)
- 11 report sections with expandable cards
- PDF download button (gold)

### Screen 8: Dashboard (`/dashboard/[companyId]`)

- Company header: Logo, name, cohort
- Stats row: Participants, Avg Score, Strongest Dimension
- Tier distribution chart
- Table: All participants with scores
- "Download Report" gold button

---

## State Management

```typescript
interface AssessmentState {
  id: string;
  stage: 'profile' | 'intelligence' | 'validate' | 'assess' | 'generating' | 'report';
  
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    jobTitle: string;
    company: string;
  };
  
  intelligence: {
    status: 'idle' | 'collecting' | 'completed';
    data: Record<string, {
      category: string;
      data: any;
      confidence: number;
      status: 'pending' | 'confirmed' | 'edited' | 'flagged';
    }>;
  };
  
  answers: Record<number, number>; // questionId → answerIndex
  
  scores: {
    d1: number; d2: number; d3: number; d4: number; d5: number;
  };
  tier: 'beginner' | 'developing' | 'intermediate' | 'advanced';
  report: ReportData | null;
}
```

---

## API Integration

```typescript
// lib/api.ts
const API_BASE = '/api';

export const assessment = {
  start: () => post('/assessment/start'),
  profile: (id: string, data: ProfileData) => put(`/assessment/${id}/profile`, data),
  intelligence: (id: string) => get(`/assessment/${id}/intelligence`),
  validate: (id: string, corrections: ValidationData) => 
    put(`/assessment/${id}/validate`, corrections),
  answer: (id: string, questionId: number, answer: number) =>
    put(`/assessment/${id}/answer`, { questionId, answer }),
  submit: (id: string) => post(`/assessment/${id}/submit`),
  report: (id: string) => get(`/assessment/${id}/report`),
};
```

---

## Premium Effects

### Gold Glow Button
```css
.gold-button {
  background: linear-gradient(135deg, #d4af37, #e5c76b);
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
  transition: all 200ms ease-out;
}
.gold-button:hover {
  transform: scale(1.02);
  box-shadow: 0 0 30px rgba(212, 175, 55, 0.5);
}
```

### Animated Score Ring
- SVG circle with stroke-dasharray animation
- Counter counts up from 0 to score
- Gold gradient stroke
- Glow effect on completion

### Background Effects
- Subtle gradient mesh: black → dark grey
- Floating gold particles (subtle)
- Card hover: lift + border glow

---

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|---------|
| Mobile | < 640px | Single column, stacked |
| Tablet | 640-1024px | 2 columns |
| Desktop | > 1024px | 3 columns, max-width: 1280px |

---

## Summary

| Screen | Complexity | Key Feature |
|--------|------------|-------------|
| Landing | Low | Premium hero |
| Profile | Low | Gold form inputs |
| Intelligence | Medium | Animated collection |
| **Validation** | **HIGH** | Grid editing |
| Questions | Medium | Smooth transitions |
| Generating | Low | Animated orb |
| Report | Medium | Score ring + radar |
| Dashboard | Medium | Data tables |

**Design:** Premium gold (#d4af37) on black (#0a0a0a), matching Excellere aesthetic.

