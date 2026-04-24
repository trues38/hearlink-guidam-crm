"use client";

import Modal from "@/components/Modal";
import { useState } from "react";
import { motion } from "framer-motion";

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InventoryModal({ isOpen, onClose }: InventoryModalProps) {
  const [tab, setTab] = useState<'aid' | 'battery' | 'accessory'>('aid');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="재고 등록" maxWidth="max-w-3xl">
      <div className="flex gap-4 border-b border-border mb-6 px-1">
        {[
          { id: 'aid', label: '보청기' },
          { id: 'battery', label: '배터리' },
          { id: 'accessory', label: '악세사리' },
        ].map((t) => (
          <button 
            key={t.id} 
            onClick={() => setTab(t.id as 'aid' | 'battery' | 'accessory')} 
            className={`pb-3 text-sm font-medium transition-colors relative ${tab === t.id ? 'text-brand-600 dark:text-brand-400' : 'text-muted hover:text-foreground'}`}
          >
            {t.label}
            {tab === t.id && <motion.div layoutId="invTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500" />}
          </button>
        ))}
      </div>

      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
        {tab === 'aid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">구분 <span className="text-rose-500">*</span></label>
              <div className="flex gap-4">
                {['일반 보청기', '정부지원 보청기', '중고 보청기'].map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="aid_type" className="text-brand-500 focus:ring-brand-500" defaultChecked={type === '일반 보청기'} />
                    <span className="text-sm text-foreground">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">브랜드 명 <span className="text-rose-500">*</span></label>
              <select className="w-full bg-muted-bg border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors appearance-none">
                <option>오티콘</option>
                <option>스타키</option>
                <option>포낙</option>
                <option>벨톤</option>
                <option>와이덱스</option>
                <option>시그니아</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">모델 명 <span className="text-rose-500">*</span></label>
              <input required type="text" placeholder="모델명 입력" className="w-full bg-muted-bg border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">형태 <span className="text-rose-500">*</span></label>
              <select className="w-full bg-muted-bg border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors appearance-none">
                <option>RIC (오픈형)</option>
                <option>BTE (귀걸이형)</option>
                <option>ITC (귓속형)</option>
                <option>CIC (고막형)</option>
                <option>IIC (초소형)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">시리얼 넘버 <span className="text-rose-500">*</span></label>
              <input required type="text" placeholder="S/N 입력" className="w-full bg-muted-bg border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">좌우 <span className="text-rose-500">*</span></label>
              <select className="w-full bg-muted-bg border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors appearance-none">
                <option>좌측 (Left)</option>
                <option>우측 (Right)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">색상 <span className="text-rose-500">*</span></label>
              <select className="w-full bg-muted-bg border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors appearance-none">
                <option>스킨 (Skin)</option>
                <option>블랙 (Black)</option>
                <option>실버 (Silver)</option>
                <option>그레이 (Gray)</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2 flex items-center gap-2 pt-2">
              <input type="checkbox" id="heardotcom" className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 border-border bg-muted-bg" />
              <label htmlFor="heardotcom" className="text-sm font-medium text-foreground cursor-pointer">히어닷컴 전용 모델입니다.</label>
            </div>
          </div>
        )}

        {tab !== 'aid' && (
          <div className="p-12 text-center text-muted border border-dashed border-border rounded-xl bg-muted-bg/50">
            {tab === 'battery' ? '배터리' : '악세사리'} 항목은 현재 스펙 준비중입니다.
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-6 border-t border-border">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted-bg transition-colors">
            취소
          </button>
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-sm font-medium text-white transition-colors shadow-lg shadow-brand-500/20">
            등록
          </button>
        </div>
      </form>
    </Modal>
  );
}
