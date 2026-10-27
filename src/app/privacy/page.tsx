import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Privacy Policy · Paysuit Merchant",
    description: "How Paysuit Merchant collects, uses and shares your information.",
};

const APP_NAME = "Paysuit Merchant";
const COMPANY = "Paysuit";
const CONTACT_EMAIL = "admin@paysuit.co.ke"; // TODO: use a mailbox you actually monitor
const LAST_UPDATED = "27 October 2026";

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="space-y-3">
            <h2 className="text-xl font-semibold">{title}</h2>
            {children}
        </section>
    );
}

function List({ items }: { items: ReactNode[] }) {
    return (
        <ul className="list-disc space-y-1 pl-6">
            {items.map((item, i) => (
                <li key={i}>{item}</li>
            ))}
        </ul>
    );
}

export default function PrivacyPolicyPage() {
    return (
        <main className="mx-auto max-w-3xl space-y-8 px-4 py-10 leading-7">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold">Privacy Policy</h1>
                <p className="text-sm text-muted-foreground">
                    {APP_NAME} · Last updated {LAST_UPDATED}
                </p>
            </header>

            <p>
                {COMPANY} (we, us) operates the {APP_NAME} Android app, the website at www.paysuit.co.ke and the
                backend services behind them (together, the Service). {APP_NAME} lets merchants send M-Pesa payment
                prompts (STK push) to their customers and track the results. This policy explains what personal
                information we collect, how we use and share it, and the choices you have. By using the Service you
                agree to this policy.
            </p>

            <Section title="1. Information we collect">
                <h3 className="font-medium">Information you give us</h3>
                <List
                    items={[
                        "Account details: username, first and last name, email address, password and one or more phone numbers. Passwords are stored only as a one-way hash, never in readable form.",
                        "Receiving accounts and payment settings: paybill or till numbers, account numbers or references, and your preferred payment provider.",
                        "Payment requests: the phone number of the customer you are charging, the amount, an optional description, and the receiving paybill and account number for that request.",
                    ]}
                />

                <h3 className="font-medium">Information from Google</h3>
                <p>
                    If you choose Continue with Google, Google shares your name, email address, profile picture and a
                    Google account identifier with us. We never receive your Google password.
                </p>

                <h3 className="font-medium">Information created when you use the Service</h3>
                <List
                    items={[
                        "Payment results: status (pending, paid, failed or cancelled), M-Pesa receipt number, result description and timestamps.",
                        "Account activity: sign-in times, and technical logs that include your user ID, username, IP address and request times, which we use to run and protect the Service.",
                        "A live connection status, so the app can show payment results to you in real time.",
                    ]}
                />

                <h3 className="font-medium">Stored on your device</h3>
                <p>
                    The app keeps a session token in its private storage so you stay signed in. It is removed when you
                    log out.
                </p>

                <h3 className="font-medium">What we do not collect</h3>
                <p>
                    We never see or store your M-Pesa PIN or the PINs of your customers. PINs are entered on the
                    customer phone and handled by Safaricom. The app does not request access to your contacts, SMS
                    messages, location, camera, microphone or files.
                </p>
            </Section>

            <Section title="2. How we use information">
                <List
                    items={[
                        "Create and manage your account and sign you in.",
                        "Send payment prompts to your customers through M-Pesa and show you the results.",
                        "Save your receiving accounts and settings so you do not have to enter them again.",
                        "Keep the Service secure, detect abuse and fraud, and fix problems.",
                        "Respond to support requests and send service messages.",
                        "Meet legal and accounting obligations.",
                    ]}
                />
                <p>
                    We do not sell your personal information. We do not use it for advertising, and the app contains
                    no advertising or third-party analytics tools.
                </p>
            </Section>

            <Section title="3. How we share information">
                <List
                    items={[
                        "Safaricom (M-Pesa Daraja): to deliver a payment prompt we send the customer phone number, amount, description, account reference and the business shortcode. Safaricom handles this under its own privacy terms.",
                        "Google: when you use Sign in with Google.",
                        "Service providers: companies that host our servers and databases (including Render). They process data only on our instructions.",
                        "Legal and safety: when the law, a court order or a valid request from an authority requires it, or to protect the rights, safety and security of our users and the Service.",
                        "Business changes: if we merge with or are acquired by another company, your information may transfer to it. We will tell you before it becomes subject to a different policy.",
                    ]}
                />
            </Section>

            <Section title="4. Your customers information">
                <p>
                    When you send a payment prompt you give us a customer phone number. You are responsible for having
                    a legitimate reason, and any permission needed, to contact that customer. We use the number only to
                    send the prompt, show you its result and keep your payment history. If a customer contacts us about
                    their data, we may refer them to you.
                </p>
            </Section>

            <Section title="5. How long we keep information">
                <p>
                    We keep your information while your account is active. When you delete your account we delete your
                    profile, phone numbers, saved receiving accounts and settings, and we delete or anonymise your
                    payment history within 30 days. The exception is records we must keep to meet legal, accounting or
                    fraud-prevention obligations, which we keep only as long as required.
                </p>
            </Section>

            <Section title="6. Deleting your account">
                <p>
                    In the app, open My Account and choose Delete account. You can also email us at{" "}
                    <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
                        {CONTACT_EMAIL}
                    </a>{" "}
                    from the email address on your account and ask us to delete your account and data. Deletion is
                    permanent. Deactivating or logging out does not delete your data.
                </p>
            </Section>

            <Section title="7. Security">
                <p>
                    We use HTTPS to protect data in transit, store passwords as one-way hashes and limit access to our
                    systems. No method of transmission or storage is completely secure, so we cannot guarantee
                    absolute security.
                </p>
            </Section>

            <Section title="8. Your rights">
                <p>
                    Under the Kenya Data Protection Act, 2019 you may ask to access, correct or delete your personal
                    data, object to or restrict certain processing, and withdraw consent where we rely on it. You can
                    edit most details yourself in My Account. For anything else, contact us. If you are not satisfied
                    with our response, you can complain to the Office of the Data Protection Commissioner of Kenya
                    (
                    <a className="underline" href="https://www.odpc.go.ke" target="_blank" rel="noopener noreferrer">
                        www.odpc.go.ke
                    </a>
                    ).
                </p>
            </Section>

            <Section title="9. International transfers">
                <p>
                    Our service providers may store and process data on servers outside Kenya. Where we transfer
                    personal data abroad, we use the safeguards required by applicable law.
                </p>
            </Section>

            <Section title="10. Children">
                <p>
                    The Service is for businesses and adults aged 18 and over. We do not knowingly collect information
                    from children. If you believe a child has given us personal data, contact us and we will delete it.
                </p>
            </Section>

            <Section title="11. Changes to this policy">
                <p>
                    We may update this policy from time to time. We will change the date at the top of this page and,
                    for significant changes, notify you in the app or by email.
                </p>
            </Section>

            <Section title="12. Contact us">
                <p>
                    {COMPANY}, Nairobi, Kenya
                    <br />
                    Email:{" "}
                    <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
                        {CONTACT_EMAIL}
                    </a>
                </p>
            </Section>
        </main>
    );
}