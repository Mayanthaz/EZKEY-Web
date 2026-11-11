"use client";

import { MessageSquare, Send, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ChatAvatar, type AvatarStatus } from "@/components/ui/chat-avatar";

interface Conversation {
  id: string;
  seller: string;
  avatar: string;
  status: AvatarStatus;
  lastMessage: string;
  time: string;
  unread: boolean;
}

interface ChatMessage {
  id: string;
  sender: "seller" | "buyer";
  content: string;
  time: string;
}

const CURRENT_USER = { name: "You" };

const INITIAL_CONVERSATIONS: Conversation[] = [];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {};

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function ChatWindow({ height = "calc(100vh - 280px)", showHeader = true }: { height?: string; showHeader?: boolean }) {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [messagesByChat, setMessagesByChat] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [query, setQuery] = useState("");

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === selectedChat) ?? null,
    [conversations, selectedChat],
  );
  const activeMessages = selectedChat ? messagesByChat[selectedChat] ?? [] : [];

  const filteredConversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.seller.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q),
    );
  }, [conversations, query]);

  const handleSelectChat = (id: string) => {
    setSelectedChat(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: false } : c)),
    );
  };

  const handleSend = () => {
    const content = newMessage.trim();
    if (!content || !selectedChat) return;

    const message: ChatMessage = {
      id: `${selectedChat}-${Date.now()}`,
      sender: "buyer",
      content,
      time: formatTime(),
    };

    setMessagesByChat((prev) => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] ?? []), message],
    }));
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedChat ? { ...c, lastMessage: content, time: "Just now" } : c,
      ),
    );
    setNewMessage("");
  };

  return (
    <div className="space-y-6">
      {showHeader && (
        <div>
          <h1 className="font-display text-2xl font-bold">Messages</h1>
          <p className="text-sm text-muted-foreground mt-1">Chat with sellers about your orders</p>
        </div>
      )}

      <div className="glass-card overflow-hidden" style={{ height }}>
        <div className="flex h-full">
          {/* Conversation List */}
          <div className="w-80 border-r border-cyber-border shrink-0 flex flex-col">
            <div className="p-3 border-b border-cyber-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="input-neon !pl-9 !py-2 text-xs"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectChat(conv.id)}
                  className={`w-full text-left p-4 border-b border-cyber-border/50 transition-all flex items-start gap-3 ${
                    selectedChat === conv.id ? "bg-neon-purple/5" : "hover:bg-white/[0.02]"
                  }`}
                >
                  <ChatAvatar
                    src={conv.avatar}
                    name={conv.seller}
                    status={conv.status}
                    unread={conv.unread}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span
                        className={`text-sm truncate ${
                          conv.unread ? "font-semibold text-foreground" : "font-medium text-foreground/90"
                        }`}
                      >
                        {conv.seller}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">{conv.time}</span>
                    </div>
                    <p
                      className={`text-xs truncate ${
                        conv.unread ? "text-foreground/80" : "text-muted-foreground"
                      }`}
                    >
                      {conv.lastMessage}
                    </p>
                  </div>
                </button>
              ))}

              {filteredConversations.length === 0 && (
                <p className="p-6 text-center text-xs text-muted-foreground">
                  {conversations.length === 0 ? "No conversations yet." : "No conversations found."}
                </p>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {activeConversation ? (
              <>
                <div className="p-4 border-b border-cyber-border flex items-center gap-3">
                  <ChatAvatar
                    src={activeConversation.avatar}
                    name={activeConversation.seller}
                    status={activeConversation.status}
                  />
                  <div>
                    <p className="text-sm font-semibold">{activeConversation.seller}</p>
                    <p
                      className={`text-xs ${
                        activeConversation.status === "online" ? "text-neon-green" : "text-muted-foreground"
                      }`}
                    >
                      {activeConversation.status === "online" ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {activeMessages.map((msg) => {
                    const isBuyer = msg.sender === "buyer";
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2 ${isBuyer ? "justify-end" : "justify-start"}`}
                      >
                        {!isBuyer && (
                          <ChatAvatar
                            src={activeConversation.avatar}
                            name={activeConversation.seller}
                            size="sm"
                          />
                        )}
                        <div
                          className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                            isBuyer
                              ? "bg-neon-purple/20 text-foreground rounded-br-md"
                              : "bg-cyber-surface border border-cyber-border rounded-bl-md"
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{msg.time}</p>
                        </div>
                        {isBuyer && (
                          <ChatAvatar name={CURRENT_USER.name} size="sm" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 border-t border-cyber-border">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="input-neon flex-1"
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    />
                    <button className="btn-neon !px-4" onClick={handleSend} disabled={!newMessage.trim()}>
                      <span className="relative z-10"><Send className="w-4 h-4" /></span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <MessageSquare className="w-12 h-12 text-cyber-border mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">{conversations.length === 0 ? "Your messages will appear here" : "Select a conversation"}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
