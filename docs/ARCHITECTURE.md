# AI Compass — Technical Architecture

**Brand:** AI Native Foundation  
**Version:** 2.0  
**Date:** 2026-03-03

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│                  (Next.js / Vercel)                  │
├─────────────────────────────────────────────────────┤
│                      API                              │
│                 (FastAPI / Python)                   │
├──────────┬──────────┬──────────┬───────────────────┤
│ Database │   Queue  │ External │   Background       │
│   (PG)   │  (Redis) │   APIs   │   Workers         │
├──────────┴──────────┴──────────┴───────────────────┤
│                    SERVICES                          │
│     Claude · Web Search · Stripe · Resend            │
└─────────────────────────────────────────────────────┘
```

---

## 2. The 8 Screens / 5 Stages

| Screen | Route | Stage | Backend Logic |
|--------|-------|-------|---------------|
| 1. Landing | `/` | — | Static |
| 2. Profile | `/assess/profile` | 1 | Save user profile to DB |
| 3. Intelligence Collection | `/assess/intelligence` | 2 | Scrape 12 sources (Tavily/Brave) |
| 4. Validation Panel | `/assess/validate` | 3 | Display scraped data, user validates/corrects |
| 5. Assessment | `/assess/questions` | 4 | Save answers, calculate scores |
| 6. Generating | `/assess/generating` | 5 | Queue AI report generation |
| 7. Report | `/report/:id` | 5 | Display AI-generated report |
| 8. Dashboard | `/dashboard/:companyId` | — | Aggregated analytics |

---

## 3. Intelligence Collection (Screen 3)

**Stage 2: Intelligence**

- Triggered after Profile submission
- Backend scrapes 12 categories in parallel
- Categories: LinkedIn, Company Website, News, Industry Reports, Regulatory, Financials, Tech Stack, Team Structure, AI Initiatives, Competitors, Partnerships, Job Postings
- Each source gets a confidence score
- Results stored in `intelligence_snapshots` table

---

## 4. Validation Panel (Screen 4)

**Stage 3: Validate**

Most complex screen in the product.

- Display all scraped intelligence
- User can: confirm, edit, flag errors
- User corrections stored in `validation_data`
- Must complete validation before proceeding to assessment

---

## 5. Report Generation (Critical Path)

### Challenge

- Claude API: 10-30s latency
- Rate limits: ~50-100 req/min
- Cost: $0.05-0.10 per report
- Concurrent users: variable

### Solution: Async Queue

```
User completes validation → Save to DB (status: intelligence_validated)
                                    ↓
                             Redis Queue
                                    ↓
                       Worker scrapes remaining data
                                    ↓
                       User completes assessment
                                    ↓
                             Queue report job
                                    ↓
                       Claude API (with retry)
                                    ↓
                       Save report to DB
                                    ↓
                       Send email notification
                                    ↓
                       User views report
```

### Stability Patterns

| Pattern | Implementation |
|---------|----------------|
| Retry | 3 attempts with exponential backoff |
| Circuit Breaker | Pause if 10 failures in 1 minute |
| Fallback | Static template if AI fails |
| Timeout | 25s max, then fallback |

---

## 6. Cost Projections

| Daily Users | Monthly Reports | Monthly Cost |
|-------------|-----------------|--------------|
| 100 | 3,000 | $240-450 |
| 1,000 | 30,000 | $2,400-4,500 |
| 10,000 | 300,000 | $24,000-45,000 |

---

## 7. Authentication

| Role | Access |
|------|--------|
| Individual | Take assessment, view own report |
| Company Admin | Manage cohort, view company analytics |
| Super Admin | All companies, system settings |

---

## 8. Security

- PII encrypted at rest (AES-256)
- TLS in transit
- JWT authentication
- Rate limiting (100 req/min)
- GDPR compliant

---

## 9. Privacy Model

**Critical Rule:** Individual results NEVER shared with company without explicit consent.

- Individual results stored separately from PII
- Company dashboard shows ONLY aggregated data
- Minimum cohort size: 5 (prevents reverse-engineering)

---

## 10. API Endpoints

### Assessment

| Method | Endpoint | Screen | Stage |
|--------|----------|--------|-------|
| POST | /api/assessment/start | 2 | 1 |
| GET | /api/assessment/:id | — | — |
| PUT | /api/assessment/:id/profile | 2 | 1 |
| POST | /api/assessment/:id/intelligence | 3 | 2 |
| GET | /api/assessment/:id/intelligence | 3 | 2 |
| PUT | /api/assessment/:id/validate | 4 | 3 |
| PUT | /api/assessment/:id/answer | 5 | 4 |
| POST | /api/assessment/:id/submit | 6 | 5 |
| GET | /api/assessment/:id/report | 7 | 5 |

### Users

| Method | Endpoint |
|--------|----------|
| POST | /api/auth/register |
| POST | /api/auth/login |
| POST | /api/auth/refresh |
| GET | /api/user/me |

### Company

| Method | Endpoint |
|--------|----------|
| POST | /api/company |
| GET | /api/company/:id |
| POST | /api/company/:id/cohort |
| GET | /api/company/:id/analytics |

---

## 11. External Integrations

| Service | Purpose |
|---------|---------|
| Anthropic Claude | Report generation |
| Tavily/Brave | Web scraping (12 intelligence categories) |
| Stripe | Payments |
| Resend | Email delivery |
| S3 | PDF storage |

---

## 12. Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| Queue | Redis |
| AI | Anthropic Claude |
| Search | Tavily/Brave |
| Email | Resend |
| Payments | Stripe |
| Hosting | Vercel |

---

## 13. Build Phases

| Phase | Focus | Screens | Duration |
|-------|-------|---------|----------|
| 1 | Core: Profile + Questions + Scoring | 1, 2, 5, 7 | 3-4 weeks |
| 2 | Intelligence: Web scraping 12 categories | 3 | 3-4 weeks |
| 3 | Validation: User review UI | 4 | 2-3 weeks |
| 4 | AI Reports: Claude integration | 6 | 2-3 weeks |
| 5 | Company Dashboard + Cohorts | 8 | 3-4 weeks |
| 6 | Payments + Bulk Codes | — | 2-3 weeks |

---

## 14. Dependencies

```json
{
  "fastapi": "^0.109.0",
  "sqlalchemy": "^2.0",
  "psycopg2": "^2.9",
  "redis": "^5.0",
  "anthropic": "^0.18",
  "pydantic": "^2.5",
  "python-jose": "^3.3",
  "passlib": "^1.7",
  "stripe": "^14.0",
  "resend": "^2.0"
}
```

---

## 15. Monitoring

| Metric | Tool |
|--------|------|
| Errors | Sentry |
| Performance | Vercel Analytics |
| Uptime | UptimeRobot |
| API Usage | Custom logs |
| Costs | Stripe Dashboard |

---

Last updated: 2026-03-03

