"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_BASE = "http://localhost:3002";

type Schedule = {
  id: string;
  title: string;
  description?: string;
  scheduledAt: string;
  customer?: {
    id: string;
    name: string;
  };
};

export default function SchedulesPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    scheduledAt: "",
    customerId: "",
  });
  const [customers, setCustomers] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    fetchSchedules();
    fetchCustomers();
  }, [currentDate]);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/customers?limit=100`);
      const data = await res.json();
      setCustomers(data.items || []);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    }
  };

  const fetchSchedules = async () => {
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    try {
      const res = await fetch(
        `${API_BASE}/api/schedules/calendar?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      const data = await res.json();
      setSchedules(data || []);
    } catch (err) {
      console.error("Failed to fetch schedules:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.scheduledAt) return;
    try {
      await fetch(`${API_BASE}/api/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          centerId: localStorage.getItem("centerId") || "default-center-id",
          title: form.title,
          description: form.description,
          scheduledAt: form.scheduledAt,
          customerId: form.customerId || null,
        }),
      });
      setShowModal(false);
      setForm({ title: "", description: "", scheduledAt: "", customerId: "" });
      fetchSchedules();
    } catch (err) {
      alert("일정 등록에 실패했습니다");
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    const startPadding = firstDay.getDay();
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getSchedulesForDate = (date: Date | null) => {
    if (!date) return [];
    return schedules.filter(s => {
      const scheduleDate = new Date(s.scheduledAt);
      return scheduleDate.toDateString() === date.toDateString();
    });
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  const days = getDaysInMonth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">일정 관리</h1>
          <p className="text-sm text-slate-500 mt-1">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary shadow-lg shadow-blue-500/30"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          새 일정
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-lg font-semibold">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </span>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7">
          {weekDays.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-slate-500 bg-slate-50 border-b border-slate-200">
              {day}
            </div>
          ))}
          
          {days.map((date, idx) => {
            const daySchedules = getSchedulesForDate(date);
            return (
              <div
                key={idx}
                className={`min-h-[120px] p-2 border-b border-r border-slate-100 ${
                  !date ? "bg-slate-50" : isToday(date) ? "bg-blue-50" : ""
                }`}
              >
                {date && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${
                      isToday(date) ? "text-blue-600" : "text-slate-700"
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {daySchedules.slice(0, 3).map((s) => (
                        <div
                          key={s.id}
                          onClick={() => router.push(`/customers/${s.customer?.id}`)}
                          className="text-xs p-1 bg-blue-100 text-blue-700 rounded truncate cursor-pointer hover:bg-blue-200"
                        >
                          {s.title}
                        </div>
                      ))}
                      {daySchedules.length > 3 && (
                        <div className="text-xs text-slate-500">
                          +{daySchedules.length - 3}개 더
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="modal-content w-full max-w-lg animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">새 일정 등록</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input"
                  placeholder="일정 제목"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  고객 (선택)
                </label>
                <select
                  value={form.customerId}
                  onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                  className="input"
                >
                  <option value="">고객 없음</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  일시 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  설명
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input resize-none"
                  rows={3}
                  placeholder="일정 설명 (선택)"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
