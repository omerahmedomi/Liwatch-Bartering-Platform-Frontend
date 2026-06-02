import { Loader2 } from "lucide-react";

type Props = {
  loading: boolean;
  termsAgreed: boolean;
  onTermsChange: (checked: boolean) => void;
};

export default function CreatePostPublishSection({
  loading,
  termsAgreed,
  onTermsChange,
}: Props) {
  return (
    <div className="space-y-6">
      <label className="flex items-start gap-4 cursor-pointer group px-4">
        <input
          type="checkbox"
          checked={termsAgreed}
          className="mt-1 size-5 rounded-md border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          onChange={(event) => onTermsChange(event.target.checked)}
        />
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
          I acknowledge that this post complies with platform guidelines and I
          understand a
          <span className="text-indigo-600 font-bold"> Digital Agreement</span>
          {" "}is required for the exchange.
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 py-5 rounded-4xl font-black uppercase tracking-[0.2em] hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white hover:shadow-[0_20px_50px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center gap-3 disabled:bg-slate-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" /> Verifying & Uploading...
          </>
        ) : (
          "Publish Listing"
        )}
      </button>
    </div>
  );
}
