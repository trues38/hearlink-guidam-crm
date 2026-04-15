"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const API_BASE = "http://localhost:3002";

type Customer = { id: string; name: string };

type ScheduleEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  description?: string;
  extendedProps: {
    customerId?: string;
    customerName?: string;
  };
};

export default function SchedulesPage() {
  const router = useRouter();
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    scheduledAt: "",
    customerId: "",
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    fetchCustomers();
    fetchSchedules();
  }, []);

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
    try {
      const res = await fetch(`${API_BASE}/api/schedules?limit=100`);
      const data = await res.json();
      const items = data.items || [];
      
      const formattedEvents: ScheduleEvent[] = items.map((s: any) => ({
        id: s.id,
        title: s.title,
        start: s.scheduledAt,
        description: s.description,
        extendedProps: {
          customerId: s.customer?.id,
          customerName: s.customer?.name,
        },
      }));
      
      setEvents(formattedEvents);
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

  const handleDateClick = (info: any) => {
    setSelectedDate(info.dateStr);
    setForm({ ...form, scheduledAt: info.dateStr });
    setShowModal(true);
  };

  const handleEventClick = (info: any) => {
    const { customerId } = info.event.extendedProps;
    if (customerId) {
      router.push(`/customers/${customerId}`);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("이 일정을 삭제하시겠습니까?")) return;
    try {
      await fetch(`${API_BASE}/api/schedules/${eventId}`, { method: "DELETE" });
      fetchSchedules();
    } catch (err) {
      alert("일정 삭제에 실패했습니다");
    }
  };

  const handleUpdateEvent = async (eventId: string, newDate: string) => {
    try {
      await fetch(`${API_BASE}/api/schedules/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt: newDate }),
      });
      fetchSchedules();
    } catch (err) {
      alert("일정 수정에 실패했습니다");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-slate-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-slide-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 to-slate-800 dark:from-indigo-400 dark:to-slate-200 tracking-tight drop-shadow-sm">
            일정 관리
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">드래그하여 일정을 이동하고, 단력을 클릭하여 즉시 등록할 수 있습니다.</p>
        </div>
        <button
          onClick={() => {
            setSelectedDate("");
            setForm({ title: "", description: "", scheduledAt: "", customerId: "" });
            setShowModal(true);
          }}
          className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white transition-all duration-300 bg-slate-900 rounded-2xl hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/20 overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            <svg className="w-5 h-5 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            새 일정
          </span>
          <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
        </button>
      </div>

      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/60 dark:border-white/10 p-6 md:p-8 relative overflow-hidden group hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] transition-all duration-500 hover:bg-slate-900/60 z-10">
        {/* Dynamic Kick Inner Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-300/30 to-transparent blur-3xl rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          editable={true}
          droppable={true}
          eventDrop={(info) => handleUpdateEvent(info.event.id, info.event.startStr)}
          eventResizableFromStart={true}
          height="auto"
          locale="ko"
          buttonText={{
            today: "오늘",
            month: "월",
            week: "주",
            day: "일",
          }}
          eventContent={(arg) => (
            <div className="flex items-center justify-between w-full p-1">
              <span className="truncate flex-1">{arg.event.title}</span>
              {arg.event.extendedProps.customerName && (
                <span className="text-xs opacity-75 ml-1 truncate">
                  {arg.event.extendedProps.customerName}
                </span>
              )}
            </div>
          )}
          eventClassNames={(arg) => [
            "cursor-pointer",
            arg.event.extendedProps.customerId ? "bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-700/50" : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700",
          ]}
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 animate-slide-up" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"></div>
          
          <div className="relative bg-white/80 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2rem] p-8 w-full max-w-lg shadow-[0_30px_60px_rgb(0,0,0,0.15)] border border-white dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            {/* Modal Internal Glow */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-50 dark:from-slate-800/50 to-transparent rounded-t-[2rem] pointer-events-none z-0"></div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100">새 일정 등록</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">고객 (선택)</label>
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">설명</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input resize-none"
                  rows={3}
                  placeholder="일정 설명 (선택)"
                />
              </div>
              <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-200/60 dark:border-white/10 relative z-10">
                <button type="button" onClick={() => setShowModal(false)} className="group px-6 py-3 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 dark:hover:text-slate-300 transition-colors bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700">
                  취소
                </button>
                <button type="submit" className="group relative px-8 py-3 rounded-xl font-bold text-white transition-all overflow-hidden shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-600 transition-all duration-300 group-hover:scale-105"></div>
                  <span className="relative z-10">등록하기</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}