"use client";

import { useState, useEffect } from "react";

const API_BASE = "http://localhost:3002";

type Notification = {
  id: string;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  kakaoSent: boolean;
  createdAt: string;
  customer?: { id: string; name: string; contactNumber?: string };
  user?: { name: string };
};

type KakaoTemplate = {
  code: string;
  label: string;
  description: string;
};

const notificationTypes: Record<string, { label: string; icon: string; color: string }> = {
  SCHEDULE_REMINDER: { label: "일정 알림", icon: "📅", color: "text-blue-600 dark:text-blue-400" },
  PAYMENT_DUE: { label: "결제 예정", icon: "💳", color: "text-yellow-600" },
  CUSTOMER_REGISTERED: { label: "고객 등록", icon: "👤", color: "text-green-600 dark:text-emerald-400" },
  DOCUMENT_READY: { label: "서류 준비", icon: "📄", color: "text-purple-600" },
  TASK_ASSIGNED: { label: "업무 할당", icon: "📌", color: "text-red-600" },
  SYSTEM: { label: "시스템", icon: "⚙️", color: "text-gray-600 dark:text-slate-400" },
};

const kakaoTemplates: KakaoTemplate[] = [
  { code: "SCHEDULE_REMINDER", label: "일정 알림 템플릿", description: "고객님 일정 알림드립니다" },
  { code: "PAYMENT_REMINDER", label: "결제 알림 템플릿", description: "결제 안내드립니다" },
  { code: "DOCUMENT_READY", label: "서류 완료 알림", description: "서류가 준비되었습니다" },
  { code: "CUSTOMER_REGISTER", label: "고객 등록 알림", description: "신규 고객 등록을 안내합니다" },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [kakaoForm, setKakaoForm] = useState({
    recipientNumber: "",
    templateCode: "SCHEDULE_REMINDER",
    customMessage: "",
  });
  const [sending, setSending] = useState(false);

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

  const handleSendKakao = async () => {
    if (!selectedNotification || !kakaoForm.recipientNumber) {
      alert("수신자 번호를 입력해주세요");
      return;
    }
    setSending(true);
    try {
      await fetch(`${API_BASE}/api/notifications/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationId: selectedNotification.id,
          recipientNumber: kakaoForm.recipientNumber,
          templateCode: kakaoForm.templateCode,
        }),
      });
      alert("카카오톡이 전송되었습니다!");
      setShowSendModal(false);
      setSelectedNotification(null);
      setKakaoForm({ recipientNumber: "", templateCode: "SCHEDULE_REMINDER", customMessage: "" });
      fetchNotifications();
    } catch (err) {
      alert("카카오톡 전송에 실패했습니다");
    } finally {
      setSending(false);
    }
  };

  const openSendModal = (notification: Notification) => {
    setSelectedNotification(notification);
    setKakaoForm({
      recipientNumber: notification.customer?.contactNumber || "",
      templateCode: notification.type || "SCHEDULE_REMINDER",
      customMessage: notification.content,
    });
    setShowSendModal(true);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return <div className="text-center py-8 text-gray-500 dark:text-slate-400">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">알림</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {unreadCount > 0 ? `${unreadCount}개의 읽지 않은 알림` : "모든 알림을 읽었습니다"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
          >
            모두 읽음 처리
          </button>
        )}
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/40 dark:to-pink-900/40 rounded-2xl p-6 border border-purple-100 dark:border-purple-900/50">
        <div className="flex items-center gap-4">
          <div className="text-4xl">📱</div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">카카오톡 알림 전송</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">알림을 선택하여 고객에게 카카오톡을 전송할 수 있습니다</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => {
          const typeInfo = notificationTypes[notification.type] || notificationTypes.SYSTEM;
          return (
            <div
              key={notification.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all hover:shadow-md ${
                !notification.isRead ? "border-l-4 border-l-blue-500 border-slate-200 dark:border-slate-700" : "border-slate-200 dark:border-slate-700"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`text-2xl ${typeInfo.color}`}>{typeInfo.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold ${notification.isRead ? "text-slate-700 dark:text-slate-300" : "text-slate-900 dark:text-slate-100"}`}>
                      {notification.title}
                    </h3>
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-400">{notification.content}</p>
                  <div className="mt-3 flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-slate-400">
                      {new Date(notification.createdAt).toLocaleString("ko-KR")}
                    </span>
                    {notification.customer && (
                      <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                        👤 {notification.customer.name}
                      </span>
                    )}
                    {notification.kakaoSent && (
                      <span className="text-xs px-2 py-1 bg-green-100 dark:bg-emerald-900/50 text-green-700 dark:text-emerald-400 rounded-full">
                        📱 카카오톡 전송됨
                      </span>
                    )}
                    <div className="flex gap-2 ml-auto">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          읽음 처리
                        </button>
                      )}
                      <button
                        onClick={() => openSendModal(notification)}
                        className="text-xs px-3 py-1 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100"
                      >
                        📱 카카오톡 전송
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {notifications.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-12 text-center border border-slate-200 dark:border-slate-700">
          <div className="text-4xl mb-4">🔔</div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">알림이 없습니다</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1">새로운 알림이 있으면 여기서 알려드립니다</p>
        </div>
      )}

      {/* KakaoTalk Send Modal */}
      {showSendModal && selectedNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSendModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">📱 카카오톡 전송</h2>
              <button onClick={() => setShowSendModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-slate-300 dark:text-slate-300">✕</button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">알림 내용</p>
                <p className="font-medium mt-1">{selectedNotification.title}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedNotification.content}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">수신자 전화번호</label>
                <input
                  type="tel"
                  value={kakaoForm.recipientNumber}
                  onChange={(e) => setKakaoForm({ ...kakaoForm, recipientNumber: e.target.value })}
                  className="input"
                  placeholder="010-0000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">템플릿 선택</label>
                <select
                  value={kakaoForm.templateCode}
                  onChange={(e) => setKakaoForm({ ...kakaoForm, templateCode: e.target.value })}
                  className="input"
                >
                  {kakaoTemplates.map((t) => (
                    <option key={t.code} value={t.code}>{t.label} - {t.description}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">전송할 메시지</label>
                <textarea
                  value={kakaoForm.customMessage}
                  onChange={(e) => setKakaoForm({ ...kakaoForm, customMessage: e.target.value })}
                  className="input resize-none"
                  rows={4}
                  placeholder="전송할 메시지 내용을 입력하세요..."
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 text-sm text-blue-600 dark:text-blue-400">
                <p>📱 카카오톡 알림톡으로 전송됩니다</p>
                <p>• 테스트 모드로 동작합니다</p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowSendModal(false)} 
                  className="btn btn-secondary flex-1"
                  disabled={sending}
                >
                  취소
                </button>
                <button 
                  onClick={handleSendKakao} 
                  className="btn btn-primary flex-1"
                  disabled={sending}
                >
                  {sending ? "전송 중..." : "📱 전송"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}