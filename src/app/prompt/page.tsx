import PromptPanel from "@/components/prompt-panel";

export default function PromptPage() {
    return (
        <section className="mx-auto max-w-md space-y-4 p-4 pb-24">
            <h1 className="text-xl font-semibold">Request payment</h1>
            <PromptPanel />
        </section>
    );
}