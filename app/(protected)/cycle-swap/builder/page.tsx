"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Loader2, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function CycleSwapBuilder() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);

  const [selectedPostA, setSelectedPostA] = useState<any>(null);
  const [selectedPostB, setSelectedPostB] = useState<any>(null);
  const [selectedPostC, setSelectedPostC] = useState<any>(null);

  const [searchQueryB, setSearchQueryB] = useState("");
  const [searchQueryC, setSearchQueryC] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get("/api/profile/me");
        const userId = userRes.data?.user?.id;
        setCurrentUser(userRes.data?.user);

        const myPostsRes = await api.get(`/api/post/userPost/${userId}`);
        setMyPosts(myPostsRes.data?.content || []);

        const allPostsRes = await api.get(`/api/post/allPosts`);
        setAllPosts(allPostsRes.data?.content || []);
      } catch (err) {
        toast.error("Failed to load posts.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    if (!selectedPostA || !selectedPostB || !selectedPostC) return;
    setSubmitting(true);
    try {
      await api.post("/api/cycle-swap/send-request", {
        middlemanId: selectedPostB.user.id,
        closerId: selectedPostC.user.id,
        postAId: selectedPostA.postId,
        postBId: selectedPostB.postId,
        postCId: selectedPostC.postId,
      });
      toast.success("Cycle Swap Initiated!");
      router.push("/requests");
    } catch (err) {
      toast.error("Failed to initiate cycle swap.");
      setSubmitting(false);
    }
  };

  const renderPostCard = (post: any, isSelected: boolean, onSelect: () => void) => (
    <div
      key={post.postId}
      onClick={onSelect}
      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
        isSelected
          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
          : "border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 bg-white dark:bg-slate-900"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="size-16 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden">
          {post.postImages?.[0] && (
            <img src={post.postImages[0].postImageUrl} className="w-full h-full object-cover" alt="" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 truncate">{post.title}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
            Owner: {post.user?.name}
          </p>
        </div>
        {isSelected && <CheckCircle2 className="text-indigo-600 shrink-0" />}
      </div>
    </div>
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-20 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center size-16 bg-indigo-100 text-indigo-600 rounded-2xl mb-4">
            <RefreshCw size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-2">
            Cycle Swap Builder
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Create a 3-way trade! A gets B's item, B gets C's item, C gets A's item.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-xl font-bold mb-6">Step 1: Choose Your Item to Trade</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myPosts.length > 0 ? (
                  myPosts.map((p) => renderPostCard(p, selectedPostA?.postId === p.postId, () => setSelectedPostA(p)))
                ) : (
                  <p className="text-slate-500">You don't have any items to trade.</p>
                )}
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  disabled={!selectedPostA}
                  onClick={handleNext}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 flex items-center gap-2"
                >
                  Next <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-xl font-bold mb-6">Step 2: Choose the Item You Want</h2>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search items or users..."
                  value={searchQueryB}
                  onChange={(e) => setSearchQueryB(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2">
                {allPosts
                  .filter((p) => p.user.id !== currentUser?.id)
                  .filter((p) => 
                    p.title.toLowerCase().includes(searchQueryB.toLowerCase()) || 
                    (p.user?.name && p.user.name.toLowerCase().includes(searchQueryB.toLowerCase()))
                  )
                  .map((p) => renderPostCard(p, selectedPostB?.postId === p.postId, () => setSelectedPostB(p)))}
              </div>
              <div className="mt-8 flex justify-between">
                <button onClick={handleBack} className="text-slate-500 font-bold px-6 py-3">Back</button>
                <button
                  disabled={!selectedPostB}
                  onClick={handleNext}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 flex items-center gap-2"
                >
                  Next <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-xl font-bold mb-2">Step 3: Choose the Item They Want</h2>
              <p className="text-sm text-slate-500 mb-6">What does {selectedPostB?.user?.name} want in return?</p>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search items or users..."
                  value={searchQueryC}
                  onChange={(e) => setSearchQueryC(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2">
                {allPosts
                  .filter((p) => p.user.id !== currentUser?.id && p.user.id !== selectedPostB?.user?.id)
                  .filter((p) => 
                    p.title.toLowerCase().includes(searchQueryC.toLowerCase()) || 
                    (p.user?.name && p.user.name.toLowerCase().includes(searchQueryC.toLowerCase()))
                  )
                  .map((p) => renderPostCard(p, selectedPostC?.postId === p.postId, () => setSelectedPostC(p)))}
              </div>
              <div className="mt-8 flex justify-between">
                <button onClick={handleBack} className="text-slate-500 font-bold px-6 py-3">Back</button>
                <button
                  disabled={!selectedPostC}
                  onClick={handleNext}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 flex items-center gap-2"
                >
                  Review <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-xl font-bold mb-6 text-center">Review Cycle Swap</h2>
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl w-full md:w-1/3">
                  <p className="text-xs font-bold text-slate-400 mb-2">You Give</p>
                  <p className="font-bold">{selectedPostA?.title}</p>
                </div>
                <ArrowRight className="text-indigo-600 rotate-90 md:rotate-0" />
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl w-full md:w-1/3">
                  <p className="text-xs font-bold text-slate-400 mb-2">{selectedPostB?.user?.name} Gets</p>
                  <p className="font-bold">{selectedPostC?.title}</p>
                </div>
                <ArrowRight className="text-indigo-600 rotate-90 md:rotate-0" />
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl w-full md:w-1/3">
                  <p className="text-xs font-bold text-slate-400 mb-2">You Get</p>
                  <p className="font-bold">{selectedPostB?.title}</p>
                </div>
              </div>
              
              <div className="mt-8 flex justify-between">
                <button onClick={handleBack} disabled={submitting} className="text-slate-500 font-bold px-6 py-3">Back</button>
                <button
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : "Initiate Cycle Swap"}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
