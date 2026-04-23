"use client";

import { useChat } from "ai/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Mic, Paperclip, Send, User, Bot, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ActionConfirmationCard } from "./copilot/ActionConfirmationCard";
import { CustomerSummaryCard } from "./copilot/CustomerSummaryCard";
import { ScheduleListCard } from "./copilot/ScheduleListCard";

type ScheduleType = "상담" | "수리" | "적합";

type ToolResult =
  | {
      uiType: "customer_summary";
      customer: {
        id: string;
        name: string;
        phone: string;
        device: string;
        lastVisit: string;
      } | null;
    }
  | {
      uiType: "schedule_list";
      date: string;
      schedules: Array<{
        id: string;
        time: string;
        title: string;
        type: ScheduleType;
      }>;
    }
  | {
      uiType: "action_confirmation";
      action: string;
      details: string;
      success: boolean;
      status?: "pending_approval" | "approved";
      approvalPayload?: {
        content: string;
        type:
          | "CUSTOMER_VISIT"
          | "PHONE_CALL"
          | "DEVICE_FITTING"
          | "FOLLOW_UP"
          | "DOCUMENT_PREP"
          | "MEETING"
          | "ADMIN_TASK"
          | "OTHER";
        customerId?: string;
      };
    };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isToolResult = (value: unknown): value is ToolResult => {
  if (!isRecord(value) || typeof value.uiType !== "string") {
    return false;
  }

  return (
    value.uiType === "customer_summary" ||
    value.uiType === "schedule_list" ||
    value.uiType === "action_confirmation"
  );
};

const normalizeScheduleType = (value: string): ScheduleType => {
  if (value === "수리") {
    return "수리";
  }

  if (value === "적합") {
    return "적합";
  }

  return "상담";
};

const extractToolResult = (message: unknown): ToolResult | null => {
  if (!isRecord(message) || !Array.isArray(message.toolInvocations)) {
    return null;
  }

  const invocations = [...message.toolInvocations].reverse();

  for (const invocation of invocations) {
    if (!isRecord(invocation) || !isRecord(invocation.result)) {
      continue;
    }

    if (isToolResult(invocation.result)) {
      if (invocation.result.uiType === "schedule_list") {
        return {
          uiType: "schedule_list",
          date:
            typeof invocation.result.date === "string"
              ? invocation.result.date
              : "일정",
          schedules: Array.isArray(invocation.result.schedules)
            ? invocation.result.schedules
                .filter((row) => isRecord(row))
                .map((row) => ({
                  id: typeof row.id === "string" ? row.id : crypto.randomUUID(),
                  time: typeof row.time === "string" ? row.time : "00:00",
                  title: typeof row.title === "string" ? row.title : "일정",
                  type: normalizeScheduleType(
                    typeof row.type === "string" ? row.type : "상담"
                  ),
                }))
            : [],
        };
      }

      return invocation.result;
    }
  }

  return null;
};

interface VisibleMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  toolInvocations?: unknown[];
}

const isVisibleMessage = (message: {
  id: string;
  role: "data" | "system" | "assistant" | "user";
  content: string;
  toolInvocations?: unknown[];
}): message is VisibleMessage => message.role === "assistant" || message.role === "user";

export default function CopilotDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const mockSession = {
    userId: "11111111-1111-4111-8111-111111111111",
    centerId: "22222222-2222-4222-8222-222222222222",
  };

  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: "/api/chat",
    maxSteps: 5,
    body: {
      session: mockSession,
    },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "안녕하세요! Hearlink AI 비서입니다. 오늘 일정 확인이나 고객 정보 검색, 업무일지 작성을 도와드릴까요?",
      },
    ],
  });

  const isTyping = status === "submitted" || status === "streaming";

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    return () => window.clearTimeout(timer);
  }, [isOpen, messages, isTyping]);

  const visibleMessages = messages.filter(isVisibleMessage);

  const approvePendingWorkLog = async (approvalPayload: {
    content: string;
    type:
      | "CUSTOMER_VISIT"
      | "PHONE_CALL"
      | "DEVICE_FITTING"
      | "FOLLOW_UP"
      | "DOCUMENT_PREP"
      | "MEETING"
      | "ADMIN_TASK"
      | "OTHER";
    customerId?: string;
  }) => {
    const response = await fetch("/api/worklogs/approve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: mockSession,
        approvalPayload,
      }),
    });

    if (!response.ok) {
      throw new Error("worklog approval failed");
    }
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: isOpen && !isMobile ? 0 : 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-brand-500 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-brand-600 transition-colors"
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={isMobile ? { y: "100%" } : { x: "100%", opacity: 0 }}
            animate={isMobile ? { y: 0 } : { x: 0, opacity: 1 }}
            exit={isMobile ? { y: "100%" } : { x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed z-50 bg-surface border-border shadow-2xl flex flex-col
              ${isMobile ? "inset-0 border-t" : "right-0 top-0 bottom-0 w-[400px] border-l"}
            `}
          >
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-surface/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-500/10 rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-brand-500" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-foreground">Hearlink Copilot</h2>
                  <p className="text-[10px] text-brand-500 font-medium">항상 대기 중 (Cmd+K)</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-muted-bg rounded-lg text-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide bg-background/30">
              {visibleMessages.map((msg) => {
                const toolResult = extractToolResult(msg);

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        msg.role === "user"
                          ? "bg-muted-bg border border-border"
                          : "bg-brand-500 text-white"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User className="w-4 h-4 text-muted" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      <div
                        className={`p-3 rounded-2xl text-sm ${
                          msg.role === "user"
                            ? "bg-brand-500 text-white rounded-tr-sm"
                            : "bg-surface border border-border text-foreground rounded-tl-sm shadow-sm"
                        }`}
                      >
                        {msg.content}
                      </div>

                      {toolResult?.uiType === "customer_summary" && toolResult.customer && (
                        <div className="mt-2 w-full">
                          <CustomerSummaryCard
                            id={toolResult.customer.id}
                            name={toolResult.customer.name}
                            phone={toolResult.customer.phone}
                            device={toolResult.customer.device}
                            lastVisit={toolResult.customer.lastVisit}
                          />
                        </div>
                      )}

                      {toolResult?.uiType === "schedule_list" && (
                        <div className="mt-2 w-full">
                          <ScheduleListCard date={toolResult.date} schedules={toolResult.schedules} />
                        </div>
                      )}

                      {toolResult?.uiType === "action_confirmation" && (
                        <div className="mt-2 w-full">
                          <ActionConfirmationCard
                            title={toolResult.action}
                            description={toolResult.details}
                            onConfirm={async () => {
                              if (
                                toolResult.status === "pending_approval" &&
                                toolResult.approvalPayload
                              ) {
                                await approvePendingWorkLog(toolResult.approvalPayload);
                              }
                            }}
                            onCancel={() => undefined}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-surface border border-border text-foreground rounded-2xl rounded-tl-sm shadow-sm p-3">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className={`p-4 bg-surface border-t border-border ${isMobile ? "pb-8" : ""}`}>
              <form
                onSubmit={handleSubmit}
                className="flex items-end gap-2 bg-background border border-border rounded-2xl p-2 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-all"
              >
                <button
                  type="button"
                  className="p-2 text-muted hover:text-foreground transition-colors shrink-0"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <textarea
                  name="prompt"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
                    }
                  }}
                  placeholder="메시지를 입력하거나 파일을 첨부하세요..."
                  className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 text-sm text-foreground placeholder:text-muted py-2 scrollbar-hide"
                  rows={1}
                  style={{ minHeight: "40px" }}
                />
                <div className="flex items-center gap-1 shrink-0 pb-1 pr-1">
                  <button type="button" className="p-2 text-muted hover:text-foreground transition-colors">
                    <Mic className="w-5 h-5" />
                  </button>
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className={`p-2 rounded-xl transition-colors ${
                      input.trim() && !isTyping
                        ? "bg-brand-500 text-white shadow-md hover:bg-brand-600"
                        : "bg-muted-bg text-muted cursor-not-allowed"
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
              <div className="text-center mt-3">
                <span className="text-[10px] text-muted font-medium">Agentic CRM 모델은 테스트 중입니다.</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
