import os
import json
import urllib.request
import feedparser
from google import genai
from supabase import create_client

# Environment Variables
GEMINI_KEY = os.environ.get("GEMINI_API_KEY")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

if not all([GEMINI_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY]):
    raise ValueError("Missing critical environment variables!")

# Clients
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
client = genai.Client(api_key=GEMINI_KEY)

# Active working endpoints for Indian Express Explained & Hindu Editorial/National
FEEDS = [
    {
        "name": "Indian Express Explained",
        "url": "https://indianexpress.com/section/explained/feed/"
    },
    {
        "name": "The Hindu Editorial",
        "url": "https://www.thehindu.com/opinion/editorial/feeder/default.rss"
    },
    {
        "name": "The Hindu National",
        "url": "https://www.thehindu.com/news/national/feeder/default.rss"
    }
]

SYSTEM_PROMPT = """
You are an expert UPSC Civil Services and State PSC (UPPSC, BPSC, RAS, MPPSC) examination director, paper setter, and senior Mains evaluator.

YOUR TASK:
Rigorously evaluate the provided newspaper article (Editorials/Explained) against official GS Papers (GS-1, GS-2, GS-3, GS-4) and State Public Service Commission core syllabi.

STEP 1: STRICT SYLLABUS GATEKEEPER
- If the article is sensational crime, purely electoral party speeches, sports entertainment, or celebrity gossip, discard immediately: {"status": "SKIP"}
- Approve ONLY if it involves Constitutional law, governance structures, judicial interpretation, macroeconomic indicators, foreign policy, science/defence policy, or ecology/disaster management.

STEP 2: CURATE HIGH-YIELD INTELLIGENCE (Strictly follow this structure)
Return ONLY a valid JSON object matching this exact structure:

{
  "status": "APPROVED",
  "en": {
    "topic": "Concise 8-10 word high-impact analytical title",
    "upsc_tags": ["GS-Paper: Micro-syllabus topic (e.g., GS-2: Judicial Review & Basic Structure)"],
    "state_psc_tags": ["State Paper: Topic (e.g., UPPSC GS-5: Administrative Reforms in UP)"],
    "crux_points": [
      "Factual anchor & trigger (date, context, committee, act)",
      "Core constitutional/statutory baseline or treaty provision",
      "Actionable structural impact on Indian governance/economy"
    ],
    "intro": "30-word academic, punchy Mains opening sentence suitable for directly scoring marks.",
    "body_dimensions": [
      "Socio-Political/Constitutional: Relevant Articles, Acts, or Doctrine",
      "Judicial/Committee Dimension: Supreme Court verdicts or Commission reports",
      "Governance & Operational Bottlenecks: Real-world administrative hurdles"
    ],
    "state_value_add": "Specific comparative analysis or direct implication for UP/Bihar/Rajasthan/MP governance.",
    "conclusion": "Pragmatic, constitutional, and sustainable way forward.",
    "pyq_reference": "Exact or closely mapped past year question citation (e.g., UPSC Mains 2022 GS-2 Q3).",
    "mcq_data": {
      "question": "Standard multi-statement UPSC Prelims trap question (Statements 1, 2, 3 format).",
      "options": {
        "A": "1 and 2 only",
        "B": "2 and 3 only",
        "C": "1 and 3 only",
        "D": "1, 2 and 3"
      },
      "answer": "B",
      "trap_explanation": "Detailed conceptual dissection of why Statement 1 is an examiner trap and why option B is correct."
    }
  },
  "hi": {
    "topic": "सटीक 8-10 शब्दों का अकादमिक शीर्षक",
    "upsc_tags": ["जीएस प्रश्नपत्र: सूक्ष्म पाठ्यक्रम विषय"],
    "state_psc_tags": ["राज्य प्रश्नपत्र: सूक्ष्म विषय"],
    "crux_points": [
      "प्रमुख घटनाक्रम एवं कानूनी/वैधानिक संदर्भ",
      "संवैधानिक आधार एवं वर्तमान नीतिगत प्रभाव",
      "भारतीय शासन व्यवस्था एवं अर्थव्यवस्था पर परिणाम"
    ],
    "intro": "मुख्य परीक्षा उत्तर पुस्तिका हेतु 30 शब्दों की अकादमिक एवं प्रभावी भूमिका।",
    "body_dimensions": [
      "संवैधानिक एवं नीतिगत आयाम: प्रमुख अनुच्छेद, अधिनियम या सिद्धांत",
      "न्यायिक दृष्टिकोण एवं समितियाँ: उच्चतम न्यायालय के निर्णय या आयोगों की सिफारिशें",
      "प्रशासनिक एवं संस्थागत चुनौतियाँ: कार्यान्वयन स्तर की वास्तविक बाधाएं"
    ],
    "state_value_add": "उत्तर प्रदेश/बिहार/मध्य प्रदेश/राजस्थान के विशेष संदर्भ में शासन एवं नीतिगत प्रभाव।",
    "conclusion": "संतुलित, व्यावहारिक एवं भविष्योन्मुखी समाधान।",
    "pyq_reference": "सटीक विगत वर्ष प्रश्न (PYQ) संदर्भ (उदा. UPSC Mains 2021 GS-2).",
    "mcq_data": {
      "question": "कथन आधारित प्रीलिम्स प्रश्न (कथन 1, 2, 3 रूप में)।",
      "options": {
        "A": "केवल 1 और 2",
        "B": "केवल 2 और 3",
        "C": "केवल 1 और 3",
        "D": "1, 2 और 3 सभी"
      },
      "answer": "B",
      "trap_explanation": "अवधारणात्मक व्याख्या कि कौन सा कथन परीक्षक का भ्रामक जाल है और सही उत्तर क्या है।"
    }
  }
}
"""

def fetch_feed_with_browser_headers(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as response:
        return feedparser.parse(response.read())

def run_crawler():
    print("Initiating CivilPulse Autonomous Ingestion Engine...")
    total_committed = 0

    for feed_meta in FEEDS:
        print(f"\nScanning Channel: {feed_meta['name']}")
        try:
            feed = fetch_feed_with_browser_headers(feed_meta["url"])
            print(f"Total live entries detected: {len(feed.entries)}")
        except Exception as e:
            print(f"Feed connection failed for {feed_meta['name']}: {e}")
            continue

        # Top 3 daily pieces
        for entry in feed.entries[:3]:
            title = entry.title
            summary = getattr(entry, 'summary', '')
            print(f"Synthesizing: {title}")

            article_text = f"Title: {title}\nSummary / Context:\n{summary}"

            try:
                response = client.models.generate_content(
                    model="gemini-3.8-flash",
                    contents=SYSTEM_PROMPT + "\n\nTarget Article:\n" + article_text,
                    config={"response_mime_type": "application/json"}
                )

                payload = json.loads(response.text.strip())

                if payload.get("status") == "APPROVED":
                    # English Card Ingestion
                    en = payload["en"]
                    supabase.table("daily_cards").insert({
                        "medium": "en",
                        "topic": en["topic"],
                        "upsc_tags": en["upsc_tags"],
                        "state_psc_tags": en["state_psc_tags"],
                        "crux_points": en["crux_points"],
                        "intro": en["intro"],
                        "body_dimensions": en["body_dimensions"],
                        "state_value_add": en["state_value_add"],
                        "conclusion": en["conclusion"],
                        "pyq_reference": en["pyq_reference"],
                        "mcq_data": en["mcq_data"]
                    }).execute()
                    print(f"✓ Committed [EN]: {en['topic']}")

                    # Hindi Card Ingestion
                    hi = payload["hi"]
                    supabase.table("daily_cards").insert({
                        "medium": "hi",
                        "topic": hi["topic"],
                        "upsc_tags": hi["upsc_tags"],
                        "state_psc_tags": hi["state_psc_tags"],
                        "crux_points": hi["crux_points"],
                        "intro": hi["intro"],
                        "body_dimensions": hi["body_dimensions"],
                        "state_value_add": hi["state_value_add"],
                        "conclusion": hi["conclusion"],
                        "pyq_reference": hi["pyq_reference"],
                        "mcq_data": hi["mcq_data"]
                    }).execute()
                    print(f"✓ Committed [HI]: {hi['topic']}")

                    total_committed += 2
                else:
                    print(f"— Discarded (Off-syllabus / Low exam relevance)")

            except Exception as e:
                print(f"Ingestion error on '{title}': {e}")

    print(f"\nDone. Total verified cards inserted into Supabase: {total_committed}")

if __name__ == "__main__":
    run_crawler()
