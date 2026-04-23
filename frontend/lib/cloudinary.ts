export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
};

if (!cloudinaryConfig.cloudName) {
  console.warn("Cloudinary Cloud Name is missing from environment variables.");
}
