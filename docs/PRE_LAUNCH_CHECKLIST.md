# AI Compass — Pre-Launch CTO Checklist

**Last Updated:** 2026-03-03

---

## 1. RISKS & MITIGATION

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-------------|
| **Claude API fails** | Medium | High | Static fallback template, retry 3x |
| **Web scraping blocked** | Medium | Medium | Multiple sources, manual override option |
| **Rate limiting** | Medium | Medium | Redis queue, exponential backoff |
| **Database cost** | Low | Medium | Neon serverless scales automatically |
| **Security breach** | Low | Critical | Encrypt PII, JWT, rate limiting |
| **GDPR non-compliance** | Low | High | Consent gates, data deletion |
| **User drop-off** | High | Medium | Keep assessment under 20 min |
| **Payment fails** | Low | High | Stripe webhooks, retry logic |

---

## 2. DEPENDENCIES & DEPENDENCY MANAGEMENT

| Service | Status | Owner | Notes |
|--------|--------|--------|-------|
| Neon PostgreSQL | ✅ Ready | Danny | Connection string saved |
| Anthropic Claude | ✅ Ready | Danny | API key saved |
| Tavily API | ✅ Ready | Danny | API key saved |
| Resend Email | ✅ Ready | Danny | API key saved |
| Stripe | ⏳ Later | Danny | Need account |
| Vercel | ⏳ Need | Max | Deploy frontend |

### External API Failure Plans

| API | Failure Impact | Fallback |
|-----|----------------|----------|
| Claude | No AI report | Static template |
| Tavily | No intelligence | Skip Stage 2, manual entry |
| Stripe | No payments | Free tier only |
| Resend | No email | Show on screen only |

---

## 3. SECURITY CHECKLIST

- [ ] PII encrypted at rest (AES-256)
- [ ] JWT tokens with refresh
- [ ] Rate limiting (100 req/min)
- [ ] Input sanitization (XSS prevention)
- [ ] HTTPS only
- [ ] CORS configured
- [ ] Environment variables NOT in code
- [ ] No API keys in git
- [ ] GDPR consent gates
- [ ] Data deletion endpoint
- [ ] Individual data NEVER shared with company

---

## 4. ARCHITECTURE DECISIONS

| Decision | Choice | Rationale |
|----------|--------|------------|
| Auth | JWT + refresh | Stateless, scales |
| Database | Neon PostgreSQL | Serverless, cost-effective |
| Queue | Redis (Upstash) | Simple, works with Vercel |
| Frontend | Next.js 14 | SEO, performance |
| Payments | Stripe | Industry standard |
| Email | Resend | Free tier, easy API |

---

## 5. PHASE 1 CRITICAL PATH

Before Phase 2, we must have:
- [ ] Project initialized (Next.js + FastAPI)
- [ ] Database schema deployed
- [ ] Auth working (register, login)
- [ ] Profile form → database
- [ ] Basic landing page

---

## 6. GOTCHAS & LESSONS LEARNED

| Gotcha | Lesson |
|--------|--------|
| Don't hardcode API keys | Use .env |
| Don't skip .gitignore | Exclude node_modules, .env |
| Don't forget CORS | Frontend/backend on different ports |
| Don't use sync AI calls | Always async queue |
| Don't store plain PII | Encrypt emails, names |
| Don't skip rate limiting | Will get abused |

---

## 7. BUDGET ESTIMATES

| Item | Monthly Cost (100 users) |
|------|------------------------|
| Neon | $0-10 |
| Vercel | $0-20 |
| Claude API | $200-400 |
| Tavily | $50-100 |
| Resend | $0 (free tier) |
| **Total** | **$250-530/mo** |

Scale to 1,000 users: ~$2,000-4,000/mo

---

## 8. WHAT COULD GO WRONG

### Phase 1 Issues
- Neon connection fails → check credentials
- Next.js build fails → check dependencies
- Auth doesn't work → check JWT secret

### Phase 2 Issues
- Questions don't save → check database schema
- Scoring wrong → verify calculation logic

### Phase 3 Issues
- Tavily blocked → have fallback manual entry
- Scraping slow → parallelize requests

### Phase 4 Issues
- Claude times out → fallback to static template
- Report incomplete → have QA checklist

---

## 9. SUCCESS METRICS

| Metric | Target |
|--------|--------|
| Assessment completion rate | > 70% |
| Report generation time | < 30s |
| Uptime | > 99% |
| User satisfaction | > 4/5 |
| Cost per assessment | < $0.50 |

---

## 10. QUESTIONS FOR DANNY

1. **Timeline:** Is 18-24 weeks realistic given your availability?
2. **Budget:** Are you comfortable with $250-500/mo at launch?
3. **Content:** Who writes the 25 questions? (Need from you/Ian)
4. **Branding:** Is "AI Native Foundation" finalized or could change?
5. **Users:** Who are the first beta users?

---

## 11. FINAL GO/NO-GO

| Item | Status |
|------|--------|
| Spec finalized | ✅ Yes |
| Team aligned | ✅ Yes |
| Resources ready | ✅ 4/5 (Stripe later) |
| Budget approved | ⏳ Need confirmation |
| Questions ready | ⏳ Need from Danny/Ian |

---

**Recommendation:** ✅ PROCEED with Phase 1

**Blockers:** Need 25 questions, need budget confirmation

