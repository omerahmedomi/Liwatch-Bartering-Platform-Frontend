import type { Dispatch, SetStateAction } from "react";

import { CreatePostFormState } from "./createPostForm.types";

type Props = {
  formData: CreatePostFormState;
  setFormData: Dispatch<SetStateAction<CreatePostFormState>>;
};

export default function ItemTradeDetailsFields({
  formData,
  setFormData,
}: Props) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
            Item Condition
          </label>
          <div className="flex p-1.5 bg-slate-100 rounded-2xl">
            {(["NEW", "USED"] as const).map((condition) => (
              <button
                key={condition}
                type="button"
                onClick={() =>
                  setFormData((current) => ({
                    ...current,
                    item: { ...current.item, condition },
                  }))
                }
                className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${
                  formData.item.condition === condition
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                {condition}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
            Estimated Value (Optional)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">
              ETB
            </span>
            <input
              type="number"
              value={formData.item.estimatedValue}
              placeholder="0.00"
              className="w-full pl-14 pr-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 focus:border-indigo-200 outline-none font-bold text-sm"
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  item: {
                    ...current.item,
                    estimatedValue: event.target.value,
                  },
                }))
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-slate-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
              Barter Type
            </label>
            <div className="flex p-1.5 bg-slate-100 rounded-2xl">
              {(["PERMANENT", "TEMPORARY"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setFormData((current) => ({
                      ...current,
                      exchangeType: type,
                    }))
                  }
                  className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${
                    formData.exchangeType === type
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-indigo-50/50 rounded-4xl border border-indigo-100/50">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm font-bold text-slate-900">
              Accept Partial Cash?
            </p>
            <p className="text-[10px] text-slate-500 font-medium mt-1">
              To balance an uneven trade
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setFormData((current) => ({
                ...current,
                item: {
                  ...current.item,
                  partialCashAllowed: !current.item.partialCashAllowed,
                },
              }))
            }
            className={`w-14 h-8 rounded-full transition-all relative ${
              formData.item.partialCashAllowed ? "bg-indigo-500" : "bg-slate-200"
            }`}
          >
            <div
              className={`absolute top-1 size-6 rounded-full bg-white shadow-sm transition-all ${
                formData.item.partialCashAllowed ? "left-7" : "left-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
