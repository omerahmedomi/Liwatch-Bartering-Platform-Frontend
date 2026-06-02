export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "liwatch_posts"); // Create this in Cloudinary settings

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );
  

  if (!response.ok) throw new Error("Image upload failed");

  const data = await response.json();
  console.log("CLOUDINARY RESPONSE:", data);
  return data.secure_url;
};

export const uploadFileToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "liwatch_posts");

  const isImage = file.type.startsWith("image/");
  const resourceType = isImage ? "image" : "raw";

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) throw new Error("File upload failed");

  const data = await response.json();
  console.log("CLOUDINARY ATTACHMENT RESPONSE:", data);
  return data.secure_url;
};

