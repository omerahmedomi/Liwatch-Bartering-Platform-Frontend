"use client";
import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, PackageX } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function InventoryTab({
  wantedPostId,
  onSuccess,
  user,
  requestedUser
}: {
  wantedPostId: number;
  onSuccess: () => void;
  user:any;
  requestedUser:any;
}) {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  console.log("invernotry user",user)

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await api.get(`/api/post/userPost/${user?.id}`);
        
        setInventory(res.data.content);
      } catch (error) {
        toast.error("Failed to load your inventory");
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);
 console.log("invernotry", inventory);
  const handleSubmit = async () => {
    if (!selectedPostId) return;
    setIsSubmitting(true);
    try {
      await api.post("/api/direct-swap/send-request", {
        receiverId:requestedUser?.id,
         requestedPostId:wantedPostId,
        offeredPostId: selectedPostId,
      });
      toast.success("Barter Request Sent!", {
        className: "border-l-4 border-indigo-500 font-bold",
      });
      onSuccess(); 
    } catch (error) {
      toast.error("Failed to send request. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mb-2" size={32} />
        <span className="text-xs font-bold uppercase tracking-widest">
          Loading Inventory...
        </span>
      </div>
    );
  }

  //if user has no active public listings
  if (inventory.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center px-8 text-center">
        <PackageX size={48} strokeWidth={1} className="text-slate-300 mb-4" />
        <h3 className="text-slate-900 font-black mb-2">No Active Listings</h3>
        <p className="text-sm text-slate-500 font-medium mb-6">
          You don't have any public items to trade. Use the{" "}
          <strong>Quick Offer</strong> tab to propose something instantly!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 pb-28">
        {inventory.map((item) => {
          const isSelected = selectedPostId === item.postId;
          return (
            <div
              key={item.postId}
              onClick={() => setSelectedPostId(item.postId)}
              className={`relative bg-white p-4 rounded-2xl border-2 transition-all cursor-pointer flex gap-4 items-center ${
                isSelected
                  ? "border-indigo-600 shadow-md shadow-indigo-100"
                  : "border-slate-100 hover:border-slate-300"
              }`}
            >
              <div className="size-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                {item.mediaList?.[0] ? (
                  <img
                    src={item.mediaList[0].mediaUrl}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 truncate text-sm">
                  {item.title}
                </h4>
                <p className="text-[10px] font-black uppercase text-slate-400 mt-1">
                  {item.category}
                </p>
              </div>
              
              <div
                className={`size-6 rounded-full flex items-center justify-center transition-colors ${isSelected ? "text-indigo-600" : "text-slate-200"}`}
              >
                <CheckCircle2
                  size={24}
                  className={isSelected ? "fill-indigo-50" : ""}
                />
              </div>
            </div>
          );
        })}
      </div>

    
      <div className="absolute bottom-0 left-0 mt-5 w-full p-6 bg-white border-t border-slate-100 backdrop-blur-md bg-white/90">
        <button
          disabled={!selectedPostId || isSubmitting}
          onClick={handleSubmit}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-500/20 disabled:shadow-none text-sm"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            "Submit Trade Offer"
          )}
        </button>
      </div>
    </div>
  );
}
