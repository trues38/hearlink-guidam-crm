"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Mic, Paperclip, Send, User, Bot, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { CustomerSummaryCard } from "./copilot/CustomerSummaryCard";
import { ScheduleListCard } from "./copilot/ScheduleListCard";
import { ActionConfirmationCard } from "./copilot/ActionConfirmationCard";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  component?: React.ReactNode;
}

export default function CopilotDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard shortcut (Cmd+K or Ctrl+K)
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

  // Mock messages for UI demonstration
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "안녕하세요! Hearlink AI 비서입니다. 오늘 일정 확인이나 고객 정보 검색, 업무일지 작성을 도와드릴까요?",
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen, messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    
    // Add user message
    const newUserMsg: Message = { id: Date.now().toString(), role: "user", content: userText };
    setMessages(prev => [...prev, newUserMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI reasoning and response based on keywords
    setTimeout(() => {
      setIsTyping(false);
      
      let aiResponse: Message;

      if (userText.includes("김철수")) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "김철수 고객님의 프로필을 찾았습니다.",
          component: <CustomerSummaryCard id="1" name="김철수" phone="010-1234-5678" device="오티콘 리얼 1" lastVisit="2026.04.15" />
        };
      } else if (userText.includes("일정") || userText.includes("오늘")) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "오늘 예정된 일정 목록입니다.",
          component: (
            <ScheduleListCard 
              date="4월 22일 (수)"
              schedules={[
                { id: "1", time: "10:00", title: "박지민 고객님", type: "상담" },
                { id: "2", time: "14:30", title: "김철수 고객님", type: "적합" }
              ]}
            />
          )
        };
      } else if (userText.includes("업무일지") || userText.includes("기록")) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "네, 내용을 파악했습니다. 업무일지에 추가할까요?",
          component: (
            <ActionConfirmationCard 
              title="업무일지 자동 기록" 
              description="대화 맥락을 분석하여 방금 전 완료하신 '피팅/적합' 활동을 김철수 고객님의 타임라인에 기록합니다."
              onConfirm={() => console.log("Confirmed")}
            />
          )
        };
      } else {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "말씀하신 내용을 바탕으로 어떻게 도와드릴까요? (예: '김철수 고객 찾아줘', '오늘 일정 보여줘', '방금 상담한 내용 업무일지에 기록해줘')"
        };
      }

      setMessages(prev => [...prev, aiResponse]);
    }, 1200);
  };

  return (
    <>
      {/* Floating Action Button */}
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

      {/* Backdrop (Mobile only) */}
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

      {/* Drawer Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={isMobile ? { y: "100%" } : { x: "100%", opacity: 0 }}
            animate={isMobile ? { y: 0 } : { x: 0, opacity: 1 }}
            exit={isMobile ? { y: "100%" } : { x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed z-50 bg-surface border-border shadow-2xl flex flex-col
              ${isMobile 
                ? "inset-0 border-t" 
                : "right-0 top-0 bottom-0 w-[400px] border-l"
              }
            `}
          >
            {/* Header */}
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

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide bg-background/30">
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-muted-bg border border-border" : "bg-brand-500 text-white"}`}>
                    {msg.role === "user" ? <User className="w-4 h-4 text-muted" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div className={`p-3 rounded-2xl text-sm ${
                      msg.role === "user" 
                        ? "bg-brand-500 text-white rounded-tr-sm" 
                        : "bg-surface border border-border text-foreground rounded-tl-sm shadow-sm"
                    }`}>
                      {msg.content}
                    </div>
                    {msg.component && (
                      <div className="mt-2 w-full">
                        {msg.component}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`p-4 bg-surface border-t border-border ${isMobile ? "pb-8" : ""}`}>
              <form onSubmit={handleSubmit} className="flex items-end gap-2 bg-background border border-border rounded-2xl p-2 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-all">
                <button type="button" className="p-2 text-muted hover:text-foreground transition-colors shrink-0">
                  <Paperclip className="w-5 h-5" />
                </button>
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="메시지를 입력하거나 파일을 첨부하세요..."
                  className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 text-sm text-foreground placeholder:text-muted py-2 scrollbar-hide"
                  rows={1}
                  style={{ minHeight: '40px' }}
                />
                <div className="flex items-center gap-1 shrink-0 pb-1 pr-1">
                  <button type="button" className="p-2 text-muted hover:text-foreground transition-colors">
                    <Mic className="w-5 h-5" />
                  </button>
                  <button 
                    type="submit" 
                    disabled={!input.trim()}
                    className={`p-2 rounded-xl transition-colors ${input.trim() ? "bg-brand-500 text-white shadow-md hover:bg-brand-600" : "bg-muted-bg text-muted cursor-not-allowed"}`}
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
