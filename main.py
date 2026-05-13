import os
import requests
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime

# Custom Header to ensure news servers accept the script connection safely
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

# ──────────────────────────────────────────────────────────────────────
# RSS FEED SOURCES — Multiple feeds per category for maximum coverage
# Sources inspired by alltop.com: Google News, NYT, BBC, TechCrunch, etc.
# ──────────────────────────────────────────────────────────────────────
FEEDS = {
    "Politics": [
        "https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNRFZ4ZERBU0FtVnVLQUFQAQ?hl=en-US&gl=US&ceid=US:en",
        "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml",
        "https://feeds.bbci.co.uk/news/politics/rss.xml",
        "https://feeds.npr.org/1014/rss.xml",                          # NPR Politics
        "https://www.pbs.org/newshour/feeds/rss/headlines",             # PBS NewsHour
        "https://thehill.com/feed/",                                    # The Hill (nonpartisan)
    ],
    "Tech": [
        "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en",
        "https://techcrunch.com/feed/",                                 # TechCrunch
        "https://feeds.arstechnica.com/arstechnica/index",              # Ars Technica
        "https://www.wired.com/feed/rss",                               # Wired
        "https://www.technologyreview.com/feed/",                       # MIT Technology Review
    ],
    "World": [
        "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en",
        "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
        "https://feeds.bbci.co.uk/news/world/rss.xml",
        "https://feeds.npr.org/1004/rss.xml",                          # NPR World
        "https://www.pbs.org/newshour/feeds/rss/world",                 # PBS World
    ],
    "Business": [
        "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en",
        "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml",
        "https://feeds.bbci.co.uk/news/business/rss.xml",
        "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114",
        "https://feeds.marketwatch.com/marketwatch/topstories/",        # MarketWatch
    ],
    "Science": [
        "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y1RjU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en",
        "https://rss.nytimes.com/services/xml/rss/nyt/Science.xml",
        "https://www.sciencedaily.com/rss/all.xml",
        "https://phys.org/rss-feed/",
        "https://www.nature.com/nature.rss",                            # Nature Journal
        "https://feeds.npr.org/1007/rss.xml",                          # NPR Science
    ],
}

# The unique ntfy topic name from your phone mobile app
NTFY_TOPIC = "x_feed_news_3568248866845j"
NTFY_URL = f"https://ntfy.sh/{NTFY_TOPIC}"

CACHE_FILE = "last_headlines.txt"

def get_cached_headlines():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            return set(line.strip() for line in f.readlines())
    return set()

def save_cached_headlines(new_headlines_set):
    history = []
    # Read existing history to maintain order
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            history = [line.strip() for line in f.readlines()]
    
    # Add new headlines that aren't already in history
    for headline in new_headlines_set:
        if headline not in history:
            history.append(headline)
            
    # Keep only the last 1000 to prevent the file from growing forever
    history = history[-1000:]
    
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        for headline in history:
            f.write(f"{headline}\n")

def parse_date(date_str):
    """Parse dates from both RSS (RFC 2822) and Atom (ISO 8601) formats."""
    if not date_str:
        return None
    try:
        # Try RFC 2822 first (standard RSS pubDate format)
        return parsedate_to_datetime(date_str.strip())
    except Exception:
        pass
    try:
        # Try ISO 8601 (Atom feed format like 2025-05-13T10:30:00Z)
        cleaned = date_str.strip().replace("Z", "+00:00")
        return datetime.fromisoformat(cleaned)
    except Exception:
        pass
    return None

def fetch_recent_headlines(feed_url, minutes=30):
    """Fetch all headlines published within the last N minutes from an RSS or Atom feed."""
    titles = []
    cutoff_time = datetime.now(timezone.utc) - timedelta(minutes=minutes)
    try:
        response = requests.get(feed_url, headers=HEADERS, timeout=15)
        if response.status_code != 200:
            print(f"  Feed returned status {response.status_code}: {feed_url[:60]}...")
            return titles

        root = ET.fromstring(response.content)

        # ── Try standard RSS format (<item> tags) ──
        items = root.findall('.//item')

        # ── If no RSS items found, try Atom format (<entry> tags) ──
        if not items:
            atom_ns = {'atom': 'http://www.w3.org/2005/Atom'}
            items = root.findall('.//atom:entry', atom_ns)

        for item in items:
            # Get publish date (RSS uses pubDate, Atom uses published/updated)
            date_str = None
            for date_tag in ['pubDate', 'published', 'updated']:
                date_el = item.find(date_tag)
                if date_el is None:
                    # Try with Atom namespace
                    atom_ns = {'atom': 'http://www.w3.org/2005/Atom'}
                    date_el = item.find(f'atom:{date_tag}', atom_ns)
                if date_el is not None and date_el.text:
                    date_str = date_el.text
                    break

            pub_date = parse_date(date_str)
            if pub_date and pub_date < cutoff_time:
                continue  # Too old, skip

            # If no date found at all, skip to be safe (don't send undated old news)
            if pub_date is None:
                continue

            # Get title
            title_el = item.find('title')
            if title_el is None:
                atom_ns = {'atom': 'http://www.w3.org/2005/Atom'}
                title_el = item.find('atom:title', atom_ns)

            if title_el is not None and title_el.text:
                title = title_el.text.strip()
                # Remove source suffix like " - Reuters" or " - BBC News"
                if " - " in title:
                    title = title.rsplit(" - ", 1)[0].strip()
                if title and len(title) > 10:  # Skip very short/empty titles
                    titles.append(title)

    except Exception as e:
        print(f"  Error fetching {feed_url[:60]}...: {e}")
    return titles

def main():
    old_headlines = get_cached_headlines()
    new_headlines_to_send = []
    current_round_headlines = set()

    for category, feed_urls in FEEDS.items():
        category_new = 0
        category_total = 0

        for feed_url in feed_urls:
            titles = fetch_recent_headlines(feed_url, minutes=15)
            category_total += len(titles)

            for title in titles:
                current_round_headlines.add(title)
                if title not in old_headlines:
                    new_headlines_to_send.append((category, title.upper()))
                    category_new += 1

        print(f"[{category}] {category_total} headlines from last 15 mins, {category_new} are new")

    if new_headlines_to_send:
        sent_count = 0
        all_sent = True
        for category, headline in new_headlines_to_send:
            response = requests.post(
                NTFY_URL,
                data=headline.encode('utf-8'),
                headers={
                    "Title": f"{category} News",
                    "Priority": "high"
                }
            )
            if response.status_code == 200:
                sent_count += 1
                print(f"  Pushed: {headline[:80]}...")
            else:
                print(f"  ntfy error for {category}: {response.status_code}")
                all_sent = False

        print(f"\nTotal notifications sent: {sent_count}")
        if all_sent:
            save_cached_headlines(current_round_headlines)
    else:
        print("\nNo new headlines detected since the last check.")

if __name__ == "__main__":
    main()
