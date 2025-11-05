"use client";

import { useState } from "react";
import { Header } from "../layout/ui/Header";
import { Sidebar } from "../layout/ui/Sidebar";
import { ChatArea } from "./ChatArea";

export default function ChatInterface() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Array<{
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    mood?: string;
    recommendations?: {
      song?: string;
      quote?: string;
      image?: string;
    };
  }>>([]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-80' : 'w-0'
        } overflow-hidden border-r border-border`}>
        <Sidebar isOpen={sidebarOpen} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header onToggleSidebar={toggleSidebar} />
        <ChatArea messages={messages} setMessages={setMessages} />
      </div>
    </div>
  );
}
