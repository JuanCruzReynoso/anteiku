/**
 * Product image upload to Supabase Storage.
 * Validates file type (PNG/JPG) and size (<=5MB) server-side.
 */

import { createClient } from "@supabase/supabase-js";

// ─── Types ──────────────────────────────────────────────

export interface UploadResult {
  url: string | null;
  error?: string;
}

// ─── Constants ──────────────────────────────────────────

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

// ─── Server Action ──────────────────────────────────────

export async function uploadProductImage(
  fileBase64: string,
  fileName: string
): Promise<UploadResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return {
      url: null,
      error:
        "Supabase service role key no configurada. Usá la entrada de URL como alternativa.",
    };
  }

  try {
    // Detect content type from base64 header
    let contentType = "image/jpeg";
    if (fileBase64.startsWith("data:")) {
      const match = fileBase64.match(/^data:([^;]+);/);
      if (match) {
        contentType = match[1];
      }
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(contentType)) {
      return {
        url: null,
        error: `Tipo de archivo no soportado: ${contentType}. Usá PNG o JPG.`,
      };
    }

    // Strip data URL prefix if present
    const base64Data = fileBase64.includes("base64,")
      ? fileBase64.split("base64,")[1]
      : fileBase64;

    // Validate file size (base64 is ~33% larger than original)
    const decodedSize = Math.ceil((base64Data.length * 3) / 4);
    if (decodedSize > MAX_FILE_SIZE) {
      return {
        url: null,
        error: `El archivo supera el límite de 5MB (${(decodedSize / 1024 / 1024).toFixed(1)}MB).`,
      };
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const buffer = Buffer.from(base64Data, "base64");
    const { data, error } = await supabase.storage
      .from("products")
      .upload(`images/${fileName}`, buffer, {
        contentType,
        upsert: true,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("products")
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al subir la imagen.";
    return { url: null, error: message };
  }
}
