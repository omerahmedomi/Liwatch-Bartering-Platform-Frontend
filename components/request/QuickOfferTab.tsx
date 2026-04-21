"use client";
import { useState, useRef } from "react";
import { Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function QuickOfferTab({
  wantedPostId,
  onSuccess,
}: {
  wantedPostId: number;
  onSuccess: () => void;
}) {
  // Form State
  const [title, setTitle] = useState("");
  const [condition, setCondition] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");

  // Image State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation Check
  const isValid = title.trim() !== "" && condition !== "" && imageFile !== null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsSubmitting(true);

    try {
      // Step 1: Upload image to your storage service
      // const formData = new FormData();
      // formData.append("file", imageFile);
      // const uploadRes = await api.post("/api/upload", formData);
      // const imageUrl = uploadRes.data.url;
      const imageUrl = "mocked-uploaded-url.jpg"; // Replace with real upload logic

      // Step 2: Create the Private Post
      const quickOfferRes = await api.post("/api/post/quick-offer", {
        title,
        condition,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        mediaUrl: imageUrl,
        // Backend handles visibility = PRIVATE_OFFER automatically
      });

      const newPostId = quickOfferRes.data.postId;

      // Step 3: Submit the Direct Swap Request
      await api.post("/api/direct-swap/request", {
        wantedPostId,
        offeredPostId: newPostId,
      });

      toast.success("Quick Offer Sent!", {
        className: "border-l-4 border-emerald-500 font-bold",
      });
      onSuccess();
    } catch (error) {
      toast.error("Failed to send quick offer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="p-6 space-y-6 pb-24">
        {/* Edge Case: Mandatory Image Upload (The Anchor of Trust) */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
            Item Photo <span className="text-red-500">*</span>
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="h-40 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl flex flex-col items-center justify-center bg-white cursor-pointer overflow-hidden relative group transition-colors"
          >
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white font-bold text-sm">
                    Change Image
                  </span>
                </div>
              </>
            ) : (
              <div className="text-slate-400 flex flex-col items-center gap-2">
                <ImagePlus size={32} />
                <span className="text-sm font-bold">Upload a clear photo</span>
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

        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
            What is it? <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. iPhone 12, 64GB"
            className="w-full bg-white border border-slate-200 p-4 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
              Condition <span className="text-red-500">*</span>
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full bg-white border border-slate-200 p-4 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
            >
              <option value="" disabled>
                Select
              </option>
              <option value="NEW">Brand New</option>
              <option value="LIKE_NEW">Like New</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
              Est. Value (Optional)
            </label>
            <div className="relative">
              <input
                type="number"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white border border-slate-200 p-4 pr-12 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">
                ETB
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="absolute bottom-0 left-0 w-full p-6 bg-white border-t border-slate-100 backdrop-blur-md bg-white/90">
        <button
          disabled={!isValid || isSubmitting}
          onClick={handleSubmit}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20 disabled:shadow-none text-sm"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            "Submit Quick Offer"
          )}
        </button>
      </div>
    </div>
  );
}
