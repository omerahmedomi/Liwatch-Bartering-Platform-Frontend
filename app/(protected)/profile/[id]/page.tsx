"use client";
import { useEffect, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Info } from "lucide-react";
import api from "@/lib/axios";

// Import your newly created components
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileBio from "@/components/profile/ProfileBio";
import ProfileTrustCard from "@/components/profile/ProfileTrustCard";
import ProfileActiveListings from "@/components/profile/ProfileActiveListings";

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;

    const fetchProfileData = async () => {
      try {
        // 1. Fetch the profile being viewed
        const profileRes = await api.get(`/api/profile/${params.id}`);
        const profileData = profileRes.data;
        setProfile(profileData);

        // 2. See if the viewer is the owner
        // Since AuthGuard handles tokens, we just boldly call /me.
        // If it fails (e.g., they are a guest), the catch block ignores it.
        try {
          const myUserRes = await api.get("/api/profile/me");
          if (myUserRes.data?.user?.id === profileData?.user?.id) {
            setIsOwner(true);
          }
        } catch (e) {
          // Viewer is likely a guest or doesn't own this profile
          setIsOwner(false);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (!profile) {
   notFound()
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Navigation */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold uppercase text-xs tracking-widest mb-6 transition-colors w-fit cursor-pointer"
        >
          <ChevronLeft size={16} /> Back
        </button>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            <ProfileHeader profile={profile} isOwner={isOwner} />
            <ProfileBio profile={profile} isOwner={isOwner} />

            {/* Active Listings Placeholder */}
            <ProfileActiveListings
              userId={profile.user.id}
              isOwner={isOwner}
              userName={profile.user.name}
            />
          </div>

          {/* Sticky Sidebar Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <ProfileTrustCard
                score={profile.trustScore}
                level={profile.badgeLevel}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
