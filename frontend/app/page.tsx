"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";

const API = "http://localhost:3002";

interface Schedule {
  id: string;
  title: string;
  scheduledAt: string;
  customer: { name: string } | null;
}

interface Customer {
  id: string;
  name: string;
  contactNumber: string;
  createdAt: string;
  classification: string;
  governmentSupportType?: string;
  recipientType?: string;
}

interface Stats {
  totalCustomers: number;
  todaySchedules: number;
  consultationCount: number;
  unreadNotifications: number;
  monthlyRevenue: number;
  pendingPayments: number;
}

const classificationLabels: Record<string, string> = {
  SELF: "자가",
  OTHER: "타기관",
  HEARDOTCOM: "히어닷컴",
};

const governmentSupportLabels: Record<string, string> = {
  DISABILITY_GRADE_HOLDER: "장애등급소지자",
  POTENTIAL_DISABILITY: "장애가망",
  INDUSTRIAL_ACCIDENT: "산업재해",
  GENERAL: "일반",
};

const recipientLabels: Record<string, string> = {
  RECIPIENT: "수급자",
  NEAR_POVERTY: "차상위",
  GENERAL: "일반",
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0,
    todaySchedules: 0,
    consultationCount: 0,
    unreadNotifications: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
  });
  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const safeFetch = async (url: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    } catch {
      return null;
    }
  };

  const fetchDashboardData = async () => {
    const today = new Date().toISOString().split("T")[0];
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

    const [customersData, schedulesData, consultationsData, notificationsData, paymentsData] = await Promise.all([
      safeFetch(`${API}/api/customers`),
      safeFetch(`${API}/api/schedules`),
      safeFetch(`${API}/api/consultations`),
      safeFetch(`${API}/api/notifications`),
      safeFetch(`${API}/api/payments`),
    ]);

    const customers = customersData?.items || customersData || [];
    const schedules = schedulesData?.items || schedulesData || [];
    const consultations = consultationsData?.items || consultationsData || [];
    const notifications = notificationsData?.items || notificationsData || [];
    const payments = paymentsData?.items || paymentsData || [];

    // Stats calculation
    const todaySchedulesList = schedules.filter((s: Schedule) => s.scheduledAt?.startsWith(today));
    const monthlyRevenue = payments
      .filter((p: any) => p.status === "PAID")
      .reduce((sum: number, p: any) => sum + (p.paidAmount || 0), 0);
    const pendingPayments = payments.filter((p: any) => p.status === "UNPAID").length;

    setStats({
      totalCustomers: customersData?.total || customers.length,
      todaySchedules: todaySchedulesList.length,
      consultationCount: consultations.length,
      unreadNotifications: notifications.filter((n: any) => !n.isRead).length,
      monthlyRevenue,
      pendingPayments,
    });

    setTodaySchedules(todaySchedulesList.slice(0, 4));
    setRecentCustomers(customers.slice(0, 6));
    setLoading(false);
  };

  const exportCustomersToExcel = () => {
    const customers = recentCustomers.length > 0 ? recentCustomers : [];
    
    const exportData = customers.map((c: Customer) => ({
      이름: c.name,
      연락처: c.contactNumber,
      분류: classificationLabels[c.classification] || c.classification,
      등록일: new Date(c.createdAt).toLocaleDateString("ko-KR"),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "고객 목록");

    const fileName = `Hearlink_고객목록_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const statCards = [
    {
      label: "전체 고객",
      value: stats.totalCustomers,
      sub: "누적 등록",
      icon: "👥",
      color: "from-blue-500 to-indigo-500",
      shadow: "shadow-blue-500/30",
      href: "/customers",
    },
    {
      label: "오늘 일정",
      value: stats.todaySchedules,
      sub: "금일 예약",
      icon: "📅",
      color: "from-emerald-400 to-teal-500",
      shadow: "shadow-emerald-500/30",
      href: "/schedules",
    },
    {
      label: "이번달 매출",
      value: `₩${(stats.monthlyRevenue / 10000).toFixed(0)}만`,
      sub: "입금완료",
      icon: "💰",
      color: "from-violet-500 to-purple-600",
      shadow: "shadow-violet-500/30",
      href: "/payments",
    },
    {
      label: "미확인 알림",
      value: stats.unreadNotifications,
      sub: "읽지 않은",
      icon: "🔔",
      color: "from-amber-400 to-orange-500",
      shadow: "shadow-amber-500/30",
      href: "/notifications",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-slate-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full font-sans tracking-tight z-0 overflow-hidden rounded-3xl p-2">
      <div className="max-w-[1600px] mx-auto pt-6 px-4">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12">
          <div className="mb-6 md:mb-0 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">System Online</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800 dark:from-white dark:via-slate-200 dark:to-slate-400 mb-2 drop-shadow-sm">
              반갑습니다, 관리자님 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-[15px] pl-1">
              {dateStr}의 현황입니다. 고객과 일정을 효율적으로 관리하세요.
            </p>
          </div>

          <div className="mt-6 md:mt-0 flex gap-3 flex-wrap justify-end">
            <button
              onClick={exportCustomersToExcel}
              className="px-5 py-2.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md shadow-sm border border-white/50 dark:border-white/10 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-white dark:bg-slate-900 dark:hover:bg-slate-800 transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              엑셀 다운로드
            </button>
            <button className="px-5 py-2.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md shadow-sm border border-white/50 dark:border-white/10 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:bg-slate-900 dark:hover:bg-slate-800 transition-all duration-300 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              동기화
            </button>
            <Link
              href="/schedules"
              className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white transition-all duration-300 bg-slate-900 rounded-2xl hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/20 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-5 h-5 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                새 일정
              </span>
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
            </Link>
          </div>
        </header>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {statCards.map((card, idx) => (
            <Link
              key={card.label}
              href={card.href}
              className="block group cursor-pointer outline-none animate-slide-up"
              style={{ animationDelay: `${0.15 + idx * 0.05}s` }}
            >
              <div className="relative bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-[2rem] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] hover:bg-white dark:bg-slate-900/80 dark:hover:bg-slate-800/60 z-10 overflow-hidden h-full flex flex-col justify-between">
                <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${card.color} opacity-0 group-hover:opacity-20 rounded-full blur-3xl transition-opacity duration-700 pointer-events-none translate-x-1/3 -translate-y-1/3`}></div>
                <div className="flex flex-col gap-5 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className={`relative flex items-center justify-center w-14 h-14 rounded-[1.25rem] bg-gradient-to-br ${card.color} text-[1.65rem] text-white shadow-lg ${card.shadow} transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3`}>
                      <div className="absolute inset-0 rounded-[1.25rem] bg-white dark:bg-slate-900 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                      {card.icon}
                    </div>
                    <span className="px-3.5 py-1.5 text-[11px] font-extrabold text-slate-500 dark:text-slate-300 uppercase tracking-widest bg-white/70 dark:bg-slate-800/70 shadow-sm rounded-full group-hover:text-slate-800 dark:hover:text-slate-200 dark:text-slate-200 dark:group-hover:text-white transition-colors">
                      {card.sub}
                    </span>
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-slate-500 dark:text-slate-400 mb-1 group-hover:text-slate-600 dark:hover:text-slate-400 dark:text-slate-400 dark:group-hover:text-slate-200 transition-colors">{card.label}</div>
                    <div className="text-[2.5rem] font-extrabold text-slate-800 dark:text-white tracking-tight leading-none group-hover:text-indigo-600 dark:hover:text-indigo-400 dark:group-hover:text-indigo-400 transition-colors">
                      {card.value}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-10">
          {/* Today Schedules */}
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] animate-slide-up duration-500" style={{ animationDelay: '0.45s' }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  오늘의 일정
                </h2>
                <p className="text-sm font-semibold text-slate-400 mt-1">오늘 예정된 일정 스케줄입니다.</p>
              </div>
              <Link href="/schedules" className="px-4 py-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors">
                캘린더 열기
              </Link>
            </div>

            <div className="space-y-4">
              {todaySchedules.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-semibold bg-white/30 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">오늘 일정이 없습니다.</div>
              ) : (
                todaySchedules.map((schedule) => (
                  <div key={schedule.id} className="group border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl p-5 hover:bg-white dark:bg-slate-900 dark:hover:bg-slate-800 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-500/20 flex flex-col items-center justify-center transform group-hover:scale-105 transition-transform">
                          <span className="text-[10px] font-black tracking-widest text-emerald-500 dark:text-emerald-400 uppercase">TIME</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200">
                            {new Date(schedule.scheduledAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-extrabold text-[15px] text-slate-800 dark:text-slate-100 mb-1 group-hover:text-emerald-700 dark:hover:text-emerald-400 dark:group-hover:text-emerald-400 transition-colors">{schedule.title}</h4>
                          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 line-clamp-1">{schedule.customer?.name ?? "고객 미지정"}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 bg-white dark:bg-slate-800 font-bold text-[11px] text-slate-400 dark:text-slate-400 rounded-xl border border-emerald-100/50 dark:border-emerald-500/10 shadow-sm whitespace-nowrap">
                        {new Date(schedule.scheduledAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Customers */}
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] animate-slide-up duration-500" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  최근 등록 고객
                </h2>
                <p className="text-sm font-semibold text-slate-400 mt-1">가장 최근에 등록된 5명의 고객입니다.</p>
              </div>
              <Link href="/customers" className="px-4 py-2 text-sm font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
                전체보기
              </Link>
            </div>

            <div className="space-y-4">
              {recentCustomers.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-semibold bg-white/30 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">등록된 고객이 없습니다</div>
              ) : (
                <div className="space-y-2">
                  {recentCustomers.map((c, i) => {
                    const colors = [
                      "from-blue-500 to-cyan-400 shadow-blue-500/30",
                      "from-violet-500 to-fuchsia-400 shadow-violet-500/30",
                      "from-emerald-500 to-teal-400 shadow-emerald-500/30",
                      "from-amber-500 to-orange-400 shadow-amber-500/30",
                      "from-rose-500 to-pink-400 shadow-rose-500/30",
                      "from-indigo-600 to-blue-500 shadow-indigo-500/30",
                    ];
                    const colorClass = colors[i % colors.length];

                    return (
                      <Link
                        key={c.id}
                        href={`/customers/${c.id}`}
                        className="group/item flex items-center gap-5 p-5 rounded-3xl hover:bg-blue-50/40 dark:hover:bg-slate-800/60 transition-all duration-300 border border-transparent hover:border-blue-200/50 dark:hover:border-slate-700 hover:shadow-sm"
                      >
                        <div
                          className={`w-14 h-14 rounded-[1.25rem] bg-gradient-to-br ${colorClass} shadow-lg flex items-center justify-center text-white font-black text-xl ring-[3px] ring-white/50 dark:ring-white/10 group-hover/item:scale-110 group-hover/item:rotate-3 transition-transform duration-300 overflow-hidden relative shrink-0`}
                        >
                          <div className="absolute inset-0 bg-white dark:bg-slate-900/20 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 z-10"></div>
                          <span className="relative z-0 drop-shadow-md">{c.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-extrabold text-slate-800 dark:text-slate-100 text-[16px] group-hover/item:text-blue-700 dark:group-hover/item:text-blue-400 dark:group-hover:text-blue-400 transition-colors">{c.name}</div>
                          <div className="text-[13px] font-bold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                            </svg>
                            {c.contactNumber}
                          </div>
                        </div>
                        <div className="text-[12px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-100 dark:border-slate-700 group-hover/item:border-blue-200 dark:group-hover:border-blue-900 group-hover/item:text-blue-600 dark:group-hover:text-blue-400 group-hover/item:bg-blue-50 dark:group-hover/item:bg-blue-900/30 dark:group-hover:bg-blue-900/30 transition-colors whitespace-nowrap shadow-sm">
                          {new Date(c.createdAt).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}