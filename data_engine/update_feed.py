import os
import json
import requests
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

def fetch_recent_headlines(feed_url, minutes=15):
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
                title = title_el.text.strip()
                if " - " in title:
                    title = title.rsplit(" - ", 1)[0].strip()
                
                # Rule 1: No clickbait questions (ends with ?)
                if "?" in title:
                    continue

                # Rule 2: No headlines starting with question words
                QUESTION_WORDS = ("what ", "which ", "where ", "who ", "why ", "when ", "how ", "is ", "are ", "was ", "were ", "did ", "do ", "does ", "can ", "could ", "should ", "would ", "will ")
                if title.lower().startswith(QUESTION_WORDS):
                    continue

                # Rule 3: At least 6 words
                if len(title.split()) < 6:
                    continue

                if title and link:
                    articles.append({
                        "title": title,
                        "link": link,
                        "timestamp": pub_date.isoformat(),
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

    # Fetch new articles
    for category, feed_urls in FEEDS.items():
        if category not in db:
            db[category] = []
            
        new_articles = []
        for feed_url in feed_urls:
            articles = fetch_recent_headlines(feed_url, minutes=15)
            new_articles.extend(articles)
            
        # Deduplicate and append
        existing_links = {item["link"] for item in db[category]}
        existing_titles = {item["title"] for item in db[category]}
        
        for article in new_articles:
            if article["link"] not in existing_links and article["title"] not in existing_titles:
                db[category].insert(0, article)
                existing_links.add(article["link"])
                existing_titles.add(article["title"])
                
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

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2)

if __name__ == "__main__":
    main()
