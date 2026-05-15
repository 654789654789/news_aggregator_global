import os
import json
import requests
import re
import html
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

# --- PulseMesh Intelligence Configuration ---
SOURCE_MAP = {
    "nytimes.com": "NYT",
    "bbc.co": "BBC",
    "techcrunch.com": "TechCrunch",
    "thehill.com": "The Hill",
    "wired.com": "Wired",
    "theverge.com": "Verge",
    "venturebeat.com": "VentureBeat",
    "theguardian.com": "Guardian",
    "npr.org": "NPR",
    "pbs.org": "PBS",
    "arstechnica.com": "Ars",
    "technologyreview.com": "MIT Tech",
    "cnbc.com": "CNBC",
    "marketwatch.com": "MarketWatch",
    "reuters.com": "Reuters",
    "apnews.com": "AP",
    "dw.com": "DW",
    "espn.com": "ESPN",
    "skysports.com": "Sky Sports",
    "hollywoodreporter.com": "THR",
    "variety.com": "Variety",
    "rollingstone.com": "Rolling Stone",
    "deadline.com": "Deadline",
    "phys.org": "Phys.org",
    "sciencedaily.com": "SciDaily",
    "vogue.com": "Vogue",
    "gq.com": "GQ",
    "yahoo.com": "Yahoo",
    "nature.com": "Nature",
    "eonline.com": "E! News",
    "google.com": "Google News",
    "nypost.com": "NY Post"
}

# Domains to block entirely (Propaganda, low-credibility, or heavy bias)
PROPAGANDA_BLOCKLIST = [
    "rt.com", "sputniknews.com", "breitbart.com", "infowars.com", 
    "dailymail.co.uk", "nypost.com", "almasdarnews.com", "tass.com",
    "presstv.ir", "globaltimes.cn", "chinadaily.com.cn", "aljazeera.com"
]

FEEDS = {
    "Politics": [
        "https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNRFZ4ZERBU0FtVnVLQUFQAQ?hl=en-US&gl=US&ceid=US:en",
        "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml",
        "https://feeds.bbci.co.uk/news/politics/rss.xml",
        "https://feeds.npr.org/1014/rss.xml",
        "https://www.pbs.org/newshour/feeds/rss/headlines",
        "https://thehill.com/feed/",
        "https://www.theguardian.com/politics/rss",
    ],
    "Tech": [
        "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en",
        "https://techcrunch.com/feed/",
        "https://feeds.arstechnica.com/arstechnica/index",
        "https://www.wired.com/feed/rss",
        "https://www.technologyreview.com/feed/",
        "https://www.theverge.com/rss/index.xml",
        "https://feeds.feedburner.com/venturebeat/SZYF",
    ],
    "World": [
        "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en",
        "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
        "https://feeds.bbci.co.uk/news/world/rss.xml",
        "https://feeds.npr.org/1004/rss.xml",
        "https://www.pbs.org/newshour/feeds/rss/world",
        "https://www.theguardian.com/world/rss",
        "https://www.dw.com/rss/rss.xml",
    ],
    "Business": [
        "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en",
        "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml",
        "https://feeds.bbci.co.uk/news/business/rss.xml",
        "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114",
        "https://feeds.marketwatch.com/marketwatch/topstories/",
    ],
    "Science": [
        "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y1RjU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en",
        "https://rss.nytimes.com/services/xml/rss/nyt/Science.xml",
        "https://www.sciencedaily.com/rss/all.xml",
        "https://phys.org/rss-feed/",
        "https://www.nature.com/nature.rss",
        "https://feeds.npr.org/1007/rss.xml",
    ],
    "Sports": [
        "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en",
        "https://www.espn.com/espn/rss/news",
        "https://feeds.bbci.co.uk/sport/rss.xml",
        "https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml",
        "https://sports.yahoo.com/rss/",
        "https://www.skysports.com/rss/12040",
        "https://www.theguardian.com/sport/rss",
    ],
    "Entertainment": [
        "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNREpxYW5RU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en",
        "https://www.hollywoodreporter.com/feed/",
        "https://www.eonline.com/syndication/feeds/rssfeeds/topstories.xml",
        "https://variety.com/feed/",
        "https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml",
        "https://deadline.com/feed/",
        "https://www.rollingstone.com/music/music-news/feed/",
    ],
    "Lifestyle": [
        "https://rss.nytimes.com/services/xml/rss/nyt/Lifestyle.xml",
        "https://www.vogue.com/feed/rss",
        "https://www.gq.com/feed/rss",
        "https://nypost.com/living/feed/",
        "https://feeds.npr.org/1138/rss.xml",
        "https://www.bbc.co.uk/food/articles/rss.xml",
        "https://www.theguardian.com/lifeandstyle/rss",
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

            title = ""
            if title_el is not None:
                # SURGICAL FIX: Use itertext() to prevent the "Word-Eater" bug
                title = "".join(title_el.itertext()).strip()
            
            if title:
                # 1. Unescape HTML and Basic Clean
                title = html.unescape(title)
                title = title.replace('\xa0', ' ').replace('\u200b', '')
                
                # 2. Surgical Emoji Removal (Hex-based)
                title = re.sub(r'[\U0001f300-\U0001f9ff\U0001f600-\U0001f64f\u2600-\u27bf]', '', title).strip()
                
                # 3. Initial Score
                score = 10
                
                # 4. Skip Vague Titles (Entirely)
                VAGUE_STARTS = ("this ", "that ", "these ", "those ", "it ", "they ", "he ", "she ")
                if title.lower().startswith(VAGUE_STARTS):
                    continue
                
                # Strip branding and junk suffixes (Only if it's actually junk)
                for separator in [" - ", " | ", " — "]:
                    if separator in title:
                        parts = title.rsplit(separator, 1)
                        if len(parts) > 1:
                            main_content = parts[0].strip()
                            suffix = parts[1].lower().strip()
                            JUNK_SUFFIXES = ["watch", "live", "gallery", "video", "editorial", "opinion", "photos", "update", "breaking"]
                            if suffix in JUNK_SUFFIXES or (len(suffix) < 10 and not any(char.isdigit() for char in suffix)):
                                title = main_content

                # 4. CRITICAL FILTERS (Immediate Rejection)
                
                # Rule: Duplicate Detection
                normalized = re.sub(r'[^a-z0-9]', '', title.lower())
                if normalized in seen_titles:
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
                # STRICT QUESTION FILTER: Reject any title with a question mark
                if "?" in title:
                    continue
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

                # 7. SOURCE & PROPAGANDA INTELLIGENCE
                domain = link.lower().split('//')[-1].split('/')[0]
                
                # Filter propaganda/bias
                is_blocked = False
                for blocked in PROPAGANDA_BLOCKLIST:
                    if blocked in domain:
                        is_blocked = True
                        break
                if is_blocked:
                    continue

                # Identify Source
                source_name = "Pulse"
                for key, val in SOURCE_MAP.items():
                    if key in domain:
                        source_name = val
                        break
                
                seen_titles.add(normalized)
                articles.append({
                    "title": title,
                    "link": link,
                    "source": source_name,
                    "timestamp": pub_date.isoformat(),
                    "score": score
                })
    except Exception:
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
            normalized = re.sub(r'[^a-z0-9]', '', article["title"].lower())
            seen_titles.add(normalized)

    # Fetch new articles
    for category, feed_urls in FEEDS.items():
        if category not in db:
            db[category] = []
            
        new_articles = []
        source_counts = {}
        for feed_url in feed_urls:
            articles = fetch_recent_headlines(feed_url, seen_titles, minutes=15)
            for art in articles:
                title = art["title"]
                
                # UNIVERSAL QUALITY: Reject truncated snippets ending in ...
                if title.endswith("...") or title.endswith("\u2026"):
                    continue

                # SPECIAL SPORTS RULES
                if category == "Sports":
                    if "?" in title: continue
                    if len(title.split()) < 7: continue
                    src = art["source"]
                    source_counts[src] = source_counts.get(src, 0) + 1
                    if source_counts[src] > 3: continue
                
                new_articles.append(art)
                
        # Limit updates per category run (Top 4)
        if len(new_articles) > 4:
            new_articles.sort(key=lambda x: x.get("score", 0), reverse=True)
            new_articles = new_articles[:4]
            
        # Append new articles
        for article in new_articles:
            db[category].insert(0, article)
                
        # Final Cleanup & Persistence
        cutoff_7_days = datetime.now(timezone.utc) - timedelta(days=7)
        valid_items = []
        for item in db[category]:
            title = item.get("title", "").strip()
            # Universal: No ellipses
            if title.endswith("...") or title.endswith("\u2026"): continue
            
            # Sports specific
            if category == "Sports":
                if "?" in title: continue
                if len(title.split()) < 7: continue
            
            try:
                dt = datetime.fromisoformat(item["timestamp"])
                # Handle Z/offset correctly
                if dt.tzinfo is None: dt = dt.replace(tzinfo=timezone.utc)
                if dt >= cutoff_7_days:
                    valid_items.append(item)
            except:
                continue
        
        valid_items.sort(key=lambda x: datetime.fromisoformat(x["timestamp"]), reverse=True)
        db[category] = valid_items[:200]

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2)
        
    fallback_path = "pulsemesh-web/public/fallback_data.json"
    try:
        with open(fallback_path, "w", encoding="utf-8") as f:
            json.dump(db, f, indent=2)
    except Exception:
        pass

if __name__ == "__main__":
    main()
