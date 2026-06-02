"use client";
import { useState, useRef } from "react";
import { Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { ITEM_CATEGORIES } from "@/lib/categories";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";

export default function QuickOfferTab({
  wantedPostId,
  onSuccess,
  requestedUser,
}: {
  wantedPostId: number;
  onSuccess: () => void;
  requestedUser: any;
}) {
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(ITEM_CATEGORIES[0]);
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");

  // Image State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation Check
  const isValid =
    title.trim() !== "" &&
    description.trim() !== "" &&
    category !== "" &&
    location.trim().length >= 3 &&
    imageFile !== null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      toast.error("Invalid format", {
        description: "Use JPG, PNG or WebP.",
      });
      return;
    }

    if (file.size > maxSize) {
      toast.error("File too large", {
        description: "Max size is 5MB.",
      });
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!isValid) {
      if (location.trim().length < 3) {
        toast.error("Invalid Location", {
          description: "Location must be at least 3 characters long.",
        });
      }
      return;
    }
    setIsSubmitting(true);

    const loadingToast = toast.loading("Uploading your quick offer...");

    try {
      // Step 1: Upload image to Cloudinary
      const imageUrl = await uploadToCloudinary(imageFile);

      // Step 2: Create the Post via /api/post/createPost
      const postData = {
        postType: "ITEM",
        title: title.trim(),
        description: description.trim(),
        category,
        location: location.trim(),
        lookingFor: "",
        isVisible: false, // Hide from global listings
        item: {
          condition: condition || null,
          estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
          partialCashAllowed: false,
        },
        service: null,
        postImages: [{ postImageUrl: imageUrl }],
        groupId: null,
        isGroupOnly: false,
      };

      const createPostRes = await api.post("/api/post/createPost", postData);
      const newPostId = createPostRes.data.postId;

      // Step 3: Submit the Direct Swap Request
      await api.post("/api/direct-swap/send-request", {
        receiverId: requestedUser?.id,
        requestedPostId: wantedPostId,
        offeredPostId: newPostId,
      });

      toast.success("Quick Offer Sent successfully!", {
        id: loadingToast,
        className: "border-l-4 border-emerald-500 font-bold",
      });
      onSuccess();
    } catch (error: any) {
      console.error("Quick offer failed:", error);
      toast.error("Failed to send quick offer", {
        id: loadingToast,
        description: error.response?.data?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="p-6 space-y-6 pb-28 overflow-y-auto max-h-[60vh]">
        {/* Item Photo Upload */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
            Item Photo <span className="text-red-500">*</span>
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="h-36 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl flex flex-col items-center justify-center bg-white dark:bg-slate-900 cursor-pointer overflow-hidden relative group transition-colors"
          >
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white font-bold text-xs uppercase tracking-wider">
                    Change Image
                  </span>
                </div>
              </>
            ) : (
              <div className="text-slate-400 flex flex-col items-center gap-1.5">
                <ImagePlus size={28} />
                <span className="text-xs font-bold uppercase tracking-wider">Upload a clear photo</span>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
          </div>
        </div>

        {/* Title & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
              Item Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. iPhone 12, 64GB"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm appearance-none"
            >
              {ITEM_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the condition, features, or specifics of your offer..."
            rows={3}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
            Exchange Location <span className="text-red-500">*</span>
          </label>
          <LocationAutocomplete
            value={location}
            onChange={(val) => setLocation(val)}
            placeholder="Search city in Ethiopia..."
          />
        </div>

        {/* Condition & Est Value */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
              Condition (Optional)
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm appearance-none"
            >
              <option value="">
                Select (Optional)
              </option>
              <option value="NEW">New</option>
              <option value="USED">Used</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
              Est. Value (Optional)
            </label>
            <div className="relative">
              <input
                type="number"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 pr-12 rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">
                ETB
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="absolute bottom-0 left-0 w-full p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 backdrop-blur-md bg-white dark:bg-slate-900/95 z-10">
        <button
          disabled={!isValid || isSubmitting}
          onClick={handleSubmit}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 text-white font-black uppercase tracking-widest py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/10 disabled:shadow-none text-xs"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            "Submit Quick Offer"
          )}
        </button>
      </div>
    </div>
  );
}
