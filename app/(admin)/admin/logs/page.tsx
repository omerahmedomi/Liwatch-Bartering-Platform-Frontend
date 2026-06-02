"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  History, 
  Clock, 
  User, 
  FileText, 
  Activity, 
  Loader2,
  AlertCircle
} from "lucide-react";
import api from "@/lib/axios";
import AdminPagination from "../AdminPagination";

interface ActionLog {
  id: number;
  adminEmail: string;
  actionType: string;
  targetType: string;
  targetId: number;
  reason: string;
  actionTime: string;
}

export default function ActionLogsPage() {
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [page, setPage] = useState(0);

  const fetchLogs = () => {
    setLoading(true);
    api.get("/api/admin/logs")
      .then(res => {
        const data = res.data || [];
        setLogs(data);
        setFilteredLogs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching action logs:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    let result = logs;

    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      result = result.filter(log => 
        log.adminEmail.toLowerCase().includes(lowerKeyword) ||
        (log.reason && log.reason.toLowerCase().includes(lowerKeyword)) ||
        log.targetId.toString().includes(lowerKeyword) ||
        log.targetType.toLowerCase().includes(lowerKeyword)
      );
    }

    if (actionFilter) {
      result = result.filter(log => log.actionType === actionFilter);
    }

    setFilteredLogs(result);
    setPage(0);
  }, [keyword, actionFilter, logs]);

  const itemsPerPage = 15;
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const displayedLogs = filteredLogs.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  // Extract unique action types for filter dropdown
  const actionTypes = Array.from(new Set(logs.map(l => l.actionType)));

  const formatActionName = (action: string) => {
    return action.replace(/_/g, " ").toLowerCase();
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes("DELETE") || action.includes("REMOVE") || action.includes("SUSPEND") || action.includes("CANCEL")) {
      return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20";
    }
    if (action.includes("APPROVE") || action.includes("ACTIVATE") || action.includes("VALIDATE") || action.includes("VERIFY")) {
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30";
    }
    if (action.includes("FLAG") || action.includes("WARN")) {
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
    }
    return "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700";
  };

  return (
    <div className="space-y-6 relative min-h-[80vh]">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <History className="text-indigo-600 dark:text-indigo-400" size={24} />
          Administrative Action Logs
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Audit trail of all administrative moderation actions performed across users, listings, barters, and reports.
        </p>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-4 bg-slate-100 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 backdrop-blur-md">
        <div className="flex-1 min-w-[240px] relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search logs by admin email, target ID, or reason..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all font-semibold"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Activity size={14} className="text-slate-500" />
          <select
            className="bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer font-semibold"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="">All Action Types</option>
            {actionTypes.map(type => (
              <option key={type} value={type}>{formatActionName(type).toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
          <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">Loading audit logs from database...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="h-96 flex flex-col items-center justify-center text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-850 bg-slate-100 dark:bg-slate-900/10 rounded-2xl">
          <AlertCircle size={40} className="text-slate-600 mb-3" />
          <p className="font-semibold text-sm">No action logs matched search filters.</p>
        </div>
      ) : (
        <div className="bg-slate-100 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 text-xs font-black uppercase tracking-wider">
                  <th className="p-4">Time</th>
                  <th className="p-4">Moderator</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Target</th>
                  <th className="p-4">Reason / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                {displayedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-100 dark:bg-slate-900/10 transition-colors">
                    {/* Timestamp */}
                    <td className="p-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-slate-600" />
                        {new Date(log.actionTime).toLocaleString()}
                      </div>
                    </td>
                    
                    {/* Admin Moderator */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                        <User size={12} className="text-indigo-600 dark:text-indigo-400" />
                        {log.adminEmail}
                      </div>
                    </td>

                    {/* Action Type */}
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getActionBadgeColor(log.actionType)}`}>
                        {formatActionName(log.actionType)}
                      </span>
                    </td>

                    {/* Target */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <FileText size={12} className="text-slate-500" />
                        <span className="text-slate-600 dark:text-slate-400">{log.targetType}:</span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold">#{log.targetId}</span>
                      </div>
                    </td>

                    {/* Reason */}
                    <td className="p-4 max-w-xs md:max-w-sm truncate text-slate-700 dark:text-slate-300 font-medium" title={log.reason}>
                      {log.reason || <span className="text-slate-600 italic">No reason provided</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Panel */}
          {!loading && (
            <AdminPagination 
              currentPage={page} 
              totalPages={totalPages} 
              onPageChange={setPage} 
            />
          )}
        </div>
      )}
    </div>
  );
}
