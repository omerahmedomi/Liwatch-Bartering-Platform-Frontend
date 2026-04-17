"use client";
import { useState } from "react";
import { Edit2, Save, X } from "lucide-react";
import api from "@/lib/axios";

export default function ProfileBio({
  profile,
  isOwner,
}: {
  profile: any;
  isOwner: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(profile?.bio || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post(`/api/profile/update/${profile.profileId}`, {
        location: profile.location,
        bio,
        profileImage: profile.profileImage,
      });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-8 border-l-4 border-indigo-700 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">
          About Me
        </h3>
        {isOwner && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-indigo-600 flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <Edit2 size={12} /> Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-lg text-sm outline-none focus:border-indigo-500 min-h-[120px]"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-xs font-bold text-slate-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-indigo-600 text-white px-4 py-1 rounded text-xs font-bold"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-slate-600 leading-relaxed">
          {bio || "No bio added yet."}
        </p>
      )}
    </div>
  );
}
