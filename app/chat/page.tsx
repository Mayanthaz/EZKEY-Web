import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ChatWindow from "@/components/chat/ChatWindow";

export const metadata = { title: "Chat | EZKEY" };

export default async function ChatPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/auth/login?redirectedFrom=%2Fchat");

  return (
    <main className="min-h-screen bg-cyber-dark pt-20 lg:pt-24 pb-8">
      <div className="section-container space-y-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Chat</h1>
          <p className="text-sm text-muted-foreground mt-1">Message sellers and support</p>
        </div>
        <ChatWindow showHeader={false} height="calc(100vh - 12rem)" />
      </div>
    </main>
  );
}
