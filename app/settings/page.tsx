"use client";

import { motion } from "framer-motion";
import { User, Building2, Bell, Shield, Save } from "lucide-react";
import { useState } from "react";

const TABS = [
  { id: 'profile', label: '내 프로필', icon: User },
  { id: 'center', label: '센터 정보', icon: Building2 },
  { id: 'notifications', label: '알림 설정', icon: Bell },
  { id: 'security', label: '보안 및 계정', icon: Shield },
] as const;
type TabId = typeof TABS[number]['id'];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  const activeTabData = TABS.find(t => t.id === activeTab)!;
  const ActiveIcon = activeTabData.icon;

  return (
    <div className="space-y-6 md:space-y-8 pb-12 mt-16 md:mt-0">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">설정</h1>
          <p className="text-muted text-sm mt-1">계정 정보 및 센터 환경을 설정합니다.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <button className="flex items-center justify-center gap-2 px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-colors shadow-lg shadow-brand-500/20">
            <Save className="w-4 h-4" />
            <span className="font-medium">변경사항 저장</span>
          </button>
        </motion.div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Sidebar */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="w-full lg:w-64 shrink-0 space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative ${
                  isActive ? 'text-brand-600 dark:text-white font-semibold' : 'text-muted hover:text-foreground hover:bg-muted-bg'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSettingTab"
                    className="absolute inset-0 bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-brand-500' : ''}`} />
                <span className="relative z-10 text-sm">{tab.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Settings Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 glass-card bg-surface p-6 lg:p-8"
        >
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <ActiveIcon className="w-5 h-5 text-brand-500" />
            {activeTabData.label} 설정
          </h2>

          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center gap-6 pb-6 border-b border-border">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-inner">관</div>
                <div>
                  <button className="px-4 py-2 bg-muted-bg border border-border hover:bg-border text-sm font-medium rounded-lg text-foreground transition-colors">프로필 사진 변경</button>
                  <p className="text-xs text-muted mt-2">JPG, GIF, PNG 파일만 지원합니다 (최대 2MB).</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">이름</label>
                  <input type="text" defaultValue="관리자" className="w-full bg-muted-bg border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">이메일 주소</label>
                  <input type="email" defaultValue="test@test.com" disabled className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-muted cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">연락처</label>
                  <input type="text" defaultValue="010-1234-5678" className="w-full bg-muted-bg border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">직급 / 역할</label>
                  <select className="w-full bg-muted-bg border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors appearance-none">
                    <option>센터장</option>
                    <option>청능사</option>
                    <option>실장</option>
                    <option>직원</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2 pt-4">
                <label className="text-sm font-medium text-foreground">자기소개 (선택)</label>
                <textarea rows={4} placeholder="고객에게 노출될 소개글을 입력하세요." className="w-full bg-muted-bg border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors resize-none" />
              </div>
            </div>
          )}

          {activeTab === 'center' && (
            <div className="space-y-6 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">센터명</label>
                  <input type="text" defaultValue="Hearlink 청능센터" className="w-full bg-muted-bg border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">사업자 등록번호</label>
                  <input type="text" defaultValue="123-45-67890" className="w-full bg-muted-bg border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">대표자명</label>
                  <input type="text" defaultValue="홍길동" className="w-full bg-muted-bg border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">주소</label>
                  <input type="text" defaultValue="서울특별시 강남구 테헤란로 123" className="w-full bg-muted-bg border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">대표 전화</label>
                  <input type="text" defaultValue="02-1234-5678" className="w-full bg-muted-bg border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4 max-w-2xl">
              {[
                { label: '적합관리 D-30 대상자 알림', desc: '다가오는 적합관리 대상 고객을 매일 오전 9시에 알림합니다.', defaultChecked: true },
                { label: '신규 예약 알림', desc: '새 일정이 등록될 때 즉시 알림을 받습니다.', defaultChecked: true },
                { label: '재고 부족 경고 알림', desc: '특정 재고가 설정 수량 이하일 때 알림을 보냅니다.', defaultChecked: false },
                { label: '세금계산서 발행 알림', desc: '새 세금계산서가 발행되면 이메일로 알림을 보냅니다.', defaultChecked: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-4 bg-muted-bg/50 border border-border rounded-xl">
                  <div>
                    <p className="font-medium text-foreground text-sm">{item.label}</p>
                    <p className="text-xs text-muted mt-0.5">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
                    <input type="checkbox" defaultChecked={item.defaultChecked} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 max-w-2xl">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">비밀번호 변경</h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">현재 비밀번호</label>
                  <input type="password" placeholder="현재 비밀번호 입력" className="w-full bg-muted-bg border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">새 비밀번호</label>
                  <input type="password" placeholder="새 비밀번호 입력 (8자 이상)" className="w-full bg-muted-bg border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">새 비밀번호 확인</label>
                  <input type="password" placeholder="새 비밀번호 재입력" className="w-full bg-muted-bg border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors" />
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold text-foreground mb-3">로그인 세션</h3>
                <div className="p-4 bg-muted-bg/50 border border-border rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">현재 기기 (Mac OS · Chrome)</p>
                    <p className="text-xs text-muted mt-0.5">서울 · 마지막 활동 방금 전</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-500">현재 세션</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

