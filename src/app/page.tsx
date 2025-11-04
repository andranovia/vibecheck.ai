'use client'

import ChatInterface from "@/components/chat/ChatInterface";
import { SessionProvider } from "next-auth/react";

export default function Home() {
  return <SessionProvider><ChatInterface /></SessionProvider>;
}
