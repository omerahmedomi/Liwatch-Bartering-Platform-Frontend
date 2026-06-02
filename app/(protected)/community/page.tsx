"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Plus,
  MapPin,
  Tag,
  Loader2,
  Lock,
  ArrowRight,
  UserCheck,
  UserX,
  FileText,
  X,
  Trash2,
  Calendar,
  Image as ImageIcon,
  ArrowUpDown,
  Filter,
  AlertTriangle,
  Star,
  ChevronDown,
  Edit2
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface Member {
  userId: number;
  fullName: string;
  email: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  status: "APPROVED" | "PENDING" | "BLOCKED";
  joinedAt: string;
  badgeLabel: string;
  averageRating: number;
}

interface Group {
  groupId: number;
  groupName: string;
  description: string;
  location: string;
  category: string; // compatibility field
  groupCategory: "ITEM_SWAP" | "SERVICE_SWAP";
  itemSubcategory?: string;
  coverImageUrl?: string;
  ownerUserId: number;
  createdAt: string;
  status: "ACTIVE" | "SUSPENDED";
  memberCount: number;
  groupAverageRating: number;
}

interface PostResponseDto {
  postId: number;
  title: string;
  description: string;
  category: string;
  location: string;
  lookingFor: string;
  postType: "ITEM" | "SERVICE";
  status: "ACTIVE" | "FLAGGED" | "CLOSED" | "REMOVED";
  createdAt: string;
  postImages: { postImageUrl: string }[];
  user: { id: number; fullName: string; email: string };
  item?: { condition: string; estimatedValue: number };
  service?: { skillLevel: string; availability: string; serviceDuration: string };
}

interface GroupPost {
  groupPostId: number;
  groupId: number;
  sharedAt: string;
  postDetails: PostResponseDto;
}

export default function CommunityPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);

  // Group Search & Filtering
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [groupCategoryFilter, setGroupCategoryFilter] = useState(""); // "" | "ITEM_SWAP" | "SERVICE_SWAP"

  // Feed/Post States
  const [feedPosts, setFeedPosts] = useState<GroupPost[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [feedSearch, setFeedSearch] = useState("");
  const [feedCategoryFilter, setFeedCategoryFilter] = useState("");
  const [feedLocationFilter, setFeedLocationFilter] = useState("");
  const [feedSort, setFeedSort] = useState("newest"); // newest | oldest | activity

  // Members list
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Member[]>([]);
  const [viewingRequests, setViewingRequests] = useState(false);

  // Eligible listings for sharing
  const [eligibleListings, setEligibleListings] = useState<PostResponseDto[]>([]);
  const [loadingEligible, setLoadingEligible] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Create Group Form
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [newGroupCategory, setNewGroupCategory] = useState<"ITEM_SWAP" | "SERVICE_SWAP">("ITEM_SWAP");
  const [newGroupSubcategory, setNewGroupSubcategory] = useState("");
  const [newGroupCoverImage, setNewGroupCoverImage] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);

  // Edit Group Form
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupCoverImage, setEditGroupCoverImage] = useState("");
  const [editCoverImageFile, setEditCoverImageFile] = useState<File | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);



  // Available Item Subcategories based on system specification
  const ITEM_SUBCATEGORIES = [
    "Electronics & Tech",
    "Vehicles & Parts",
    "Home & Furniture",
    "Clothing & Fashion",
    "Books & Education",
    "Sports & Outdoors",
    "Tools & Equipment"
  ];

  // Fetch current user details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/api/profile/me");
        setCurrentUser(res.data?.user);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      }
    };
    fetchUser();
  }, []);

  // Fetch groups list
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (groupSearchQuery) params.q = groupSearchQuery;
      if (groupCategoryFilter) params.category = groupCategoryFilter;

      const res = await api.get("/api/groups", { params });
      setGroups(res.data || []);
    } catch (err) {
      console.error("Failed to load community groups", err);
      toast.error("Failed to load community groups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [groupSearchQuery, groupCategoryFilter]);

  // Fetch group details, members, and feed posts
  const loadGroupDetails = async (group: Group) => {
    setLoadingFeed(true);
    try {
      // 1. Fetch group members
      const membersRes = await api.get(`/api/groups/${group.groupId}/members`);
      const membersList = membersRes.data || [];
      setMembers(membersList);

      // Fetch pending requests for admins/owners
      const isOwner = group.ownerUserId === currentUser?.id;
      const isAdmin = membersList.some((m: Member) => m.userId === currentUser?.id && m.role === "ADMIN");
      if (isOwner || isAdmin) {
        try {
          const reqRes = await api.get(`/api/groups/${group.groupId}/requests`);
          setPendingRequests(reqRes.data || []);
        } catch (e) {
          console.error("Failed to load requests", e);
        }
      }

      // 2. Fetch group feed posts
      const feedRes = await api.get(`/api/groups/${group.groupId}/posts`, {
        params: {
          search: feedSearch,
          category: feedCategoryFilter,
          location: feedLocationFilter,
          sortBy: feedSort
        }
      });
      setFeedPosts(feedRes.data || []);
    } catch (err: any) {
      console.error("Failed to load group details", err);
      // Handles suspension boundary check for non-members
      if (err.response?.status === 403) {
        toast.error(err.response?.data?.message || "Access denied. Group is suspended.");
        setActiveGroup(null);
      } else {
        toast.error("Failed to load group details.");
      }
    } finally {
      setLoadingFeed(false);
    }
  };

  useEffect(() => {
    if (activeGroup) {
      loadGroupDetails(activeGroup);
    }
  }, [activeGroup, feedSearch, feedCategoryFilter, feedLocationFilter, feedSort]);

  // Join group handler
  const handleJoinGroup = async (groupId: number) => {
    try {
      await api.post(`/api/groups/${groupId}/join`);
      toast.success("Joined community group successfully!");
      
      // Fetch groups again to update member count
      fetchGroups();
      
      // If viewing details, refresh details
      if (activeGroup && activeGroup.groupId === groupId) {
        const updatedGroup = await api.get(`/api/groups/${groupId}`);
        setActiveGroup(updatedGroup.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to join group");
    }
  };

  // Leave group handler
  const handleLeaveGroup = async (groupId: number) => {
    if (!currentUser) return;
    if (!confirm("Are you sure you want to leave this community group?")) return;

    try {
      await api.delete(`/api/groups/${groupId}/members/${currentUser.id}`);
      toast.success("Left the community group.");
      
      fetchGroups();
      
      if (activeGroup && activeGroup.groupId === groupId) {
        const updatedGroup = await api.get(`/api/groups/${groupId}`);
        setActiveGroup(updatedGroup.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to leave group");
    }
  };

  // Promote member to Admin
  const handlePromoteMember = async (userId: number) => {
    if (!activeGroup || !confirm("Promote this member to Admin?")) return;
    try {
      await api.patch(`/api/groups/${activeGroup.groupId}/members/${userId}`);
      toast.success("Member promoted to Admin.");
      const membersRes = await api.get(`/api/groups/${activeGroup.groupId}/members`);
      setMembers(membersRes.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to promote member");
    }
  };

  // Demote Admin to Member
  const handleDemoteMember = async (userId: number) => {
    if (!activeGroup || !confirm("Revoke this member's Admin privileges?")) return;
    try {
      await api.patch(`/api/groups/${activeGroup.groupId}/members/${userId}/demote`);
      toast.success("Admin privileges revoked.");
      const membersRes = await api.get(`/api/groups/${activeGroup.groupId}/members`);
      setMembers(membersRes.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to demote member");
    }
  };

  // Remove member from group
  const handleRemoveMember = async (userId: number) => {
    if (!activeGroup || !confirm("Are you sure you want to remove this member?")) return;
    try {
      await api.delete(`/api/groups/${activeGroup.groupId}/members/${userId}`);
      toast.success("Member removed from group.");
      const membersRes = await api.get(`/api/groups/${activeGroup.groupId}/members`);
      setMembers(membersRes.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove member");
    }
  };

  // Accept join request
  const handleAcceptRequest = async (userId: number) => {
    if (!activeGroup) return;
    try {
      await api.patch(`/api/groups/${activeGroup.groupId}/requests/${userId}/approve`);
      toast.success("Request accepted.");
      loadGroupDetails(activeGroup);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to accept request");
    }
  };

  // Reject join request
  const handleRejectRequest = async (userId: number) => {
    if (!activeGroup) return;
    try {
      await api.delete(`/api/groups/${activeGroup.groupId}/requests/${userId}/reject`);
      toast.success("Request rejected.");
      loadGroupDetails(activeGroup);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reject request");
    }
  };

  // Delete Group
  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm("CRITICAL WARNING: This will permanently delete the community group and all its shared posts. Are you sure you want to proceed?")) return;
    try {
      await api.delete(`/api/groups/${groupId}`);
      toast.success("Community group deleted successfully.");
      setActiveGroup(null);
      fetchGroups();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete group");
    }
  };

  // Create Group
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupDescription.trim()) {
      return toast.error("Name and Description are required fields.");
    }
    if (newGroupCategory === "ITEM_SWAP" && !newGroupSubcategory) {
      return toast.error("Please select a required subcategory for the Item Swap group.");
    }

    setIsSubmittingGroup(true);
    try {
      let finalCoverImageUrl = newGroupCoverImage.trim() || null;
      if (coverImageFile) {
        finalCoverImageUrl = await uploadToCloudinary(coverImageFile);
      }

      const payload: any = {
        groupName: newGroupName.trim(),
        description: newGroupDescription.trim(),
        groupCategory: newGroupCategory,
        itemSubcategory: newGroupCategory === "ITEM_SWAP" ? newGroupSubcategory : null,
        coverImageUrl: finalCoverImageUrl,
        location: newGroupLocation.trim() || "Global"
      };

      const res = await api.post("/api/groups", payload);
      toast.success("Community group created successfully!");
      setIsCreateModalOpen(false);
      
      // Reset form
      setNewGroupName("");
      setNewGroupDescription("");
      setNewGroupCategory("ITEM_SWAP");
      setNewGroupSubcategory("");
      setNewGroupCoverImage("");
      setCoverImageFile(null);
      setNewGroupLocation("");
      
      fetchGroups();
      setActiveGroup(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create group. Make sure name is unique.");
    } finally {
      setIsSubmittingGroup(false);
    }
  };

  // Edit Group Setup
  const openEditModal = () => {
    if (!activeGroup) return;
    setEditGroupName(activeGroup.groupName);
    setEditGroupCoverImage(activeGroup.coverImageUrl || "");
    setEditCoverImageFile(null);
    setIsEditModalOpen(true);
  };

  // Edit Group Submit
  const handleEditGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup) return;
    if (!editGroupName.trim()) {
      return toast.error("Group name is required.");
    }

    setIsSubmittingEdit(true);
    try {
      let finalCoverImageUrl = editGroupCoverImage.trim() || null;
      if (editCoverImageFile) {
        finalCoverImageUrl = await uploadToCloudinary(editCoverImageFile);
      }

      const payload = {
        groupName: editGroupName.trim(),
        coverImageUrl: finalCoverImageUrl,
      };

      const res = await api.patch(`/api/groups/${activeGroup.groupId}/details`, payload);
      toast.success("Group details updated successfully!");
      setIsEditModalOpen(false);
      setActiveGroup(res.data);
      fetchGroups();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update group.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Share Listing Dialog
  const openShareModal = async () => {
    if (!activeGroup) return;
    setLoadingEligible(true);
    setIsShareModalOpen(true);
    setSelectedListingId(null);
    try {
      const res = await api.get(`/api/groups/${activeGroup.groupId}/eligible-listings`);
      setEligibleListings(res.data || []);
    } catch (err) {
      console.error("Failed to load eligible listings", err);
      toast.error("Failed to load eligible listings.");
      setIsShareModalOpen(false);
    } finally {
      setLoadingEligible(false);
    }
  };

  // Share Listing Submit
  const handleShareListing = async () => {
    if (!activeGroup || !selectedListingId) return;
    try {
      await api.post(`/api/groups/${activeGroup.groupId}/posts`, null, {
        params: { postId: selectedListingId }
      });
      toast.success("Listing shared to community group feed!");
      setIsShareModalOpen(false);
      loadGroupDetails(activeGroup);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to share listing.");
    }
  };

  // Remove Shared Post from feed
  const handleRemoveFeedPost = async (postId: number) => {
    if (!activeGroup || !confirm("Are you sure you want to remove this listing post from the group?")) return;
    try {
      await api.delete(`/api/groups/${activeGroup.groupId}/posts/${postId}`);
      toast.success("Post removed from group feed.");
      loadGroupDetails(activeGroup);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove post.");
    }
  };

  const isMember = activeGroup && members.some((m) => m.userId === currentUser?.id);
  const isApprovedMember = activeGroup && members.some((m) => m.userId === currentUser?.id && m.status === "APPROVED");
  const isGroupOwner = activeGroup && activeGroup.ownerUserId === currentUser?.id;
  const isGroupAdmin = activeGroup && members.some((m) => m.userId === currentUser?.id && m.role === "ADMIN");

  const isSuspended = activeGroup?.status === "SUSPENDED";

  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        {activeGroup ? (
          /* ========================================================
             GROUP DETAILS PAGE (ACTIVE VIEW)
             ======================================================== */
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px] md:h-[calc(100vh-160px)]">
            
            {/* Sidebar Column (Metadata & Members List) */}
            <div className="w-full md:w-80 border-r border-slate-100 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-950/30 shrink-0 md:overflow-y-auto">
              
              {/* Cover Image & Header Info */}
              <div className="relative h-32 w-full bg-slate-200 dark:bg-slate-800 shrink-0">
                {activeGroup.coverImageUrl ? (
                  <img
                    src={activeGroup.coverImageUrl}
                    alt={activeGroup.groupName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-4xl">
                    {activeGroup.groupName.charAt(0)}
                  </div>
                )}
                
                {isSuspended && (
                  <div className="absolute top-2 right-2 bg-red-600 border border-red-700 text-white font-bold text-[9px] uppercase px-2 py-0.5 rounded shadow-sm">
                    Suspended
                  </div>
                )}
              </div>

              <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <button
                  onClick={() => setActiveGroup(null)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 mb-4 inline-flex items-center gap-1 transition-all"
                >
                  &larr; Back to all groups
                </button>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug break-all pr-2">
                    {activeGroup.groupName}
                  </h2>
                  {!isSuspended && (isGroupOwner || isGroupAdmin) && (
                    <button 
                      onClick={openEditModal} 
                      className="text-xs text-indigo-600 font-bold hover:underline shrink-0 flex items-center gap-1"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                  )}
                </div>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
                  {activeGroup.description}
                </p>

                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <Users size={14} className="text-slate-400" />
                    <span className="font-semibold">{activeGroup.memberCount} Members</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <span className="font-semibold">{activeGroup.groupAverageRating?.toFixed(1) || "0.0"} / 5.0</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <Calendar size={14} className="text-slate-400" />
                    <span>Created {new Date(activeGroup.createdAt).toLocaleDateString()}</span>
                  </div>
                  {activeGroup.location && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <MapPin size={14} className="text-slate-400" />
                      <span>{activeGroup.location}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
                    {activeGroup.groupCategory === "ITEM_SWAP" ? "Item Swap" : "Service Swap"}
                  </span>
                  {activeGroup.itemSubcategory && (
                    <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
                      {activeGroup.itemSubcategory}
                    </span>
                  )}
                </div>

                {/* Suspension Banner */}
                {isSuspended && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2">
                    <AlertTriangle className="text-red-600 dark:text-red-400 shrink-0" size={16} />
                    <p className="text-[10px] font-semibold text-red-800 dark:text-red-400 leading-tight">
                      This group is suspended. All member, management, and sharing actions are currently disabled.
                    </p>
                  </div>
                )}

                {/* Join / Leave Buttons */}
                {!isSuspended && (
                  <div className="mt-5">
                    {isMember ? (
                      <button
                        onClick={() => handleLeaveGroup(activeGroup.groupId)}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs transition-all border border-slate-200 dark:border-slate-700"
                      >
                        Leave Group
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinGroup(activeGroup.groupId)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm hover:shadow-md transition-all"
                      >
                        Join Group
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Members List & Requests */}
              <div className="p-6 flex-1 flex flex-col min-h-[300px]">
                {!isSuspended && (isGroupOwner || isGroupAdmin) ? (
                  <div className="flex gap-2 mb-4 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg shrink-0">
                    <button
                      onClick={() => setViewingRequests(false)}
                      className={`flex-1 text-[10px] font-black uppercase tracking-widest py-1.5 rounded-md transition-all ${
                        !viewingRequests
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                      }`}
                    >
                      Members ({members.length})
                    </button>
                    <button
                      onClick={() => setViewingRequests(true)}
                      className={`flex-1 text-[10px] font-black uppercase tracking-widest py-1.5 rounded-md transition-all relative ${
                        viewingRequests
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                      }`}
                    >
                      Requests
                      {pendingRequests.length > 0 && (
                        <span className="absolute top-1/2 -translate-y-1/2 right-2 bg-indigo-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">
                          {pendingRequests.length}
                        </span>
                      )}
                    </button>
                  </div>
                ) : (
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center justify-between">
                    <span>Group Members ({members.length})</span>
                    <Users size={14} />
                  </h3>
                )}

                <div className="space-y-3 flex-1 overflow-y-auto pr-1 max-h-80 md:max-h-none">
                  {viewingRequests && (isGroupOwner || isGroupAdmin) ? (
                    pendingRequests.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 text-xs font-medium">
                        No pending join requests.
                      </div>
                    ) : (
                      pendingRequests.map((req) => (
                        <div
                          key={req.userId}
                          className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-3 rounded-xl shadow-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {req.fullName}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {req.email}
                            </p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => handleAcceptRequest(req.userId)}
                              className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 rounded-lg transition-all"
                              title="Accept Request"
                            >
                              <UserCheck size={14} />
                            </button>
                            <button
                              onClick={() => handleRejectRequest(req.userId)}
                              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 rounded-lg transition-all"
                              title="Reject Request"
                            >
                              <UserX size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    )
                  ) : (
                    members.map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-3 rounded-xl shadow-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {member.fullName}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            member.role === "OWNER"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : member.role === "ADMIN"
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          }`}>
                            {member.role}
                          </span>
                          {member.badgeLabel && (
                            <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                              {member.badgeLabel}
                            </span>
                          )}
                          <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-0.5">
                            <Star size={10} className="text-amber-400 fill-amber-400" />
                            {member.averageRating?.toFixed(1) || "0.0"}
                          </span>
                        </div>
                      </div>

                      {/* Management actions (Owner/Admin only) */}
                      {!isSuspended && (isGroupOwner || isGroupAdmin) && member.userId !== currentUser?.id && (
                        <div className="flex items-center gap-0.5 shrink-0">
                          {member.role === "MEMBER" && (
                            <button
                              onClick={() => handlePromoteMember(member.userId)}
                              title="Promote to Admin"
                              className="p-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 rounded-md transition-all"
                            >
                              <UserCheck size={13} />
                            </button>
                          )}
                          {member.role === "ADMIN" && isGroupOwner && (
                            <button
                              onClick={() => handleDemoteMember(member.userId)}
                              title="Revoke Admin"
                              className="p-1 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-600 rounded-md transition-all"
                            >
                              <ChevronDown size={13} />
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveMember(member.userId)}
                            title="Remove Member"
                            className="p-1 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 rounded-md transition-all"
                          >
                            <UserX size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                  )}
                </div>

                {/* Delete Group button (Owner only) */}
                {!isSuspended && isGroupOwner && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4">
                    <button
                      onClick={() => handleDeleteGroup(activeGroup.groupId)}
                      className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 font-bold py-2.5 px-4 rounded-xl text-xs transition-all border border-red-200 dark:border-red-900 inline-flex items-center justify-center gap-2"
                    >
                      <Trash2 size={14} /> Delete Group
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Scoped Content Feed Column */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
              
              {/* Header Feed Bar */}
              <div className="h-16 border-b border-slate-100 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-950/50">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Group Feed Posts ({feedPosts.length})
                </h3>

                {isApprovedMember && !isSuspended && (
                  <button
                    onClick={openShareModal}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-sm hover:shadow-md"
                  >
                    <Plus size={14} /> Share Listing
                  </button>
                )}
              </div>

              {/* Feed Filters Bar */}
              <div className="border-b border-slate-100 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 flex flex-col gap-3 sm:flex-row sm:items-center shrink-0">
                
                {/* Search posts */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={feedSearch}
                    onChange={(e) => setFeedSearch(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none"
                  />
                </div>

                {/* Filters & Sorting */}
                <div className="flex flex-wrap items-center gap-2">
                  
                  {/* Location filter */}
                  <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 gap-1.5">
                    <MapPin size={12} className="text-slate-400" />
                    <input
                      type="text"
                      placeholder="Location..."
                      value={feedLocationFilter}
                      onChange={(e) => setFeedLocationFilter(e.target.value)}
                      className="bg-transparent text-xs w-20 focus:outline-none border-none p-0 text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Sort dropdown */}
                  <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1.5 gap-1.5">
                    <ArrowUpDown size={12} className="text-slate-400" />
                    <select
                      value={feedSort}
                      onChange={(e) => setFeedSort(e.target.value)}
                      className="bg-transparent text-xs text-slate-700 dark:text-slate-300 focus:outline-none border-none p-0 cursor-pointer font-semibold"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="activity">Recent Activity</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Feed Stream list */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/20">
                {loadingFeed ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                  </div>
                ) : feedPosts.length === 0 ? (
                  <div className="text-center py-20 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8">
                    <FileText className="mx-auto text-slate-300 mb-3" size={36} />
                    <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No feed posts matches</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                      Be the first to share an eligible active listing to this community group feed!
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {feedPosts.map((gp) => {
                      const post = gp.postDetails;
                      const isOwnerOfPost = post.user?.id === currentUser?.id;
                      
                      return (
                        <div
                          key={gp.groupPostId}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-all hover:border-slate-300 dark:hover:border-slate-700"
                        >
                          <div
                            onClick={() => router.push(`/post/${post.postId}`)}
                            className="cursor-pointer"
                          >
                            {/* Images Carousel or Single */}
                            <div className="aspect-[16/10] w-full bg-slate-100 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 overflow-hidden relative">
                              {post.postImages?.[0] ? (
                                <img
                                  src={post.postImages[0].postImageUrl}
                                  alt={post.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                  <ImageIcon size={28} />
                                </div>
                              )}
                              
                              <div className="absolute bottom-2 left-2 flex gap-1">
                                <span className="bg-slate-900/70 backdrop-blur-xs text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                                  {post.postType}
                                </span>
                                <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded text-white ${
                                  post.status === "ACTIVE" ? "bg-emerald-600/80" : "bg-amber-600/80"
                                }`}>
                                  {post.status}
                                </span>
                              </div>
                            </div>

                            <div className="p-5">
                              <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm tracking-tight line-clamp-1 hover:text-indigo-600 transition-colors">
                                {post.title}
                              </h4>
                              
                              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mt-1 inline-flex items-center gap-1">
                                <Tag size={10} /> {post.category}
                              </p>
                              
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                                {post.description}
                              </p>

                              {/* Exchange specifications */}
                              {(post.lookingFor || post.location) && (
                                <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-1 text-[10px]">
                                  {post.location && (
                                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                      <MapPin size={10} className="shrink-0" />
                                      <span className="truncate">Location: {post.location}</span>
                                    </div>
                                  )}
                                  {post.lookingFor && (
                                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                      <Tag size={10} className="shrink-0" />
                                      <span className="truncate">Looking For: {post.lookingFor}</span>
                                    </div>
                                  )}
                                  {post.item && (
                                    <div className="text-slate-500 dark:text-slate-400">
                                      Condition: <span className="font-semibold text-slate-700 dark:text-slate-300">{post.item.condition}</span> | Est: <span className="font-semibold text-slate-700 dark:text-slate-300">${post.item.estimatedValue}</span>
                                    </div>
                                  )}
                                  {post.service && (
                                    <div className="text-slate-500 dark:text-slate-400">
                                      Skill: <span className="font-semibold text-slate-700 dark:text-slate-300">{post.service.skillLevel}</span> | Duration: <span className="font-semibold text-slate-700 dark:text-slate-300">{post.service.serviceDuration}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-900/30 flex items-center justify-between">
                            <div className="min-w-0 pr-2">
                              <p className="text-[10px] text-slate-400 leading-tight">Shared by {post.user?.fullName || "Owner"}</p>
                              <p className="text-[9px] text-slate-400 leading-tight mt-0.5">
                                On {new Date(gp.sharedAt).toLocaleDateString()}
                              </p>
                            </div>

                            {/* Delete Shared Post Button */}
                            {!isSuspended && (isGroupOwner || isGroupAdmin || isOwnerOfPost) && (
                              <button
                                onClick={() => handleRemoveFeedPost(post.postId)}
                                title="Remove shared post"
                                className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 rounded-lg border border-red-100 dark:border-red-900 transition-all shrink-0"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================
             GROUPS LISTING DASHBOARD
             ======================================================== */
          <div>
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                  Community Groups
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-semibold mt-2">
                  Exchange specific items and services inside verified category communities.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-2xl text-xs shadow-sm hover:shadow-md transition-all self-start sm:self-center"
              >
                <Plus size={16} /> Create Group
              </button>
            </div>

            {/* Filter Search Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs mb-8 flex flex-col md:flex-row gap-4 items-center">
              
              {/* Search text */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search group names, descriptions..."
                  value={groupSearchQuery}
                  onChange={(e) => setGroupSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-2xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Group category filter */}
              <div className="flex gap-2 w-full md:w-auto shrink-0">
                <button
                  onClick={() => setGroupCategoryFilter("")}
                  className={`flex-1 md:flex-none text-xs font-bold px-4 py-3 rounded-2xl transition-all border ${
                    groupCategoryFilter === ""
                      ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800"
                  }`}
                >
                  All Groups
                </button>
                <button
                  onClick={() => setGroupCategoryFilter("ITEM_SWAP")}
                  className={`flex-1 md:flex-none text-xs font-bold px-4 py-3 rounded-2xl transition-all border ${
                    groupCategoryFilter === "ITEM_SWAP"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800"
                  }`}
                >
                  Item Swap
                </button>
                <button
                  onClick={() => setGroupCategoryFilter("SERVICE_SWAP")}
                  className={`flex-1 md:flex-none text-xs font-bold px-4 py-3 rounded-2xl transition-all border ${
                    groupCategoryFilter === "SERVICE_SWAP"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800"
                  }`}
                >
                  Service Swap
                </button>
              </div>
            </div>

            {/* Grid Display */}
            {loading ? (
              <div className="flex items-center justify-center p-24">
                <Loader2 className="animate-spin text-indigo-600" size={36} />
              </div>
            ) : groups.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 p-20 rounded-3xl text-center">
                <Users className="mx-auto text-slate-300 mb-4" size={44} />
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">No groups available</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Adjust your search keywords or general category filters. Or create a brand new community group now!
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {groups.map((group) => (
                  <div
                    key={group.groupId}
                    onClick={() => setActiveGroup(group)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-md hover:border-indigo-200/80 dark:hover:border-indigo-900/60 cursor-pointer transition-all flex flex-col"
                  >
                    {/* Cover image area */}
                    <div className="h-32 bg-slate-200 dark:bg-slate-800 w-full relative">
                      {group.coverImageUrl ? (
                        <img
                          src={group.coverImageUrl}
                          alt={group.groupName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-3xl">
                          {group.groupName.charAt(0)}
                        </div>
                      )}
                      
                      {group.status === "SUSPENDED" && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-wide shadow-xs">
                          Suspended
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-black text-slate-900 dark:text-slate-100 text-base tracking-tight leading-snug line-clamp-1">
                          {group.groupName}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2 mt-2">
                          {group.description}
                        </p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/50 space-y-3">
                        <div className="flex flex-wrap gap-1.5">
                          <span className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                            {group.groupCategory === "ITEM_SWAP" ? "Item Swap" : "Service Swap"}
                          </span>
                          {group.itemSubcategory && (
                            <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                              {group.itemSubcategory}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-300">
                          <div className="flex items-center gap-1">
                            <Users size={12} />
                            <span>{group.memberCount} members</span>
                          </div>
                          <span className="text-indigo-600 group-hover:underline inline-flex items-center gap-0.5">
                            Enter Group <ArrowRight size={12} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
           CREATE GROUP DIALOG / MODAL
           ======================================================== */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsCreateModalOpen(false)} />
            <div className="relative w-full max-w-[485px] bg-[#F8FAFC] dark:bg-slate-950 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h3 className="font-black text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
                  Create Community Group
                </h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="p-6 space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g. Downtown Electronics Barter"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="Describe the swap category rules and members criteria..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      General Category *
                    </label>
                    <select
                      value={newGroupCategory}
                      onChange={(e) => {
                        setNewGroupCategory(e.target.value as any);
                        setNewGroupSubcategory("");
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
                    >
                      <option value="ITEM_SWAP">Item Swap Group</option>
                      <option value="SERVICE_SWAP">Service Swap Group</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Item Subcategory {newGroupCategory === "ITEM_SWAP" ? "*" : ""}
                    </label>
                    <select
                      disabled={newGroupCategory !== "ITEM_SWAP"}
                      required={newGroupCategory === "ITEM_SWAP"}
                      value={newGroupSubcategory}
                      onChange={(e) => setNewGroupSubcategory(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3 py-2.5 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <option value="">Select Subcategory...</option>
                      {ITEM_SUBCATEGORIES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Cover Image (Upload)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setCoverImageFile(e.target.files[0]);
                        }
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-4 py-2 focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                    />
                    {coverImageFile && <p className="text-[10px] text-indigo-600 mt-1">Selected: {coverImageFile.name}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Location / Region
                    </label>
                    <input
                      type="text"
                      value={newGroupLocation}
                      onChange={(e) => setNewGroupLocation(e.target.value)}
                      placeholder="e.g. Brooklyn, NY"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-4 py-2.5 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingGroup}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {isSubmittingGroup && <Loader2 size={12} className="animate-spin" />}
                    Create Group
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================
           EDIT GROUP MODAL
           ======================================================== */}
        {isEditModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsEditModalOpen(false)} />
            <div className="relative w-full max-w-lg bg-[#F8FAFC] dark:bg-slate-950 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              
              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                <h3 className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider text-sm flex items-center gap-2">
                  <Edit2 size={16} className="text-indigo-600" />
                  Edit Group Details
                </h3>
                <button onClick={() => setIsEditModalOpen(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleEditGroup} className="flex flex-col overflow-hidden">
                <div className="p-6 space-y-5 overflow-y-auto">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">
                      Group Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editGroupName}
                      onChange={(e) => setEditGroupName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  {/* Cover Image */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">
                      Cover Image (Optional)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={editGroupCoverImage}
                        onChange={(e) => {
                          setEditGroupCoverImage(e.target.value);
                          setEditCoverImageFile(null);
                        }}
                        placeholder="Paste image URL..."
                        className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        disabled={!!editCoverImageFile}
                      />
                      <label className="cursor-pointer bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs flex items-center justify-center hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setEditCoverImageFile(e.target.files[0]);
                              setEditGroupCoverImage("");
                            }
                          }}
                        />
                      </label>
                    </div>
                    {editCoverImageFile && (
                      <p className="text-[10px] text-emerald-600 font-bold mt-1 ml-1 flex items-center gap-1">
                        <ImageIcon size={10} /> {editCoverImageFile.name} selected
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-5 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingEdit}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs disabled:opacity-50 inline-flex items-center gap-2 shadow-sm transition-all"
                  >
                    {isSubmittingEdit && <Loader2 size={12} className="animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================
           SHARE LISTING MODAL / DIALOG
           ======================================================== */}
        {isShareModalOpen && activeGroup && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsShareModalOpen(false)} />
            <div className="relative w-full max-w-[550px] bg-[#F8FAFC] dark:bg-slate-950 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="min-w-0">
                  <h3 className="font-black text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
                    Share Listing to Group
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Showing your active eligible listings for this {activeGroup.groupCategory === "ITEM_SWAP" ? "Item (" + activeGroup.itemSubcategory + ")" : "Service"} swap group.
                  </p>
                </div>
                <button onClick={() => setIsShareModalOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg shrink-0">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 max-h-[380px] overflow-y-auto">
                {loadingEligible ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                  </div>
                ) : eligibleListings.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <FileText className="mx-auto text-slate-300 mb-2" size={32} />
                    <h4 className="font-bold text-slate-700 dark:text-slate-300 text-xs">No eligible active listings found</h4>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto">
                      {activeGroup.groupCategory === "ITEM_SWAP" 
                        ? `Ensure you have active item listings in the category "${activeGroup.itemSubcategory}".`
                        : "Ensure you have active service listings."}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {eligibleListings.map((p) => {
                      const isSelected = selectedListingId === p.postId;
                      return (
                        <div
                          key={p.postId}
                          onClick={() => setSelectedListingId(p.postId)}
                          className={`bg-white dark:bg-slate-900 border rounded-2xl p-3.5 cursor-pointer shadow-xs hover:shadow-sm transition-all flex flex-col justify-between relative ${
                            isSelected 
                              ? "border-indigo-600 ring-2 ring-indigo-500/10" 
                              : "border-slate-200 dark:border-slate-800"
                          }`}
                        >
                          <div className="flex gap-3">
                            {/* Image Thumbnail */}
                            <div className="size-12 rounded-lg bg-slate-100 dark:bg-slate-950 overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
                              {p.postImages?.[0] ? (
                                <img
                                  src={p.postImages[0].postImageUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300 text-[10px]">
                                  No Img
                                </div>
                              )}
                            </div>
                            
                            <div className="min-w-0">
                              <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate leading-snug">
                                {p.title}
                              </h5>
                              <p className="text-[9px] text-slate-400 mt-0.5 truncate uppercase tracking-wide">
                                {p.category}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-3 pt-2.5 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between text-[8px] text-slate-400">
                            <span>Condition: {p.item?.condition || p.service?.skillLevel || "N/A"}</span>
                            <span>Est: ${p.item?.estimatedValue || "N/A"}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 bg-white dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedListingId || loadingEligible}
                  onClick={handleShareListing}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs disabled:opacity-50 shadow-sm"
                >
                  Share to Feed
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}
