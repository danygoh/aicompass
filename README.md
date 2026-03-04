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


---

## Lessons Learned (March 2025)

### Development Best Practices

1. **Always analyze first** - Don't rush to fix. Understand the root cause before applying changes.

2. **Test the full flow** - Individual parts may work, but the end-to-end flow reveals issues.

3. **Don't break existing features** - Quick fixes to one area can break another. Always verify other parts still work.

4. **Next.js 16 specifics**:
   - `useParams()` in client components works fine (no need for async/await)
   - Turbopack has issues with regex containing escaped characters inside JSX maps - use string parsing instead

5. **Frontend/backend data mismatch** - Always verify what the backend returns vs what the frontend expects.

6. **Database connections drop** - Neon DB SSL connections can drop; may need to restart backend.

7. **Commit frequently** - Small, tested commits are easier to track and rollback if needed.

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Rendered more hooks than during previous render" | Don't use conditional rendering with hooks; use CSS classes instead |
| "Unterminated regexp literal" in turbopack | Use string parsing instead of regex with escaped chars |
| Validation page button not navigating | Use `window.location.href` instead of React Router |
| Generating page stuck | Check status only, not `assessment.report` field |
| Neon DB connection dropped | Restart backend |

