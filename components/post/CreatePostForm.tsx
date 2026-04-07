"use client";

import { useState, useMemo } from "react";
import { Plus, X, Loader2, Info, Package, ChevronDown } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Zap } from "lucide-react";
import { LocationAutocomplete } from "../LocationAutocomplete";
import { ITEM_CATEGORIES, SERVICE_CATEGORIES } from "@/lib/categories";

export default function CreatePostForm() {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Inside CreatePostForm.tsx
  const [formData, setFormData] = useState({
    postType: "ITEM" as "ITEM" | "SERVICE",
    title: "",
    description: "",
    category: ITEM_CATEGORIES[0],
    exchangeType: "PERMANENT" as "PERMANENT" | "TEMPORARY",
    location: "",
    lookingFor: "",
    termsAgreed: false,

    // Nested Item DTO
    item: {
      condition: "USED" as "NEW" | "USED",
      estimatedValue: "",
      partialCashAllowed: false,
    },

    // Nested Service DTO
    service: {
      serviceDuration: "",
      skillLevel: "EXPERT" as "BEGINNER" | "EXPERT",
      availability: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      // 1. Basic Validation (Size & Type)
      const VALID_TYPES = ["image/jpeg", "image/png", "image/webp"];
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB

      const filteredFiles = newFiles.filter((file) => {
        if (!VALID_TYPES.includes(file.type)) {
          toast.error(`Invalid format: ${file.name}`, {
            description: "Use JPG, PNG or WebP.",
          });
          return false;
        }
        if (file.size > MAX_SIZE) {
          toast.error(`File too large: ${file.name}`, {
            description: "Max size is 5MB.",
          });
          return false;
        }
        return true;
      });

      // 2. The Bulk Limit Logic
      const availableSlots = 5 - images.length; // How many spots are left?

      if (availableSlots <= 0) {
        toast.error("Limit Reached", {
          description: "You can only upload a maximum of 5 images.",
        });
        e.target.value = ""; // Reset input
        return;
      }

      // Cut off any extra files that exceed the 5-image limit
      const filesToKeep = filteredFiles.slice(0, availableSlots);

      // Notify the user if we had to discard some of their bulk selection
      if (filteredFiles.length > availableSlots) {
        toast.info("Image limit reached", {
          description: `Only ${availableSlots} more image(s) could be added. Extra files were ignored.`,
        });
      }

      // 3. Apply to State
      setImages((prev) => [...prev, ...filesToKeep]);
      const newPreviews = filesToKeep.map((f) => URL.createObjectURL(f));
      setPreviews((prev) => [...prev, ...newPreviews]);

      // 4. IMPORTANT: Reset the input value
      // This allows the user to re-select the same file if they delete it and change their mind.
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // Revoke the URL to save memory
      URL.revokeObjectURL(prev[index]);
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // When no images selected
    if (images.length === 0) {
      return toast.error("Visuals Required", {
        description: "A barter needs at least one image to be trusted.",
      });
    }

    // missing location
    if (!formData.location || formData.location.trim().length < 3) {
      return toast.error("Location Missing", {
        description: "Please specify a neighborhood or city for the exchange.",
      });
    }
    // if digital agreement not signed
    if (!formData.termsAgreed) {
      return toast.error("Agreement Required", {
        description: "Please acknowledge the Digital Agreement terms.",
      });
    }

    setLoading(true);
    const loadingToast = toast.loading("Uploading your listing...");

    try {
      // --- EDGE CASE: Parallel Upload Failure Handling ---
      const uploadPromises = images.map(async (file, index) => {
        try {
          return await uploadToCloudinary(file);
        } catch (error) {
          throw new Error(`Image ${index + 1} failed to upload.`);
        }
      });

      const imageUrls = await Promise.all(uploadPromises);

      const { termsAgreed, item, service, location, lookingFor, ...baseData } =
        formData;
      const postData = {
        ...baseData,
        exchangeType:
          baseData.postType == "SERVICE" ? "PERMANENT" : baseData.exchangeType,
        item:
          baseData.postType === "ITEM"
            ? {
                ...item,
                estimatedValue: item.estimatedValue
                  ? parseFloat(item.estimatedValue)
                  : null,
              }
            : null,

        service: baseData.postType === "SERVICE" ? service : null,
        postImages: imageUrls.map((url) => ({ postImageUrl:url })),
      };
      console.log({ postData });
      // alert(postData)
      const response = await api.post("/api/post/createPost", postData);
      console.log(response);

      if (response.status === 201) {
        toast.success("Listing Live!", { id: loadingToast });
        // router.push("/");
      }
    } catch (err: any) {
      console.error("Post Creation Error:", err);

      toast.error("Publishing Failed", {
        id: loadingToast,
        description:
          err.message ||
          "Connection to cloud storage timed out. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto space-y-10 pb-20"
    >
      {/* --- MASTER TOGGLE: Item vs Service --- */}
      {/* --- MASTER TOGGLE: Item vs Service --- */}
      <div className="max-w-xs mx-auto mb-10 p-1.5 bg-slate-100 rounded-[2rem] flex items-center shadow-inner">
        {(["ITEM", "SERVICE"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                postType: type,
                // Automatically set a valid category when switching modes!
                category:
                  type === "ITEM" ? ITEM_CATEGORIES[0] : SERVICE_CATEGORIES[0],
              })
            }
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.8rem] text-sm font-black transition-all duration-300 ${
              formData.postType === type
                ? "bg-white text-indigo-600 shadow-md scale-[1.02]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {type === "ITEM" ? <Package size={18} /> : <Zap size={18} />}
            {type}
          </button>
        ))}
      </div>
      {/* SECTION 1: Visuals (UC Step 4) */}
      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <header className="mb-6">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            1. Show it off
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            {formData.postType === "ITEM"
              ? "Add up to 5 clear photos of the item from different angles."
              : "Add up to 5 images of your portfolio, workspace, or certifications."}
          </p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {previews.map((src, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-3xl overflow-hidden border border-slate-100 group animate-in fade-in zoom-in-95"
            >
              <img
                src={src}
                className="object-cover w-full h-full"
                alt="Preview"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-2 right-2 size-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-red-500 shadow-sm border border-red-50 hover:bg-red-300 hover:text-white transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          ))}

          {previews.length < 5 && (
            <label className="aspect-square rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group">
              <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus
                  size={24}
                  className="text-slate-400 group-hover:text-indigo-600"
                />
              </div>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleImageChange}
                accept="image/*"
              />
            </label>
          )}
        </div>
      </section>

      {/* SECTION 2: Details (UC Step 3) */}
      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          2. The Details
        </h2>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
            Category
          </label>
          <div className="relative">
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full pl-4 pr-10 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 focus:border-indigo-200 outline-none font-bold text-sm appearance-none cursor-pointer text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {/* Dynamically render the correct list */}
              {(formData.postType === "ITEM"
                ? ITEM_CATEGORIES
                : SERVICE_CATEGORIES
              ).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {/* Custom Chevron to hide the ugly default browser arrow */}
            <ChevronDown
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={18}
            />
          </div>
        </div>
        <div className="space-y-4">
          <input
            placeholder="Title of your item or service"
            className="w-full text-[22px] sm:text-2xl font-extrabold text-slate-900 outline-none placeholder:text-slate-200 focus:placeholder:text-slate-100"
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <textarea
            placeholder="Describe the condition, history, or features..."
            className="w-full h-32 text-slate-600 font-medium outline-none resize-none border-none focus:ring-0 placeholder:text-slate-300"
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        {/* --- DYNAMIC SECTION: Item OR Service Details --- */}
        <div className="pt-8 mt-6 border-t border-slate-50 animate-in fade-in duration-300">
          {/* ========================================== */}
          {/* ITEM UI                    */}
          {/* ========================================== */}
          {formData.postType === "ITEM" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Condition Toggle */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
                    Item Condition
                  </label>
                  <div className="flex p-1.5 bg-slate-100 rounded-2xl">
                    {(["NEW", "USED"] as const).map((condition) => (
                      <button
                        key={condition}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            item: { ...formData.item, condition },
                          })
                        }
                        className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${
                          formData.item.condition === condition
                            ? "bg-white text-indigo-600 shadow-sm"
                            : "text-slate-500"
                        }`}
                      >
                        {condition}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estimated Value */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
                    Estimated Value (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">
                      ETB
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full pl-14 pr-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 focus:border-indigo-200 outline-none font-bold text-sm"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          item: {
                            ...formData.item,
                            estimatedValue: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Partial Cash & Exchange Type */}
              {/* --- Exchange Type, Return Timeline & Partial Cash --- */}
              <div className="space-y-6 pt-6 border-t border-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 1. Barter Type (Exchange Type) */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
                      Barter Type
                    </label>
                    <div className="flex p-1.5 bg-slate-100 rounded-2xl">
                      {(["PERMANENT", "TEMPORARY"] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, exchangeType: type })
                          }
                          className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${
                            formData.exchangeType === type
                              ? "bg-white text-indigo-600 shadow-sm"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Return Timeline (Only appears if TEMPORARY is selected) */}
                  {/* {formData.exchangeType === "TEMPORARY" && (
                    <div className="animate-in slide-in-from-left-4 duration-300">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
                        Return Timeline
                      </label>
                      <input
                        placeholder="e.g. 2 weeks"
                        value={formData.returnTimeline || ""}
                        className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 focus:border-indigo-200 outline-none font-bold text-sm"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            returnTimeline: e.target.value,
                          })
                        }
                      />
                    </div>
                  )} */}
                </div>

                {/* 3. Partial Cash Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-indigo-50/50 rounded-[2rem] border border-indigo-100/50">
                  <div className="mb-4 sm:mb-0">
                    <p className="text-sm font-bold text-slate-900">
                      Accept Partial Cash?
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium mt-1">
                      To balance an uneven trade
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        item: {
                          ...formData.item,
                          partialCashAllowed: !formData.item.partialCashAllowed,
                        },
                      })
                    }
                    className={`w-14 h-8 rounded-full transition-all relative ${
                      formData.item.partialCashAllowed
                        ? "bg-indigo-500"
                        : "bg-slate-200"
                    }`}
                  >
                    <div
                      className={`absolute top-1 size-6 rounded-full bg-white shadow-sm transition-all ${
                        formData.item.partialCashAllowed ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* SERVICE UI                   */}
          {/* ========================================== */}
          {formData.postType === "SERVICE" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Skill Level Toggle */}
                <div>
                  <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-3">
                    Your Skill Level
                  </label>
                  <div className="flex p-1.5 bg-emerald-50 rounded-2xl">
                    {(["BEGINNER", "EXPERT"] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            service: { ...formData.service, skillLevel: level },
                          })
                        }
                        className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${
                          formData.service.skillLevel === level
                            ? "bg-white text-emerald-600 shadow-sm"
                            : "text-emerald-700/50"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
                    Availability
                  </label>
                  <input
                    placeholder="e.g. Weekends, Evenings, Anytime..."
                    className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 focus:border-emerald-200 outline-none font-bold text-sm"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        service: {
                          ...formData.service,
                          availability: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

              {/* Service Duration */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
                  Service Duration
                </label>
                <input
                  placeholder="e.g. 1 Hour, 1 Month, Project-based..."
                  className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 focus:border-emerald-200 outline-none font-bold text-sm"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      service: {
                        ...formData.service,
                        serviceDuration: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* NEW: Location Code Placement */}
        {/* We place this right after the Barter Type block, or at the bottom of Section 2 */}
        <div className="pt-6 border-t border-slate-50">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
            {formData.postType === "SERVICE" ? "Service Area" : "Item Location"}
          </label>

          <LocationAutocomplete
            value={formData.location}
            onChange={(val) => setFormData({ ...formData, location: val })}
            placeholder={
              formData.postType === "SERVICE"
                ? "Which city/neighborhood do you serve?"
                : "City for pickup/exchange"
            }
          />

          <p className="text-[10px] text-slate-400 mt-2 italic">
            * Start typing a city like "Addis Ababa" or enter a specific
            neighborhood.
          </p>
        </div>
      </section>

      {/* SECTION 3: The Match (UC Step 5) */}
      <section className="bg-indigo-900 p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-200 text-white space-y-6">
        <header className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center text-indigo-300">
            <Info size={20} />
          </div>
          <h2 className="text-xl font-black tracking-tight">3. Your Match</h2>
        </header>

        <div className="space-y-4">
          <label className="text-xs font-bold text-indigo-200/60 uppercase tracking-widest">
            I am looking for:
          </label>
          <input
            placeholder="What would you want in return?"
            className="w-full bg-transparent border-b-2 border-indigo-700 py-3 text-lg font-bold outline-none focus:border-indigo-400 transition-colors placeholder:text-indigo-300"
            onChange={(e) =>
              setFormData({ ...formData, lookingFor: e.target.value })
            }
          />
        </div>

        {/* <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3">
            <Banknote className="text-indigo-300" />
            <div>
              <p className="text-sm font-bold">Accept Partial Cash?</p>
              <p className="text-[10px] text-indigo-300/80 font-medium">
                To balance an uneven trade
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              setFormData({ ...formData, partialCash: !formData.partialCash })
            }
            className={`w-14 h-8 rounded-full transition-all relative ${formData.partialCash ? "bg-indigo-500" : "bg-indigo-900 border-2 border-indigo-700"}`}
          >
            <div
              className={`absolute top-1 size-5 rounded-full bg-white transition-all ${formData.partialCash ? "left-8" : "left-1"}`}
            />
          </button>
        </div> */}
      </section>
      {/* {formData.postType === "SERVICE" && (
        <section className="bg-emerald-50/50 p-8 rounded-[2.5rem] border border-emerald-100 animate-in fade-in slide-in-from-bottom-4">
          <header className="flex items-center gap-3 mb-6">
            <div className="size-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Service Qualification
              </h2>
              <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">
                Build Trust with your Peers
              </p>
            </div>
          </header>

          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase">
              Certifications or Experience
            </label>
            <textarea
              placeholder="e.g. 5 years of Graphic Design experience, Adobe Certified, or link to your portfolio..."
              className="w-full h-28 p-4 bg-white rounded-2xl border border-emerald-100 focus:border-emerald-400 outline-none text-sm font-medium transition-all"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  serviceQualification: e.target.value,
                })
              }
            />
            <p className="text-[10px] text-slate-400 italic">
              * Providing qualifications increases your match rate by up to 40%.
            </p>
          </div>
        </section>
      )} */}

      {/* SECTION 4: Finalize (UC Step 7 & Supp) */}
      <div className="space-y-6">
        <label className="flex items-start gap-4 cursor-pointer group px-4">
          <input
            type="checkbox"
            className="mt-1 size-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            onChange={(e) =>
              setFormData({ ...formData, termsAgreed: e.target.checked })
            }
          />
          <span className="text-xs font-semibold text-slate-500 leading-relaxed group-hover:text-slate-700 transition-colors">
            I acknowledge that this post complies with platform guidelines and I
            understand a
            <span className="text-indigo-600 font-bold">
              {" "}
              Digital Agreement
            </span>{" "}
            is required for the exchange.
          </span>
        </label>

        <button
          disabled={loading}
          className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 hover:shadow-[0_20px_50px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center gap-3 disabled:bg-slate-300 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" /> Verifying & Uploading...
            </>
          ) : (
            "Publish Listing"
          )}
        </button>
      </div>
    </form>
  );
}
