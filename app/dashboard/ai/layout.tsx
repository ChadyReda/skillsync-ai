import { getConversations } from "./actions";
import { AIShell } from "./_components/ai-shell";

export default async function AILayout({ children }: { children: React.ReactNode }) {
  const conversations = await getConversations();

  return <AIShell conversations={conversations}>{children}</AIShell>;
}
