"use client";

import { useState, useEffect } from "react";

const API_BASE = "http://localhost:3002";

type Notification = {
  id: string;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
};

const notificationTypes: Record<string, { label: string; icon: string; color: string }> = {
  SCHEDULE_REMINDER: { label: "일정 알림", icon: "📅", color: "text-blue-600" },
  PAYMENT_DUE: { label: "결제 예정", icon: "💳", color: "text-yellow-600" },
  CUSTOMER_REGISTERED: { label: "고객 등록", icon: "👤", color: "text-green-600" },
  DOCUMENT_READY: { label: "서류 준비", icon: "📄", color: "text-purple-600" },
  TASK_ASSIGNED: { label: "업무 할당", icon: "📌", color: "text-red-600" },
  SYSTEM: { label: "시스템", icon: "⚙️", color: "text-gray-600" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/notifications?limit=50`);
      const data = await res.json();
      setNotifications(data.items || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`${API_BASE}/api/notifications/${id}/read`, { method: "PUT" });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllAsRead = async () => {
    for (const n of notifications.filter(n => !n.isRead)) {
      await markAsRead(n.id);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return <div className="text-center py-8 text-gray-500">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">알림</h1>
          <p className="text-sm text-slate-500 mt-1">
            {unreadCount > 0 ? `${unreadCount}개의 읽지 않은 알림` : "모든 알림을 읽었습니다"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            모두 읽음 처리
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => {
          const typeInfo = notificationTypes[notification.type] || notificationTypes.SYSTEM;
          return (
            <div
              key={notification.id}
              className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-md ${
                !notification.isRead ? "border-l-4 border-l-blue-500 border-slate-200" : "border-slate-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`text-2xl ${typeInfo.color}`}>{typeInfo.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold ${notification.isRead ? "text-slate-700" : "text-slate-900"}`}>
                      {notification.title}
                    </h3>
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                  <p className="mt-1 text-slate-600">{notification.content}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-xs text-slate-400">
                      {new Date(notification.createdAt).toLocaleString("ko-KR")}
                    </span>
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        읽음 처리
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {notifications.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-slate-200">
          <div className="text-4xl mb-4">🔔</div>
          <h3 className="text-lg font-medium text-slate-900">알림이 없습니다</h3>
          <p className="text-slate-500 mt-1">새로운 알림이 있으면 여기서 알려드립니다</p>
        </div>
      )}
    </div>
  );
}
