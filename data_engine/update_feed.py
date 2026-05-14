import os
import json
import requests
import re
import html
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

FEEDS = {
    "Politics": [
        "https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNRFZ4ZERBU0FtVnVLQUFQAQ?hl=en-US&gl=US&ceid=US:en",
        "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml",
        "https://feeds.bbci.co.uk/news/politics/rss.xml",
        "https://feeds.npr.org/1014/rss.xml",
        "https://www.pbs.org/newshour/feeds/rss/headlines",
        "https://thehill.com/feed/",
        "https://www.theguardian.com/politics/rss",          # The Guardian (UK)
        "https://www.aljazeera.com/xml/rss/all.xml",         # Al Jazeera (Qatar)
    ],
    "Tech": [
        "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en",
        "https://techcrunch.com/feed/",
        "https://feeds.arstechnica.com/arstechnica/index",
        "https://www.wired.com/feed/rss",
        "https://www.technologyreview.com/feed/",
        "https://www.theverge.com/rss/index.xml",             # The Verge
        "https://feeds.feedburner.com/venturebeat/SZYF",     # VentureBeat
    ],
    "World": [
        "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en",
        "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
        "https://feeds.bbci.co.uk/news/world/rss.xml",
        "https://feeds.npr.org/1004/rss.xml",
        "https://www.pbs.org/newshour/feeds/rss/world",
        "https://www.theguardian.com/world/rss",             # The Guardian World
        "https://www.dw.com/rss/rss.xml",                    # Deutsche Welle (Germany)
    ],
    "Business": [
        "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en",
        "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml",
        "https://feeds.bbci.co.uk/news/business/rss.xml",
        "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114",
        "https://feeds.marketwatch.com/marketwatch/topstories/",
        "https://www.ft.com/?format=rss",                    # Financial Times (UK)
        "https://www.economist.com/finance-and-economics/rss.xml", # The Economist
    ],
    "Science": [
        "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y1RjU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en",
        "https://rss.nytimes.com/services/xml/rss/nyt/Science.xml",
        "https://www.sciencedaily.com/rss/all.xml",
        "https://phys.org/rss-feed/",
        "https://www.nature.com/nature.rss",
        "https://feeds.npr.org/1007/rss.xml",
        "https://www.newscientist.com/feed/home",            # New Scientist (UK)
        "https://www.scientificamerican.com/platform/syndication/rss/", # Scientific American
    ],
    "Sports": [
        "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en",
        "https://www.espn.com/espn/rss/news",
        "https://feeds.bbci.co.uk/sport/rss.xml",
        "https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml",
        "https://sports.yahoo.com/rss/",
        "https://www.skysports.com/rss/12040",               # Sky Sports (UK)
        "https://www.theguardian.com/sport/rss",            # The Guardian Sport
    ],
    "Entertainment": [
        "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNREpxYW5RU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en",
        "https://www.hollywoodreporter.com/feed/",
        "https://www.eonline.com/syndication/feeds/rssfeeds/topstories.xml",
        "https://variety.com/feed/",
        "https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml",
        "https://deadline.com/feed/",                        # Deadline Hollywood
        "https://www.rollingstone.com/music/music-news/feed/", # Rolling Stone
    ],
    "Lifestyle": [
        "https://rss.nytimes.com/services/xml/rss/nyt/Lifestyle.xml",
        "https://www.vogue.com/feed/rss",
        "https://www.gq.com/feed/rss",
        "https://nypost.com/living/feed/",
        "https://feeds.npr.org/1138/rss.xml",
        "https://www.bbc.co.uk/food/articles/rss.xml",       # BBC Food
        "https://www.theguardian.com/lifeandstyle/rss",     # The Guardian Life
    ],
}

DATA_FILE = "data_engine/pulsemesh_data.json"

def parse_date(date_str):
    if not date_str:
        return None
    try:
        return parsedate_to_datetime(date_str.strip())
    except Exception:
        pass
    try:
        cleaned = date_str.strip().replace("Z", "+00:00")
        return datetime.fromisoformat(cleaned)
    except Exception:
        pass
    return None

def fetch_recent_headlines(feed_url, seen_titles, minutes=15):
    articles = []
    cutoff_time = datetime.now(timezone.utc) - timedelta(minutes=minutes)
    try:
        response = requests.get(feed_url, headers=HEADERS, timeout=15)
        if response.status_code != 200:
            return articles

        root = ET.fromstring(response.content)

        items = root.findall('.//item')
        if not items:
            atom_ns = {'atom': 'http://www.w3.org/2005/Atom'}
            items = root.findall('.//atom:entry', atom_ns)

        for item in items:
            date_str = None
            for date_tag in ['pubDate', 'published', 'updated']:
                date_el = item.find(date_tag)
                if date_el is None:
                    atom_ns = {'atom': 'http://www.w3.org/2005/Atom'}
                    date_el = item.find(f'atom:{date_tag}', atom_ns)
                if date_el is not None and date_el.text:
                    date_str = date_el.text
                    break

            pub_date = parse_date(date_str)
            if pub_date and pub_date < cutoff_time:
                continue
            if pub_date is None:
                continue

            title_el = item.find('title')
            if title_el is None:
                atom_ns = {'atom': 'http://www.w3.org/2005/Atom'}
                title_el = item.find('atom:title', atom_ns)
            
            link_el = item.find('link')
            link = ""
            if link_el is not None:
                if link_el.text:
                    link = link_el.text.strip()
                elif 'href' in link_el.attrib:
                    link = link_el.attrib['href']

            if title_el is not None and title_el.text:
                # 1. Unescape HTML entities
                title = html.unescape(title_el.text.strip())
                
                # 2. Strip Emojis from start
                title = re.sub(r'^[\W\s]*[\u2600-\u27BF\u1F300-\u1F9FF\u1F600-\u1F64F]+[\W\s]*', '', title)
                
                # 3. Initial Score & Sanitization
                score = 10
                
                # Strip junk prefixes
                PREFIXES_TO_STRIP = [
                    "Live Updates:", "Live Update:", "Live updates:", "Live update:",
                    "BREAKING:", "Breaking:", "Breaking News:", "WATCH:", "Watch:", 
                    "VIDEO:", "Video:", "Source:", "Opinion:", "JUST IN:", "Just In:",
                    "EXCLUSIVE:", "Exclusive:", "REPORT:", "Report:", "Official:"
                ]
                for prefix in PREFIXES_TO_STRIP:
                    if title.lower().startswith(prefix.lower()):
                        title = title[len(prefix):].strip()
                
                # Strip branding and junk suffixes
                for separator in [" - ", " | ", " — "]:
                    if separator in title:
                        parts = title.rsplit(separator, 1)
                        main_title = parts[0].strip()
                        suffix = parts[1].lower().strip()
                        JUNK_SUFFIXES = ["watch", "live", "gallery", "video", "editorial", "opinion", "photos", "update"]
                        if suffix in JUNK_SUFFIXES or len(suffix) < 15:
                            title = main_title

                # 4. CRITICAL FILTERS (Immediate Rejection)
                
                # Rule: Duplicate Detection
                normalized = re.sub(r'[^a-z0-9]', '', title.lower())
                if normalized in seen_titles:
                    continue
                
                # Rule: Vague Pronoun Starts
                VAGUE_STARTS = ("this ", "that ", "these ", "those ", "it ", "they ", "he ", "she ")
                if title.lower().startswith(VAGUE_STARTS):
                    continue

                # Rule: Clickbait Questions
                if title.endswith("?") or title.lower().startswith(("what ", "which ", "how ", "why ", "when ", "is ", "are ", "do ", "does ")):
                    continue

                # Rule: Length & Word Count
                word_count = len(title.split())
                if word_count < 6 or word_count > 25 or len(title) < 30:
                    continue

                # 5. QUALITY SCORING (Penalty & Boost)
                
                # Penalty: Clickbait Phrases
                CLICKBAIT_PHRASES = ["you won't believe", "this is why", "shocking", "goes viral", "internet reacts", "fans react", "breaks silence", "what happens next", "slammed for", "destroys", "meltdown", "sparks outrage"]
                if any(phrase in title.lower() for phrase in CLICKBAIT_PHRASES):
                    score -= 5
                
                # Penalty: Uppercase SHOUTING
                upper_ratio = sum(1 for c in title if c.isupper()) / len(title)
                if upper_ratio > 0.4:
                    score -= 4
                
                # Penalty: Excessive Punctuation
                punc_count = sum(title.count(p) for p in ["!", "?", ":"])
                if punc_count > 3:
                    score -= 3
                
                # Boost: Data & Numbers
                if re.search(r'\d', title):
                    score += 3
                
                # Boost: Proper Nouns (Capitalized words in the middle)
                middle_words = title.split()[1:]
                if any(w[0].isupper() for w in middle_words if w):
                    score += 2
                
                # Boost: Intelligence Keywords
                INTEL_KEYWORDS = ["economy", "policy", "treaty", "market", "election", "ai", "tech", "summit", "deal", "inflation", "stock", "agreement"]
                if any(word in title.lower() for word in INTEL_KEYWORDS):
                    score += 2

                # 6. FINAL QUALITY BAR
                if score < 8:
                    continue

                if title and link:
                    seen_titles.add(normalized)
                    articles.append({
                        "title": title,
                        "link": link,
                        "timestamp": pub_date.isoformat(),
                        "score": score
                    })
    except Exception as e:
        pass
    return articles

def main():
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    
    # Load existing data
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            try:
                db = json.load(f)
            except:
                db = {k: [] for k in FEEDS.keys()}
    else:
        db = {k: [] for k in FEEDS.keys()}

    # Initialize seen_titles for global deduplication
    seen_titles = set()
    for category_articles in db.values():
        for article in category_articles:
            # Normalize for comparison
            normalized = re.sub(r'[^a-z0-9]', '', article["title"].lower())
            seen_titles.add(normalized)

    # Fetch new articles
    for category, feed_urls in FEEDS.items():
        if category not in db:
            db[category] = []
            
        new_articles = []
        for feed_url in feed_urls:
            articles = fetch_recent_headlines(feed_url, seen_titles, minutes=15)
            new_articles.extend(articles)
            
        # Append new articles (Scoring filter already handled deduplication)
        for article in new_articles:
            db[category].insert(0, article)
                
        # Keep only last 7 days. Approximate 7 days max 150 items per category to save space
        cutoff_7_days = datetime.now(timezone.utc) - timedelta(days=7)
        valid_items = []
        for item in db[category]:
            try:
                dt = datetime.fromisoformat(item["timestamp"])
                if dt >= cutoff_7_days:
                    valid_items.append(item)
            except:
                pass
        
        # Sort by timestamp descending
        valid_items.sort(key=lambda x: datetime.fromisoformat(x["timestamp"]), reverse=True)
        # Hard limit 200 per category to prevent massive file
        db[category] = valid_items[:200]

    # Save to main data file
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2)
        
    # Also save to public fallback file in the web folder
    # This keeps the local dev environment and future builds updated
    fallback_path = "pulsemesh-web/public/fallback_data.json"
    try:
        with open(fallback_path, "w", encoding="utf-8") as f:
            json.dump(db, f, indent=2)
        print(f"Successfully updated both {DATA_FILE} and {fallback_path}")
    except Exception as e:
        print(f"Note: Could not update fallback file at {fallback_path}: {e}")

if __name__ == "__main__":
    main()
