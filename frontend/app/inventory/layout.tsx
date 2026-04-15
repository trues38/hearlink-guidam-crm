'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  const tabs = [
    { href: '/inventory/batteries', label: '배터리' },
    { href: '/inventory/accessories', label: '부품/액세서리' }
  ]

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">재고 관리</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">배터리 및 부품 현황</p>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-1 inline-flex">
        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === tab.href 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {children}
    </div>
  )
}