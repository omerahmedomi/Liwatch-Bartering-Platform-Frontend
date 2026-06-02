"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  Filter, 
  X, 
  MoreVertical, 
  Shield, 
  ShieldAlert, 
  UserCheck, 
  UserX,
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Calendar,
  MapPin,
  FileText,
  Activity,
  Award,
  BookOpen
} from "lucide-react";
import api from "@/lib/axios";
import AdminPagination from "../AdminPagination";

interface UserListItem {
  id: number;
  email: string;
  fullName: string;
  role: string;
  status: string;
  isVerified: boolean;
  enabled: boolean;
  createdAt: string;
  location?: string;
  bio?: string;
  badgeLevel?: string;
  trustScore?: number;
  profileImage?: string;
  totalPosts: number;
  totalBarters: number;
  reportCount: number;
}

export default function ManageUsers() {
  // Query states
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  const formatDate = (dateStr: any) => {
    if (!dateStr) return "N/A";
    if (Array.isArray(dateStr)) {
      if (dateStr.length < 3) return "N/A";
      const year = dateStr[0];
      const month = dateStr[1] - 1;
      const day = dateStr[2];
      return new Date(year, month, day).toLocaleDateString();
    }
    const date = new Date(dateStr);
    if (isNaN(date.getTime()) || date.getFullYear() <= 1970) {
      return "N/A";
    }
    return date.toLocaleDateString();
  };

  // Modal / Drawer states
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [actionUser, setActionUser] = useState<UserListItem | null>(null);
  const [actionType, setActionType] = useState<"suspend" | "activate" | "promote" | "demote" | "delete" | null>(null);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");

  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (keyword) params.append("keyword", keyword);
    if (statusFilter) params.append("status", statusFilter);
    if (roleFilter) params.append("role", roleFilter);
    params.append("page", page.toString());
    params.append("size", "10");

    api.get(`/api/admin/users?${params.toString()}`)
      .then(res => {
        setUsers(res.data?.data || []);
        setTotalPages(res.data?.totalPages || 1);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching users:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, [keyword, statusFilter, roleFilter, page]);

  useEffect(() => {
    api.get("/api/profile/me")
      .then(res => {
        setCurrentUserEmail(res.data?.user?.email || "");
      })
      .catch(() => {});
  }, []);

  const handleOpenDrawer = (userId: number) => {
    api.get(`/api/admin/users/${userId}`)
      .then(res => {
        setSelectedUser(res.data?.data);
        setIsDrawerOpen(true);
      })
      .catch(err => console.error("Error fetching user details:", err));
  };

  const handleAction = () => {
    if (!actionUser || !actionType) return;
    setIsSubmitting(true);
    setActionSuccess("");

    const payload = { reason, internalNote: "Admin dashboard action" };
    let endpoint = `/api/admin/users/${actionUser.id}/${actionType}`;

    let method: "patch" | "delete" = "patch";
    if (actionType === "delete") {
      endpoint = `/api/admin/users/${actionUser.id}`;
      method = "delete";
    }

    const reqPromise = method === "delete" 
      ? api.delete(endpoint, { data: payload }) 
      : api.patch(endpoint, payload);

    reqPromise
      .then(res => {
        setActionSuccess(`Successfully performed action: ${actionType}`);
        setReason("");
        setIsSubmitting(false);
        setTimeout(() => {
          setActionUser(null);
          setActionType(null);
          setActionSuccess("");
        }, 1500);
        // Refresh detail view if open
        if (selectedUser && selectedUser.id === actionUser.id) {
          handleOpenDrawer(actionUser.id);
        }
        fetchUsers();
      })
      .catch(err => {
        console.error("Action error:", err);
        alert(err.response?.data?.message || "Failed to execute action.");
        setIsSubmitting(false);
      });
  };


  return (
    <div className="space-y-6 relative min-h-[80vh]">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">User Management</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Review details, suspend accounts, activate, promote/demote administrators, and delete users.
        </p>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4 bg-slate-100 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 backdrop-blur-md">
        <div className="flex-1 min-w-[240px] relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          <select
            className="bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <select
            className="bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
          >
            <option value="">All Roles</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-100 dark:bg-slate-900/20 border border-slate-300 dark:border-slate-850 rounded-2xl overflow-hidden backdrop-blur-md">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
            <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">Querying system users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-slate-600 dark:text-slate-400">
            <UserX size={40} className="text-slate-600 mb-3" />
            <p className="font-semibold text-sm">No registered users matched filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Activity Summary</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm text-slate-700 dark:text-slate-300">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-xs bg-cover bg-center border border-slate-700" style={{ backgroundImage: u.profileImage ? `url(${u.profileImage})` : undefined }}>
                          {!u.profileImage && u.fullName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{u.fullName}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        u.role === "ADMIN" 
                          ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" 
                          : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-700/40"
                      }`}>
                        {u.role === "ADMIN" && <Shield size={10} />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        u.status === "ACTIVE" 
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <span title="Listings count" className="hover:text-slate-800 dark:text-slate-200 transition-colors">📄 {u.totalPosts}</span>
                        <span title="Exchanges count" className="hover:text-slate-800 dark:text-slate-200 transition-colors">🤝 {u.totalBarters}</span>
                        {u.reportCount > 0 ? (
                          <span title="Reports filed against user" className="text-red-600 dark:text-red-400 hover:text-red-300 font-bold transition-colors">⚠️ {u.reportCount}</span>
                        ) : (
                          <span title="No reports filed" className="text-slate-600">⚠️ 0</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenDrawer(u.id)}
                        className="text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold px-3 py-1.5 rounded-lg transition-all border border-indigo-500/20 cursor-pointer"
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

      {/* User Detail Side Drawer -> Centered Modal */}
      {isDrawerOpen && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-100 p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-md transition-opacity" 
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Modal Element */}
          <div className="relative w-full max-w-[460px] max-h-[90vh] bg-slate-100 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-3xl flex flex-col justify-between overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between bg-white dark:bg-slate-950/20">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm tracking-widest uppercase">
                <Shield size={16} />
                User Clearance Details
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-300 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* User Bio Card */}
              <div className="flex flex-col items-center text-center p-4 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/40 rounded-2xl relative">
                <div className="size-20 rounded-full bg-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl border-2 border-slate-700 bg-cover bg-center shadow-md shadow-indigo-500/5" style={{ backgroundImage: selectedUser.profileImage ? `url(${selectedUser.profileImage})` : undefined }}>
                  {!selectedUser.profileImage && selectedUser.fullName.substring(0,2).toUpperCase()}
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mt-3">{selectedUser.fullName}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedUser.email}</p>

                <div className="flex gap-2 mt-4">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                    selectedUser.role === "ADMIN" 
                      ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" 
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-700/60"
                  }`}>
                    {selectedUser.role}
                  </span>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    selectedUser.status === "ACTIVE" 
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  }`}>
                    {selectedUser.status}
                  </span>
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Metadata Profile</h4>
                
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="p-3 bg-white dark:bg-slate-950/20 border border-slate-300 dark:border-slate-850 rounded-xl space-y-1">
                    <span className="text-slate-500 flex items-center gap-1.5"><MapPin size={12} /> Location</span>
                    <span className="block truncate text-slate-800 dark:text-slate-200">{selectedUser.location || "Not Specified"}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-950/20 border border-slate-300 dark:border-slate-850 rounded-xl space-y-1">
                    <span className="text-slate-500 flex items-center gap-1.5"><Calendar size={12} /> Registered</span>
                    <span className="block text-slate-800 dark:text-slate-200">{formatDate(selectedUser.createdAt)}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-950/20 border border-slate-300 dark:border-slate-850 rounded-xl space-y-1">
                    <span className="text-slate-500 flex items-center gap-1.5"><Award size={12} /> Badge Level</span>
                    <span className="block text-slate-800 dark:text-slate-200 truncate">{selectedUser.badgeLevel?.replace("_", " ") || "Level 1"}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-950/20 border border-slate-300 dark:border-slate-850 rounded-xl space-y-1">
                    <span className="text-slate-500 flex items-center gap-1.5"><Activity size={12} /> Trust score</span>
                    <span className="block text-slate-800 dark:text-slate-200">{(selectedUser.trustScore ?? 0).toFixed(2)} / 5.00</span>
                  </div>
                </div>

                <div className="p-3.5 bg-white dark:bg-slate-950/20 border border-slate-300 dark:border-slate-850 rounded-xl space-y-1.5 text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5"><FileText size={12} /> Biography</span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold italic">{selectedUser.bio || "No biography provided."}</p>
                </div>
              </div>

              {/* Action Operations Console */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800/40">
                <h4 className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-3">Moderator Action Console</h4>

                {(() => {
                  const isSelf = selectedUser.email === currentUserEmail;
                  return (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedUser.status === "ACTIVE" ? (
                          <button 
                            onClick={() => { if (!isSelf) { setActionUser(selectedUser); setActionType("suspend"); } }}
                            disabled={isSelf}
                            title={isSelf ? "You cannot suspend your own account" : ""}
                            className="flex items-center justify-center gap-2 p-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <UserX size={14} />
                            Suspend account
                          </button>
                        ) : (
                          <button 
                            onClick={() => { if (!isSelf) { setActionUser(selectedUser); setActionType("activate"); } }}
                            disabled={isSelf}
                            className="flex items-center justify-center gap-2 p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <UserCheck size={14} />
                            Activate account
                          </button>
                        )}

                        {selectedUser.role === "USER" ? (
                          <button 
                            onClick={() => { setActionUser(selectedUser); setActionType("promote"); }}
                            className="flex items-center justify-center gap-2 p-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl cursor-pointer transition-all"
                          >
                            <Shield size={14} />
                            Make Admin
                          </button>
                        ) : (
                          <button 
                            onClick={() => { if (!isSelf) { setActionUser(selectedUser); setActionType("demote"); } }}
                            disabled={isSelf}
                            title={isSelf ? "You cannot demote your own account" : ""}
                            className="flex items-center justify-center gap-2 p-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700/60 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <ShieldAlert size={14} />
                            Demote to User
                          </button>
                        )}
                      </div>

                      <button 
                        onClick={() => { if (!isSelf) { setActionUser(selectedUser); setActionType("delete"); } }}
                        disabled={isSelf}
                        title={isSelf ? "You cannot delete your own account" : ""}
                        className="w-full flex items-center justify-center gap-2 p-2.5 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-500/20 hover:border-red-300 dark:hover:border-red-500/40 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Trash2 size={14} />
                        Permanently delete account
                      </button>

                      {isSelf && (
                        <p className="text-[10px] text-amber-500 font-semibold text-center mt-2">
                          Note: Self-moderation is blocked. You cannot suspend, demote, or delete your own account.
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-950/20 flex justify-between text-xs text-slate-500">
              <span>Account UID: {selectedUser.id}</span>
              <span>Clearence: {selectedUser.role}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Reasons Modal */}
      {actionUser && actionType && (
        <div className="fixed inset-0 flex items-center justify-center z-150 p-4">
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-md" onClick={() => { setActionUser(null); setActionType(null); }} />
          
          <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
              <AlertTriangle size={18} />
              Confirm Admin Action
            </div>
            
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Provide justification for performing the operation <span className="font-black text-indigo-600 dark:text-indigo-400 uppercase">{actionType}</span> against user <span className="font-bold text-slate-800 dark:text-slate-200">{actionUser.fullName}</span>.
            </p>

            <textarea
              className="w-full h-24 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500/40 transition-all font-semibold"
              placeholder="Enter official reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            {actionSuccess && (
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 text-center animate-pulse">{actionSuccess}</p>
            )}

            <div className="flex justify-end gap-3 text-xs font-bold">
              <button 
                onClick={() => { setActionUser(null); setActionType(null); }} 
                className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700/60 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleAction} 
                disabled={isSubmitting || !reason}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl cursor-pointer transition-all flex items-center gap-2"
              >
                {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
