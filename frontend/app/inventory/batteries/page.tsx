'use client'

import { useState, useEffect } from 'react'

const API_BASE = 'http://localhost:3002'

interface Battery {
  id: string
  centerId: string
  model: string
  quantity: number
  heardotcom: boolean
  lowStockAt: number
}

export default function BatteriesPage() {
  const [items, setItems] = useState<Battery[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ model: '', quantity: 0, lowStockAt: 5, heardotcom: false })
  const [submitting, setSubmitting] = useState(false)

  const fetchItems = () => {
    fetch(`${API_BASE}/api/inventory/batteries`)
      .then(r => r.json())
      .then(data => {
        setItems(data.items ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchItems() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.model) return
    setSubmitting(true)
    try {
      const centerId = localStorage.getItem('centerId') || 'default-center-id'
      const res = await fetch(`${API_BASE}/api/inventory/batteries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, centerId })
      })
      if (!res.ok) throw new Error()
      setShowModal(false)
      setForm({ model: '', quantity: 0, lowStockAt: 5, heardotcom: false })
      fetchItems()
    } catch {
      alert('배터리 등록에 실패했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAdjust = async (id: string, delta: number) => {
    try {
      await fetch(`${API_BASE}/api/inventory/batteries/${id}/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta, reason: 'manual_adjust' })
      })
      fetchItems()
    } catch {
      alert('수정 실패')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button onClick={() => setShowModal(true)} className="btn btn-primary shadow-lg shadow-blue-500/30">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          배터리 추가
        </button>
      </div>

      {loading ? (
        <div className="text-slate-400 py-20 text-center bg-white rounded-xl shadow-sm">불러오는 중...</div>
      ) : items.length === 0 ? (
        <div className="text-slate-400 py-20 text-center bg-white rounded-xl shadow-sm">등록된 배터리가 없습니다.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => {
            const isLow = item.quantity < item.lowStockAt
            return (
              <div key={item.id} className={`bg-white rounded-xl shadow-sm border-2 ${isLow ? 'border-red-200' : 'border-slate-200'} p-4`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800">{item.model}</h3>
                    {item.heardotcom && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded mt-1 inline-block">히어닷컴</span>
                    )}
                  </div>
                  <div className={`text-2xl font-bold ${isLow ? 'text-red-600' : 'text-green-600'}`}>
                    {item.quantity}
                    <span className="text-sm font-normal text-slate-400 ml-1">개</span>
                  </div>
                </div>
                
                {isLow && (
                  <div className="mb-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    ⚠️ 재고 부족 (최소 {item.lowStockAt}개 이하)
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={() => handleAdjust(item.id, -10)} className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-600 transition-colors">-10</button>
                  <button onClick={() => handleAdjust(item.id, -1)} className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-600 transition-colors">-1</button>
                  <button onClick={() => handleAdjust(item.id, 1)} className="flex-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-sm font-medium text-blue-700 transition-colors">+1</button>
                  <button onClick={() => handleAdjust(item.id, 10)} className="flex-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-sm font-medium text-blue-700 transition-colors">+10</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">배터리 추가</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">모델명</label>
                <input type="text" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-slate-200" placeholder="예: PR41, 13, 312" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">초기 수량</label>
                <input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-2 rounded-xl border border-slate-200" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">최소 재고량 (경고 기준)</label>
                <input type="number" value={form.lowStockAt} onChange={e => setForm(f => ({ ...f, lowStockAt: parseInt(e.target.value) || 5 }))} className="w-full px-4 py-2 rounded-xl border border-slate-200" min="1" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.heardotcom} onChange={e => setForm(f => ({ ...f, heardotcom: e.target.checked }))} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                <span className="text-sm text-slate-600">히어닷컴 전용</span>
              </label>
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