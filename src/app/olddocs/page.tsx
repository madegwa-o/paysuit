import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Package, Send, TerminalSquare, Webhook } from "lucide-react";

const jsInstall = `npm install paysuitjs`;

const pythonInstall = `pip install paysuit-py`;

const directRequestExample = `curl -X POST https://api.paysuit.co.ke/api/v1/stk_push \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: <YOUR_API_KEY>" \\
  -d '{
    "senderPhoneNumber": "254712345678",
    "amount": "10",
    "receiverBankPaybill": "174379",
    "receiverBankAccountNumber": "INV-2026-001",
    "transactionDescription": "Starter Plan",
    "callbackUrl": "https://yourapp.com/api/payments/webhook"
  }'`;

const webhookHandlerExample = `// app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const payload = await req.json();

  // Example callback fields:
  // payload.result_code, payload.result_description,
  // payload.CheckoutRequestID, payload.MerchantRequestID, payload.metadata

  if (payload.result_code === 0) {
    // Mark payment as successful in DB and unlock product/service for user
    // notifyUser(payload.CheckoutRequestID, "Payment successful ✅");
  } else {
    // notifyUser(payload.CheckoutRequestID, "Payment failed ❌");
  }

  // Always return 200 quickly so webhook retries don't pile up
  return NextResponse.json({ ok: true });
}`;

const sdkExample = String.raw`// src/index.ts
interface MpesaClientConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
}

interface StkPushRequest {
  senderPhoneNumber: string;
  amount: string;
  receiverBankPaybill?: string | null;
  receiverBankAccountNumber?: string | null;
  transactionDescription?: string;
}

interface StkPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export class MpesaClient {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor(config: MpesaClientConfig) {
    if (!config.baseUrl) throw new Error("baseUrl is required");
    if (!config.apiKey) throw new Error("apiKey is required");

    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.baseUrl + endpoint, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.apiKey,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || "HTTP " + response.status);
      }

      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timeout");
      }
      throw error;
    }
  }

  async stkPush(request: StkPushRequest): Promise<StkPushResponse> {
    return this.request<StkPushResponse>("/api/v1/stk_push", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }
}

export function createMpesaClient(config: MpesaClientConfig): MpesaClient {
  return new MpesaClient(config);
}`;

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border bg-zinc-950 p-4 text-xs text-zinc-100">
      <code>{code}</code>
    </pre>
  );
}

export default function DocsPage() {
  return (
    <main className="container mx-auto max-w-5xl px-4 py-16">
      <div className="mb-10 space-y-3">
        <h1 className="text-4xl font-bold">Paysuit Docs</h1>
        <p className="text-lg text-muted-foreground">
          Choose the integration style that matches your stack. You can be live in minutes.
        </p>
      </div>

      <Alert className="mb-8 border-primary/50 bg-primary/5">
        <TerminalSquare className="h-4 w-4 text-primary" />
        <AlertDescription>
          <strong>Quick start:</strong> If you are in any JavaScript framework, run <code>npm install paysuitjs</code>.
          If you are in Python, run <code>pip install paysuit-py</code>. Method 3 is direct HTTP request payloads.
        </AlertDescription>
      </Alert>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Method 1: JavaScript / TypeScript SDK
            </CardTitle>
            <CardDescription>Works with Next.js, React, Node.js, Nuxt, SvelteKit, and more.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CodeBlock code={jsInstall} />
            <CodeBlock
              code={`import { createMpesaClient } from "paysuitjs";

const client = createMpesaClient({
  baseUrl: "https://api.paysuit.co.ke",
  apiKey: process.env.PAYSUIT_API_KEY!,
});

const response = await client.stkPush({
  senderPhoneNumber: "254712345678",
  amount: "10",
  receiverBankPaybill: "174379",
  receiverBankAccountNumber: "INV-2026-001",
  transactionDescription: "Starter Plan",
});

console.log(response);`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              Method 2: Python SDK
            </CardTitle>
            <CardDescription>Great for Django, Flask, FastAPI, and server automation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CodeBlock code={pythonInstall} />
            <CodeBlock
              code={`from paysuit import MpesaClient

client = MpesaClient(
    base_url="https://api.paysuit.co.ke",
    api_key="YOUR_API_KEY"
)

response = client.stk_push(
    senderPhoneNumber="254712345678",
    amount="10",
    receiverBankPaybill="174379",
    receiverBankAccountNumber="INV-2026-001",
    transactionDescription="Starter Plan"
)

print(response)`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Method 3: Direct API Request + Webhook
            </CardTitle>
            <CardDescription>
              Send raw HTTP requests and receive final payment outcomes on your webhook URL.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CodeBlock code={directRequestExample} />
            <Alert>
              <Webhook className="h-4 w-4" />
              <AlertDescription>
                After sending STK Push, the final result should be consumed from your webhook endpoint so you can update
                your DB and notify the user in real time.
              </AlertDescription>
            </Alert>
            <CodeBlock code={webhookHandlerExample} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reference SDK (TypeScript)</CardTitle>
            <CardDescription>
              Starter implementation you can adapt if you want your own custom client package.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock code={sdkExample} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
