"use client";

import { motion } from "framer-motion";
import { MoreHorizontal, ArrowUpRight, Search, Filter } from "lucide-react";
import { useState } from "react";

const mockData = [
  { id: "1", type: "신규", customer: "김철수", customerId: "CUST-001", product: "보청기 양이", memo: "오른쪽 소리 조절 필요", status: "진행중", date: "2026-04-22" },
  { id: "2", type: "택배", customer: "이영희", customerId: "CUST-002", product: "배터리 1BOX", memo: "우체국 택배 발송", status: "완료", date: "2026-04-22" },
  { id: "3", type: "수리", customer: "박민수", customerId: "CUST-003", product: "좌측 리시버 교체", memo: "본사 수리 입고중", status: "대기", date: "2026-04-21" },
  { id: "4", type: "신규", customer: "정수진", customerId: "CUST-004", product: "프리미엄 모델 상담", memo: "가족 동반 방문 예정", status: "예약", date: "2026-04-23" },
  { id: "5", type: "택배", customer: "최동훈", customerId: "CUST-005", product: "습기제거제", memo: "로젠택배 발송", status: "완료", date: "2026-04-21" },
];

const TABS = ["전체", "신규", "택배", "수리"];

export default function DataTable() {
  const [activeTab, setActiveTab] = useState("전체");

  const getTypeColor = (type: string) => {
    switch(type) {
      case "신규": return "bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20";
      case "택배": return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "수리": return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      default: return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "완료": return "bg-emerald-500";
      case "진행중": return "bg-brand-500";
      case "대기": return "bg-amber-500";
      default: return "bg-gray-500";
    }
  };

  const filteredData = activeTab === "전체" 
    ? mockData 
    : mockData.filter(item => item.type === activeTab);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card flex flex-col overflow-hidden bg-surface"
    >
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight">최근 작업 내역</h2>
          
          <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input 
                type="text" 
                placeholder="고객명 검색..." 
                className="w-full sm:w-64 bg-muted-bg border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>
            <button className="p-2 bg-muted-bg border border-border rounded-lg text-muted hover:text-foreground transition-colors shrink-0">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 mt-4 md:mt-6 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 relative whitespace-nowrap ${
                activeTab === tab ? "text-brand-700 dark:text-white" : "text-muted hover:text-foreground"
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeFilterTab"
                  className="absolute inset-0 bg-brand-50 dark:bg-white/10 border border-brand-200 dark:border-white/20 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-border bg-muted-bg/50">
              <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider"># (유형)</th>
              <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider">고객명 / ID</th>
              <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider">제품</th>
              <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider">메모</th>
              <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider text-right">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredData.map((item, index) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + (index * 0.05) }}
                key={item.id} 
                className="hover:bg-muted-bg/50 transition-colors group cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getTypeColor(item.type)}`}>
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground group-hover:text-brand-500 transition-colors">{item.customer}</span>
                    <span className="text-xs text-muted">{item.customerId}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {item.product}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                  {item.memo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(item.status)} shadow-[0_0_8px_currentColor]`} />
                      <span className="text-sm text-foreground">{item.status}</span>
                    </div>
                    <button className="p-1 text-muted hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-border flex justify-center">
        <button className="text-sm text-brand-500 font-medium hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-1 group">
          전체 내역 보기
          <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
