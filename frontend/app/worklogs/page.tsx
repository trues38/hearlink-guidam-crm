"use client";

import { useState, useEffect } from "react";

const API_BASE = "http://localhost:3002";

type WorkLog = {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  customer?: { id: string; name: string };
  user?: { name: string };
};

const workLogTypes: Record<string, { label: string; color: string }> = {
  CUSTOMER_VISIT: { label: "고객 방문", color: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400" },
  PHONE_CALL: { label: "전화 상담", color: "bg-green-100 dark:bg-emerald-900/50 text-green-700 dark:text-emerald-400" },
  DEVICE_FITTING: { label: "장비 피팅", color: "bg-purple-100 text-purple-700" },
  FOLLOW_UP: { label: "후속 조치", color: "bg-yellow-100 text-yellow-700" },
  DOCUMENT_PREP: { label: "서류 준비", color: "bg-gray-100 text-gray-700 dark:text-slate-300" },
  MEETING: { label: "회의", color: "bg-red-100 text-red-700 dark:text-red-400" },
  ADMIN_TASK: { label: "관리 업무", color: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400" },
  OTHER: { label: "기타", color: "bg-slate-100 text-slate-700 dark:text-slate-300" },
};

export default function WorkLogsPage() {
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "CUSTOMER_VISIT", content: "" });

  useEffect(() => {
    fetchWorkLogs();
  }, []);

  const fetchWorkLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/worklogs?limit=50`);
      const data = await res.json();
      setWorkLogs(data.items || []);
    } catch (err) {
      console.error("Failed to fetch worklogs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.content) return;
    try {
      await fetch(`${API_BASE}/api/worklogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          centerId: localStorage.getItem("centerId") || "default-center-id",
          userId: "default-user-id",
          type: form.type,
          content: form.content,
        }),
      });
      setForm({ type: "CUSTOMER_VISIT", content: "" });
      setShowForm(false);
      fetchWorkLogs();
    } catch (err) {
      alert("등록에 실패했습니다");
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500 dark:text-slate-400">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">업무일지</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">총 {workLogs.length}건</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary shadow-lg shadow-blue-500/30"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          새 업무일지
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold mb-4">새 업무일지 작성</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">유형</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="input"
              >
                {Object.entries(workLogTypes).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">내용</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={4}
                className="input resize-none"
                placeholder="업무 내용을 입력하세요..."
                required
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary">저장</button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-secondary"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {workLogs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">업무일지가 없습니다</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">첫 번째 업무일지를 등록해보세요</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {workLogs.map((log) => (
              <div key={log.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${workLogTypes[log.type]?.color || workLogTypes.OTHER.color}`}>
                      {workLogTypes[log.type]?.label || "기타"}
                    </span>
                    <div>
                      <p className="text-slate-900 dark:text-slate-100">{log.content}</p>
                      {log.customer && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">고객: {log.customer.name}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-slate-500 dark:text-slate-400">{new Date(log.createdAt).toLocaleDateString("ko-KR")}</p>
                    {log.user && <p className="text-slate-400">{log.user.name}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
