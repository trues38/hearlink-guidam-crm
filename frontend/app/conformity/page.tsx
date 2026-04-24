'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, MessageSquare, Phone, MapPin, AlertCircle, Gift, CheckCircle2, FileText, DollarSign, XCircle, Loader2 } from 'lucide-react'

// --- Mock Data ---
type WorkflowStatus = 'TARGET' | 'DOC_SUBMITTED' | 'PAYMENT_CONFIRMED' | 'EXPIRED';
type TargetRound = 1 | 2 | 3 | 4 | 'RENEWAL';

interface ConformityRecord {
  id: string
  customerId: string
  name: string
  contactNumber: string
  device: string
  purchaseDate: string
  targetRound: TargetRound
  dueDate: string
  status: WorkflowStatus
}

// D-Day 계산 유틸
const calculateDDay = (dueDate: string) => {
  const today = new Date('2026-04-24T00:00:00Z').getTime();
  const target = new Date(dueDate).getTime();
  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

const getBadgeStyle = (dDay: number) => {
  if (dDay < 0) return 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400 font-bold'; // 초과
  if (dDay <= 30) return 'bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400 font-bold animate-pulse'; // 임박
  return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium'; // 여유
}

const getDDayText = (dDay: number) => {
  if (dDay < 0) return `기한 지남 (D+${Math.abs(dDay)})`;
  if (dDay === 0) return 'D-Day';
  return `D-${dDay}`;
}

export default function ConformityWorkflowDashboard() {
  const [data, setData] = useState<ConformityRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<WorkflowStatus>('TARGET');
  const [roundFilter, setRoundFilter] = useState<'ALL' | 1 | 2 | 3 | 4 | 'RENEWAL'>('ALL');

  // Fetch real data from backend
  const fetchData = async () => {
    try {
      setIsLoading(true);
      // In a real app, centerId comes from context
      const res = await fetch('http://localhost:3002/api/conformity?centerId=123e4567-e89b-12d3-a456-426614174000');
      const json = await res.json();
      setData(json.items || []);
    } catch (error) {
      console.error('Failed to fetch conformity data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Status Change API Call
  const changeStatus = async (id: string, newStatus: WorkflowStatus) => {
    try {
      await fetch(`http://localhost:3002/api/conformity/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      // Optimistic update
      setData(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const filteredData = useMemo(() => {
    // 1. 먼저 상단 탭(Workflow Status)으로 필터링
    let base = data.filter(item => item.status === activeTab);

    // 2. TARGET 탭일 경우에만 내부 차수(Round) 필터 적용
    if (activeTab === 'TARGET') {
      if (roundFilter !== 'ALL') {
        base = base.filter(item => item.targetRound === roundFilter);
      }
      // TARGET 탭의 정렬 기준: 무조건 임박순 (D-Day 오름차순)
      return base.sort((a, b) => calculateDDay(a.dueDate) - calculateDDay(b.dueDate));
    }

    // 다른 탭들은 만료일 또는 구입일 등 다른 기준으로 정렬 가능 (여기서는 임의로 D-Day순)
    return base.sort((a, b) => calculateDDay(a.dueDate) - calculateDDay(b.dueDate));
  }, [data, activeTab, roundFilter]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-cyan-500 dark:from-brand-400 dark:to-cyan-300 tracking-tight drop-shadow-sm mb-2">
          적합관리 워크플로우
        </h1>
        <p className="text-sm text-muted">
          업무 파이프라인에 맞춰 대상자를 추출하고 실시간으로 관리하세요.
        </p>
      </div>

      {/* Main Workflow Kanban Tabs */}
      <div className="bg-surface/50 p-1.5 rounded-2xl border border-border inline-flex w-full md:w-auto overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('TARGET')}
          className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'TARGET' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-muted hover:text-foreground hover:bg-muted-bg'}`}
        >
          <AlertCircle className="w-4 h-4" /> 적합 대상자
          <span className="ml-1 bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px]">
            {data.filter(d => d.status === 'TARGET').length}
          </span>
        </button>
        <button 
          onClick={() => setActiveTab('DOC_SUBMITTED')}
          className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'DOC_SUBMITTED' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-muted hover:text-foreground hover:bg-muted-bg'}`}
        >
          <FileText className="w-4 h-4" /> 서류 접수중
          <span className="ml-1 bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px]">
            {data.filter(d => d.status === 'DOC_SUBMITTED').length}
          </span>
        </button>
        <button 
          onClick={() => setActiveTab('PAYMENT_CONFIRMED')}
          className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'PAYMENT_CONFIRMED' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-muted hover:text-foreground hover:bg-muted-bg'}`}
        >
          <DollarSign className="w-4 h-4" /> 입금 확인
          <span className="ml-1 bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px]">
            {data.filter(d => d.status === 'PAYMENT_CONFIRMED').length}
          </span>
        </button>
        <button 
          onClick={() => setActiveTab('EXPIRED')}
          className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'EXPIRED' ? 'bg-slate-600 text-white shadow-lg shadow-slate-600/20' : 'text-muted hover:text-foreground hover:bg-muted-bg'}`}
        >
          <XCircle className="w-4 h-4" /> 기간 만료
        </button>
      </div>

      {/* Sub Filters (Only show in TARGET tab) */}
      {activeTab === 'TARGET' && (
        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <button 
            onClick={() => setRoundFilter('ALL')} 
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${roundFilter === 'ALL' ? 'bg-foreground text-background border-foreground shadow-md' : 'bg-surface text-muted border-border hover:bg-muted-bg hover:text-foreground'}`}
          >
            전체 차수
          </button>
          
          {[1, 2, 3, 4].map(round => (
            <button 
              key={round}
              onClick={() => setRoundFilter(round as 1|2|3|4)} 
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${roundFilter === round ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' : 'bg-surface text-muted border-border hover:bg-muted-bg hover:text-foreground'}`}
            >
              {round}차 대상
            </button>
          ))}

          <button 
            onClick={() => setRoundFilter('RENEWAL')} 
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${roundFilter === 'RENEWAL' ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/30' : 'bg-surface text-muted border-border hover:bg-muted-bg hover:text-foreground'}`}
          >
            <Gift className="w-3.5 h-3.5" /> 5년 재지원 대상
          </button>
        </div>
      )}

      {/* Target Table */}
      <div className="bg-surface border border-border rounded-2xl shadow-[inset_0px_1px_1px_rgba(255,255,255,0.05),0_8px_30px_rgba(0,0,0,0.05)] overflow-hidden">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-4" />
            <h3 className="text-sm font-bold text-foreground mb-1">데이터를 불러오는 중입니다...</h3>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-muted-bg rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-muted" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">해당되는 데이터가 없습니다</h3>
            <p className="text-sm text-muted">다른 탭이나 필터를 선택해 주세요.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted-bg/30">
                  <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[25%]">고객 (연락처)</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[25%]">최신 기기 (구입일)</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[15%]">대상 회차</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[15%]">상태 / D-Day</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider text-right w-[20%]">빠른 조치</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredData.map(item => {
                  const dDay = calculateDDay(item.dueDate);
                  return (
                    <tr key={item.id} className="hover:bg-muted-bg/30 transition-colors group">
                      {/* Customer Info */}
                      <td className="px-6 py-4">
                        <Link href={`/customers/${item.customerId}`} className="font-bold text-foreground hover:text-brand-500 transition-colors text-sm flex items-center gap-2 mb-1">
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-1 text-xs text-muted font-medium">
                          <Phone className="w-3 h-3" /> {item.contactNumber}
                        </div>
                      </td>
                      
                      {/* Device Info */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-foreground mb-1">{item.device}</div>
                        <div className="text-xs text-muted font-medium">구입일: {item.purchaseDate}</div>
                      </td>
                      
                      {/* Target Round */}
                      <td className="px-6 py-4">
                        {item.targetRound === 'RENEWAL' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400">
                            <Gift className="w-3.5 h-3.5" /> 재지원
                          </span>
                        ) : (
                          <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            {item.targetRound}차 적합
                          </span>
                        )}
                      </td>
                      
                      {/* D-Day or Status */}
                      <td className="px-6 py-4">
                        {activeTab === 'TARGET' ? (
                          <div className="flex flex-col items-start gap-1">
                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs border ${getBadgeStyle(dDay)}`}>
                              {getDDayText(dDay)}
                            </span>
                            <span className="text-[10px] text-muted font-medium">마감: {item.dueDate}</span>
                          </div>
                        ) : activeTab === 'DOC_SUBMITTED' ? (
                          <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            청구/심사중
                          </span>
                        ) : activeTab === 'PAYMENT_CONFIRMED' ? (
                          <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            입금 확인됨
                          </span>
                        ) : (
                          <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                            청구 소멸
                          </span>
                        )}
                      </td>
                      
                      {/* Action Buttons */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          
                          {activeTab === 'TARGET' && (
                            <>
                              <button className="flex items-center gap-1.5 px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 rounded-xl text-xs font-bold transition-colors shadow-sm">
                                <MessageSquare className="w-3.5 h-3.5" /> 알림톡
                              </button>
                              <button 
                                onClick={() => changeStatus(item.id, 'DOC_SUBMITTED')}
                                className="flex items-center gap-1.5 px-3 py-2 bg-surface hover:bg-muted-bg text-foreground border border-border rounded-xl text-xs font-bold transition-colors shadow-sm"
                                title="세금계산서가 발행되면 자동으로 이 상태로 넘어갑니다."
                              >
                                서류접수 →
                              </button>
                            </>
                          )}

                          {activeTab === 'DOC_SUBMITTED' && (
                            <button 
                              onClick={() => changeStatus(item.id, 'PAYMENT_CONFIRMED')}
                              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                            >
                              <DollarSign className="w-3.5 h-3.5" /> 입금완료 처리
                            </button>
                          )}

                          {activeTab === 'PAYMENT_CONFIRMED' && (
                            <span className="text-xs font-bold text-emerald-500 flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-4 h-4" /> 완료
                            </span>
                          )}

                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}