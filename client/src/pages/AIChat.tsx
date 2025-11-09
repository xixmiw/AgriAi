import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Trash2, Bot, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  userId: string;
  role: string;
  content: string;
  createdAt: string;
}

export default function AIChat() {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/history"],
    refetchInterval: false,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Не удалось отправить сообщение");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/history"] });
      setInput("");
      setIsTyping(false);
    },
    onError: (error) => {
      setIsTyping(false);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось отправить сообщение",
        variant: "destructive",
      });
    },
  });

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/chat/history", {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Не удалось очистить историю");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/history"] });
      toast({
        title: "История очищена",
        description: "История чата успешно удалена",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось очистить историю",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    setIsTyping(true);
    sendMessageMutation.mutate(input.trim());
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>AI Ассистент</CardTitle>
              <CardDescription>
                Обсудите урожайность, эффективность и получите рекомендации
              </CardDescription>
            </div>
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearHistoryMutation.mutate()}
                disabled={clearHistoryMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Очистить историю
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            <div className="space-y-4 pb-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Добро пожаловать в AI Ассистент!</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Задайте вопрос о повышении урожайности, увеличении надоев,
                    оптимизации работы или получите персонализированные рекомендации
                    на основе ваших полей и скота.
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-green-600 text-white"
                          : "bg-muted"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                ))
              )}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Напишите ваш вопрос..."
              disabled={isTyping}
              className="flex-1"
            />
            <Button type="submit" disabled={!input.trim() || isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
