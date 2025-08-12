import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getServerAuthSession(): Promise<Session | null> {
  return getServerSession(authOptions);
}

export function hasRole(session: Session | null, roles: Array<"ADMIN" | "PREMIUM" | "USER">): boolean {
  const r = (session?.user as any)?.role as string | undefined;
  return !!r && roles.includes(r as any);
}
