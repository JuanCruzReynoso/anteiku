/**
 * Product image upload — ready to wire once Supabase service role key is available.
 *
 * TODO: Uncomment the upload logic below when service role key is configured.
 * import { createClient } from "@supabase/supabase-js";
 */

// ─── Types ──────────────────────────────────────────────

export interface UploadResult {
  url: string | null;
  error?: string;
}

// ─── Server Action ──────────────────────────────────────

export async function uploadProductImage(
  fileBase64: string,
  fileName: string
): Promise<UploadResult> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      url: null,
      error:
        "Supabase service role key no configurada. Usá la entrada de URL como alternativa.",
    };
  }

  try {
    // TODO: Uncomment when Supabase service role key is available
    // const supabase = createClient(
    //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
    //   process.env.SUPABASE_SERVICE_ROLE_KEY!
    // );
    //
    // const buffer = Buffer.from(fileBase64, "base64");
    // const { data, error } = await supabase.storage
    //   .from("products")
    //   .upload(`images/${fileName}`, buffer, {
    //     contentType: "image/jpeg",
    //     upsert: true,
    //   });
    //
    // if (error) throw error;
    //
    // const { data: urlData } = supabase.storage
    //   .from("products")
    //   .getPublicUrl(data.path);
    //
    // return { url: urlData.publicUrl };

    return {
      url: null,
      error: "Upload no disponible — configurá SUPABASE_SERVICE_ROLE_KEY.",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al subir la imagen.";
    return { url: null, error: message };
  }
}
