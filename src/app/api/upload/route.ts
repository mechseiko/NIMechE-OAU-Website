import { NextResponse, type NextRequest } from "next/server";
import { isCloudinaryConfigured } from "@/lib/firebase";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

const EDIT_ROLES = new Set(["super_admin", "admin", "editor"]);

/** Allowed upload folders — keeps media organised and prevents arbitrary paths. */
const ALLOWED_FOLDERS = new Set([
  "news",
  "events",
  "projects",
  "executives",
  "candidates",
  "gallery",
  "showcase",
  "achievements",
  "divisions",
  "committees",
  "resources",
  "general",
]);

/** Decode a JWT payload without verifying the signature. Validity is enforced
 *  downstream by Firestore, which rejects forged/expired tokens — so we only
 *  need the claimed uid to look the user's role up. */
function decodeUid(token: string): string | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = Buffer.from(part, "base64url").toString("utf8");
    const payload = JSON.parse(json) as { user_id?: string; sub?: string };
    return payload.user_id ?? payload.sub ?? null;
  } catch {
    return null;
  }
}

/** Read the caller's role via the Firestore REST API, authorising with their own
 *  ID token. Firestore validates the token and the security rules, so a forged
 *  token or a user without a profile doc simply fails here. */
async function fetchRole(token: string, uid: string): Promise<string | null> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return null;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${encodeURIComponent(uid)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return null;
  const data = (await res.json()) as { fields?: { role?: { stringValue?: string } } };
  return data.fields?.role?.stringValue ?? null;
}

export async function POST(request: NextRequest) {
  try {
    if (!isCloudinaryConfigured) {
      return NextResponse.json(
        { error: "Cloudinary is not configured. Add the CLOUDINARY_* env vars to .env.local." },
        { status: 503 },
      );
    }

    const form = await request.formData();
    const file = form.get("file");
    const folderRaw = (form.get("folder") as string | null) ?? "general";
    const headerToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const token = (form.get("token") as string | null) || headerToken || "";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (!token) {
      return NextResponse.json({ error: "You must be signed in to upload." }, { status: 401 });
    }

    const uid = decodeUid(token);
    if (!uid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const role = await fetchRole(token, uid);
    if (!role || !EDIT_ROLES.has(role)) {
      return NextResponse.json(
        { error: "You don't have permission to upload media." },
        { status: 403 },
      );
    }

    const folder = ALLOWED_FOLDERS.has(folderRaw) ? folderRaw : "general";
    const result = await uploadToCloudinary(file, folder);

    return NextResponse.json({
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
