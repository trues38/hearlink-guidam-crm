"use client";

import { useState, useEffect } from "react";

const API_BASE = "http://localhost:3002";

type Payment = {
  id: string;
  totalAmount: number;
  paidAmount: number;
  status: string;
  memo?: string;
  createdAt: string;
  tossPayments?: TossPayment[];
  customer?: { id: string; name: string };
};

type TossPayment = {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
};

const paymentMethods: Record<string, { label: string; icon: string }> = {
  CARD: { label: "카드", icon: "💳" },
  ACCOUNT: { label: "계좌", icon: "🏦" },
  TRANSFER: { label: "이체", icon: "📱" },
  CELLPHONE: { label: "휴대폰", icon: "📲" },
  BOOK: { label: "도서", icon: "📖" },
};

const paymentStatuses: Record<string, { label: string; color: string }> = {
  PAID: { label: "결제완료", color: "bg-green-100 text-green-700" },
  UNPAID: { label: "미결제", color: "bg-yellow-100 text-yellow-700" },
  REFUNDED: { label: "환불됨", color: "bg-red-100 text-red-700" },
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"toss" | "barobill">("toss");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/payments?limit=50`);
      const data = await res.json();
      setPayments(data.items || []);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = payments.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.paidAmount, 0);
  const unpaidCount = payments.filter(p => p.status === "UNPAID").length;

  if (loading) {
    return <div className="text-center py-8 text-gray-500">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">결제 관리</h1>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("toss")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "toss" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          💳 토스페이 결제
        </button>
        <button
          onClick={() => setActiveTab("barobill")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "barobill" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          📠 바로빌 Fax
        </button>
      </div>

      {activeTab === "toss" && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
              <p className="text-sm text-slate-500">총 매출</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">₩{totalAmount.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
              <p className="text-sm text-slate-500">입금완료</p>
              <p className="text-2xl font-bold text-green-600 mt-1">₩{totalPaid.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
              <p className="text-sm text-slate-500">미수금</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">₩{(totalAmount - totalPaid).toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {payments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-4">💳</div>
                <h3 className="text-lg font-medium text-slate-900">결제 기록이 없습니다</h3>
                <p className="text-slate-500 mt-1">고객 상세 페이지에서 결제를 등록해보세요</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">고객</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">총액</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">입금액</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">미수금</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">상태</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">일시</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((payment) => {
                    const statusInfo = paymentStatuses[payment.status] || paymentStatuses.UNPAID;
                    return (
                      <tr key={payment.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {payment.customer?.name || "고객 없음"}
                        </td>
                        <td className="px-6 py-4 text-slate-900">₩{payment.totalAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-green-600">₩{payment.paidAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-yellow-600">₩{(payment.totalAmount - payment.paidAmount).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(payment.createdAt).toLocaleDateString("ko-KR")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {activeTab === "barobill" && (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-slate-200">
          <div className="text-4xl mb-4">📠</div>
          <h3 className="text-lg font-medium text-slate-900">바로빌 Fax 전송</h3>
          <p className="text-slate-500 mt-1">세금계산서 및 거래명세표를 바로빌로 Fax 전송합니다</p>
          <button className="mt-4 btn btn-primary">Fax 전송 설정</button>
        </div>
      )}
    </div>
  );
}
