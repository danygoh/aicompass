# AI Compass v1.0 - Implementation Plan
## 30-Day Launch Timeline

---

## Phase 0: Database & Auth Setup (Days 1-3)

### Day 1: Schema + Project Setup
- [x] Create Prisma schema with all tables
- [x] Set up Next.js project with TypeScript
- [x] Install dependencies (NextAuth, Prisma, Recharts)
- [x] Configure design system (CSS variables)

### Day 2: Database + Auth
- [x] Set up Neon database connection
- [x] Create Prisma migrations
- [x] Configure NextAuth.js with credentials provider
- [x] Build auth API routes

### Day 3: Core Infrastructure
- [x] Create user registration/login UI (API done)
- [x] Set up protected routes
- [x] Create shared components (Navigation, ProgressBar)

---

## Phase 1: Foundation (Days 4-7)

### Day 4-5: Data Layer
- [ ] Build 75-question bank (questions.ts)
- [ ] Build 12 intelligence categories (intelligence.ts)
- [ ] Create scoring logic (scoring.ts)
- [ ] Create cohort management

### Day 6-7: Screens Setup
- [ ] Create 10-screen directory structure
- [ ] Build shared layout component
- [ ] Implement screen navigation (goTo pattern)

---

## Phase 2: User Flow Screens (Days 8-14)

### Day 8-9: Landing + Profile
- [ ] Landing page (match v1.0 exactly)
- [ ] Profile form (9 fields)
- [ ] Profile validation

### Day 10-11: Intelligence Collection
- [ ] Intelligence API route (Claude integration)
- [ ] Collection screen with animation
- [ ] Fallback logic

### Day 12-14: Validation + Assessment
- [ ] Validation UI (confirm/edit/flag)
- [ ] Question rendering (75 questions)
- [ ] Adaptive variant selection
- [ ] Progress tracking

---

## Phase 3: Payment + Report (Days 15-21)

### Day 15-17: Paywall
- [ ] Paywall screen
- [ ] Score teaser display
- [ ] Cohort code validation
- [ ] Payment form (simulated)

### Day 18-21: Report Generation
- [ ] Generate screen with animation
- [ ] Report API route
- [ ] 11-section report rendering
- [ ] Radar chart + score ring

---

## Phase 4: Admin Dashboard (Days 22-26)

### Day 22-24: Admin Features
- [ ] Admin login
- [ ] Dashboard overview (KPIs)
- [ ] User management

### Day 25-26: Cohort Management
- [ ] Cohort CRUD operations
- [ ] Analytics/Reporting
- [ ] Settings page

---

## Phase 5: Polish + Launch (Days 27-30)

### Day 27-28: Testing
- [ ] End-to-end testing
- [ ] Bug fixes

### Day 29-30: Launch
- [ ] Final QA
- [ ] Deploy to production
- [ ] Monitor + fixes

---

## File Structure

```
aicompass-web/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (main)/
│   │   │   ├── page.tsx              # Landing
│   │   │   ├── assess/
│   │   │   │   ├── profile/page.tsx
│   │   │   │   ├── collect/page.tsx
│   │   │   │   ├── validate/page.tsx
│   │   │   │   ├── questions/page.tsx
│   │   │   │   ├── paywall/page.tsx
│   │   │   │   ├── generate/page.tsx
│   │   │   │   └── report/[id]/page.tsx
│   │   │   └── admin/
│   │   │       ├── page.tsx           # Dashboard
│   │   │       ├── users/page.tsx
│   │   │       ├── cohorts/page.tsx
│   │   │       └── settings/page.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── intelligence/route.ts
│   │       ├── report/route.ts
│   │       └── cohorts/route.ts
│   ├── components/
│   ├── lib/
│   ├── data/
│   └── types/
├── public/
└── styles/
```

---

## Dependencies

```json
{
  "dependencies": {
    "next": "^15.x",
    "react": "^19.x",
    "@prisma/client": "^6.x",
    "next-auth": "^4.x",
    "bcryptjs": "^2.x",
    "recharts": "^2.x",
    "framer-motion": "^11.x",
    "zustand": "^5.x"
  },
  "devDependencies": {
    "prisma": "^6.x",
    "typescript": "^5.x",
    "@types/node": "^20.x",
    "@types/react": "^19.x",
    "@types/bcryptjs": "^2.x"
  }
}
```

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:9000"

# API Keys
ANTHROPIC_API_KEY="sk-ant-..."
RESEND_API_KEY="re_..."
TAVILY_API_KEY="tvly-..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:9000"
```
