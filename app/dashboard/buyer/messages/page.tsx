"use client";

import { MessageSquare, Send, Search } from "lucide-react";
import { useState } from "react";

const conversations = [
  {
    id: "1",
    seller: "KeyMaster",
    lastMessage: "Your key has been delivered! Let me know if you need help activating it.",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: "2",
    seller: "GameVault",
    lastMessage: "The DLC key is region-free, so it should work anywhere.",
    time: "1 day ago",
    unread: false,
  },
  {
    id: "3",
    seller: "SkinTrader",
    lastMessage: "I'll send the trade offer shortly. Please accept within 24 hours.",
    time: "3 days ago",
    unread: false,
  },
];

const messages = [
  { id: "1", sender: "seller", content: "Hi! Thanks for your purchase. I'll deliver the key right away.", time: "2:30 PM" },
  { id: "2", sender: "buyer", content: "Thanks! Looking forward to it.", time: "2:31 PM" },
  { id: "3", sender: "seller", content: "Your key has been delivered! Let me know if you need help activating it.", time: "2:35 PM" },
];

export default function BuyerMessagesPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>("1");
  const [newMessage, setNewMessage] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Messages</h1>
        <p className="text-sm text-muted-foreground mt-1">Chat with sellers about your orders</p>
      </div>

      <div className="glass-card overflow-hidden" style={{ height: "calc(100vh - 280px)" }}>
        <div className="flex h-full">
          {/* Conversation List */}
          <div className="w-80 border-r border-cyber-border shrink-0 flex flex-col">
            <div className="p-3 border-b border-cyber-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input type="text" placeholder="Search..." className="input-neon !pl-9 !py-2 text-xs" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedChat(conv.id)}
                  className={`w-full text-left p-4 border-b border-cyber-border/50 transition-all ${
                    selectedChat === conv.id ? "bg-neon-purple/5" : "hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center text-[10px] font-bold text-white">
                        {conv.seller[0]}
                      </div>
                      <span className="text-sm font-semibold">{conv.seller}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{conv.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate ml-10">
                    {conv.lastMessage}
                  </p>
                  {conv.unread && (
                    <div className="ml-10 mt-1">
                      <span className="w-2 h-2 bg-neon-purple rounded-full inline-block" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <>
                <div className="p-4 border-b border-cyber-border flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center text-xs font-bold text-white">
                    K
                  </div>
                  <div>
                    <p className="text-sm font-semibold">KeyMaster</p>
                    <p className="text-xs text-neon-green">Online</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "buyer" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                          msg.sender === "buyer"
                            ? "bg-neon-purple/20 text-foreground rounded-br-md"
                            : "bg-cyber-surface border border-cyber-border rounded-bl-md"
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-cyber-border">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="input-neon flex-1"
                      onKeyDown={(e) => e.key === "Enter" && setNewMessage("")}
                    />
                    <button className="btn-neon !px-4" onClick={() => setNewMessage("")}>
                      <span className="relative z-10"><Send className="w-4 h-4" /></span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <MessageSquare className="w-12 h-12 text-cyber-border mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Select a conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
