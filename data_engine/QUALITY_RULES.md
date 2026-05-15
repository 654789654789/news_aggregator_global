# PulseMesh Intelligence Engine: Headline Quality Rules

This document outlines the logic used by the PulseMesh scraper to ensure a high-signal, premium news feed.

## 1. Sanitization (Pre-Processing)
*   **HTML Unescaping**: Convert `&#39;` to `'`, `&quot;` to `"`, etc. (✅ Implemented)
*   **Emoji Stripping**: Remove emojis from the start of headlines. (✅ Implemented)
*   **Junk Suffix Removal**: Strips "Watch", "Live", "Gallery", "Video", "Editorial", "Opinion", "Photos", "Update", "Breaking" from the end. (✅ Implemented)

## 2. Structural Filters
*   **Word Count**: 
    *   General: Min 5 words, Max 25 words. (✅ Implemented)
    *   Sports: Min 7 words for higher signal. (✅ Implemented)
*   **Strict-5 Rule**: If exactly 5 words, every word must be > 2 characters. (✅ Implemented)
*   **Character Count**: Minimum 30 characters. (✅ Implemented)
*   **Uppercase Ratio**: Penalty if more than 40% of characters are uppercase. (✅ Implemented)
*   **Punctuation Density**: Penalty if more than 3 occurrences of `!`, `?`, or `:`. (✅ Implemented)

## 3. Semantic & Content Filters
*   **Question Block (Rule 22)**: HARD REJECT if title contains `?` OR starts with question words ("How", "Why", "What", etc.). (✅ Implemented)
*   **Vague Pronouns**: HARD REJECT if headlines start with "This...", "That...", "It...", "They...", etc. (✅ Implemented)
*   **Clickbait Phrases**: Scoring penalty for "You won't believe", "Shocking", "Goes viral", etc. (✅ Implemented)

## 4. The Intelligence Boost (Scoring)
*   **Proper Noun Boost**: Bonus points for capitalized words in the middle of the sentence. (✅ Implemented)
*   **Data/Numbers Boost**: Bonus points for headlines containing numbers or stats. (✅ Implemented)
*   **Keywords Boost**: Bonus points for "High-Value" keywords (Economy, AI, Treaty, Policy, etc.). (✅ Implemented)

## 5. Decision Log (Rules Skipped/Deprecated)
*   **Rule 16 (Excessive Quotes)**: SKIPPED. Necessary for movie reviews and direct attribution.
*   **Rule 17 (Repeated Words)**: SKIPPED. High-rated media occasionally use repetition for impact.
*   **Rule 8 (Prefix Stripping)**: SKIPPED. Risks over-stripping and causing sentence fragmentation.
*   **Rule 23 (Live Blog Garbage)**: SKIPPED. "Live updates" on financial/breaking news is often high-value intel.
*   **Rule 32 (Stopword Ratio)**: DEPRECATED. Replaced by the more surgical "Strict-5" rule.

---
**System Status**: 100% Quality Protocol Active.
