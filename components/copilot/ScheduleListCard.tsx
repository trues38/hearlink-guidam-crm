import { Calendar, ChevronRight, MapPin } from "lucide-react";

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  type: "적합" | "상담" | "수리";
}

interface ScheduleListCardProps {
  date: string;
  schedules: ScheduleItem[];
}

export function ScheduleListCard({ date, schedules }: ScheduleListCardProps) {
  const getBadgeStyle = (type: string) => {
    switch(type) {
      case "적합": return "bg-brand-500/10 text-brand-600 dark:text-brand-400";
      case "상담": return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "수리": return "bg-rose-500/10 text-rose-600 dark:text-rose-400";
      default: return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="mt-2 w-full max-w-sm bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="px-3 py-2 bg-muted-bg/50 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <Calendar className="w-3.5 h-3.5 text-brand-500" />
          {date} 일정
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-background border border-border text-muted font-semibold">총 {schedules.length}건</span>
      </div>

      <div className="divide-y divide-border/50">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="p-3 flex items-start gap-3 hover:bg-muted-bg/30 transition-colors cursor-pointer group">
            <div className="text-xs font-bold text-foreground w-10 shrink-0 pt-0.5">{schedule.time}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getBadgeStyle(schedule.type)}`}>
                  {schedule.type}
                </span>
                <span className="text-xs font-bold text-foreground group-hover:text-brand-500 transition-colors">{schedule.title}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted">
                <MapPin className="w-3 h-3" /> 센터 내방
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted/50 group-hover:text-brand-500 shrink-0 self-center transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
}
