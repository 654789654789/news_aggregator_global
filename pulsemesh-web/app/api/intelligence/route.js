import { NextResponse } from "next/server";
import { CONFIG } from "../../lib/config";

// Rule-based professional deterministic fallback brief generator
function generateFallbackBrief(title, source, country) {
  const cleanTitle = title.replace(/[\.\u2026]+$/, "").trim();
  const location = country || "regional theatres";
  const publisher = source || "global monitoring systems";

  // Customize slightly based on keywords in title to make it extremely dynamic and high-quality
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("drill") || lowerTitle.includes("military") || lowerTitle.includes("forces") || lowerTitle.includes("defense")) {
    return `Operational alert registered regarding military activity near ${location}, sourced via ${publisher}. Preemptive defense drills and maneuvers have initiated a shift in territorial security calculations across surrounding borders. Secondary warning indicators remain active as regional commands prioritize tactical sovereignty vectors.`;
  }
  if (lowerTitle.includes("strike") || lowerTitle.includes("missile") || lowerTitle.includes("bomb") || lowerTitle.includes("attack")) {
    return `High-intensity threat alert recorded in ${location} following active combat reports distributed by ${publisher}. Damage assessments and escalation patterns indicate elevated localized sovereign risk margins. Strategic defense coordination centers have escalated posture surveillance in response to the flashpoint.`;
  }
  if (lowerTitle.includes("disaster") || lowerTitle.includes("quake") || lowerTitle.includes("magnitude") || lowerTitle.includes("flood")) {
    return `Emergency signal generated from ${publisher} regarding a severe environmental event in ${location}. Ingress vectors and civil infrastructure damages suggest an immediate disruption of normal logistical operations. Regional search, rescue, and security commands have deployed initial containment protocols.`;
  }

  // Standard geopolitical briefing fallback
  return `Strategic threat assessment monitored from ${publisher} regarding current developments in ${location}. Territorial security forces have adjusted sovereign posture vectors in response to the emerging intelligence update. Analytical branches continue tracking signal propagation for preemptive threat detection.`;
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
