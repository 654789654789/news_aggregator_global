/**
 * PulseMesh Geopolitical Geocoding Utility
 * Maps country names, country adjectives, city names, and news sources to coordinates and ISO country codes.
 */

// Bounding coordinates and centers for major countries
export const COUNTRY_REGISTRY = {
  us: { name: "United States", lat: 37.0902, lon: -95.7129, keywords: ["us", "usa", "united states", "america", "american", "washington", "new york", "california", "texas", "pentagon"] },
  gb: { name: "United Kingdom", lat: 55.3781, lon: -3.4360, keywords: ["uk", "united kingdom", "britain", "british", "london", "scotland", "english", "downs", "thames"] },
  in: { name: "India", lat: 20.5937, lon: 78.9629, keywords: ["india", "indian", "delhi", "mumbai", "bengaluru", "bangalore", "karnataka", "tamil nadu", "andhra", "kerala", "vizag", "vijayawada", "chennai", "modi"] },
  cn: { name: "China", lat: 35.8617, lon: 104.1954, keywords: ["china", "chinese", "beijing", "shanghai", "shenzhen", "wuhan", "xi jinping"] },
  ru: { name: "Russia", lat: 61.5240, lon: 105.3188, keywords: ["russia", "russian", "moscow", "kremlin", "vladivostok"] },
  ua: { name: "Ukraine", lat: 48.3794, lon: 31.1656, keywords: ["ukraine", "ukrainian", "kyiv", "kiev", "kharkiv", "odessa", "crimea", "donbas"] },
  jp: { name: "Japan", lat: 36.2048, lon: 138.2529, keywords: ["japan", "japanese", "tokyo", "osaka", "kyoto", "yokohama"] },
  de: { name: "Germany", lat: 51.1657, lon: 10.4515, keywords: ["germany", "german", "berlin", "munich", "frankfurt"] },
  fr: { name: "France", lat: 46.2276, lon: 2.2137, keywords: ["france", "french", "paris", "marseille", "lyon"] },
  il: { name: "Israel", lat: 31.0461, lon: 34.8516, keywords: ["israel", "israeli", "jerusalem", "tel aviv", "gaza", "west bank", "hamas", "netanyahu"] },
  tw: { name: "Taiwan", lat: 23.6978, lon: 120.9605, keywords: ["taiwan", "taiwanese", "taipei"] },
  ca: { name: "Canada", lat: 56.1304, lon: -106.3468, keywords: ["canada", "canadian", "ottawa", "toronto", "vancouver", "montreal"] },
  au: { name: "Australia", lat: -25.2744, lon: 133.7751, keywords: ["australia", "australian", "sydney", "melbourne", "brisbane", "canberra"] },
  ir: { name: "Iran", lat: 32.4279, lon: 53.6880, keywords: ["iran", "iranian", "tehran", "isfahan", "hormuz"] },
  br: { name: "Brazil", lat: -14.2350, lon: -51.9253, keywords: ["brazil", "brazilian", "brasilia", "rio de janeiro", "sao paulo"] },
  kr: { name: "South Korea", lat: 35.9078, lon: 127.7669, keywords: ["south korea", "korean", "seoul", "busan"] },
  kp: { name: "North Korea", lat: 40.3399, lon: 127.5101, keywords: ["north korea", "pyongyang", "kim jong"] },
  sg: { name: "Singapore", lat: 1.3521, lon: 103.8198, keywords: ["singapore", "singaporean"] },
  ae: { name: "United Arab Emirates", lat: 23.4241, lon: 53.8478, keywords: ["uae", "united arab emirates", "dubai", "abu dhabi", "nuclear power plant"] },
  sa: { name: "Saudi Arabia", lat: 23.8859, lon: 45.0792, keywords: ["saudi arabia", "saudi", "riyadh", "jeddah"] },
  eg: { name: "Egypt", lat: 26.8206, lon: 30.8025, keywords: ["egypt", "egyptian", "cairo", "suez"] },
  tr: { name: "Turkey", lat: 38.9637, lon: 35.2433, keywords: ["turkey", "turkish", "ankara", "istanbul"] },
  pk: { name: "Pakistan", lat: 30.3753, lon: 69.3451, keywords: ["pakistan", "pakistani", "islamabad", "karachi", "lahore"] },
  za: { name: "South Africa", lat: -30.5595, lon: 22.9375, keywords: ["south africa", "south african", "cape town", "johannesburg", "pretoria"] },
  pl: { name: "Poland", lat: 51.9194, lon: 19.1451, keywords: ["poland", "polish", "warsaw", "krakow"] },
  ph: { name: "Philippines", lat: 12.8797, lon: 121.7740, keywords: ["philippines", "filipino", "manila"] },
  vn: { name: "Vietnam", lat: 14.0583, lon: 108.2772, keywords: ["vietnam", "vietnamese", "hanoi", "ho chi minh"] },
  id: { name: "Indonesia", lat: -0.7893, lon: 113.9213, keywords: ["indonesia", "indonesian", "jakarta", "bali"] },
  ve: { name: "Venezuela", lat: 6.4238, lon: -66.5897, keywords: ["venezuela", "venezuelan", "caracas", "maduro"] },
  co: { name: "Colombia", lat: 4.5709, lon: -72.9301, keywords: ["colombia", "colombian", "bogota"] },
  pe: { name: "Peru", lat: -9.1900, lon: -75.0152, keywords: ["peru", "peruvian", "lima", "fujimori"] },
  mx: { name: "Mexico", lat: 23.6345, lon: -102.5528, keywords: ["mexico", "mexican", "mexico city"] },
  cu: { name: "Cuba", lat: 21.5218, lon: -77.7812, keywords: ["cuba", "cuban", "havana", "castro"] },
  rw: { name: "Rwanda", lat: -1.9403, lon: 29.8739, keywords: ["rwanda", "rwandan", "kigali"] },
  ug: { name: "Uganda", lat: 1.3733, lon: 32.2903, keywords: ["uganda", "ugandan", "kampala", "ebola"] },
  ng: { name: "Nigeria", lat: 9.0820, lon: 8.6753, keywords: ["nigeria", "nigerian", "abuja", "lagos"] },
  sy: { name: "Syria", lat: 34.8021, lon: 38.9968, keywords: ["syria", "syrian", "damascus", "aleppo"] },
  iq: { name: "Iraq", lat: 33.2232, lon: 43.6793, keywords: ["iraq", "iraqi", "baghdad"] },
  lb: { name: "Lebanon", lat: 33.8547, lon: 35.8623, keywords: ["lebanon", "lebanese", "beirut"] },
  ye: { name: "Yemen", lat: 15.5527, lon: 48.5164, keywords: ["yemen", "yemeni", "sanaa", "aden"] },
  af: { name: "Afghanistan", lat: 33.9391, lon: 67.7100, keywords: ["afghanistan", "afghan", "kabul"] },
  sd: { name: "Sudan", lat: 12.8628, lon: 30.2176, keywords: ["sudan", "sudanese", "khartoum"] },
  ly: { name: "Libya", lat: 26.3351, lon: 17.2283, keywords: ["libya", "libyan", "tripoli"] },
  so: { name: "Somalia", lat: 5.1521, lon: 46.1996, keywords: ["somalia", "somali", "mogadishu"] },
  se: { name: "Sweden", lat: 60.1282, lon: 18.6435, keywords: ["sweden", "swedish", "stockholm"] },
  it: { name: "Italy", lat: 41.8719, lon: 12.5674, keywords: ["italy", "italian", "rome", "milan", "venice"] },
  es: { name: "Spain", lat: 40.4637, lon: -3.7492, keywords: ["spain", "spanish", "madrid", "barcelona"] },
  gr: { name: "Greece", lat: 39.0742, lon: 21.8243, keywords: ["greece", "greek", "athens"] },
  ch: { name: "Switzerland", lat: 46.8182, lon: 8.2275, keywords: ["switzerland", "swiss", "geneva", "zurich"] }
};

// City/location registry to pinpoint specific geographic locations
export const CITY_REGISTRY = [
  { name: "Bengaluru", lat: 12.9716, lon: 77.5946, country: "in" },
  { name: "Bangalore", lat: 12.9716, lon: 77.5946, country: "in" },
  { name: "Mumbai", lat: 19.0760, lon: 72.8777, country: "in" },
  { name: "Delhi", lat: 28.7041, lon: 77.1025, country: "in" },
  { name: "Vijayawada", lat: 16.5062, lon: 80.6480, country: "in" },
  { name: "Ranipet", lat: 12.9279, lon: 79.3328, country: "in" },
  { name: "Malabar", lat: 11.2588, lon: 75.7804, country: "in" },
  { name: "Vizag", lat: 17.6868, lon: 83.2185, country: "in" },
  { name: "Visakhapatnam", lat: 17.6868, lon: 83.2185, country: "in" },
  { name: "London", lat: 51.5074, lon: -0.1278, country: "gb" },
  { name: "Gaza", lat: 31.5000, lon: 34.4667, country: "il" },
  { name: "Tel Aviv", lat: 32.0853, lon: 34.7818, country: "il" },
  { name: "Jerusalem", lat: 31.7683, lon: 35.2137, country: "il" },
  { name: "Beirut", lat: 33.8938, lon: 35.5018, country: "lb" },
  { name: "Damascus", lat: 33.5138, lon: 36.2765, country: "sy" },
  { name: "Baghdad", lat: 33.3152, lon: 44.3661, country: "iq" },
  { name: "Kyiv", lat: 50.4501, lon: 30.5234, country: "ua" },
  { name: "Kiev", lat: 50.4501, lon: 30.5234, country: "ua" },
  { name: "Kharkiv", lat: 49.9935, lon: 36.2304, country: "ua" },
  { name: "Odessa", lat: 46.4825, lon: 30.7233, country: "ua" },
  { name: "Crimea", lat: 45.3493, lon: 34.4993, country: "ua" },
  { name: "Moscow", lat: 55.7558, lon: 37.6173, country: "ru" },
  { name: "Taipei", lat: 25.0330, lon: 121.5654, country: "tw" },
  { name: "Washington", lat: 38.9072, lon: -77.0369, country: "us" },
  { name: "New York", lat: 40.7128, lon: -74.0060, country: "us" },
  { name: "Commuter Rail", lat: 40.7128, lon: -74.0060, country: "us" }, // NY Commuter Rail strike
  { name: "Louisiana", lat: 30.9843, lon: -91.9623, country: "us" },
  { name: "Montgomery", lat: 32.3792, lon: -86.3077, country: "us" },
  { name: "Singapore", lat: 1.3521, lon: 103.8198, country: "sg" },
  { name: "Dubai", lat: 25.2048, lon: 55.2708, country: "ae" },
  { name: "Abu Dhabi", lat: 24.4539, lon: 54.3773, country: "ae" },
  { name: "Lima", lat: -12.0464, lon: -77.0428, country: "pe" },
  { name: "The Hague", lat: 52.0705, lon: 4.3007, country: "nl" },
  { name: "Hormuz", lat: 27.0600, lon: 56.4600, country: "ir" },
  { name: "Tehran", lat: 35.6892, lon: 51.3890, country: "ir" },
  { name: "Paris", lat: 48.8566, lon: 2.3522, country: "fr" },
  { name: "Berlin", lat: 52.5200, lon: 13.4050, country: "de" },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503, country: "jp" },
  { name: "Beijing", lat: 39.9042, lon: 116.4074, country: "cn" }
];

// Mapping news sources to their default country coordinates
export const SOURCE_REGISTRY = {
  "The Hindu": "in",
  "BBC": "gb",
  "Guardian": "gb",
  "PBS": "us",
  "NPR": "us",
  "NYT": "us",
  "The Hill": "us",
  "New York Times": "us",
  "Google News": "us",
  "Reuters": "gb",
  "Associated Press": "us",
  "Al Jazeera": "qa" // Qatar, lat 25.3548, lon 51.1839
};

// Custom coordinate mappings for unlisted countries
export const SPECIFIC_COORDINATES = {
  qa: { name: "Qatar", lat: 25.3548, lon: 51.1839 },
  nl: { name: "Netherlands", lat: 52.1326, lon: 5.2913 }
};

/**
 * Parses an article to automatically determine its latitude, longitude, and country code.
 * Checks the title for city names, then country keywords, then falls back to the source or metadata.
 * 
 * @param {object} article The news article object
 * @returns {object} { lat, lon, countryCode, locationName }
 */
export function geocodeArticle(article) {
  if (!article) return null;

  const title = (article.title || "").toLowerCase();
  const source = (article.source || "");
  const metaCountry = (article.country || "");
  
  // 1. Check for specific city names in the title (highest precision)
  for (const city of CITY_REGISTRY) {
    const regex = new RegExp(`\\b${city.name.toLowerCase()}\\b`, "i");
    if (regex.test(title)) {
      return {
        lat: city.lat,
        lon: city.lon,
        countryCode: city.country,
        locationName: city.name
      };
    }
  }

  // 2. Check for explicit country metadata
  if (metaCountry && metaCountry !== "Global") {
    // Try to match metadata country to our registry
    const match = Object.entries(COUNTRY_REGISTRY).find(([code, c]) => 
      c.name.toLowerCase() === metaCountry.toLowerCase() || 
      c.keywords.includes(metaCountry.toLowerCase())
    );
    if (match) {
      return {
        lat: match[1].lat,
        lon: match[1].lon,
        countryCode: match[0],
        locationName: match[1].name
      };
    }
  }

  // 3. Scan the title for country keywords
  for (const [code, country] of Object.entries(COUNTRY_REGISTRY)) {
    for (const keyword of country.keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, "i");
      if (regex.test(title)) {
        return {
          lat: country.lat,
          lon: country.lon,
          countryCode: code,
          locationName: country.name
        };
      }
    }
  }

  // 4. Map the news source to a default country
  if (source && SOURCE_REGISTRY[source]) {
    const code = SOURCE_REGISTRY[source];
    const country = COUNTRY_REGISTRY[code] || SPECIFIC_COORDINATES[code];
    if (country) {
      return {
        lat: country.lat,
        lon: country.lon,
        countryCode: code,
        locationName: `${country.name} (${source})`
      };
    }
  }

  // 5. Fallback coordinates for Global alerts (center of the map/Atlantic Ocean)
  return {
    lat: 20.0,
    lon: -20.0,
    countryCode: "global",
    locationName: "International Waters"
  };
}
