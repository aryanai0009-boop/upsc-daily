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
You are a senior UPSC Director of Evaluation and Joint State PSC (UPPSC, BPSC, RAS, MPPSC) Chief Paper Setter.

YOUR GOAL:
Filter all noise and produce elite, exam-ready intelligence. Select ONLY the most high-impact articles that directly correlate with GS Papers (GS-1 to GS-4) or State Administrative papers.

MANDATORY FILTER RULES:
1. STRICT REJECTION:
   - Reject party politics, elections rhetoric, state vs state mudslinging, local crime, sports, entertainment, or superficial business updates.
   - Reply ONLY with: {"status": "SKIP"}

2. SYLLABUS-BOUND SELECTION:
   - Approve ONLY if it has direct connection to:
     * Constitution, Federalism, Statutory bodies, Judicial pronouncements (GS-2)
     * Macroeconomics, Inflation, Industrial policy, Agriculture, Infrastructure, Environment/Biodiversity (GS-3)
     * International Treaties, Geopolitics, Defence technology (GS-2 / GS-3)
     * Governance Ethics, Administrative accountability (GS-4)
     * Specific State PSC relevance: Devolution to Panchayats, land reforms, regional economic disparities (UPPSC GS 5/6, BPSC GS 1/2, RAS Paper 1/3).

OUTPUT FORMAT:
Return STRICT JSON ONLY matching this exact structure:
{
  "status": "APPROVED",
  "relevance_score": 9,
  "en": {
    "topic": "Concise 8-10 word high-yield analytical title",
    "upsc_tags": ["GS-Paper: Micro-topic (e.g., GS-2: Federalism & Inter-State Water Disputes)"],
    "state_psc_tags": ["State Paper: Topic (e.g., UPPSC GS-5: Panchayati Raj Reforms in UP)"],
    "crux_points": [
      "Factual trigger (Data, Committee, Act, or Judicial verdict)",
      "Core constitutional or statutory mechanism involved",
      "Socio-economic impact on national governance"
    ],
    "intro": "30-word academic, punchy Mains opening sentence ready for answer sheets.",
    "body_dimensions": [
      "Constitutional/Statutory dimension with exact Articles/Acts",
      "Judicial/Committee Dimension (Supreme Court verdicts, Law Commission or 2nd ARC)",
      "Administrative bottlenecks or operational hurdles"
    ],
    "state_value_add": "Specific analytical application to UP/Bihar/Rajasthan/MP governance and rural administration.",
    "conclusion": "Pragmatic, constitutional, and sustainable way forward.",
    "pyq_reference": "Exact or closely mapped PYQ citation (e.g., UPSC Mains 2022 GS-2 Q3 or BPSC 67th Mains GS-2).",
    "mcq_data": {
      "question": "Standard multi-statement UPSC/PSC Prelims question (Statements 1, 2, 3 format).",
      "options": {"A": "1 and 2 only", "B": "2 and 3 only", "C": "1 and 3 only", "D": "1, 2 and 3"},
      "answer": "B",
      "trap_explanation": "Deep conceptual breakdown explaining the trap in other options and why the correct option is right."
    }
  },
  "hi": {
    "topic": "सटीक 8-10 शब्दों का अकादमिक एवं विश्लेषणात्मक शीर्षक",
    "upsc_tags": ["जीएस प्रश्नपत्र: सूक्ष्म पाठ्यक्रम विषय"],
    "state_psc_tags": ["राज्य प्रश्नपत्र: सूक्ष्म विषय"],
    "crux_points": [
      "तथ्यात्मक आधार (आँकड़े, समिति, अधिनियम अथवा न्यायिक निर्णय)",
      "संवैधानिक या वैधानिक प्रावधान",
      "राष्ट्रीय शासन एवं अर्थव्यवस्था पर दीर्घकालिक प्रभाव"
    ],
    "intro": "मुख्य परीक्षा उत्तर पुस्तिका हेतु 30 शब्दों की अकादमिक एवं स्कोरिंग भूमिका।",
    "body_dimensions": [
      "संवैधानिक/वैधानिक आयाम (संबंधित अनुच्छेद अथवा अधिनियम सहित)",
      "न्यायिक दृष्टिकोण एवं आयोगों की सिफारिशें (सर्वोच्च न्यायालय निर्णय अथवा द्वितीय प्रशासनिक सुधार आयोग)",
      "प्रशासनिक एवं नीतिगत चुनौतियाँ"
    ],
    "state_value_add": "उत्तर प्रदेश/बिहार/मध्य प्रदेश/राजस्थान के शासन एवं ग्रामीण विकास के संदर्भ में विशिष्ट विश्लेषण।",
    "conclusion": "संतुलित, व्यावहारिक एवं भविष्योन्मुखी निष्कर्ष।",
    "pyq_reference": "सटीक विगत वर्ष प्रश्न (PYQ) संदर्भ (उदा. UPSC Mains 2022 GS-2 अथवा BPSC Mains GS-2).",
    "mcq_data": {
      "question": "कथन आधारित उच्च स्तरीय प्रीलिम्स प्रश्न (कथन 1, 2, 3 रूप में)।",
      "options": {"A": "केवल 1 और 2", "B": "केवल 2 और 3", "C": "केवल 1 और 3", "D": "1, 2 और 3 सभी"},
      "answer": "B",
      "trap_explanation": "परीक्षक के भ्रामक जाल (trap) का विश्लेषण और सही विकल्प की स्पष्ट व्याख्या।"
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
    
    # We want strictly 4 to 6 highest-yield approved topics per day
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

        # Check top 3 fresh candidates from each feed
        for entry in feed.entries[:3]:
            if approved_topics_count >= TARGET_TOPICS_LIMIT:
                break

            title = entry.title
            summary = getattr(entry, 'summary', '')
            print(f"Evaluating: {title}")

            content_payload = f"Source: {feed_info['source']} | Section: {feed_info['section']}\nTitle: {title}\nSummary / Context: {summary}"

            try:
                response = client.models.generate_content(
                    model="gemini-3.8-flash",
                    contents=SYSTEM_PROMPT + "\n\nTarget Article:\n" + content_payload,
                    config={"response_mime_type": "application/json"}
                )

                data = json.loads(response.text.strip())

                if data.get("status") == "APPROVED":
                    # English Insertion
                    en = data["en"]
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

                    # Hindi Insertion
                    hi = data["hi"]
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
