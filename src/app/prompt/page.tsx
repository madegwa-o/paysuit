import PromptPanel from "@/components/prompt-panel";
import { getBankAccounts } from "@/app/actions/bank-accounts";

export default async function PromptPage() {
    const accounts = await getBankAccounts();
    return (
        <section className="mx-auto max-w-md space-y-4 p-4 pb-24">
            <h1 className="text-xl font-semibold">Request payment</h1>
            <PromptPanel initialAccounts={accounts} />
        </section>
    );
}