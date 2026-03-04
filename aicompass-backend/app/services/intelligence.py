"""AI Compass - Intelligence Collection Service"""
import tavily
from app.config import get_settings
from datetime import datetime

settings = get_settings()

# 12 categories to search
INTELLIGENCE_CATEGORIES = [
    {"id": "company_overview", "query": "{company_name} company overview about", "label": "Company Overview"},
    {"id": "ai_initiatives", "query": "{company_name} AI artificial intelligence initiatives strategy", "label": "AI Initiatives"},
    {"id": "news", "query": "{company_name} recent news 2024 2025", "label": "News & Media"},
    {"id": "financials", "query": "{company_name} financial performance revenue funding", "label": "Financials"},
    {"id": "leadership", "query": "{company_name} leadership team CEO executives", "label": "Leadership"},
    {"id": "products", "query": "{company_name} products services offerings", "label": "Products & Services"},
    {"id": "competitors", "query": "{company_name} competitors market share", "label": "Competitors"},
    {"id": "partnerships", "query": "{company_name} partnerships collaborations", "label": "Partnerships"},
    {"id": "regulatory", "query": "{company_name} regulatory compliance legal", "label": "Regulatory"},
    {"id": "tech_stack", "query": "{company_name} technology stack tech", "label": "Tech Stack"},
    {"id": "culture", "query": "{company_name} culture values workplace", "label": "Culture"},
    {"id": "hiring", "query": "{company_name} hiring jobs recruitment", "label": "Hiring & Growth"},
]


def collect_intelligence(company_name: str, industry: str = None) -> dict:
    """Collect intelligence for a company using Tavily"""
    
    if not company_name:
        return {"success": False, "error": "Company name required"}
    
    client = tavily.TavilyClient(api_key=settings.tavily_api_key)
    
    results = {
        "company_name": company_name,
        "industry": industry,
        "collected_at": datetime.utcnow().isoformat(),
        "categories": {}
    }
    
    # Build search query with industry context
    base_query = company_name
    if industry:
        base_query = f"{company_name} {industry}"
    
    for category in INTELLIGENCE_CATEGORIES:
        query = category["query"].format(company_name=company_name)
        
        try:
            # Search Tavily
            response = client.search(
                query=query,
                max_results=5,
                include_answer=True,
                include_raw_content=False
            )
            
            results["categories"][category["id"]] = {
                "label": category["label"],
                "query": query,
                "results": [
                    {
                        "title": r.get("title", ""),
                        "url": r.get("url", ""),
                        "content": r.get("content", "")[:500],  # Truncate for storage
                    }
                    for r in response.get("results", [])
                ],
                "answer": response.get("answer", "")[:500] if response.get("answer") else None,
            }
            
        except Exception as e:
            results["categories"][category["id"]] = {
                "label": category["label"],
                "error": str(e),
                "results": []
            }
    
    # Add overall status
    successful = sum(1 for cat in results["categories"].values() if "error" not in cat)
    results["status"] = "completed" if successful > 0 else "failed"
    results["successful_categories"] = successful
    results["total_categories"] = len(INTELLIGENCE_CATEGORIES)
    
    return results


def get_intelligence_summary(intelligence_data: dict) -> str:
    """Generate a brief summary of collected intelligence"""
    if not intelligence_data or intelligence_data.get("status") == "failed":
        return "No intelligence data available."
    
    summary_parts = []
    
    # Company overview
    if "company_overview" in intelligence_data.get("categories", {}):
        cat = intelligence_data["categories"]["company_overview"]
        if cat.get("answer"):
            summary_parts.append(f"Overview: {cat['answer'][:200]}")
    
    # AI initiatives
    if "ai_initiatives" in intelligence_data.get("categories", {}):
        cat = intelligence_data["categories"]["ai_initiatives"]
        if cat.get("answer"):
            summary_parts.append(f"AI: {cat['answer'][:200]}")
    
    # News
    if "news" in intelligence_data.get("categories", {}):
        cat = intelligence_data["categories"]["news"]
        if cat.get("results"):
            news_titles = [r["title"] for r in cat["results"][:3]]
            summary_parts.append(f"Recent news: {', '.join(news_titles)}")
    
    return " | ".join(summary_parts) if summary_parts else "Intelligence collected successfully."
