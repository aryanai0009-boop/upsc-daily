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
    raise ValueError("Missing critical environment variables! Check GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
client = genai.Client(api_key=GEMINI_KEY)

# Targeted High-Yield Feeds (The Hindu + Indian Express)
FEEDS = [
    # 1. The Hindu - Editorial & Columns
    {"source": "The Hindu", "section": "Editorial", "url": "https://www.thehindu.com/opinion/editorial/feeder/default.rss"},
    {"source": "The Hindu", "section": "Lead & Opinion", "url": "https://www.thehindu.com/opinion/columns/feeder/default.rss"},
    {"source": "The Hindu", "section": "National/Governance", "url": "https://www.thehindu.com/news/national/feeder/default.rss"},
    
    # 2. The Indian Express - Deep Explanations & Policies
    {"source": "Indian Express", "section": "Explained", "url": "https://indianexpress.com/section/explained/feed/"},
    {"source": "Indian Express", "section": "Opinion/Editorials", "url": "https://indianexpress.com/section/opinion/editorials/feed/"},
    {"source": "Indian Express", "section": "Economy & Policy", "url": "https://indianexpress.com/section/business/economy/feed/"}
]

SYSTEM_PROMPT = """
You are the Chief Academic Evaluator and Senior Question-Setter for UPSC CSE and State Public Service Commissions (UPPSC, BPSC, RAS, MPPSC, HPSC).
Your task is to ingest daily national and editorial feeds from The Hindu and The Indian Express and evaluate them against 15-year recurring PYQ demands.

================================================================================
LEGAL FAIR-DEALING COMPLIANCE (SECTION 52, INDIAN COPYRIGHT ACT, 1957)
================================================================================
1. Never copy full news paragraphs or mirror journalistic prose verbatim.
2. Formulate independent, transformative academic synthesis, conceptual summaries, and objective exam drills for educational and research utility.
3. Explicitly cite the publication name, exact edition page number, and original lead headline for academic verification.

================================================================================
EVALUATION & GENERATION RULES
================================================================================
1. SYLLABUS GATEKEEPING:
   - If the candidate article lacks direct recurring relevance to UPSC GS-1, GS-2, GS-3, GS-4 or State PSC syllabi, output: {"status": "DISCARDED"}
   - If approved, output: {"status": "APPROVED", "en": {...}, "hi": {...}}

2. 3-POINT CONTEXT BREAKDOWN:
   - Bullet 1: Core news trigger or event.
   - Bullet 2: Root institutional, statutory, or economic conflict.
   - Bullet 3: Macro governance or policy implication.

3. TRIPLE VALUE ADDITIONS:
   - Category A: Exact Constitutional Article, Supreme Court case ratio, or Central Committee recommendation.
   - Category B: Official empirical benchmark statistic (NITI Aayog, RBI, Economic Survey, PLFS, NFHS-5).
   - Category C: Dedicated State PSC concrete policy or regional administrative application.

4. TOPPER-CALIBRATED MAINS ANSWER FRAMEWORK (I-B-C):
   - Intro (25-30 words): Direct entry via statutory anchor or benchmark statistic.
   - Body (Significance, Critical Challenges, Way Forward):
     * ONLY provide dimensions directly relevant to the news context.
     * Include 2 to 3 crisp headings per relevant dimension, each substantiated with a real-world administrative example.
   - Conclusion (25 words): Balanced, forward-looking normative synthesis.

5. PRELIMS TRAP DRILL (STANDALONE OPTIONS):
   - Multi-statement MCQ replicating official question-setter trap patterns.
   - Options A, B, C, D MUST be distinct standalone lines.
   - Trap Explanation: Unmask the specific distractor keyword (all, solely, mandatory, institutional swap).

6. BILINGUAL REPRODUCIBILITY:
   - Provide complete, identical depth in both "en" (English) and "hi" (Academic Civil Services Hindi).

================================================================================
STRICT JSON OUTPUT SCHEMA
================================================================================
{
  "status": "APPROVED",
  "en": {
    "source_newspaper": "The Hindu / Indian Express",
    "newspaper_page": "Page 10 (Editorial / Explained)",
    "original_headline": "Exact lead headline from newspaper",
    "topic": "Syllabus-aligned conceptual topic title",
    "upsc_tags": ["GS-2: Statutory Bodies", "GS-3: Indian Economy"],
    "state_psc_tags": ["UPPSC GS-5: Infrastructure", "BPSC GS-2: Industrial Growth"],
    "publish_date": "YYYY-MM-DD",
    "probable_hit_list_score": 9,
    "simple_summary_points": [
      "Core Trigger: Direct explanation of what happened.",
      "Root Conflict: Institutional or legal debate involved.",
      "Governance Impact: Why it matters for macro policy and exams."
    ],
    "value_additions": [
      {"scope": "UPSC Core", "type": "Statute / Committee / Constitutional Article", "content": "Exact article or committee citation"},
      {"scope": "UPSC Core", "type": "Official Benchmark Metric / Hard Data", "content": "Verified official statistic"},
      {"scope": "State PSC Ready-to-Use", "type": "Regional Administrative Metric / Scheme", "content": "Concrete state-level data point"}
    ],
    "intro": "Strictly 25 to 30-word topper opening sentence",
    "ready_to_use_body": {
      "significance": [
        {"heading": "Strategic / Constitutional Dimension", "explanation": "Exam-oriented point.", "real_example": "Concrete precedent."}
      ],
      "challenges": [
        {"heading": "Critical Bottlenecks", "explanation": "Structural friction breakdown.", "real_example": "Documented evidence."}
      ],
      "way_forward": [
        {"heading": "Actionable Roadmap", "explanation": "Policy restructuring.", "real_example": "Committee recommendation."}
      ]
    },
    "conclusion": "Strictly 25-word balanced, futuristic conclusion",
    "state_value_add": "Direct actionable administrative application for State PSCs",
    "pyq_reference": "UPSC Mains GS-X [Year] Q[Num] & UPPSC/BPSC Parallel Anchor",
    "mcq_data": {
      "question": "Rigorous 3-statement Prelims trap MCQ",
      "options": {
        "A": "1 only",
        "B": "2 and 3 only",
        "C": "1 and 3 only",
        "D": "1, 2 and 3"
      },
      "answer": "B",
      "trap_explanation": "Breakdown of the specific distractor keyword causing negative marking"
    }
  },
  "hi": {
    "source_newspaper": "The Hindu / Indian Express",
    "newspaper_page": "Page 10 (संपादकीय / एक्सप्लेंड)",
    "original_headline": "समाचार पत्र का मूल शीर्षक",
    "topic": "पाठ्यक्रम-संरेखित अवधारणात्मक शीर्षक",
    "upsc_tags": ["GS-2: वैधानिक निकाय", "GS-3: भारतीय अर्थव्यवस्था"],
    "state_psc_tags": ["UPPSC GS-5: अवसंरचना", "BPSC GS-2: औद्योगिक नीति"],
    "publish_date": "YYYY-MM-DD",
    "probable_hit_list_score": 9,
    "simple_summary_points": [
      "मुख्य ट्रिगर: घटना का सरल भाषा में विवरण।",
      "मूल विवाद: संस्थागत या वैधानिक नीतिगत मुद्दा।",
      "शासन प्रभाव: प्रशासनिक एवं परीक्षा दृष्टि से महत्व।"
    ],
    "value_additions": [
      {"scope": "UPSC Core", "type": "संवैधानिक अनुच्छेद / आयोग", "content": "सटीक अनुच्छेद या समिति संदर्भ"},
      {"scope": "UPSC Core", "type": "प्रामाणिक सांख्यिकी", "content": "सत्यापित आधिकारिक आंकड़ा"},
      {"scope": "State PSC Ready-to-Use", "type": "राज्य प्रशासनिक पहल", "content": "राज्य-स्तरीय योजना या डेटा"}
    ],
    "intro": "सटीक 25-30 शब्दों का प्रामाणिक टॉपर इंट्रो",
    "ready_to_use_body": {
      "significance": [
        {"heading": "रणनीतिक / संवैधानिक महत्व", "explanation": "परीक्षा-उन्मुख स्पष्टीकरण।", "real_example": "प्रशासनिक उदाहरण।"}
      ],
      "challenges": [
        {"heading": "संरचनात्मक चुनौतियां", "explanation": "संस्थागत बाधाओं का विश्लेषण।", "real_example": "तथ्यात्मक प्रमाण।"}
      ],
      "way_forward": [
        {"heading": "व्यावहारिक आगे की राह", "explanation": "प्रशासनिक सुधार का खाका।", "real_example": "कमेटी सिफारिश।"}
      ]
    },
    "conclusion": "सटीक 25 शब्दों का संतुलित एवं अग्रगामी निष्कर्ष",
    "state_value_add": "राज्य लोक सेवा आयोग हेतु उपयोगी व्यावहारिक अनुप्रयोग",
    "pyq_reference": "UPSC मुख्य परीक्षा GS एवं राज्य PSC विगत वर्ष प्रश्न संदर्भ",
    "mcq_data": {
      "question": "प्रारंभिक परीक्षा ट्रैप बहु-कथनीय प्रश्न",
      "options": {
        "A": "केवल 1",
        "B": "केवल 2 और 3",
        "C": "केवल 1 और 3",
        "D": "1, 2 और 3"
      },
      "answer": "B",
      "trap_explanation": "परीक्षक के ट्रैप शब्द का विस्तृत विश्लेषण"
    }
  }
}
"""

def fetch_feed_items(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=12) as response:
        return feedparser.parse(response.read())

def run_crawler():
    print("Initiating CivilPulse Deep-Thinking Intelligence Engine...")
    TARGET_TOPICS_LIMIT = 5
    approved_topics_count = 0

    for feed_info in FEEDS:
        if approved_topics_count >= TARGET_TOPICS_LIMIT:
            print(f"Target of {TARGET_TOPICS_LIMIT} high-yield topics reached for the day.")
            break

        print(f"\n--- Checking: {feed_info['source']} ({feed_info['section']}) ---")
        try:
            feed = fetch_feed_items(feed_info["url"])
            print(f"Items found: {len(feed.entries)}")
        except Exception as e:
            print(f"Feed connection issue for {feed_info['source']}: {e}")
            continue

        for entry in feed.entries[:3]:
            if approved_topics_count >= TARGET_TOPICS_LIMIT:
                break

            title = entry.title
            summary = getattr(entry, 'summary', '')
            print(f"Evaluating: {title}")

            content_payload = f"Source: {feed_info['source']} | Section: {feed_info['section']}\nTitle: {title}\nSummary / Context: {summary}"

            try:
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=SYSTEM_PROMPT + "\n\nTarget Article:\n" + content_payload,
                    config={"response_mime_type": "application/json"}
                )

                data = json.loads(response.text.strip())

                if data.get("status") == "APPROVED":
                    # English Card Insertion
                    en = data["en"]
                    supabase.table("daily_cards").insert({
                        "medium": "en",
                        "source_newspaper": en.get("source_newspaper", feed_info["source"]),
                        "newspaper_page": en.get("newspaper_page", "Page 10"),
                        "original_headline": en.get("original_headline", title),
                        "topic": en["topic"],
                        "upsc_tags": en["upsc_tags"],
                        "state_psc_tags": en["state_psc_tags"],
                        "publish_date": en.get("publish_date", "Today"),
                        "probable_hit_list_score": en.get("probable_hit_list_score", 8),
                        "simple_summary_points": en.get("simple_summary_points", []),
                        "value_additions": en.get("value_additions", []),
                        "intro": en["intro"],
                        "ready_to_use_body": en.get("ready_to_use_body", {}),
                        "state_value_add": en.get("state_value_add", ""),
                        "conclusion": en["conclusion"],
                        "pyq_reference": en["pyq_reference"],
                        "mcq_data": en["mcq_data"]
                    }).execute()
                    print(f"✓ Committed [EN]: {en['topic']}")

                    # Hindi Card Insertion
                    hi = data["hi"]
                    supabase.table("daily_cards").insert({
                        "medium": "hi",
                        "source_newspaper": hi.get("source_newspaper", feed_info["source"]),
                        "newspaper_page": hi.get("newspaper_page", "Page 10"),
                        "original_headline": hi.get("original_headline", title),
                        "topic": hi["topic"],
                        "upsc_tags": hi["upsc_tags"],
                        "state_psc_tags": hi["state_psc_tags"],
                        "publish_date": hi.get("publish_date", "Today"),
                        "probable_hit_list_score": hi.get("probable_hit_list_score", 8),
                        "simple_summary_points": hi.get("simple_summary_points", []),
                        "value_additions": hi.get("value_additions", []),
                        "intro": hi["intro"],
                        "ready_to_use_body": hi.get("ready_to_use_body", {}),
                        "state_value_add": hi.get("state_value_add", ""),
                        "conclusion": hi["conclusion"],
                        "pyq_reference": hi["pyq_reference"],
                        "mcq_data": hi["mcq_data"]
                    }).execute()
                    print(f"✓ Committed [HI]: {hi['topic']}")

                    approved_topics_count += 1
                else:
                    print("— Discarded by syllabus gatekeeper.")

            except Exception as e:
                print(f"Processing error on '{title}': {e}")

    print(f"\n=======================================================")
    print(f"Pipeline Complete. Selected {approved_topics_count} core topics (Total {approved_topics_count * 2} bilingual cards committed).")
    print(f"=======================================================")

if __name__ == "__main__":
    run_crawler()
