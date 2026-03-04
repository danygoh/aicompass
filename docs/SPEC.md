# AI Compass — Product Specification

**Version:** 2.0  
**Brand:** AI Native Foundation  
**Date:** 2026-03-03

---

## Product Name

**AI Compass** — "Know where you stand. Know where to go."

---

## Products

### Product 1: Individual Assessment
25-question web-based diagnostic (15-20 min). Assess AI readiness at individual level.

### Product 2: Company Dashboard
Aggregates individual results into company-wide report with cohort management.

### Product 3: Benchmark (Future)
Industry comparison and benchmarking.

---

## 5 Stages (Product Spec Names)

| Stage | Description |
|-------|-------------|
| 1. **Profile** | User enters basic info (name, email, role, company) |
| 2. **Intelligence** | Web research on participant's background, company, industry (12 categories) |
| 3. **Validate** | Participants review/validate scraped intelligence data |
| 4. **Assess** | 25-question diagnostic across 5 dimensions |
| 5. **Report** | AI-generated comprehensive report |

---

## 8 Screens (UI Implementation)

| # | Route | Screen | Maps to Stage |
|---|-------|--------|---------------|
| 1 | `/` | Landing | — |
| 2 | `/assess/profile` | Profile Input | Stage 1 |
| 3 | `/assess/intelligence` | Intelligence Collection | Stage 2 |
| 4 | `/assess/validate` | Intelligence Validation Panel | Stage 3 |
| 5 | `/assess/questions` | Assessment (25 questions) | Stage 4 |
| 6 | `/assess/generating` | Generating Report | Stage 5 |
| 7 | `/report/:assessmentId` | AI Compass Report | Stage 5 |
| 8 | `/dashboard/:companyId` | Company Dashboard | — |

---

## Stage → Screen Mapping

| Stage | Screen(s) | Notes |
|-------|-----------|-------|
| 1. Profile | Screen 2 | Basic info collection |
| 2. Intelligence | Screen 3 | Web research on 12 categories |
| 3. Validate | Screen 4 | **Most complex** - user reviews/validates scraped data |
| 4. Assess | Screen 5 | 25 questions |
| 5. Report | Screens 6 + 7 | Generating + final report |

---

## 12 Intelligence Categories

Web research captures data across:

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

## 5 Dimensions

| ID | Dimension | What it measures | Max Score |
|----|-----------|------------------|-----------|
| D1 | AI Literacy | Understanding of AI concepts, LLMs, prompt quality | 20 |
| D2 | Data Readiness | Quality, accessibility, governance of data for AI | 20 |
| D3 | Workflow Integration | AI tool adoption, enterprise system integration | 20 |
| D4 | Governance & Risk | AI policy maturity, explainability, compliance | 20 |
| D5 | Strategic Alignment | Leadership mandate, ethics, competitive urgency | 20 |

**Total Score:** 25-100 (5 dimensions × 20)

---

## Tier System

| Tier | Score Range | Label | Color |
|------|-------------|-------|-------|
| T1 | 25-44 | Beginner | Red (#FDECEA) |
| T2 | 45-62 | Developing | Amber (#FFF3E0) |
| T3 | 63-80 | Intermediate | Green (#E8F5E9) |
| T4 | 81-100 | Advanced | Navy (#E3EBF5) |

---

## Report Structure (11 Sections)

| Section | Content |
|---------|---------|
| A | Header & Score Card |
| B | Executive Summary |
| C | Intelligence Context |
| D | Dimension Deep Dive (×5) |
| E | Priority Recommendations |
| F | Learning Pathway |
| G | Risk Assessment |
| H | Competitor Comparison |
| I | Industry Benchmark |
| J | Action Plan |
| K | Next Steps |

---

## Data Model

### companies

```sql
id UUID PRIMARY KEY
name VARCHAR(255)
industry VARCHAR(100)
country VARCHAR(100)
cohort_name VARCHAR(255)
cohort_code VARCHAR(50) UNIQUE
created_at TIMESTAMP
updated_at TIMESTAMP
```

### users

```sql
id UUID PRIMARY KEY
email VARCHAR(255) UNIQUE
password_hash VARCHAR(255)
role VARCHAR(20) -- individual, company_admin, super_admin
company_id UUID REFERENCES companies(id)
created_at TIMESTAMP
```

### assessments

```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
company_id UUID REFERENCES companies(id)
stage VARCHAR(20) -- profile, intelligence, validate, assess, report
status VARCHAR(20)

-- Intelligence (Stage 2)
intelligence_data JSONB -- scraped data from 12 categories
intelligence_status VARCHAR(20) -- collecting, completed

-- Validation (Stage 3)
intelligence_validated BOOLEAN -- stage 3 validation
validation_data JSONB -- user corrections

-- Dimension scores
score_d1 SMALLINT
score_d2 SMALLINT
score_d3 SMALLINT
score_d4 SMALLINT
score_d5 SMALLINT
score_total SMALLINT
tier VARCHAR(20)

-- Report (Stage 5)
report JSONB -- 11 sections

started_at TIMESTAMP
completed_at TIMESTAMP
```

### intelligence_snapshots

```sql
id UUID PRIMARY KEY
assessment_id UUID REFERENCES assessments(id)
category VARCHAR(50) -- 12 categories
source_url TEXT
scraped_data JSONB
confidence_score DECIMAL(3,2)
validated BOOLEAN
validated_at TIMESTAMP
user_corrections JSONB
```

---

## Privacy & Security

- PII encrypted at rest
- Individual results NEVER shared with company without consent
- Minimum cohort size: 5 before company analytics unlock
- GDPR compliant
- Rate limiting on API

---

## Pricing Tiers

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | Basic assessment + static report |
| Pro | $29 | Full AI-generated report + history |
| Team | $199+ | Pro + company dashboard + bulk codes |

---

## Status

**UI Complete** — in `public/ui/`

**Awaiting:** Backend implementation (8 screens)

---

## URL

**Production:** https://excellere.ai/aicompass

