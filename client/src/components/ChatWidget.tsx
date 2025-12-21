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
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
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

      const contentType = response.headers.get("content-type");
      
      if (!contentType?.includes("application/json")) {
        throw new Error("Сервер вернул невалидный ответ");
      }

      const data = await response.json();

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
      {/* Плавающая кнопка - NEO TERMINAL STYLE */}
      <button
        onClick={() => setIsOpen(true)}
        data-testid="button-ai-chat"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-sm bg-black border-2 border-cyan-500 hover:border-cyan-400 text-cyan-500 hover:text-cyan-400 shadow-lg hover:shadow-[0_0_15px_rgba(34,211,238,0.6)] transition-all duration-200 flex items-center justify-center z-40 font-mono text-xs font-bold"
        title="AI Assistant"
      >
        {">"}
      </button>

      {/* Модалка чата - NEO TERMINAL */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-full max-w-md h-[600px] md:h-[500px] flex flex-col p-0 bg-black border-2 border-cyan-500 rounded-sm shadow-[0_0_20px_rgba(34,211,238,0.5)] neo-terminal" description="AI чат помощник для ответов на вопросы">
          
          {/* Шапка - NEO TERMINAL */}
          <DialogHeader className="bg-cyan-500/10 border-b-2 border-cyan-500/50 p-3 space-y-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-cyan-500 font-mono text-xs">►</span>
                <DialogTitle className="text-cyan-500 font-mono text-sm font-bold tracking-wider">
                  AI_SYSTEM v2.1
                </DialogTitle>
                <span className="text-cyan-500 font-mono text-xs">[ONLINE]</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-sm transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </DialogHeader>

          {/* История сообщений */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-black font-mono text-xs">
            {messages.length === 0 && (
              <div className="h-full flex items-center justify-center text-center">
                <div className="text-cyan-500/60">
                  <p className="mb-2">> SYSTEM READY</p>
                  <p>&lt; INPUT YOUR QUERY</p>
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
                  className={`max-w-xs px-3 py-2 rounded-sm border ${
                    msg.role === "user"
                      ? "bg-cyan-500/5 border-cyan-500/30 text-cyan-400"
                      : "bg-black border-cyan-500/20 text-cyan-500"
                  }`}
                >
                  <p className="text-xs leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-black border border-cyan-500/20 px-3 py-2 rounded-sm">
                  <p className="text-cyan-500 text-xs animate-none">
                    > PROCESSING...
                  </p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Форма ввода */}
          <div className="bg-cyan-500/5 border-t-2 border-cyan-500/50 p-3 space-y-2">
            <div className="flex gap-2">
              <Input
                data-testid="input-chat-message"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="> INPUT_"
                disabled={isLoading}
                className="bg-black border-cyan-500/30 focus:border-cyan-500 text-cyan-500 placeholder-cyan-500/40 font-mono text-xs rounded-sm focus:ring-0 focus:outline-none transition-colors"
              />
              <Button
                data-testid="button-send-chat"
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim()}
                size="icon"
                className="bg-black border-2 border-cyan-500 hover:bg-cyan-500/10 text-cyan-500 hover:text-cyan-400 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-cyan-500/50 font-mono">> HISTORY: DISABLED</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
