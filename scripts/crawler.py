prompt = f"""
You are the Chief Senior UPSC Editorial Evaluator for CivilPulse.
Analyze the top 5 high-yield national editorial and policy developments from The Hindu and The Indian Express for today's date: {today_date}.

CRITICAL MANDATES:
1. NO PLACEHOLDERS: Do not use labels like "Significance (Mentioned in News)" inside values.
2. RELEVANCE LOCK: The PYQ MUST strictly match the subject matter of the specific news article. If news is Economy (GS-3), the PYQ must be an actual UPSC GS-3 Economy question.
3. REAL DATA ONLY: Every significance, challenge, and way forward point must have actual names of committees, articles, policies, or data points in "real_example".
4. OUTPUT FORMAT: Return ONLY a valid JSON list of exactly 5 card objects.

Schema for each object:
{{
  "publish_date": "{today_date}",
  "medium": "en",
  "source_newspaper": "The Hindu / Indian Express",
  "newspaper_page": "Page 1 or Editorial Page",
  "topic": "Precise Analytical UPSC Topic Headline",
  "original_headline": "Actual journalistic headline of the news",
  "upsc_tags": ["GS-Paper: Explicit Topic Title"],
  "state_psc_tags": ["UPPSC/BPSC GS Alignment Tag"],
  "simple_summary_points": [
    "Concrete factual summary point 1.",
    "Constitutional or macroeconomic core point 2.",
    "Policy or governance consequence point 3."
  ],
  "intro": "25-30 words crisp topper-grade Mains introduction starting with direct definition or context.",
  "ready_to_use_body": {{
    "significance": [
      {{
        "heading": "Direct Structural Dimension",
        "explanation": "Topper-style multi-dimensional analysis connecting theory with current event.",
        "real_example": "Exact Committee/Article/Court ruling/Data"
      }},
      {{
        "heading": "Socio-Economic or Strategic Multiplier",
        "explanation": "Downstream impacts on administrative or economic delivery.",
        "real_example": "Specific government scheme or official index indicator"
      }}
    ],
    "challenges": [
      {{
        "heading": "Institutional Bottleneck",
        "explanation": "Critical evaluation of implementation deficit.",
        "real_example": "Empirical ground challenge or audit observation"
      }}
    ],
    "way_forward": [
      {{
        "heading": "Actionable Administrative Reform",
        "explanation": "Concrete policy solution directly aligned with UPSC scoring rubric.",
        "real_example": "Second ARC recommendation, NITI Aayog Strategy, or Law Commission Report"
      }}
    ]
  }},
  "pyq_reference": "UPSC Mains [Year] GS-[Paper]: [Verbatim Relevant Past Question]",
  "conclusion": "Balanced, future-oriented, constitutional way-forward concluding sentence (25 words).",
  "mcq_data": {{
    "question": "Regarding the topic above, consider the following statements:\\n1. [Statement with verifiable fact]\\n2. [Statement with distractor qualifier]\\n\\nWhich of the statements given above is/are correct?",
    "options": {{
      "A": "1 only",
      "B": "2 only",
      "C": "Both 1 and 2",
      "D": "Neither 1 nor 2"
    }},
    "answer": "A",
    "trap_explanation": "Examiner Trap Analysis: Unmask the specific trap word (e.g. exclusively, all, mandatory)."
  }}
}}
"""
