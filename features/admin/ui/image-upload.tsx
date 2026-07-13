"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ onUpload, disabled }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  function validateFile(file: File): string | null {
    if (!ACCEPTED.includes(file.type)) {
      return "Tipo de archivo inválido. Solo se aceptan JPG, PNG, WebP y GIF.";
    }
    if (file.size > MAX_SIZE) {
      return "El archivo supera el límite de 5MB.";
    }
    return null;
  }

  async function handleFile(file: File) {
    setError(null);
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsUploading(true);
    try {
      // Convert to base64 for server action
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");

      // TODO: Import and call uploadProductImage when Supabase is configured
      // const result = await uploadProductImage(base64, file.name);
      // if (result.url) {
      //   onUpload(result.url);
      // } else {
      //   setError(result.error || "Error al subir la imagen.");
      // }

      setError("Upload no disponible — configurá SUPABASE_SERVICE_ROLE_KEY.");
    } catch {
      setError("Error al procesar el archivo.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  return (
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="hidden"
          disabled={disabled || isUploading}
        />
        {isUploading ? (
          <Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" />
        ) : (
          <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
        )}
        <p className="text-xs text-muted-foreground mt-2">
          {isUploading
            ? "Subiendo..."
            : "Arrastrá una imagen o hacé click para seleccionar"}
        </p>
      </div>
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          {error}
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-destructive hover:text-destructive/80"
          >
            <X className="h-3 w-3" />
          </button>
        </p>
      )}
    </div>
  );
}
