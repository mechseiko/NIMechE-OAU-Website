import { createHash } from "crypto";

export interface CloudinaryResult {
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
  resource_type: string;
}

function cloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not configured. Set CLOUDINARY_* env vars.");
  }
  return { cloudName, apiKey, apiSecret };
}

/** Signed server-side upload — the API secret never reaches the browser. */
export async function uploadToCloudinary(
  file: File,
  folder: string,
): Promise<CloudinaryResult> {
  const { cloudName, apiKey, apiSecret } = cloudinaryConfig();

  const isImage = file.type.startsWith("image/");
  const resourceType = isImage ? "image" : file.type === "video/" ? "video" : "raw";

  const params: Record<string, string> = {
    timestamp: String(Math.floor(Date.now() / 1000)),
    folder: `nimeche-oau/${folder}`,
    api_key: apiKey,
  };
  if (isImage) {
    params.transformation = "c_limit,w_2000,q_auto,f_auto";
  }

  const signatureSource = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  params.signature = createHash("sha1")
    .update(signatureSource + apiSecret)
    .digest("hex");

  const form = new FormData();
  for (const [key, value] of Object.entries(params)) form.append(key, value);
  form.append("file", file);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: "POST", body: form },
  );

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "Cloudinary upload failed.");
  }
  return payload as CloudinaryResult;
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  const { cloudName, apiKey, apiSecret } = cloudinaryConfig();
  const params: Record<string, string> = {
    timestamp: String(Math.floor(Date.now() / 1000)),
    public_id: publicId,
    api_key: apiKey,
  };
  const signatureSource = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  params.signature = createHash("sha1")
    .update(signatureSource + apiSecret)
    .digest("hex");

  const form = new FormData();
  for (const [key, value] of Object.entries(params)) form.append(key, value);

  await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: "POST",
    body: form,
  });
}
