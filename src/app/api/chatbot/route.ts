import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Provider = "openai" | "anthropic" | "gemini" | "openrouter";

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

const SYSTEM_PROMPT = `You are Paysuit's in-app assistant.

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

export async function POST(req: NextRequest) {
  try {
    const { messages, provider = "openai", model } = (await req.json()) as {
      messages?: ChatMessage[];
      provider?: Provider;
      model?: string;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required." }, { status: 400 });
    }

    const content = await generateProviderResponse({ messages, provider, model });

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

    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as { status?: unknown }).status === "number"
        ? (error as { status: number }).status
        : 500;

    const message =
      typeof error === "object" && error !== null && "message" in error
        ? String((error as { message?: unknown }).message)
        : "Failed to process chatbot request.";

    return NextResponse.json({ error: message }, { status: Math.min(Math.max(status, 400), 599) });
  }
}

async function generateProviderResponse({
  messages,
  provider,
  model,
}: {
  messages: ChatMessage[];
  provider: Provider;
  model?: string;
}) {
  if (provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is missing in environment.");
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: model || process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((message) => ({ role: message.role, content: message.content })),
      ],
    });

    return completion.choices[0]?.message?.content;
  }

  if (provider === "anthropic") {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is missing in environment.");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: model || process.env.ANTHROPIC_CHAT_MODEL || "claude-3-5-haiku-latest",
        max_tokens: 700,
        system: SYSTEM_PROMPT,
        messages: messages.map((message) => ({ role: message.role, content: message.content })),
      }),
    });

    const data = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
      error?: { message?: string };
    };

    if (!response.ok) {
      throw { status: response.status, message: data.error?.message || "Anthropic request failed." };
    }

    return data.content?.find((item) => item.type === "text")?.text;
  }

  if (provider === "gemini") {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing in environment.");
    }

    const selectedModel = model || process.env.GEMINI_CHAT_MODEL || "gemini-2.0-flash";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents: messages.map((message) => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [{ text: message.content }],
          })),
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 700,
          },
        }),
      }
    );

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      error?: { message?: string };
    };

    if (!response.ok) {
      throw { status: response.status, message: data.error?.message || "Gemini request failed." };
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is missing in environment.");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(process.env.OPENROUTER_SITE_URL ? { "HTTP-Referer": process.env.OPENROUTER_SITE_URL } : {}),
      ...(process.env.OPENROUTER_SITE_NAME ? { "X-OpenRouter-Title": process.env.OPENROUTER_SITE_NAME } : {}),
    },
    body: JSON.stringify({
      model: model || process.env.OPENROUTER_CHAT_MODEL || "meta-llama/llama-3.3-70b-instruct:free",
      temperature: 0.4,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((message) => ({ role: message.role, content: message.content })),
      ],
    }),
  });

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw { status: response.status, message: data.error?.message || "OpenRouter request failed." };
  }

  return data.choices?.[0]?.message?.content;
}
