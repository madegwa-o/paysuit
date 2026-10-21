import { redirect } from "next/navigation";
import Chat from "@/components/ws/Chat";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export default async function ChatPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?callbackUrl=/chat");

  return <Chat userId={user.id} />;
}