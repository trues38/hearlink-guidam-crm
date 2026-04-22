"use client";

import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import DataTable from "@/components/DataTable";
import { CheckCircle2, Battery, Headphones, Bell } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-6 md:space-y-8 pb-12 mt-16 md:mt-0">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-brand-500 font-medium mb-1 tracking-wide text-xs md:text-sm">HEARLINK DASHBOARD</p>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            관리자님, 좋은 하루 되세요! 👋
          </h1>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end"
        >
          <div className="md:hidden text-left">
            <p className="text-sm font-medium text-foreground">{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-xs text-muted">{['일','월','화','수','목','금','토'][new Date().getDay()]}요일</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2.5 bg-muted-bg border border-border rounded-xl text-muted hover:text-foreground transition-all duration-300">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-brand-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            </button>
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-foreground">{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p className="text-xs text-muted">{['일','월','화','수','목','금','토'][new Date().getDay()]}요일</p>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <StatCard
          title="오늘 할 일 (Today)"
          value="12"
          subtitle="건"
          icon={<CheckCircle2 className="w-6 h-6" />}
          trend={{ value: "3", isPositive: true }}
          delay={0.1}
        />
        <StatCard
          title="배터리 판매 (Today)"
          value="45"
          subtitle="BOX"
          icon={<Battery className="w-6 h-6" />}
          trend={{ value: "12", isPositive: true }}
          delay={0.2}
        />
        <StatCard
          title="악세사리 판매 (Today)"
          value="8"
          subtitle="개"
          icon={<Headphones className="w-6 h-6" />}
          trend={{ value: "2", isPositive: false }}
          delay={0.3}
        />
      </div>

      {/* Data Table */}
      <DataTable />
    </div>
  );
}
