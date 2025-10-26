/**
 * TabButton 组件
 */

interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

export function TabButton({ icon, label, active, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg lg:mb-2 transition-colors whitespace-nowrap lg:w-full ${
        active
          ? "bg-[#1f1f1f] text-white"
          : "text-gray-400 hover:bg-[#1f1f1f] hover:text-white"
      }`}
    >
      {icon}
      <span className="font-medium text-[13px]">{label}</span>
    </button>
  );
}
