'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function InventoryPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/inventory/batteries')
  }, [router])
  
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-slate-400">재고 관리 페이지로 이동 중...</div>
    </div>
  )
}