"use client";

import { use } from "react";
import { ChatWindow } from "../../components/ChatWindow";

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <ChatWindow id={id} />;
}
