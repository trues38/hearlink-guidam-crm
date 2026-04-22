"use client";

import Modal from "@/components/Modal";
import { useState } from "react";

interface MemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MemoModal({ isOpen, onClose }: MemoModalProps) {
  const [category, setCategory] = useState('일반상담');

  const needsDevice = category === '피팅/적합' || category === '수리' || category === '서류관리';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="새 업무/메모 작성" maxWidth="max-w-2xl">
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">카테고리 <span className="text-rose-500">*</span></label>
          <div className="flex flex-wrap gap-3">
            {['일반상담', '피팅/적합', '수리', '서류관리', '배터리/소모품'].map(cat => (
              <label key={cat} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${category === cat ? 'bg-brand-500/10 border-brand-500/30 text-brand-600 dark:text-brand-400' : 'bg-surface border-border text-foreground hover:bg-muted-bg'}`}>
                <input 
                  type="radio" 
                  name="memo_category" 
                  checked={category === cat}
                  onChange={() => setCategory(cat)}
                  className="text-brand-500 focus:ring-brand-500 bg-muted-bg border-border" 
                />
                <span className="text-sm font-medium">{cat}</span>
              </label>
            ))}
          </div>
        </div>

        {needsDevice && (
          <div className="space-y-2 p-4 bg-muted-bg/50 border border-border rounded-xl">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              관련 기기 선택 <span className="text-rose-500">*</span>
              <span className="text-xs font-normal text-muted bg-surface px-2 py-0.5 rounded border border-border">보청기 관련 업무 시 필수 선택</span>
            </label>
            <select required className="w-full mt-2 bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors appearance-none">
              <option value="">보청기를 선택하세요...</option>
              <option value="1">오티콘 리얼 1 (양이) - 2026.02.10 구매</option>
              <option value="2">과거 모델 (우측) - 2021.05 구매</option>
            </select>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">상세 내용 <span className="text-rose-500">*</span></label>
          <textarea required rows={5} placeholder="상담 내용, 피팅 값 조절 내역, 수리 내역 등을 상세히 입력하세요." className="w-full bg-muted-bg border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors resize-none" />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-6 border-t border-border">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted-bg transition-colors">
            취소
          </button>
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-sm font-medium text-white transition-colors shadow-lg shadow-brand-500/20">
            저장하기
          </button>
        </div>
      </form>
    </Modal>
  );
}
