# PulseMesh Intelligence Engine: Headline Quality Rules

This document outlines the logic used by the PulseMesh scraper to ensure a high-signal, premium news feed.

## 1. Sanitization (Pre-Processing)
*   **HTML Unescaping**: Convert `&#39;` to `'`, `&quot;` to `"`, etc. (✅ Implemented)
*   **Surgical Emoji Removal**: Uses hex-based regex to remove emojis while preserving text integrity. (✅ Implemented)
*   **Junk Suffix Removal**: Strips "Watch", "Live", "Gallery", "Video", "Editorial", "Opinion", "Photos", "Update", "Breaking" from the end. (✅ Implemented)

## 2. Structural Filters
*   **Word Count**: 
    *   General: Min 5 words, Max 25 words. (✅ Implemented)
    *   Sports: Min 7 words for higher signal. (✅ Implemented)
    *   **Sports Noise Filter**: HARD REJECT if headline contains "fantasy", "betting", "prediction", "lineups", "odds", "tickets", "prices", etc. OR is a listicle (Top 5, Best 10, etc.). (✅ Implemented)
*   **Strict-5 Rule**: If exactly 5 words, every word must be > 2 characters. (✅ Implemented)
*   **Character Count**: Minimum 30 characters. (✅ Implemented)
*   **Uppercase Ratio**: Penalty if more than 40% of characters are uppercase. (✅ Implemented)
*   **Punctuation Density**: Penalty if more than 3 occurrences of `!`, `?`, or `:`. (✅ Implemented)

## 3. Semantic & Content Filters
*   **Question Block (Rule 22)**: HARD REJECT if title contains `?` OR starts with question words ("How ", "Why ", "What ", etc.). (✅ Implemented)
*   **Vague Pronouns**: HARD REJECT if headlines start with "This ", "That ", "It ", "They ", etc. (✅ Implemented)
*   **Clickbait Phrases**: Scoring penalty for "You won't believe", "Shocking", "Goes viral", etc. (✅ Implemented)

## 4. The Intelligence Boost (Scoring)
*   **Proper Noun Boost**: Bonus points for capitalized words in the middle of the sentence. (✅ Implemented)
*   **Data/Numbers Boost**: Bonus points for headlines containing numbers or stats. (✅ Implemented)
*   **Keywords Boost**: Bonus points for "High-Value" keywords (Economy, AI, Treaty, Policy, etc.). (✅ Implemented)

## 5. System Rules
*   **7-Day Retention**: Automatically prunes news older than 7 days. (✅ Implemented)
*   **Top-4 Limit**: Only the 4 highest-scoring new articles per category are added per run. (✅ Implemented)
*   **Storage Cap**: Maintains a maximum of 200 headlines per category. (✅ Implemented)

---
**System Status**: 100% Quality Protocol Active.
