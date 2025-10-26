import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    // 进度条动画
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - 100 / (duration / 50);
        return newProgress > 0 ? newProgress : 0;
      });
    }, 50);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [duration, onClose]);

  return (
    <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right-5 fade-in duration-300">
      <div
        className={`relative overflow-hidden flex items-center gap-4 px-6 py-4 rounded-2xl shadow-xl border-2 min-w-[350px] max-w-[450px] transition-transform hover:scale-[1.02] ${
          type === "success"
            ? "bg-[#2C2A2F] border-[#3fda8c]"
            : "bg-[#2C2A2F] border-red-500"
        }`}
      >
        {/* 进度条 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700/50">
          <div
            className={`h-full transition-all ease-linear ${
              type === "success" ? "bg-[#3fda8c]" : "bg-red-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="relative flex-shrink-0">
          {type === "success" ? (
            <CheckCircle
              className="text-[#3fda8c]"
              size={28}
              strokeWidth={2.5}
            />
          ) : (
            <AlertCircle className="text-red-500" size={28} strokeWidth={2.5} />
          )}
        </div>

        <p className="relative flex-1 text-base font-semibold text-white">
          {message}
        </p>

        <button
          onClick={onClose}
          className="relative flex-shrink-0 text-gray-400 hover:text-white transition-all hover:rotate-90 duration-200"
        >
          <X size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
