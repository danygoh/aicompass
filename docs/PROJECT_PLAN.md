# AI Compass — Project Plan

**Brand:** AI Native Foundation  
**Version:** 2.0  
**Last Updated:** 2026-03-03

---

## Executive Summary

Build a full-stack AI readiness assessment platform with 8 screens, 5 stages, 12 intelligence categories, and AI-generated reports.

---

## Project Scope

### Products
1. **Individual Assessment** — 25-question diagnostic
2. **Company Dashboard** — Aggregated company reports
3. **Benchmark** — (Future)

### Technical Requirements
- 8 screens (Next.js)
- 5 stages flow
- 12 intelligence categories (web scraping)
- AI-generated reports (Claude)
- PostgreSQL database
- Redis queue
- Payment integration

---

## Technical Architecture

### Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14 (App Router) |
| Backend | FastAPI (Python) |
| Database | PostgreSQL (Neon/Supabase) |
| Queue | Redis (Upstash) |
| AI | Anthropic Claude API |
| Search | Tavily/Brave API |
| Email | Resend |
| Payments | Stripe |
| Hosting | Vercel |
| Auth | JWT |

---

## Infrastructure Plan

### 1. Database Schema

```sql
-- Core tables
users
companies  
assessments
intelligence_snapshots
company_reports
```

### 2. API Layer

```
/api
├── /auth
│   ├── register
│   ├── login
│   └── refresh
├── /assessment
│   ├── start
│   ├── profile
│   ├── intelligence
│   ├── validate
│   ├── answer
│   ├── submit
│   └── report
├── /company
│   ├── create
│   ├── cohort
│   └── analytics
└── /webhook
    ├── stripe
    └── resend
```

### 3. Queue Workers

- Intelligence scraper (12 categories)
- Report generator (Claude)
- Email notifier

---

## Build Phases

### Phase 1: Foundation (Weeks 1-4)

| Week | Deliverable |
|------|-------------|
| 1 | Project setup, Next.js + FastAPI skeleton |
| 2 | Database schema, migrations |
| 3 | Auth system (register, login, JWT) |
| 4 | Profile screen + API |

### Phase 2: Assessment Core (Weeks 5-8)

| Week | Deliverable |
|------|-------------|
| 5 | Question UI (25 questions, 5 dimensions) |
| 6 | Scoring logic, tier calculation |
| 7 | Report display (static template) |
| 8 | User dashboard (view history) |

### Phase 3: Intelligence (Weeks 9-12)

| Week | Deliverable |
|------|-------------|
| 9 | Web scraping service (12 categories) |
| 10 | Intelligence Collection screen |
| 11 | Validation Panel (most complex) |
| 12 | User corrections flow |

### Phase 4: AI Reports (Weeks 13-16)

| Week | Deliverable |
|------|-------------|
| 13 | Claude integration setup |
| 14 | Report generation queue |
| 15 | 11-section report template |
| 16 | Email delivery |

### Phase 5: Company Dashboard (Weeks 17-20)

| Week | Deliverable |
|------|-------------|
| 17 | Cohort management |
| 18 | Aggregation logic |
| 19 | Company Dashboard UI |
| 20 | Company report generation |

### Phase 6: Payments & Launch (Weeks 21-24)

| Week | Deliverable |
|------|-------------|
| 21 | Stripe integration |
| 22 | Bulk codes (B2B) |
| 23 | Testing & QA |
| 24 | Launch |

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Claude API fails | Medium | High | Static fallback template |
| Rate limiting | Medium | Medium | Queue with retry |
| Web scraping blocked | Medium | Medium | Multiple sources fallback |
| DB scaling | Low | High | Use Neon (serverless) |
| Payment issues | Low | High | Stripe webhook + reconciliation |

---

## Security Checklist

- [ ] JWT with refresh tokens
- [ ] Rate limiting (100 req/min)
- [ ] Input sanitization
- [ ] PII encryption at rest
- [ ] HTTPS only
- [ ] GDPR compliance (consent, deletion)
- [ ] Company/individual data separation

---

## Dependencies

### Frontend
```json
{
  "next": "14.x",
  "react": "18.x",
  "typescript": "5.x",
  "stripe": "14.x"
}
```

### Backend
```json
{
  "fastapi": "0.109.x",
  "sqlalchemy": "2.0.x",
  "psycopg2": "2.9.x",
  "redis": "5.0.x",
  "anthropic": "0.18.x",
  "pydantic": "2.5.x"
}
```

---

## Environment Variables

```bash
# Database
DATABASE_URL=neondb_owner@...

# Redis
REDIS_URL=redis://...

# Auth
JWT_SECRET=...
JWT_REFRESH_SECRET=...

# External APIs
ANTHROPIC_API_KEY=sk-ant-...
TAVILY_API_KEY=...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=https://excellere.ai/aicompass
```

---

## Monitoring

| Metric | Tool |
|--------|------|
| Errors | Sentry |
| Performance | Vercel Analytics |
| Uptime | UptimeRobot |
| API Usage | Custom logs |
| Costs | Stripe + Claude dashboard |

---

## Next Steps

1. **Initialize project** — Next.js + FastAPI
2. **Set up Neon PostgreSQL** — Create database
3. **Configure Vercel** — Deploy frontend
4. **Set up Claude API** — Get key
5. **Begin Phase 1** — Foundation

---

## Resources Required

| Resource | Notes |
|----------|-------|
| Neon account | PostgreSQL |
| Anthropic API | Claude for reports |
| Tavily API | Web scraping |
| Stripe account | Payments |
| Resend | Email (3k free/mo) |
| Vercel | Hosting |

---

**Total Timeline:** 18-24 weeks  
**MVP Target:** 12 weeks (Phases 1-4)

