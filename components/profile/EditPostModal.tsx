"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { ITEM_CATEGORIES, SERVICE_CATEGORIES } from "@/lib/categories";
import { toast } from "sonner";

import CreatePostDetailsSection from "../post/create-post/CreatePostDetailsSection";
import CreatePostMatchSection from "../post/create-post/CreatePostMatchSection";
import CreatePostTypeSelector from "../post/create-post/CreatePostTypeSelector";
import CreatePostVisualsSection from "../post/create-post/CreatePostVisualsSection";
import { uploadToCloudinary } from "@/lib/cloudinary";
import {
  CreatePostFormState,
  CreatePostType,
} from "../post/create-post/createPostForm.types";
import { getErrorMessage } from "@/lib/error";

const initialFormData: CreatePostFormState = {
  postType: "ITEM",
  title: "",
  description: "",
  category: ITEM_CATEGORIES[0],
  location: "",
  lookingFor: "",
  termsAgreed: true,
  item: {
    condition: "USED",
    estimatedValue: "",
    partialCashAllowed: false,
  },
  service: {
    serviceDuration: "",
    skillLevel: "EXPERT",
    availability: "",
  },
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  postId: number;
  onSuccess: () => void;
};

export default function EditPostModal({ isOpen, onClose, postId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [initialFetchLoading, setInitialFetchLoading] = useState(true);
  const [formData, setFormData] = useState<CreatePostFormState>(initialFormData);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      newPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [newPreviews]);

  const availableCategories = useMemo(
    () => (formData.postType === "ITEM" ? ITEM_CATEGORIES : SERVICE_CATEGORIES),
    [formData.postType]
  );

  useEffect(() => {
    if (!isOpen) return;

    const fetchPostData = async () => {
      setInitialFetchLoading(true);
      try {
        const response = await api.get(`/api/post/${postId}`);
        const data = response.data;
        
        setFormData({
          postType: data.postType,
          title: data.title,
          description: data.description,
          category: data.category,
          location: data.location || "",
          lookingFor: data.lookingFor || "",
          termsAgreed: true,
          item: data.item ? {
            condition: data.item.condition || "USED",
            estimatedValue: data.item.estimatedValue ? String(data.item.estimatedValue) : "",
            partialCashAllowed: data.item.partialCashAllowed || false,
          } : initialFormData.item,
          service: data.service ? {
            serviceDuration: data.service.serviceDuration || "",
            skillLevel: data.service.skillLevel || "EXPERT",
            availability: data.service.availability || "",
          } : initialFormData.service,
        });

        if (data.postImages && data.postImages.length > 0) {
          const imgUrls = data.postImages.map((img: any) => img.postImageUrl || img.mediaUrl);
          setExistingImages(imgUrls);
        }
      } catch (err: any) {
        console.error("fetchPostData error:", err);
        console.error("Error response:", err?.response?.data);
        toast.error(`Failed to load listing data. ${err?.response?.data?.message || err?.message || ""}`);
        onClose();
      } finally {
        setInitialFetchLoading(false);
      }
    };
    fetchPostData();
  }, [isOpen, postId, onClose]);

  const handlePostTypeChange = (postType: CreatePostType) => {
    setFormData((current) => ({
      ...current,
      postType,
      category: postType === "ITEM" ? ITEM_CATEGORIES[0] : SERVICE_CATEGORIES[0],
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const files = Array.from(event.target.files);
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024;

    const filteredFiles = files.filter((file) => {
      if (!validTypes.includes(file.type)) {
        toast.error(`Invalid format: ${file.name}`, { description: "Use JPG, PNG or WebP." });
        return false;
      }
      if (file.size > maxSize) {
        toast.error(`File too large: ${file.name}`, { description: "Max size is 5MB." });
        return false;
      }
      return true;
    });

    const availableSlots = 5 - (existingImages.length + newImages.length);
    if (availableSlots <= 0) {
      toast.error("Limit Reached", { description: "You can only upload a maximum of 5 images." });
      event.target.value = "";
      return;
    }

    const filesToKeep = filteredFiles.slice(0, availableSlots);
    setNewImages((current) => [...current, ...filesToKeep]);
    setNewPreviews((current) => [...current, ...filesToKeep.map(f => URL.createObjectURL(f))]);
    event.target.value = "";
  };

  const removeImage = (index: number) => {
    if (index < existingImages.length) {
      setExistingImages((current) => current.filter((_, i) => i !== index));
    } else {
      const newIndex = index - existingImages.length;
      setNewImages((current) => current.filter((_, i) => i !== newIndex));
      setNewPreviews((current) => {
        const updated = current.filter((_, i) => i !== newIndex);
        URL.revokeObjectURL(current[newIndex]);
        return updated;
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.location || formData.location.trim().length < 3) {
      return toast.error("Location Missing", { description: "Please specify a neighborhood or city for the exchange." });
    }

    setLoading(true);
    const loadingToast = toast.loading("Updating your listing...");

    try {
      const uploadPromises = newImages.map(async (file, index) => {
        try {
          return await uploadToCloudinary(file);
        } catch {
          throw new Error(`Image ${index + 1} failed to upload.`);
        }
      });

      const newImageUrls = await Promise.all(uploadPromises);
      const allImageUrls = [...existingImages, ...newImageUrls];

      const baseData = {
        postType: formData.postType,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        lookingFor: formData.lookingFor,
        item: formData.postType === "ITEM" ? {
          ...formData.item,
          estimatedValue: formData.item.estimatedValue ? parseFloat(formData.item.estimatedValue) : null,
        } : null,
        service: formData.postType === "SERVICE" ? formData.service : null,
        postImages: allImageUrls.map((url) => ({ postImageUrl: url })),
      };

      const response = await api.put(`/api/post/update/${postId}`, baseData);
      if (response.status === 200 || response.status === 201) {
        toast.success("Listing Updated!", { id: loadingToast });
        onSuccess();
        onClose();
      }
    } catch (error: unknown) {
      console.error("Post Update Error:", error);
      toast.error("Update Failed", {
        id: loadingToast,
        description: getErrorMessage(error, "Failed to update your listing. Please try again."),
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between bg-white dark:bg-slate-950/20 shrink-0">
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
            Edit Listing
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-300 cursor-pointer p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scroll Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {initialFetchLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
              <p className="text-slate-500 dark:text-slate-400 font-semibold animate-pulse">Loading listing details...</p>
            </div>
          ) : (
            <form id="edit-post-form" onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-slate-100 dark:bg-slate-800/40 p-5 rounded-2xl flex items-center justify-between border border-slate-200 dark:border-slate-800/80">
                <span className="text-slate-400 dark:text-slate-500 font-extrabold uppercase text-xs tracking-widest">Listing Type</span>
                <span className="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border border-indigo-200 dark:border-indigo-900/50">
                  {formData.postType}
                </span>
              </div>
              <CreatePostVisualsSection
                postType={formData.postType}
                previews={[...existingImages, ...newPreviews]}
                onImageChange={handleImageChange}
                onRemoveImage={removeImage}
              />
              <CreatePostDetailsSection
                formData={formData}
                setFormData={setFormData}
                availableCategories={availableCategories}
              />
              <CreatePostMatchSection
                lookingFor={formData.lookingFor}
                onChange={(lookingFor) =>
                  setFormData((current) => ({ ...current, lookingFor }))
                }
              />
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-950/20 shrink-0 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-post-form"
            disabled={loading || initialFetchLoading}
            className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
