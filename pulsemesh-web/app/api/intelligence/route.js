import { NextResponse } from "next/server";
import { CONFIG } from "../../lib/config";

// Rule-based professional deterministic fallback brief generator
function generateFallbackBrief(title, source, country) {
  const cleanTitle = title.replace(/[\.\u2026]+$/, "").trim();
  const location = country || "regional theatres";
  const publisher = source || "global monitoring systems";
  const lowerTitle = title.toLowerCase();

  // Customize based on keywords in title to make it extremely relevant and context-aware
  if (lowerTitle.includes("drill") || lowerTitle.includes("military") || lowerTitle.includes("forces") || lowerTitle.includes("defense")) {
    return `Operational alert registered regarding military activity near ${location}, sourced via ${publisher}. Preemptive defense drills and maneuvers have initiated a shift in territorial security calculations across surrounding borders. Secondary warning indicators remain active as regional commands prioritize tactical sovereignty vectors.`;
  }
  if (lowerTitle.includes("strike") || lowerTitle.includes("missile") || lowerTitle.includes("bomb") || lowerTitle.includes("attack")) {
    return `High-intensity threat alert recorded in ${location} following active combat reports distributed by ${publisher}. Damage assessments and escalation patterns indicate elevated localized sovereign risk margins. Strategic defense coordination centers have escalated posture surveillance in response to the flashpoint.`;
  }
  if (lowerTitle.includes("disaster") || lowerTitle.includes("quake") || lowerTitle.includes("magnitude") || lowerTitle.includes("flood") || lowerTitle.includes("tsunami")) {
    return `Emergency signal generated from ${publisher} regarding a severe environmental event in ${location}. Ingress vectors and civil infrastructure damages suggest an immediate disruption of normal logistical operations. Regional search, rescue, and security commands have deployed initial containment protocols.`;
  }
  if (lowerTitle.includes("film") || lowerTitle.includes("festival") || lowerTitle.includes("award") || lowerTitle.includes("movie") || lowerTitle.includes("music") || lowerTitle.includes("artist") || lowerTitle.includes("actor") || lowerTitle.includes("show") || lowerTitle.includes("cannes")) {
    return `Cultural signal tracked from ${publisher} in ${location} regarding major developments in the entertainment and creative arts sector. High public sentiment metrics indicate substantial regional audience engagement. Strategic monitors note this event as a key driver of soft-power influence.`;
  }
  if (lowerTitle.includes("market") || lowerTitle.includes("stock") || lowerTitle.includes("economy") || lowerTitle.includes("business") || lowerTitle.includes("trade") || lowerTitle.includes("deal") || lowerTitle.includes("billion") || lowerTitle.includes("million")) {
    return `Economic signal processed from ${publisher} in ${location} regarding critical marketplace activity. Sector shifts and capital allocations indicate adjusted risk appetites across regional trade lanes. Financial analysts are monitoring secondary effects on local sovereign growth projections.`;
  }
  if (lowerTitle.includes("tech") || lowerTitle.includes("ai") || lowerTitle.includes("software") || lowerTitle.includes("device") || lowerTitle.includes("science") || lowerTitle.includes("space") || lowerTitle.includes("discovery")) {
    return `Technological advancement vector registered from ${publisher} in ${location}. Ingress telemetry suggests significant breakthroughs in active sector research and development frameworks. Computational monitors are analyzing system scalability and regional patent indicators.`;
  }
  if (lowerTitle.includes("sport") || lowerTitle.includes("game") || lowerTitle.includes("match") || lowerTitle.includes("cup") || lowerTitle.includes("cricket") || lowerTitle.includes("football") || lowerTitle.includes("athlete") || lowerTitle.includes("championship")) {
    return `Athletic competitive signal received from ${publisher} in ${location} regarding major tournament developments. Regional public interest vectors remain elevated as teams finalize tactical campaigns. Analysts note zero immediate sovereign risks associated with the event.`;
  }

  // Standard geopolitical briefing fallback (Neutral catch-all)
  return `Strategic intelligence signal ingested from ${publisher} regarding recent developments in ${location}. Localized information streams are being processed as analytical branches continue tracking signal propagation for real-time telemetry updates.`;
}

export async function POST(req) {
  try {
    const { title, source, country } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Missing required headline title parameter" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;

    // Secure fallback if Groq API key is offline or not set
    if (!apiKey) {
      const fallback = generateFallbackBrief(title, source, country);
      return NextResponse.json({ brief: fallback, source: "DETERMINISTIC_FALLBACK" });
    }

    // Format prompt template dynamically
    const prompt = CONFIG.AI_PROMPT_TEMPLATE
      .replace("{title}", title)
      .replace("{source}", source || "Intelligence Portal")
      .replace("{country}", country || "Global Axis");

    // Fetch Groq high-speed llama inference endpoint
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are an elite, objective geopolitical intelligence threat assessment officer. Always provide strict, 3-sentence military-style briefs without introductions or conversational chatter. Focus on territorial sovereign risks and tactical escalations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.35,
        max_tokens: 140
      })
    });

    if (!response.ok) {
      // Fallback on network/API failure
      const fallback = generateFallbackBrief(title, source, country);
      return NextResponse.json({ brief: fallback, source: "NETWORK_FALLBACK" });
    }

    const result = await response.json();
    const brief = result?.choices?.[0]?.message?.content?.trim();

    if (!brief) {
      const fallback = generateFallbackBrief(title, source, country);
      return NextResponse.json({ brief: fallback, source: "CONTENT_FALLBACK" });
    }

    return NextResponse.json({ brief, source: "GROQ_COPROCESSOR_AI" });

  } catch (error) {
    // Ultimate boundary safety guard
    const fallback = generateFallbackBrief("Global security vector update", "Open Intelligence", "Global");
    return NextResponse.json({ brief: fallback, source: "EXCEPTION_FALLBACK" });
  }
}
