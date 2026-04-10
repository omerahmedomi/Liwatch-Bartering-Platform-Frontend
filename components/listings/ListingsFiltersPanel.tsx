import {
  Clock,
  Package,
  Search,
  SlidersHorizontal,
  Zap,
} from "lucide-react";

type Props = {
  categories: string[];
  categoryFilter: string;
  exchangeFilter: string;
  searchQuery: string;
  typeFilter: string;
  onCategoryFilterChange: (value: string) => void;
  onExchangeFilterChange: (value: string) => void;
  onSearchQueryChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
};

export default function ListingsFiltersPanel({
  categories,
  categoryFilter,
  exchangeFilter,
  searchQuery,
  typeFilter,
  onCategoryFilterChange,
  onExchangeFilterChange,
  onSearchQueryChange,
  onTypeFilterChange,
}: Props) {
  return (
    <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-slate-100 mb-8 sticky top-20 z-30">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search items, services, or skills..."
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            className="w-full bg-slate-50 pl-12 pr-4 py-4 rounded-2xl border-none text-slate-900 placeholder:text-slate-400 font-medium focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
          />
        </div>

        <div className="flex overflow-x-auto hide-scrollbar gap-2 shrink-0 items-center">
          <div className="flex bg-slate-50 p-1 rounded-2xl shrink-0">
            <button
              onClick={() => onTypeFilterChange("ALL")}
              className={`px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                typeFilter === "ALL"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => onTypeFilterChange("ITEM")}
              className={`flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                typeFilter === "ITEM"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Package size={16} /> Items
            </button>
            <button
              onClick={() => onTypeFilterChange("SERVICE")}
              className={`flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                typeFilter === "SERVICE"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Zap size={16} /> Services
            </button>
          </div>

          <button
            onClick={() =>
              onExchangeFilterChange(
                exchangeFilter === "TEMPORARY" ? "ALL" : "TEMPORARY",
              )
            }
            className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all border shrink-0 ${
              exchangeFilter === "TEMPORARY"
                ? "bg-amber-50 border-amber-200 text-amber-600"
                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
          >
            <Clock size={16} /> Temp Only
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto hide-scrollbar gap-2 mt-4 pt-4 border-t border-slate-100 items-center">
        <SlidersHorizontal
          size={16}
          className="text-slate-400 shrink-0 ml-2 mr-1"
        />
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryFilterChange(category)}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all shrink-0 ${
              categoryFilter === category
                ? "bg-slate-900 text-white"
                : "bg-slate-50 text-slate-500 hover:bg-slate-100"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
