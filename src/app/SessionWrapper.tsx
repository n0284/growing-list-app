import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import SessionClientProvider from "@/app/SessionClientProvider";

export default async function SessionWrapper({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  return <SessionClientProvider session={session}>{children}</SessionClientProvider>;
}