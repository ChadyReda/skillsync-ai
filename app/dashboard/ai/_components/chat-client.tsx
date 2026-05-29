"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Send, Square, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { createConversation, saveMessage } from "../actions";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

interface Props {
  conversationId: string | null;
  initialMessages: ChatMessage[];
}

export function ChatClient({ conversationId: initialConvId, initialMessages }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [convId, setConvId] = useState<string | null>(initialConvId);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [input, resizeTextarea]);

  const stop = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMessage: ChatMessage = { role: "user", content };
    setMessages((prev) => [...prev, userMessage, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // Create conversation on first message
      let activeConvId = convId;
      if (!activeConvId) {
        const conv = await createConversation(content);
        activeConvId = conv.id;
        setConvId(conv.id);
        // No URL change — any navigation unmounts this component and kills the stream
      }

      // Save user message
      await saveMessage(activeConvId, "user", content);

      // Stream AI response
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
        signal: controller.signal,
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split("\n")) {
          if (!line.startsWith("data:")) continue;
          const jsonStr = line.replace("data: ", "").trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const delta = JSON.parse(jsonStr)?.choices?.[0]?.delta?.content;
            if (delta) {
              assistantText += delta;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: assistantText };
                return copy;
              });
            }
          } catch { /* skip malformed chunk */ }
        }
      }

      // Save completed assistant message
      if (assistantText && activeConvId) {
        await saveMessage(activeConvId, "assistant", assistantText);
        router.refresh(); // refresh sidebar conversation list
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        };
        return copy;
      });
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-black">
      {/* Scroll area */}
      <div className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          <div className="flex h-full flex-col items-center justify-center gap-5 px-4">
            <div className="flex h-12 w-12 items-center justify-center border border-zinc-800 bg-zinc-950">
              <div className="h-5 w-5 bg-white" />
            </div>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-white">What can I help with?</h1>
              <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-zinc-500">
                I know your resume, skills, and goals. Ask me anything about your career.
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-2xl space-y-8 px-4 py-8">
            {messages.map((m, i) => (
              <MessageRow
                key={i}
                message={m}
                isStreaming={loading && i === messages.length - 1}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="shrink-0 bg-black px-4 pb-5 pt-3">
        <div className="mx-auto w-full max-w-2xl">
          <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your AI career coach…"
              rows={1}
              className="max-h-44 flex-1 resize-none border-none bg-transparent text-sm leading-relaxed text-white placeholder-zinc-600 outline-none focus:ring-0"
              style={{ minHeight: "24px" }}
            />
            {loading ? (
              <button
                onClick={stop}
                title="Stop generating"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-white transition-colors hover:bg-zinc-700"
              >
                <Square className="h-3 w-3 fill-current" />
              </button>
            ) : (
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim()}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-black transition-all hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <p className="mt-2 text-center text-[11px] text-zinc-700">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}

/* Message row */
function MessageRow({
  message,
  isStreaming,
}: {
  message: ChatMessage;
  isStreaming: boolean;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-zinc-800 px-4 py-3 text-sm leading-relaxed text-white">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-zinc-800 bg-zinc-950">
        <div className="h-3 w-3 bg-white" />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        {message.content ? (
          <>
            <MarkdownContent content={message.content} />
            {isStreaming && (
              <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-zinc-400" />
            )}
          </>
        ) : (
          <ThinkingDots />
        )}
      </div>
    </div>
  );
}

/* Markdown renderer */
function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p className="mb-4 text-sm leading-7 text-zinc-200 last:mb-0">{children}</p>
        ),
        h1: ({ children }) => (
          <h1 className="mb-3 mt-6 text-lg font-semibold text-white first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-2 mt-5 text-base font-semibold text-white first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-2 mt-4 text-sm font-semibold text-white first:mt-0">{children}</h3>
        ),
        ul: ({ children }) => <ul className="mb-4 space-y-1.5 last:mb-0">{children}</ul>,
        ol: ({ children }) => (
          <ol className="mb-4 list-decimal space-y-1.5 pl-5 text-sm text-zinc-200 last:mb-0">
            {children}
          </ol>
        ),
        li: ({ children, ...props }) => {
          const ordered = (props as { ordered?: boolean }).ordered;
          if (ordered)
            return <li className="text-sm leading-relaxed text-zinc-200">{children}</li>;
          return (
            <li className="flex gap-2.5 text-sm leading-relaxed text-zinc-200">
              <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-500" />
              <span className="flex-1">{children}</span>
            </li>
          );
        },
        strong: ({ children }) => (
          <strong className="font-semibold text-white">{children}</strong>
        ),
        em: ({ children }) => <em className="italic text-zinc-300">{children}</em>,
        code: ({ children, className }) => {
          const isBlock = className?.includes("language-");
          const lang = className?.replace("language-", "") ?? "text";
          if (isBlock) {
            const codeText = String(children).replace(/\n$/, "");
            return (
              <div className="my-4 overflow-hidden rounded-xl border border-zinc-800">
                <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-1.5">
                  <span className="font-mono text-[11px] text-zinc-500">
                    {lang && lang !== "text" ? lang : ""}
                  </span>
                  <CopyButton text={codeText} />
                </div>
                <SyntaxHighlighter
                  language={lang}
                  style={atomOneDark}
                  customStyle={{
                    margin: 0,
                    padding: "1rem",
                    background: "#09090b",
                    fontSize: "13px",
                    lineHeight: "1.6",
                    borderRadius: 0,
                  }}
                  codeTagProps={{ style: { fontFamily: "var(--font-mono, monospace)" } }}
                  wrapLongLines={false}
                >
                  {codeText}
                </SyntaxHighlighter>
              </div>
            );
          }
          return (
            <code className="rounded-md border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[12px] text-zinc-200">
              {children}
            </code>
          );
        },
        pre: ({ children }) => <>{children}</>,
        blockquote: ({ children }) => (
          <blockquote className="my-4 border-l-2 border-zinc-700 pl-4 text-sm italic text-zinc-400">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-6 border-zinc-800" />,
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline underline-offset-2 hover:text-blue-300"
          >
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="my-4 overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-sm text-zinc-200">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="border-b border-zinc-800 bg-zinc-900/60">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border-t border-zinc-800/60 px-4 py-2.5">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      title="Copy code"
      className="flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[10px] text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-400" />
          <span className="text-emerald-400">Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

function ThinkingDots() {
  return (
    <span className="flex items-center gap-1 pt-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-600"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  );
}
