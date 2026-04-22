"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Calculator,
  Receipt,
  PackageSearch,
  Settings,
  LogOut,
  Ear,
  Sun,
  Moon,
  Menu,
  X,
  ClipboardList,
  FileSignature
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { name: "홈", path: "/", icon: LayoutDashboard },
  { name: "고객조회", path: "/customers", icon: Users },
  { name: "전체일정", path: "/schedules", icon: CalendarDays },
  { name: "업무일지", path: "/worklogs", icon: ClipboardList },
  { name: "적합관리센터", path: "/conformity", icon: FileSignature },
  { name: "회계", path: "/accounting", icon: Calculator },
  { name: "세금계산서", path: "/tax-invoices", icon: Receipt },
  { name: "재고관리", path: "/inventory", icon: PackageSearch },
  { name: "설정", path: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsOpen(true);
      else setIsOpen(false);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) setIsOpen(false);
  }, [pathname, isMobile]);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface border-b border-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-foreground">
          <Ear className="w-6 h-6 text-brand-500" />
          <span className="text-lg font-bold tracking-tight">HEAR LINK</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-muted hover:text-foreground">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <motion.aside 
        initial={false}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="fixed md:static top-0 left-0 bottom-0 w-64 glass-panel flex flex-col z-50 shadow-2xl md:shadow-none bg-surface"
      >
        {/* Logo Area */}
        <div className="h-16 md:h-20 flex items-center justify-between px-6 border-b border-border bg-surface">
          <Link href="/" className="flex items-center gap-3 text-foreground group">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20 group-hover:bg-brand-500/20 transition-colors">
              <Ear className="w-6 h-6 text-brand-500" />
            </div>
            <span className="text-xl font-bold tracking-tight">HEAR LINK</span>
          </Link>
          {isMobile && (
            <button onClick={() => setIsOpen(false)} className="p-1 text-muted">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto bg-surface">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.path}
                className="block relative"
              >
                <div className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                  ${isActive ? 'text-brand-600 dark:text-white font-semibold' : 'text-muted hover:text-foreground hover:bg-muted-bg'}
                `}>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-brand-500' : ''}`} />
                  <span className="relative z-10">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Profile / Footer */}
        <div className="p-4 border-t border-border bg-surface">
          <div className="flex items-center gap-3 px-4 py-3 bg-muted-bg rounded-xl border border-border mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">
              관리자
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">관리자</p>
              <p className="text-xs text-muted truncate">test@test.com</p>
            </div>
            <button className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-muted hover:text-foreground transition-colors shrink-0">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-muted hover:text-foreground hover:bg-muted-bg transition-colors"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-4 h-4" />
                <span className="text-sm font-medium">라이트 모드</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" />
                <span className="text-sm font-medium">다크 모드</span>
              </>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
