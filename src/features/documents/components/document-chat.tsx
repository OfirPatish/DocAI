"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "motion/react";
import { MessageSquare, Send, Sparkles, Trash2 } from "lucide-react";

const markdownTableComponents = {
  table: ({ children }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-3 w-full overflow-auto rounded-lg border border-border">
      <table className="w-full caption-bottom text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="border-b border-border bg-muted/30 [&_tr]:border-b">
      {children}
    </thead>
  ),
  tbody: ({ children }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody className="[&_tr:last-child]:border-0">{children}</tbody>
  ),
  tr: ({ children }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className="border-b border-border transition-colors hover:bg-muted/50">
      {children}
    </tr>
  ),
  th: ({ children }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className="h-9 px-3 text-left align-middle font-medium text-foreground whitespace-nowrap">
      {children}
    </th>
  ),
  td: ({ children }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="p-3 align-middle text-muted-foreground">{children}</td>
  ),
};

const markdownWrapper =
  "text-sm leading-relaxed [&_h3]:mt-3 [&_h3]:mb-2 [&_h3]:font-semibold [&_h3]:text-foreground [&_h4]:mt-2 [&_h4]:mb-1 [&_h4]:font-medium [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_strong]:font-semibold [&_strong]:text-foreground [&_p]:my-2 [&_p:last-child]:mb-0";

const AnswerContent = ({ content }: { content: string }) => (
  <div className={markdownWrapper}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={markdownTableComponents}
    >
      {content}
    </ReactMarkdown>
  </div>
);

const TYPING_TRANSITION = {
  duration: 1.4,
  repeat: Infinity,
  ease: "easeInOut" as const,
};

const TypingDots = () => (
  <span className="inline-flex gap-0.5 align-middle" aria-hidden>
    {[0, 0.2, 0.4].map((delay, i) => (
      <motion.span
        key={i}
        className="size-1.5 rounded-full bg-muted-foreground/70"
        animate={{ opacity: [0.35, 1, 0.35] }}
        transition={{ ...TYPING_TRANSITION, delay }}
      />
    ))}
  </span>
);

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface DocumentChatProps {
  documentId: string;
  disabled?: boolean;
}

const SUGGESTION_CHIPS = [
  "Summarize the key points",
  "What are the main findings?",
  "Explain the methodology",
  "List all action items",
] as const;

const readChatStream = async (
  response: Response,
  onDelta: (content: string) => void,
  onError: (message: string) => void
) => {
  const reader = response.body?.getReader();
  if (!reader) {
    onError("Failed to read response");
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const event = JSON.parse(line);
          if (event.type === "delta") onDelta(event.content ?? "");
          else if (event.type === "error")
            onError(event.message ?? "Unknown error");
        } catch {
          /* skip malformed lines */
        }
      }
    }

    if (buffer.trim()) {
      try {
        const event = JSON.parse(buffer);
        if (event.type === "delta") onDelta(event.content ?? "");
        else if (event.type === "error")
          onError(event.message ?? "Unknown error");
      } catch {
        /* skip */
      }
    }
  } finally {
    reader.releaseLock();
  }
};

export const DocumentChat = ({
  documentId,
  disabled = false,
}: DocumentChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollViewportRef.current) {
        scrollViewportRef.current.scrollTop =
          scrollViewportRef.current.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    if (messages.length > 0 || streamingContent) scrollToBottom();
  }, [messages, isLoading, streamingContent, scrollToBottom]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading || disabled) return;

      setInput("");
      setError(null);
      setStreamingContent("");
      setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
      setIsLoading(true);

      try {
        const response = await fetch(`/api/documents/${documentId}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed }),
        });

        if (!response.ok) {
          const data = await response
            .json()
            .catch(() => ({ error: "Request failed" }));
          const msg = data.error ?? "Failed to get answer";
          toast.error(msg);
          setError(msg);
          setIsLoading(false);
          return;
        }

        let fullContent = "";

        await readChatStream(
          response,
          (content) => {
            fullContent += content;
            setStreamingContent(fullContent);
          },
          (msg) => {
            toast.error(msg);
            setError(msg);
          }
        );

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: fullContent },
        ]);
        setStreamingContent("");
      } catch {
        const msg = "Failed to get answer";
        toast.error(msg);
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [documentId, isLoading, disabled]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      sendMessage(input);
    },
    [input, sendMessage]
  );

  const handleChipClick = useCallback(
    (text: string) => {
      sendMessage(text);
    },
    [sendMessage]
  );

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setStreamingContent("");
    setError(null);
  }, []);

  return (
    <div className="flex size-full min-h-0 flex-col gap-4">
      <Card className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <ScrollArea className="min-h-0 flex-1" viewportRef={scrollViewportRef}>
          <CardContent className="p-3 sm:p-5">
            {messages.length === 0 && !streamingContent && (
              <div className="flex min-h-[200px] flex-col items-center justify-center gap-5 py-10 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 shadow-sm">
                  <MessageSquare
                    className="size-7 text-primary"
                    aria-hidden
                  />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">
                    Ask a question
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your answers will be grounded in the document content.
                  </p>
                </div>
                {!disabled && (
                  <div className="flex flex-wrap justify-center gap-2 px-4">
                    {SUGGESTION_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleChipClick(chip)}
                        className="rounded-full border border-border/60 bg-muted/40 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                        aria-label={`Ask: ${chip}`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="space-y-5">
              {messages.map((msg, msgIdx) => (
                <div
                  key={msgIdx}
                  className={
                    msg.role === "user"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }
                >
                  <div
                    className={
                      msg.role === "user"
                        ? "flex max-w-[85%]"
                        : "flex max-w-[90%] flex-col gap-2"
                    }
                  >
                    {msg.role === "assistant" && (
                      <div className="flex shrink-0 items-center gap-2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Sparkles
                            className="size-4 text-primary"
                            aria-hidden
                          />
                        </div>
                        <span className="text-xs font-semibold text-foreground">
                          DocAI
                        </span>
                      </div>
                    )}
                    <div
                      className={
                        msg.role === "user"
                          ? "rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                          : "min-w-0 pl-10"
                      }
                    >
                      {msg.role === "user" ? (
                        <div>{msg.content}</div>
                      ) : (
                        <div className="text-foreground/80">
                          <AnswerContent content={msg.content} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && streamingContent && (
                <div className="flex justify-start">
                  <div className="flex max-w-[90%] flex-col gap-2">
                    <div className="flex shrink-0 items-center gap-2">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Sparkles
                          className="size-4 text-primary"
                          aria-hidden
                        />
                      </div>
                      <span className="text-xs font-semibold text-foreground">
                        DocAI
                      </span>
                    </div>
                    <div className="min-w-0 pl-10">
                      <div className="text-foreground/80">
                        <AnswerContent content={streamingContent} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isLoading && !streamingContent && (
                <div className="flex justify-start">
                  <div className="flex max-w-[90%] flex-col gap-1.5">
                    <div
                      className="flex shrink-0 items-center gap-2"
                      aria-busy="true"
                      aria-label="Generating answer"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Sparkles
                          className="size-4 text-primary"
                          aria-hidden
                        />
                      </div>
                      <span className="text-xs font-semibold text-foreground">
                        DocAI
                      </span>
                    </div>
                    <div className="flex min-w-0 items-center py-1 pl-10">
                      <TypingDots />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </ScrollArea>
      </Card>
      {error && (
        <p className="shrink-0 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={isLoading || disabled}
          className="h-11 min-w-0 flex-1 rounded-xl border-border/80"
          aria-label="Question"
        />
        {messages.length > 0 && !isLoading && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11 shrink-0 rounded-xl text-muted-foreground hover:text-destructive"
                onClick={handleClearChat}
                aria-label="Clear chat"
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear chat</TooltipContent>
          </Tooltip>
        )}
        <Button
          type="submit"
          size="icon"
          className="size-11 shrink-0 rounded-xl shadow-sm"
          disabled={!input.trim() || isLoading || disabled}
          aria-label="Send question"
        >
          <Send className="size-4" aria-hidden />
        </Button>
      </form>
    </div>
  );
};
