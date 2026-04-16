"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API_BASE = "http://localhost:3002";

interface PTAResult {
  ptaLeft: { pta: number | null; breakdown: Record<string, number> } | null;
  ptaRight: { pta: number | null; breakdown: Record<string, number> } | null;
  gradeLeft: string | null;
  gradeRight: string | null;
  overallGrade: string;
}

interface Customer {
  id: string;
  name: string;
  contactNumber: string;
  recipientType?: string;
  governmentSupportType?: string;
}

interface GovernmentTrack {
  track: string;
  description: string;
  coverage: string;
  submissionMethod: string;
}

interface NextActions {
  position: { position: string; confidence: number; recommendation: string };
  governmentTrack: GovernmentTrack;
  ptaGrade: string | null;
  actions: Array<{
    type: string;
    title: string;
    description: string;
    priority: number;
    dueDays: number;
  }>;
}

export default function GovernmentSupportCalculator() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [ptaResult, setPtaResult] = useState<PTAResult | null>(null);
  const [governmentTrack, setGovernmentTrack] = useState<GovernmentTrack | null>(null);
  const [nextActions, setNextActions] = useState<NextActions | null>(null);
  const [loading, setLoading] = useState(false);
  const [centerId, setCenterId] = useState<string>("");

  useEffect(() => {
    const stored = localStorage.getItem("centerId");
    if (stored) setCenterId(stored);
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/customers?limit=100`);
      const data = await res.json();
      setCustomers(data.items || []);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    }
  };

  const calculate = async () => {
    if (!selectedCustomerId) return;
    setLoading(true);

    try {
      // Get next actions including PTA and government track
      const [actionsRes, ptaRes] = await Promise.all([
        fetch(`${API_BASE}/api/customers/${selectedCustomerId}/next-actions`),
        fetch(`${API_BASE}/api/pta/${selectedCustomerId}`).catch(() => ({ ok: false, json: async () => null }))
      ]);

      if (actionsRes.ok) {
        const actionsData = await actionsRes.json();
        setGovernmentTrack(actionsData.governmentTrack);
        setNextActions(actionsData);
      }

      if (ptaRes.ok) {
        const ptaData = await ptaRes.json();
        if (ptaData.items?.length > 0) {
          const latest = ptaData.items[0];
          setPtaResult({
            ptaLeft: { pta: latest.pta4Left, breakdown: {} },
            ptaRight: { pta: latest.pta4Right, breakdown: {} },
            gradeLeft: null,
            gradeRight: null,
            overallGrade: latest.grade || "UNKNOWN"
          });
        }
      }
    } catch (err) {
      console.error("Calculation failed", err);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string | null) => {
    switch (grade) {
      case "HIGH": return "bg-red-100 text-red-700 border-red-200";
      case "BORDERLINE": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "LOW": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getTrackColor = (track: string | undefined) => {
    switch (track) {
      case "LOCAL": return "bg-purple-100 text-purple-700 border-purple-200";
      case "NATIONAL": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            정부지원 계산기
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            PTA 측정, 장애등급 판별, 정부지원 트랙분기, 다음 액션 제안
          </p>
        </div>
      </div>

      {/* Customer Selection */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="font-semibold mb-4">1. 고객 선택</h2>
        <div className="flex gap-4">
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800"
          >
            <option value="">고객을 선택하세요...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} - {c.contactNumber}
              </option>
            ))}
          </select>
          <button
            onClick={calculate}
            disabled={!selectedCustomerId || loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 font-medium"
          >
            {loading ? "계산 중..." : "분석"}
          </button>
        </div>
      </div>

      {/* Results */}
      {governmentTrack && (
        <>
          {/* Government Track */}
          <div className={`rounded-xl p-6 border-2 ${getTrackColor(governmentTrack.track)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/50 flex items-center justify-center text-3xl">
                  {governmentTrack.track === "LOCAL" ? "🏛️" : "📠"}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{governmentTrack.description}</h3>
                  <p className="text-sm opacity-80">급여율: {governmentTrack.coverage}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">제출 방식</p>
                <p className="font-semibold">{governmentTrack.submissionMethod}</p>
              </div>
            </div>
          </div>

          {/* PTA Results */}
          {ptaResult && (
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
              <h2 className="font-semibold mb-4">2. PTA 청력 분석</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-sm text-gray-500 mb-2">왼쪽 귀 PTA</p>
                  <p className="text-3xl font-bold">
                    {ptaResult.ptaLeft?.pta ?? "-"} dB
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-sm text-gray-500 mb-2">오른쪽 귀 PTA</p>
                  <p className="text-3xl font-bold">
                    {ptaResult.ptaRight?.pta ?? "-"} dB
                  </p>
                </div>
                <div className={`text-center p-4 rounded-xl border-2 ${getGradeColor(ptaResult.overallGrade)}`}>
                  <p className="text-sm mb-2">종합 등급</p>
                  <p className="text-3xl font-bold">
                    {ptaResult.overallGrade === "HIGH" ? "🔴 고도" :
                     ptaResult.overallGrade === "BORDERLINE" ? "🟡 경계" :
                     ptaResult.overallGrade === "LOW" ? "🟢 경미" : "❓ 미확인"}
                  </p>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                <p>* PTA4 = (500Hz + 1000Hz + 2000Hz + 4000Hz) / 4</p>
                <p>* 고도(≥62dB), 경계(58-61dB), 경미(&lt;58dB)</p>
              </div>
            </div>
          )}

          {/* Customer Position */}
          {nextActions?.position && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
              <h2 className="font-semibold mb-3">3. 고객 포지션</h2>
              <div className="flex items-center gap-4">
                <span className="text-4xl">
                  {nextActions.position.position === "신규미착용" ? "🆕" :
                   nextActions.position.position === "타사전환" ? "🔄" :
                   nextActions.position.position === "자사미사용" ? "😴" :
                   nextActions.position.position === "자사교체" ? "🔧" :
                   nextActions.position.position === "AS수리" ? "🔩" : "❓"}
                </span>
                <div>
                  <p className="text-xl font-bold">{nextActions.position.position}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {nextActions.position.recommendation}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    신뢰도: {Math.round(nextActions.position.confidence * 100)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Next Actions */}
          {nextActions && nextActions.actions && nextActions.actions.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
              <h2 className="font-semibold mb-4">4. 권장 다음 액션</h2>
              <div className="space-y-3">
                {nextActions.actions.map((action, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      action.priority === 1 ? "bg-red-500 text-white" :
                      action.priority === 2 ? "bg-yellow-500 text-white" :
                      "bg-green-500 text-white"
                    }`}>
                      {action.priority}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{action.title}</p>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </div>
                    {action.dueDays > 0 && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        D-{action.dueDays}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Link
              href={`/customers/${selectedCustomerId}`}
              className="px-6 py-3 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 font-medium"
            >
              고객 상세 보기 →
            </Link>
            <button
              onClick={calculate}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
            >
              다시 분석
            </button>
          </div>
        </>
      )}

      {/* Empty State */}
      {!governmentTrack && !loading && (
        <div className="text-center py-20 text-gray-400 bg-gray-50 dark:bg-slate-900 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
          <p className="text-4xl mb-4">🔍</p>
          <p className="font-medium">고객을 선택하고 분석을 클릭하세요</p>
          <p className="text-sm mt-2">PTA, 정부지원 트랙, 다음 액션이 자동 계산됩니다</p>
        </div>
      )}
    </div>
  );
}
