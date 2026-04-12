"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_BASE = "http://localhost:3002";

type Customer = {
  id: string;
  name: string;
  contactNumber: string;
  classification?: string;
  createdAt: string;
};

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [centerId, setCenterId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    contactNumber: "",
    classification: "SELF",
    birthDate: "",
    gender: "",
    email: "",
    memo: "",
  });

  useEffect(() => {
    fetchCenterAndCustomers();
  }, []);

  const fetchCenterAndCustomers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/center/me`);
      if (res.ok) {
        const data = await res.json();
        setCenterId(data.id);
        localStorage.setItem("centerId", data.id);
      }
    } catch (err) {
      console.error("Failed to fetch center:", err);
    }
    fetchCustomers();
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/customers?limit=100`);
      const data = await res.json();
      setCustomers(data.items || []);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.contactNumber) {
      alert("이름과 연락처는 필수입니다");
      return;
    }
    try {
      await fetch(`${API_BASE}/api/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          centerId: "default-center-id",
          name: form.name,
          contactNumber: form.contactNumber,
          classification: form.classification,
          birthDate: form.birthDate || undefined,
          gender: form.gender || undefined,
          email: form.email || undefined,
          memo: form.memo || undefined,
        }),
      });
      setShowModal(false);
      setForm({ name: "", contactNumber: "", classification: "SELF", birthDate: "", gender: "", email: "", memo: "" });
      fetchCustomers();
    } catch (err) {
      alert("고객 등록에 실패했습니다");
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.includes(searchTerm) || c.contactNumber.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-10 w-36 bg-slate-200 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">고객 관리</h1>
          <p className="text-sm text-slate-500 mt-1">총 {customers.length}명의 고객</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary shadow-lg shadow-blue-500/30"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          새 고객 등록
        </button>
      </div>

      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="이름 또는 연락처로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-12 py-3 shadow-sm"
        />
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">등록된 고객이 없습니다</h3>
          <p className="text-slate-500 mb-6">첫 번째 고객을 등록해보세요</p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            + 새 고객 등록
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer group"
              onClick={() => router.push(`/customers/${customer.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {customer.name.charAt(0)}
                </div>
                <span className={`badge ${
                  customer.classification === "SELF"
                    ? "badge-blue"
                    : customer.classification === "OTHER"
                    ? "badge-green"
                    : "badge-purple"
                }`}>
                  {customer.classification === "SELF"
                    ? "자가"
                    : customer.classification === "OTHER"
                    ? "타기관"
                    : "히어닷컴"}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                {customer.name}
              </h3>
              <p className="text-sm text-slate-500 mt-1">{customer.contactNumber}</p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-400">
                  {new Date(customer.createdAt).toLocaleDateString("ko-KR")}
                </span>
                <span className="text-sm font-medium text-blue-600 group-hover:translate-x-1 transition-transform">
                  상세 보기 →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="modal-content w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">새 고객 등록</h2>
                </div>
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
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input"
                  placeholder="홍길동"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  연락처 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.contactNumber}
                  onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                  placeholder="010-1234-5678"
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">구분</label>
                <select
                  value={form.classification}
                  onChange={(e) => setForm({ ...form, classification: e.target.value })}
                  className="input"
                >
                  <option value="SELF">자가</option>
                  <option value="OTHER">타기관</option>
                  <option value="HEARDOTCOM">히어닷컴</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">생년월일</label>
                  <input
                    type="date"
                    value={form.birthDate}
                    onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">성별</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="input"
                  >
                    <option value="">선택</option>
                    <option value="MALE">남성</option>
                    <option value="FEMALE">여성</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">이메일</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">메모</label>
                <textarea
                  value={form.memo}
                  onChange={(e) => setForm({ ...form, memo: e.target.value })}
                  className="input resize-none"
                  rows={3}
                  placeholder="추가 메모..."
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
