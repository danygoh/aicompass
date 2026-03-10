"""AI Compass Backend - Assessment Router"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime

from app.models import Base, Company, User, Assessment
from app.schemas import (
    AssessmentCreate, ProfileData, 
    AnswerData, assessment_to_dict
)
from app.services.report import generate_ai_report
from app.db import get_db, engine

router = APIRouter(prefix="/api/assessment", tags=["assessment"])

# Create tables on startup
Base.metadata.create_all(bind=engine)


# 25 Real Questions from Danny's questionnaire
QUESTIONS = {
    # Dimension 1: AI Literacy
    1: {"dimension": "D1", "dimension_label": "AI Literacy", "text": "Model Understanding - When an AI tool like ChatGPT or Claude gives you a confident-sounding answer, what is actually happening under the hood — and why does that matter for your work?", "options": {"A": "I know AI tools are powerful but I have not looked into how they actually work", "B": "I understand they are trained on large amounts of text and predict the next word — which means they can sound confident even when wrong", "C": "I understand that outputs are probabilistic, that models have knowledge cutoffs, and that they can hallucinate plausible-sounding but false information", "D": "I can explain transformer-based generation, temperature and sampling, RLHF fine-tuning, and the practical implications of each for reliability in regulated professional contexts"}},
    2: {"dimension": "D1", "dimension_label": "AI Literacy", "text": "Output Evaluation - You receive an AI-generated market analysis that will inform a significant business decision. What is your process before acting on it?", "options": {"A": "I read it through — if it is well-written and logical I use it", "B": "I sense-check it against what I know, and flag anything that feels off", "C": "I verify key facts independently, check the reasoning chain, and identify where the model may have had limited or outdated information", "D": "I apply a structured evaluation: verify all material claims against primary sources, check for hallucination patterns, assess reasoning quality, identify unstated assumptions, and document my review for the audit trail"}},
    3: {"dimension": "D1", "dimension_label": "AI Literacy", "text": "Prompt Engineering - How would you describe your approach to writing prompts when you need a specific, high-quality output from an AI tool?", "options": {"A": "I describe what I want in plain language and iterate if the answer is not right", "B": "I give context about my role and what I need, and sometimes provide examples of the format I am looking for", "C": "I consistently use structured techniques — role assignment, chain-of-thought instructions, explicit constraints, and few-shot examples — and I refine based on output quality", "D": "I engineer prompts systematically: I define the persona, set explicit constraints, use multi-turn dialogue for complex tasks, apply output formatting instructions, and I have built reusable prompt libraries for my most common professional tasks"}},
    4: {"dimension": "D1", "dimension_label": "AI Literacy", "text": "AI Judgment (When NOT to Use) - A colleague proposes using an AI tool to automate a client-facing compliance report that currently requires senior sign-off. What is your instinctive response?", "options": {"A": "It sounds like a good efficiency gain — I would support trying it", "B": "I would want to see how well it performs before committing to it", "C": "I would want to assess whether this use case carries acceptable risk: the stakes, the explainability requirements, the error tolerance, and the regulatory position before supporting it", "D": "I would apply a formal AI suitability framework: assess the risk classification of the task, the regulatory obligations for client-facing outputs, the required human oversight level, explainability requirements, and document the decision — then design a human-in-the-loop process if we proceed"}},
    5: {"dimension": "D1", "dimension_label": "AI Literacy", "text": "Learning Velocity - How do you personally stay current with developments in AI that are relevant to your role and industry?", "options": {"A": "I read news articles when they come up and attend the occasional webinar", "B": "I follow a few AI-focused publications and discuss developments with colleagues when they come up", "C": "I have a deliberate learning habit: I follow curated sources, test new tools regularly, and have completed at least one structured AI course in the past 12 months", "D": "I treat AI as a continuous professional development priority: I maintain a structured reading practice, participate in professional AI communities, regularly experiment with new capabilities, and share learnings with my team — I would consider myself a go-to resource on AI in my organisation"}},
    
    # Dimension 2: Data Readiness
    6: {"dimension": "D2", "dimension_label": "Data Readiness", "text": "Organisational Data Quality - If your team wanted to build or deploy an AI tool tomorrow that relied on your organisation's internal data, what would be the biggest obstacle?", "options": {"A": "We would struggle to even locate the right data — it is scattered across systems and teams with no clear ownership", "B": "The data exists but it is inconsistently formatted, has quality issues, and accessing it requires significant manual effort", "C": "Our core datasets are reasonably clean and accessible, but we would need to do work on integration, labelling, or permission structures before they were truly AI-ready", "D": "We have a data catalogue, defined data owners, documented lineage, quality standards, and API-accessible pipelines — AI-readiness has been an explicit design criterion for our data infrastructure"}},
    7: {"dimension": "D2", "dimension_label": "Data Readiness", "text": "Personal Data Literacy - When an AI tool presents you with data analysis, a chart, or a statistical output, how confident are you in your ability to assess whether it is correct and meaningful?", "options": {"A": "I can read the headline finding but I would struggle to spot errors in the underlying analysis", "B": "I can identify obvious anomalies and assess whether the conclusion seems reasonable given my domain knowledge", "C": "I can critically evaluate methodology, identify statistical issues such as sample bias or spurious correlation, and interrogate the assumptions behind the model", "D": "I have strong quantitative literacy: I can assess statistical validity, identify data quality issues that would affect AI outputs, evaluate confidence intervals, and explain the analytical approach clearly to non-technical stakeholders"}},
    8: {"dimension": "D2", "dimension_label": "Data Readiness", "text": "Data Handling Behaviour - In your day-to-day use of AI tools, what is your personal practice when it comes to sensitive, confidential, or client data?", "options": {"A": "I have not thought much about it — I use AI tools with whatever data I am working with", "B": "I try to be careful but I do not have a clear rule — it depends on the sensitivity of the situation", "C": "I follow a clear personal rule: I do not input client names, identifiable personal data, or commercially sensitive information into external AI tools without checking whether it is covered by our data policy", "D": "I strictly follow our organisation's AI data handling policy, I know exactly which tools are approved for which data classifications, I anonymise or use synthetic data where possible, and I have flagged potential policy gaps to our compliance team"}},
    9: {"dimension": "D2", "dimension_label": "Data Readiness", "text": "Data Governance Maturity - How would you describe the maturity of your organisation's data governance framework — covering data ownership, quality standards, lineage tracking, and privacy controls?", "options": {"A": "Data governance is largely informal — ownership is unclear, quality is inconsistent, and there is no systematic lineage tracking", "B": "Basic policies exist and are documented, but they are inconsistently applied and the framework has not been updated to address AI-specific requirements", "C": "We have defined data stewards, documented quality standards, functional lineage tracking, and privacy controls — the framework is solid though AI-specific policies are still being developed", "D": "We have a mature, actively governed data program: a comprehensive data catalogue, quality SLAs with monitoring, full lineage documentation, AI-specific data handling policies reviewed by Legal and Compliance, and regular audits"}},
    10: {"dimension": "D2", "dimension_label": "Data Readiness", "text": "Data Infrastructure Investment - How well-aligned is your organisation's data infrastructure investment with its stated AI ambitions?", "options": {"A": "There is a significant gap — leadership wants AI outcomes but the data foundation needed to achieve them does not exist", "B": "Investment is underway but reactive — we are building data infrastructure in response to specific AI project demands rather than ahead of them", "C": "Investment is broadly aligned with near-term AI use cases — we are building the data foundations required for the initiatives on the roadmap", "D": "Data infrastructure is treated as a strategic prerequisite for AI: we invest ahead of demand, we have a multi-year data platform roadmap linked explicitly to our AI strategy, and data readiness is a board-level metric"}},
    
    # Dimension 3: Workflow Integration
    11: {"dimension": "D3", "dimension_label": "Workflow Integration", "text": "Personal Daily Usage - Thinking about your own work last week — to what extent were AI tools part of how you actually got things done?", "options": {"A": "I did not use AI tools in my work last week — they are not part of my current workflow", "B": "I used an AI tool once or twice for a specific task, but it is not a regular part of how I work", "C": "AI tools were a meaningful part of my week — I used them regularly for drafting, research, analysis, or synthesis, and I would have been less productive without them", "D": "AI tools are deeply embedded in how I work: I have a set of AI-augmented workflows for my most important tasks, I use them daily, and I have deliberately redesigned how I work around AI capabilities in the past six months"}},
    12: {"dimension": "D3", "dimension_label": "Workflow Integration", "text": "Output Verification Practice - When you use AI to produce a piece of work — a draft, an analysis, a summary — what is your process before that output becomes a work product you stand behind?", "options": {"A": "I review it quickly and use it if it looks right — the AI usually does a good job", "B": "I read it carefully and edit anything that seems wrong or does not match what I know", "C": "I have a consistent verification process: I check factual claims, assess reasoning quality, edit for accuracy and appropriateness for the audience, and ensure the final output reflects my own judgment", "D": "I treat AI output as a first draft requiring structured review: I verify all material facts, check for bias or inappropriate framing, assess fitness for the specific regulatory or professional context, and I take full personal accountability for the final product as if I had written it myself"}},
    13: {"dimension": "D3", "dimension_label": "Workflow Integration", "text": "AI Use Case Identification - When you look at your role and your team's responsibilities, how capable are you of identifying where AI could create the most value — and making a credible case for it?", "options": {"A": "I have a general sense that AI could help but I have not identified specific opportunities or quantified them", "B": "I can identify a few tasks that could be automated or accelerated by AI, but I have not built a formal case for any of them", "C": "I have mapped the highest-value AI opportunities in my role, assessed their feasibility, and either piloted one or built a business case that I have presented to my team or manager", "D": "I systematically identify and prioritise AI use cases using a structured framework: I assess value, feasibility, risk, and data requirements; I have successfully piloted multiple AI use cases; and I am a credible internal advocate for AI investment with concrete ROI evidence"}},
    14: {"dimension": "D3", "dimension_label": "Workflow Integration", "text": "System Integration - To what degree are AI tools integrated into the systems and processes your team relies on — rather than being used as standalone tools alongside your normal workflow?", "options": {"A": "AI tools are entirely standalone — outputs are not connected to any of our systems; people copy and paste results manually when they use them", "B": "There are some informal integrations — outputs occasionally feed into documents or reports — but nothing is automated or systematic", "C": "We have built or adopted some workflow integrations: AI outputs flow into at least one downstream system or process automatically, with human review at defined checkpoints", "D": "AI is embedded in our operational architecture: outputs feed into systems of record automatically, we have documented AI-augmented process flows, there are audit trails for AI-assisted decisions, and integration quality is actively monitored"}},
    15: {"dimension": "D3", "dimension_label": "Workflow Integration", "text": "ROI Measurement - How does your organisation measure the actual impact of AI tool adoption — in terms of time saved, quality improvement, or business outcomes?", "options": {"A": "We do not measure it — AI tool adoption is driven by enthusiasm rather than evidence", "B": "We have a general sense that AI is helping but we have no baseline data and no formal measurement approach", "C": "We track productivity metrics for our main AI-augmented workflows — we have before/after data for at least some use cases and can demonstrate tangible time savings", "D": "We have a rigorous AI impact framework: documented baselines, post-adoption metrics, cost-benefit analysis by use case, regular reporting to leadership, and a process for sunsetting AI tools that are not delivering measurable value"}},
    
    # Dimension 4: Governance & Risk
    16: {"dimension": "D4", "dimension_label": "Governance & Risk", "text": "AI Policy Relationship - Does your organisation have a formal AI governance policy — covering acceptable use, risk classification, accountability, and approved tools — and what is your personal relationship to it?", "options": {"A": "There is no formal AI policy that I am aware of — AI use in my organisation is effectively ungoverned", "B": "There may be guidance somewhere but I am not familiar with it — I make my own judgments about appropriate AI use", "C": "We have a published AI policy and I have read it — I understand what is and is not permitted and I apply it in my work", "D": "We have a comprehensive AI governance framework and I am an active participant in it: I know the policy in detail, I have contributed to its development or implementation, I apply it consistently, and I help my team understand and follow it"}},
    17: {"dimension": "D4", "dimension_label": "Governance & Risk", "text": "Explainability Scenario - Imagine a regulator, senior client, or internal auditor asks you to explain how an AI tool contributed to a decision or recommendation you made. What happens?", "options": {"A": "I would struggle — I have not thought about how to explain AI involvement and there is no documentation trail", "B": "I could give a general explanation of what the tool does, but I could not provide a step-by-step account of how the output was generated or verified", "C": "I could explain clearly: which tool was used, what it was asked to do, how I validated the output, what human judgment was applied, and why I stand behind the final recommendation", "D": "I have explainability built into my AI workflow: I document AI involvement, the prompts used, the verification steps taken, and the human judgment applied — I could produce a complete audit trail and walk through the decision with confidence in front of any external scrutiny"}},
    18: {"dimension": "D4", "dimension_label": "Governance & Risk", "text": "Personal Compliance Behaviour - How would you describe your personal compliance behaviour when it comes to AI — beyond just knowing what the policy says?", "options": {"A": "I use AI tools based on my own judgment — I have not mapped my usage against any compliance requirements", "B": "I try to be responsible but I am not certain my current AI usage is fully compliant with all relevant policies and regulations", "C": "I have reviewed my AI tool usage against our policy and relevant regulations — I am confident my usage is compliant and I would be comfortable if it were reviewed", "D": "AI compliance is part of my professional standards: I proactively stay current with regulatory developments affecting AI use in my role, I flag compliance concerns when I see them, and I have sought compliance sign-off on at least one novel AI use case in the past year"}},
    19: {"dimension": "D4", "dimension_label": "Governance & Risk", "text": "Vendor & Tool Governance - What happens in your organisation when someone wants to start using a new AI tool or an AI-enabled product that has not been used before?", "options": {"A": "Nothing formal — people download and use whatever tools they want", "B": "There is informal peer discussion about whether a tool is appropriate, but no formal review or approval process", "C": "There is a defined process: new AI tools go through an approval review covering security, data handling, and appropriate use before being adopted", "D": "We have a rigorous AI vendor and tool governance program: security assessment, data processing agreement review, legal sign-off, risk classification, and a formal onboarding process — no material AI tool is used without completing it"}},
    20: {"dimension": "D4", "dimension_label": "Governance & Risk", "text": "Incident Response Scenario - You discover that an AI tool your team has been using has produced a systematically biased output that affected client-facing work over the past month. What do you do?", "options": {"A": "I would stop using the tool and tell my immediate colleagues — I am not sure what the formal process would be", "B": "I would report it to my manager and suggest we stop using the tool until the issue is understood", "C": "I would immediately escalate through the appropriate channel, assess the scope of affected outputs, initiate a review of impacted client work, and document the incident clearly for our compliance and risk teams", "D": "I would activate our AI incident response process: immediate containment, scope assessment, stakeholder notification per our escalation protocol, root cause analysis, regulatory notification if required, client remediation plan, and a formal lessons-learned review to prevent recurrence"}},
    
    # Dimension 5: Strategic Alignment
    21: {"dimension": "D5", "dimension_label": "Strategic Alignment", "text": "Leadership Mandate - Where does AI sit in your organisation's strategic agenda — and how visible is that commitment in terms of budget, accountability, and board-level attention?", "options": {"A": "AI is discussed but it is not a clear strategic priority — there is no dedicated budget, no named executive owner, and it does not feature in our strategy documents", "B": "AI is on the agenda and there is some budget, but ownership is diffuse and there is no formal multi-year AI strategy", "C": "AI is a named strategic priority with dedicated budget, an executive sponsor with accountability, and it features explicitly in our strategic planning process", "D": "AI is a board-level strategic commitment: there is a multi-year AI strategy, a named C-suite owner with board accountability, dedicated investment that is reviewed annually, and AI progress is reported to the board on a regular cycle"}},
    22: {"dimension": "D5", "dimension_label": "Strategic Alignment", "text": "Personal AI Ethics Stance - When you personally encounter an AI use case that could create value but carries ethical risk — such as AI-assisted performance assessment or client credit scoring — what governs your response?", "options": {"A": "I would focus on whether it works well and whether it is legal — ethics is a secondary consideration", "B": "I would be cautious and raise concerns, but I do not have a clear framework for how to evaluate it", "C": "I apply a consistent set of principles: I assess potential harms to affected individuals, consider fairness and transparency obligations, evaluate whether human oversight is adequate, and I would escalate to our ethics or compliance function if the risk is unclear", "D": "I have internalised a structured AI ethics framework: I assess against principles of fairness, transparency, accountability, and harm prevention; I know our organisation's ethics review process for high-risk AI applications; I have participated in an AI ethics review; and I would be comfortable defending the ethical position of any AI use I have approved"}},
    23: {"dimension": "D5", "dimension_label": "Strategic Alignment", "text": "Personal Capability Building - How are you personally investing in building your own AI capability — beyond just using the tools your organisation already provides?", "options": {"A": "I rely on what my organisation provides — I have not invested personal time or resource in building AI capability", "B": "I occasionally explore new AI tools on my own and read articles when they come up, but it is not deliberate or structured", "C": "I have a deliberate personal development plan for AI: I have completed at least one structured AI programme in the past 12 months, I regularly experiment with new tools and capabilities, and I can point to specific new skills I have built", "D": "AI capability development is a genuine professional priority: I have a structured learning plan, I have completed multiple AI programmes, I maintain a personal AI knowledge base, I experiment systematically with new capabilities, and I actively share what I learn — I am recognised in my organisation as someone who brings AI knowledge others can use"}},
    24: {"dimension": "D5", "dimension_label": "Strategic Alignment", "text": "Competitive Intelligence - How closely do you personally track AI developments among your competitors, sector peers, and adjacent industries — and how does that feed into your thinking?", "options": {"A": "I am aware that competitors are investing in AI but I do not systematically track what they are doing", "B": "I pay attention when major AI announcements are made in my sector and discuss them when they come up in meetings", "C": "I actively monitor AI developments in my competitive landscape: I track competitor announcements, follow sector-specific AI publications, and I can articulate where my organisation is ahead, at parity, or behind", "D": "AI competitive intelligence is part of how I think strategically: I have a regular monitoring habit, I synthesise signals from competitors, regulators, and adjacent industries, I have briefed leadership on competitive AI dynamics, and I can make a specific evidence-based argument about where we need to act to avoid competitive disadvantage"}},
    25: {"dimension": "D5", "dimension_label": "Strategic Alignment", "text": "Culture & Change Leadership - Think about colleagues who are sceptic, anxious, or disengaged when it comes to AI. What is your role in how they experience AI adoption in your organisation?", "options": {"A": "I focus on my own adoption — it is not my responsibility to bring others along", "B": "I share useful tools and information when asked, but I do not proactively try to shift others' mindsets", "C": "I actively help colleagues who are uncertain: I share practical examples of what works, I address concerns directly, and I try to make AI feel accessible and relevant to their specific work", "D": "I see myself as an AI adoption catalyst: I have deliberately worked to shift team culture around AI, I have run informal training or demonstrations, I surface and address fear-based resistance constructively, I recognise and celebrate colleagues' AI experiments, and I have measurably moved my immediate team toward greater AI confidence and capability"}},
}

DIMENSION_LABELS = {
    "D1": "AI Literacy",
    "D2": "Data Readiness", 
    "D3": "Workflow Integration",
    "D4": "Governance & Risk",
    "D5": "Strategic Alignment"
}

DIMENSION_DESCRIPTIONS = {
    "D1": "Your understanding of AI concepts, LLMs, and prompt engineering",
    "D2": "Your organisation's data quality, accessibility, and governance",
    "D3": "Your team's adoption and integration of AI tools",
    "D4": "Your organisation's AI policy maturity and risk management",
    "D5": "Leadership support and strategic alignment for AI"
}


def calculate_tier(score: int) -> str:
    """Calculate tier from total score"""
    if score <= 44:
        return "Beginner"
    elif score <= 62:
        return "Developing"
    elif score <= 80:
        return "Intermediate"
    else:
        return "Advanced"


def generate_report(assessment: Assessment) -> dict:
    """Generate a basic report"""
    dimensions = []
    for d in ["D1", "D2", "D3", "D4", "D5"]:
        score = getattr(assessment, f"score_{d.lower()}")
        dimensions.append({
            "dimension": d,
            "label": DIMENSION_LABELS[d],
            "description": DIMENSION_DESCRIPTIONS[d],
            "score": score,
            "max_score": 20,
            "percentage": (score / 20) * 100 if score else 0
        })
    
    # Find strongest and weakest
    sorted_dims = sorted(dimensions, key=lambda x: x['score'])
    
    report = {
        "header": {
            "name": assessment.name,
            "role": assessment.role,
            "company": assessment.company.name if assessment.company else None,
            "completed_at": assessment.completed_at.isoformat() if assessment.completed_at else None
        },
        "score_card": {
            "total_score": assessment.score_total,
            "tier": assessment.tier,
            "dimensions": dimensions
        },
        "executive_summary": f"You have completed the AI Compass assessment and scored {assessment.score_total} out of 100, placing you at the {assessment.tier} level. Your strongest area is {sorted_dims[-1]['label']}, while there is room for growth in {sorted_dims[0]['label']}.",
        "dimension_deep_dive": dimensions,
        "priority_recommendations": [
            "Focus on building foundational AI literacy across your team",
            "Establish clear data governance policies if not already in place",
            "Create guidelines for AI tool adoption and usage",
            "Develop an AI ethics framework appropriate for your organisation"
        ],
        "next_steps": [
            "Review your detailed dimension scores above",
            "Identify the 2-3 areas with most room for improvement",
            "Create an action plan with specific, measurable goals",
            "Consider enrolling in relevant AI training programs"
        ]
    }
    
    return report


@router.get("/questions")
def get_questions():
    """Get all 25 questions"""
    # Return as list for frontend
    return [{"id": k, **v} for k, v in QUESTIONS.items()]


@router.post("/start")
def start_assessment(assessment_in: AssessmentCreate, db: Session = Depends(get_db)):
    """Create a new assessment (Stage 1)"""
    assessment = Assessment(
        user_id=assessment_in.user_id,
        company_id=assessment_in.company_id,
        stage="profile",
        status="in_progress",
        started_at=datetime.utcnow()
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return assessment_to_dict(assessment)


@router.get("/{assessment_id}")
def get_assessment(assessment_id: UUID, db: Session = Depends(get_db)):
    """Get assessment by ID"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment_to_dict(assessment)


@router.put("/{assessment_id}/profile")
def save_profile(assessment_id: UUID, profile: ProfileData, db: Session = Depends(get_db)):
    """Save profile data and move to questions stage"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    if assessment.status == "completed":
        raise HTTPException(status_code=400, detail="Assessment already completed")
    
    # Check if company exists or create new
    company = None
    if profile.company_name:
        company = db.query(Company).filter(Company.name == profile.company_name).first()
        if not company:
            company = Company(
                name=profile.company_name,
                industry=profile.company_industry,
                country=profile.company_country
            )
            db.add(company)
            db.commit()
            db.refresh(company)
        assessment.company_id = company.id
    
    # Save profile data
    assessment.name = profile.name
    assessment.email = profile.email
    assessment.role = profile.role
    assessment.stage = "assess"
    
    db.commit()
    db.refresh(assessment)
    return assessment_to_dict(assessment)


@router.put("/{assessment_id}/answer")
def save_answer(assessment_id: UUID, answer: AnswerData, db: Session = Depends(get_db)):
    """Save a single answer"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    if assessment.status == "completed":
        raise HTTPException(status_code=400, detail="Assessment already completed")
    
    # Initialize answers dict - ensure it's a dict for JSONB
    current_answers = dict(assessment.answers) if assessment.answers else {}
    
    # Validate answer
    if answer.answer not in [1, 2, 3, 4]:
        raise HTTPException(status_code=400, detail="Answer must be 1-4")
    
    # Save answer
    current_answers[str(answer.question_id)] = answer.answer
    assessment.answers = current_answers
    assessment.stage = "assess"
    
    db.commit()
    db.refresh(assessment)
    
    return {"status": "saved", "question_id": answer.question_id, "total_answers": len(current_answers)}


@router.post("/{assessment_id}/submit")
def submit_assessment(assessment_id: UUID, db: Session = Depends(get_db)):
    """Submit assessment, calculate scores, generate report"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    if assessment.status == "completed":
        raise HTTPException(status_code=400, detail="Assessment already completed")
    
    if not assessment.answers or len(assessment.answers) < 25:
        raise HTTPException(status_code=400, detail="All 25 questions must be answered")
    
    # Calculate dimension scores
    scores = {"D1": 0, "D2": 0, "D3": 0, "D4": 0, "D5": 0}
    for q_id, answer in assessment.answers.items():
        q = QUESTIONS.get(int(q_id))
        if q:
            scores[q["dimension"]] += answer
    
    # Save scores
    assessment.score_d1 = scores["D1"]
    assessment.score_d2 = scores["D2"]
    assessment.score_d3 = scores["D3"]
    assessment.score_d4 = scores["D4"]
    assessment.score_d5 = scores["D5"]
    assessment.score_total = sum(scores.values())
    assessment.tier = calculate_tier(assessment.score_total)
    
    # Generate report - Try AI, fallback to static
    assessment_data = {
        "name": assessment.name,
        "role": assessment.role,
        "company": assessment.company.name if assessment.company else None,
        "total_score": assessment.score_total,
        "tier": assessment.tier,
        "dimensions": [
            {"dimension": "D1", "label": "AI Literacy", "score": scores["D1"], "percentage": (scores["D1"]/20)*100},
            {"dimension": "D2", "label": "Data Readiness", "score": scores["D2"], "percentage": (scores["D2"]/20)*100},
            {"dimension": "D3", "label": "Workflow Integration", "score": scores["D3"], "percentage": (scores["D3"]/20)*100},
            {"dimension": "D4", "label": "Governance & Risk", "score": scores["D4"], "percentage": (scores["D4"]/20)*100},
            {"dimension": "D5", "label": "Strategic Alignment", "score": scores["D5"], "percentage": (scores["D5"]/20)*100},
        ]
    }
    
    # Try AI generation first
    ai_result = generate_ai_report(assessment_data)
    
    if ai_result["success"]:
        report = ai_result["report"]
    else:
        # Fallback to static report
        report = generate_report(assessment)
    
    assessment.report = report
    
    # Mark complete
    assessment.status = "completed"
    assessment.stage = "report"
    assessment.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(assessment)
    
    return {"assessment": assessment_to_dict(assessment), "report": report}


@router.get("/{assessment_id}/report")
def get_report(assessment_id: UUID, db: Session = Depends(get_db)):
    """Get the generated report"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    if not assessment.report:
        raise HTTPException(status_code=400, detail="Report not yet generated")
    
    return assessment.report
