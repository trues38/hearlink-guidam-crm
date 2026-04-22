"use client";

import Modal from "@/components/Modal";

interface CustomerDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerDeviceModal({ isOpen, onClose }: CustomerDeviceModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="고객 기기 추가" maxWidth="max-w-2xl">
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
        <div className="bg-muted-bg/50 p-4 rounded-xl border border-border mb-4">
          <p className="text-sm text-foreground font-medium mb-1">안내</p>
          <p className="text-xs text-muted">고객이 타 센터에서 구매했거나, 재고와 무관하게 수기로 기기를 등록할 때 사용합니다. 센터의 재고를 출고처리 하려면 재고관리 메뉴를 이용하세요.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">브랜드 <span className="text-rose-500">*</span></label>
            <select required className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors appearance-none">
              <option value="">선택하세요</option>
              <option>오티콘</option>
              <option>스타키</option>
              <option>포낙</option>
              <option>벨톤</option>
              <option>와이덱스</option>
              <option>시그니아</option>
              <option>기타</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">형태 <span className="text-rose-500">*</span></label>
            <select required className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors appearance-none">
              <option value="">선택하세요</option>
              <option>RIC (오픈형)</option>
              <option>BTE (귀걸이형)</option>
              <option>ITC (귓속형)</option>
              <option>CIC (고막형)</option>
              <option>IIC (초소형)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">모델명 <span className="text-rose-500">*</span></label>
            <input required type="text" placeholder="예: 오티콘 리얼 1" className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">착용 방향 <span className="text-rose-500">*</span></label>
            <select required className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors appearance-none">
              <option value="">선택하세요</option>
              <option>좌측 (Left)</option>
              <option>우측 (Right)</option>
              <option>양이 (Bilateral)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">시리얼 넘버 (S/N)</label>
            <input type="text" placeholder="입력하세요" className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">구매 일자</label>
            <input type="date" className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors" />
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-border">
          <label className="text-sm font-medium text-foreground block">기기 태그 속성</label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer w-fit">
              <input type="checkbox" className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 border-border bg-muted-bg" />
              <span className="text-sm text-foreground">주 착용 기기 (대표 기기)로 설정합니다.</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer w-fit">
              <input type="checkbox" className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 border-border bg-muted-bg" />
              <span className="text-sm text-foreground">정부지원(건강보험)으로 구매한 기기입니다.</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-6 border-t border-border">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted-bg transition-colors">
            취소
          </button>
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-sm font-medium text-white transition-colors shadow-lg shadow-brand-500/20">
            기기 등록
          </button>
        </div>
      </form>
    </Modal>
  );
}
