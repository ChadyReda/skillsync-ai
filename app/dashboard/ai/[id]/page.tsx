import { notFound } from "next/navigation";
import { getConversationWithMessages } from "../actions";
import { ChatClient } from "../_components/chat-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ConversationPage({ params }: Props) {
  const { id } = await params;
  const data = await getConversationWithMessages(id);

  if (!data) notFound();

  const messages = data.messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  return <ChatClient conversationId={id} initialMessages={messages} />;
}
