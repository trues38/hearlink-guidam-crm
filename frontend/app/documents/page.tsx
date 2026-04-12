"use client";

import { useState, useEffect } from "react";

const API_BASE = "http://localhost:3002";

type Document = {
  id: string;
  type: string;
  purpose: string;
  insuranceType: string;
  key: string;
  createdAt: string;
  customer?: { id: string; name: string };
};

const documentTypes: Record<string, { label: string; icon: string }> = {
  TAX_INVOICE: { label: "전자세금계산서", icon: "🧾" },
  TRANSACTION_STATEMENT: { label: "거래명세표", icon: "📊" },
  DEVICE_CLAIM: { label: "보조기기 급여청구서", icon: "💰" },
  STANDARD_CONTRACT: { label: "표준계약서", icon: "📝" },
  PRESCRIPTION: { label: "처방전", icon: "📋" },
  CONFORMITY_CLAIM: { label: "적합관리 급여청구서", icon: "✅" },
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/documents?limit=50`);
      const data = await res.json();
      setDocuments(data.items || []);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">문서 관리</h1>
          <p className="text-sm text-slate-500 mt-1">총 {documents.length}건</p>
        </div>
        <button className="btn btn-primary shadow-lg shadow-blue-500/30">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          새 문서 생성
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {Object.entries(documentTypes).map(([key, { label, icon }]) => (
          <button
            key={key}
            className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:shadow-lg hover:border-blue-200 transition-all text-left"
          >
            <div className="text-3xl mb-3">{icon}</div>
            <h3 className="font-medium text-slate-900">{label}</h3>
            <p className="text-sm text-slate-500 mt-1">새로 생성</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">생성된 문서 목록</h2>
        </div>
        {documents.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-lg font-medium text-slate-900">문서가 없습니다</h3>
            <p className="text-slate-500 mt-1">첫 번째 문서를 생성해보세요</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">문서 유형</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">키</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">생성일</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map((doc) => {
                const typeInfo = documentTypes[doc.type] || { label: doc.type, icon: "📄" };
                return (
                  <tr key={doc.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{typeInfo.icon}</span>
                        <span className="font-medium text-slate-900">{typeInfo.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-sm">{doc.key}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(doc.createdAt).toLocaleDateString("ko-KR")}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">미리보기</button>
                        <button className="px-3 py-1 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">다운로드</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
