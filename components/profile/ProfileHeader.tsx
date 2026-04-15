"use client";
import { useState, useRef } from "react";
import { MapPin, Mail, Edit2, Check, X, Camera, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { uploadToCloudinary } from "@/lib/cloudinary";

export default function ProfileHeader({
  profile,
  isOwner,
}: {
  profile: any;
  isOwner: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [location, setLocation] = useState(profile?.location || "");
  const [savingLocation, setSavingLocation] = useState(false);

  // --- Image Upload States ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState(
    profile?.profileImage || null,
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // 1. Handle Location Save
  const handleLocationSave = async () => {
    setSavingLocation(true);
    try {
      await api.post(`/api/profile/update/${profile.profileId}`, {
        location: location,
        bio: profile.bio, // Must pass existing bio so it doesn't get overwritten with null
        profileImage: imagePreview, // Pass the current image state
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update location", error);
    } finally {
      setSavingLocation(false);
    }
  };

  // 2. Handle Image Selection & Upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show an instant preview to the user before it finishes uploading
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setIsUploadingImage(true);

    try {
      // TODO: 1. Upload the 'file' to Cloudinary or your Spring Boot file server here
      // const formData = new FormData();
      // formData.append("file", file);
      // const uploadRes = await axios.post("YOUR_UPLOAD_ENDPOINT", formData);
      // const finalImageUrl = uploadRes.data.secure_url;
      
      const finalImageUrl = await uploadToCloudinary(file); // Replace this with the real URL from your upload service

      // 2. Save the new image URL to the user's profile
      await api.post(`/api/profile/update/${profile.profileId}`, {
        location: location || profile.location,
        bio: profile.bio,
        profileImage: finalImageUrl,
      });
    } catch (error) {
      console.error("Failed to upload image", error);
      // Revert the preview if the upload fails
      setImagePreview(profile?.profileImage);
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="bg-white p-8 border-l-4 border-indigo-700 shadow-xl shadow-slate-200/50 flex flex-col sm:flex-row gap-8 items-center sm:items-start relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-50" />

      {/* Avatar Container */}
      <div className="relative group shrink-0 z-10">
        <div className="size-32 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden flex items-center justify-center relative">
          {/* Image Loading Overlay */}
          {isUploadingImage && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-20">
              <Loader2 className="animate-spin text-indigo-600" size={24} />
            </div>
          )}

          {imagePreview ? (
            <img
              src={imagePreview}
              className="w-full h-full object-cover"
              alt={`${profile?.user?.name}'s avatar`}
            />
          ) : (
            <span className="text-4xl font-black text-indigo-300">
              {profile?.user?.name?.[0]?.toUpperCase()}
            </span>
          )}
        </div>

        {/* Camera Button & Hidden File Input */}
        {isOwner && (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
              className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-30"
            >
              <Camera size={24} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
            />
          </>
        )}
      </div>

      <div className="flex-1 text-center sm:text-left z-10 w-full">
        <h1 className="text-3xl font-black text-slate-900 mb-1">
          {profile?.user?.name}
        </h1>
        <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-500 text-sm font-bold mb-4">
          <Mail size={14} className="text-indigo-500" /> {profile?.user?.email}
        </div>

        {/* Inline Location Edit */}
        {isEditing ? (
          <div className="flex items-center gap-2 max-w-xs mx-auto sm:mx-0">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500 flex-1"
              placeholder="Enter your location"
            />
            <button
              onClick={handleLocationSave}
              disabled={savingLocation}
              className="text-emerald-600 disabled:opacity-50"
            >
              {savingLocation ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Check size={18} />
              )}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setLocation(profile?.location || ""); // Reset on cancel
              }}
              disabled={savingLocation}
              className="text-red-500 disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-700 font-bold">
            <MapPin size={18} className="text-indigo-500" />
            <span>{location || "Location not provided"}</span>
            {isOwner && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                <Edit2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
