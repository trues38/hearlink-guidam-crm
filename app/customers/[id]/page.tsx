"use client";

import { motion } from "framer-motion";
import { ArrowLeft, User, Phone, Activity, Edit, Plus, FileSignature, ChevronDown, ChevronUp, FileText, Ear, Trash2, CalendarDays } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import MemoModal from "@/components/modals/MemoModal";
import CustomerDeviceModal from "@/components/modals/CustomerDeviceModal";
import ScheduleModal from "@/components/modals/ScheduleModal";

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const [tab, setTab] = useState<'memo' | 'audiogram' | 'device' | 'docs'>('memo');
  const [isMemoModalOpen, setIsMemoModalOpen] = useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [expandedMemos, setExpandedMemos] = useState<Record<number, boolean>>({});
  const [memoFilterType, setMemoFilterType] = useState('전체');
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({});
  const [referralOpen, setReferralOpen] = useState(false);

  const toggleMemo = (id: number) => {
    setExpandedMemos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getBadgeStyle = (type: string) => {
    switch(type) {
      case "피팅/적합": return "bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20";
      case "일반상담": return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";
      case "수리/AS": return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default: return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-12 mt-16 md:mt-0">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-4">
          <Link href="/customers" className="p-2 rounded-xl border border-border hover:bg-muted-bg text-muted hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">김철수</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-500/20">VIP</span>
            </div>
            <p className="text-muted text-sm mt-1">CUST-00{params.id} • 등록일: 2026-01-15</p>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex gap-2">
          <button onClick={() => setIsScheduleModalOpen(true)} className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-colors shadow-lg shadow-brand-500/20">
            <CalendarDays className="w-4 h-4" />
            <span className="font-medium text-sm">일정 추가</span>
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-muted-bg border border-border hover:bg-border text-foreground rounded-xl transition-colors">
            <Edit className="w-4 h-4" />
            <span className="font-medium text-sm">정보 수정</span>
          </button>
        </motion.div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Profile Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="w-full lg:w-1/3 space-y-6 shrink-0">
          <div className="glass-card bg-surface p-6">
            <h2 className="font-bold text-foreground mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-500" /> 상세 정보
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted shrink-0">성별/연령</span>
                <span className="text-sm font-medium text-foreground text-right">남성 / 65세</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted shrink-0">생년월일</span>
                <span className="text-sm font-medium text-foreground text-right">1961.05.12</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted shrink-0">연락처</span>
                <span className="text-sm font-medium text-foreground flex items-center gap-2 justify-end"><Phone className="w-3 h-3 text-brand-500"/> 010-1234-5678</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted shrink-0">주민등록번호</span>
                <span className="text-sm font-medium text-foreground text-right">610512-1******</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted shrink-0">이메일</span>
                <span className="text-sm font-medium text-foreground text-right truncate pl-4">chulsoo@example.com</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted shrink-0">유입 경로</span>
                <span className="text-sm font-medium text-foreground text-right">
                  지인 소개 <Link href="/customers/2" className="text-brand-500 hover:underline">(이영희)</Link>
                </span>
              </div>
              <div className="py-2 border-b border-border/50">
                <button
                  onClick={() => setReferralOpen(p => !p)}
                  className="w-full flex justify-between items-center"
                >
                  <span className="text-sm text-muted shrink-0">피추천인</span>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-brand-500">
                    2명
                    <ChevronDown className={`w-3 h-3 transition-transform ${referralOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>
                {referralOpen && (
                  <div className="mt-2 space-y-1.5">
                    {[
                      { id: 3, name: '박지민', date: '2026.02.15', phone: '010-9876-5432' },
                      { id: 5, name: '최수진', date: '2026.03.20', phone: '010-5555-1234' },
                    ].map((r) => (
                      <Link
                        key={r.id}
                        href={`/customers/${r.id}`}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-brand-500/5 border border-brand-500/15 hover:bg-brand-500/10 transition-colors group"
                      >
                        <div>
                          <p className="text-sm font-semibold text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{r.name}</p>
                          <p className="text-xs text-muted">{r.phone} · {r.date} 등록</p>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-muted -rotate-90" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted shrink-0">ENT 병원</span>
                <span className="text-sm font-medium text-foreground text-right">서울 이비인후과</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted-bg/50 border border-border rounded-xl">
              <span className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">특이사항 메모</span>
              <p className="text-sm text-foreground">이명 증상이 심함. 우측 귀에 중이염 수술 이력 있음.</p>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Tabs Content */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex-1 glass-card bg-surface overflow-hidden flex flex-col min-h-[600px]">
          <div className="flex gap-4 md:gap-6 border-b border-border px-4 md:px-6 pt-6 overflow-x-auto scrollbar-hide">
            {[
              { id: 'memo', label: '상담 메모', icon: FileText },
              { id: 'device', label: '보청기', icon: Ear },
              { id: 'docs', label: '문서 관리', icon: FileSignature },
              { id: 'audiogram', label: '청력 검사', icon: Activity },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button 
                  key={t.id} 
                  onClick={() => setTab(t.id as 'memo' | 'audiogram' | 'device' | 'docs')} 
                  className={`pb-4 text-sm font-bold whitespace-nowrap transition-colors relative flex items-center gap-2 ${tab === t.id ? 'text-brand-600 dark:text-brand-400' : 'text-muted hover:text-foreground'}`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                  {tab === t.id && <motion.div layoutId="detailTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500" />}
                </button>
              );
            })}
          </div>

          <div className="p-4 md:p-6 flex-1 bg-muted-bg/30 overflow-y-auto">
            {tab === 'memo' && (() => {
              const allMemos = [
                { id: 1,  type: '피팅/적합', year: '2026', date: '2026.04.15', author: '관리자', device: '오티콘 리얼 1', content: '우측 기기 소리가 작다고 하셔서 이득(Gain) +2dB 상향 조절함. 하울링 테스트 완료 후 정상 출고.', isLong: false },
                { id: 2,  type: '일반상담', year: '2026', date: '2026.02.10', author: '최청능사', device: null, content: '보청기 구매 결정. 정부지원 대상자로 확인되어 서류 안내 진행함. 결제 완료.\n\n[특이사항]\n- 보호자 동반 방문\n- 귓속형보다 귀걸이형(BTE) 선호하심', isLong: true },
                { id: 3,  type: '일반상담', year: '2026', date: '2026.01.15', author: '관리자', device: null, content: '신규 방문 상담. 난청 증상 호소. 양측 고도 난청으로 진단.', isLong: false },
                { id: 4,  type: '피팅/적합', year: '2025', date: '2025.11.20', author: '관리자', device: '오티콘 리얼 1', content: '3차 적합 진행. 소음 환경 적응 훈련 상담 병행.', isLong: false },
                { id: 5,  type: '수리/AS',  year: '2025', date: '2025.09.03', author: '김주임',  device: '오티콘 리얼 1', content: '우측 볼륨 버튼 이물질로 인한 오작동. 센터 자체 수리 완료 (30분 소요).', isLong: false },
                { id: 6,  type: '피팅/적합', year: '2025', date: '2025.06.18', author: '관리자', device: '오티콘 리얼 1', content: '2차 적합. 고주파 이득 조정 및 방향성 마이크 설정 변경.', isLong: false },
                { id: 7,  type: '피팅/적합', year: '2025', date: '2025.03.05', author: '관리자', device: '오티콘 리얼 1', content: '1차 적합 진행. 처방 이득값 기준 초기 세팅 완료. 2주 후 재방문 예약.', isLong: false },
                { id: 8,  type: '일반상담', year: '2025', date: '2025.01.10', author: '최청능사', device: null, content: '정부지원 5년 재지원 대상 안내. 서류 준비 목록 전달.', isLong: false },
                { id: 9,  type: '피팅/적합', year: '2024', date: '2024.10.22', author: '관리자', device: '스타키 이볼브 AI', content: '구형 기기 최종 적합. 신형 기기로 교체 권고함.', isLong: false },
                { id: 10, type: '수리/AS',  year: '2024', date: '2024.07.14', author: '김주임',  device: '스타키 이볼브 AI', content: '리시버 단선으로 본사 수리 접수. 약 2주 소요 예정.', isLong: false },
                { id: 11, type: '피팅/적합', year: '2024', date: '2024.04.09', author: '관리자', device: '스타키 이볼브 AI', content: '이명 차폐 기능 활성화 및 레벨 조정.', isLong: false },
                { id: 12, type: '일반상담', year: '2024', date: '2024.01.20', author: '관리자', device: null, content: '연간 청력 검사 진행. 좌측 5dB 추가 손실 확인.', isLong: false },
              ];

              const typeCounts = allMemos.reduce((acc, m) => {
                acc[m.type] = (acc[m.type] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);

              const filtered = memoFilterType === '전체' ? allMemos : allMemos.filter(m => m.type === memoFilterType);

              const byYear = filtered.reduce((acc, m) => {
                if (!acc[m.year]) acc[m.year] = [];
                acc[m.year].push(m);
                return acc;
              }, {} as Record<string, typeof allMemos>);
              const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

              return (
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-foreground">통합 타임라인</h3>
                    <button onClick={() => setIsMemoModalOpen(true)} className="flex items-center gap-1 px-3 py-1.5 bg-surface border border-border rounded-lg text-sm text-brand-500 hover:text-brand-600 font-medium shadow-sm transition-colors">
                      <Plus className="w-4 h-4" /> 업무 작성
                    </button>
                  </div>

                  {/* Stats Summary Bar */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { type: '전체', count: allMemos.length, color: 'bg-muted-bg border-border text-foreground' },
                      { type: '피팅/적합', count: typeCounts['피팅/적합'] || 0, color: 'bg-brand-500/10 border-brand-500/20 text-brand-600 dark:text-brand-400' },
                      { type: '일반상담', count: typeCounts['일반상담'] || 0, color: 'bg-gray-500/10 border-gray-500/20 text-gray-600 dark:text-gray-400' },
                      { type: '수리/AS', count: typeCounts['수리/AS'] || 0, color: 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400' },
                    ].map(({ type, count, color }) => (
                      <button
                        key={type}
                        onClick={() => setMemoFilterType(type)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${color} ${memoFilterType === type ? 'ring-2 ring-offset-1 ring-brand-500/50 scale-105' : 'opacity-70 hover:opacity-100'}`}
                      >
                        {type}
                        <span className="bg-white/20 dark:bg-black/20 rounded-full px-1.5 py-0.5 font-bold">{count}</span>
                      </button>
                    ))}
                  </div>

                  {/* Year-grouped Zigzag Timeline */}
                  <div className="space-y-3">
                    {years.map((year) => {
                      const firstYear = years[0];
                      const defaultOpen = year === firstYear;
                      const actuallyOpen = expandedYears[year] === undefined ? defaultOpen : expandedYears[year];

                      return (
                        <div key={year}>
                          {/* Year divider — pill style */}
                          <button
                            onClick={() => setExpandedYears(prev => ({ ...prev, [year]: !actuallyOpen }))}
                            className="w-full flex items-center gap-3 mb-4 group"
                          >
                            <div className="h-px flex-1 bg-border" />
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold transition-all ${actuallyOpen ? 'bg-brand-500/10 border-brand-500/30 text-brand-600 dark:text-brand-400' : 'bg-muted-bg border-border text-muted hover:border-brand-500/30'}`}>
                              <motion.div animate={{ rotate: actuallyOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                <ChevronDown className="w-3 h-3" />
                              </motion.div>
                              {year}년
                              <span className="opacity-60">{byYear[year].length}건</span>
                            </div>
                            <div className="h-px flex-1 bg-border" />
                          </button>

                          {/* Zigzag timeline entries */}
                          {actuallyOpen && (
                            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                              {byYear[year].map((memo) => {
                                const isExpanded = expandedMemos[memo.id];
                                return (
                                  <div key={memo.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                    {/* Center dot */}
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-surface shadow shrink-0 z-10 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                      <div className={`w-2.5 h-2.5 rounded-full ${memo.type === '피팅/적합' ? 'bg-brand-500' : memo.type === '수리/AS' ? 'bg-rose-500' : 'bg-gray-400'}`} />
                                    </div>

                                    {/* Card */}
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-card bg-surface p-4 rounded-xl shadow-sm border border-border transition-all hover:shadow-md">
                                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                                        <div className="flex items-center gap-2">
                                          <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${getBadgeStyle(memo.type)}`}>{memo.type}</span>
                                          <span className="text-xs font-bold text-foreground">{memo.date}</span>
                                        </div>
                                        <span className="text-xs text-muted">작성: {memo.author}</span>
                                      </div>

                                      {memo.device && (
                                        <div className="mb-2 inline-block px-2 py-1 bg-muted-bg border border-border rounded text-xs text-muted">
                                          🏷️ {memo.device}
                                        </div>
                                      )}

                                      <div className={`text-sm text-foreground leading-relaxed whitespace-pre-wrap ${!isExpanded && memo.isLong ? 'line-clamp-2' : ''}`}>
                                        {memo.content}
                                      </div>

                                      {memo.isLong && (
                                        <button onClick={() => toggleMemo(memo.id)} className="mt-2 flex items-center gap-1 text-xs font-medium text-brand-500 hover:text-brand-600 transition-colors">
                                          {isExpanded ? <><ChevronUp className="w-3 h-3"/>접기</> : <><ChevronDown className="w-3 h-3"/>자세히 보기</>}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}



            {tab === 'device' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-foreground">보유 보청기 현황</h3>
                  <button onClick={() => setIsDeviceModalOpen(true)} className="flex items-center gap-1 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium shadow-lg shadow-brand-500/20 transition-colors">
                    <Plus className="w-4 h-4" /> 보청기 추가
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Device 1 */}
                  <div className="bg-surface border border-brand-500/30 rounded-2xl p-5 shadow-sm relative group">
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button className="p-1.5 bg-muted-bg hover:bg-border text-muted hover:text-foreground rounded-lg transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-start mb-3 pr-16">
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">대표 기기</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">정부지원</span>
                      </div>
                    </div>
                    
                    <h4 className="font-bold text-foreground text-lg mb-1">오티콘 리얼 1</h4>
                    <p className="text-sm font-medium text-muted mb-4">양이 착용 (BTE)</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span className="text-muted">구매 일자</span>
                        <span className="font-medium text-foreground">2026.02.10</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span className="text-muted">시리얼 (좌)</span>
                        <span className="font-mono text-foreground text-xs">L-12345</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span className="text-muted">시리얼 (우)</span>
                        <span className="font-mono text-foreground text-xs">R-67890</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted">보증 만료일</span>
                        <span className="font-medium text-foreground">2028.02.10</span>
                      </div>
                    </div>
                  </div>

                  {/* Device 2 (Old/Backup) */}
                  <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm opacity-70 hover:opacity-100 transition-opacity relative group">
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button className="p-1.5 bg-muted-bg hover:bg-border text-muted hover:text-foreground rounded-lg transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex justify-between items-start mb-3 pr-16">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-muted-bg text-muted border border-border">보조 기기</span>
                    </div>
                    
                    <h4 className="font-bold text-foreground text-lg mb-1">스타키 이볼브 AI</h4>
                    <p className="text-sm font-medium text-muted mb-4">우측 착용 (RIC)</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span className="text-muted">구매 일자</span>
                        <span className="font-medium text-foreground">2021.05.20</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span className="text-muted">시리얼 (우)</span>
                        <span className="font-mono text-foreground text-xs">R-98765</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted">보증 상태</span>
                        <span className="font-medium text-rose-500">만료됨</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'docs' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-foreground">문서 관리</h3>
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-surface border border-border rounded-lg text-sm text-brand-500 font-medium">
                    <Plus className="w-4 h-4" /> 서류 작성
                  </button>
                </div>
                
                <div className="bg-surface border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-muted-bg/50 border-b border-border">
                      <tr>
                        <th className="p-3 text-xs font-medium text-muted">종류</th>
                        <th className="p-3 text-xs font-medium text-muted">연관 기기</th>
                        <th className="p-3 text-xs font-medium text-muted">상태</th>
                        <th className="p-3 text-xs font-medium text-muted">작성일</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm">
                      <tr className="hover:bg-muted-bg/30 cursor-pointer">
                        <td className="p-3 text-foreground font-medium">보장구 급여비 지급청구서</td>
                        <td className="p-3 text-muted">오티콘 리얼 1</td>
                        <td className="p-3"><span className="px-2 py-1 text-xs rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">발급 완료</span></td>
                        <td className="p-3 text-muted">2026.02.15</td>
                      </tr>
                      <tr className="hover:bg-muted-bg/30 cursor-pointer">
                        <td className="p-3 text-foreground font-medium">보청기 적합관리 평가서</td>
                        <td className="p-3 text-muted">오티콘 리얼 1</td>
                        <td className="p-3"><span className="px-2 py-1 text-xs rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">작성중</span></td>
                        <td className="p-3 text-muted">2026.04.15</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'audiogram' && (
              <div className="h-full flex flex-col items-center justify-center text-center p-12">
                <Activity className="w-12 h-12 text-muted mb-4" />
                <h3 className="font-bold text-foreground text-lg mb-2">청력 검사 내역</h3>
                <p className="text-muted text-sm">추후 청력도(Audiogram) 그래프 시각화 기능이 연동됩니다.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <MemoModal isOpen={isMemoModalOpen} onClose={() => setIsMemoModalOpen(false)} />
      <CustomerDeviceModal isOpen={isDeviceModalOpen} onClose={() => setIsDeviceModalOpen(false)} />
      <ScheduleModal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} defaultCustomerName="김철수" />
    </div>
  );
}
