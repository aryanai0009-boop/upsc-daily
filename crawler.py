import os
import json
import urllib.request
import feedparser
from google import genai
from supabase import create_client

GEMINI_KEY = os.environ.get("GEMINI_API_KEY")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

if not all([GEMINI_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY]):
    raise ValueError("Missing critical environment variables!")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
client = genai.Client(api_key=GEMINI_KEY)

FEEDS = [
    {"source": "The Hindu", "section": "Editorial", "url": "https://www.thehindu.com/opinion/editorial/feeder/default.rss"},
    {"source": "The Hindu", "section": "Lead & Opinion", "url": "https://www.thehindu.com/opinion/columns/feeder/default.rss"},
    {"source": "The Hindu", "section": "National/Governance", "url": "https://www.thehindu.com/news/national/feeder/default.rss"},
    {"source": "Indian Express", "section": "Explained", "url": "https://indianexpress.com/section/explained/feed/"},
    {"source": "Indian Express", "section": "Opinion/Editorials", "url": "https://indianexpress.com/section/opinion/editorials/feed/"},
    {"source": "Indian Express", "section": "Economy & Policy", "url": "https://indianexpress.com/section/business/economy/feed/"}
]

SYSTEM_PROMPT = """
You are the Chief Academic Evaluator and Senior Question-Setter for UPSC CSE and State PSCs (UPPSC, BPSC, RAS, MPPSC).
Your operational duty is to transform daily editorial feeds into examiner-grade intelligence strictly following the 10-point pedagogical framework below.

CRITICAL FAIR-DEALING & CITATION MANDATE (SECTION 52, INDIAN COPYRIGHT ACT, 1957):
1. Never copy full news paragraphs or mirror journalistic prose verbatim. Formulate transformative academic synthesis.
2. Systematically cite the publication, exact edition page number, and original lead headline.
3. DO NOT INVENT OR PAD WITH FICTIONAL DATA. If empirical data or constitutional articles are not present in the news or its immediate statutory basis, DO NOT force them.

10-POINT PEDAGOGICAL EXECUTION RULES:
1. Real News & Real Heading from The Hindu / Indian Express with daily date update.
2. Link News with Exact syllabus of UPSC (GS-1/2/3/4) and State PCS (UPPSC GS-5/6, BPSC GS-2). Discard if non-syllabus: {"status": "DISCARDED"}
3. 3 Points in simple summary: Explain in crystal-clear simple language what happened, the root conflict, and governance impact.
4. Data/Facts/Value Addition: Extract real data, committees, or articles ONLY WHEN AVAILABLE in the news context.
5. Ready-made Introduction about the news (strictly 25-30 words, topper style).
6. Ready-to-use Body (Telling brief in detail about news):
   - STRICT NOTEBOOK RULE: Include Significance, Challenges, and Way Forward ONLY IF MENTIONED IN THE NEWS.
   - If only significance is mentioned, include only significance. If challenges and way forward are mentioned, include both. If all three are mentioned, include all three.
7. Body Presentation Format: Under each active dimension, present points as:
   - Heading (in brackets)
   - Explanation
   - Ex -> Real-world Example (concrete precedent)
8. Match PYQ of that news: Direct dual reference (UPSC Mains GS-X [Year] & State PSC Parallel Anchor).
9. Short Conclusion: Future-oriented, topper-style, ready to use in exam, balanced (strictly 25 words).
10. One Prelims MCQ to test on basis of news: 3-statement question with standalone options A, B, C, D on separate lines and distractor trap unmasked.

Provide complete output in BOTH "en" (English) and "hi" (Academic Civil Services Hindi).

Return ONLY valid JSON matching this schema:
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
    "simple_summary_points": ["Point 1: Trigger event", "Point 2: Institutional friction", "Point 3: Policy implication"],
    "value_additions": [
      {"scope": "UPSC Core", "type": "Statute / Committee / Article", "content": "Exact article or committee citation if mentioned"},
      {"scope": "UPSC Core", "type": "Official Metric", "content": "Verified official statistic if mentioned"},
      {"scope": "State PSC Ready", "type": "Regional Policy Application", "content": "Concrete state-level data point if mentioned"}
    ],
    "intro": "Strictly 25 to 30-word topper opening sentence",
    "ready_to_use_body": {
      "significance": [{"heading": "Constitutional Dimension", "explanation": "Exam point.", "real_example": "Precedent."}],
      "challenges": [{"heading": "Structural Bottlenecks", "explanation": "Institutional friction.", "real_example": "Evidence."}],
      "way_forward": [{"heading": "Actionable Roadmap", "explanation": "Policy restructuring.", "real_example": "Committee recommendation."}]
    },
    "conclusion": "Strictly 25-word balanced, futuristic conclusion",
    "state_value_add": "Direct actionable administrative application for State PSCs",
    "pyq_reference": "UPSC Mains GS-X [Year] Q[Num] & UPPSC/BPSC Parallel Anchor",
    "mcq_data": {
      "question": "Rigorous 3-statement Prelims trap MCQ",
      "options": {"A": "1 only", "B": "2 and 3 only", "C": "1 and 3 only", "D": "1, 2 and 3"},
      "answer": "B",
      "trap_explanation": "Breakdown of the specific distractor keyword causing negative marking"
    }
  },
  "hi": {
    "source_newspaper": "The Hindu / Indian Express",
    "newspaper_page": "Page 10 (संपादकीय / एक्सप्लेंड)",
    "original_headline": "समाचार पत्र का मूल शीर्षक",
    "topic": "अवधारणात्मक शीर्षक",
    "upsc_tags": ["GS-2: वैधानिक निकाय", "GS-3: अर्थव्यवस्था"],
    "state_psc_tags": ["UPPSC GS-5: अवसंरचना", "BPSC GS-2: औद्योगिक नीति"],
    "publish_date": "YYYY-MM-DD",
    "probable_hit_list_score": 9,
    "simple_summary_points": ["बिंदु 1: मुख्य घटना", "बिंदु 2: संस्थागत विवाद", "बिंदु 3: प्रशासनिक महत्व"],
    "value_additions": [
      {"scope": "UPSC Core", "type": "संवैधानिक अनुच्छेद / आयोग", "content": "सटीक संदर्भ"},
      {"scope": "UPSC Core", "type": "आधिकारिक सांख्यिकी", "content": "सत्यापित आंकड़ा"},
      {"scope": "State PSC Ready", "type": "राज्य प्रशासनिक पहल", "content": "राज्य डेटा"}
    ],
    "intro": "25-30 शब्दों का टॉपर इंट्रो",
    "ready_to_use_body": {
      "significance": [{"heading": "संवैधानिक महत्व", "explanation": "अवधारणा।", "real_example": "प्रशासनिक उदाहरण।"}],
      "challenges": [{"heading": "संरचनात्मक बाधाएं", "explanation": "विश्लेषण।", "real_example": "तथ्यात्मक प्रमाण।"}],
      "way_forward": [{"heading": "आगे की राह", "explanation": "सुधार।", "real_example": "सिफारिश।"}]
    },
    "conclusion": "25 शब्दों का संतुलित निष्कर्ष",
    "state_value_add": "राज्य लोक सेवा आयोग हेतु उपयोगी अनुप्रयोग",
    "pyq_reference": "UPSC एवं राज्य PSC विगत वर्ष प्रश्न संदर्भ",
    "mcq_data": {
      "question": "प्रारंभिक परीक्षा ट्रैप बहु-कथनीय प्रश्न",
      "options": {"A": "केवल 1", "B": "केवल 2 और 3", "C": "केवल 1 और 3", "D": "1, 2 और 3"},
      "answer": "B",
      "trap_explanation": "परीक्षक के ट्रैप शब्द का विस्तृत विश्लेषण"
    }
  }
}
"""

def fetch_feed_items(url):
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept': 'application/rss+xml, application/xml, text/xml, */*'}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=12) as response:
        return feedparser.parse(response.read())

def run_crawler():
    print("Initiating CivilPulse Zero-Hallucination Intelligence Engine...")
    TARGET_LIMIT = 5
    count = 0

    for feed_info in FEEDS:
        if count >= TARGET_LIMIT:
            break
        try:
            feed = fetch_feed_items(feed_info["url"])
        except Exception:
            continue

        for entry in feed.entries[:3]:
            if count >= TARGET_LIMIT:
                break
            title = entry.title
            summary = getattr(entry, 'summary', '')
            content_payload = f"Source: {feed_info['source']} | Section: {feed_info['section']}\nTitle: {title}\nSummary: {summary}"

            try:
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=SYSTEM_PROMPT + "\n\nTarget Article:\n" + content_payload,
                    config={"response_mime_type": "application/json"}
                )
                data = json.loads(response.text.strip())

                if data.get("status") == "APPROVED":
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

                    count += 1
                    print(f"Committed Card {count}: {en['topic']}")
            except Exception as e:
                print(f"Error processing {title}: {e}")

if __name__ == "__main__":
    run_crawler()
