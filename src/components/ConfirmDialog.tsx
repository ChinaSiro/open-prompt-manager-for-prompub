import { X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: "warning" | "delete" | "publish";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "You can update the prompt anytime, but careful, we have a auto-save feature that will overwrite your changes.",
  confirmText = "Edit",
  cancelText = "Exit",
  type = "warning",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const getIconConfig = () => {
    switch (type) {
      case "delete":
        return {
          bgColor: "#ef4444",
          icon: (
            <svg viewBox="0 0 24 24" className="w-10 h-10" fill="white">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </svg>
          ),
          emoji: "🗑️",
        };
      case "publish":
        return {
          bgColor: "#3fda8c",
          icon: (
            <svg viewBox="0 0 24 24" className="w-10 h-10" fill="white">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          ),
          emoji: "🚀",
        };
      default: // warning
        return {
          bgColor: "#ffd700",
          icon: (
            <svg viewBox="0 0 24 24" className="w-10 h-10">
              <path
                fill="black"
                d="M12 2L1 21h22L12 2zm0 3.83L19.53 19H4.47L12 5.83zM11 16v2h2v-2h-2zm0-6v4h2v-4h-2z"
              />
            </svg>
          ),
          emoji: "😟",
        };
    }
  };

  const iconConfig = getIconConfig();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-[#2a2a35] border border-white/10 rounded-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Title */}
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            {title}
          </h2>

          {/* Icon and Message */}
          <div className="flex flex-col items-center mb-6">
            {/* Icon with Card */}
            <div className="relative mb-6">
              {/* Card */}
              <div className="w-32 h-20 bg-[#3f3f3f] rounded-lg relative">
                {/* Lines on card */}
                <div className="absolute top-4 left-4 right-8 space-y-2">
                  <div className="h-1 bg-[#5a5a5a] rounded" />
                  <div className="h-1 bg-[#5a5a5a] rounded w-3/4" />
                  <div className="h-1 bg-[#5a5a5a] rounded w-1/2" />
                </div>
              </div>

              {/* Icon Circle */}
              <div
                className="absolute -right-4 -top-2 w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: iconConfig.bgColor }}
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  {iconConfig.icon}
                </div>
              </div>

              {/* Emoji */}
              <div className="absolute -right-8 top-12 w-10 h-10 bg-[#4a4a4a] rounded-full flex items-center justify-center">
                <span className="text-2xl">{iconConfig.emoji}</span>
              </div>
            </div>

            {/* Message */}
            <p className="text-center text-gray-300 text-sm leading-relaxed max-w-sm">
              {message}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-transparent border border-white/20 text-white font-semibold py-3 rounded-full hover:bg-white/5 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 text-white font-semibold py-3 rounded-full transition-colors"
              style={{
                backgroundColor: iconConfig.bgColor,
                color: type === "publish" ? "black" : "white",
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
