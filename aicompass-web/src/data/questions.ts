// AI Compass v1.0 - Question Bank
// 25 question slots × 3 variants = 75 unique questions

export interface QuestionVariant {
  q: string;
  opts: [string, string, string, string]; // 4 options, A=1 to D=4
}

export interface Question {
  dim: number; // 0-4 (5 dimensions)
  variants: {
    standard: QuestionVariant;
    stretch: QuestionVariant;
    diagnostic: QuestionVariant;
  };
}

export const DIMENSIONS = [
  'AI Literacy',
  'Data Readiness',
  'Workflow Integration',
  'Governance & Risk',
  'Strategic Alignment',
] as const;

export const DIMENSION_ICONS = ['🧠', '💾', '⚙️', '🔒', '🚀'] as const;

export const QUESTIONS: Question[] = [
  // Dimension 0: AI Literacy (Questions 1-5)
  {
    dim: 0,
    variants: {
      standard: {
        q: "When an AI tool gives you a confident-sounding answer, what is actually happening and why does that matter for your work?",
        opts: [
          "I know AI tools are powerful but haven't looked into how they actually work",
          "I understand they're trained on large amounts of text and predict the next word — so they can sound confident even when wrong",
          "I understand outputs are probabilistic, models have knowledge cutoffs, and they can hallucinate plausible-sounding but false information",
          "I can explain transformer-based generation, temperature and sampling, RLHF fine-tuning, and the practical implications for reliability in regulated contexts"
        ]
      },
      stretch: {
        q: "A board-level colleague states that AI just searches the internet for answers. How do you correct this in 60 seconds and what operational implication do you surface?",
        opts: [
          "I'd acknowledge the intuition while noting it's more complex",
          "I'd explain they're language models that generate predictions based on training data, not live search",
          "I'd explain probabilistic generation, training cutoffs, and hallucination risk — and connect this to our verification requirements",
          "I'd give a concise explanation of autoregressive generation, distinguish from retrieval-augmented systems, and frame the audit trail implication for our regulated context"
        ]
      },
      diagnostic: {
        q: "You receive a detailed AI-generated summary that is well-written and internally consistent. What concern should still be present?",
        opts: [
          "None — if it's well-written and consistent, it's likely accurate",
          "That the sources may be outdated or the topic outside my expertise",
          "That the model may have produced a fluent hallucination — confident-sounding content that is factually incorrect",
          "That coherent output can still be wrong, and source verification is required regardless of fluency"
        ]
      }
    }
  },
  {
    dim: 0,
    variants: {
      standard: {
        q: "You receive an AI-generated market analysis that will inform a significant business decision. What is your process before acting on it?",
        opts: [
          "I read it through — if it's well-written and logical I use it",
          "I sense-check it against what I know and flag anything that feels off",
          "I verify key facts independently, check the reasoning chain, and identify where the model may have had limited information",
          "I apply a structured evaluation: verify all material claims, check for hallucination patterns, assess reasoning quality, and document my review for the audit trail"
        ]
      },
      stretch: {
        q: "An AI tool has produced a competitive analysis your CEO plans to cite in a board presentation tomorrow. What is your specific verification protocol?",
        opts: [
          "I'd review it quickly and raise any obvious concerns",
          "I'd verify the key numbers and flag uncertainty clearly",
          "I'd run a structured fact-check, identify the AI's knowledge cutoff, note what's unverifiable, and recommend explicit source caveats",
          "I'd conduct a full verification against primary sources, document my review, recommend citing original sources, and ensure methodology is disclosed to the board"
        ]
      },
      diagnostic: {
        q: "A colleague uses AI to summarise a regulatory document and sends you the summary to act on. You haven't read the original. What do you do?",
        opts: [
          "Use the summary — it's faster and my colleague already checked it",
          "Skim it and flag anything that seems inconsistent",
          "Ask which AI was used and whether the original was uploaded — then spot-check 2–3 key provisions",
          "Decline to act on an AI summary of a regulatory document without reading the original"
        ]
      }
    }
  },
  {
    dim: 0,
    variants: {
      standard: {
        q: "How would you describe your approach to writing prompts when you need a specific, high-quality output from an AI tool?",
        opts: [
          "I describe what I want in plain language and iterate if the answer isn't right",
          "I give context about my role and what I need, and sometimes provide format examples",
          "I consistently use structured techniques — role assignment, chain-of-thought instructions, explicit constraints, and few-shot examples",
          "I engineer prompts systematically: persona, explicit constraints, multi-turn dialogue, output formatting, and reusable prompt libraries"
        ]
      },
      stretch: {
        q: "You're building a prompt template your team will use repeatedly for client-facing risk summaries. Walk through your design process.",
        opts: [
          "I'd write a clear description of what's needed and test it a few times",
          "I'd include role context, format requirements, and example outputs",
          "I'd design a structured template with role assignment, output schema, constraint rules, few-shot examples, and a human review step",
          "I'd design a production-grade prompt with system/user separation, risk parameters, output validation rules, version control, and a documented testing protocol"
        ]
      },
      diagnostic: {
        q: "You ask an AI for a summary but it keeps producing something too long and too generic. What do you try first?",
        opts: [
          "Ask again with 'be more concise and specific'",
          "Add context: my role, audience, and a word count constraint",
          "Restructure the prompt: add explicit format instructions, expertise level, and a maximum length with examples",
          "Decompose: first ask the model to identify the 3 most important points, then expand only those using chain-of-thought"
        ]
      }
    }
  },
  {
    dim: 0,
    variants: {
      standard: {
        q: "A colleague proposes using an AI tool to automate a client-facing compliance report that currently requires senior sign-off. What is your instinctive response?",
        opts: [
          "It sounds like a good efficiency gain — I'd support trying it",
          "I'd want to see how well it performs before committing",
          "I'd want to assess whether this use case carries acceptable risk: stakes, explainability requirements, error tolerance, and regulatory position",
          "I'd apply a formal AI suitability framework: risk classification, regulatory obligations, required human oversight level, and document the decision"
        ]
      },
      stretch: {
        q: "Your CTO proposes replacing your team's manual credit decision process with an AI model. What questions do you require answers to before this can proceed?",
        opts: [
          "What's the accuracy rate and how does it compare to what we do now?",
          "What's the accuracy rate, what data was it trained on, and how do we monitor for drift?",
          "What's the risk classification, what regulatory obligations apply, how is it explainable to customers, and what's the human override process?",
          "What's the regulatory framework, explainability standard, bias testing protocol, model governance process, rollback plan, incident response, board accountability — and has Legal signed off?"
        ]
      },
      diagnostic: {
        q: "When should AI NOT be used for a task? Give the most important criterion.",
        opts: [
          "When the AI is too slow or expensive",
          "When the output quality isn't good enough yet",
          "When the task requires human accountability for the outcome — particularly where errors have serious consequences",
          "When explainability is required, stakes are high, error tolerance is low, regulatory accountability attaches to a person, or the affected party has a right to a human-reviewable decision"
        ]
      }
    }
  },
  {
    dim: 0,
    variants: {
      standard: {
        q: "How do you personally stay current with developments in AI that are relevant to your role and industry?",
        opts: [
          "I read news articles when they come up and attend the occasional webinar",
          "I follow a few AI-focused publications and discuss developments with colleagues",
          "I have a deliberate learning habit: curated sources, regular tool testing, and at least one structured AI course in the past 12 months",
          "I treat AI as a continuous professional development priority: structured reading, professional communities, regular experimentation, and sharing learnings with my team"
        ]
      },
      stretch: {
        q: "Name one specific AI development in your industry in the last 6 months that changed how you think about your role.",
        opts: [
          "I'm aware things are moving fast but can't name a specific one",
          "I can name a general trend but not a specific development",
          "I can name a specific development, explain why it matters for my function, and describe one thing I've already changed",
          "I can name several, rank them by relevance, describe changes I've made, and articulate what I'm monitoring for next"
        ]
      },
      diagnostic: {
        q: "The last time you proactively learned something about AI: what was it and how did it happen?",
        opts: [
          "It came up in the news or a meeting — I didn't seek it out",
          "I read an article or watched a video that caught my attention",
          "I completed a structured module as part of a deliberate learning goal",
          "I followed a specific gap I'd identified — researched it, tested it, and documented what I learned for my team"
        ]
      }
    }
  },
  // Dimension 1: Data Readiness (Questions 6-10)
  {
    dim: 1,
    variants: {
      standard: {
        q: "If your team wanted to build or deploy an AI tool tomorrow using your organisation's internal data, what would be the biggest obstacle?",
        opts: [
          "We'd struggle to even locate the right data — it's scattered with no clear ownership",
          "The data exists but it's inconsistently formatted, has quality issues, and accessing it requires significant manual effort",
          "Our core datasets are reasonably clean and accessible, but we'd need work on integration, labelling, or permission structures",
          "We have a data catalogue, defined data owners, documented lineage, quality standards, and API-accessible pipelines — AI-readiness has been an explicit design criterion"
        ]
      },
      stretch: {
        q: "You're the sponsor for a high-profile AI pilot requiring 3 years of clean customer transaction data. What do you verify before the pilot begins?",
        opts: [
          "I'd confirm the data exists and is accessible",
          "I'd check data completeness, format consistency, and whether privacy approvals are in place",
          "I'd conduct a data quality assessment: completeness, consistency, timeliness, accuracy, coverage, privacy classification, and integration readiness",
          "I'd require a formal data readiness report: quality metrics, lineage documentation, privacy impact assessment, consent basis, bias risk assessment, and Data Office sign-off"
        ]
      },
      diagnostic: {
        q: "Your team starts using a new AI tool and after 2 weeks outputs seem inconsistent. Data quality is suspected. What do you do?",
        opts: [
          "Ask the team to check whether the outputs make sense",
          "Review the recent outputs manually to look for patterns in the errors",
          "Conduct a structured data quality review: check input data for recency, consistency, completeness — and run the same inputs twice to isolate the issue",
          "Initiate a formal data quality investigation: sample inputs vs outputs, check the pipeline for upstream changes, log the anomalies, and escalate to our data steward"
        ]
      }
    }
  },
  {
    dim: 1,
    variants: {
      standard: {
        q: "When an AI tool presents you with data analysis or a statistical output, how confident are you in assessing whether it is correct and meaningful?",
        opts: [
          "I can read the headline finding but would struggle to spot errors in the underlying analysis",
          "I can identify obvious anomalies and assess whether the conclusion seems reasonable",
          "I can critically evaluate methodology, identify statistical issues such as sample bias or spurious correlation, and interrogate assumptions",
          "I have strong quantitative literacy: I can assess statistical validity, identify data quality issues, evaluate confidence intervals, and explain analytical approaches to non-technical stakeholders"
        ]
      },
      stretch: {
        q: "An AI-generated analysis shows a strong correlation between two business metrics and recommends a strategic pivot. What do you interrogate first?",
        opts: [
          "Whether the correlation is statistically significant",
          "Whether it might be spurious, whether there's a plausible causal mechanism, and whether the data period is representative",
          "Whether causation is established or merely inferred, the confidence interval, and whether there are confounding variables",
          "All of the above — plus training data vintage, the model's ability to distinguish correlation from causation, survivorship bias, and independent validation"
        ]
      },
      diagnostic: {
        q: "A well-presented AI-generated chart shows customer satisfaction rising steadily. What's the first question you ask?",
        opts: [
          "What's the current score?",
          "What's the trend over the last 12 months?",
          "What's the sample size, how was satisfaction measured, and is this metric consistent historically?",
          "What's the survey methodology, response rate, sample representativeness, and has the question wording changed in a way that could explain the trend?"
        ]
      }
    }
  },
  {
    dim: 1,
    variants: {
      standard: {
        q: "In your day-to-day use of AI tools, what is your personal practice when it comes to sensitive or client data?",
        opts: [
          "I haven't thought much about it — I use AI tools with whatever data I'm working with",
          "I try to be careful but don't have a clear rule",
          "I follow a clear personal rule: no client names, identifiable personal data, or commercially sensitive information into external AI tools without checking our data policy",
          "I strictly follow our AI data handling policy, know which tools are approved for which data classifications, and anonymise or use synthetic data where possible"
        ]
      },
      stretch: {
        q: "A colleague asks you to review a prompt they're planning to send to ChatGPT. It contains client names and transaction amounts. What do you do?",
        opts: [
          "Point out it might be sensitive and suggest they be careful",
          "Decline to review it and suggest they use our internal approved tool instead",
          "Stop them, explain the data classification issue, ask which approved tool they should be using, and offer to help anonymise the data",
          "Stop them, explain the classification issue, help anonymise the data, check whether this has happened before, and flag it to compliance as a near-miss"
        ]
      },
      diagnostic: {
        q: "What does your organisation's AI data policy say about using external AI tools with client data? How do you know?",
        opts: [
          "I'm not sure we have a specific policy — I use my judgment",
          "I've heard general guidance but couldn't quote the specific rule",
          "I've read the policy and can describe rules for different data classifications — approved vs non-approved tools, anonymisation requirements",
          "I know the policy in detail, can cite specific provisions, know which tools are approved, and participated in the last policy update consultation"
        ]
      }
    }
  },
  {
    dim: 1,
    variants: {
      standard: {
        q: "How would you describe the maturity of your organisation's data governance framework?",
        opts: [
          "Data governance is largely informal — ownership is unclear and quality is inconsistent",
          "Basic policies exist but are inconsistently applied and haven't been updated for AI-specific requirements",
          "We have defined data stewards, documented quality standards, functional lineage tracking, and privacy controls — though AI-specific policies are still being developed",
          "We have a mature, actively governed data program: comprehensive data catalogue, quality SLAs, full lineage documentation, AI-specific data handling policies, and regular audits"
        ]
      },
      stretch: {
        q: "Your head of data governance has left and the role is vacant. What breaks first — and what does that tell us about your data governance maturity?",
        opts: [
          "Things will probably slow down but the basics will keep running",
          "Some ownership questions will become unclear until the role is filled",
          "If a single departure creates governance uncertainty, our framework is too person-dependent — truly mature governance should survive role transitions",
          "A mature data governance framework should be institutionalised enough that no single departure breaks it — clear succession, documented ownership by asset, process-level governance"
        ]
      },
      diagnostic: {
        q: "Who owns the data your team uses most frequently — and how would you find out if you didn't know?",
        opts: [
          "I'd ask around until I found someone who knew",
          "I'd check our documentation or ask IT",
          "I'd consult our data catalogue or RACI matrix which lists data owners by domain",
          "I'd query our data governance registry and if that information wasn't there, I'd treat its absence as a governance gap to escalate"
        ]
      }
    }
  },
  {
    dim: 1,
    variants: {
      standard: {
        q: "How well-aligned is your organisation's data infrastructure investment with its stated AI ambitions?",
        opts: [
          "There's a significant gap — leadership wants AI outcomes but the data foundation doesn't exist",
          "Investment is underway but reactive — building data infrastructure in response to AI project demands rather than ahead of them",
          "Investment is broadly aligned with near-term AI use cases — building the foundations required for initiatives on the roadmap",
          "Data infrastructure is treated as a strategic prerequisite for AI: we invest ahead of demand and data readiness is a board-level metric"
        ]
      },
      stretch: {
        q: "Your organisation has committed to launching 5 new AI products over 24 months. What data infrastructure questions need to be answered first?",
        opts: [
          "Whether we have enough data and the technology to run AI models",
          "Whether the data is clean, accessible, and whether we have the right cloud or compute infrastructure",
          "Whether our data pipelines support real-time inference, quality meets training thresholds, and our data team has capacity for 5 concurrent projects",
          "All of the above — plus whether our architecture supports latency and throughput requirements, feature store and model registry capabilities, and lineage can support explainability requirements"
        ]
      },
      diagnostic: {
        q: "When was the last time your leadership reviewed the gap between data infrastructure maturity and AI ambitions?",
        opts: [
          "I don't think that's been formally reviewed",
          "It came up in a project post-mortem at some point",
          "It was reviewed in the last strategic planning cycle and there's a funded remediation plan",
          "It's a standing item in our technology governance calendar — we have a formal data readiness assessment that feeds into AI investment decisions"
        ]
      }
    }
  },
  // Dimension 2: Workflow Integration (Questions 11-15)
  {
    dim: 2,
    variants: {
      standard: {
        q: "Thinking about your own work last week — to what extent were AI tools part of how you actually got things done?",
        opts: [
          "I didn't use AI tools last week — they're not part of my current workflow",
          "I used an AI tool once or twice for a specific task, but it's not a regular part of how I work",
          "AI tools were a meaningful part of my week — I used them regularly for drafting, research, analysis, or synthesis",
          "AI tools are deeply embedded in how I work: I have AI-augmented workflows for my most important tasks, I use them daily, and I've deliberately redesigned how I work around AI capabilities"
        ]
      },
      stretch: {
        q: "If your access to all AI tools was removed tomorrow, what would be the most significant impact on your work quality or throughput?",
        opts: [
          "Minimal impact — I'd mostly switch back to how I worked before",
          "Some tasks would take longer, particularly drafting and research, but I'd manage",
          "I'd lose a significant productivity multiplier — probably 20–30% of throughput until I adapted",
          "I'd lose embedded workflows for my most critical tasks — the impact would be material and immediate, and recovery would take 4–6 weeks minimum"
        ]
      },
      diagnostic: {
        q: "What's the one task you now consider genuinely faster or better when done with AI assistance versus without?",
        opts: [
          "I can't point to one yet — I haven't found a task where it clearly beats my current approach",
          "Writing first drafts is faster — though I still spend a lot of time editing",
          "Research synthesis — what used to take a few hours now takes 30 minutes, and the output is better structured",
          "I have a specific workflow where AI assistance produces measurably superior output — I can quantify the time saving and quality difference"
        ]
      }
    }
  },
  {
    dim: 2,
    variants: {
      standard: {
        q: "When you use AI to produce a piece of work, what is your process before that output becomes something you stand behind?",
        opts: [
          "I review it quickly and use it if it looks right",
          "I read it carefully and edit anything that seems wrong or doesn't match what I know",
          "I have a consistent verification process: I check factual claims, assess reasoning quality, edit for accuracy and audience appropriateness",
          "I treat AI output as a first draft requiring structured review: verify all material facts, check for bias, assess fitness for the regulatory or professional context"
        ]
      },
      stretch: {
        q: "An AI-drafted memo goes out to clients with an error that the author didn't catch. What does this failure tell us about their verification process?",
        opts: [
          "They should have read it more carefully before sending",
          "They should have checked the key facts and had someone else review it",
          "They lacked a structured verification protocol: key facts unverified, no bias check, no fitness assessment for the client context",
          "No verification protocol existed — a sound process would treat AI draft as unverified, apply a structured review against primary sources, and require a second-reader review"
        ]
      },
      diagnostic: {
        q: "The last piece of AI-assisted work you submitted — what specific thing did you verify before it went out?",
        opts: [
          "I reviewed it overall and it seemed fine",
          "I checked the key numbers and the main recommendations",
          "I verified the factual claims that mattered most and checked the tone was right for the audience",
          "I conducted a structured review: verified all material claims against source, checked consistency with our policy position, reviewed for audience appropriateness"
        ]
      }
    }
  },
  {
    dim: 2,
    variants: {
      standard: {
        q: "How capable are you of identifying where AI could create the most value in your role and making a credible case for it?",
        opts: [
          "I have a general sense that AI could help but haven't identified specific opportunities or quantified them",
          "I can identify a few tasks that could be automated or accelerated, but haven't built a formal case",
          "I've mapped the highest-value AI opportunities in my role, assessed feasibility, and either piloted one or built a business case I've presented",
          "I systematically identify and prioritise AI use cases using a structured framework; I've piloted multiple use cases; and I'm a credible internal advocate for AI investment"
        ]
      },
      stretch: {
        q: "Name the top 3 AI use cases in your function right now — ranked by value, with your assessment of the primary obstacle to each.",
        opts: [
          "I can name some general areas where AI could help, but couldn't rank or quantify them",
          "I can name 2–3 general use cases and describe the biggest challenge for each at a high level",
          "I can name 3 specific use cases, rank them by expected value impact, and identify the primary obstacle for each",
          "I have a live use case map for my function with value estimates, feasibility scores, risk ratings, and obstacle analysis — and I've presented the top 3 to leadership"
        ]
      },
      diagnostic: {
        q: "What's the highest-value task in your weekly work that is still done entirely manually but could plausibly be AI-augmented?",
        opts: [
          "I'm not sure — I haven't mapped my work that way",
          "There are a few candidates but I haven't assessed them properly",
          "I can name one specific task, estimate the time it takes, and describe what an AI-augmented version would look like",
          "I've already mapped this task, built a rough ROI case, identified the tool or approach, and know exactly what data and governance work would be needed"
        ]
      }
    }
  },
  {
    dim: 2,
    variants: {
      standard: {
        q: "To what degree are AI tools integrated into the systems and processes your team relies on?",
        opts: [
          "AI tools are entirely standalone — people copy and paste results manually",
          "There are some informal integrations but nothing is automated or systematic",
          "We've built some workflow integrations: AI outputs flow into at least one downstream system automatically, with human review at defined checkpoints",
          "AI is embedded in our operational architecture: outputs feed into systems of record automatically and integration quality is actively monitored"
        ]
      },
      stretch: {
        q: "What would need to be true for an AI tool your team currently uses as a standalone tool to become genuinely integrated into your workflow?",
        opts: [
          "We'd need a way to connect it to our existing systems automatically",
          "We'd need an API integration, a way to validate outputs, and probably approval from IT",
          "We'd need: an approved API integration, a defined output validation step with human review, a documented process flow, an audit trail, and a monitoring process",
          "We'd need all of the above plus: a formal change management process, risk classification, compliance sign-off, a rollback procedure, and a governance review cadence"
        ]
      },
      diagnostic: {
        q: "When you use an AI tool, how do you typically get the output into the place where you actually use it?",
        opts: [
          "I copy and paste it — that's just how it works",
          "Sometimes copy-paste, sometimes I can export it in a useful format",
          "I have a couple of workflows where the output feeds directly into a tool I use",
          "Most of my AI tool usage feeds directly into my downstream systems without manual transfer — I've specifically designed my workflows to eliminate copy-paste"
        ]
      }
    }
  },
  {
    dim: 2,
    variants: {
      standard: {
        q: "How does your organisation measure the actual impact of AI tool adoption?",
        opts: [
          "We don't measure it — AI tool adoption is driven by enthusiasm rather than evidence",
          "We have a general sense that AI is helping but no baseline data and no formal measurement approach",
          "We track productivity metrics for our main AI-augmented workflows — we have before/after data for at least some use cases",
          "We have a rigorous AI impact framework: documented baselines, post-adoption metrics, cost-benefit analysis by use case, regular reporting to leadership, and a process for sunsetting tools that aren't delivering value"
        ]
      },
      stretch: {
        q: "Your CFO asks for the ROI on your team's AI tool spend over the last 12 months. What can you produce?",
        opts: [
          "I couldn't produce a quantified ROI figure — we haven't measured it that way",
          "I could give a qualitative summary of what's been useful and roughly estimate hours saved",
          "I could produce a tool-by-tool usage summary, estimated time savings, and a rough cost-benefit comparison",
          "I could produce a formal ROI analysis: tool costs, usage data, baseline vs post-adoption productivity metrics, quality improvement indicators, and an NPV calculation"
        ]
      },
      diagnostic: {
        q: "Name one specific AI use case your team has adopted. What's the measurable impact?",
        opts: [
          "We use AI tools but I couldn't quantify the impact of a specific one",
          "We use AI for drafting and it's faster — but I couldn't give you a precise number",
          "I can name one specific use case and give you an approximate time saving — it's based on team feedback rather than systematic measurement",
          "I can give you the exact use case, the baseline measurement, the post-adoption metric, the time period, and the business outcome — we documented it when we adopted it"
        ]
      }
    }
  },
  // Dimension 3: Governance & Risk (Questions 16-20)
  {
    dim: 3,
    variants: {
      standard: {
        q: "Does your organisation have a formal AI governance policy and what is your personal relationship to it?",
        opts: [
          "There's no formal AI policy that I'm aware of — AI use in my organisation is effectively ungoverned",
          "There may be guidance somewhere but I'm not familiar with it — I make my own judgments",
          "We have a published AI policy and I've read it — I understand what and isn't permitted and I apply it in my work",
          "We have a comprehensive AI governance framework and I'm an active participant: I know it in detail, contributed to its development, apply it consistently, and help my team follow it"
        ]
      },
      stretch: {
        q: "Your organisation's AI policy was written 18 months ago. Three significant new AI tools have been adopted since then. What's the governance problem?",
        opts: [
          "The policy might be out of date — someone should probably update it",
          "We likely have a gap between what the policy permits and what's actually being used — that's a compliance risk",
          "The policy hasn't kept pace with adoption, creating an uncontrolled grey zone — my role is to flag this and push for a review process",
          "This represents a structural governance gap: tools in use without policy coverage means unassessed risks, undefined accountability, and potential regulatory exposure"
        ]
      },
      diagnostic: {
        q: "You want to use a new AI tool for a work task that's not clearly covered by your current policy. What do you do?",
        opts: [
          "I use my judgment — if it seems reasonable, I'll use it",
          "I ask a colleague who knows more about these things",
          "I check the policy for the nearest applicable principle, document my reasoning, and flag it to our governance team as a gap to address",
          "I do not use the tool until I have an answer — I submit a formal query to our AI governance function and wait for written guidance"
        ]
      }
    }
  },
  {
    dim: 3,
    variants: {
      standard: {
        q: "A regulator, senior client, or internal auditor asks you to explain how an AI tool contributed to a decision you made. What happens?",
        opts: [
          "I'd struggle — I haven't thought about how to explain AI involvement and there's no documentation trail",
          "I could give a general explanation of what the tool does, but not a step-by-step account",
          "I could explain clearly: which tool, what it was asked to do, how I validated the output, what human judgment was applied, and why I stand behind the recommendation",
          "I have explainability built into my AI workflow: I document AI involvement, the prompts used, the verification steps taken, and the human judgment applied — I could produce a complete audit trail"
        ]
      },
      stretch: {
        q: "A client challenges a recommendation you made, asserting that it was just produced by AI. How do you respond and what documentation do you produce?",
        opts: [
          "I'd explain that I reviewed the AI output and stand behind the recommendation",
          "I'd walk them through my review process and explain that the final judgment was mine, not the AI's",
          "I'd produce the documentation of my verification process: which tool, what inputs, what review I conducted, what I changed, and affirm my professional judgment",
          "I'd produce the complete AI workflow audit trail: tool used, version, inputs, verification checklist, material changes from AI draft, and a written statement of my professional judgment"
        ]
      },
      diagnostic: {
        q: "If you used AI to help produce your last significant work output, could you reconstruct exactly how and where AI was involved?",
        opts: [
          "I couldn't reconstruct it precisely — I don't keep records of that",
          "I could give a general account but not a specific step-by-step record",
          "I could describe which tools I used, what inputs I gave them, and what I changed — from memory, not from documented records",
          "I could produce a documented record: tool name, version, inputs, outputs, my verification steps, and what human judgment I applied"
        ]
      }
    }
  },
  {
    dim: 3,
    variants: {
      standard: {
        q: "How would you describe your personal compliance behaviour when it comes to AI — beyond just knowing what the policy says?",
        opts: [
          "I use AI tools based on my own judgment — I haven't mapped my usage against any compliance requirements",
          "I try to be responsible but I'm not certain my current AI usage is fully compliant",
          "I've reviewed my AI tool usage against our policy and relevant regulations — I'm confident my usage is compliant and I'd be comfortable if it were reviewed",
          "AI compliance is part of my professional standards: I proactively stay current with regulatory developments, flag compliance concerns, and I've sought compliance sign-off on at least one novel AI use case"
        ]
      },
      stretch: {
        q: "A new regulatory guidance on AI use in your sector is published. Walk through your process for assessing its implications.",
        opts: [
          "I'd read it and raise anything concerning with my manager",
          "I'd review it against our current AI tool usage and flag any obvious gaps to our compliance team",
          "I'd conduct a structured gap analysis: read the guidance, map it against our approved tool list and use cases, identify gaps, and recommend a prioritised remediation plan",
          "I'd initiate a formal impact assessment: read in full, request legal interpretation, map every applicable provision against our current AI program, and present a risk-prioritised remediation plan"
        ]
      },
      diagnostic: {
        q: "When you adopted your most recently used AI tool, what compliance steps did you take?",
        opts: [
          "I just started using it — it's widely available",
          "I checked whether it was on our approved list before using it",
          "I checked it was approved, reviewed the relevant policy provisions, and confirmed the use case was within scope",
          "I checked it was approved, reviewed data classification rules, confirmed the legal basis for any personal data, and documented my compliance review before using it"
        ]
      }
    }
  },
  {
    dim: 3,
    variants: {
      standard: {
        q: "What happens in your organisation when someone wants to start using a new AI tool that has not been used before?",
        opts: [
          "Nothing formal — people download and use whatever tools they want",
          "There's informal peer discussion about whether a tool is appropriate, but no formal review",
          "There's a defined process: new AI tools go through an approval review covering security, data handling, and appropriate use",
          "We have a rigorous AI vendor and tool governance program: security assessment, data processing agreement review, legal sign-off, risk classification, and formal onboarding"
        ]
      },
      stretch: {
        q: "A team member wants to use a new AI coding assistant that isn't on your approved tool list. They'd like to start immediately. What's your answer?",
        opts: [
          "I'd tell them to be careful with sensitive code and not share anything confidential",
          "I'd say no until it's been approved — we can't use unapproved tools",
          "I'd say no, explain why the approval process exists, help them submit the tool for review, and offer an approved alternative",
          "I'd say no, explain the specific risks, walk them through the approval submission, offer a bridge solution, and flag this as a signal that our approved tool list may need to be expanded"
        ]
      },
      diagnostic: {
        q: "The last new AI tool your team adopted — what approval process did it go through?",
        opts: [
          "It didn't go through a formal process — we just started using it",
          "Someone checked it was safe to use and that was good enough",
          "It went through our IT or compliance review process before we adopted it",
          "It went through our formal AI tool governance process: vendor assessment, security review, data processing agreement, risk classification, and added to our approved tool register"
        ]
      }
    }
  },
  {
    dim: 3,
    variants: {
      standard: {
        q: "You discover that an AI tool your team has been using has produced a systematically biased output that affected client-facing work. What do you do?",
        opts: [
          "I'd stop using the tool and tell my immediate colleagues — I'm not sure what the formal process would be",
          "I'd report it to my manager and suggest we stop using the tool until the issue is understood",
          "I'd immediately escalate through the appropriate channel, assess the scope, initiate a review of impacted client work, and document the incident for compliance and risk teams",
          "I'd activate our AI incident response process: immediate containment, scope assessment, stakeholder notification, root cause analysis, regulatory notification if required, client remediation plan, and lessons-learned review"
        ]
      },
      stretch: {
        q: "The AI incident has now been covered in a trade publication. A journalist asks your communications team for a comment. What happens internally?",
        opts: [
          "I'd make sure we have our story straight and hope it blows over",
          "I'd escalate to our communications and legal team immediately",
          "I'd ensure our incident documentation is complete, brief comms and legal on the facts, and recommend proactive client notification",
          "I'd activate our crisis communications protocol: brief exec team and board if material, coordinate legal-comms-risk response, confirm documentation is complete, and recommend proactive client notification before publication"
        ]
      },
      diagnostic: {
        q: "Does your organisation have a documented AI incident response process? What does it cover?",
        opts: [
          "I'm not aware of one",
          "I think there's something in our general incident management process but nothing AI-specific",
          "We have an AI incident response protocol that covers escalation, containment, and investigation — I know who to contact",
          "We have a formal AI incident response process that I've read: escalation thresholds, containment procedures, scope assessment methodology, regulatory notification triggers, client communication protocol, and post-incident review requirements"
        ]
      }
    }
  },
  // Dimension 4: Strategic Alignment (Questions 21-25)
  {
    dim: 4,
    variants: {
      standard: {
        q: "Where does AI sit in your organisation's strategic agenda — in terms of budget, accountability, and board-level attention?",
        opts: [
          "AI is discussed but it's not a clear strategic priority — no dedicated budget, no named executive owner",
          "AI is on the agenda and there's some budget, but ownership is diffuse and there's no formal multi-year AI strategy",
          "AI is a named strategic priority with dedicated budget, an executive sponsor with accountability, and it features explicitly in our strategic planning process",
          "AI is a board-level strategic commitment: multi-year AI strategy, named C-suite owner with board accountability, dedicated investment reviewed annually, and AI progress reported to the board regularly"
        ]
      },
      stretch: {
        q: "Your organisation has just published its annual report with a prominent commitment to AI-led transformation. What would you need to see internally to believe this commitment is credible?",
        opts: [
          "A public commitment like that means there must be real investment behind it",
          "A named executive owner and a real budget allocation — not just reallocation of existing spend",
          "A named accountable executive, dedicated incremental budget, a multi-year implementation roadmap, board-level reporting metrics, and evidence that AI is being factored into operational planning",
          "All of the above — plus evidence that AI investment has survived a budget pressure cycle, the board has had substantive conversations about AI risk and opportunity, and there's meaningful accountability for delivery"
        ]
      },
      diagnostic: {
        q: "If you had to describe your organisation's AI strategy in one sentence to someone outside, what would you say?",
        opts: [
          "We're exploring how AI can improve efficiency in some of our operations",
          "We have a strategy but I'd struggle to summarise it confidently in one sentence",
          "I can summarise it clearly: who owns it, what the primary ambition is, and what the 12-month priorities are — and that summary would be consistent with what leadership says",
          "I can give you a crisp, accurate one-sentence summary, point to the document it's derived from, and describe the accountability structure and reporting cadence that makes it real"
        ]
      }
    }
  },
  {
    dim: 4,
    variants: {
      standard: {
        q: "When you encounter an AI use case that could create value but carries ethical risk, what governs your response?",
        opts: [
          "I'd focus on whether it works well and whether it's legal — ethics is a secondary consideration",
          "I'd be cautious and raise concerns, but don't have a clear framework for how to evaluate it",
          "I apply a consistent set of principles: I assess potential harms, consider fairness and transparency obligations, evaluate whether human oversight is adequate, and I'd escalate to our ethics or compliance function if the risk is unclear",
          "I've internalised a structured AI ethics framework: fairness, transparency, accountability, and harm prevention; I know our ethics review process for high-risk AI applications; and I've participated in an AI ethics review"
        ]
      },
      stretch: {
        q: "Your team proposes using AI to screen CVs in a hiring process. You know algorithmic bias in recruitment is well-documented. What's your response?",
        opts: [
          "It's worth exploring — bias exists in human processes too, so AI might not be worse",
          "I'd want to see evidence that the tool doesn't discriminate before we adopt it",
          "I'd require a bias audit of the model, review the protected characteristics it might inadvertently use, ensure human oversight is built in, and confirm the legal basis under employment law",
          "I'd require a formal AI ethics review: bias testing across protected characteristic groups, review of training data representativeness, assessment of proxy discrimination risk, legal sign-off, and mandatory human review for all screened-out candidates"
        ]
      },
      diagnostic: {
        q: "Name one AI use case that you believe should not be pursued regardless of the potential value — and explain why.",
        opts: [
          "I can't name one right now — it depends on the context",
          "I'd be uncomfortable with AI making decisions about people without any human oversight",
          "Fully automated adverse decisions that materially affect individuals without a human-reviewable process — the accountability gap creates both ethical and legal exposure",
          "Any use case where the affected individual has no meaningful recourse, the decision is irreversible, the model can't be explained, and human accountability cannot be attached to the outcome"
        ]
      }
    }
  },
  {
    dim: 4,
    variants: {
      standard: {
        q: "How are you personally investing in building your own AI capability — beyond just using the tools your organisation provides?",
        opts: [
          "I rely on what my organisation provides — I haven't invested personal time in building AI capability",
          "I occasionally explore new AI tools on my own and read articles when they come up, but it's not deliberate",
          "I have a deliberate personal development plan for AI: at least one structured AI programme in the past 12 months and I regularly experiment with new tools",
          "AI capability development is a genuine professional priority: structured learning plan, multiple AI programmes, a personal AI knowledge base, and I'm recognised as someone who brings AI knowledge others can use"
        ]
      },
      stretch: {
        q: "Your organisation offers no AI training and has no budget for it. What's your personal plan for the next 6 months?",
        opts: [
          "I'd hope the organisation sorts it out eventually — it's hard to invest without support",
          "I'd use free resources when I can find them and try to stay current through general reading",
          "I have a self-directed learning plan: specific programmes, a weekly time commitment, peer learning communities, and experiments I'd run with available tools",
          "I'd execute a structured 6-month capability sprint: identify specific skill gaps, select the best available programmes, commit to a weekly learning cadence, build a personal experiment practice, and set measurable milestones"
        ]
      },
      diagnostic: {
        q: "What's the most recent AI capability you built that changed how you work? How did you build it?",
        opts: [
          "I can't point to a specific new capability I've built recently",
          "I've got more comfortable with one or two tools through using them more",
          "I can name a specific capability, describe how I built it, and show you where it shows up in my actual workflow",
          "I can describe a specific capability, the learning process, the time investment, and the measurable impact — and I'm already working on the next one"
        ]
      }
    }
  },
  {
    dim: 4,
    variants: {
      standard: {
        q: "How closely do you personally track AI developments among your competitors, sector peers, and adjacent industries?",
        opts: [
          "I'm aware that competitors are investing in AI but don't systematically track what they're doing",
          "I pay attention when major AI announcements are made in my sector and discuss them when they come up",
          "I actively monitor AI developments in my competitive landscape and can articulate where my organisation is ahead, at parity, or behind",
          "AI competitive intelligence is part of how I think strategically: I have a regular monitoring habit, synthesise signals from competitors and regulators, and I've briefed leadership on competitive AI dynamics"
        ]
      },
      stretch: {
        q: "Name one competitor or sector peer whose AI strategy you respect — and explain specifically what they're doing differently.",
        opts: [
          "I'm aware some competitors are investing heavily but couldn't name a specific one",
          "I can name one but would describe their approach in general terms",
          "I can name one, describe 2–3 specific things they're doing that are differentiated from the sector norm, and explain why I think their approach is effective",
          "I can name at least two, compare their approaches, explain what differentiates each, assess the competitive implications for my organisation, and tell you what we should be doing differently"
        ]
      },
      diagnostic: {
        q: "When did you last directly update your view of your organisation's AI competitive position — based on new information?",
        opts: [
          "I have a general sense but haven't specifically updated my view recently",
          "In a meeting or conversation in the last few months when it came up",
          "In the last month — I read or heard something specific that prompted me to revise my assessment",
          "In the last 2 weeks — I have an active monitoring practice and update my competitive AI map regularly based on new signals"
        ]
      }
    }
  },
  {
    dim: 4,
    variants: {
      standard: {
        q: "Think about colleagues who are sceptible, anxious, or disengaged when it comes to AI. What is your role in how they experience AI adoption?",
        opts: [
          "I focus on my own adoption — it's not my responsibility to bring others along",
          "I share useful tools and information when asked, but don't proactively try to shift others' mindsets",
          "I actively help colleagues who are uncertain: I share practical examples of what works, address concerns directly, and try to make AI feel accessible and relevant to their specific work",
          "I see myself as an AI adoption catalyst: I've deliberately worked to shift team culture, run informal training or demonstrations, and I've measurably moved my immediate team toward greater AI confidence"
        ]
      },
      stretch: {
        q: "A senior colleague with significant institutional influence is openly dismissive of AI and quietly undermining your team's adoption efforts. How do you handle this?",
        opts: [
          "I'd try to avoid the conflict and continue progressing with the people who are engaged",
          "I'd talk to them directly and try to understand their concerns",
          "I'd seek a private conversation to understand their specific concerns, find a use case that addresses their most important challenge, and invite them to be part of the solution",
          "I'd have a direct conversation to understand the root of their resistance, find a genuine point of connection between their priorities and AI's potential, propose a low-risk pilot they could feel ownership of, and treat their influence as an asset to the change effort"
        ]
      },
      diagnostic: {
        q: "Name one colleague who changed their view of AI because of something you did or said. What was it?",
        opts: [
          "I can't think of a specific example — I don't really see that as my role",
          "I've had conversations that seemed to shift someone's thinking but nothing concrete I can point to",
          "I can name a specific colleague and describe a specific conversation or demonstration that changed their view — I know because their behaviour changed afterwards",
          "I can name several and describe the specific moment for each — I actively track who in my team is shifting on AI adoption because I see it as part of my leadership responsibility"
        ]
      }
    }
  },
];

// Scoring tiers
export const TIERS = [
  { name: 'Beginner', emoji: '🌱', min: 25, max: 44, color: '#B32B2B' },
  { name: 'Developing', emoji: '📈', min: 45, max: 62, color: '#B86A00' },
  { name: 'Intermediate', emoji: '⚡', min: 63, max: 80, color: '#1A7BC4' },
  { name: 'Advanced', emoji: '🚀', min: 81, max: 100, color: '#1A6B3A' },
] as const;

// Intelligence categories
export const INTELLIGENCE_CATEGORIES = [
  'Professional Profile',
  'Skills & Credentials',
  'Company Overview',
  'Company AI Posture',
  'Industry AI Landscape',
  'Regulatory Environment',
  'Country AI Policy',
  'Competitive Intelligence',
  'AI Skills Market',
  'Technology Stack',
  'Peer Benchmarks',
  'Recent AI Events',
] as const;

export const INTELLIGENCE_KEYS = [
  'professionalProfile',
  'skillsCredentials',
  'companyOverview',
  'companyAIPosture',
  'industryAILandscape',
  'regulatoryEnvironment',
  'countryAIPolicy',
  'competitiveIntelligence',
  'aiSkillsMarket',
  'technologyStack',
  'peerBenchmarks',
  'recentAIEvents',
] as const;

// Cohort codes
export const COHORT_CODES = [
  'OXSAID-2026',
  'ESCP-2026',
  'HSBC-AI',
  'MUFG-2026',
  'NHS-AI',
  'AINF-2026',
  'TEST',
  'DEMO',
] as const;
