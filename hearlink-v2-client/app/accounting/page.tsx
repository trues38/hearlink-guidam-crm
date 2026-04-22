"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, DollarSign, Download, Filter } from "lucide-react";
import StatCard from "@/components/StatCard";

export default function AccountingPage() {
  return (
    <div className="space-y-6 md:space-y-8 pb-12 mt-16 md:mt-0">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">회계</h1>
          <p className="text-muted text-sm mt-1">매출, 매입 및 수/지출 내역을 관리합니다.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full md:w-auto flex items-center gap-2">
          <button className="flex-1 md:flex-none items-center justify-center gap-2 px-4 py-2 bg-muted-bg border border-border hover:bg-border text-foreground rounded-xl transition-colors">
            <Filter className="w-4 h-4" />
            <span className="font-medium text-sm">기간 설정</span>
          </button>
          <button className="flex-1 md:flex-none items-center justify-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-colors shadow-lg shadow-brand-500/20">
            <Download className="w-4 h-4" />
            <span className="font-medium text-sm">엑셀 다운로드</span>
          </button>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <StatCard
          title="이달의 총 매출"
          value="₩ 12,450,000"
          subtitle=""
          icon={<ArrowUpRight className="w-6 h-6 text-emerald-500" />}
          trend={{ value: "15%", isPositive: true }}
          delay={0.1}
        />
        <StatCard
          title="이달의 총 지출"
          value="₩ 3,200,000"
          subtitle=""
          icon={<ArrowDownRight className="w-6 h-6 text-rose-500" />}
          trend={{ value: "5%", isPositive: false }}
          delay={0.2}
        />
        <StatCard
          title="예상 순이익"
          value="₩ 9,250,000"
          subtitle=""
          icon={<DollarSign className="w-6 h-6 text-brand-500" />}
          trend={{ value: "12%", isPositive: true }}
          delay={0.3}
        />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="glass-card bg-surface overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-bold text-foreground">최근 거래 내역</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border bg-muted-bg/50">
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider">일자</th>
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider">구분</th>
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider">고객/거래처</th>
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider">품목</th>
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider text-right">금액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { date: '2026-04-22', type: '매출', entity: '김철수', item: '보청기 (우)', amount: '+ 2,500,000', positive: true },
                { date: '2026-04-21', type: '지출', entity: '오티콘코리아', item: '기기 매입대금', amount: '- 1,200,000', positive: false },
                { date: '2026-04-21', type: '매출', entity: '이영희', item: '배터리 1BOX', amount: '+ 25,000', positive: true },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-muted-bg/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">{row.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-md border ${row.positive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'}`}>
                      {row.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">{row.entity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">{row.item}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${row.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {row.amount}
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
