import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ChatWindow from "@/components/chat/ChatWindow";

export const metadata = { title: "Chat | EZKEY" };

// Auth reads request cookies, so it must run inside <Suspense> (cacheComponents is on).
async function AuthedChat() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/auth/login?redirectedFrom=%2Fchat");

  return <ChatWindow showHeader={false} height="calc(100vh - 12rem)" />;
}

function ChatFallback() {
  return (
    <div
      className="rounded-xl border border-cyber-border bg-cyber-card animate-pulse"
      style={{ height: "calc(100vh - 12rem)" }}
    />
  );
}

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-cyber-dark pt-20 lg:pt-24 pb-8">
      <div className="section-container space-y-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Chat</h1>
          <p className="text-sm text-muted-foreground mt-1">Message sellers and support</p>
        </div>
        <Suspense fallback={<ChatFallback />}>
          <AuthedChat />
        </Suspense>
      </div>
    </main>
  );
}
