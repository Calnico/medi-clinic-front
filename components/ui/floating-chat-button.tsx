"use client"

import { Button } from "./button";
import { MessageCircle } from "lucide-react";

export function FloatingChatButton() {
  const openTelegramChat = () => {
    window.open("https://t.me/MiClinicaBot", "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={openTelegramChat}
        className="rounded-full w-14 h-14 p-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-primary text-primary-foreground"
        variant="default"
        aria-label="Abrir chat de Telegram"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    </div>
  );
}