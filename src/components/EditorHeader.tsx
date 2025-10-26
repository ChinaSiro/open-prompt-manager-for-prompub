import { useNavigate } from "react-router-dom";
import { Github } from "lucide-react";

export function EditorHeader() {
  const navigate = useNavigate();

  const handleNewPrompt = () => {
    navigate("/prompt-editor");
  };

  const handleGoToRepository = () => {
    navigate("/my-prompts");
  };

  const handleLogoClick = () => {
    navigate("/my-prompts");
  };

  return (
    <header className="bg-[#2C2A2F] rounded-xl flex-shrink-0">
      <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 lg:gap-4 flex-wrap">
        <div
          onClick={handleLogoClick}
          className="flex flex-col items-start gap-0.5 sm:gap-1 cursor-pointer select-none"
        >
          <div
            className="text-xl sm:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-[#3fda8c]"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            PromPub
          </div>
          <div className="w-full h-0.5 sm:h-1 bg-[#3fda8c] rounded-full"></div>
        </div>
        <span className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-gray-400 hidden sm:inline">
          创作中心
        </span>
        <button
          onClick={handleGoToRepository}
          className="bg-[#3f3f3f] text-white px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-1.5 lg:py-2 rounded-lg font-semibold flex items-center gap-1.5 sm:gap-2 hover:bg-[#4a4a4a] transition-colors text-xs sm:text-sm lg:text-base"
        >
          <span>我的仓库</span>
        </button>
        <button
          onClick={handleNewPrompt}
          className="bg-[#3fda8c] text-black px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-1.5 lg:py-2 rounded-lg font-semibold flex items-center gap-1.5 sm:gap-2 hover:bg-[#35c77a] transition-colors text-xs sm:text-sm lg:text-base"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="sm:w-4 sm:h-4"
          >
            <path
              d="M8 2L8 14M2 8L14 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span>新建</span>
        </button>

        {/* 右侧导航链接 */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <a
            href="https://prompub.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#3fda8c] hover:text-[#35c77a] transition-colors text-xs sm:text-sm lg:text-base font-semibold whitespace-nowrap"
          >
            Prompub Demo
          </a>
          <a
            href="https://github.com/ChinaSiro/open-prompt-manager-for-prompub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors p-1.5 sm:p-2 rounded-lg hover:bg-[#3f3f3f]"
            title="GitHub Repository"
          >
            <Github className="w-4 h-4 sm:w-5 sm:h-5" />
          </a>
        </div>
      </div>
    </header>
  );
}
