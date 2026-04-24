"use client";

import { motion } from "framer-motion";
import { PackageSearch, AlertCircle, Plus, Search } from "lucide-react";
import { useState } from "react";
import InventoryModal from "@/components/modals/InventoryModal";

export default function InventoryPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('전체품목');

  const mockData = [
    { id: 1, name: '오티콘 리얼 1', category: '보청기', brand: '오티콘', stock: 12, warning: false },
    { id: 2, name: '스타키 보청기 배터리 312', category: '배터리', brand: '스타키', stock: 3, warning: true },
    { id: 3, name: '포낙 오데오 루미티', category: '보청기', brand: '포낙', stock: 5, warning: false },
  ];

  const filteredData = mockData.filter(item => {
    if (activeTab === '부족재고') return item.warning;
    return true;
  });

  return (
    <div className="space-y-6 md:space-y-8 pb-12 mt-16 md:mt-0">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">재고관리</h1>
          <p className="text-muted text-sm mt-1">기기 및 소모품의 재고 현황을 파악합니다.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full md:w-auto">
          <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-colors shadow-lg shadow-brand-500/20">
            <Plus className="w-4 h-4" />
            <span className="font-medium">품목 추가</span>
          </button>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['보청기', '배터리', '습기제거제', '기타 부품'].map((category, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: i * 0.1 }}
            key={category} 
            className={`glass-card bg-surface p-4 flex items-center justify-between ${i === 1 ? 'border-amber-500/50 bg-amber-500/5' : ''}`}
          >
            <div>
              <p className="text-muted text-sm font-medium">{category}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-foreground">{i === 1 ? '3' : 12 * (i+1)}</span>
                <span className="text-xs text-muted">단위</span>
              </div>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${i === 1 ? 'bg-amber-500/20 text-amber-500' : 'bg-muted-bg border border-border text-brand-500'}`}>
              {i === 1 ? <AlertCircle className="w-5 h-5" /> : <PackageSearch className="w-5 h-5" />}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="glass-card bg-surface overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            {['전체품목', '부족재고'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-brand-700 dark:text-white' : 'text-muted hover:text-foreground'}`}
              >
                {activeTab === tab && (
                  <motion.div layoutId="invTab" className="absolute inset-0 bg-brand-50 dark:bg-white/10 border border-brand-200 dark:border-white/20 rounded-full" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="품목명 검색..." 
              className="w-full sm:w-64 bg-muted-bg border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-brand-500 transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-border bg-muted-bg/50">
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider">품목명</th>
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider">카테고리</th>
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider">제조사</th>
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider text-right">현재 재고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-muted-bg/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">{item.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">{item.brand}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${item.warning ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' : 'bg-muted-bg text-foreground border border-border'}`}>
                      {item.stock} 개
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <InventoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
