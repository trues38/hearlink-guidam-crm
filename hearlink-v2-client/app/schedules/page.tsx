"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, User } from "lucide-react";
import { useState } from "react";
import ScheduleModal from "@/components/modals/ScheduleModal";

export default function SchedulesPage() {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthLabel = `${year}년 ${month + 1}월`;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());
  
  return (
    <div className="space-y-6 md:space-y-8 pb-12 mt-16 md:mt-0 h-[calc(100vh-8rem)] flex flex-col">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{monthLabel}</h1>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="p-1.5 rounded-lg border border-border hover:bg-muted-bg text-foreground transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={goToday} className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted-bg text-sm font-medium text-foreground transition-colors">오늘</button>
            <button onClick={nextMonth} className="p-1.5 rounded-lg border border-border hover:bg-muted-bg text-foreground transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full sm:w-auto">
          <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-colors shadow-lg shadow-brand-500/20">
            <Plus className="w-4 h-4" />
            <span className="font-medium">일정 추가</span>
          </button>
        </motion.div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Calendar Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex-1 glass-card bg-surface flex flex-col overflow-hidden">
          <div className="grid grid-cols-7 border-b border-border bg-muted-bg/50">
            {days.map(day => (
              <div key={day} className={`py-3 text-center text-sm font-medium ${day === '일' ? 'text-rose-500' : day === '토' ? 'text-brand-500' : 'text-muted'}`}>
                {day}
              </div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-7 grid-rows-5 divide-x divide-y divide-border/50">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="min-h-[80px] p-2 hover:bg-muted-bg/30 transition-colors">
                <span className={`text-sm ${i === 21 ? 'bg-brand-500 text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-foreground'}`}>
                  {(i % 30) + 1}
                </span>
                {i === 21 && (
                  <div className="mt-1 px-1.5 py-1 text-xs bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded border border-brand-500/20 truncate">
                    14:00 김철수 (상담)
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Side Panel: Today's Schedule */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="w-full lg:w-80 flex flex-col gap-4">
          <div className="glass-card bg-surface p-5 flex-1">
            <h2 className="font-bold text-foreground mb-4">4월 22일 (수) 일정</h2>
            <div className="space-y-4">
              <div className="p-3 rounded-xl border border-border bg-muted-bg relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500" />
                <div className="flex justify-between items-start mb-2 pl-2">
                  <span className="font-bold text-foreground text-sm flex items-center gap-1"><User className="w-3 h-3"/> 김철수 고객</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-500/10 text-brand-500">신규상담</span>
                </div>
                <div className="pl-2 space-y-1 text-xs text-muted">
                  <div className="flex items-center gap-1.5"><Clock className="w-3 h-3"/> 14:00 - 15:00</div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3"/> 1상담실</div>
                </div>
              </div>
              
              <div className="p-3 rounded-xl border border-border bg-muted-bg relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                <div className="flex justify-between items-start mb-2 pl-2">
                  <span className="font-bold text-foreground text-sm flex items-center gap-1"><User className="w-3 h-3"/> 이영희 고객</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">기기조절</span>
                </div>
                <div className="pl-2 space-y-1 text-xs text-muted">
                  <div className="flex items-center gap-1.5"><Clock className="w-3 h-3"/> 16:30 - 17:00</div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3"/> 2상담실</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <ScheduleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
