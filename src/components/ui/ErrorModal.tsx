import { useEffect, useState } from "react";

interface ErrorModalProps {
  message: string;
  onClose: () => void;
}

export function ErrorModal({ message, onClose }: ErrorModalProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const duration = 15000;
    const interval = 100;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-lg p-6 max-w-sm w-full mx-4 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-zinc-900 font-semibold text-sm">Transaction Failed</h3>
            <p className="text-zinc-600 text-sm">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>
        <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-400 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}