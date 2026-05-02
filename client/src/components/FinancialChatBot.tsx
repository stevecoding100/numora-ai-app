import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/financial-chat`;

export function FinancialChatBot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Msg[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (open && inputRef.current) inputRef.current.focus();
    }, [open]);

    const send = async (text: string) => {
        if (!text.trim() || isLoading) return;
        const userMsg: Msg = { role: "user", content: text.trim() };
        const allMessages = [...messages, userMsg];
        setMessages(allMessages);
        setInput("");
        setIsLoading(true);

        let assistantSoFar = "";
        const upsert = (chunk: string) => {
            assistantSoFar += chunk;
            setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                    return prev.map((m, i) =>
                        i === prev.length - 1
                            ? { ...m, content: assistantSoFar }
                            : m,
                    );
                }
                return [
                    ...prev,
                    { role: "assistant", content: assistantSoFar },
                ];
            });
        };
        // GET THE ACTUAL SESSION
        const {
            data: { session },
        } = await supabase.auth.getSession();
        try {
            const resp = await fetch(CHAT_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                    // Using the session access_token
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({ messages: allMessages }),
            });

            if (!resp.ok) {
                const err = await resp
                    .json()
                    .catch(() => ({ error: "Request failed" }));
                toast.error(err.error || "Something went wrong");
                setIsLoading(false);
                return;
            }

            if (!resp.body) throw new Error("No response body");

            const reader = resp.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });

                let newlineIdx: number;
                while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
                    let line = buffer.slice(0, newlineIdx);
                    buffer = buffer.slice(newlineIdx + 1);
                    if (line.endsWith("\r")) line = line.slice(0, -1);
                    if (!line.startsWith("data: ")) continue;
                    const json = line.slice(6).trim();
                    if (json === "[DONE]") break;
                    try {
                        const parsed = JSON.parse(json);
                        // const content = parsed.choices?.[0]?.delta?.content;
                        // if (content) upsert(content);
                        // Path for Gemini 3 Streaming API
                        const content =
                            parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (content) upsert(content);
                    } catch {
                        // If a chunk is split mid-JSON, we wait for the next one
                        buffer = line + "\n" + buffer;
                        break;
                    }
                }
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to get AI response");
        }
        setIsLoading(false);
    };

    const suggestions = [
        "How am I doing this month?",
        "Where can I cut spending?",
        "Am I on track with my budgets?",
    ];

    return (
        <>
            {/* Floating button */}
            {!open && (
                <Button
                    onClick={() => setOpen(true)}
                    className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
                    size="icon"
                >
                    <Sparkles className="h-6 w-6" />
                </Button>
            )}

            {/* Chat panel */}
            {open && (
                <Card className="fixed bottom-6 right-6 z-50 w-[380px] h-[520px] flex flex-col shadow-2xl border">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <span className="font-semibold text-sm">
                                Financial Advisor
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                        {messages.length === 0 && (
                            <div className="space-y-3">
                                <p className="text-sm text-muted-foreground text-center mb-4">
                                    Ask me anything about your finances! 💰
                                </p>
                                {suggestions.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => send(s)}
                                        className="block w-full text-left text-sm p-3 rounded-lg border bg-muted/50 hover:bg-muted transition-colors"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="space-y-3">
                            {messages.map((m, i) => (
                                <div
                                    key={i}
                                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                                            m.role === "user"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted"
                                        }`}
                                    >
                                        {m.role === "assistant" ? (
                                            <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1">
                                                <ReactMarkdown>
                                                    {m.content}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            m.content
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading &&
                                messages[messages.length - 1]?.role ===
                                    "user" && (
                                    <div className="flex justify-start">
                                        <div className="bg-muted rounded-lg px-3 py-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        </div>
                                    </div>
                                )}
                        </div>
                    </ScrollArea>

                    {/* Input */}
                    <div className="p-3 border-t">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                send(input);
                            }}
                            className="flex gap-2"
                        >
                            <Input
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about your finances..."
                                disabled={isLoading}
                                className="text-sm"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={isLoading || !input.trim()}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </Card>
            )}
        </>
    );
}
