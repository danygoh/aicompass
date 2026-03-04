"""AI Compass - Claude Report Generation Service"""
import anthropic
from app.config import get_settings

settings = get_settings()


def generate_ai_report(assessment_data: dict) -> dict:
    """Generate personalized AI report using Claude"""
    
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    
    # Defensive: ensure dimensions exists
    dimensions = assessment_data.get('dimensions', [])
    if not dimensions:
        return generate_fallback_report(assessment_data)
    
    sorted_dims = sorted(dimensions, key=lambda x: x.get('score', 0))
    
    strongest = sorted_dims[-1]['label'] if sorted_dims else "N/A"
    weakest = sorted_dims[0]['label'] if sorted_dims else "N/A"
    
    # Build dimension scores text
    dim_scores = "\n".join([
        f"- {d['label']}: {d['score']}/20 ({d['percentage']:.0f}%)"
        for d in dimensions
    ])
    
    prompt = f"""You are an expert AI business consultant creating a personalized AI readiness assessment report.

The user has completed an AI Compass assessment with the following results:

**Profile:**
- Name: {assessment_data.get('name', 'N/A')}
- Role: {assessment_data.get('role', 'N/A')}
- Company: {assessment_data.get('company', 'N/A')}

**Overall Score:** {assessment_data['total_score']}/100 ({assessment_data['tier']})

**Dimension Scores:**
{dim_scores}

**Strongest Area:** {strongest}
**Area for Growth:** {weakest}

Generate a comprehensive, personalized report with ALL of the following sections:

1. **Header & Score Card** - Summary of the user's score and tier
2. **Executive Summary** (2-3 sentences) - Overall assessment and key takeaway
3. **Intelligence Context** - What we know about their company and industry from research
4. **Dimension Deep Dive** (for each dimension) - Personalized analysis based on their specific score, what it means for their role, and concrete recommendations
5. **Priority Recommendations** (3-4 specific items) - Actionable advice based on their scores
6. **Learning Pathway** (2-3 items) - Suggested next steps to improve
7. **Risk Assessment** (2-3 items) - Potential risks if they don't improve
8. **Competitor Comparison** (2-3 items) - How they might compare to competitors in AI adoption
9. **Industry Benchmark** (2-3 items) - Where they likely stand vs industry peers
10. **Action Plan** (3-5 items) - Prioritized action items
11. **Next Steps** (3 items) - Concrete actions to take in the next 30 days

Write in a professional but accessible tone. Be specific - don't just repeat the scores, interpret what they mean for this person's situation. Use their role and company context if available.

Format your response as a JSON object with these keys:
- header (score, tier, name)
- executive_summary
- intelligence_context
- dimension_deep_dive (array with dimension, score, analysis, recommendations for each)
- priority_recommendations (array of strings)
- learning_pathway (array of strings)
- risk_assessment (array of strings)
- competitor_comparison (array of strings)
- industry_benchmark (array of strings)
- action_plan (array of strings)
- next_steps (array of strings)

Return ONLY valid JSON, no markdown formatting."""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4000,
            temperature=0.7,
            system="You are an expert AI business consultant. Generate personalized, actionable reports.",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        # Parse the JSON response
        import json
        import re
        
        response_text = message.content[0].text
        
        # Try to extract JSON from response
        try:
            # First try direct parse
            ai_report = json.loads(response_text)
        except:
            # Try to extract JSON from markdown code block
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                ai_report = json.loads(json_match.group())
            else:
                raise ValueError("Could not parse JSON from response")
        
        return {
            "success": True,
            "report": ai_report
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "fallback": generate_fallback_report(assessment_data)
        }


def generate_fallback_report(assessment_data: dict) -> dict:
    """Generate a basic report if Claude fails"""
    dimensions = assessment_data.get('dimensions', [])
    if not dimensions:
        dimensions = [
            {"dimension": "D1", "label": "AI Literacy", "score": 0},
            {"dimension": "D2", "label": "Data Readiness", "score": 0},
            {"dimension": "D3", "label": "Workflow Integration", "score": 0},
            {"dimension": "D4", "label": "Governance & Risk", "score": 0},
            {"dimension": "D5", "label": "Strategic Alignment", "score": 0},
        ]
    sorted_dims = sorted(dimensions, key=lambda x: x.get('score', 0))
    
    return {
        "header": {
            "score": assessment_data['total_score'],
            "tier": assessment_data['tier'],
            "name": assessment_data.get('name', 'User')
        },
        "executive_summary": f"You scored {assessment_data['total_score']} out of 100, placing you at the {assessment_data['tier']} level. Your strongest area is {sorted_dims[-1]['label'] if sorted_dims else 'N/A'}, while there is room for growth in {sorted_dims[0]['label'] if sorted_dims else 'N/A'}.",
        "intelligence_context": "Company research was collected during the assessment process. Detailed insights would be available with an enhanced report.",
        "dimension_deep_dive": [
            {
                "dimension": d['dimension'],
                "label": d['label'],
                "score": d['score'],
                "analysis": f"You scored {d['score']}/20 in {d['label']}. ",
                "recommendations": [f"Focus on improving your {d['label']} capabilities"]
            }
            for d in dimensions
        ],
        "priority_recommendations": [
            "Complete AI fundamentals training",
            "Practice prompt engineering regularly",
            "Stay updated with AI industry trends"
        ],
        "learning_pathway": [
            "Enroll in an AI business strategy course",
            "Attend AI workshops and webinars",
            "Join AI communities for professionals"
        ],
        "risk_assessment": [
            "Falling behind competitors in AI adoption",
            "Missing efficiency opportunities",
            "Ineffective AI tool usage"
        ],
        "competitor_comparison": [
            "Assess your competitors' AI initiatives through industry research",
            "Benchmark your AI readiness against industry standards",
            "Identify gaps where you can lead rather than follow"
        ],
        "industry_benchmark": [
            "AI adoption varies by industry - Tech leads, Finance follows",
            "Your score positions you relative to industry averages",
            "Continuous improvement is key to staying competitive"
        ],
        "action_plan": [
            "Immediate: Complete foundational AI training",
            "Short-term: Implement AI tools in one workflow",
            "Medium-term: Develop company-wide AI strategy"
        ],
        "next_steps": [
            "Review your detailed dimension scores",
            "Create a 30-day AI learning plan",
            "Identify quick wins for AI adoption in your role"
        ]
    }
