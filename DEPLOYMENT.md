# AI Compass - Vercel Deployment (Single Service)

## You're Already on Vercel with Excellere!

Just add AI Compass to the same Vercel project.

---

## Step-by-Step

### 1. Push to GitHub
```bash
cd ~/danny-projects/aicompass
git init
git add .
git commit -m "AI Compass v1.0 - Complete"
git remote add origin https://github.com/YOUR_USERNAME/aicompass.git
git push -u origin main
```

### 2. Add to Vercel
1. Go to https://vercel.com/your-excellere-project
2. Add new project → Import `aicompass`
3. Settings:
   - Framework: Next.js
   - Root Directory: `aicompass-web`
4. Environment Variables:
   ```
   DATABASE_URL=postgresql://neondb_owner:...@neon.tech/neondb
   ANTHROPIC_API_KEY=sk-ant-api03-...
   TAVILY_API_KEY=tvly-...
   RESEND_API_KEY=re_...
   STRIPE_API_KEY=sk_test_...  (add later)
   ```
5. Deploy!

---

## What Happens

Vercel builds:
- `aicompass-web/` → Frontend (Next.js) → yourapp.vercel.app
- `aicompass-backend/` → API (Python via Vercel Serverless) → yourapp.vercel.app/api

---

## Need: Only GitHub + Vercel

| Service | Already Have? |
|---------|---------------|
| GitHub | Yes |
| Vercel | Yes (Excellere) |
| Neon DB | Yes (configured) |
| Stripe | Need key only |

---

## Only thing needed:
- **Stripe key** → Get from https://dashboard.stripe.com/test/apikeys

---

Ready to deploy? Just say the word and I'll push to GitHub! 🚀
