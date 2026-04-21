"use client";

import { FormEvent, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle, Send, X } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Provider = "openai" | "anthropic" | "gemini" | "openrouter";

const STARTER_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I can answer Paysuit questions and navigate you to pages like dashboard, wallet, transactions, pricing, docs, or account.",
};

const MODEL_OPTIONS: Record<Provider, Array<{ label: string; value: string }>> = {
  openai: [
    { label: "GPT-4o mini", value: "gpt-4o-mini" },
    { label: "GPT-4.1 mini", value: "gpt-4.1-mini" },
  ],
  anthropic: [
    { label: "Claude 3.5 Haiku", value: "claude-3-5-haiku-latest" },
    { label: "Claude 3.7 Sonnet", value: "claude-3-7-sonnet-latest" },
  ],
  gemini: [
    { label: "Gemini 2.0 Flash", value: "gemini-2.0-flash" },
    { label: "Gemini 1.5 Flash", value: "gemini-1.5-flash" },
  ],
  openrouter: [
    { label: "Llama 3.3 70B (free)", value: "meta-llama/llama-3.3-70b-instruct:free" },
    { label: "DeepSeek R1", value: "deepseek/deepseek-r1" },
  ],
};

export default function ChatbotWidget() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState<Provider>("openai");
  const [model, setModel] = useState(MODEL_OPTIONS.openai[0].value);
  const [messages, setMessages] = useState<ChatMessage[]>([STARTER_MESSAGE]);

  const visibleMessages = useMemo(
    () => messages.filter((message) => message.role !== "assistant" || message.content.trim().length > 0),
    [messages]
  );

  const submitPrompt = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) {
      return;
    }

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmedInput }];

    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, provider, model }),
      });

      const payload = (await response.json()) as {
        reply?: string;
        navigateTo?: string | null;
        error?: string;
        details?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || payload.details || "Unable to reach chatbot.");
      }

      const reply = payload.reply?.trim() || "I can help with Paysuit navigation and product questions.";
      setMessages((current) => [...current, { role: "assistant", content: reply }]);

      if (payload.navigateTo && payload.navigateTo !== pathname) {
        router.push(payload.navigateTo);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `Sorry, I could not process that request right now (${message}).`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 sm:bottom-6">
      {isOpen && (
        <div className="mb-3 flex h-[30rem] w-[min(92vw,26rem)] flex-col rounded-2xl border border-white/10 bg-zinc-950/95 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-white">
            <p className="text-sm font-semibold">Paysuit Assistant</p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-zinc-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Close chatbot"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 border-b border-white/10 p-3">
            <select
              value={provider}
              onChange={(event) => {
                const selectedProvider = event.target.value as Provider;
                setProvider(selectedProvider);
                setModel(MODEL_OPTIONS[selectedProvider][0].value);
              }}
              className="h-9 rounded-lg border border-white/15 bg-zinc-900 px-2 text-xs text-white outline-none"
              aria-label="AI provider"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="gemini">Gemini</option>
              <option value="openrouter">OpenRouter</option>
            </select>

            <select
              value={model}
              onChange={(event) => setModel(event.target.value)}
              className="h-9 rounded-lg border border-white/15 bg-zinc-900 px-2 text-xs text-white outline-none"
              aria-label="Model selection"
            >
              {MODEL_OPTIONS[provider].map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3 text-sm">
            {visibleMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                  message.role === "user"
                    ? "ml-auto bg-emerald-500 text-black"
                    : "mr-auto bg-zinc-800 text-zinc-100"
                }`}
              >
                {message.content}
              </div>
            ))}

            {isLoading && <div className="text-xs text-zinc-400">Thinking...</div>}
          </div>

          <form onSubmit={submitPrompt} className="border-t border-white/10 p-3">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask a question or say: take me to wallet"
                className="h-10 flex-1 rounded-xl border border-white/15 bg-zinc-900 px-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-emerald-400"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="mx-auto inline-flex h-14 min-w-14 items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 text-sm font-semibold text-black shadow-lg transition hover:bg-emerald-300"
      >
        <MessageCircle className="h-5 w-5" />
        <span>{isOpen ? "Hide assistant" : "Chat with bot"}</span>
      </button>
    </div>
  );
}
