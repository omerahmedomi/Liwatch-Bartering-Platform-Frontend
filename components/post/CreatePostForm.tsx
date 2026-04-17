"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import api from "@/lib/axios";
import { ITEM_CATEGORIES, SERVICE_CATEGORIES } from "@/lib/categories";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { getErrorMessage } from "@/lib/error";
import { toast } from "sonner";

import CreatePostDetailsSection from "./create-post/CreatePostDetailsSection";
import CreatePostMatchSection from "./create-post/CreatePostMatchSection";
import CreatePostPublishSection from "./create-post/CreatePostPublishSection";
import CreatePostTypeSelector from "./create-post/CreatePostTypeSelector";
import CreatePostVisualsSection from "./create-post/CreatePostVisualsSection";
import {
  CreatePostFormState,
  CreatePostType,
} from "./create-post/createPostForm.types";
import { useRouter } from "next/navigation";

const initialFormData: CreatePostFormState = {
  postType: "ITEM",
  title: "",
  description: "",
  category: ITEM_CATEGORIES[0],
  exchangeType: "PERMANENT",
  location: "",
  lookingFor: "",
  termsAgreed: false,
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

export default function CreatePostForm() {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const previewUrlsRef = useRef<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePostFormState>(initialFormData);
  const router = useRouter()

  const availableCategories = useMemo(
    () =>
      formData.postType === "ITEM" ? ITEM_CATEGORIES : SERVICE_CATEGORIES,
    [formData.postType],
  );

  useEffect(() => {
    previewUrlsRef.current = previews;
  }, [previews]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((previewUrl) => {
        URL.revokeObjectURL(previewUrl);
      });
    };
  }, []);

  const handlePostTypeChange = (postType: CreatePostType) => {
    setFormData((current) => ({
      ...current,
      postType,
      category: postType === "ITEM" ? ITEM_CATEGORIES[0] : SERVICE_CATEGORIES[0],
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }

    const newFiles = Array.from(event.target.files);
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024;

    const filteredFiles = newFiles.filter((file) => {
      if (!validTypes.includes(file.type)) {
        toast.error(`Invalid format: ${file.name}`, {
          description: "Use JPG, PNG or WebP.",
        });
        return false;
      }

      if (file.size > maxSize) {
        toast.error(`File too large: ${file.name}`, {
          description: "Max size is 5MB.",
        });
        return false;
      }

      return true;
    });

    const availableSlots = 5 - images.length;
    if (availableSlots <= 0) {
      toast.error("Limit Reached", {
        description: "You can only upload a maximum of 5 images.",
      });
      event.target.value = "";
      return;
    }

    const filesToKeep = filteredFiles.slice(0, availableSlots);
    if (filteredFiles.length > availableSlots) {
      toast.info("Image limit reached", {
        description: `Only ${availableSlots} more image(s) could be added. Extra files were ignored.`,
      });
    }

    setImages((current) => [...current, ...filesToKeep]);
    const nextPreviews = filesToKeep.map((file) => URL.createObjectURL(file));
    setPreviews((current) => [...current, ...nextPreviews]);
    event.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((current) => current.filter((_, currentIndex) => currentIndex !== index));
    setPreviews((current) => {
      const updatedPreviews = current.filter(
        (_, currentIndex) => currentIndex !== index,
      );
      URL.revokeObjectURL(current[index]);
      return updatedPreviews;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (images.length === 0) {
      return toast.error("Visuals Required", {
        description: "A barter needs at least one image to be trusted.",
      });
    }

    if (!formData.location || formData.location.trim().length < 3) {
      return toast.error("Location Missing", {
        description: "Please specify a neighborhood or city for the exchange.",
      });
    }

    if (!formData.termsAgreed) {
      return toast.error("Agreement Required", {
        description: "Please acknowledge the Digital Agreement terms.",
      });
    }

    setLoading(true);
    const loadingToast = toast.loading("Uploading your listing...");

    try {
      const uploadPromises = images.map(async (file, index) => {
        try {
          return await uploadToCloudinary(file);
        } catch {
          throw new Error(`Image ${index + 1} failed to upload.`);
        }
      });

      const imageUrls = await Promise.all(uploadPromises);
      const baseData = {
        postType: formData.postType,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        exchangeType: formData.exchangeType,
        location: formData.location,
        lookingFor: formData.lookingFor,
      };

      const postData = {
        ...baseData,
        exchangeType:
          baseData.postType === "SERVICE" ? "PERMANENT" : baseData.exchangeType,
        item:
          baseData.postType === "ITEM"
            ? {
                ...formData.item,
                estimatedValue: formData.item.estimatedValue
                  ? parseFloat(formData.item.estimatedValue)
                  : null,
              }
            : null,
        service: baseData.postType === "SERVICE" ? formData.service : null,
        postImages: imageUrls.map((url) => ({ postImageUrl: url })),
      };

      const response = await api.post("/api/post/createPost", postData);
      if (response.status === 201) {
        toast.success("Listing Live!", { id: loadingToast });
      }
      router.push(`/post/${response?.data?.postId}`)
    } catch (error: unknown) {
      console.error("Post Creation Error:", error);
      toast.error("Publishing Failed", {
        id: loadingToast,
        description:
          getErrorMessage(
            error,
          "Connection to cloud storage timed out. Please try again.",
          ),
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
      <CreatePostTypeSelector
        selectedType={formData.postType}
        onSelect={handlePostTypeChange}
      />
      <CreatePostVisualsSection
        postType={formData.postType}
        previews={previews}
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
      <CreatePostPublishSection
        loading={loading}
        termsAgreed={formData.termsAgreed}
        onTermsChange={(termsAgreed) =>
          setFormData((current) => ({ ...current, termsAgreed }))
        }
      />
    </form>
  );
}
