"use client";

import Modal from "@/components/Modal";
import { useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCustomerName?: string;
}

export default function ScheduleModal({ isOpen, onClose, defaultCustomerName }: ScheduleModalProps) {
  const [tab, setTab] = useState<'customer' | 'center'>('customer');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="일정 추가" maxWidth="max-w-xl">
      <div className="flex gap-4 border-b border-border mb-6 px-1">
        <button onClick={() => setTab('customer')} className={`pb-3 text-sm font-medium transition-colors relative ${tab === 'customer' ? 'text-brand-600 dark:text-brand-400' : 'text-muted hover:text-foreground'}`}>
          고객 일정
          {tab === 'customer' && <motion.div layoutId="scheduleTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500" />}
        </button>
        <button onClick={() => setTab('center')} className={`pb-3 text-sm font-medium transition-colors relative ${tab === 'center' ? 'text-brand-600 dark:text-brand-400' : 'text-muted hover:text-foreground'}`}>
          센터 일정
          {tab === 'center' && <motion.div layoutId="scheduleTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500" />}
        </button>
      </div>

      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
        
        {tab === 'customer' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">고객 검색 <span className="text-rose-500">*</span></label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input 
                required 
                type="text" 
                defaultValue={defaultCustomerName}
                readOnly={!!defaultCustomerName}
                placeholder="고객명 또는 연락처 검색" 
                className={`w-full border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors ${defaultCustomerName ? 'bg-surface cursor-not-allowed text-muted font-medium' : 'bg-muted-bg'}`}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">일정 (날짜) <span className="text-rose-500">*</span></label>
            <input required type="date" className="w-full bg-muted-bg border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">시간 <span className="text-rose-500">*</span></label>
            <input required type="time" className="w-full bg-muted-bg border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">일정 제목 <span className="text-rose-500">*</span></label>
          <input required type="text" placeholder="예: 보청기 적합 피팅, 정기 점검 등" className="w-full bg-muted-bg border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">일정 내용</label>
          <textarea rows={4} placeholder="상세 내용을 입력하세요." className="w-full bg-muted-bg border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors resize-none" />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-6 border-t border-border">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted-bg transition-colors">
            취소
          </button>
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-sm font-medium text-white transition-colors shadow-lg shadow-brand-500/20">
            저장하기
          </button>
        </div>
      </form>
    </Modal>
  );
}
