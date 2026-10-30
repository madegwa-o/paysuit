import type { Metadata } from "next";
import { LegalDocument, Callout } from "@/components/legal-document";
import { LEGAL } from "@/lib/legal-config";

export const metadata: Metadata = {
    title: `Privacy Policy | ${LEGAL.appName}`,
    description: `How ${LEGAL.appName} collects, uses and protects your personal data.`,
};

export default function PrivacyPage() {
    return (
        <LegalDocument
            title="Privacy Policy"
            current="privacy"
            intro={
                <p>
                    This policy explains what personal data {LEGAL.appName} collects, why
                    we collect it, who we share it with and the choices you have.{" "}
                    {LEGAL.operator} is the data controller. We handle your data in line
                    with the Kenya Data Protection Act, 2019.
                </p>
            }
            sections={[
                {
                    id: "collect",
                    title: "What we collect",
                    body: (
                        <>
                            <h3>Account details</h3>
                            <ul>
                                <li>Your name, email address, username and one or more phone numbers.</li>
                                <li>
                                    Your password, which we store only as a salted hash. We cannot
                                    read it.
                                </li>
                                <li>
                                    If you sign in with Google, the name, email address and
                                    profile details Google shares with us after you consent.
                                </li>
                            </ul>

                            <h3>Payment information</h3>
                            <ul>
                                <li>
                                    Payment request records: amount, the phone number that was
                                    prompted, M-Pesa receipt number, status, and timestamps.
                                </li>
                                <li>
                                    Payout settings you save, such as a paybill number, account
                                    number or account reference, and your preferred payment
                                    provider.
                                </li>
                            </ul>
                            <p>
                                We never see or store anyone&rsquo;s M-Pesa PIN. PINs are
                                entered on the phone receiving the prompt and handled by
                                Safaricom.
                            </p>

                            <h3>M-Pesa SMS backup (Android, optional)</h3>
                            <p>
                                If you enable it, the app reads incoming SMS messages from the
                                sender &ldquo;MPESA&rdquo; and uploads their text and
                                timestamps to our servers. We do not read, upload or store
                                messages from any other sender.
                            </p>

                            <h3>Chat</h3>
                            <p>
                                The messages you send and receive through {LEGAL.appName} chat,
                                along with delivery and connection status.
                            </p>

                            <h3>Technical data</h3>
                            <p>
                                Basic device and connection information such as app version,
                                device type, IP address and error logs, used to keep the
                                Service working and secure.
                            </p>
                        </>
                    ),
                },
                {
                    id: "use",
                    title: "How we use your data",
                    body: (
                        <ul>
                            <li>To create and secure your account and sign you in.</li>
                            <li>To send payment requests, receive results and show your transaction history.</li>
                            <li>To back up your M-Pesa messages when you turn that feature on.</li>
                            <li>To deliver chat messages and live payment updates to your devices.</li>
                            <li>To prevent fraud, abuse and unauthorised access.</li>
                            <li>To meet legal obligations and respond to lawful requests.</li>
                            <li>To fix bugs and improve the app.</li>
                        </ul>
                    ),
                },
                {
                    id: "basis",
                    title: "Why we are allowed to",
                    body: (
                        <p>
                            We process your data to perform our contract with you (running
                            your account and payments), with your consent (for example SMS
                            backup and Google sign-in), to comply with the law, and for our
                            legitimate interests in keeping the Service secure. Where we rely
                            on consent, you can withdraw it at any time.
                        </p>
                    ),
                },
                {
                    id: "sharing",
                    title: "Who we share it with",
                    body: (
                        <>
                            <Callout>
                                <p>We do not sell your personal data.</p>
                            </Callout>
                            <p>We share data only where needed to run the Service:</p>
                            <ul>
                                <li>
                                    <strong>Safaricom (M-Pesa Daraja):</strong> phone numbers,
                                    amounts and account references needed to process payment
                                    requests.
                                </li>
                                <li>
                                    <strong>Google:</strong> to verify your identity if you use
                                    Google sign-in.
                                </li>
                                <li>
                                    <strong>Service providers:</strong> companies that host our
                                    servers and database and help us operate the Service. They
                                    may only use your data on our instructions.
                                </li>
                                <li>
                                    <strong>Other users:</strong> your name, username and chat
                                    messages are visible to people you chat with. A person you
                                    send a payment request to will see the details of the
                                    request on their phone.
                                </li>
                                <li>
                                    <strong>Authorities:</strong> where the law requires, or to
                                    protect the rights and safety of users and the public.
                                </li>
                            </ul>
                        </>
                    ),
                },
                {
                    id: "transfers",
                    title: "Where your data is stored",
                    body: (
                        <p>
                            Our servers and database are provided by third-party hosts that
                            may be located outside {LEGAL.country}. When your data is
                            transferred, we take steps to make sure it stays protected as
                            required by the Data Protection Act.
                        </p>
                    ),
                },
                {
                    id: "retention",
                    title: "How long we keep it",
                    body: (
                        <>
                            <p>
                                We keep your data while your account is active. When you delete
                                your account, we delete or anonymise your personal data, except
                                what we must keep for legal, accounting or fraud-prevention
                                reasons, such as payment records. Backed-up M-Pesa SMS data is
                                removed when you delete it from the app or delete your account.
                            </p>
                        </>
                    ),
                },
                {
                    id: "security",
                    title: "How we protect it",
                    body: (
                        <p>
                            We use HTTPS for data in transit, hashed passwords, signed
                            session tokens and access controls on our systems. No system is
                            completely secure, so please use a strong password, keep your
                            phone locked and tell us if you suspect a problem.
                        </p>
                    ),
                },
                {
                    id: "rights",
                    title: "Your rights",
                    body: (
                        <>
                            <p>Under the Data Protection Act you can:</p>
                            <ul>
                                <li>ask what personal data we hold about you and get a copy;</li>
                                <li>ask us to correct data that is wrong or incomplete;</li>
                                <li>ask us to delete your data;</li>
                                <li>object to, or ask us to restrict, certain processing;</li>
                                <li>withdraw consent, such as turning off SMS backup;</li>
                                <li>move your data to another service where this applies.</li>
                            </ul>
                            <p>
                                Email <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>{" "}
                                and we will respond within a reasonable time, usually within 30
                                days. If you are unhappy with how we handle a request, you can
                                complain to the Office of the Data Protection Commissioner of{" "}
                                {LEGAL.country}.
                            </p>
                        </>
                    ),
                },
                {
                    id: "permissions",
                    title: "App permissions",
                    body: (
                        <ul>
                            <li>
                                <strong>SMS (receive and read):</strong> used only for the
                                optional M-Pesa SMS backup, and only for messages from
                                &ldquo;MPESA&rdquo;.
                            </li>
                            <li>
                                <strong>Internet and network state:</strong> to talk to our
                                servers and show whether you are online.
                            </li>
                            <li>
                                <strong>Notifications:</strong> to alert you to payment results
                                and messages, if you allow them.
                            </li>
                        </ul>
                    ),
                },
                {
                    id: "children",
                    title: "Children",
                    body: (
                        <p>
                            {LEGAL.appName} is not for anyone under 18. We do not knowingly
                            collect data from children. If you believe a child has given us
                            their data, contact us and we will delete it.
                        </p>
                    ),
                },
                {
                    id: "changes",
                    title: "Changes to this policy",
                    body: (
                        <p>
                            We may update this policy. We will post the new version here with
                            a new effective date and notify you in the app or by email if the
                            changes are significant.
                        </p>
                    ),
                },
                {
                    id: "contact",
                    title: "Contact us",
                    body: (
                        <p>
                            {LEGAL.operator}, {LEGAL.country}. Email{" "}
                            <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
                        </p>
                    ),
                },
            ]}
        />
    );
}