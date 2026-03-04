"""AI Compass Backend - Main Application"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import assessment, intelligence, validation, cohort, auth, payments

app = FastAPI(
    title="AI Compass API",
    description="AI Readiness Diagnostic Platform API",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(assessment.router)
app.include_router(intelligence.router)
app.include_router(validation.router)
app.include_router(cohort.router)
app.include_router(auth.router)
app.include_router(payments.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "AI Compass API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}
