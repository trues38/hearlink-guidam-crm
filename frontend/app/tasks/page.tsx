'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const API_BASE = 'http://localhost:3002'

const TASK_TYPES = ['NEW_DEVICE', 'REPAIR', 'SHIPPING']
const TYPE_LABELS: Record<string, string> = {
  NEW_DEVICE: '신규장비', REPAIR: '수리', SHIPPING: '배송'
}

const PRIORITY_COLORS: Record<string, string> = {
  0: 'bg-slate-100 text-slate-600 dark:text-slate-400',
  1: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400',
  2: 'bg-orange-100 text-orange-700',
  3: 'bg-red-100 text-red-700 dark:text-red-400'
}
const PRIORITY_LABELS: Record<string, string> = {
  '0': '낮음', '1': '보통', '2': '높음', '3': '긴급'
}

interface Task {
  id: string
  centerId: string
  customerId: string | null
  assigneeId: string | null
  type: string
  priority: number
  status: string | null
  dueAt: string | null
  memo: string | null
  orderedAt: string | null
  arrivedAt: string | null
  createdAt: string
  customer?: { id: string; name: string; contactNumber: string }
}

interface Customer {
  id: string
  name: string
  contactNumber: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState({ status: '', priority: '' })
  const [form, setForm] = useState({
    customerId: '', type: 'NEW_DEVICE', priority: 1, dueAt: '', memo: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter.priority) params.append('priority', filter.priority)
      const res = await fetch(`${API_BASE}/api/tasks?${params}`)
      const data = await res.json()
      setTasks(data.items ?? [])
    } catch {
      console.error('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/customers?limit=1000`)
      const data = await res.json()
      setCustomers(data.items ?? [])
    } catch {}
  }

  useEffect(() => {
    fetchTasks()
    fetchCustomers()
  }, [filter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const centerId = localStorage.getItem('centerId') || 'default-center-id'
      const res = await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          centerId,
          customerId: form.customerId || undefined,
          type: form.type,
          priority: form.priority,
          dueAt: form.dueAt || undefined,
          memo: form.memo || undefined
        })
      })
      if (!res.ok) throw new Error()
      setShowModal(false)
      setForm({ customerId: '', type: 'NEW_DEVICE', priority: 1, dueAt: '', memo: '' })
      fetchTasks()
    } catch {
      alert('작업 등록에 실패했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  const handleComplete = async (taskId: string) => {
    try {
      await fetch(`${API_BASE}/api/tasks/${taskId}/complete`, { method: 'PUT' })
      fetchTasks()
    } catch {
      alert('작업 완료 처리에 실패했습니다')
    }
  }

  const getDueDateStatus = (dueAt: string | null) => {
    if (!dueAt) return 'none'
    const now = new Date()
    const due = new Date(dueAt)
    const diff = due.getTime() - now.getTime()
    if (diff < 0) return 'overdue'
    if (diff < 86400000) return 'today'
    return 'upcoming'
  }

  const filtered = tasks.filter(t => {
    if (filter.priority && t.priority !== parseInt(filter.priority)) return false
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">작업 관리</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">총 {filtered.length}건</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary shadow-lg shadow-blue-500/30">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          새 작업 등록
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 flex gap-4 flex-wrap">
        <select value={filter.priority} onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
          <option value="">전체 우선순위</option>
          <option value="0">낮음</option>
          <option value="1">보통</option>
          <option value="2">높음</option>
          <option value="3">긴급</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-slate-400 py-20 text-center bg-white dark:bg-slate-900 rounded-xl shadow-sm">불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className="text-slate-400 py-20 text-center bg-white dark:bg-slate-900 rounded-xl shadow-sm">등록된 작업이 없습니다.</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 dark:border-slate-700">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">고객</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">유형</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">우선순위</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">기한</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">메모</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">상태</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(task => {
                const dueDateStatus = getDueDateStatus(task.dueAt)
                return (
                  <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                    <td className="px-6 py-4">
                      {task.customer ? (
                        <Link href={`/customers/${task.customerId}`} className="font-medium text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400">
                          {task.customer.name}
                        </Link>
                      ) : (
                        <span className="text-slate-400">미연결</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400">
                        {TYPE_LABELS[task.type] || task.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
                        {PRIORITY_LABELS[String(task.priority)] || task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {task.dueAt ? (
                        <span className={`text-sm ${dueDateStatus === 'overdue' ? 'text-red-600 font-medium' : dueDateStatus === 'today' ? 'text-amber-600 font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
                          {new Date(task.dueAt).toLocaleDateString('ko-KR')}
                          {dueDateStatus === 'overdue' && ' (지연)'}
                          {dueDateStatus === 'today' && ' (오늘)'}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">미설정</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm max-w-xs truncate">{task.memo || '-'}</td>
                    <td className="px-6 py-4">
                      {task.arrivedAt ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-emerald-900/50 text-green-700 dark:text-emerald-400">완료</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:text-slate-400">대기</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {!task.arrivedAt && (
                        <button onClick={() => handleComplete(task.id)} className="text-sm text-green-600 dark:text-emerald-400 hover:underline">완료처리</button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">새 작업 등록</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">고객</label>
                <select value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                  <option value="">고객 선택 (선택사항)</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - {c.contactNumber}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">유형</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                    {TASK_TYPES.map(t => (
                      <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">우선순위</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: parseInt(e.target.value) }))} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                    <option value={0}>낮음</option>
                    <option value={1}>보통</option>
                    <option value={2}>높음</option>
                    <option value={3}>긴급</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">기한</label>
                <input type="date" value={form.dueAt} onChange={e => setForm(f => ({ ...f, dueAt: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">메모</label>
                <textarea value={form.memo} onChange={e => setForm(f => ({ ...f, memo: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700" rows={3} placeholder="작업 메모..." />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">취소</button>
                <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? '저장 중...' : '저장'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}