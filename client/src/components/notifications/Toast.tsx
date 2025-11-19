import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";

export interface ToastProps {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  onClose: (id: string) => void;
  duration?: number;
}

export function Toast({ id, type, title, message, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
  };

  const colors = {
    success: "bg-green-50 border-green-200 text-green-900",
    error: "bg-red-50 border-red-200 text-red-900",
    info: "bg-blue-50 border-blue-200 text-blue-900",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
  };

  const iconColors = {
    success: "text-green-600",
    error: "text-red-600",
    info: "text-blue-600",
    warning: "text-yellow-600",
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${colors[type]} shadow-lg animate-in fade-in slide-in-from-top-2 duration-300`}
      role="alert"
    >
      <div className={`flex-shrink-0 ${iconColors[type]}`}>{icons[type]}</div>
      <div className="flex-1">
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-sm opacity-90 mt-1">{message}</p>
      </div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Close notification"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
