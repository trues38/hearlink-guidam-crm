import { CheckCircle2, Edit3, Loader2, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface ActionConfirmationCardProps {
  title: string;
  description: string;
  onConfirm?: () => Promise<void> | void;
  onCancel?: () => void;
}

export function ActionConfirmationCard({
  title,
  description,
  onConfirm,
  onCancel,
}: ActionConfirmationCardProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleConfirm = async () => {
    setStatus("loading");
    setErrorMessage("");

    try {
      await onConfirm?.();
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("승인 처리 중 오류가 발생했어요. 다시 시도해주세요.");
    }
  };

  if (status === "success") {
    return (
      <div className="mt-2 w-full max-w-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
        <div>
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">성공적으로 처리되었습니다!</p>
          <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">{title} 작업이 완료되었습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 w-full max-w-sm bg-surface border border-border rounded-xl shadow-sm p-3">
      <h4 className="text-xs font-bold text-foreground mb-1">{title}</h4>
      <p className="text-[11px] text-muted leading-relaxed mb-3">{description}</p>

      {status === "error" && (
        <div className="mb-3 text-[10px] rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-600 px-2 py-1.5 flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3" />
          {errorMessage}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleConfirm}
          disabled={status === "loading"}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-brand-500 text-white rounded-lg text-xs font-bold hover:bg-brand-600 transition-colors shadow-sm disabled:opacity-70"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" /> 처리 중...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3 h-3" /> 승인 / 실행
            </>
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={status === "loading"}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-muted-bg hover:bg-border text-foreground rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
        >
          <Edit3 className="w-3 h-3" /> 직접 수정
        </button>
      </div>
    </div>
  );
}
