import requests
import xml.etree.ElementTree as ET

url = "https://techcrunch.com/feed/"
headers = {"User-Agent": "Mozilla/5.0"}
r = requests.get(url, headers=headers)
root = ET.fromstring(r.content)

print("--- TECHCRUNCH RAW TITLES ---")
for item in root.findall('.//item'):
    title = item.find('title').text
    print(f"TITLE: '{title}'")
    # Check for other tags
    for child in item:
        if 'creator' in child.tag or 'author' in child.tag:
            print(f"  {child.tag}: '{child.text}'")
