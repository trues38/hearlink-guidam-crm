"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

const API_BASE = "http://localhost:3002";

// Labels
const labels = {
  classification: { SELF: "자가", OTHER: "타기관", HEARDOTCOM: "히어닷컴" },
  governmentSupport: { 
    DISABILITY_GRADE_HOLDER: "장애등급소지자", 
    POTENTIAL_DISABILITY: "장애가망", 
    INDUSTRIAL_ACCIDENT: "산업재해", 
    GENERAL: "일반" 
  },
  recipient: { RECIPIENT: "수급자", NEAR_POVERTY: "차상위", GENERAL: "일반" },
  lossType: { CONDUCTIVE: "전음성", SENSORINEURAL: "감각신경성", SUDDEN: "돌발성", NOISE_INDUCED: "소음성" },
  consultationMethod: { CENTER_VISIT: "센터방문", HOME_VISIT: "재택방문", REMOTE: "원격" },
  saleStatus: { PAID: "결제완료", UNPAID: "미결제", REFUNDED: "환불됨" },
  gender: { MALE: "남성", FEMALE: "여성" },
  processType: { PRE_CERTIFICATION: "사전인증", POST_CERTIFICATION: "사후인증" },
  workLogType: {
    CUSTOMER_VISIT: "고객방문",
    PHONE_CALL: "전화상담",
    DEVICE_FITTING: "장비피팅",
    FOLLOW_UP: "후속조치",
    DOCUMENT_PREP: "서류준비",
    MEETING: "회의",
    ADMIN_TASK: "관리업무",
    OTHER: "기타"
  }
};

type Customer = {
  id: string;
  name: string;
  contactNumber: string;
  birthDate?: string;
  gender?: string;
  email?: string;
  residentNumber?: string;
  postalCode?: string;
  addressLine1?: string;
  addressLine2?: string;
  classification?: string;
  governmentSupportType?: string;
  processType?: string;
  recipientType?: string;
  lossType?: string;
  referralSource?: string;
  hospitalName?: string;
  score?: number;
  memo?: string;
  signatureKey?: string;
  signatureDate?: string;
  createdAt: string;
  consultations: any[];
  audiometries: any[];
  schedules: any[];
  sales: any[];
  workLogs: any[];
  documents: any[];
  notifications: any[];
  fittingLogs?: any[];
  computed?: any;
};

type TabType = "info" | "consultations" | "audiometries" | "schedules" | "payments" | "documents" | "worklogs" | "notifications" | "fitting";

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Customer>>({});
  const [centerId, setCenterId] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  // Forms
  const [consultationForm, setConsultationForm] = useState({ content: "", method: "CENTER_VISIT", consultedAt: "" });
  const [audiometryForm, setAudiometryForm] = useState({ lossType: "" });
  const [scheduleForm, setScheduleForm] = useState({ title: "", description: "", scheduledAt: "" });
  const [paymentForm, setPaymentForm] = useState({ totalAmount: "", paidAmount: "0", status: "UNPAID", memo: "" });
  const [workLogForm, setWorkLogForm] = useState({ type: "CUSTOMER_VISIT", content: "" });
  const [fittingForm, setFittingForm] = useState({ brand: "OTICON", model: "", ear: "LEFT", content: "" });

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

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // CRUD Handlers
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
      showSuccess("상담이 등록되었습니다");
    } catch { alert("상담 등록에 실패했습니다"); }
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
      showSuccess("청력검사가 등록되었습니다");
    } catch { alert("청력검사 등록에 실패했습니다"); }
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
      showSuccess("일정이 등록되었습니다");
    } catch { alert("일정 등록에 실패했습니다"); }
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
      showSuccess("결제가 등록되었습니다");
    } catch { alert("결제 등록에 실패했습니다"); }
  };

  const handleWorkLogSubmit = async () => {
    if (!workLogForm.content) return;
    try {
      await fetch(`${API_BASE}/api/worklogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: id, centerId: centerId || "default-center-id", ...workLogForm }),
      });
      setWorkLogForm({ type: "CUSTOMER_VISIT", content: "" });
      fetchCustomer();
      showSuccess("활동이 등록되었습니다");
    } catch { alert("활동 등록에 실패했습니다"); }
  };

  const handleFittingSubmit = async () => {
    if (!fittingForm.model || !fittingForm.content) return;
    try {
      await fetch(`${API_BASE}/api/fittings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: id, ...fittingForm }),
      });
      setFittingForm({ brand: "OTICON", model: "", ear: "LEFT", content: "" });
      fetchCustomer();
      showSuccess("피팅이 등록되었습니다");
    } catch { alert("피팅 등록에 실패했습니다"); }
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
      showSuccess("고객 정보가 수정되었습니다");
    } catch { alert("고객 정보 수정에 실패했습니다"); }
  };

  const handleDelete = async (type: string, itemId: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    try {
      await fetch(`${API_BASE}/api/${type}/${itemId}`, { method: "DELETE" });
      fetchCustomer();
      showSuccess("삭제되었습니다");
    } catch { alert("삭제에 실패했습니다"); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">로딩 중...</div></div>;
  if (error || !customer) return <div className="space-y-4"><button onClick={() => router.push("/customers")} className="text-blue-600 hover:underline">← 목록으로</button><div className="text-red-500">{error || "고객을 찾을 수 없습니다"}</div></div>;

  const tabs: { key: TabType; label: string; count?: number }[] = [
    { key: "info", label: "기본정보" },
    { key: "consultations", label: "상담", count: customer.consultations?.length },
    { key: "audiometries", label: "청력검사", count: customer.audiometries?.length },
    { key: "schedules", label: "일정", count: customer.schedules?.length },
    { key: "payments", label: "결제", count: customer.sales?.length },
    { key: "documents", label: "문서", count: customer.documents?.length },
    { key: "worklogs", label: "활동", count: customer.workLogs?.length },
    { key: "notifications", label: "알림", count: customer.notifications?.length },
    { key: "fitting", label: "피팅", count: customer.fittingLogs?.length },
  ];

  const classificationColors: Record<string, string> = {
    SELF: "bg-blue-100 text-blue-700",
    OTHER: "bg-green-100 text-green-700",
    HEARDOTCOM: "bg-purple-100 text-purple-700"
  };

  return (
    <div className="space-y-4">
      {/* Success Message */}
      {successMsg && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-up">
          ✓ {successMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/customers")} className="text-gray-500 hover:text-gray-700 text-2xl">←</button>
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${classificationColors[(customer.classification || "SELF") as keyof typeof classificationColors]}`}>
            {labels.classification[(customer.classification || "") as keyof typeof labels.classification] || customer.classification}
          </span>
        </div>
        <button onClick={() => setShowEditModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          고객 정보 수정
        </button>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">연락처</p>
          <p className="font-semibold text-lg">{customer.contactNumber}</p>
        </div>
        {customer.birthDate && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">생년월일</p>
            <p className="font-semibold text-lg">{new Date(customer.birthDate).toLocaleDateString("ko-KR")}</p>
          </div>
        )}
        {customer.governmentSupportType && (
  <div className="bg-white rounded-xl shadow-sm p-4">
    <p className="text-sm text-gray-500">정부지원</p>
    <p className="font-semibold text-lg">{labels.governmentSupport[customer.governmentSupportType as keyof typeof labels.governmentSupport] || "-"}</p>
  </div>
        )}
  {customer.recipientType && (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <p className="text-sm text-gray-500">수급구분</p>
      <p className="font-semibold text-lg">{labels.recipient[customer.recipientType as keyof typeof labels.recipient]}</p>
    </div>
  )}
      </div>

      {/* Computed Insights */}
      {customer.computed && (customer.computed.ptaLevel || customer.computed.positionSuggestion) && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm p-4 border border-blue-100">
          <div className="flex flex-wrap gap-3 items-center">
            {customer.computed.ptaLevel && (
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                customer.computed.ptaLevel === 'high' ? 'bg-red-100 text-red-700' : 
                customer.computed.ptaLevel === 'borderline' ? 'bg-yellow-100 text-yellow-700' : 
                'bg-green-100 text-green-700'
              }`}>
                PTA {customer.computed.ptaLevel === 'high' ? '고도' : customer.computed.ptaLevel === 'borderline' ? '경계' : '경미'}
                {customer.computed.ptaDecibel && ` (${customer.computed.ptaDecibel}dB)`}
              </span>
            )}
            {customer.computed.positionSuggestion && (
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-700">
                {customer.computed.positionSuggestion}
              </span>
            )}
            {customer.computed.riskFlags?.map((flag: string, i: number) => (
              <span key={i} className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700">{flag}</span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200 px-4">
          <nav className="flex gap-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button 
                key={tab.key} 
                onClick={() => setActiveTab(tab.key)} 
                className={`py-4 px-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">{tab.count}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 min-h-[400px]">
          {/* INFO TAB */}
          {activeTab === "info" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div><label className="text-sm text-gray-500">이메일</label><p className="font-medium">{customer.email || "-"}</p></div>
          <div><label className="text-sm text-gray-500">성별</label><p className="font-medium">{labels.gender[customer.gender as keyof typeof labels.gender] || "-"}</p></div>
          <div><label className="text-sm text-gray-500">청력장애 유형</label><p className="font-medium">{labels.lossType[customer.lossType as keyof typeof labels.lossType] || "-"}</p></div>
          <div><label className="text-sm text-gray-500">인증 유형</label><p className="font-medium">{labels.processType[customer.processType as keyof typeof labels.processType] || "-"}</p></div>
                <div><label className="text-sm text-gray-500">유입경로</label><p className="font-medium">{customer.referralSource || "-"}</p></div>
                <div><label className="text-sm text-gray-500">병원</label><p className="font-medium">{customer.hospitalName || "-"}</p></div>
                <div><label className="text-sm text-gray-500">주소</label><p className="font-medium">{[customer.addressLine1, customer.addressLine2].filter(Boolean).join(" ") || "-"}</p></div>
                <div><label className="text-sm text-gray-500">우편번호</label><p className="font-medium">{customer.postalCode || "-"}</p></div>
                <div><label className="text-sm text-gray-500">등록일</label><p className="font-medium">{new Date(customer.createdAt).toLocaleDateString("ko-KR")}</p></div>
                {customer.score !== null && customer.score !== undefined && (
                  <div><label className="text-sm text-gray-500">점수</label><p className="font-medium">{customer.score}</p></div>
                )}
              </div>
              {customer.memo && (
                <div className="mt-4">
                  <label className="text-sm text-gray-500">메모</label>
                  <p className="font-medium mt-1 p-4 bg-gray-50 rounded-lg">{customer.memo}</p>
                </div>
              )}
            </div>
          )}

          {/* CONSULTATIONS TAB */}
          {activeTab === "consultations" && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">새 상담 등록</h3>
                <div className="grid grid-cols-3 gap-4">
                  <textarea 
                    placeholder="상담 내용" 
                    value={consultationForm.content} 
                    onChange={(e) => setConsultationForm({ ...consultationForm, content: e.target.value })} 
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none" 
                    rows={3}
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
                  disabled={!consultationForm.content || !consultationForm.consultedAt}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                >
                  상담 등록
                </button>
              </div>
              <div className="space-y-3">
                {customer.consultations?.map((c) => (
                  <div key={c.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex gap-2 items-center mb-2">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">{labels.consultationMethod[c.method as keyof typeof labels.consultationMethod] || c.method}</span>
                          <span className="text-xs text-gray-400">{new Date(c.consultedAt).toLocaleString("ko-KR")}</span>
                        </div>
                        <p className="text-gray-800 whitespace-pre-wrap">{c.content}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button onClick={() => handleDelete("consultations", c.id)} className="text-xs text-red-600 hover:underline">삭제</button>
                      </div>
                    </div>
                  </div>
                ))}
                {(!customer.consultations || customer.consultations.length === 0) && (
                  <div className="text-center py-12 text-gray-400">상담 기록이 없습니다</div>
                )}
              </div>
            </div>
          )}

          {/* AUDIOMETRIES TAB */}
          {activeTab === "audiometries" && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">새 청력검사 등록</h3>
                <div className="flex gap-4 items-center">
                  <select 
                    value={audiometryForm.lossType} 
                    onChange={(e) => setAudiometryForm({ ...audiometryForm, lossType: e.target.value })} 
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 flex-1"
                  >
                    <option value="">선택하세요</option>
                    <option value="CONDUCTIVE">전음성</option>
                    <option value="SENSORINEURAL">감각신경성</option>
                    <option value="SUDDEN">돌발성</option>
                    <option value="NOISE_INDUCED">소음성</option>
                  </select>
                  <button onClick={handleAudiometrySubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    검사 등록
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {customer.audiometries?.map((a) => (
                  <div key={a.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString("ko-KR")}</span>
                        <p className="font-medium mt-1 text-lg">
                          {labels.lossType[a.lossType as keyof typeof labels.lossType] || "유형 미선택"}
                        </p>
                        {a.pureToneResults?.length > 0 && (
                          <p className="text-sm text-gray-500 mt-1">순음역치 결과 {a.pureToneResults.length}건</p>
                        )}
                      </div>
                      <button onClick={() => handleDelete("audiometries", a.id)} className="text-xs text-red-600 hover:underline">삭제</button>
                    </div>
                  </div>
                ))}
                {(!customer.audiometries || customer.audiometries.length === 0) && (
                  <div className="text-center py-12 text-gray-400">청력검사 기록이 없습니다</div>
                )}
              </div>
            </div>
          )}

          {/* SCHEDULES TAB */}
          {activeTab === "schedules" && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">새 일정 등록</h3>
                <div className="grid grid-cols-3 gap-4">
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
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button 
                  onClick={handleScheduleSubmit} 
                  disabled={!scheduleForm.title || !scheduleForm.scheduledAt}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                >
                  일정 등록
                </button>
              </div>
              <div className="space-y-3">
                {customer.schedules?.map((s) => (
                  <div key={s.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex gap-2 items-center mb-1">
                          <span className="font-semibold">{s.title}</span>
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{
                            s.status === 'COMPLETED' ? '완료' : '예정'
                          }</span>
                        </div>
                        <p className="text-sm text-gray-500">{new Date(s.scheduledAt).toLocaleString("ko-KR")}</p>
                        {s.description && <p className="text-sm text-gray-600 mt-1">{s.description}</p>}
                      </div>
                      <button onClick={() => handleDelete("schedules", s.id)} className="text-xs text-red-600 hover:underline ml-4">삭제</button>
                    </div>
                  </div>
                ))}
                {(!customer.schedules || customer.schedules.length === 0) && (
                  <div className="text-center py-12 text-gray-400">일정 기록이 없습니다</div>
                )}
              </div>
            </div>
          )}

          {/* PAYMENTS TAB */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">새 결제 등록</h3>
                <div className="grid grid-cols-4 gap-4">
                  <input 
                    type="number" 
                    placeholder="총액 (원)" 
                    value={paymentForm.totalAmount} 
                    onChange={(e) => setPaymentForm({ ...paymentForm, totalAmount: e.target.value })} 
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input 
                    type="number" 
                    placeholder="입금액 (원)" 
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
                    placeholder="메모 (선택)" 
                    value={paymentForm.memo} 
                    onChange={(e) => setPaymentForm({ ...paymentForm, memo: e.target.value })} 
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button 
                  onClick={handlePaymentSubmit} 
                  disabled={!paymentForm.totalAmount}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                >
                  결제 등록
                </button>
              </div>
              <div className="space-y-3">
                {customer.sales?.map((p) => (
                  <div key={p.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex gap-2 items-center mb-1">
                          <span className="font-semibold text-lg">{Number(p.totalAmount).toLocaleString()}원</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            p.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                            p.status === 'REFUNDED' ? 'bg-red-100 text-red-700' : 
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {labels.saleStatus[p.status as keyof typeof labels.saleStatus]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">입금: {Number(p.paidAmount).toLocaleString()}원</p>
                        {p.memo && <p className="text-sm text-gray-600 mt-1">{p.memo}</p>}
                        <p className="text-xs text-gray-400 mt-1">{new Date(p.createdAt).toLocaleDateString("ko-KR")}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {(!customer.sales || customer.sales.length === 0) && (
                  <div className="text-center py-12 text-gray-400">결제 기록이 없습니다</div>
                )}
              </div>
            </div>
          )}

          {/* DOCUMENTS TAB */}
          {activeTab === "documents" && (
            <div className="space-y-3">
              {customer.documents?.map((d) => (
                <div key={d.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">{d.type}</span>
                      <p className="font-medium mt-2">{d.purpose} - {d.insuranceType}</p>
                      <p className="text-sm text-gray-500 mt-1">키: {d.key}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(d.createdAt).toLocaleDateString("ko-KR")}</p>
                    </div>
                  </div>
                </div>
              ))}
              {(!customer.documents || customer.documents.length === 0) && (
                <div className="text-center py-12 text-gray-400">문서 기록이 없습니다</div>
              )}
            </div>
          )}

          {/* WORKLOGS TAB */}
          {activeTab === "worklogs" && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">새 활동 등록</h3>
                <div className="grid grid-cols-2 gap-4">
                  <select 
                    value={workLogForm.type} 
                    onChange={(e) => setWorkLogForm({ ...workLogForm, type: e.target.value })} 
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CUSTOMER_VISIT">고객방문</option>
                    <option value="PHONE_CALL">전화상담</option>
                    <option value="DEVICE_FITTING">장비피팅</option>
                    <option value="FOLLOW_UP">후속조치</option>
                    <option value="DOCUMENT_PREP">서류준비</option>
                    <option value="MEETING">회의</option>
                    <option value="ADMIN_TASK">관리업무</option>
                    <option value="OTHER">기타</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="활동 내용" 
                    value={workLogForm.content} 
                    onChange={(e) => setWorkLogForm({ ...workLogForm, content: e.target.value })} 
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button 
                  onClick={handleWorkLogSubmit} 
                  disabled={!workLogForm.content}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                >
                  활동 등록
                </button>
              </div>
              <div className="space-y-3">
                {customer.workLogs?.map((w) => (
                  <div key={w.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">{labels.workLogType[w.type as keyof typeof labels.workLogType] || w.type}</span>
                        <p className="font-medium mt-2">{w.content}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(w.createdAt).toLocaleDateString("ko-KR")}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {(!customer.workLogs || customer.workLogs.length === 0) && (
                  <div className="text-center py-12 text-gray-400">활동 기록이 없습니다</div>
                )}
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="space-y-3">
              {customer.notifications?.map((n) => (
                <div key={n.id} className={`border rounded-lg p-4 ${n.isRead ? "border-gray-200" : "border-l-4 border-l-blue-500 bg-blue-50"}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-xs px-2 py-1 rounded ${n.isRead ? "bg-gray-100 text-gray-600" : "bg-blue-100 text-blue-700"}`}>{n.type}</span>
                      <p className="font-medium mt-2">{n.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{n.content}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString("ko-KR")}</p>
                    </div>
                  </div>
                </div>
              ))}
              {(!customer.notifications || customer.notifications.length === 0) && (
                <div className="text-center py-12 text-gray-400">알림이 없습니다</div>
              )}
            </div>
          )}

          {/* FITTING TAB */}
          {activeTab === "fitting" && (
            <div className="space-y-4">
              {/* Add Fitting Form */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-medium text-gray-800 mb-3">새 피팅 등록</h3>
                <div className="grid grid-cols-4 gap-3">
                  <select value={fittingForm.brand} onChange={(e) => setFittingForm({ ...fittingForm, brand: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="OTICON">오티콘</option>
                    <option value="SIGNIA">시그니아</option>
                    <option value="BELTON">벨톤</option>
                    <option value="STARKEY">스타키</option>
                    <option value="PHONAK">포낙</option>
                    <option value="WIDEX">와이드кс</option>
                  </select>
                  <input type="text" value={fittingForm.model} onChange={(e) => setFittingForm({ ...fittingForm, model: e.target.value })} placeholder="모델명" className="px-3 py-2 border border-gray-300 rounded-lg" />
                  <select value={fittingForm.ear} onChange={(e) => setFittingForm({ ...fittingForm, ear: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="LEFT">왼쪽</option>
                    <option value="RIGHT">오른쪽</option>
                  </select>
                  <button onClick={handleFittingSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">등록</button>
                </div>
                <textarea value={fittingForm.content} onChange={(e) => setFittingForm({ ...fittingForm, content: e.target.value })} placeholder="피팅 내용..." className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg" rows={2} />
              </div>

              {/* Fitting Timeline */}
              <div className="space-y-3">
                {(!customer.fittingLogs || customer.fittingLogs.length === 0) ? (
                  <div className="text-center py-12 text-gray-400">피팅 기록이 없습니다</div>
                ) : (
                  [...customer.fittingLogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((f) => (
                    <div key={f.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 text-lg">🎧</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {f.brand === "OTICON" ? "오티콘" : f.brand === "SIGNIA" ? "시그니아" : f.brand === "BELTON" ? "벨톤" : f.brand === "STARKEY" ? "스타키" : f.brand === "PHONAK" ? "포낙" : f.brand === "WIDEX" ? "와이드кс" : f.brand}
                              {' '}{f.model}
                            </p>
                            <p className="text-sm text-gray-500">
                              {f.ear === "LEFT" ? "왼쪽" : "오른쪽"} 귀
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">{new Date(f.createdAt).toLocaleString("ko-KR")}</span>
                      </div>
                      <p className="mt-3 text-gray-600 whitespace-pre-wrap">{f.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">고객 정보 수정</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm text-gray-500">이름</label><input type="text" value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="text-sm text-gray-500">연락처</label><input type="text" value={editForm.contactNumber || ""} onChange={(e) => setEditForm({ ...editForm, contactNumber: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="text-sm text-gray-500">이메일</label><input type="email" value={editForm.email || ""} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="text-sm text-gray-500">생년월일</label><input type="date" value={editForm.birthDate ? String(editForm.birthDate).split("T")[0] : ""} onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="text-sm text-gray-500">성별</label><select value={editForm.gender || ""} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"><option value="">선택</option><option value="MALE">남성</option><option value="FEMALE">여성</option></select></div>
              <div><label className="text-sm text-gray-500">분류</label><select value={editForm.classification || ""} onChange={(e) => setEditForm({ ...editForm, classification: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"><option value="">선택</option><option value="SELF">자가</option><option value="OTHER">타기관</option><option value="HEARDOTCOM">히어닷컴</option></select></div>
              <div><label className="text-sm text-gray-500">정부지원</label><select value={editForm.governmentSupportType || ""} onChange={(e) => setEditForm({ ...editForm, governmentSupportType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"><option value="">선택</option><option value="DISABILITY_GRADE_HOLDER">장애등급소지자</option><option value="POTENTIAL_DISABILITY">장애가망</option><option value="INDUSTRIAL_ACCIDENT">산업재해</option><option value="GENERAL">일반</option></select></div>
              <div><label className="text-sm text-gray-500">수급구분</label><select value={editForm.recipientType || ""} onChange={(e) => setEditForm({ ...editForm, recipientType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"><option value="">선택</option><option value="RECIPIENT">수급자</option><option value="NEAR_POVERTY">차상위</option><option value="GENERAL">일반</option></select></div>
              <div><label className="text-sm text-gray-500">인증유형</label><select value={editForm.processType || ""} onChange={(e) => setEditForm({ ...editForm, processType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"><option value="">선택</option><option value="PRE_CERTIFICATION">사전인증</option><option value="POST_CERTIFICATION">사후인증</option></select></div>
              <div><label className="text-sm text-gray-500">청력장애유형</label><select value={editForm.lossType || ""} onChange={(e) => setEditForm({ ...editForm, lossType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"><option value="">선택</option><option value="CONDUCTIVE">전음성</option><option value="SENSORINEURAL">감각신경성</option><option value="SUDDEN">돌발성</option><option value="NOISE_INDUCED">소음성</option></select></div>
              <div><label className="text-sm text-gray-500">유입경로</label><input type="text" value={editForm.referralSource || ""} onChange={(e) => setEditForm({ ...editForm, referralSource: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="text-sm text-gray-500">병원</label><input type="text" value={editForm.hospitalName || ""} onChange={(e) => setEditForm({ ...editForm, hospitalName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
              <div className="col-span-2"><label className="text-sm text-gray-500">주소</label><input type="text" value={editForm.addressLine1 || ""} onChange={(e) => setEditForm({ ...editForm, addressLine1: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="주소"/></div>
              <div><label className="text-sm text-gray-500">우편번호</label><input type="text" value={editForm.postalCode || ""} onChange={(e) => setEditForm({ ...editForm, postalCode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
              <div className="col-span-2"><label className="text-sm text-gray-500">메모</label><textarea value={editForm.memo || ""} onChange={(e) => setEditForm({ ...editForm, memo: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={3} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">취소</button>
              <button onClick={handleCustomerUpdate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}