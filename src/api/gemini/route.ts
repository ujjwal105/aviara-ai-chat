// Skip TypeScript checking in this route to avoid local type issues in dev environments
// (Next.js runtime will still execute this code on the server).
// @ts-nocheck
import { NextResponse } from "next/server";

// A small mapping from friendly UI names to Google's model identifiers (REST API expects the model name in the path)
// Update these values to match the exact model IDs you want to target.
const modelMap: Record<string, string | null> = {
  "Gemini 2.5 Flash": "models/gemini-2.5-flash",
  // Fallbacks / placeholders for other UI options. If you don't support them on this endpoint, set to null.
  "o3-mini": null,
  "Claude 3.5 Sonnet": null,
  "GPT-4-1 Mini": null,
  "GPT-4-1": null,
};

const BASE_URL = "https://generativelanguage.googleapis.com/v1";

function extractTextFromResponse(json: any): string | null {
  // Try a few common response shapes used by GenAI APIs.
  try {
    // Case: { candidates: [{ output: [ { content: [{ type: 'output_text', text: '...'}] } ] }] }
    if (json?.candidates && Array.isArray(json.candidates)) {
      const first = json.candidates[0];
      if (first?.output && Array.isArray(first.output)) {
        for (const out of first.output) {
          if (out?.content && Array.isArray(out.content)) {
            const textParts = out.content
              .map((c: any) => c?.text || c?.data || null)
              .filter(Boolean);
            if (textParts.length) return textParts.join("\n");
          }
        }
      }
    }

    // Case: { output: [ { content: [ { text: '...' } ] } ] }
    if (json?.output && Array.isArray(json.output)) {
      for (const out of json.output) {
        if (out?.content && Array.isArray(out.content)) {
          const textParts = out.content
            .map((c: any) => c?.text || c?.type || c?.data || null)
            .filter(Boolean);
          if (textParts.length) return textParts.join("\n");
        }
      }
    }

    // Case: { text: '...' }
    if (typeof json?.text === "string") return json.text;

    // Case: legacy structures
    if (json?.result?.output && Array.isArray(json.result.output)) {
      const out = json.result.output[0];
      if (typeof out === "string") return out;
      if (out?.content && Array.isArray(out.content)) {
        return out.content.map((c: any) => c.text || c).join("\n");
      }
    }

    return null;
  } catch (e) {
    console.error("extractTextFromResponse error", e);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { prompt, model: selectedModel } = await req.json();

    const mapped = modelMap[selectedModel];
    if (!mapped) {
      return NextResponse.json(
        { error: `Model ${selectedModel} is not supported by this endpoint.` },
        { status: 400 }
      );
    }

    // Build the request to the REST endpoint
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GOOGLE_API_KEY on server environment." },
        { status: 500 }
      );
    }

    const url = `${BASE_URL}/${mapped}:generate?key=${encodeURIComponent(
      apiKey
    )}`;

    // The REST shape may vary by model and API version. This body is a reasonable default for text generation.
    const body = {
      // Many GenAI endpoints expect a `prompt` or `input` object. We use `prompt.text` here as a readable shape.
      prompt: { text: prompt },
      // Optionally tune generation parameters here (temperature, maxOutputTokens, etc.)
      temperature: 0.2,
      maxOutputTokens: 1024,
    } as any;

    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const errText = await r.text();
      console.error("Generative API error", r.status, errText);
      return NextResponse.json(
        { error: `Generative API returned ${r.status}: ${errText}` },
        { status: 502 }
      );
    }

    const json = await r.json();
    const text = extractTextFromResponse(json);
    if (text === null) {
      console.warn("Unknown response shape from generative API", json);
      return NextResponse.json(
        { error: "Could not parse response from generative API", raw: json },
        { status: 502 }
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Error in Gemini API route:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
