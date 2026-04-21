import { NextRequest, NextResponse } from "next/server";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const ALLOWED_ROUTES = [
  "/",
  "/dashboard",
  "/wallet",
  "/transactions",
  "/pricing",
  "/docs",
  "/account",
  "/daraja-tester",
  "/signin",
] as const;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is missing in environment." },
        { status: 500 }
      );
    }

    const { messages } = (await req.json()) as { messages?: ChatMessage[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required." }, { status: 400 });
    }

    const systemPrompt = `You are Paysuit's in-app assistant.

You must always return valid JSON in this shape:
{
  "reply": "string",
  "navigateTo": "string | null"
}

Rules:
- Keep reply concise and helpful.
- Use navigateTo only when user asks to go/open/navigate to a place in the app.
- navigateTo must be one of: ${ALLOWED_ROUTES.join(", ")}.
- If no navigation is needed, set navigateTo to null.
- Never return markdown, only JSON.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-70b-instruct:free",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((message) => ({ role: message.role, content: message.content })),
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "OpenRouter request failed.", details: errorText },
        { status: 502 }
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: "No response content from model." }, { status: 502 });
    }

    let parsed: { reply?: string; navigateTo?: string | null } = {};

    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { reply: content, navigateTo: null };
    }

    const safeRoute =
      parsed.navigateTo &&
      ALLOWED_ROUTES.includes(parsed.navigateTo as (typeof ALLOWED_ROUTES)[number])
        ? parsed.navigateTo
        : null;

    return NextResponse.json({
      reply: parsed.reply ?? "I can help with Paysuit features and navigation.",
      navigateTo: safeRoute,
    });
  } catch (error) {
    console.error("Chatbot route error:", error);
    return NextResponse.json({ error: "Failed to process chatbot request." }, { status: 500 });
  }
}
