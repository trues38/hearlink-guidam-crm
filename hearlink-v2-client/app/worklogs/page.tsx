"use client";

import { motion } from "framer-motion";
import { Search, Filter, ClipboardList, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const mockLogs = [
  { id: 1, type: "피팅/적합", customer: "김철수", device: "오티콘 리얼 1", author: "관리자", content: "우측 소리가 작다고 하여 이득(Gain) +2dB 상향 조정함.", time: "14:30", date: "2026.04.22", isSystem: false },
  { id: 5, type: "시스템", customer: "김철수", device: null, author: "관리자", content: "고객 기본 정보(이메일)를 수정했습니다.", time: "14:28", date: "2026.04.22", isSystem: true },
  { id: 2, type: "서류관리", customer: "이영희", device: "정부지원 모델", author: "최청능사", content: "보장구 급여비 지급청구서 작성 완료 및 서명 받음.", time: "11:15", date: "2026.04.22", isSystem: false },
  { id: 6, type: "시스템", customer: "이영희", device: null, author: "김주임", content: "새로운 문서(보청기 적합관리 평가서)를 등록했습니다.", time: "11:10", date: "2026.04.22", isSystem: true },
  { id: 3, type: "일반상담", customer: "박지민", device: null, author: "관리자", content: "신규 방문. 청력 검사 진행 및 보청기 보조금 상담.", time: "09:40", date: "2026.04.22", isSystem: false },
  { id: 7, type: "시스템", customer: "박지민", device: null, author: "관리자", content: "신규 고객 데이터를 생성했습니다.", time: "09:00", date: "2026.04.22", isSystem: true },
  { id: 4, type: "수리/AS", customer: "정동원", device: "스타키 이볼브", author: "김주임", content: "좌측 리시버 단선으로 본사 수리 접수함 (우체국 택배).", time: "16:20", date: "2026.04.21", isSystem: false },
  { id: 8, type: "시스템", customer: "정동원", device: "스타키 이볼브", author: "김주임", content: "보유 기기 정보(시리얼 넘버)를 변경했습니다.", time: "16:15", date: "2026.04.21", isSystem: true },
];

export default function WorklogsPage() {
  const [activeTab, setActiveTab] = useState("전체보기");
  const [showSystemLogs, setShowSystemLogs] = useState(false);

  const getBadgeStyle = (type: string) => {
    switch(type) {
      case "피팅/적합": return "bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20";
      case "서류관리": return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "수리/AS": return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default: return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";
    }
  };

  const filteredLogs = mockLogs.filter(l => {
    if (!showSystemLogs && l.isSystem) return false;
    if (activeTab !== "전체보기" && l.type !== activeTab) return false;
    return true;
  });

  return (
    <div className="space-y-6 md:space-y-8 pb-12 mt-16 md:mt-0">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">업무 일지</h1>
          <p className="text-muted text-sm mt-1">센터 전체의 상담, 피팅 및 서류 작업 로그를 한눈에 모아봅니다.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input type="text" placeholder="고객명, 작성자, 내용 검색" className="w-full sm:w-64 bg-muted-bg border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-all" />
          </div>
          <button onClick={() => setShowSystemLogs(!showSystemLogs)} className={`flex items-center justify-center gap-2 px-4 py-2 border rounded-xl transition-colors shrink-0 ${showSystemLogs ? 'bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-500/10 dark:border-brand-500/30 dark:text-brand-400' : 'bg-muted-bg border-border text-muted hover:text-foreground'}`}>
            <span className="font-medium text-sm">시스템 로그 (2급) 포함</span>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${showSystemLogs ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
              <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all ${showSystemLogs ? 'left-4.5 translate-x-full' : 'left-0.5'}`} />
            </div>
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-muted-bg border border-border hover:bg-border text-foreground rounded-xl transition-colors shrink-0">
            <Filter className="w-4 h-4" />
            <span className="font-medium text-sm">상세 필터</span>
          </button>
        </motion.div>
      </header>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="glass-card bg-surface overflow-hidden">
        <div className="flex gap-2 p-4 border-b border-border overflow-x-auto scrollbar-hide">
          {["전체보기", "일반상담", "피팅/적합", "서류관리", "수리/AS"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors relative ${
                activeTab === tab ? "text-brand-700 dark:text-white" : "text-muted hover:text-foreground"
              }`}
            >
              {activeTab === tab && (
                <motion.div layoutId="worklogTab" className="absolute inset-0 bg-brand-50 dark:bg-white/10 border border-brand-200 dark:border-white/20 rounded-full" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
        </div>

        <div className="divide-y divide-border">
          {filteredLogs.map((log, index) => {
            if (log.isSystem) {
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                  key={log.id} 
                  className="px-5 py-3 hover:bg-muted-bg/30 transition-colors flex items-center gap-4 bg-muted-bg/10"
                >
                  <div className="w-24 shrink-0 flex items-center gap-2 text-xs text-muted">
                    <span className="font-medium">{log.time}</span>
                  </div>
                  <div className="flex-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                    <span className="font-bold text-foreground/70">{log.customer} 고객</span>
                    <span>-</span>
                    <span>{log.content}</span>
                    <span className="text-xs bg-muted-bg border border-border px-1.5 py-0.5 rounded">작업: {log.author}</span>
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
                key={log.id} 
                className="p-5 hover:bg-muted-bg/30 transition-colors flex flex-col md:flex-row gap-4"
              >
                {/* Left Meta info */}
                <div className="w-full md:w-48 shrink-0 flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start gap-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">{log.date}</span>
                    <span className="text-xs text-muted">{log.time}</span>
                  </div>
                  <div className="flex flex-row md:flex-col gap-2 items-end md:items-start">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${getBadgeStyle(log.type)}`}>{log.type}</span>
                    <span className="text-xs text-muted font-medium bg-muted-bg px-2 py-0.5 rounded border border-border">작성: {log.author}</span>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer">{log.customer} 고객</h3>
                    {log.device && (
                      <span className="text-xs px-2 py-0.5 rounded bg-muted-bg border border-border text-muted">
                        🏷️ {log.device}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{log.content}</p>
                </div>

                {/* Quick Actions */}
                <div className="hidden lg:flex items-start shrink-0">
                  <button className="text-xs font-medium text-muted hover:text-brand-500 transition-colors flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 확인 처리
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
