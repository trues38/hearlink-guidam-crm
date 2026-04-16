'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const API_BASE = 'http://localhost:3002'

const labels = {
  classification: { SELF: '자가', OTHER: '타기관', HEARDOTCOM: '히어닷컴' },
  governmentSupport: { 
    DISABILITY_GRADE_HOLDER: '장애등급', 
    POTENTIAL_DISABILITY: '장애가망', 
    INDUSTRIAL_ACCIDENT: '산업재해', 
    GENERAL: '일반' 
  },
  recipient: { RECIPIENT: '수급자', NEAR_POVERTY: '차상위', GENERAL: '일반' },
  lossType: { CONDUCTIVE: '전음성', SENSORINEURAL: '감각신경성', SUDDEN: '돌발성', NOISE_INDUCED: '소음성' }
}

interface Customer {
  id: string
  name: string
  contactNumber: string
  classification: string
  governmentSupportType?: string
  recipientType?: string
  lossType?: string
  birthDate: string | null
  gender: string | null
  createdAt: string
}

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    name: '', contactNumber: '', classification: 'SELF',
    birthDate: '', gender: '', email: '', memo: '',
    governmentSupportType: '', recipientType: '', processType: '',
    lossType: '', referralSource: '', hospitalName: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchCustomers = () => {
    fetch(`${API_BASE}/api/customers`)
      .then(r => r.json())
      .then(data => {
        setCustomers(data.items ?? data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchCustomers() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.contactNumber) return
    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          centerId: localStorage.getItem('centerId') || 'default-center-id',
          name: form.name,
          contactNumber: form.contactNumber,
          classification: form.classification || undefined,
          birthDate: form.birthDate || undefined,
          gender: form.gender || undefined,
          email: form.email || undefined,
          memo: form.memo || undefined,
          governmentSupportType: form.governmentSupportType || undefined,
          recipientType: form.recipientType || undefined,
          processType: form.processType || undefined,
          lossType: form.lossType || undefined,
          referralSource: form.referralSource || undefined,
          hospitalName: form.hospitalName || undefined,
        }),
      })
      if (!res.ok) throw new Error()
      const created = await res.json()
      setShowModal(false)
      setForm({ name: '', contactNumber: '', classification: 'SELF', birthDate: '', gender: '', email: '', memo: '', governmentSupportType: '', recipientType: '', processType: '', lossType: '', referralSource: '', hospitalName: '' })
      fetchCustomers()
      router.push(`/customers/${created.id}`)
    } catch {
      alert('고객 등록에 실패했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = customers.filter(c =>
    c.name.includes(search) || c.contactNumber.includes(search)
  )

  const classificationColors: Record<string, string> = {
    SELF: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400',
    OTHER: 'bg-green-100 dark:bg-emerald-900/50 text-green-700 dark:text-emerald-400',
    HEARDOTCOM: 'bg-purple-100 text-purple-700'
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-slide-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-cyan-800 dark:from-blue-400 dark:to-cyan-200 tracking-tight drop-shadow-sm">
            고객 관리
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">총 {filtered.length}명의 소중한 고객이 등록되어 있습니다.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-slate-800 dark:text-white transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/20 hover:border-white/80 dark:border-white/20 hover:bg-white dark:hover:bg-white/10 overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            <svg className="w-5 h-5 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            새 고객 등록
          </span>
          <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
        </button>
      </div>

      <div className="relative group">
        {/* Input inner glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-[1.35rem] blur opacity-20 group-focus-within:opacity-50 transition duration-500"></div>
        <input
          type="text"
          placeholder="이름 또는 전화번호로 검색해보세요..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="relative w-full max-w-lg px-6 py-4 rounded-[1.25rem] border border-white/60 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-[inset_0px_1px_1px_rgba(255,255,255,0.05)] focus:outline-none focus:ring-1 focus:ring-white/20 text-slate-100 font-medium placeholder-slate-500 transition-all"
        />
      </div>

      {loading ? (
        <div className="text-slate-400 py-20 text-center font-bold animate-pulse">데이터를 불러오는 중입니다...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 bg-white/60 dark:bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/60 dark:border-white/10 shadow-[inner_0px_1px_1px_rgba(255,255,255,0.1)]">
          <div className="w-20 h-20 mb-5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-4xl shadow-inner animate-float">🔍</div>
          <p className="font-bold text-[15px]">검색된 고객이 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white/60 dark:bg-white/[0.03] backdrop-blur-[40px] rounded-[2.5rem] shadow-[inset_0px_1px_1px_rgba(255,255,255,0.1),0_8px_30px_rgba(0,0,0,0.3)] border border-white/60 dark:border-white/10 relative z-10 group/table transition-all duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
           {/* Glow Effect */}
           <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-300/20 to-transparent blur-3xl rounded-full pointer-events-none opacity-0 group-hover/table:opacity-100 transition-opacity duration-700 -z-10"></div>
           
           <div className="overflow-x-auto w-full custom-scrollbar rounded-[2.5rem]">
             <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="border-b border-white/60 dark:border-white/10">
                <th className="px-8 py-5 text-[13px] font-extrabold text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-transparent">고객명</th>
                <th className="px-8 py-5 text-[13px] font-extrabold text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-transparent">연락처</th>
                <th className="px-8 py-5 text-[13px] font-extrabold text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-transparent">분류</th>
                <th className="px-8 py-5 text-[13px] font-extrabold text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-transparent">정부지원</th>
                <th className="px-8 py-5 text-[13px] font-extrabold text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-transparent">수급구분</th>
                <th className="px-8 py-5 text-[13px] font-extrabold text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-transparent text-right">등록일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.map(c => (
                <tr key={c.id} className="group/row hover:bg-white/60 dark:bg-white/5 transition-all duration-300 cursor-pointer" onClick={() => router.push(`/customers/${c.id}`)}>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 border border-white dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold group-hover/row:scale-110 group-hover/row:from-blue-100 group-hover/row:to-cyan-100 dark:group-hover/row:from-blue-900 dark:group-hover/row:to-cyan-900 group-hover/row:text-blue-600 dark:group-hover/row:text-blue-400 transition-all duration-300">
                        {c.name.charAt(0)}
                      </div>
                      <span className="font-extrabold text-[15px] text-slate-800 dark:text-slate-200 group-hover/row:text-blue-700 dark:group-hover/row:text-blue-400 transition-colors">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-medium text-slate-500 dark:text-slate-400">{c.contactNumber}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1.5 rounded-xl text-[12px] font-black tracking-wide border dark:border-slate-700 shadow-sm ${classificationColors[c.classification as keyof typeof classificationColors] || 'bg-slate-100 text-slate-500 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {labels.classification[c.classification as keyof typeof labels.classification] || c.classification}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-semibold text-slate-500 dark:text-slate-400">
                    {c.governmentSupportType ? labels.governmentSupport[c.governmentSupportType as keyof typeof labels.governmentSupport] || c.governmentSupportType : <span className="opacity-30">-</span>}
                  </td>
                  <td className="px-8 py-5 font-semibold text-slate-500 dark:text-slate-400">
                    {c.recipientType ? labels.recipient[c.recipientType as keyof typeof labels.recipient] || c.recipientType : <span className="opacity-30">-</span>}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="text-[13px] font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl border border-white/80 dark:border-white/10 shadow-sm group-hover/row:border-blue-100 dark:group-hover/row:border-blue-900/50 transition-colors">
                       {new Date(c.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-slide-up" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"></div>

          <div className="relative bg-slate-900/80 backdrop-blur-2xl rounded-[2rem] border border-white/60 dark:border-white/10 shadow-[inset_0px_1px_1px_rgba(255,255,255,0.1),0_30px_60px_rgba(0,0,0,0.5)] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-50 dark:from-slate-800/50 to-transparent pointer-events-none z-0"></div>
            
            <div className="px-8 py-6 border-b border-slate-200/50 dark:border-white/10 flex items-center justify-between shrink-0 relative z-10">
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">새 고객 등록</h2>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto px-8 py-6 relative z-10 custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">이름 <span className="text-red-500">*</span></label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" placeholder="홍길동" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">연락처 <span className="text-red-500">*</span></label>
                  <input type="text" value={form.contactNumber} onChange={e => setForm({ ...form, contactNumber: e.target.value })} className="input" placeholder="010-0000-0000" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">분류</label>
                  <select value={form.classification} onChange={e => setForm({ ...form, classification: e.target.value })} className="input">
                    <option value="SELF">자가</option>
                    <option value="OTHER">타기관</option>
                    <option value="HEARDOTCOM">히어닷컴</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">성별</label>
                  <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="input">
                    <option value="">선택</option>
                    <option value="MALE">남성</option>
                    <option value="FEMALE">여성</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">생년월일</label>
                  <input type="date" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">이메일</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" placeholder="example@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">정부지원유형</label>
                  <select value={form.governmentSupportType} onChange={e => setForm({ ...form, governmentSupportType: e.target.value })} className="input">
                    <option value="">선택</option>
                    <option value="DISABILITY_GRADE_HOLDER">장애등급소지자</option>
                    <option value="POTENTIAL_DISABILITY">장애가망</option>
                    <option value="INDUSTRIAL_ACCIDENT">산업재해</option>
                    <option value="GENERAL">일반</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">수급구분</label>
                  <select value={form.recipientType} onChange={e => setForm({ ...form, recipientType: e.target.value })} className="input">
                    <option value="">선택</option>
                    <option value="RECIPIENT">수급자 (지자체 100%)</option>
                    <option value="NEAR_POVERTY">차상위 (공단 100%)</option>
                    <option value="GENERAL">일반 (공단 90%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">인증유형</label>
                  <select value={form.processType} onChange={e => setForm({ ...form, processType: e.target.value })} className="input">
                    <option value="">선택</option>
                    <option value="PRE_CERTIFICATION">사전인증</option>
                    <option value="POST_CERTIFICATION">사후인증</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">청력장애유형</label>
                  <select value={form.lossType} onChange={e => setForm({ ...form, lossType: e.target.value })} className="input">
                    <option value="">선택</option>
                    <option value="CONDUCTIVE">전음성</option>
                    <option value="SENSORINEURAL">감각신경성</option>
                    <option value="SUDDEN">돌발성</option>
                    <option value="NOISE_INDUCED">소음성</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">유입경로</label>
                  <input type="text" value={form.referralSource} onChange={e => setForm({ ...form, referralSource: e.target.value })} className="input" placeholder="지인추천, 병원등" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">병원</label>
                  <input type="text" value={form.hospitalName} onChange={e => setForm({ ...form, hospitalName: e.target.value })} className="input" placeholder="비뢰 ENT 등" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">메모 (특이사항)</label>
                <textarea value={form.memo} onChange={e => setForm({ ...form, memo: e.target.value })} className="input resize-none h-24" placeholder="작업 환경, 주 관심사, 혹은 방문 시 특이사항 등..." />
              </div>
              
              <div className="px-8 py-6 border-t border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end gap-3 shrink-0 relative z-10">
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                disabled={submitting}
              >
                취소
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="group relative px-6 py-2.5 rounded-xl font-bold text-slate-800 dark:text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 disabled:opacity-50 transition-all overflow-hidden flex items-center justify-center min-w-[100px]"
              >    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 group-hover:scale-105"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    {submitting ? '등록 중...' : '선택 완료 / 등록하기'}
                  </span>
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}