"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  Filter, 
  X, 
  ShieldAlert, 
  Flag,
  FileText,
  User,
  Layers,
  ArrowLeftRight,
  ExternalLink,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  Calendar,
  AlertOctagon,
  Image as ImageIcon
} from "lucide-react";
import api from "@/lib/axios";
import AdminPagination from "../AdminPagination";

interface ReportListItem {
  reportId: number;
  status: string;
  reason: string;
  createdAt: string;
  validatedAt?: string;
  targetType?: string;
  issueType?: string;
  evidenceUrl?: string;
  reportedPostId?: number;
  reportedBarterId?: number;
  reportedUserId?: number;
  reportedUserName?: string;
  reportedUserEmail?: string;
  reporterUserId?: number;
  reporterUserName?: string;
  reporterUserEmail?: string;
}

export default function ManageReports() {
  // Query states
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [statusTab, setStatusTab] = useState("PENDING");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Detail Modal / Resolve states
  const [selectedReport, setSelectedReport] = useState<ReportListItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [actionType, setActionType] = useState<"validate" | "dismiss" | "reopen" | null>(null);
  const [userAction, setUserAction] = useState<"NONE" | "WARN" | "SUSPEND">("NONE");
  const [actionReason, setActionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReports = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusTab) params.append("status", statusTab);
    if (keyword) params.append("keyword", keyword);
    params.append("page", page.toString());
    params.append("size", "10");

    api.get(`/api/admin/reports?${params.toString()}`)
      .then(res => {
        setReports(res.data?.data || []);
        setTotalPages(res.data?.totalPages || 1);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching reports:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReports();
  }, [statusTab, keyword, page]);

  const handleOpenDetail = (reportId: number) => {
    api.get(`/api/admin/reports/${reportId}`)
      .then(res => {
        setSelectedReport(res.data?.data);
        setIsDetailOpen(true);
      })
      .catch(err => console.error("Error fetching report details:", err));
  };

  const handleAction = () => {
    if (!selectedReport || !actionType) return;
    setIsSubmitting(true);

    const payload: Record<string, any> = { reason: actionReason };
    if (actionType === "validate") {
      payload.userAction = userAction;
    }

    api.patch(`/api/admin/reports/${selectedReport.reportId}/${actionType}`, payload)
      .then(() => {
        alert(`Report ${actionType === "validate" ? "validated" : actionType === "dismiss" ? "dismissed" : "reopened"} successfully.`);
        setActionReason("");
        setActionType(null);
        setIsDetailOpen(false);
        fetchReports();
        setIsSubmitting(false);
      })
      .catch(err => {
        console.error("Action error:", err);
        alert(err.response?.data?.message || "Failed to submit report resolution.");
        setIsSubmitting(false);
      });
  };

  return (
    <div className="space-y-6 relative min-h-[80vh]">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Report & Dispute Center</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Review issues raised by users, examine attached evidence screenshots, and issue platform resolutions.
        </p>
      </div>

      {/* Tabs Control & Keyword Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-100 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 backdrop-blur-md">
        
        {/* Status Tab buttons */}
        <div className="flex bg-white dark:bg-slate-950/60 p-1 border border-slate-200 dark:border-slate-800 rounded-xl">
          {[
            { id: "PENDING", label: "Pending Review" },
            { id: "VALIDATED", label: "Validated / Resolved" },
            { id: "REJECTED", label: "Dismissed" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setStatusTab(tab.id); setPage(0); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                statusTab === tab.id 
                  ? "bg-indigo-600 text-white shadow-sm" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-80 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by user name or email..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all font-semibold"
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
          />
        </div>
      </div>

      {/* Reports Queue Table */}
      <div className="bg-slate-100 dark:bg-slate-900/20 border border-slate-300 dark:border-slate-850 rounded-2xl overflow-hidden backdrop-blur-md">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
            <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">Synchronizing dispute registry...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-slate-600 dark:text-slate-400">
            <Flag size={40} className="text-slate-600 mb-3" />
            <p className="font-semibold text-sm">Dispute queue is currently clear.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Disputed Target</th>
                  <th className="px-6 py-4">Reporter</th>
                  <th className="px-6 py-4">Issue Category</th>
                  <th className="px-6 py-4">Submited Date</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm text-slate-700 dark:text-slate-300">
                {reports.map((r) => (
                  <tr key={r.reportId} className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      #{r.reportId}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {r.targetType === "USER" && <User size={14} className="text-blue-400" />}
                        {r.targetType === "POST" && <Layers size={14} className="text-emerald-600 dark:text-emerald-400" />}
                        {r.targetType === "BARTER" && <ArrowLeftRight size={14} className="text-amber-600 dark:text-amber-400" />}
                        <div>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block tracking-wide uppercase">{r.targetType}</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                            {r.targetType === "USER" && (r.reportedUserName || `UID #${r.reportedUserId}`)}
                            {r.targetType === "POST" && `Listing ID #${r.reportedPostId}`}
                            {r.targetType === "BARTER" && `Exchange ID #${r.reportedBarterId}`}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{r.reporterUserName}</p>
                        <p className="text-[10px] text-slate-500">{r.reporterUserEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-md">
                        {r.issueType?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.status === "PENDING" 
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" 
                          : r.status === "VALIDATED"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(r.reportId)}
                        className="text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold px-3 py-1.5 rounded-lg border border-indigo-500/20 transition-all cursor-pointer"
                      >
                        Inspect details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Panel */}
        {!loading && (
          <AdminPagination 
            currentPage={page} 
            totalPages={totalPages} 
            onPageChange={setPage} 
          />
        )}
      </div>

      {/* Report Detail Modal Overlay */}
      {isDetailOpen && selectedReport && (
        <div className="fixed inset-0 flex items-center justify-center z-100 p-4">
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-md transition-opacity" onClick={() => setIsDetailOpen(false)} />
          
          <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between bg-white dark:bg-slate-950/20 shrink-0">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm tracking-widest uppercase">
                <ShieldAlert size={16} />
                Dispute Incident Report #{selectedReport.reportId}
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-300 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Details and Metadata Grid */}
              <div className="grid grid-cols-2 gap-6">
                {/* Left Side Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Dispute Parameters</h4>
                  
                  <div className="p-3 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Report status</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{selectedReport.status}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Submission date</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{new Date(selectedReport.createdAt).toLocaleString()}</span>
                    </div>
                    {selectedReport.validatedAt && (
                      <div className="flex justify-between text-slate-500">
                        <span>Resolution date</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{new Date(selectedReport.validatedAt).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-500">
                      <span>Issue category</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400 uppercase">{selectedReport.issueType?.replace("_", " ")}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side Entities */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Involved Parties</h4>
                  
                  <div className="p-3 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 block">Reporter user</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedReport.reporterUserName} ({selectedReport.reporterUserEmail})</span>
                    </div>
                    {selectedReport.reportedUserId && (
                      <div>
                        <span className="text-slate-500 block">Reported user / Owner</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedReport.reportedUserName} ({selectedReport.reportedUserEmail})</span>
                      </div>
                    )}
                    {selectedReport.reportedPostId && (
                      <div>
                        <span className="text-slate-500 block">Reported listing ID</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          #{selectedReport.reportedPostId}
                          <a href={`/post/${selectedReport.reportedPostId}`} target="_blank" className="hover:text-emerald-300"><ExternalLink size={10} /></a>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Text Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><FileText size={12} /> Narrative Description</h4>
                <div className="p-4 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold italic">
                  "{selectedReport.reason}"
                </div>
              </div>

              {/* Evidence Screen Shot Preview */}
              {selectedReport.evidenceUrl && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><ImageIcon size={12} /> Attached Evidence Screenshot</h4>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950/50 p-2 flex justify-center max-h-80">
                    <img 
                      src={selectedReport.evidenceUrl} 
                      alt="Dispute evidence" 
                      className="max-h-72 object-contain rounded-lg shadow-inner"
                    />
                  </div>
                </div>
              )}

              {/* Validation Submenu inside the modal */}
              {actionType && (
                <div className="p-4 bg-white dark:bg-slate-950/60 border border-indigo-500/20 rounded-xl space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <h5 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Specify resolution parameters ({actionType})
                    </h5>
                    <button onClick={() => setActionType(null)} className="text-slate-500 hover:text-slate-700 dark:text-slate-300 cursor-pointer">
                      <X size={14} />
                    </button>
                  </div>

                  {actionType === "validate" && (
                    <div className="space-y-2 text-xs">
                      <label className="text-slate-600 dark:text-slate-400 block font-semibold">Reported User Penalty Action:</label>
                      <div className="flex gap-4">
                        {[
                          { id: "NONE", label: "Resolve (No Action)" },
                          { id: "WARN", label: "Issue Warn Alert" },
                          { id: "SUSPEND", label: "Suspend Account" }
                        ].map(act => (
                          <label key={act.id} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 cursor-pointer">
                            <input 
                              type="radio" 
                              name="penalty" 
                              checked={userAction === act.id} 
                              onChange={() => setUserAction(act.id as any)} 
                            />
                            {act.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 text-xs">
                    <label className="text-slate-600 dark:text-slate-400 block font-semibold">Official Reason / Justification:</label>
                    <textarea
                      placeholder="Input oficial justification reason. This message is emailed and pushed to relevant users..."
                      className="w-full h-20 p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500/30 font-semibold"
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-2 text-xs font-bold">
                    <button 
                      onClick={() => setActionType(null)} 
                      className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleAction} 
                      disabled={isSubmitting || !actionReason}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg cursor-pointer transition-all flex items-center gap-2"
                    >
                      {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                      Execute Resolution
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-950/20 shrink-0 flex justify-between gap-3">
              <span className="text-xs text-slate-500 self-center">Incident Case ID: #{selectedReport.reportId}</span>
              
              {!actionType && (
                <div className="flex gap-2">
                  {selectedReport.status === "PENDING" ? (
                    <>
                      <button 
                        onClick={() => setActionType("validate")}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle size={14} />
                        Validate Report
                      </button>
                      <button 
                        onClick={() => setActionType("dismiss")}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
                      >
                        <XCircle size={14} />
                        Dismiss Report
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setActionType("reopen")}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <RefreshCw size={14} />
                      Re-open dispute queue
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
