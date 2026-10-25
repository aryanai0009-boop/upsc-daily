import os
import json
import datetime
import requests
import google.generativeai as genai
from supabase import create_client

# 1. API Keys uthana
GEMINI_KEY = os.environ.get("GEMINI_API_KEY")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_ANON_KEY")

genai.configure(api_key=GEMINI_KEY)
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# 2. Indian Standard Time (IST) se Current Date nikalna
ist_now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=5, minutes=30)))
today_date = ist_now.strftime('%Y-%m-%d')

print(f"Executing CivilPulse Automation for Date: {today_date}")

# 3. Gemini Prompt for 10-Feature UPSC News Processing
prompt = f"""
You are the senior chief editorial mentor for CivilPulse UPSC CSE intelligence.
Analyze today's ({today_date}) top national editorial themes from The Hindu and The Indian Express.

Generate exactly 5 comprehensive JSON objects in a valid JSON list. Each object MUST strictly follow this exact schema:
[
  {{
    "publish_date": "{today_date}",
    "medium": "en",
    "source_newspaper": "The Hindu / Indian Express",
    "newspaper_page": "Page 10",
    "topic": "High-yield analytical UPSC headline",
    "original_headline": "Actual newspaper article lead",
    "upsc_tags": ["GS-2: Topic Name", "Polity & Governance"],
    "state_psc_tags": ["UPPSC GS-5: Governance and Administrative Structure"],
    "simple_summary_points": [
      "Point 1: Concrete factual crux of the news.",
      "Point 2: Core institutional or constitutional issue.",
      "Point 3: Direct administrative or developmental consequence."
    ],
    "intro": "Ready-made Mains intro adhering to standard 25-30 words format.",
    "ready_to_use_body": {{
      "significance": [
        {{
          "heading": "Direct Constitutional/Economic Significance",
          "explanation": "Topper-level conceptual explanation.",
          "real_example": "Concrete Indian case, committee or scheme"
        }}
      ],
      "challenges": [
        {{
          "heading": "Structural Bottleneck",
          "explanation": "Critical evaluation of the issue.",
          "real_example": "Official data point or observed deficit"
        }}
      ],
      "way_forward": [
        {{
          "heading": "Strategic Policy Solution",
          "explanation": "Actionable administrative recommendation.",
          "real_example": "Second ARC or NITI Aayog policy guideline"
        }}
      ]
    }},
    "pyq_reference": "UPSC Mains 2022 GS-2: Corresponding direct question.",
    "conclusion": "Future-oriented balanced conclusion with constitutional value.",
    "mcq_data": {{
      "question": "3-statement examiner trap prelims question:",
      "options": {{
        "A": "1 only",
        "B": "2 and 3 only",
        "C": "1 and 3 only",
        "D": "1, 2 and 3"
      }},
      "answer": "A",
      "trap_explanation": "Trap analysis explaining distractor qualifiers."
    }}
  }}
]

Return ONLY the raw JSON list. No markdown backticks, no explanations.
"""

model = genai.GenerativeModel("gemini-1.5-flash")
response = model.generate_content(prompt)
cleaned_text = response.text.replace("```json", "").replace("```", "").strip()

news_items = json.loads(cleaned_text)

# 4. Supabase Database me Insert karna
for item in news_items:
    supabase.table("daily_cards").insert(item).execute()

print(f"Successfully inserted {len(news_items)} intelligence cards into Supabase for {today_date}!")
