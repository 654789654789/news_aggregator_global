# PulseMesh Intelligence Engine: Headline Quality Rules

This document outlines the logic used by the PulseMesh scraper to ensure a high-signal, premium news feed.

## 1. Sanitization (Pre-Processing)
*   **HTML Unescaping**: Convert `&#39;` to `'`, `&quot;` to `"`, etc.
*   **Emoji Stripping**: Remove emojis (🚨, ⚽, etc.) from the start of headlines.
*   **Prefix Stripping**: Remove junk like "Live Updates:", "Source:", "Breaking:", "Official:".
*   **Suffix/Branding Stripping**: Remove "— Watch", "| Editorial", " - CNN" from the end.

## 2. Structural Filters
*   **Word Count**: Minimum 6 words, Maximum 22 words.
*   **Character Count**: Minimum 25 characters.
*   **Uppercase Ratio**: Reject if more than 50% of characters are uppercase (SHOUTING).
*   **Punctuation Density**: Reject if more than 3 occurrences of `!`, `?`, or `:`.
*   **Excessive Quotes**: Reject if more than 4 quote marks.
*   **Repeated Words**: Reject if more than 30% of words are duplicates (e.g., "Breaking Breaking").

## 3. Semantic & Content Filters
*   **Clickbait Phrases**: Block "You won't believe", "Shocking", "Goes viral", "Slammed for", etc.
*   **Vague Pronouns**: Block headlines starting with "This...", "That...", "It...", "They...", "He...", "She...".
*   **Clickbait Questions**: Block titles ending in `?` or starting with question words (What, How, Why, etc.).
*   **Live Blog Garbage**: Block "Minute by minute", "As it happened", "Live coverage".

## 4. The Intelligence Boost (Scoring)
*   **Meaningful Words**: Bonus points for headlines containing Proper Nouns (Capitalized words in middle of sentence).
*   **Data/Numbers**: Bonus points for headlines containing numbers, percentages, or currency symbols.
*   **Keywords**: Bonus points for "High-Value" keywords (Economy, AI, Treaty, Policy, etc.).

## 5. System Rules
*   **Duplicate Detection**: Normalize the title (lowercase + remove special chars) and block if we've already seen it in the current run or existing database.
*   **Stopword Ratio**: (Future) Measure the density of low-information words (the, is, at, of).

---
**Current Status**: Rules 1-3 are partially implemented. Rules 4-5 and the Scoring System are the next phase.
