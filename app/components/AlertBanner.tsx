"use client";

interface Props {
  onRefresh: () => void;
  onClose: () => void;
}

export default function AlertBanner({ onRefresh, onClose }: Props) {
  function handleClick() {
    onRefresh();
    onClose();
  }

  return (
    <button
      onClick={handleClick}
      className="w-full bg-blue-900 border border-blue-700 text-blue-200 text-sm rounded-lg p-3 hover:bg-blue-800 transition-colors text-left flex items-center justify-between"
    >
      <span>🔔 새로운 이상이 감지되었습니다. 새로고침하려면 클릭하세요.</span>
      <span
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="ml-4 text-blue-400 hover:text-white text-lg leading-none"
        aria-label="닫기"
      >
        ×
      </span>
    </button>
  );
}
