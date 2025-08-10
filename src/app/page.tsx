'use client'

import ChatInterface from "@/components/ChatInterface";
import { SessionProvider } from "next-auth/react";

export default function Home() {
  return <SessionProvider><ChatInterface /></SessionProvider>;
}
