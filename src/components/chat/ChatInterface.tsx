"use client";

import { useState } from "react";
import { Header } from "../layout/ui/Header";
import { Sidebar } from "../layout/ui/Sidebar";
import { ChatArea } from "./ChatArea";
import { SidePanel } from "../layout/ui/SidePanel";
import { ArrowLeftFromLine } from "lucide-react";
import { useMessagesStore } from "@/lib/store";

export default function ChatInterface() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const messages = useMessagesStore((state) => state.messages);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Auto-show side panel when there are messages
  const shouldShowSidePanel = messages.length > 0 && sidePanelOpen;

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
        <ChatArea sidePanelOpen={sidePanelOpen} />
      </div>

      {/* Side Panel - Only show toggle when there are messages */}
      {messages.length > 0 && (
        <div className={`transition-all relative duration-300 ease-in-out ${shouldShowSidePanel ? 'w-[45vw]' : 'w-0'
          }  border-r border-border`}>
          <div className={`absolute w-40 h-40 rounded-full blur-xl bg-primary/10 -left-20 top-[calc(50%-6.5rem)] ${shouldShowSidePanel ? 'opacity-30' : 'opacity-80'} transition-opacity`} />
          <div onClick={() => setSidePanelOpen(!sidePanelOpen)} className={`${shouldShowSidePanel ? 'rounded-r-md p-2 -left-[33px] rotate-180' : 'rounded-l-xl p-4 -left-[44px] rotate-0'} absolute  top-[calc(50%-3rem)] z-10  bg-background border border-border cursor-pointer hover:bg-white/5`}>
            <ArrowLeftFromLine size={16} />
          </div>
          <SidePanel isOpen={shouldShowSidePanel} />
        </div>
      )}
    </div>
  );
}
