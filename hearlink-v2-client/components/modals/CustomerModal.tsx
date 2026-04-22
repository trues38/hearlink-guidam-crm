"use client";

import Modal from "@/components/Modal";
import { useState } from "react";
import { Search } from "lucide-react";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerModal({ isOpen, onClose }: CustomerModalProps) {
  const [gender, setGender] = useState<'남성' | '여성'>('남성');
  const [channel, setChannel] = useState('선택 안함');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="신규 고객 등록" maxWidth="max-w-3xl">
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">이름 <span className="text-rose-500">*</span></label>
            <input required type="text" placeholder="이름 입력" className="w-full bg-muted-bg border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">성별 <span className="text-rose-500">*</span></label>
            <div className="flex bg-muted-bg border border-border rounded-lg p-1">
              <button type="button" onClick={() => setGender('남성')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${gender === '남성' ? 'bg-surface shadow text-brand-600 dark:text-brand-400' : 'text-muted hover:text-foreground'}`}>남성</button>
              <button type="button" onClick={() => setGender('여성')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${gender === '여성' ? 'bg-surface shadow text-brand-600 dark:text-brand-400' : 'text-muted hover:text-foreground'}`}>여성</button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">휴대폰 번호 <span className="text-rose-500">*</span></label>
            <input required type="tel" placeholder="010-0000-0000" className="w-full bg-muted-bg border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">주민등록번호</label>
            <input type="text" placeholder="(-) 없이 입력" className="w-full bg-muted-bg border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">생년월일</label>
            <input type="text" placeholder="YYYYMMDD" className="w-full bg-muted-bg border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">이메일</label>
            <input type="email" placeholder="example@email.com" className="w-full bg-muted-bg border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">유입 경로</label>
                <select 
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full bg-muted-bg border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors appearance-none"
                >
                  <option>선택 안함</option>
                  <option>지인 소개</option>
                  <option>인터넷 검색</option>
                  <option>SNS (블로그, 인스타)</option>
                  <option>전단지/현수막</option>
                </select>
              </div>

              {channel === '지인 소개' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">추천인 (기존 고객 검색)</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input type="text" placeholder="이름 또는 연락처로 검색..." className="w-full bg-surface border border-brand-500/50 ring-2 ring-brand-500/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-foreground">ENT 병원</label>
            <input type="text" placeholder="병원명 입력" className="w-full bg-muted-bg border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">메모</label>
          <textarea rows={3} placeholder="고객에 대한 특이사항이나 메모를 입력하세요." className="w-full bg-muted-bg border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors resize-none" />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-6 border-t border-border">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted-bg transition-colors">
            취소
          </button>
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-sm font-medium text-white transition-colors shadow-lg shadow-brand-500/20">
            확인
          </button>
        </div>
      </form>
    </Modal>
  );
}
