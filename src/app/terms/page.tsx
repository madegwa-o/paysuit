import type { Metadata } from "next";
import { LegalDocument, Callout } from "@/components/legal-document";
import { LEGAL } from "@/lib/legal-config";

export const metadata: Metadata = {
    title: `Terms and Conditions | ${LEGAL.appName}`,
    description: `The terms that govern your use of ${LEGAL.appName}.`,
};

export default function TermsPage() {
    return (
        <LegalDocument
            title="Terms and Conditions"
            current="terms"
            intro={
                <p>
                    These terms govern your use of {LEGAL.appName}, including our Android
                    app, our website and our servers (together, the &ldquo;Service&rdquo;).
                    By creating an account or using the Service, you agree to these terms.
                    If you do not agree, please do not use {LEGAL.appName}.
                </p>
            }
            sections={[
                {
                    id: "service",
                    title: "What Paysuit does",
                    body: (
                        <>
                            <p>
                                {LEGAL.appName} lets you request M-Pesa payments from other
                                people, receive the results of those requests in real time,
                                keep a record of your transactions, and chat with other users.
                            </p>
                            <p>
                                {LEGAL.appName} is not a bank, a mobile network operator or a
                                licensed payment service provider. Payments are processed by
                                Safaricom through M-Pesa (the Daraja API). Your M-Pesa account
                                remains governed by your agreement with Safaricom.
                            </p>
                        </>
                    ),
                },
                {
                    id: "eligibility",
                    title: "Eligibility and your account",
                    body: (
                        <>
                            <ul>
                                <li>You must be at least 18 years old and able to enter a binding contract.</li>
                                <li>You must give accurate details when you register and keep them up to date.</li>
                                <li>
                                    Each phone number can belong to only one {LEGAL.appName}{" "}
                                    account. You cannot register or add a number that is already
                                    in use on another account.
                                </li>
                                <li>
                                    You can sign in with a password or with your Google account.
                                    You are responsible for keeping your credentials and your
                                    device secure, and for everything done under your account.
                                </li>
                            </ul>
                            <p>
                                Tell us straight away at {LEGAL.contactEmail} if you think
                                someone else has accessed your account.
                            </p>
                        </>
                    ),
                },
                {
                    id: "payments",
                    title: "Payment requests",
                    body: (
                        <>
                            <p>
                                When you send a payment request (an M-Pesa STK Push), the
                                person you request receives a prompt on their phone and decides
                                whether to approve it with their M-Pesa PIN. You are
                                responsible for:
                            </p>
                            <ul>
                                <li>entering the correct phone number and amount;</li>
                                <li>
                                    choosing the right payout destination, whether that is your
                                    default settings or a paybill and account number you save in
                                    the app;
                                </li>
                                <li>
                                    only requesting money you are legitimately owed or are
                                    authorised to collect.
                                </li>
                            </ul>
                            <Callout>
                                <p>
                                    Do not use {LEGAL.appName} to trick, pressure or mislead
                                    anyone into paying. Repeated or unsolicited payment prompts
                                    to people who have not agreed to pay may lead to your account
                                    being suspended.
                                </p>
                            </Callout>
                            <p>
                                The status you see in the app (pending, successful, failed or
                                cancelled) is based on the result Safaricom sends back to us.
                                Delays or failures on the M-Pesa network are outside our
                                control. For the official record of any transaction, rely on
                                your M-Pesa confirmation message.
                            </p>
                        </>
                    ),
                },
                {
                    id: "payment-provider",
                    title: "Payment provider and fees",
                    body: (
                        <p>
                            You can choose which of our configured payment providers handles
                            your requests. M-Pesa and Safaricom may charge transaction fees
                            that are separate from {LEGAL.appName}. We will tell you before
                            we introduce any fee of our own.
                        </p>
                    ),
                },
                {
                    id: "sms",
                    title: "M-Pesa SMS backup",
                    body: (
                        <>
                            <p>
                                If you turn on SMS backup in the Android app, {LEGAL.appName}{" "}
                                reads incoming messages from the sender &ldquo;MPESA&rdquo; and
                                uploads them to our servers so that you have a backup of your
                                transaction history. We do not read your other messages.
                            </p>
                            <p>
                                This feature needs SMS permissions on your device. It is
                                optional, and you can switch it off or revoke the permission at
                                any time in your phone settings.
                            </p>
                        </>
                    ),
                },
                {
                    id: "chat",
                    title: "Chat and acceptable use",
                    body: (
                        <>
                            <p>You agree not to use the Service to:</p>
                            <ul>
                                <li>break any law, including laws on fraud, money laundering and data protection;</li>
                                <li>harass, threaten or defraud other users;</li>
                                <li>send spam, malware or unlawful content;</li>
                                <li>attempt to access accounts, data or systems that are not yours;</li>
                                <li>interfere with, probe or overload the Service, or reverse engineer it;</li>
                                <li>use automated tools to create accounts or send requests in bulk.</li>
                            </ul>
                        </>
                    ),
                },
                {
                    id: "suspension",
                    title: "Suspension and termination",
                    body: (
                        <p>
                            We may suspend or close your account, with or without notice, if
                            we reasonably believe you have broken these terms, put other
                            users at risk, or if we are required to by law or by Safaricom.
                            You can stop using {LEGAL.appName} and ask us to delete your
                            account at any time (see our Privacy Policy). Sections that by
                            their nature should continue, such as limits on liability, will
                            survive termination.
                        </p>
                    ),
                },
                {
                    id: "ip",
                    title: "Our content and your content",
                    body: (
                        <p>
                            {LEGAL.appName}, including its software, design and branding,
                            belongs to {LEGAL.operator} and is protected by law. We give you a
                            limited, personal, non-transferable licence to use the app for its
                            intended purpose. You keep ownership of the content you create,
                            such as chat messages, and you give us permission to store and
                            deliver it to the people you send it to so that the Service can
                            work.
                        </p>
                    ),
                },
                {
                    id: "availability",
                    title: "Availability",
                    body: (
                        <p>
                            We work to keep {LEGAL.appName} running, but we do not promise it
                            will always be available or error free. The Service depends on
                            third parties such as Safaricom, Google and our hosting provider,
                            and may be interrupted for maintenance or reasons outside our
                            control. We may change or remove features from time to time.
                        </p>
                    ),
                },
                {
                    id: "liability",
                    title: "Disclaimers and limits on liability",
                    body: (
                        <>
                            <p>
                                The Service is provided &ldquo;as is&rdquo; and &ldquo;as
                                available&rdquo;. To the fullest extent the law allows, we are
                                not liable for indirect or consequential losses, lost profits,
                                or losses caused by third-party failures, incorrect details you
                                enter, unauthorised access caused by your failure to protect
                                your credentials, or disputes between you and the people you
                                request payments from.
                            </p>
                            <p>
                                Where we are liable to you, our total liability is limited to
                                the amount you lost directly because of our breach, up to the
                                fees you paid us in the 12 months before the claim (or KES
                                1,000 if you paid none). Nothing in these terms limits
                                liability that cannot lawfully be limited, including for fraud.
                            </p>
                        </>
                    ),
                },
                {
                    id: "indemnity",
                    title: "Your responsibility for misuse",
                    body: (
                        <p>
                            You agree to compensate us for losses, claims and costs arising
                            from your breach of these terms or your unlawful use of the
                            Service.
                        </p>
                    ),
                },
                {
                    id: "privacy",
                    title: "Privacy",
                    body: (
                        <p>
                            How we collect and use your personal data is explained in our{" "}
                            <a href="/privacy">Privacy Policy</a>, which forms part of these
                            terms.
                        </p>
                    ),
                },
                {
                    id: "changes",
                    title: "Changes to these terms",
                    body: (
                        <p>
                            We may update these terms. If a change is significant, we will
                            notify you in the app or by email before it takes effect. If you
                            keep using {LEGAL.appName} after the effective date, you accept
                            the updated terms.
                        </p>
                    ),
                },
                {
                    id: "law",
                    title: "Governing law and disputes",
                    body: (
                        <p>
                            These terms are governed by the laws of {LEGAL.country}. Please
                            contact us first so we can try to resolve any dispute informally.
                            If we cannot, the courts of {LEGAL.country} have jurisdiction.
                        </p>
                    ),
                },
                {
                    id: "contact",
                    title: "Contact us",
                    body: (
                        <p>
                            Email <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>{" "}
                            for any question about these terms.
                        </p>
                    ),
                },
            ]}
        />
    );
}