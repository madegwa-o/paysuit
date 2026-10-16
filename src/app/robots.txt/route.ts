import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/site";

export async function GET() {
    const body = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

    return new NextResponse(body, {
        headers: { "Content-Type": "text/plain" },
    });
}