"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { X, RotateCcw, ArrowUp, Maximize2, Minimize2, ArrowRight } from "lucide-react";
import type { ApiChatMessage, ChatMessage } from "@/types/chat";

type TechnexChatbotProps = {
  title?: string;
  apiPath?: string;
};

const STORAGE_KEY = "technex-ai-chat-history-v2";
const MAX_HISTORY = 12;

const STARTER_MESSAGE: ChatMessage = {
  id: "technex-ai-welcome",
  role: "assistant",
  content:
    "Hello! I'm here to help with everything about **TECHNEX 2026** at SVPCET.\n\nAsk me about:\n- **Events & Competitions** (Hackathon, Agentic Arena, Overdrive, etc.)\n- **Workshops & Hands-on Labs**\n- **Prize Pools, Schedules & Rules**\n- **Registration Fees & Steps**",
  createdAt: 0
};

const PROMPT_PILLS = [
  { label: "Events & Competitions", prompt: "Show me all events and competitions" },
  { label: "Workshops Schedule", prompt: "What workshops are being conducted?" },
  { label: "Hackathon & Prizes", prompt: "Tell me about the Hackathon and prize pool" },
  { label: "Venue & Dates", prompt: "When and where is TECHNEX 2026 happening?" }
];

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readErrorMessage(payload: unknown): string {
  if (typeof payload === "object" && payload !== null && "error" in payload) {
    const value = (payload as { error?: unknown }).error;
    if (typeof value === "string") return value;
  }
  return "Could not complete response. Please retry.";
}

export default function TechnexChatbot({
  title = "Technex AI",
  apiPath = "/api/chat"
}: TechnexChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([STARTER_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load chat history from localStorage
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ChatMessage[];
        if (Array.isArray(parsed)) {
          const safeMessages = parsed
            .filter(
              (item) =>
                item &&
                (item.role === "user" || item.role === "assistant") &&
                typeof item.content === "string" &&
                typeof item.id === "string"
            )
            .slice(-MAX_HISTORY * 2);
          if (safeMessages.length > 0) setMessages([STARTER_MESSAGE, ...safeMessages]);
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setHasLoadedHistory(true);

    return () => abortRef.current?.abort();
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    if (!hasLoadedHistory) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(messages.slice(1).slice(-MAX_HISTORY * 2))
      );
    } catch {
      // LocalStorage might be full
    }
  }, [messages, hasLoadedHistory]);

  // Listen for trigger events from desktop sidebar & mobile dock
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleToggle = (event: Event) => {
      const customEvent = event as CustomEvent<{ open?: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.open === "boolean") {
        setIsOpen(customEvent.detail.open);
      } else {
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("technex-ai-open", handleOpen);
    window.addEventListener("open-technex-ai-chat", handleOpen);
    window.addEventListener("open-chatbot", handleToggle);

    return () => {
      window.removeEventListener("technex-ai-open", handleOpen);
      window.removeEventListener("open-technex-ai-chat", handleOpen);
      window.removeEventListener("open-chatbot", handleToggle);
    };
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (!isOpen) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    const timer = window.setTimeout(() => inputRef.current?.focus(), 150);
    return () => window.clearTimeout(timer);
  }, [isOpen, messages, isLoading]);

  const resetChat = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
    setMessages([STARTER_MESSAGE]);
    setInput("");
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const sendMessage = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || isLoading) return;

      const userMessage: ChatMessage = {
        id: makeId(),
        role: "user",
        content: text.slice(0, 3000),
        createdAt: Date.now()
      };
      const history = [
        ...messages.filter((message) => message.id !== STARTER_MESSAGE.id),
        userMessage
      ];
      const assistantMessage: ChatMessage = {
        id: makeId(),
        role: "assistant",
        content: "",
        createdAt: Date.now()
      };

      setMessages((current) => [...current, userMessage, assistantMessage]);
      setInput("");
      setIsLoading(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const requestMessages: ApiChatMessage[] = history
          .slice(-MAX_HISTORY)
          .map(({ role, content }) => ({ role, content }));

        const response = await fetch(apiPath, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: requestMessages }),
          signal: controller.signal
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(readErrorMessage(payload));
        }
        if (!response.body) {
          throw new Error("Could not initialize stream.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let reasoningBuffer = "";
        let finished = false;

        const appendToken = (token: string) => {
          if (!token) return;
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantMessage.id
                ? { ...message, content: message.content + token }
                : message
            )
          );
        };

        while (!finished) {
          const { value, done } = await reader.read();
          buffer += decoder.decode(value, { stream: !done });
          const events = buffer.split(/\r?\n\r?\n/);
          buffer = events.pop() ?? "";

          for (const event of events) {
            const dataLines = event
              .split(/\r?\n/)
              .filter((line) => line.startsWith("data:"))
              .map((line) => line.slice(5).trim());

            for (const dataLine of dataLines) {
              if (dataLine === "[DONE]") {
                finished = true;
                break;
              }
              try {
                const parsed = JSON.parse(dataLine) as {
                  choices?: Array<{
                    delta?: {
                      content?: string | Array<{ text?: string }>;
                      reasoning?: string;
                    };
                  }>;
                  error?: { message?: string };
                };
                if (parsed.error?.message) throw new Error(parsed.error.message);
                const delta = parsed.choices?.[0]?.delta;
                if (typeof delta?.reasoning === "string") {
                  reasoningBuffer += delta.reasoning;
                }
                const content = delta?.content;
                if (typeof content === "string") appendToken(content);
                else if (Array.isArray(content)) {
                  appendToken(content.map((part) => part.text ?? "").join(""));
                }
              } catch (error) {
                if (error instanceof Error && error.message !== "Unexpected end of JSON input") {
                  throw error;
                }
              }
            }
          }

          if (done) finished = true;
        }

        setMessages((current) =>
          current.map((message) => {
            if (message.id !== assistantMessage.id) return message;
            if (message.content.trim()) return message;
            if (reasoningBuffer.trim()) {
              return { ...message, content: reasoningBuffer.trim() };
            }
            return {
              ...message,
              content: "I didn't receive a readable answer. Please ask that another way."
            };
          })
        );
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        const errorText = error instanceof Error ? error.message : "Something went wrong.";
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantMessage.id
              ? { ...message, content: `**Connection interrupted.** ${errorText}` }
              : message
          )
        );
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setIsLoading(false);
      }
    },
    [apiPath, isLoading, messages]
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="txai-root">
      {/* Mobile Backdrop */}
      <div
        className="txai-backdrop"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Floating Chat Sheet */}
      <section
        className={`txai-panel ${isExpanded ? "txai-expanded" : ""}`}
        role="dialog"
        aria-label={`${title} dialog`}
        aria-modal="false"
      >
        {/* Mobile Pull Indicator (Tap to extend/collapse) */}
        <button
          type="button"
          className="txai-mobile-handle"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-label={isExpanded ? "Collapse sheet" : "Extend sheet"}
        >
          <span className="txai-mobile-handle-bar" />
        </button>

        {/* Clean Header */}
        <header className="txai-header">
          <div className="txai-header-left">
            <div className="txai-header-avatar">
              <img src="/assets/chatbot-icon.webp" alt="Technex AI" />
            </div>
            <div className="txai-header-info">
              <span className="txai-header-title">{title}</span>
              <div className="txai-header-status">
                <span className="txai-status-dot" />
                <span>Online</span>
              </div>
            </div>
          </div>

          <div className="txai-header-actions">
            {/* Mobile Extend / Collapse Toggle */}
            <button
              className="txai-btn-icon txai-btn-expand"
              onClick={() => setIsExpanded((prev) => !prev)}
              aria-label={isExpanded ? "Collapse window" : "Extend window"}
              title={isExpanded ? "Collapse" : "Extend"}
            >
              {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>

            {/* Reset Chat */}
            <button
              className="txai-btn-icon"
              onClick={resetChat}
              aria-label="New chat"
              title="New chat"
            >
              <RotateCcw size={14} />
            </button>

            {/* Close */}
            <button
              className="txai-btn-icon"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
              title="Close"
            >
              <X size={15} />
            </button>
          </div>
        </header>

        {/* Messages Container */}
        <div
          className={`txai-messages ${messages.length > 1 ? "txai-messages-mask" : ""}`}
          ref={scrollRef}
          aria-live="polite"
        >
          {/* Welcome Screen when starting fresh */}
          {messages.length === 1 && (
            <div className="txai-welcome">
              <div className="txai-welcome-avatar">
                <img src="/assets/chatbot-icon.webp" alt="Technex AI" />
              </div>
              <strong className="txai-welcome-title">What can I help you with?</strong>
              <p className="txai-welcome-desc">
                Ask about events, workshops, registration, rules, and schedules.
              </p>
              <div className="txai-pills-wrap">
                {PROMPT_PILLS.map((pill) => (
                  <button
                    key={pill.label}
                    className="txai-pill-btn"
                    onClick={() => void sendMessage(pill.prompt)}
                  >
                    <span>{pill.label}</span>
                    <ArrowRight size={12} className="txai-pill-arrow" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conversation stream */}
          {messages.map((message) => {
            if (message.id === STARTER_MESSAGE.id && messages.length === 1) {
              return null;
            }

            return (
              <div
                className={`txai-msg txai-msg-${message.role}`}
                key={message.id}
              >
                {message.role === "assistant" && (
                  <div className="txai-msg-avatar" aria-hidden="true">
                    <img src="/assets/chatbot-icon.webp" alt="Technex AI" />
                  </div>
                )}
                <div className="txai-msg-bubble">
                  {message.content ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target={href?.startsWith("#") ? undefined : "_blank"}
                            rel="noreferrer"
                          >
                            {children}
                          </a>
                        )
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <div className="txai-thinking-dots" aria-label="Thinking">
                      <span />
                      <span />
                      <span />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <form
          className="txai-composer"
          onSubmit={(event) => {
            event.preventDefault();
            void sendMessage(input);
          }}
        >
          <div className="txai-input-pill">
            <textarea
              ref={inputRef}
              className="txai-input-textarea"
              value={input}
              onChange={(event) => {
                setInput(event.target.value.slice(0, 3000));
                event.target.style.height = "auto";
                event.target.style.height = `${Math.min(event.target.scrollHeight, 72)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              rows={1}
              maxLength={3000}
              aria-label="Ask a question"
              disabled={isLoading}
            />
            <button
              className={`txai-send-btn ${input.trim() && !isLoading ? "txai-send-active" : ""}`}
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Send"
            >
              <ArrowUp size={15} strokeWidth={2.4} />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
