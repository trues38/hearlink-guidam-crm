import { User, Phone, Ear, FileText } from "lucide-react";
import Link from "next/link";

interface CustomerSummaryCardProps {
  id: string;
  name: string;
  phone: string;
  device?: string;
  lastVisit?: string;
}

export function CustomerSummaryCard({ id, name, phone, device, lastVisit }: CustomerSummaryCardProps) {
  return (
    <div className="mt-2 w-full max-w-sm bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-3 bg-brand-500/5 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center">
            <User className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">{name} 고객</h4>
            <div className="flex items-center gap-1 text-[10px] text-muted font-medium">
              <Phone className="w-3 h-3" />
              {phone}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-3 space-y-2 text-xs">
        {device && (
          <div className="flex justify-between items-center">
            <span className="text-muted flex items-center gap-1"><Ear className="w-3 h-3"/> 현재 착용 기기</span>
            <span className="font-semibold text-foreground px-2 py-0.5 bg-muted-bg rounded">{device}</span>
          </div>
        )}
        {lastVisit && (
          <div className="flex justify-between items-center">
            <span className="text-muted flex items-center gap-1"><FileText className="w-3 h-3"/> 최근 방문일</span>
            <span className="font-semibold text-foreground">{lastVisit}</span>
          </div>
        )}
      </div>

      <div className="p-2 bg-muted-bg/50 border-t border-border flex gap-2">
        <Link href={`/customers/${id}`} className="flex-1 text-center py-1.5 bg-white dark:bg-background border border-border rounded-lg text-xs font-bold text-foreground hover:bg-muted-bg transition-colors shadow-sm">
          상세 프로필 보기
        </Link>
        <button className="flex-1 py-1.5 bg-brand-500 text-white rounded-lg text-xs font-bold hover:bg-brand-600 transition-colors shadow-sm">
          일정 추가하기
        </button>
      </div>
    </div>
  );
}
