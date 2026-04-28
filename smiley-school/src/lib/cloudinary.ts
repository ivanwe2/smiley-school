import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

type CloudinaryOptions = {
  width?: number;
  height?: number;
  quality?: number | "auto";
  crop?: "fill" | "fit" | "scale" | "thumb" | "crop";
  gravity?: string;
  format?: "auto" | "webp" | "jpg" | "png";
};

/**
 * Constructs an optimised Cloudinary URL from a stored publicId.
 * Always serves WebP via f_auto, quality via q_auto.
 */
export function getCloudinaryUrl(
  publicId: string,
  options: CloudinaryOptions = {}
): string {
  const {
    width,
    height,
    quality = "auto",
    crop = "fill",
    gravity,
    format = "auto",
  } = options;

  const parts: string[] = [
    `f_${format}`,
    `q_${quality}`,
    `c_${crop}`,
  ];
  if (width) parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`);
  if (gravity) parts.push(`g_${gravity}`);

  const transforms = parts.join(",");
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`;
}

/**
 * Generates a signed upload signature for client-side direct uploads.
 */
export function generateUploadSignature(
  folder: string,
  timestamp: number
): { signature: string; apiKey: string; cloudName: string } {
  const paramsToSign = { folder, timestamp };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  };
}