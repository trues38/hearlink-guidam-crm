"use client";

import { motion } from "framer-motion";
import { Search, UserPlus, Filter, MoreVertical, Phone, Calendar } from "lucide-react";
import { useState } from "react";
import CustomerModal from "@/components/modals/CustomerModal";
import Link from "next/link";

export default function CustomersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const mockCustomers = [
    { id: 1, name: '김철수', initial: '김', age: 65, gender: '남', chartNo: 'CUST-001', phone: '010-1234-5671', lastVisit: '2026-04-11', device: '오티콘 리얼 1', grade: 'VIP' },
    { id: 2, name: '이영희', initial: '이', age: 72, gender: '여', chartNo: 'CUST-002', phone: '010-1234-5672', lastVisit: '2026-04-12', device: '스타키 이볼브', grade: '' },
    { id: 3, name: '박지민', initial: '박', age: 58, gender: '남', chartNo: 'CUST-003', phone: '010-1234-5673', lastVisit: '2026-04-13', device: '포낙 오데오', grade: '' },
    { id: 4, name: '정동원', initial: '정', age: 68, gender: '남', chartNo: 'CUST-004', phone: '010-1234-5674', lastVisit: '2026-04-14', device: '오티콘 리얼 1', grade: 'VIP' },
    { id: 5, name: '최수진', initial: '최', age: 45, gender: '여', chartNo: 'CUST-005', phone: '010-1234-5675', lastVisit: '2026-04-15', device: '와이덱스 모멘트', grade: '' },
    { id: 6, name: '한미영', initial: '한', age: 61, gender: '여', chartNo: 'CUST-006', phone: '010-1234-5676', lastVisit: '2026-04-16', device: '벨톤 어마이즈', grade: '' },
  ];

  const filteredCustomers = mockCustomers.filter(c =>
    c.name.includes(searchQuery) || c.phone.includes(searchQuery) || c.chartNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 md:space-y-8 pb-12 mt-16 md:mt-0">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">고객조회</h1>
          <p className="text-muted text-sm mt-1">등록된 전체 고객을 검색하고 관리합니다.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full md:w-auto">
          <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-colors shadow-lg shadow-brand-500/20">
            <UserPlus className="w-4 h-4" />
            <span className="font-medium">신규 고객 등록</span>
          </button>
        </motion.div>
      </header>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="glass-card bg-surface p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="고객명, 연락처, 차트번호로 검색..." 
            className="w-full bg-muted-bg border border-border rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-3 bg-muted-bg border border-border hover:bg-border rounded-xl text-foreground transition-colors shrink-0">
          <Filter className="w-4 h-4" />
          <span>상세 필터</span>
        </button>
      </motion.div>

      {/* Customer List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 && (
          <div className="col-span-3 text-center py-16 text-muted">
            <p className="text-lg font-medium">검색 결과가 없습니다.</p>
            <p className="text-sm mt-1">다른 키워드로 다시 검색해 보세요.</p>
          </div>
        )}
        {filteredCustomers.map((c) => (
          <Link href={`/customers/${c.id}`} key={c.id} className="glass-card bg-surface p-5 group hover:border-brand-500/30 cursor-pointer block">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-lg">
                  {c.initial}
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                    {c.name} {c.grade && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">{c.grade}</span>}
                  </h3>
                  <p className="text-xs text-muted">{c.chartNo} • {c.age}세 ({c.gender})</p>
                </div>
              </div>
              <button className="text-muted hover:text-foreground" onClick={(e) => e.preventDefault()}>
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Phone className="w-4 h-4 text-muted" />
                {c.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Calendar className="w-4 h-4 text-muted" />
                최근 방문: {c.lastVisit}
              </div>
            </div>
            
            <div className="pt-4 border-t border-border flex justify-between items-center">
              <span className="text-xs text-muted">주착용기기: {c.device}</span>
              <button className="text-sm text-brand-500 hover:text-brand-600 font-medium">상세보기</button>
            </div>
          </Link>
        ))}
      </motion.div>

      <CustomerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
