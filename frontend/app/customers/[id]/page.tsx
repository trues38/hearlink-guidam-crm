"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

type Customer = {
  id: string;
  name: string;
  contactNumber: string;
  birthDate?: string;
  gender?: string;
  email?: string;
  classification?: string;
  governmentSupportType?: string;
  processType?: string;
  recipientType?: string;
  lossType?: string;
  referralSource?: string;
  hospitalName?: string;
  memo?: string;
  createdAt: string;
  consultations: Consultation[];
  audiometries: Audiometry[];
  schedules: Schedule[];
  payments: Sale[];
  sales: Sale[];
  workLogs: WorkLog[];
  documents: Document[];
  notifications: Notification[];
  computed?: {
    ptaLevel?: string;
    ptaDecibel?: number;
    positionSuggestion?: string;
    riskFlags?: string[];
    nextActions?: string[];
  };
};

type Consultation = {
  id: string;
  content: string;
  method: string;
  consultedAt: string;
};

type PureToneResult = {
  id: string;
  ear: string;
  testType: string;
  frequency: number;
  decibel: number;
};

type SpeechTestResult = {
  id: string;
  ear: string;
  decibel: number;
  percentage: number;
};

type Audiometry = {
  id: string;
  lossType?: string;
  createdAt: string;
  pureToneResults: PureToneResult[];
  speechTestResults: SpeechTestResult[];
};

type TossPayment = {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  status: string;
  approvedAt?: string;
};

type Sale = {
  id: string;
  totalAmount: number;
  paidAmount: number;
  memo?: string;
  status: string;
  createdAt: string;
  tossPayments: TossPayment[];
};

type Schedule = {
  id: string;
  title: string;
  description?: string;
  scheduledAt: string;
  status: string;
};

type WorkLog = {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  user?: { name: string };
};

type Document = {
  id: string;
  purpose: string;
  insuranceType: string;
  type: string;
  createdAt: string;
};

type Notification = {
  id: string;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
};

type TabType = "info" | "consultations" | "audiometries" | "schedules" | "payments" | "documents" | "worklogs" | "notifications";

const API_BASE = "http://localhost:3002";

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

const lossTypeLabels: Record<string, string> = {
  CONDUCTIVE: "전음성",
  SENSORINEURAL: "감각신경성",
  SUDDEN: "돌발성",
  NOISE_INDUCED: "소음성",
};

const consultationMethodLabels: Record<string, string> = {
  CENTER_VISIT: "센터방문",
  HOME_VISIT: "재택방문",
  REMOTE: "원격",
};

const saleStatusLabels: Record<string, string> = {
  PAID: "결제완료",
  UNPAID: "미결제",
  REFUNDED: "환불됨",
};

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [showEditModal, setShowEditModal] = useState(false);
  const [consultationForm, setConsultationForm] = useState({ content: "", method: "CENTER_VISIT", consultedAt: "" });
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [audiometryForm, setAudiometryForm] = useState({ lossType: "" });
  const [scheduleForm, setScheduleForm] = useState({ title: "", description: "", scheduledAt: "" });
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ totalAmount: "", paidAmount: "0", status: "UNPAID", memo: "" });
  const [editingPayment, setEditingPayment] = useState<Sale | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [workLogForm, setWorkLogForm] = useState({ type: "CUSTOMER_VISIT", content: "" });
  const [editForm, setEditForm] = useState<Customer | null>(null);
  const [centerId, setCenterId] = useState<string>("");

  useEffect(() => {
    const stored = localStorage.getItem("centerId");
    if (stored) setCenterId(stored);
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/customers/${id}`);
      if (!res.ok) throw new Error("고객 정보를 불러오는데 실패했습니다");
      const data = await res.json();
      setCustomer(data);
      setEditForm(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleConsultationSubmit = async () => {
    if (!consultationForm.content || !consultationForm.consultedAt) return;
    try {
      await fetch(`${API_BASE}/api/consultations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: id, ...consultationForm }),
      });
      setConsultationForm({ content: "", method: "CENTER_VISIT", consultedAt: "" });
      fetchCustomer();
    } catch (err) {
      alert("상담 등록에 실패했습니다");
    }
  };

  const handleAudiometrySubmit = async () => {
    try {
      await fetch(`${API_BASE}/api/audiometries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: id, lossType: audiometryForm.lossType || undefined }),
      });
      setAudiometryForm({ lossType: "" });
      fetchCustomer();
    } catch (err) {
      alert("청력검사 등록에 실패했습니다");
    }
  };

  const handleScheduleSubmit = async () => {
    if (!scheduleForm.title || !scheduleForm.scheduledAt) return;
    try {
      await fetch(`${API_BASE}/api/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: id, centerId: centerId || "default-center-id", ...scheduleForm }),
      });
      setScheduleForm({ title: "", description: "", scheduledAt: "" });
      fetchCustomer();
    } catch (err) {
      alert("일정 등록에 실패했습니다");
    }
  };

  const handlePaymentSubmit = async () => {
    if (!paymentForm.totalAmount) return;
    try {
      await fetch(`${API_BASE}/api/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: id, centerId: centerId || "default-center-id", ...paymentForm }),
      });
      setPaymentForm({ totalAmount: "", paidAmount: "0", status: "UNPAID", memo: "" });
      fetchCustomer();
    } catch (err) {
      alert("결제 등록에 실패했습니다");
    }
  };

  const handleWorkLogSubmit = async () => {
    if (!workLogForm.content) return;
    return;
    try {
      await fetch(`${API_BASE}/api/worklogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: id, centerId: centerId || "default-center-id", ...workLogForm }),
      });
      setWorkLogForm({ type: "CUSTOMER_VISIT", content: "" });
      fetchCustomer();
    } catch (err) {
      alert("활동 등록에 실패했습니다");
    }
  };

  const handleCustomerUpdate = async () => {
    if (!editForm) return;
    try {
      await fetch(`${API_BASE}/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      setShowEditModal(false);
      fetchCustomer();
    } catch (err) {
      alert("고객 정보 수정에 실패했습니다");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.push("/customers")} className="text-blue-600 hover:underline">
          ← 목록으로
        </button>
        <div className="text-red-500">{error || "고객을 찾을 수 없습니다"}</div>
      </div>
    );
  }

  const tabs: { key: TabType; label: string; count?: number }[] = [
    { key: "info", label: "기본정보" },
    { key: "consultations", label: "상담", count: customer.consultations?.length },
    { key: "audiometries", label: "청력검사", count: customer.audiometries?.length },
    { key: "schedules", label: "일정", count: customer.schedules?.length },
    { key: "payments", label: "결제", count: customer.payments?.length },
    { key: "documents", label: "문서", count: customer.documents?.length },
    { key: "worklogs", label: "활동", count: customer.workLogs?.length },
    { key: "notifications", label: "알림", count: customer.notifications?.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/customers")} className="text-gray-500 hover:text-gray-700">
            ← 목록으로
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            customer.classification === "SELF" ? "bg-blue-100 text-blue-700" :
            customer.classification === "OTHER" ? "bg-green-100 text-green-700" :
            "bg-purple-100 text-purple-700"
          }`}>
            {classificationLabels[customer.classification || ""] || customer.classification}
          </span>
        </div>
        <button
          onClick={() => setShowEditModal(true)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          고객 정보 수정
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">연락처</span>
            <p className="font-medium">{customer.contactNumber}</p>
          </div>
          {customer.birthDate && (
            <div>
              <span className="text-gray-500">생년월일</span>
              <p className="font-medium">{new Date(customer.birthDate).toLocaleDateString("ko-KR")}</p>
            </div>
          )}
          {customer.governmentSupportType && (
            <div>
              <span className="text-gray-500">정부지원</span>
              <p className="font-medium">{governmentSupportLabels[customer.governmentSupportType]}</p>
            </div>
          )}
          {customer.recipientType && (
            <div>
              <span className="text-gray-500">수급구분</span>
              <p className="font-medium">{recipientLabels[customer.recipientType]}</p>
            </div>
)}
      </div>

      {customer.computed && (customer.computed.ptaLevel || customer.computed.positionSuggestion || customer.computed.riskFlags?.length > 0 || customer.computed.nextActions?.length > 0) && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm p-4 border border-blue-100">
          <div className="flex flex-wrap gap-4 items-start">
            {customer.computed.ptaLevel && (
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  customer.computed.ptaLevel === 'high' ? 'bg-red-100 text-red-700' :
                  customer.computed.ptaLevel === 'borderline' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  PTA {customer.computed.ptaLevel === 'high' ? '고도' : customer.computed.ptaLevel === 'borderline' ? '경계' : '경미'}
                </span>
                {customer.computed.ptaDecibel && (
                  <span className="text-sm text-gray-600">{customer.computed.ptaDecibel}dB</span>
                )}
              </div>
            )}
            {customer.computed.positionSuggestion && (
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                  {customer.computed.positionSuggestion}
                </span>
              </div>
            )}
            {customer.computed.riskFlags?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {customer.computed.riskFlags.map((flag, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-700">
                    {flag}
                  </span>
                ))}
              </div>
            )}
            {customer.computed.nextActions?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {customer.computed.nextActions.map((action, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">
                    {action}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">연락처</span>
            <p className="font-medium">{customer.contactNumber}</p>
          </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 min-h-[400px]">
        {activeTab === "info" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">기본 정보</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-500">이메일</label>
                <p className="font-medium">{customer.email || "-"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">성별</label>
                <p className="font-medium">{customer.gender === "MALE" ? "남성" : customer.gender === "FEMALE" ? "여성" : "-"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">청력장애 유형</label>
                <p className="font-medium">{lossTypeLabels[customer.lossType || ""] || "-"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">유입경로</label>
                <p className="font-medium">{customer.referralSource || "-"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">병원</label>
                <p className="font-medium">{customer.hospitalName || "-"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">등록일</label>
                <p className="font-medium">{new Date(customer.createdAt).toLocaleDateString("ko-KR")}</p>
              </div>
            </div>
            {customer.memo && (
              <div className="mt-4">
                <label className="text-sm text-gray-500">메모</label>
                <p className="font-medium mt-1 p-3 bg-gray-50 rounded-lg">{customer.memo}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "consultations" && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">새 상담 등록</h3>
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="상담 내용"
                  value={consultationForm.content}
                  onChange={(e) => setConsultationForm({ ...consultationForm, content: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={consultationForm.method}
                  onChange={(e) => setConsultationForm({ ...consultationForm, method: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CENTER_VISIT">센터방문</option>
                  <option value="HOME_VISIT">재택방문</option>
                  <option value="REMOTE">원격</option>
                </select>
                <input
                  type="datetime-local"
                  value={consultationForm.consultedAt}
                  onChange={(e) => setConsultationForm({ ...consultationForm, consultedAt: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleConsultationSubmit}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                상담 등록
              </button>
            </div>

            <div className="space-y-3">
              {customer.consultations?.map((c) => (
                <div key={c.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex gap-2 items-center mb-2">
                        <span className="text-xs text-gray-500">{consultationMethodLabels[c.method] || c.method}</span>
                        <span className="text-xs text-gray-400">{new Date(c.consultedAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm">{c.content}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingConsultation(c); setConsultationForm({ content: c.content, method: c.method, consultedAt: c.consultedAt.split('T')[0] }); setShowConsultationModal(true); }}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        수정
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm('삭제하시겠습니까?')) return;
                          await fetch(`${API_BASE}/api/consultations/${c.id}`, { method: 'DELETE' });
                          fetchCustomer();
                        }}
                        className="text-xs text-red-600 hover:underline"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {(!customer.consultations || customer.consultations.length === 0) && (
                <p className="text-gray-500 text-center py-8">상담 기록이 없습니다</p>
              )}
            </div>
          </div>
        )}

        {showConsultationModal && editingConsultation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
              <h3 className="font-medium">상담 수정</h3>
              <textarea
                value={consultationForm.content}
                onChange={(e) => setConsultationForm({ ...consultationForm, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={4}
              />
              <select
                value={consultationForm.method}
                onChange={(e) => setConsultationForm({ ...consultationForm, method: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="CENTER_VISIT">센터방문</option>
                <option value="HOME_VISIT">재택방문</option>
                <option value="REMOTE">원격</option>
              </select>
              <input
                type="date"
                value={consultationForm.consultedAt}
                onChange={(e) => setConsultationForm({ ...consultationForm, consultedAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <div className="flex gap-3 justify-end">
                <button onClick={() => { setShowConsultationModal(false); setEditingConsultation(null); }} className="px-4 py-2 text-gray-600">취소</button>
                <button
                  onClick={async () => {
                    await fetch(`${API_BASE}/api/consultations/${editingConsultation.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(consultationForm),
                    });
                    setShowConsultationModal(false);
                    setEditingConsultation(null);
                    fetchCustomer();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "audiometries" && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">새 청력검사 등록</h3>
              <div className="flex gap-4">
                <select
                  value={audiometryForm.lossType}
                  onChange={(e) => setAudiometryForm({ ...audiometryForm, lossType: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택하세요</option>
                  <option value="CONDUCTIVE">전음성</option>
                  <option value="SENSORINEURAL">감각신경성</option>
                  <option value="SUDDEN">돌발성</option>
                  <option value="NOISE_INDUCED">소음성</option>
                </select>
                <button
                  onClick={handleAudiometrySubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  청력검사 등록
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {customer.audiometries?.map((a) => (
                <div key={a.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                      {lossTypeLabels[a.lossType || ""] || "유형미지정"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(a.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                  {a.pureToneResults && a.pureToneResults.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">순음역치:</span>{" "}
                      {a.pureToneResults.length}개 측정값
                    </div>
                  )}
                </div>
              ))}
              {(!customer.audiometries || customer.audiometries.length === 0) && (
                <p className="text-gray-500 text-center py-8">청력검사 기록이 없습니다</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "schedules" && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">새 일정 등록</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="일정 제목"
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="datetime-local"
                  value={scheduleForm.scheduledAt}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="설명 (선택)"
                  value={scheduleForm.description}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 col-span-2"
                />
              </div>
              <button
                onClick={handleScheduleSubmit}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                일정 등록
              </button>
            </div>
            <div className="space-y-3">
              {customer.schedules?.length === 0 && (
                <p className="text-gray-500 text-center py-8">일정 기록이 없습니다</p>
              )}
              {customer.schedules?.map((s) => (
                <div key={s.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex gap-2 items-center mb-1">
                        <span className="font-medium">{s.title}</span>
                        <span className={`px-2 py-0.5 text-xs rounded ${s.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {s.status === 'COMPLETED' ? '완료' : '예정'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{new Date(s.scheduledAt).toLocaleString()}</p>
                      {s.description && <p className="text-sm text-gray-600 mt-1">{s.description}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingSchedule(s); setScheduleForm({ title: s.title, description: s.description || '', scheduledAt: s.scheduledAt.slice(0, 16) }); setShowScheduleModal(true); }}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        수정
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm('삭제하시겠습니까?')) return;
                          await fetch(`${API_BASE}/api/schedules/${s.id}`, { method: 'DELETE' });
                          fetchCustomer();
                        }}
                        className="text-xs text-red-600 hover:underline"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showScheduleModal && editingSchedule && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
              <h3 className="font-medium">일정 수정</h3>
              <input type="text" value={scheduleForm.title} onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              <input type="datetime-local" value={scheduleForm.scheduledAt} onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              <input type="text" placeholder="설명" value={scheduleForm.description} onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              <div className="flex gap-3 justify-end">
                <button onClick={() => { setShowScheduleModal(false); setEditingSchedule(null); }} className="px-4 py-2 text-gray-600">취소</button>
                <button
                  onClick={async () => {
                    await fetch(`${API_BASE}/api/schedules/${editingSchedule.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(scheduleForm),
                    });
                    setShowScheduleModal(false);
                    setEditingSchedule(null);
                    fetchCustomer();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">새 결제 등록</h3>
              <div className="grid grid-cols-4 gap-4">
                <input
                  type="number"
                  placeholder="총액"
                  value={paymentForm.totalAmount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, totalAmount: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="입금액"
                  value={paymentForm.paidAmount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paidAmount: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={paymentForm.status}
                  onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="UNPAID">미결제</option>
                  <option value="PAID">결제완료</option>
                  <option value="REFUNDED">환불됨</option>
                </select>
                <input
                  type="text"
                  placeholder="메모"
                  value={paymentForm.memo}
                  onChange={(e) => setPaymentForm({ ...paymentForm, memo: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handlePaymentSubmit}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                결제 등록
              </button>
            </div>

            <div className="space-y-3">
              {customer.payments?.map((s) => (
                <div key={s.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex gap-2 items-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          s.status === "PAID" ? "bg-green-100 text-green-700" :
                          s.status === "UNPAID" ? "bg-yellow-100 text-yellow-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {saleStatusLabels[s.status] || s.status}
                        </span>
                        <span className="font-medium">
                          {s.totalAmount.toLocaleString()}원
                        </span>
                      </div>
                      {s.memo && <p className="text-sm text-gray-500 mt-1">{s.memo}</p>}
                    </div>
                    <button
                      onClick={() => {
                        setEditingPayment(s);
                        setPaymentForm({ totalAmount: String(s.totalAmount), paidAmount: String(s.paidAmount), status: s.status, memo: s.memo || '' });
                        setShowPaymentModal(true);
                      }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      수정
                    </button>
                  </div>
                  <div className="mt-2 flex justify-between items-start">
                    <div className="text-right text-sm">
                      <p className="text-gray-500">
                        입금: {s.paidAmount.toLocaleString()}원
                      </p>
                      <p className="text-gray-500">
                        미수금: {(s.totalAmount - s.paidAmount).toLocaleString()}원
                      </p>
                    </div>
                  </div>
                  {s.tossPayments && s.tossPayments.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">토스페이먼트 결제 {s.tossPayments.length}건</p>
                    </div>
                  )}
                </div>
              ))}
              {(!customer.payments || customer.payments.length === 0) && (
                <p className="text-gray-500 text-center py-8">결제 기록이 없습니다</p>
              )}
            </div>
          </div>
        )}

        {showPaymentModal && editingPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
              <h3 className="font-medium">결제 수정</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">총액</label>
                  <input type="number" value={paymentForm.totalAmount} onChange={(e) => setPaymentForm({ ...paymentForm, totalAmount: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">입금액</label>
                  <input type="number" value={paymentForm.paidAmount} onChange={(e) => setPaymentForm({ ...paymentForm, paidAmount: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">상태</label>
                <select value={paymentForm.status} onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="UNPAID">미결제</option>
                  <option value="PAID">결제완료</option>
                  <option value="REFUNDED">환불됨</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">메모</label>
                <input type="text" value={paymentForm.memo} onChange={(e) => setPaymentForm({ ...paymentForm, memo: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => { setShowPaymentModal(false); setEditingPayment(null); }} className="px-4 py-2 text-gray-600">취소</button>
                <button
                  onClick={async () => {
                    await fetch(`${API_BASE}/api/payments/${editingPayment.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        totalAmount: parseInt(paymentForm.totalAmount),
                        paidAmount: parseInt(paymentForm.paidAmount),
                        status: paymentForm.status,
                        memo: paymentForm.memo,
                      }),
                    });
                    setShowPaymentModal(false);
                    setEditingPayment(null);
                    fetchCustomer();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-3">
            {customer.documents?.map((d) => (
              <div key={d.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                      {d.type}
                    </span>
                    <p className="mt-2 font-medium">{d.purpose}</p>
                    <p className="text-sm text-gray-500">{d.insuranceType}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(d.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
              </div>
            ))}
            {(!customer.documents || customer.documents.length === 0) && (
              <p className="text-gray-500 text-center py-8">문서 기록이 없습니다</p>
            )}
          </div>
        )}

        {activeTab === "worklogs" && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-medium mb-3">새 활동 등록</h3>
              <div className="flex gap-3">
                <select
                  value={workLogForm.type}
                  onChange={(e) => setWorkLogForm({ ...workLogForm, type: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CUSTOMER_VISIT">고객 방문</option>
                  <option value="PHONE_CALL">전화</option>
                  <option value="DEVICE_FITTING">장비 피팅</option>
                  <option value="FOLLOW_UP">후속 조치</option>
                  <option value="DOCUMENT_PREP">문서 준비</option>
                  <option value="MEETING">회의</option>
                  <option value="ADMIN_TASK">행정 업무</option>
                  <option value="OTHER">기타</option>
                </select>
                <input
                  type="text"
                  placeholder="활동 내용"
                  value={workLogForm.content}
                  onChange={(e) => setWorkLogForm({ ...workLogForm, content: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleWorkLogSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  등록
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {customer.workLogs?.map((w) => (
                <div key={w.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded">
                        {w.type === "CUSTOMER_VISIT" ? "고객 방문" :
                         w.type === "PHONE_CALL" ? "전화" :
                         w.type === "DEVICE_FITTING" ? "장비 피팅" :
                         w.type === "FOLLOW_UP" ? "후속 조치" :
                         w.type === "DOCUMENT_PREP" ? "문서 준비" :
                         w.type === "MEETING" ? "회의" :
                         w.type === "ADMIN_TASK" ? "행정 업무" : "기타"}
                      </span>
                      <p className="mt-2 text-gray-900">{w.content}</p>
                      {w.user && <p className="text-sm text-gray-500">{w.user.name}</p>}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(w.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                </div>
              ))}
              {(!customer.workLogs || customer.workLogs.length === 0) && (
                <p className="text-gray-500 text-center py-8">활동 기록이 없습니다</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-3">
            {customer.notifications?.map((n) => (
              <div key={n.id} className={`border rounded-lg p-4 ${n.isRead ? "border-gray-200" : "border-blue-200 bg-blue-50"}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      n.isRead ? "bg-gray-100 text-gray-600" : "bg-blue-100 text-blue-700"
                    }`}>
                      {n.type}
                    </span>
                    <p className="mt-2 font-medium">{n.title}</p>
                    <p className="text-sm text-gray-600">{n.content}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(n.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
              </div>
            ))}
            {(!customer.notifications || customer.notifications.length === 0) && (
              <p className="text-gray-500 text-center py-8">알림이 없습니다</p>
            )}
          </div>
        )}
      </div>

      {showEditModal && editForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">고객 정보 수정</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">이름</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500">연락처</label>
                <input
                  type="text"
                  value={editForm.contactNumber}
                  onChange={(e) => setEditForm({ ...editForm, contactNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500">이메일</label>
                <input
                  type="email"
                  value={editForm.email || ""}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500">생년월일</label>
                <input
                  type="date"
                  value={editForm.birthDate ? editForm.birthDate.split("T")[0] : ""}
                  onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-500">메모</label>
                <textarea
                  value={editForm.memo || ""}
                  onChange={(e) => setEditForm({ ...editForm, memo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={handleCustomerUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
