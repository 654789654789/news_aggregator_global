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
try:
    from config import SOURCE_MAP, FEEDS, PROPAGANDA_BLOCKLIST
except ImportError:
    # Fallback for different execution contexts
    import sys
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    from config import SOURCE_MAP, FEEDS, PROPAGANDA_BLOCKLIST

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
            if link_el is None:
                atom_ns = {'atom': 'http://www.w3.org/2005/Atom'}
                link_el = item.find('atom:link', atom_ns)
            
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
                words = title.split()
                word_count = len(words)
                if word_count < 5 or word_count > 25 or len(title) < 30:
                    continue
                
                # Rule: Strict-5 (Substance Check)
                # If only 5 words, all must be more than 2 chars (Filters "Earth in a new light")
                if word_count == 5:
                    if any(len(w) < 3 for w in words):
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
                # STRICT QUESTION FILTER: Reject any title with a question mark or starting with question words (Rule 22)
                QUESTION_WORDS = ("how ", "why ", "what ", "who ", "where ", "when ")
                if "?" in title or title.lower().startswith(QUESTION_WORDS):
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
                
                # Smart fallback: Auto-extract and capitalize domain for custom feeds in the future
                if source_name == "Pulse" and domain:
                    parts = domain.replace("www.", "").split('.')
                    if len(parts) > 0 and parts[0]:
                        source_name = parts[0].capitalize()
                
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
                    
                    # NOISE FILTER: No Fantasy, Betting, Predictions, or Consumer Fluff
                    SPORTS_JUNK = ["fantasy", "betting", "prediction", "lineups", "odds", "picks", "dream11", "tickets", "prices", "cheapest", "deals"]
                    if any(junk in title.lower() for junk in SPORTS_JUNK):
                        continue
                    
                    # LISTICLE FILTER: No "Top 5", "5 worst", etc.
                    if re.match(r'^(the\s+)?(top|best|worst|5|10|7)\s+\d+', title.lower()) or "top 5" in title.lower() or "top 10" in title.lower():
                        continue
                        
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
