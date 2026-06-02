"use client";

import { useEffect, useState } from "react";
import { 
  Loader2, 
  ArrowLeftRight, 
  CheckCircle, 
  FileSignature, 
  Fingerprint, 
  CalendarDays, 
  ExternalLink, 
  BadgeCheck, 
  Hash, 
  Image as ImageIcon,
  MessageSquare
} from "lucide-react";
import api from "@/lib/axios";
import Link from "next/link";

export default function CompletedNegotiationsPage() {
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchNegotiations = async () => {
      try {
        const userRes = await api.get("/api/profile/me");
        const userId = userRes.data?.user?.id;
        
        if (!userId) return;
        if (isMounted) setCurrentUserId(userId);

        const [negoRes, cycleRes] = await Promise.all([
          api.post(`/api/negotiation/get-all-nego/${userId}`),
          api.get(`/api/cycle-negotiation/my-negotiations`)
        ]);

        const data = negoRes.data || [];
        const cycleData = cycleRes.data || [];
        
        // Filter only completed or mutually agreed negotiations
        const completed = data.filter((n: any) => 
          n.status === 'COMPLETED' || 
          (n.agreement && n.agreement.status === 'COMPLETED') ||
          (n.agreement && n.agreement.userASigned && n.agreement.userBSigned)
        ).map((n: any) => ({ ...n, type: 'DIRECT' }));

        const completedCycle = cycleData.filter((n: any) =>
          n.status === 'AGREED' || (n.userASigned && n.userBSigned && n.userCSigned)
        ).map((n: any) => ({ ...n, type: 'CYCLE' }));
        
        if (isMounted) {
          setNegotiations([...completed, ...completedCycle]);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch completed negotiations", error);
        if (isMounted) setLoading(false);
      }
    };

    fetchNegotiations();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
          Loading Agreements...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-3 mb-2">
            <CheckCircle className="text-emerald-500" size={32} />
            Completed Negotiations
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Review your digital agreements, signatures, hashes, and uploaded IDs for all sealed trades.
          </p>
        </div>

        {negotiations.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
            <div className="inline-flex items-center justify-center p-5 bg-slate-50 dark:bg-slate-800/50 rounded-full mb-6">
              <FileSignature className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              No Completed Negotiations
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              When you finalize a barter and both parties sign the digital agreement, it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {negotiations.map((nego) => {
              const isUserA = nego.barter?.userA?.id === currentUserId;
              const partner = isUserA ? nego.barter?.userB : nego.barter?.userA;

              return (
                <div 
                  key={nego.id} 
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group flex flex-col"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                        <BadgeCheck size={12} />
                        Sealed
                      </span>
                    </div>
                    <span className="text-slate-400 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                      <CalendarDays size={14} />
                      {nego.suggestionUpdatedAt ? new Date(nego.suggestionUpdatedAt).toLocaleDateString() : (nego.type === 'CYCLE' && nego.documentHash ? "Finalized" : 'N/A')}
                    </span>
                  </div>

                  {nego.type === 'CYCLE' ? (
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/60">
                      <div className="text-center w-full md:w-1/3">
                        <p className="text-xs text-slate-400 font-bold mb-1">Initiator Gives</p>
                        <p className="font-bold text-sm text-indigo-600">{nego.requestDetails?.postA?.title}</p>
                      </div>
                      <ArrowLeftRight className="text-slate-300" />
                      <div className="text-center w-full md:w-1/3">
                        <p className="text-xs text-slate-400 font-bold mb-1">Middleman Gives</p>
                        <p className="font-bold text-sm text-emerald-600">{nego.requestDetails?.postB?.title}</p>
                      </div>
                      <ArrowLeftRight className="text-slate-300" />
                      <div className="text-center w-full md:w-1/3">
                        <p className="text-xs text-slate-400 font-bold mb-1">Closer Gives</p>
                        <p className="font-bold text-sm text-amber-600">{nego.requestDetails?.postC?.title}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/60">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">You Traded</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {isUserA ? nego.barter?.postA?.title : nego.barter?.postB?.title}
                        </p>
                      </div>
                      <div className="shrink-0 bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
                        <ArrowLeftRight size={16} className="text-indigo-500" />
                      </div>
                      <div className="flex-1 min-w-0 text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Received</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {isUserA ? nego.barter?.postB?.title : nego.barter?.postA?.title}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800 flex-1">
                    <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <FileSignature size={14} className="text-indigo-500" />
                      Digital Agreement Ledger
                    </h4>
                    
                    {/* Signatures */}
                    {nego.type === 'CYCLE' ? (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800/80">
                          <span className="text-[10px] font-bold text-slate-400 block mb-1">Init Signature</span>
                          {nego.userASigned ? <span className="text-emerald-600 font-black text-[10px] flex items-center gap-1"><Fingerprint size={10}/> Verified</span> : <span className="text-slate-400 font-medium text-[10px]">Pending</span>}
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800/80">
                          <span className="text-[10px] font-bold text-slate-400 block mb-1">Mid Signature</span>
                          {nego.userBSigned ? <span className="text-emerald-600 font-black text-[10px] flex items-center gap-1"><Fingerprint size={10}/> Verified</span> : <span className="text-slate-400 font-medium text-[10px]">Pending</span>}
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800/80">
                          <span className="text-[10px] font-bold text-slate-400 block mb-1">Close Signature</span>
                          {nego.userCSigned ? <span className="text-emerald-600 font-black text-[10px] flex items-center gap-1"><Fingerprint size={10}/> Verified</span> : <span className="text-slate-400 font-medium text-[10px]">Pending</span>}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800/80">
                          <span className="text-xs font-bold text-slate-400 block mb-1">Your Signature</span>
                          {(isUserA ? nego.agreement?.userASigned : nego.agreement?.userBSigned) ? (
                            <span className="text-emerald-600 font-black text-sm flex items-center gap-1.5"><Fingerprint size={14}/> Signed Verified</span>
                          ) : (
                            <span className="text-slate-400 font-medium text-sm">Pending</span>
                          )}
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800/80">
                          <span className="text-xs font-bold text-slate-400 block mb-1">{partner?.name}'s Signature</span>
                          {(!isUserA ? nego.agreement?.userASigned : nego.agreement?.userBSigned) ? (
                            <span className="text-emerald-600 font-black text-sm flex items-center gap-1.5"><Fingerprint size={14}/> Signed Verified</span>
                          ) : (
                            <span className="text-slate-400 font-medium text-sm">Pending</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* SHA-256 Hash */}
                    {(nego.agreement?.documentHash || nego.documentHash) && (
                      <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 mt-2">
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mb-1">
                          <Hash size={12} /> SHA-256 Checksum
                        </span>
                        <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400 break-all bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                          {nego.agreement?.documentHash || nego.documentHash}
                        </p>
                      </div>
                    )}

                    {/* ID Card Links */}
                    {(nego.agreement?.uploadedIdByA || nego.agreement?.uploadedIdByB) && (
                      <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 mt-2">
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mb-2">
                          <ImageIcon size={12} /> Uploaded Identity Documents
                        </span>
                        <div className="flex flex-col gap-2">
                          {(isUserA ? nego.agreement?.uploadedIdByA : nego.agreement?.uploadedIdByB) && (
                            <a href={isUserA ? nego.agreement?.uploadedIdByA : nego.agreement?.uploadedIdByB} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                              <ExternalLink size={12} /> View Your Uploaded ID
                            </a>
                          )}
                          {(!isUserA ? nego.agreement?.uploadedIdByA : nego.agreement?.uploadedIdByB) && (
                            <a href={!isUserA ? nego.agreement?.uploadedIdByA : nego.agreement?.uploadedIdByB} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                              <ExternalLink size={12} /> View {partner?.name}'s Uploaded ID
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <Link 
                      href={nego.type === 'CYCLE' ? `/cycle-messages/${nego.id}` : `/messages/${nego.id}`}
                      className="w-full py-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl text-sm font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={16} />
                      Go to Chat Session
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
