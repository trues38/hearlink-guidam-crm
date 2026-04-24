'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, MessageSquare, Phone, MapPin, AlertCircle, Gift, CheckCircle2, FileText, DollarSign, XCircle, Loader2, Printer, Search, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'

// --- Mock Data ---
type WorkflowStatus = 'TARGET' | 'DOC_SUBMITTED' | 'PAYMENT_CONFIRMED';
type TargetRound = 0 | 1 | 2 | 3 | 4 | 'RENEWAL'; // 0 = 초기 구매비 청구

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
  history: ('입금확인' | '기간만료' | '서류접수')[]
}

const initialData: ConformityRecord[] = [
  // 대상자 (TARGET)
  { id: '19', customerId: 'c19', name: '이효리', contactNumber: '010-3333-1111', device: '스타키 제네시스', purchaseDate: '2026-04-24', targetRound: 0, dueDate: '2026-05-24', status: 'TARGET', history: [] },
  { id: '1', customerId: 'c1', name: '김철수', contactNumber: '010-1234-5678', device: '오티콘 리얼 1', purchaseDate: '2025-04-01', targetRound: 1, dueDate: '2026-05-10', status: 'TARGET', history: ['입금확인'] },
  { id: '2', customerId: 'c2', name: '이영희', contactNumber: '010-9876-5432', device: '시그니아 AX', purchaseDate: '2024-01-15', targetRound: 2, dueDate: '2026-04-28', status: 'TARGET', history: ['입금확인', '입금확인'] },
  { id: '3', customerId: 'c3', name: '박명수', contactNumber: '010-1111-2222', device: '스타키 이볼브', purchaseDate: '2023-10-05', targetRound: 3, dueDate: '2026-04-25', status: 'TARGET', history: ['입금확인', '입금확인', '기간만료'] },
  { id: '4', customerId: 'c4', name: '정동원', contactNumber: '010-3333-4444', device: '포낙 마블', purchaseDate: '2021-05-10', targetRound: 'RENEWAL', dueDate: '2026-05-10', status: 'TARGET', history: ['입금확인', '입금확인', '입금확인', '입금확인', '기간만료'] },
  { id: '8', customerId: 'c8', name: '아이유', contactNumber: '010-4444-5555', device: '벨톤 어치브', purchaseDate: '2024-05-20', targetRound: 2, dueDate: '2026-05-20', status: 'TARGET', history: ['입금확인', '기간만료'] },
  { id: '9', customerId: 'c9', name: '공유', contactNumber: '010-6666-7777', device: '와이덱스 모멘트', purchaseDate: '2023-03-10', targetRound: 3, dueDate: '2026-04-30', status: 'TARGET', history: ['입금확인', '입금확인', '입금확인'] }, 
  { id: '10', customerId: 'c10', name: '유해진', contactNumber: '010-8888-9999', device: '오티콘 모어', purchaseDate: '2022-11-11', targetRound: 4, dueDate: '2026-05-01', status: 'TARGET', history: ['입금확인', '입금확인', '기간만료', '입금확인'] }, 
  { id: '12', customerId: 'c12', name: '김혜수', contactNumber: '010-0000-1111', device: '스타키 피카소', purchaseDate: '2024-08-10', targetRound: 2, dueDate: '2026-08-10', status: 'TARGET', history: ['입금확인', '입금확인'] }, 
  { id: '13', customerId: 'c13', name: '송강호', contactNumber: '010-9999-8888', device: '포낙 오데오', purchaseDate: '2023-04-20', targetRound: 4, dueDate: '2026-05-15', status: 'TARGET', history: ['입금확인', '입금확인', '입금확인', '기간만료'] },
  { id: '14', customerId: 'c14', name: '전도연', contactNumber: '010-7777-6666', device: '벨톤 이매진', purchaseDate: '2025-01-05', targetRound: 2, dueDate: '2026-04-30', status: 'TARGET', history: ['입금확인', '기간만료'] },
  
  // 서류접수 (DOC_SUBMITTED)
  { id: '20', customerId: 'c20', name: '차은우', contactNumber: '010-1212-3434', device: '시그니아 퓨어', purchaseDate: '2026-04-20', targetRound: 0, dueDate: '2026-05-20', status: 'DOC_SUBMITTED', history: [] },
  { id: '5', customerId: 'c5', name: '유재석', contactNumber: '010-5555-6666', device: '벨톤 어메이즈', purchaseDate: '2025-11-20', targetRound: 1, dueDate: '2026-05-05', status: 'DOC_SUBMITTED', history: ['입금확인'] },
  { id: '15', customerId: 'c15', name: '황정민', contactNumber: '010-1234-9876', device: '오티콘 루비', purchaseDate: '2024-02-15', targetRound: 3, dueDate: '2026-05-20', status: 'DOC_SUBMITTED', history: ['입금확인', '입금확인', '기간만료'] },
  { id: '16', customerId: 'c16', name: '최민식', contactNumber: '010-4321-5678', device: '시그니아 실크', purchaseDate: '2024-01-10', targetRound: 3, dueDate: '2027-01-10', status: 'TARGET', history: ['입금확인', '입금확인', '서류접수'] },
  
  // 입금확인 (PAYMENT_CONFIRMED)
  { id: '6', customerId: 'c6', name: '강호동', contactNumber: '010-7777-8888', device: '오티콘 모어', purchaseDate: '2023-04-20', targetRound: 4, dueDate: '2026-04-30', status: 'PAYMENT_CONFIRMED', history: ['입금확인', '입금확인', '입금확인', '입금확인'] },
  { id: '17', customerId: 'c17', name: '이병헌', contactNumber: '010-1111-9999', device: '포낙 라이프', purchaseDate: '2025-02-28', targetRound: 2, dueDate: '2026-04-20', status: 'PAYMENT_CONFIRMED', history: ['입금확인', '입금확인'] },
];

const calculateDDay = (dueDate: string) => {
  const today = new Date('2026-04-24T00:00:00Z').getTime();
  const target = new Date(dueDate).getTime();
  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

const getDDayText = (dDay: number) => {
  if (dDay < 0) return `기한 지남 (D+${Math.abs(dDay)})`;
  if (dDay === 0) return 'D-Day';
  return `D-${dDay}`;
}

type SortConfig = { key: keyof ConformityRecord | 'dDay', direction: 'asc' | 'desc' } | null;

export default function ConformityWorkflowDashboard() {
  const [data, setData] = useState<ConformityRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roundFilter, setRoundFilter] = useState<'ALL' | 0 | 1 | 2 | 3 | 4 | 'RENEWAL'>('ALL');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'dueDate', direction: 'asc' });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setData(initialData);
      setIsLoading(false);
    }, 300);
  }, []);

  const changeStatus = async (id: string, newStatus: WorkflowStatus, historyRoundIndex?: number) => {
    setData(prev => prev.map(item => {
      if (item.id === id) {
        if (historyRoundIndex !== undefined) {
          const newHistory = [...item.history];
          if (newStatus === 'PAYMENT_CONFIRMED') {
            newHistory[historyRoundIndex] = '입금확인';
          }
          return { ...item, history: newHistory };
        }
        return { ...item, status: newStatus };
      }
      return item;
    }));
    setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
  };

  const handleSort = (key: keyof ConformityRecord | 'dDay') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-3 h-3 ml-1 text-brand-500" />
      : <ChevronDown className="w-3 h-3 ml-1 text-brand-500" />;
  };

  const filteredData = useMemo(() => {
    let base = [...data];

    // 1. Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      base = base.filter(item => 
        item.name.toLowerCase().includes(q) || 
        item.contactNumber.includes(q) || 
        item.device.toLowerCase().includes(q)
      );
    }

    // 2. Round Filter
    if (roundFilter !== 'ALL') {
      base = base.filter(item => item.targetRound === roundFilter);
    }

    // 3. Sort
    if (sortConfig) {
      base.sort((a, b) => {
        let aVal: any = sortConfig.key === 'dDay' ? calculateDDay(a.dueDate) : a[sortConfig.key as keyof ConformityRecord];
        let bVal: any = sortConfig.key === 'dDay' ? calculateDDay(b.dueDate) : b[sortConfig.key as keyof ConformityRecord];

        if (sortConfig.key === 'dueDate' || sortConfig.key === 'purchaseDate') {
          aVal = new Date(aVal as string).getTime();
          bVal = new Date(bVal as string).getTime();
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return base;
  }, [data, searchQuery, roundFilter, sortConfig]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20 print:p-0 print:m-0 print:space-y-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:mb-4">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-cyan-500 dark:from-brand-400 dark:to-cyan-300 tracking-tight drop-shadow-sm mb-2 print:text-black print:bg-none print:text-2xl">
            적합관리 대시보드
          </h1>
          <p className="text-sm text-muted print:hidden">
            통합 데이터 그리드에서 전체 대상자를 검색하고 관리하세요.
          </p>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <button 
            onClick={() => {
              setRoundFilter('ALL');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-surface hover:bg-muted-bg text-foreground border border-border rounded-xl text-sm font-bold transition-colors shadow-sm"
          >
            전체 보기
          </button>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text"
              placeholder="이름, 전화번호 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-64 transition-all"
            />
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-muted-bg text-foreground border border-border rounded-xl text-sm font-bold transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" /> 목록 인쇄
          </button>
        </div>
      </div>



      {/* Bulk Action Header & Legend */}
      <div className="flex items-center justify-between mt-4 mb-2 print:hidden">
        <div>
          {selectedIds.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/30 px-4 py-2 rounded-xl shadow-lg"
            >
              <span className="text-sm font-bold text-yellow-800 dark:text-yellow-500">
                {selectedIds.length}명 선택됨
              </span>
              <button 
                onClick={() => {
                  alert(`${selectedIds.length}명에게 알림톡을 발송합니다.`);
                  setSelectedIds([]);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#FEE500] hover:bg-[#FEE500]/90 text-black rounded-lg text-sm font-bold transition-colors shadow-sm"
              >
                <MessageSquare className="w-4 h-4" /> 일괄 알림톡 발송
              </button>
            </motion.div>
          )}
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-surface/50 rounded-xl border border-border text-[11px] font-medium text-muted ml-auto">
          <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-indigo-500" /> 서류 작성</span>
          <span className="flex items-center gap-1.5"><Printer className="w-3.5 h-3.5 text-foreground" /> 팩스/서류발송</span>
          <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-emerald-500" /> 입금완료</span>
          <span className="flex items-center gap-1.5"><Gift className="w-3.5 h-3.5 text-brand-500" /> 재구매</span>
        </div>
      </div>

      {/* Target Table */}
      <div className="bg-surface border border-border rounded-2xl shadow-[inset_0px_1px_1px_rgba(255,255,255,0.05),0_8px_30px_rgba(0,0,0,0.05)] overflow-hidden print:border-none print:shadow-none print:rounded-none">
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
            <p className="text-sm text-muted">다른 필터나 검색어를 시도해 주세요.</p>
          </div>
        ) : (
          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left border-collapse print:text-[10px]">
              <thead>
                <tr className="border-b border-border bg-muted-bg/30 print:bg-transparent print:border-black/20">
                  <th className="px-4 py-4 w-12 text-center print:hidden">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(filteredData.map(item => item.id));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                      className="rounded text-brand-500 focus:ring-brand-500 border-border bg-surface w-4 h-4 cursor-pointer" 
                    />
                  </th>
                  <th 
                    className="px-4 py-4 text-xs font-bold text-muted uppercase tracking-wider whitespace-nowrap cursor-pointer group hover:text-foreground transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">고객 (연락처) <SortIcon columnKey="name" /></div>
                  </th>
                  <th 
                    className="px-4 py-4 text-xs font-bold text-muted uppercase tracking-wider whitespace-nowrap cursor-pointer group hover:text-foreground transition-colors"
                    onClick={() => handleSort('purchaseDate')}
                  >
                    <div className="flex items-center">기기 (구입일) <SortIcon columnKey="purchaseDate" /></div>
                  </th>
                  <th 
                    className="px-4 py-4 text-xs font-bold text-muted uppercase tracking-wider whitespace-nowrap cursor-pointer group hover:text-foreground transition-colors text-center"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center justify-center">현재 차수 및 상태 <SortIcon columnKey="status" /></div>
                  </th>
                  <th 
                    className="px-4 py-4 text-xs font-bold text-muted uppercase tracking-wider whitespace-nowrap cursor-pointer group hover:text-foreground transition-colors text-center"
                    onClick={() => handleSort('dDay')}
                  >
                    <div className="flex items-center justify-center">마감(D-Day) <SortIcon columnKey="dDay" /></div>
                  </th>
                  <th 
                    className={`px-2 py-4 text-[10px] font-bold uppercase tracking-wider text-center whitespace-nowrap cursor-pointer transition-colors ${roundFilter === 0 ? 'text-brand-600 bg-brand-500/10' : 'text-blue-500 dark:text-blue-400 hover:bg-brand-500/5'}`}
                    onClick={() => setRoundFilter(0)}
                  >
                    초기
                  </th>
                  <th 
                    className={`px-2 py-4 text-[10px] font-bold uppercase tracking-wider text-center whitespace-nowrap cursor-pointer transition-colors ${roundFilter === 1 ? 'text-brand-600 bg-brand-500/10' : 'text-muted hover:bg-brand-500/5'}`}
                    onClick={() => setRoundFilter(1)}
                  >
                    1차
                  </th>
                  <th 
                    className={`px-2 py-4 text-[10px] font-bold uppercase tracking-wider text-center whitespace-nowrap cursor-pointer transition-colors ${roundFilter === 2 ? 'text-brand-600 bg-brand-500/10' : 'text-muted hover:bg-brand-500/5'}`}
                    onClick={() => setRoundFilter(2)}
                  >
                    2차
                  </th>
                  <th 
                    className={`px-2 py-4 text-[10px] font-bold uppercase tracking-wider text-center whitespace-nowrap cursor-pointer transition-colors ${roundFilter === 3 ? 'text-brand-600 bg-brand-500/10' : 'text-muted hover:bg-brand-500/5'}`}
                    onClick={() => setRoundFilter(3)}
                  >
                    3차
                  </th>
                  <th 
                    className={`px-2 py-4 text-[10px] font-bold uppercase tracking-wider text-center whitespace-nowrap cursor-pointer transition-colors ${roundFilter === 4 ? 'text-brand-600 bg-brand-500/10' : 'text-muted hover:bg-brand-500/5'}`}
                    onClick={() => setRoundFilter(4)}
                  >
                    4차
                  </th>
                  <th 
                    className={`px-2 py-4 text-[10px] font-bold uppercase tracking-wider text-center whitespace-nowrap cursor-pointer transition-colors ${roundFilter === 'RENEWAL' ? 'text-brand-600 bg-brand-500/10' : 'text-brand-500 hover:bg-brand-500/5'}`}
                    onClick={() => setRoundFilter('RENEWAL')}
                  >
                    5년
                  </th>
                  <th className="px-4 py-4 text-xs font-bold text-muted uppercase tracking-wider text-right whitespace-nowrap print:hidden">빠른 조치</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border print:divide-black/10">
                {filteredData.map(item => {
                  const isSelected = selectedIds.includes(item.id);
                  const dDay = calculateDDay(item.dueDate);
                  const dDayStr = getDDayText(dDay);

                  const getRoundStatus = (colRound: number | 'RENEWAL') => {
                    if (colRound === 'RENEWAL') {
                      if (item.targetRound === 'RENEWAL') {
                        if (item.status === 'TARGET') return '대상자';
                        if (item.status === 'DOC_SUBMITTED') return '서류접수';
                        if (item.status === 'PAYMENT_CONFIRMED') return '입금확인';
                      }
                      return '-';
                    }

                    if (typeof item.targetRound === 'number') {
                      if (colRound < item.targetRound) {
                        return item.history[colRound] || '기간만료';
                      } 
                      if (colRound === item.targetRound) {
                        if (item.status === 'TARGET') return '대상자';
                        if (item.status === 'DOC_SUBMITTED') return '서류접수';
                        if (item.status === 'PAYMENT_CONFIRMED') return '입금확인';
                      }
                      return '-';
                    } else if (item.targetRound === 'RENEWAL') {
                      return item.history[colRound] || '기간만료';
                    }
                    return '-';
                  };

                  return (
                    <tr key={item.id} className={`transition-colors group ${isSelected ? 'bg-brand-500/5' : 'hover:bg-muted-bg/30'}`}>
                      {/* Checkbox */}
                      <td className="px-4 py-4 text-center whitespace-nowrap print:hidden">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => {
                            setSelectedIds(prev => 
                              prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                            );
                          }}
                          className="rounded text-brand-500 focus:ring-brand-500 border-border bg-surface w-4 h-4 cursor-pointer" 
                        />
                      </td>
                      {/* Customer Info */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Link href={`/customers/${item.customerId}`} className="font-bold text-foreground hover:text-brand-500 transition-colors text-sm flex items-center gap-2 mb-1 print:text-black">
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-1 text-xs text-muted font-medium print:text-black/70">
                          <Phone className="w-3 h-3" /> {item.contactNumber}
                        </div>
                      </td>
                      
                      {/* Device Info */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-foreground mb-1 print:text-black">{item.device}</div>
                        <div className="text-xs text-muted font-medium print:text-black/70">{item.purchaseDate}</div>
                      </td>

                      {/* Current Status Badge */}
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border inline-block min-w-[70px] ${
                          item.status === 'TARGET' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                          item.status === 'DOC_SUBMITTED' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                          'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        } print:border-none print:bg-transparent print:text-black`}>
                          {item.status === 'TARGET' ? '대상자' : item.status === 'DOC_SUBMITTED' ? '서류접수' : '입금확인'}
                        </span>
                        <div className="text-[10px] text-muted mt-1 print:text-black/70 font-medium">
                          {item.targetRound === 'RENEWAL' ? '5년 재지원 대상' : `${item.targetRound === 0 ? '초기청구' : item.targetRound+'차 대상'}`}
                        </div>
                      </td>

                      {/* D-Day */}
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <span className={`text-sm ${
                          item.status === 'PAYMENT_CONFIRMED' ? 'text-muted line-through' :
                          dDay < 0 ? 'text-red-600 font-bold' :
                          dDay <= 30 ? 'text-orange-600 font-bold' :
                          'text-emerald-600 font-medium'
                        } print:text-black`}>
                          {item.status === 'PAYMENT_CONFIRMED' ? '-' : dDayStr}
                        </span>
                      </td>
                      
                      {/* Historical Grid Columns (0~5) */}
                      {[0, 1, 2, 3, 4, 'RENEWAL'].map(round => {
                        const rs = getRoundStatus(round as any);
                        return (
                          <td key={round} className="px-1 py-4 text-center whitespace-nowrap">
                            <span className={`text-[10px] font-medium ${
                              rs === '대상자' ? 'text-amber-500' :
                              rs === '서류접수' ? 'text-blue-500' :
                              rs === '입금확인' ? 'text-emerald-500' :
                              rs === '기간만료' ? 'text-slate-400' :
                              'text-muted/30'
                            } print:text-black`}>
                              {rs}
                            </span>
                          </td>
                        )
                      })}
                      
                      {/* Action Buttons */}
                      <td className="px-4 py-4 text-right whitespace-nowrap print:hidden">
                        <div className="flex items-center justify-end gap-1.5 opacity-100 flex-nowrap">
                          
                          {/* Render buttons for any pending PAST rounds in history */}
                          {item.history.map((histStatus, index) => {
                            if (histStatus === '서류접수') {
                              return (
                                <button 
                                  key={`hist-${index}`}
                                  onClick={() => changeStatus(item.id, 'PAYMENT_CONFIRMED', index)}
                                  className="flex items-center justify-center h-8 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded-xl transition-colors shadow-sm"
                                  title={`${index === 0 ? '초기' : index+'차'} 입금완료 처리`}
                                >
                                  <span className="text-[10px] font-bold mr-1">{index === 0 ? '초기' : index+'차'}</span>
                                  <DollarSign className="w-3.5 h-3.5" />
                                </button>
                              );
                            }
                            return null;
                          })}

                          {/* Render buttons for CURRENT target round */}
                          {item.status === 'TARGET' && (
                            <>
                              {item.targetRound === 'RENEWAL' ? (
                                <Link 
                                  href={`/customers/${item.customerId}?tab=device`}
                                  className="flex items-center justify-center h-8 px-2 bg-brand-50 hover:bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:hover:bg-brand-500/20 dark:text-brand-400 border border-brand-200 dark:border-brand-500/30 rounded-xl transition-colors shadow-sm"
                                  title="재구매 기기 등록 (완료 처리)"
                                >
                                  <span className="text-[10px] font-bold mr-1">5년</span>
                                  <Gift className="w-3.5 h-3.5" />
                                </Link>
                              ) : (
                                <>
                                  <Link 
                                    href={`/customers/${item.customerId}?tab=documents`}
                                    className="flex items-center justify-center h-8 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 rounded-xl transition-colors shadow-sm"
                                    title={`${item.targetRound === 0 ? '초기' : item.targetRound+'차'} 서류 작성`}
                                  >
                                    <span className="text-[10px] font-bold mr-1">{item.targetRound === 0 ? '초기' : item.targetRound+'차'}</span>
                                    <FileText className="w-3.5 h-3.5" />
                                  </Link>
                                  <button 
                                    onClick={() => changeStatus(item.id, 'DOC_SUBMITTED')}
                                    className="flex items-center justify-center h-8 px-2 bg-surface hover:bg-muted-bg text-foreground border border-border rounded-xl transition-colors shadow-sm"
                                    title={`${item.targetRound === 0 ? '초기' : item.targetRound+'차'} 팩스 발송`}
                                  >
                                    <span className="text-[10px] font-bold mr-1">{item.targetRound === 0 ? '초기' : item.targetRound+'차'}</span>
                                    <Printer className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </>
                          )}

                          {item.status === 'DOC_SUBMITTED' && (
                            <button 
                              onClick={() => changeStatus(item.id, 'PAYMENT_CONFIRMED')}
                              className="flex items-center justify-center h-8 px-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors shadow-sm"
                              title={`${item.targetRound === 'RENEWAL' ? '5년' : item.targetRound === 0 ? '초기' : item.targetRound+'차'} 입금완료 처리`}
                            >
                              <span className="text-[10px] font-bold mr-1 text-white">{item.targetRound === 'RENEWAL' ? '5년' : item.targetRound === 0 ? '초기' : item.targetRound+'차'}</span>
                              <DollarSign className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {item.status === 'PAYMENT_CONFIRMED' && (
                            <span className="text-xs font-bold text-emerald-500 flex items-center justify-end gap-1 whitespace-nowrap">
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

      {/* Developer Notes for Backend Integration */}
      <div className="mt-8 p-6 bg-surface border border-border rounded-2xl shadow-sm print:hidden">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-brand-500" />
          👨‍💻 개발팀 백엔드 연동 참고사항 (비즈니스 로직)
        </h3>
        <div className="space-y-4 text-sm text-muted">
          <p>
            <strong>1. 대상자(TARGET) 자동 노출 로직 (스케줄러):</strong><br />
            해당 차수의 마감일(D-Day) 기준, <strong>30일 전</strong>부터 백엔드에서 자동으로 '대상자(TARGET)' 상태로 전환하여 이 리스트에 띄워주세요. (직원이 여유있게 알림톡을 보내고 준비할 수 있도록 하기 위함입니다.)
          </p>
          <p>
            <strong>2. 상태 흐름 (Workflow):</strong><br />
            <code className="text-brand-500">대상자 ➔ 서류작성(고객상세 서류작성 탭) ➔ 팩스/서류발송(버튼클릭 시 서류접수중 변환) ➔ 입금확인(완료)</code><br />
            <strong>[쌍방향 연동 필수]</strong> 적합관리에서 '입금확인'을 눌러도 회계 장부로 전송되어 완료 처리되고, 반대로 회계 장부에서 입금확인을 해도 적합관리 상태가 완료로 변경되어야 합니다.
          </p>
          <p>
            <strong>3. 다중 차수 동시 관리 (기간 겹침 완벽 대응):</strong><br />
            만약 2차 적합이 '서류접수(입금대기)' 상태인데 공단 입금이 늦어져 1년이 지나 <strong>3차 적합 시기(D-30)가 와버린 경우</strong>입니다.<br />
            이때 백엔드는 2차를 임의로 지우거나 덮어쓰지 말고, <strong>기존 2차 입금대기 상태는 그대로 유지한 채 3차 '대상자' 상태를 추가로 활성화(독립 레코드 관리)</strong>시켜 주어야 합니다. 프론트엔드는 알아서 매트릭스 표에 2차와 3차 상태를 동시에 보여주고, 액션 버튼도 <code>[2차 💲]</code>, <code>[3차 💬]</code> 등으로 똑똑하게 분리해서 띄워줍니다. (데이터 꼬임을 원천 차단하는 핵심 아키텍처입니다.)
          </p>
          <p>
            <strong>4. 5년 재지원(새 기기 구매) 시 데이터 리셋:</strong><br />
            5년(60개월)이 지나서 새 기기를 구매(재지원)하게 되면, 기존 1~4차까지의 데이터는 고객 상세 페이지의 <strong>'과거 이력(로그)'으로 아카이빙</strong>하고, 이 대시보드에는 깔끔하게 <strong>새로운 1회차(초기 청구) Conformity 데이터</strong>만 새로 Insert 해서 띄워주면 됩니다.
          </p>
        </div>
      </div>
    </div>
  )
}
