import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageCircle, Send, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/giga-chat", { message: userMessage });

      console.log("Chat API response status:", response.status);

      const contentType = response.headers.get("content-type");
      console.log("Response content-type:", contentType);
      
      if (!contentType?.includes("application/json")) {
        const text = await response.text();
        console.error("Invalid content-type. Expected JSON, got:", contentType);
        console.error("Response body:", text.substring(0, 500));
        throw new Error("Сервер вернул невалидный ответ");
      }

      const data = await response.json();
      console.log("Chat response data:", data);

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.response || "Ошибка при получении ответа. Попробуйте снова.",
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Ошибка: ${errorMessage}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Плавающая кнопка */}
      <button
        onClick={() => setIsOpen(true)}
        data-testid="button-ai-chat"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 flex items-center justify-center z-40"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Модалка чата */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-full max-w-md h-[600px] flex flex-col p-0 border-cyan-500/20" description="AI чат помощник для ответов на вопросы">
          <DialogHeader className="border-b border-cyan-500/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse" />
                <DialogTitle>AI Помощник</DialogTitle>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-secondary rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </DialogHeader>

          {/* История сообщений */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                <div>
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Введите ваше сообщение</p>
                </div>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                data-testid={`message-${msg.role}-${idx}`}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.role === "user"
                      ? "bg-cyan-500/20 text-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-secondary px-4 py-2 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse delay-100" />
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Форма ввода */}
          <div className="border-t border-cyan-500/10 p-4 space-y-2">
            <div className="flex gap-2">
              <Input
                data-testid="input-chat-message"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Введите сообщение..."
                disabled={isLoading}
                className="bg-secondary border-cyan-500/20 focus:border-cyan-500/50"
              />
              <Button
                data-testid="button-send-chat"
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim()}
                size="icon"
                className="bg-cyan-500/20 hover:bg-cyan-500/40"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">История не сохраняется</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
