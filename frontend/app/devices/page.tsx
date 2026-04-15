'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const API_BASE = 'http://localhost:3002'

const BRANDS = ['OTICON', 'SIGNIA', 'BELTON', 'STARKEY', 'PHONAK', 'WIDEX']
const TYPES = ['RIC', 'ITE', 'BTE', 'BONE_CONDUCTION']
const EARS = ['LEFT', 'RIGHT']
const COLORS = ['RED', 'BLUE', 'BEIGE', 'BLACK', 'SILVER', 'OTHER']

const brandLabels: Record<string, string> = {
  OTICON: '오티콘', SIGNIA: '시그니아', BELTON: '벨톤', STARKEY: '스타키', PHONAK: '포낙', WIDEX: '와이드кс'
}
const typeLabels: Record<string, string> = {
  RIC: '오픈형', ITE: '귓속형', BTE: '귀걸이형', BONE_CONDUCTION: '골도형'
}
const earLabels: Record<string, string> = { LEFT: '왼쪽', RIGHT: '오른쪽' }
const colorLabels: Record<string, string> = {
  RED: '빨강', BLUE: '파랑', BEIGE: '베이지', BLACK: '검정', SILVER: '은색', OTHER: '기타'
}

interface Device {
  id: string
  brand: string
  model: string
  type: string
  ear: string
  color: string
  heardotcom: boolean
  used: boolean
  governmentSupport: boolean
  serialNumbers: { serialNumber: string; createdAt: string }[]
}

interface SerialForm {
  serialNumber: string
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showSerialModal, setShowSerialModal] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [serialForm, setSerialForm] = useState<SerialForm>({ serialNumber: '' })
  const [filter, setFilter] = useState({ brand: '', type: '', ear: '' })
  const [form, setForm] = useState({
    brand: 'OTICON', model: '', type: 'RIC', ear: 'LEFT', color: 'BEIGE',
    heardotcom: false, used: false, governmentSupport: false
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchDevices = () => {
    const params = new URLSearchParams()
    if (filter.brand) params.append('brand', filter.brand)
    if (filter.type) params.append('type', filter.type)
    if (filter.ear) params.append('ear', filter.ear)
    
    fetch(`${API_BASE}/api/devices?${params}`)
      .then(r => r.json())
      .then(data => {
        setDevices(data.items ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchDevices() }, [filter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.model) return
    setSubmitting(true)
    try {
      const centerId = localStorage.getItem('centerId') || 'default-center-id'
      const res = await fetch(`${API_BASE}/api/devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, centerId })
      })
      if (!res.ok) throw new Error()
      setShowModal(false)
      setForm({ brand: 'OTICON', model: '', type: 'RIC', ear: 'LEFT', color: 'BEIGE', heardotcom: false, used: false, governmentSupport: false })
      fetchDevices()
    } catch {
      alert('장비 등록에 실패했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddSerial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDevice || !serialForm.serialNumber) return
    setSubmitting(true)
    try {
      const centerId = localStorage.getItem('centerId') || 'default-center-id'
      const res = await fetch(`${API_BASE}/api/devices/${selectedDevice.id}/serials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ centerId, serialNumber: serialForm.serialNumber })
      })
      if (!res.ok) throw new Error()
      setShowSerialModal(false)
      setSerialForm({ serialNumber: '' })
      setSelectedDevice(null)
      fetchDevices()
    } catch {
      alert('시리얼 번호 등록에 실패했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  const openSerialModal = (device: Device) => {
    setSelectedDevice(device)
    setShowSerialModal(true)
  }

  const filtered = devices

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">장비 관리</h1>
          <p className="text-sm text-slate-500 mt-1">총 {filtered.length}개</p>
        </div>
        <div className="flex gap-2">
          <Link href="/inventory" className="btn btn-outline">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            재고 관리
          </Link>
          <button onClick={() => setShowModal(true)} className="btn btn-primary shadow-lg shadow-blue-500/30">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            새 장비 등록
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex gap-4 flex-wrap">
        <select value={filter.brand} onChange={e => setFilter(f => ({ ...f, brand: e.target.value }))} className="px-4 py-2 rounded-xl border border-slate-200 bg-white shadow-sm">
          <option value="">전체 브랜드</option>
          {BRANDS.map(b => <option key={b} value={b}>{brandLabels[b]}</option>)}
        </select>
        <select value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))} className="px-4 py-2 rounded-xl border border-slate-200 bg-white shadow-sm">
          <option value="">전체 유형</option>
          {TYPES.map(t => <option key={t} value={t}>{typeLabels[t]}</option>)}
        </select>
        <select value={filter.ear} onChange={e => setFilter(f => ({ ...f, ear: e.target.value }))} className="px-4 py-2 rounded-xl border border-slate-200 bg-white shadow-sm">
          <option value="">전체 귀</option>
          {EARS.map(e => <option key={e} value={e}>{earLabels[e]}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-slate-400 py-20 text-center bg-white rounded-xl shadow-sm">불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className="text-slate-400 py-20 text-center bg-white rounded-xl shadow-sm">등록된 장비가 없습니다.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">브랜드</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">모델</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">유형</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">귀</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">색상</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">시리얼</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">플래그</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(device => (
                <tr key={device.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-800">{brandLabels[device.brand] || device.brand}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{device.model}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {typeLabels[device.type] || device.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{earLabels[device.ear]}</td>
                  <td className="px-6 py-4 text-slate-600">{colorLabels[device.color] || device.color}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {device.serialNumbers.length > 0 ? (
                        device.serialNumbers.map((s, i) => (
                          <span key={i} className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono">{s.serialNumber}</span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">없음</span>
                      )}
                      <button onClick={() => openSerialModal(device)} className="text-xs text-blue-600 hover:underline">
                        + 시리얼 추가
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {device.heardotcom && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">히어닷컴</span>}
                      {device.used && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">중고</span>}
                      {device.governmentSupport && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">정부지원</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => { setSelectedDevice(device); setForm({ brand: device.brand, model: device.model, type: device.type, ear: device.ear, color: device.color, heardotcom: device.heardotcom, used: device.used, governmentSupport: device.governmentSupport }); setShowModal(true) }} className="text-sm text-blue-600 hover:underline">수정</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">{selectedDevice ? '장비 수정' : '새 장비 등록'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">브랜드</label>
                  <select value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-slate-200">
                    {BRANDS.map(b => <option key={b} value={b}>{brandLabels[b]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">모델</label>
                  <input type="text" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-slate-200" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">유형</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-slate-200">
                    {TYPES.map(t => <option key={t} value={t}>{typeLabels[t]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">귀</label>
                  <select value={form.ear} onChange={e => setForm(f => ({ ...f, ear: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-slate-200">
                    {EARS.map(e => <option key={e} value={e}>{earLabels[e]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">색상</label>
                  <select value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-slate-200">
                    {COLORS.map(c => <option key={c} value={c}>{colorLabels[c]}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-4 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.heardotcom} onChange={e => setForm(f => ({ ...f, heardotcom: e.target.checked }))} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                  <span className="text-sm text-slate-600">히어닷컴</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.used} onChange={e => setForm(f => ({ ...f, used: e.target.checked }))} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                  <span className="text-sm text-slate-600">중고</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.governmentSupport} onChange={e => setForm(f => ({ ...f, governmentSupport: e.target.checked }))} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                  <span className="text-sm text-slate-600">정부지원</span>
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); setSelectedDevice(null) }} className="btn btn-outline">취소</button>
                <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? '저장 중...' : '저장'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Serial Modal */}
      {showSerialModal && selectedDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              시리얼 번호 추가<br />
              <span className="text-sm font-normal text-slate-500">{brandLabels[selectedDevice.brand]} {selectedDevice.model}</span>
            </h2>
            <form onSubmit={handleAddSerial} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">시리얼 번호</label>
                <input type="text" value={serialForm.serialNumber} onChange={e => setSerialForm(f => ({ ...f, serialNumber: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-slate-200 font-mono" placeholder="예: SN-2024-001" required />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowSerialModal(false); setSelectedDevice(null) }} className="btn btn-outline">취소</button>
                <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? '저장 중...' : '저장'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}