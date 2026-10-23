import os
import json
import feedparser
from google import genai
from supabase import create_client

GEMINI_KEY = os.environ.get("GEMINI_API_KEY")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

print("Checking Environment Variables...")
print("SUPABASE_URL present:", bool(SUPABASE_URL))
print("SUPABASE_SERVICE_KEY present:", bool(SUPABASE_SERVICE_KEY))
print("GEMINI_API_KEY present:", bool(GEMINI_KEY))

if not all([GEMINI_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY]):
    raise ValueError("Missing environment variables!")

# Supabase Client
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Google GenAI Official Client
client = genai.Client(api_key=GEMINI_KEY)

FEEDS = [
    {"name": "IE Explained", "url": "https://indianexpress.com/section/explained/feed/"},
    {"name": "The Hindu Editorial", "url": "https://www.thehindu.com/opinion/editorial/feeder/default.rss"}
]

SYSTEM_PROMPT = """
You are a senior UPSC Civil Services and State PSC content curator.
Evaluate the article. If it connects to Polity, Economy, Governance, Science, IR, or Environment, approve it.
Skip only if it is sports, celebrity gossip, or local crime.

Return STRICT JSON ONLY matching this structure:
{
  "status": "APPROVED",
  "en": {
    "topic": "Concise 8-10 word title",
    "upsc_tags": ["GS Paper: Micro-topic"],
    "state_psc_tags": ["State Paper: Micro-topic"],
    "crux_points": ["Point 1", "Point 2", "Point 3"],
    "intro": "Precise 30-word academic introduction for Mains",
    "body_dimensions": ["Dimension 1 with Article/Act", "Dimension 2 with Committee/Report", "Dimension 3 with governance challenge"],
    "state_value_add": "Specific state level governance application",
    "conclusion": "Pragmatic balanced way-forward",
    "pyq_reference": "UPSC Mains 2021 GS-2 Q4",
    "mcq_data": {
      "question": "Standard prelims statement question",
      "options": {"A": "Option 1", "B": "Option 2", "C": "Option 3", "D": "Option 4"},
      "answer": "A",
      "trap_explanation": "Why A is correct and traps in other options"
    }
  },
  "hi": {
    "topic": "सटीक 8-10 शब्दों का शीर्षक",
    "upsc_tags": ["जीएस प्रश्नपत्र: सूक्ष्म विषय"],
    "state_psc_tags": ["राज्य प्रश्नपत्र: सूक्ष्म विषय"],
    "crux_points": ["मुख्य बिंदु 1", "मुख्य बिंदु 2", "मुख्य बिंदु 3"],
    "intro": "मुख्य परीक्षा हेतु 30 शब्दों की सटीक भूमिका",
    "body_dimensions": ["संवैधानिक आयाम", "आयोग/समिति सिफारिशें", "प्रशासनिक चुनौतियाँ"],
    "state_value_add": "राज्य विशेष शासन प्रभाव",
    "conclusion": "संतुलित भविष्योन्मुखी निष्कर्ष",
    "pyq_reference": "विगत वर्षों के प्रश्न का संदर्भ",
    "mcq_data": {
      "question": "कथन आधारित प्रीलिम्स प्रश्न",
      "options": {"A": "विकल्प 1", "B": "विकल्प 2", "C": "विकल्प 3", "D": "विकल्प 4"},
      "answer": "A",
      "trap_explanation": "सही उत्तर का स्पष्टीकरण"
    }
  }
}
"""

def run_crawler():
    print("Starting news extraction pipeline...")
    total_added = 0

    for feed_source in FEEDS:
        print(f"\n--- Checking Feed: {feed_source['name']} ---")
        feed = feedparser.parse(feed_source["url"])
        print(f"Total entries found: {len(feed.entries)}")

        for entry in feed.entries[:3]:
            content = f"Title: {entry.title}\nSummary: {getattr(entry, 'summary', '')}"
            print(f"Processing: {entry.title}")

            try:
                # Direct generate content with verified model
                response = client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=SYSTEM_PROMPT + "\n\nArticle Content:\n" + content,
                    config={"response_mime_type": "application/json"}
                )
                
                raw_text = response.text.strip()
                data = json.loads(raw_text)

                if data.get("status") == "APPROVED":
                    # 1. Insert English Card
                    en = data["en"]
                    res_en = supabase.table("daily_cards").insert({
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
                    print(f"SUCCESS [EN] Inserted: {en['topic']}")

                    # 2. Insert Hindi Card
                    hi = data["hi"]
                    res_hi = supabase.table("daily_cards").insert({
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
                    print(f"SUCCESS [HI] Inserted: {hi['topic']}")

                    total_added += 2
                else:
                    print(f"Article skipped by AI filter.")

            except Exception as e:
                print(f"Error while processing article: {str(e)}")

    print(f"\n==========================================")
    print(f"Pipeline Finished. Total cards committed: {total_added}")
    print(f"==========================================")

if __name__ == "__main__":
    run_crawler()
