import Link from "next/link";
import type { ReactNode } from "react";
import { LEGAL } from "@/lib/legal-config";
import { cn } from "@/lib/utils";

export type LegalSection = {
    id: string;
    title: string;
    body: ReactNode;
};

type Props = {
    title: string;
    current: "terms" | "privacy";
    intro: ReactNode;
    sections: LegalSection[];
};

// Styles the plain <p>, <ul>, <h3>, <a> and <strong> tags used inside the pages,
// since Tailwind's preflight removes their default styling.
const bodyStyles = cn(
    "text-[0.95rem] leading-7",
    "[&_p]:mb-4",
    "[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5",
    "[&_li]:mb-1.5",
    "[&_h3]:mt-5 [&_h3]:mb-1.5 [&_h3]:text-base [&_h3]:font-semibold",
    "[&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-muted-foreground",
    "[&_strong]:font-semibold",
);

export function LegalDocument({ title, current, intro, sections }: Props) {
    const navLink = (active: boolean) =>
        cn(
            "text-sm transition-colors hover:text-foreground",
            active ? "text-foreground font-medium" : "text-muted-foreground",
        );

    return (
        <div className="min-h-screen">

            <div className="mx-auto grid max-w-5xl gap-8 px-6 pt-8 pb-20 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-12 md:pt-12">
                <aside
                    className="self-start text-sm md:sticky md:top-8"
                    aria-label="On this page"
                >
                    <p className="mb-3 font-semibold">On this page</p>
                    <ol className="border-l border-border">
                        {sections.map((s) => (
                            <li key={s.id}>
                                <a
                                    href={`#${s.id}`}
                                    className="block py-1.5 pl-4 text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    {s.title}
                                </a>
                            </li>
                        ))}
                    </ol>
                </aside>

                <main className="max-w-2xl">
                    <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
                        {title}
                    </h1>
                    <p className="mb-8 text-sm text-muted-foreground">
                        Effective {LEGAL.effectiveDate}
                    </p>
                    <div className={cn("border-b border-border pb-8 text-base", bodyStyles)}>
                        {intro}
                    </div>

                    {sections.map((s) => (
                        <section key={s.id} id={s.id} className="scroll-mt-6 pt-8">
                            <h2 className="mb-3 text-xl font-semibold tracking-tight">
                                {s.title}
                            </h2>
                            <div className={bodyStyles}>{s.body}</div>
                        </section>
                    ))}
                </main>
            </div>

            <footer className="border-t border-border text-sm text-muted-foreground">
                <div className="mx-auto max-w-5xl px-6 py-6">
                    © {new Date().getFullYear()} {LEGAL.operator}. Questions? Email{" "}
                    <a
                        href={`mailto:${LEGAL.contactEmail}`}
                        className="underline underline-offset-4 hover:text-foreground"
                    >
                        {LEGAL.contactEmail}
                    </a>
                    .
                </div>
            </footer>
        </div>
    );
}

export function Callout({ children }: { children: ReactNode }) {
    return (
        <div className="mb-4 rounded-r-md border-l-2 border-primary bg-muted px-4 py-3 [&_p]:mb-0">
            {children}
        </div>
    );
}