"use client";

import { motion } from "framer-motion";
import { Search, Filter, MessageSquare } from "lucide-react";
import { useState } from "react";

const MOCK_DATA = [
  { id: 1, name: '김철수', phone: '010-1234-5678', device: '오티콘 리얼 1', date: '2025.04.10', s1: '입금확인', s2: '대상자(D-15)', s3: '대기', s4: '대기', s5: '대기' },
  { id: 2, name: '이영희', phone: '010-9876-5432', device: '스타키 이볼브 AI', date: '2021.05.01', s1: '입금확인', s2: '입금확인', s3: '입금확인', s4: '입금확인', s5: '대상자(D-8)' },
  { id: 3, name: '박지민', phone: '010-5555-4444', device: '벨톤 어치브', date: '2026.01.20', s1: '서류접수', s2: '대기', s3: '대기', s4: '대기', s5: '대기' },
  { id: 4, name: '정동원', phone: '010-1111-2222', device: '포낙 오데오 L', date: '2024.03.15', s1: '입금확인', s2: '입금확인', s3: '대상자(D-5)', s4: '대기', s5: '대기' },
  { id: 5, name: '송가인', phone: '010-3333-4444', device: '와이덱스 모멘트', date: '2023.02.10', s1: '입금확인', s2: '입금확인', s3: '입금확인', s4: '대상자(D-20)', s5: '대기' },
  { id: 6, name: '임영웅', phone: '010-7777-8888', device: '시그니아 AX', date: '2025.11.05', s1: '대상자(D-2)', s2: '대기', s3: '대기', s4: '대기', s5: '대기' },
  { id: 7, name: '장민호', phone: '010-9999-0000', device: '오티콘 모어', date: '2022.08.12', s1: '입금확인', s2: '입금확인', s3: '입금확인', s4: '입금확인', s5: '대기' },
  { id: 8, name: '이찬원', phone: '010-2345-6789', device: '스타키 리비오', date: '2021.02.28', s1: '입금확인', s2: '입금확인', s3: '입금확인', s4: '입금확인', s5: '서류접수' },
  { id: 9, name: '김호중', phone: '010-3456-7890', device: '벨톤 이매진', date: '2024.12.01', s1: '입금확인', s2: '대상자(D-40)', s3: '대기', s4: '대기', s5: '대기' },
  { id: 10, name: '정동하', phone: '010-4567-8901', device: '포낙 파라다이스', date: '2026.03.10', s1: '서류접수', s2: '대기', s3: '대기', s4: '대기', s5: '대기' },
];

const TABS = ['전체', '1년차 적합', '2년차 적합', '3년차 적합', '4년차 적합', '5년 재지원'];

export default function ConformityPage() {
  const [activeTab, setActiveTab] = useState('전체');

  const filteredData = MOCK_DATA.filter(item => {
    if (activeTab === '전체') return true;
    if (activeTab === '1년차 적합') return item.s1 !== '대기';
    if (activeTab === '2년차 적합') return item.s2 !== '대기';
    if (activeTab === '3년차 적합') return item.s3 !== '대기';
    if (activeTab === '4년차 적합') return item.s4 !== '대기';
    if (activeTab === '5년 재지원') return item.s5 !== '대기';
    return true;
  });

  return (
    <div className="space-y-6 md:space-y-8 pb-12 mt-16 md:mt-0">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">적합관리센터</h1>
          <p className="text-muted text-sm mt-1">고객의 연차별 적합 스케줄 및 5년 재지원 알림을 통합 관리합니다.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-muted-bg border border-border hover:bg-border text-foreground rounded-xl transition-colors">
            <Filter className="w-4 h-4" />
            <span className="font-medium text-sm">상세 필터</span>
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#FEE500] hover:bg-[#FEE500]/90 text-black rounded-xl transition-colors shadow-lg shadow-[#FEE500]/20">
            <MessageSquare className="w-4 h-4" />
            <span className="font-medium text-sm">선택 고객 알림톡 일괄발송</span>
          </button>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "이달의 적합 대상자", value: "12", color: "brand" },
          { label: "알림톡 발송 대기", value: "8", color: "amber" },
          { label: "5년 재지원 임박 (D-30)", value: "3", color: "rose" }
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
              <span className="text-sm text-muted">명</span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="glass-card bg-surface overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {TABS.map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-brand-700 dark:text-white' : 'text-muted hover:text-foreground'}`}
              >
                {activeTab === tab && (
                  <motion.div layoutId="conformityTab" className="absolute inset-0 bg-brand-50 dark:bg-white/10 border border-brand-200 dark:border-white/20 rounded-full" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-auto shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="고객명 검색..." 
              className="w-full lg:w-48 bg-muted-bg border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-brand-500 transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-border bg-muted-bg/50">
                <th className="w-12 px-4 py-4 text-center"><input type="checkbox" className="rounded text-brand-500 focus:ring-brand-500 border-border bg-surface" /></th>
                <th className="px-4 py-4 text-xs font-medium text-muted uppercase tracking-wider">고객명</th>
                <th className="px-4 py-4 text-xs font-medium text-muted uppercase tracking-wider">기기 정보</th>
                <th className="px-4 py-4 text-xs font-medium text-muted uppercase tracking-wider">구매일자(계산서)</th>
                <th className="px-4 py-4 text-xs font-medium text-center text-muted uppercase tracking-wider border-l border-border/50">1차 적합</th>
                <th className="px-4 py-4 text-xs font-medium text-center text-muted uppercase tracking-wider">2차 적합</th>
                <th className="px-4 py-4 text-xs font-medium text-center text-muted uppercase tracking-wider">3차 적합</th>
                <th className="px-4 py-4 text-xs font-medium text-center text-muted uppercase tracking-wider">4차 적합</th>
                <th className="px-4 py-4 text-xs font-medium text-center text-rose-500 uppercase tracking-wider border-l border-border/50">5년 재지원</th>
                <th className="px-4 py-4 text-xs font-medium text-center text-muted uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-muted">
                    선택한 조건에 해당하는 고객이 없습니다.
                  </td>
                </tr>
              ) : filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-muted-bg/50 transition-colors">
                  <td className="px-4 py-4 text-center"><input type="checkbox" className="rounded text-brand-500 focus:ring-brand-500 border-border bg-surface" /></td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <p className="text-sm font-bold text-foreground hover:text-brand-500 cursor-pointer">{item.name}</p>
                    <p className="text-xs text-muted mt-0.5">{item.phone}</p>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-muted">{item.device}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-foreground">{item.date}</td>
                  
                  {/* Status Columns */}
                  {[item.s1, item.s2, item.s3, item.s4].map((status, idx) => (
                    <td key={idx} className={`px-2 py-4 whitespace-nowrap text-center ${idx === 0 ? 'border-l border-border/50' : ''}`}>
                      <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                        status === '입금확인' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        status.includes('대상자') ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                        status === '서류접수' ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20' :
                        'text-muted/50'
                      }`}>
                        {status}
                      </span>
                    </td>
                  ))}

                  {/* 5 Year Status */}
                  <td className="px-2 py-4 whitespace-nowrap text-center border-l border-border/50">
                    <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                      item.s5 === '입금확인' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                      item.s5 === '서류접수' ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20' :
                      item.s5.includes('대상자') ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' : 
                      'text-muted/50'
                    }`}>
                      {item.s5}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <button className="p-1.5 text-muted hover:text-[#FEE500] hover:bg-[#FEE500]/10 rounded-lg transition-colors tooltip" title="알림톡 발송">
                      <MessageSquare className="w-4 h-4" />
                    </button>
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
