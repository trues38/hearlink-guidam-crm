"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  delay?: number;
}

export default function StatCard({ title, value, subtitle, icon, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card p-6 flex flex-col relative overflow-hidden group bg-surface"
    >
      {/* Subtle glow effect behind card */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl group-hover:bg-brand-500/20 transition-all duration-500" />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-muted font-medium text-sm mb-1">{title}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground tracking-tight">{value}</span>
            <span className="text-sm text-muted font-medium">{subtitle}</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-muted-bg border border-border flex items-center justify-center text-brand-500 shadow-inner">
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-2 flex items-center gap-2 relative z-10">
          <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
            trend.isPositive 
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
          }`}>
            {trend.isPositive ? '+' : '-'}{trend.value}
          </span>
          <span className="text-xs text-muted">vs yesterday</span>
        </div>
      )}
    </motion.div>
  );
}
