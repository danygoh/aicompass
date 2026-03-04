# AI Compass

**Brand:** AI Native Foundation  
**Tagline:** "Know where you stand. Know where to go."

---

## What It Is

AI readiness diagnostic platform — assess AI capability at individual and organisation level.

---

## Products

### Product 1: Individual Assessment
- 25-question web-based diagnostic (15-20 min)
- 5 dimensions: AI Literacy, Data Readiness, Workflow Integration, Governance & Risk, Strategic Alignment
- Personalised AI-generated report
- Tier: Beginner / Developing / Intermediate / Advanced

### Product 2: Company Dashboard
- Aggregates individual results into company-wide report
- Cohort management with cohort codes

### Product 3: Benchmark (Future)
- Industry comparison and benchmarking

---

## 8 Screens / 5 Stages

| Screen | Route | Stage |
|--------|-------|-------|
| 1. Landing | `/` | — |
| 2. Profile | `/assess/profile` | 1 |
| 3. Intelligence Collection | `/assess/intelligence` | 2 |
| 4. Validation Panel | `/assess/validate` | 3 |
| 5. Assessment | `/assess/questions` | 4 |
| 6. Generating | `/assess/generating` | 5 |
| 7. Report | `/report/:assessmentId` | 5 |
| 8. Dashboard | `/dashboard/:companyId` | — |

---

## 12 Intelligence Categories

1. LinkedIn Profile
2. Company Website
3. News & Press
4. Industry Reports
5. Regulatory Landscape
6. Company Financials
7. Technology Stack
8. Team Structure
9. AI/ML Initiatives
10. Competitors
11. Partnerships
12. Job Postings

---

## Current Status

**UI Complete** — in `public/ui/`:
- assessment.html — Individual assessment (screens 1-7)
- company-dashboard.html — Company aggregation (screen 8)

**Awaiting:** Backend implementation (8 screens)

---

## URL

**Production:** https://excellere.ai/aicompass

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| Queue | Redis |
| AI | Anthropic Claude |

---

## Files

```
aicompass/
├── docs/
│   ├── SPEC.md           # Product specification (v2)
│   └── ARCHITECTURE.md  # Technical architecture
├── public/ui/
│   ├── assessment.html       # Individual assessment UI
│   └── company-dashboard.html
├── app/                  # Next.js app (future)
├── components/           # React components (future)
└── lib/                 # Utilities (future)
```

---

## Brand

**AI Native Foundation** — the parent brand for this product.

