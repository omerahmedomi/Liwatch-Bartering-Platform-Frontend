import { X } from "lucide-react";
type Props = {
  errorMessage: string;
  clearError:()=>void;
};
export default function ErrorDisplay({ errorMessage,clearError }: Props) {
  return (
    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="mt-0.5">
        <svg
          className="size-5 text-rose-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div className="flex-1 text-sm font-medium text-rose-800">
        {errorMessage}
      </div>
      <button
        onClick={() => clearError()}
        className="text-rose-400 cursor-pointer hover:text-rose-600 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}
