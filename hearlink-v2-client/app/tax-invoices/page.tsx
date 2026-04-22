"use client";

import { motion } from "framer-motion";
import { Search, Receipt, Plus, Download, Send } from "lucide-react";
import { useState } from "react";

export default function TaxInvoicesPage() {
  const [activeTab, setActiveTab] = useState('전체내역');

  const mockData = [
    { id: 1, date: '2026-04-22', type: '매출', company: '주식회사 예시', item: '보청기 외 1건', amount: '2,500,000', status: '발행완료' },
    { id: 2, date: '2026-04-20', type: '매출', company: '개인고객 (김철수)', item: '배터리 10BOX', amount: '250,000', status: '전송성공' },
    { id: 3, date: '2026-04-18', type: '매입', company: '오티콘코리아', item: '제품 매입', amount: '1,200,000', status: '승인대기' },
  ];

  const filteredData = mockData.filter(item => {
    if (activeTab === '매출계산서') return item.type === '매출';
    if (activeTab === '매입계산서') return item.type === '매입';
    return true;
  });
  return (
    <div className="space-y-6 md:space-y-8 pb-12 mt-16 md:mt-0">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">세금계산서</h1>
          <p className="text-muted text-sm mt-1">전자세금계산서 발행 및 국세청 전송 내역을 관리합니다.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-muted-bg border border-border hover:bg-border text-foreground rounded-xl transition-colors">
            <Download className="w-4 h-4" />
            <span className="font-medium text-sm">엑셀 다운로드</span>
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-colors shadow-lg shadow-brand-500/20">
            <Plus className="w-4 h-4" />
            <span className="font-medium">건별 발행</span>
          </button>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "발행 대기", value: "3", color: "amber" },
          { label: "이달의 발행 완료", value: "24", color: "brand" },
          { label: "국세청 전송 실패", value: "0", color: "rose" }
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: i * 0.1 }}
            key={stat.label} 
            className="glass-card bg-surface p-5"
          >
            <p className="text-muted text-sm font-medium mb-2">{stat.label}</p>
            <div className="flex items-center gap-3">
              <span className={`text-3xl font-bold ${stat.color === 'amber' ? 'text-amber-500' : stat.color === 'rose' ? 'text-rose-500' : 'text-foreground'}`}>
                {stat.value}
              </span>
              <span className="text-sm text-muted">건</span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="glass-card bg-surface overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            {['전체내역', '매출계산서', '매입계산서'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-brand-700 dark:text-white' : 'text-muted hover:text-foreground'}`}
              >
                {activeTab === tab && (
                  <motion.div layoutId="taxTab" className="absolute inset-0 bg-brand-50 dark:bg-white/10 border border-brand-200 dark:border-white/20 rounded-full" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="거래처명, 사업자번호 검색..." 
              className="w-full sm:w-64 bg-muted-bg border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-brand-500 transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-border bg-muted-bg/50">
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider">작성일자</th>
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider">구분</th>
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider">공급받는자</th>
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider">품목</th>
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider text-right">합계금액</th>
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider text-center">상태</th>
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-muted-bg/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">{item.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-md border ${item.type === '매출' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20'}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{item.company}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">{item.item}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-foreground">₩ {item.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      item.status === '전송성공' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                      item.status === '승인대기' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                      'bg-muted-bg text-muted border border-border'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <button className="p-1.5 text-muted hover:text-brand-500 transition-colors tooltip" title="국세청 전송">
                        <Send className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-muted hover:text-foreground transition-colors tooltip" title="상세보기">
                        <Receipt className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
