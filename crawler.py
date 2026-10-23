import os
import json
import feedparser
from google import genai
from supabase import create_client

# Environment Variables
GEMINI_KEY = os.environ.get("GEMINI_API_KEY")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

if not all([GEMINI_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY]):
    raise ValueError("Missing critical environment variables!")

# Official Google GenAI Client
client = genai.Client(api_key=GEMINI_KEY)
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

FEEDS = [
    {"name": "IE Explained", "url": "https://indianexpress.com/section/explained/feed/"},
    {"name": "Hindu Editorial", "url": "https://www.thehindu.com/opinion/editorial/feeder/default.rss"}
]

SYSTEM_PROMPT = """
You are a senior UPSC Civil Services and State Public Service Commission (UPPSC, BPSC, RAS, MPPSC) question setter and evaluator.

TASK:
Examine the news article text strictly against official competitive exam syllabi.

RULES:
1. RELEVANCE FILTER:
   If the article is political party fighting, cinema, sports, or routine local crime, reply EXACTLY with: {"status": "SKIP"}
   Only approve articles with direct constitutional, governance, international relations, economic, environmental, or administrative significance.

2. BILINGUAL EXAM-READY FORMAT:
   Return ONLY a valid JSON object matching this schema:
{
  "status": "APPROVED",
  "en": {
    "topic": "Concise 8-10 word title",
    "upsc_tags": ["GS Paper: Micro-topic"],
    "state_psc_tags": ["State Paper: Micro-topic"],
    "crux_points": ["Core event detail", "Constitutional/Legal background", "Direct impact point"],
    "intro": "Precise 30-word academic introduction ready for Mains answer sheet",
    "body_dimensions": [
      "Dimension 1: Constitutional/Statutory basis with Acts or Articles",
      "Dimension 2: Judicial precedent or Committee recommendations",
      "Dimension 3: Institutional, economic, or administrative challenges"
    ],
    "state_value_add": "Specific analytical application to UP/Bihar/Rajasthan/MP governance",
    "conclusion": "Balanced, pragmatic constitutional way forward",
    "pyq_reference": "Relevant past exam question citation (e.g., UPSC Mains 2021 GS-2 Q4)",
    "mcq_data": {
      "question": "Standard multi-statement question with deliberate conceptual trap",
      "options": {"A": "Option text", "B": "Option text", "C": "Option text", "D": "Option text"},
      "answer": "A",
      "trap_explanation": "Precise explanation of why the correct option is right and others are traps"
    }
  },
  "hi": {
    "topic": "सटीक 8-10 शब्दों का शीर्षक",
    "upsc_tags": ["जीएस प्रश्नपत्र: सूक्ष्म विषय"],
    "state_psc_tags": ["राज्य प्रश्नपत्र: सूक्ष्म विषय"],
    "crux_points": ["मुख्य घटना का विवरण", "संवैधानिक या कानूनी पृष्ठभूमि", "महत्वपूर्ण प्रभाव बिंदु"],
    "intro": "मुख्य परीक्षा हेतु 30 शब्दों की मानक और अकादमिक भूमिका",
    "body_dimensions": [
      "पहला आयाम: संवैधानिक/वैधानिक आधार (अनुच्छेद या अधिनियम सहित)",
      "दूसरा आयाम: न्यायिक निर्णय या आयोगों की सिफारिशें",
      "तीसरा आयाम: प्रशासनिक या व्यावहारिक चुनौतियाँ"
    ],
    "state_value_add": "राज्य विशेष (UP/Bihar/MP/RAS) शासन पर विशिष्ट प्रभाव",
    "conclusion": "संतुलित और व्यावहारिक भविष्योन्मुखी निष्कर्ष",
    "pyq_reference": "विगत वर्षों के प्रश्न का संदर्भ",
    "mcq_data": {
      "question": "कथन आधारित उच्च स्तरीय प्रीलिम्स प्रश्न",
      "options": {"A": "विकल्प पाठ", "B": "विकल्प पाठ", "C": "विकल्प पाठ", "D": "विकल्प पाठ"},
      "answer": "A",
      "trap_explanation": "विस्तृत व्याख्या कि कौन सा कथन सही है"
    }
  }
}
"""

def run_crawler():
    print("Starting news extraction pipeline with official google-genai...")
    processed_count = 0

    for feed_source in FEEDS:
        print(f"Reading: {feed_source['name']}")
        feed = feedparser.parse(feed_source["url"])

        for entry in feed.entries[:3]:
            content = f"Title: {entry.title}\nSummary: {getattr(entry, 'summary', '')}"
            try:
                # Naye SDK ka call method
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=SYSTEM_PROMPT + "\n\nArticle Content:\n" + content,
                    config={"response_mime_type": "application/json"}
                )
                data = json.loads(response.text.strip())

                if data.get("status") == "APPROVED":
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

                    processed_count += 1
                    print(f"Successfully committed: {en['topic']}")
            except Exception as e:
                print(f"Skipped / Error on '{entry.title}': {e}")

    print(f"Pipeline finished. Total approved topics added: {processed_count}")

if __name__ == "__main__":
    run_crawler()
