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
  approvedAt?: string;
};

type BarobillFax = {
  id: string;
  mgtNum: string;
  faxNumber: string;
  documentType: string;
  status: string;
  sentAt?: string;
};

const paymentMethods: Record<string, { label: string; icon: string }> = {
  CARD: { label: "카드", icon: "💳" },
  ACCOUNT: { label: "계좌", icon: "🏦" },
  TRANSFER: { label: "이체", icon: "📱" },
  CELLPHONE: { label: "휴대폰", icon: "📲" },
  BOOK: { label: "도서", icon: "📖" },
};

const paymentStatuses: Record<string, { label: string; color: string }> = {
  PAID: { label: "결제완료", color: "bg-green-100 dark:bg-emerald-900/50 text-green-700 dark:text-emerald-400" },
  UNPAID: { label: "미결제", color: "bg-yellow-100 text-yellow-700" },
  REFUNDED: { label: "환불됨", color: "bg-red-100 text-red-700 dark:text-red-400" },
};

const tossPaymentStatuses: Record<string, { label: string; color: string }> = {
  READY: { label: "대기", color: "bg-gray-100 text-gray-700 dark:text-slate-300" },
  IN_PROGRESS: { label: "진행중", color: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400" },
  DONE: { label: "완료", color: "bg-green-100 dark:bg-emerald-900/50 text-green-700 dark:text-emerald-400" },
  CANCELLED: { label: "취소", color: "bg-red-100 text-red-700 dark:text-red-400" },
  FAILED: { label: "실패", color: "bg-orange-100 text-orange-700" },
};

const barobillDocTypes: Record<string, { label: string; icon: string }> = {
  TAX_INVOICE: { label: "전자세금계산서", icon: "🧾" },
  PRICE_CALCULATION: { label: "가격계산서", icon: "📊" },
  CONTRACT: { label: "계약서", icon: "📝" },
  CUSTOM_APPLICATION: { label: "고객 신청서", icon: "📋" },
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [barobillFaxes, setBarobillFaxes] = useState<BarobillFax[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"toss" | "barobill">("toss");
  const [showTossModal, setShowTossModal] = useState(false);
  const [showBarobillModal, setShowBarobillModal] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string>("");
  const [tossForm, setTossForm] = useState({ amount: "", method: "CARD" });
  const [barobillForm, setBarobillForm] = useState({ 
    customerId: "", 
    faxNumber: "", 
    documentType: "TAX_INVOICE",
    taxInvoiceId: ""
  });
  const [customers, setCustomers] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    fetchPayments();
    fetchBarobillFaxes();
    fetchCustomers();
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

  const fetchBarobillFaxes = async () => {
    try {
      // For demo, use mock data since there's no list endpoint
      setBarobillFaxes([]);
    } catch (err) {
      console.error("Failed to fetch barobill faxes:", err);
    }
  };

  const handleTossPaymentRequest = async () => {
    if (!selectedSaleId || !tossForm.amount) {
      alert("결제 금액을 입력해주세요");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/payments/${selectedSaleId}/toss`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          centerId: localStorage.getItem("centerId") || "default-center-id",
          amount: parseInt(tossForm.amount),
          method: tossForm.method,
        }),
      });
      const data = await res.json();
      
      // Request TossPay payment
      const paymentRes = await fetch(`${API_BASE}/api/payments/toss/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: data.tossPayment.orderId }),
      });
      const paymentData = await paymentRes.json();
      
      alert(`토스페이 결제 요청 완료!\n주문ID: ${data.tossPayment.orderId}\n결제URL: ${paymentData.paymentUrl}`);
      setShowTossModal(false);
      setTossForm({ amount: "", method: "CARD" });
      fetchPayments();
    } catch (err) {
      alert("토스페이 결제 요청에 실패했습니다");
    }
  };

  const handleTossPaymentConfirm = async (orderId: string, amount: number) => {
    try {
      const paymentKey = prompt("토스Paiement paymentKey를 입력하세요:");
      if (!paymentKey) return;
      
      await fetch(`${API_BASE}/api/payments/toss/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paymentKey, amount }),
      });
      alert("결제가 완료되었습니다");
      fetchPayments();
    } catch (err) {
      alert("결제确认에 실패했습니다");
    }
  };

  const handleTossPaymentCancel = async (orderId: string) => {
    if (!confirm("이 결제를 취소하시겠습니까?")) return;
    try {
      const reason = prompt("취소 사유를 입력하세요:") || "사용자 취소";
      await fetch(`${API_BASE}/api/payments/toss/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, cancelReason: reason }),
      });
      alert("결제가 취소되었습니다");
      fetchPayments();
    } catch (err) {
      alert("결제 취소에 실패했습니다");
    }
  };

  const handleBarobillFaxSend = async () => {
    if (!barobillForm.customerId || !barobillForm.faxNumber) {
      alert("고객과 Fax번호를 입력해주세요");
      return;
    }
    try {
      const mgtNum = `HM${Date.now()}`;
      await fetch(`${API_BASE}/api/payments/barobill/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          centerId: localStorage.getItem("centerId") || "default-center-id",
          customerId: barobillForm.customerId,
          faxNumber: barobillForm.faxNumber,
          documentType: barobillForm.documentType,
          mgtNum,
          fileUrl: `file:///tmp/hearlink_faxes/${mgtNum}.pdf`,
        }),
      });
      alert("바로빌 Fax 전송이 요청되었습니다");
      setShowBarobillModal(false);
      setBarobillForm({ customerId: "", faxNumber: "", documentType: "TAX_INVOICE", taxInvoiceId: "" });
    } catch (err) {
      alert("Fax 전송에 실패했습니다");
    }
  };

  const totalAmount = payments.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.paidAmount, 0);
  const unpaidCount = payments.filter(p => p.status === "UNPAID").length;

  if (loading) {
    return <div className="text-center py-8 text-gray-500 dark:text-slate-400">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">결제 관리</h1>
      </div>

      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab("toss")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "toss" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-300"
          }`}
        >
          💳 토스페이 결제
        </button>
        <button
          onClick={() => setActiveTab("barobill")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "barobill" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-300"
          }`}
        >
          📠 바로빌 Fax
        </button>
      </div>

      {activeTab === "toss" && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">총 매출</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">₩{totalAmount.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">입금완료</p>
              <p className="text-2xl font-bold text-green-600 dark:text-emerald-400 mt-1">₩{totalPaid.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">미수금</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">₩{(totalAmount - totalPaid).toLocaleString()}</p>
              {unpaidCount > 0 && <p className="text-xs text-yellow-500 mt-1">{unpaidCount}건 미결제</p>}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            {payments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-4">💳</div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">결제 기록이 없습니다</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">고객 상세 페이지에서 결제를 등록해보세요</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">고객</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">총액</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">입금액</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">미수금</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">상태</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">토스결제</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((payment) => {
                    const statusInfo = paymentStatuses[payment.status] || paymentStatuses.UNPAID;
                    const tossPayment = payment.tossPayments?.[0];
                    const tossStatusInfo = tossPayment ? (tossPaymentStatuses[tossPayment.status] || tossPaymentStatuses.READY) : null;
                    
                    return (
                      <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                          {payment.customer?.name || "고객 없음"}
                        </td>
                        <td className="px-6 py-4 text-slate-900 dark:text-slate-100">₩{payment.totalAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-green-600 dark:text-emerald-400">₩{payment.paidAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-yellow-600">₩{(payment.totalAmount - payment.paidAmount).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {tossPayment ? (
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${tossStatusInfo?.color}`}>
                                {tossStatusInfo?.label}
                              </span>
                              {tossPayment.method && (
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  {paymentMethods[tossPayment.method]?.icon}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">없음</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {!tossPayment && payment.status !== "PAID" && (
                              <button
                                onClick={() => {
                                  setSelectedSaleId(payment.id);
                                  setTossForm({ amount: String(payment.totalAmount - payment.paidAmount), method: "CARD" });
                                  setShowTossModal(true);
                                }}
                                className="px-3 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50"
                              >
                                토스 결제
                              </button>
                            )}
                            {tossPayment?.status === "READY" && (
                              <>
                                <button
                                  onClick={() => handleTossPaymentConfirm(tossPayment.orderId, tossPayment.amount)}
                                  className="px-3 py-1 text-xs bg-green-50 dark:bg-emerald-900/30 text-green-600 rounded-lg hover:bg-green-100 dark:hover:bg-emerald-900/50"
                                >
                                  승인
                                </button>
                                <button
                                  onClick={() => handleTossPaymentCancel(tossPayment.orderId)}
                                  className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                >
                                  취소
                                </button>
                              </>
                            )}
                          </div>
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
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">바로빌 Fax 연동</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">세금계산서 및 거래명세표를 바로빌로 Fax 전송합니다</p>
              </div>
              <button
                onClick={() => setShowBarobillModal(true)}
                className="btn btn-primary"
              >
                📠 Fax 전송
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Fax 전송 내역</h3>
            </div>
            {barobillFaxes.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-4">📠</div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Fax 전송 내역이 없습니다</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">세금계산서나 거래명세표를 바로빌로 전송해보세요</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">문서 유형</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">관리번호</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Fax번호</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">상태</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">전송일시</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {barobillFaxes.map((fax) => {
                    const docType = barobillDocTypes[fax.documentType] || barobillDocTypes.TAX_INVOICE;
                    return (
                      <tr key={fax.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span>{docType.icon}</span>
                            <span className="font-medium">{docType.label}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm">{fax.mgtNum}</td>
                        <td className="px-6 py-4">{fax.faxNumber}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            fax.status === "SENT" ? "bg-green-100 dark:bg-emerald-900/50 text-green-700 dark:text-emerald-400" :
                            fax.status === "FAILED" ? "bg-red-100 text-red-700 dark:text-red-400" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {fax.status === "SENT" ? "전송완료" : fax.status === "FAILED" ? "실패" : "대기"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                          {fax.sentAt ? new Date(fax.sentAt).toLocaleDateString("ko-KR") : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TossPay Modal */}
      {showTossModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowTossModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">💳 토스페이 결제</h2>
              <button onClick={() => setShowTossModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-slate-300 dark:text-slate-300">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">결제 금액</label>
                <input
                  type="number"
                  value={tossForm.amount}
                  onChange={(e) => setTossForm({ ...tossForm, amount: e.target.value })}
                  className="input"
                  placeholder="결제할 금액"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">결제 방법</label>
                <select
                  value={tossForm.method}
                  onChange={(e) => setTossForm({ ...tossForm, method: e.target.value })}
                  className="input"
                >
                  <option value="CARD">💳 카드</option>
                  <option value="ACCOUNT">🏦 계좌</option>
                  <option value="TRANSFER">📱 이체</option>
                  <option value="CELLPHONE">📲 휴대폰</option>
                </select>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600 dark:text-slate-400">
                <p>• 토스페이 결제창으로 이동됩니다</p>
                <p>• 결제가 완료되면 자동으로 반영됩니다</p>
                <p>• 테스트 모드로 동작합니다</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowTossModal(false)} className="btn btn-secondary flex-1">취소</button>
                <button onClick={handleTossPaymentRequest} className="btn btn-primary flex-1">결제 요청</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barobill Modal */}
      {showBarobillModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowBarobillModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">📠 바로빌 Fax 전송</h2>
              <button onClick={() => setShowBarobillModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-slate-300 dark:text-slate-300">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">고객</label>
                <select
                  value={barobillForm.customerId}
                  onChange={(e) => setBarobillForm({ ...barobillForm, customerId: e.target.value })}
                  className="input"
                >
                  <option value="">고객 선택</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">문서 유형</label>
                <select
                  value={barobillForm.documentType}
                  onChange={(e) => setBarobillForm({ ...barobillForm, documentType: e.target.value })}
                  className="input"
                >
                  <option value="TAX_INVOICE">🧾 전자세금계산서</option>
                  <option value="PRICE_CALCULATION">📊 가격계산서</option>
                  <option value="CONTRACT">📝 계약서</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Fax 번호</label>
                <input
                  type="tel"
                  value={barobillForm.faxNumber}
                  onChange={(e) => setBarobillForm({ ...barobillForm, faxNumber: e.target.value })}
                  className="input"
                  placeholder="010-0000-0000"
                />
              </div>
              <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600 dark:text-slate-400">
                <p>• 바로빌 연동으로 Fax가 전송됩니다</p>
                <p>• 전송 상태는 내역에서 확인 가능합니다</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowBarobillModal(false)} className="btn btn-secondary flex-1">취소</button>
                <button onClick={handleBarobillFaxSend} className="btn btn-primary flex-1">Fax 전송</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}