'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const API_BASE = 'http://localhost:3002'

const STATUS_LABELS: Record<string, string> = {
  PENDING: '대기중',
  IN_REVIEW: '검토중',
  NEEDS_SUPPLEMENT: '보완요청',
  APPROVED: '승인',
  REJECTED: '반려'
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  IN_REVIEW: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400',
  NEEDS_SUPPLEMENT: 'bg-orange-100 text-orange-700',
  APPROVED: 'bg-green-100 dark:bg-emerald-900/50 text-green-700 dark:text-emerald-400',
  REJECTED: 'bg-red-100 text-red-700 dark:text-red-400'
}

const SUPPORT_LABELS: Record<string, string> = {
  DISABILITY_GRADE_HOLDER: '장애등급소지자',
  POTENTIAL_DISABILITY: '장애가망',
  INDUSTRIAL_ACCIDENT: '산업재해',
  GENERAL: '일반'
}

const RECIPIENT_LABELS: Record<string, string> = {
  RECIPIENT: '수급자',
  NEAR_POVERTY: '차상위',
  GENERAL: '일반'
}

interface ConformityRecord {
  id: string
  customerId: string
  round: number
  supportType: string | null
  recipientType: string | null
  status: string
  missingDocs: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  customer?: { id: string; name: string; contactNumber: string }
}

export default function ConformityPage() {
  const [records, setRecords] = useState<ConformityRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<ConformityRecord | null>(null)
  const [statusUpdate, setStatusUpdate] = useState({ status: '', notes: '', missingDocs: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const centerId = localStorage.getItem('centerId') || 'default-center-id'
      const params = new URLSearchParams({ centerId })
      if (statusFilter) params.append('status', statusFilter)
      
      const res = await fetch(`${API_BASE}/api/conformity?${params}`)
      const data = await res.json()
      setRecords(data.items ?? [])
    } catch {
      console.error('Failed to fetch conformity records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRecords() }, [])

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRecord) return
    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/api/conformity/${selectedRecord.customerId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          round: selectedRecord.round,
          status: statusUpdate.status,
          notes: statusUpdate.notes,
          missingDocs: statusUpdate.missingDocs ? statusUpdate.missingDocs.split(',').map(s => s.trim()) : []
        })
      })
      if (!res.ok) throw new Error()
      setShowModal(false)
      fetchRecords()
    } catch {
      alert('상태 업데이트에 실패했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  const openStatusModal = (record: ConformityRecord) => {
    setSelectedRecord(record)
    setStatusUpdate({ status: record.status, notes: record.notes || '', missingDocs: '' })
    setShowModal(true)
  }

  const filtered = statusFilter ? records.filter(r => r.status === statusFilter) : records

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-cyan-600 dark:from-blue-400 dark:to-cyan-200 tracking-tight drop-shadow-sm">적합성 심사</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">총 {filtered.length}건</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/60 dark:border-white/10 shadow-[inset_0px_1px_1px_rgba(255,255,255,0.05)] p-4 flex gap-2 flex-wrap">
        <button onClick={() => setStatusFilter('')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${!statusFilter ? 'bg-blue-600 text-slate-800 dark:text-white' : 'bg-transparent text-slate-400 hover:bg-white dark:hover:bg-white/10'}`}>전체</button>
        {Object.entries(STATUS_LABELS).map(([status, label]) => (
          <button key={status} onClick={() => setStatusFilter(status)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${statusFilter === status ? 'bg-blue-600 text-slate-800 dark:text-white' : 'bg-transparent text-slate-400 hover:bg-white dark:hover:bg-white/10'}`}>{label}</button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-slate-400 py-20 text-center bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/60 dark:border-white/10 animate-pulse">불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className="text-slate-400 py-20 text-center bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/60 dark:border-white/10 shadow-[inset_0px_1px_1px_rgba(255,255,255,0.05)]">심사 기록이 없습니다.</div>
      ) : (
        <div className="bg-white/60 dark:bg-white/[0.03] backdrop-blur-[40px] rounded-[2.5rem] shadow-[inset_0px_1px_1px_rgba(255,255,255,0.1),0_8px_30px_rgba(0,0,0,0.3)] border border-white/60 dark:border-white/10 overflow-hidden relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/60 dark:border-white/10">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">고객</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">회차</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">지원유형</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">수급구분</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">상태</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">검토자</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">검토일</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.map(record => (
                <tr key={record.id} className="hover:bg-white/60 dark:bg-white/5 transition-all duration-300">
                  <td className="px-6 py-4">
                    <Link href={`/customers/${record.customerId}`} className="font-medium text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400">
                      {record.customer?.name || '알 수 없음'}
                    </Link>
                    <p className="text-xs text-slate-400">{record.customer?.contactNumber}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">#{record.round}차</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{record.supportType ? SUPPORT_LABELS[record.supportType] || record.supportType : '-'}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{record.recipientType ? RECIPIENT_LABELS[record.recipientType] || record.recipientType : '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[record.status]}`}>
                      {STATUS_LABELS[record.status] || record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{record.reviewedBy || '-'}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{record.reviewedAt ? new Date(record.reviewedAt).toLocaleDateString('ko-KR') : '-'}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => openStatusModal(record)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">상태변경</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Status Update Modal */}
      {showModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-slide-up">
          <div className="bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[inset_0px_1px_1px_rgba(255,255,255,0.1),0_30px_60px_rgba(0,0,0,0.5)] border border-white/60 dark:border-white/10 w-full max-w-lg p-8">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">심사 상태 변경</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {selectedRecord.customer?.name} - #{selectedRecord.round}차 심사
            </p>
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">상태</label>
                <select value={statusUpdate.status} onChange={e => setStatusUpdate(s => ({ ...s, status: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md text-slate-100 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all">
                  {Object.entries(STATUS_LABELS).map(([status, label]) => (
                    <option key={status} value={status} className="bg-slate-800">{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">메모</label>
                <textarea value={statusUpdate.notes} onChange={e => setStatusUpdate(s => ({ ...s, notes: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all" rows={3} placeholder="검토 메모..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">필요 서류 (쉼표로 구분)</label>
                <input type="text" value={statusUpdate.missingDocs} onChange={e => setStatusUpdate(s => ({ ...s, missingDocs: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all" placeholder="예: 주민등록초본, 소득증빙" />
              </div>
              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-white/80 dark:border-white/20 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 transition-colors font-bold text-sm">취소</button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-800 dark:text-white transition-colors font-bold text-sm">{submitting ? '저장 중...' : '저장'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}