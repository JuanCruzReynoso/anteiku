"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { updateProfile } from "@/features/account/lib/actions";

const profileFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  initialName: string;
  initialPhone?: string | null;
  onSaved: () => void;
}

export function ProfileForm({ initialName, initialPhone, onSaved }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: initialName,
      phone: initialPhone || "",
    },
  });

  async function onSubmit(data: ProfileFormData) {
    setIsSubmitting(true);
    try {
      const result = await updateProfile({
        name: data.name,
        phone: data.phone || undefined,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Perfil actualizado");
        setIsEditing(false);
        onSaved();
      }
    } catch {
      toast.error("Error al actualizar el perfil");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    reset({ name: initialName, phone: initialPhone || "" });
    setIsEditing(false);
  }

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
            Nombre
          </p>
          <p className="text-sm">{initialName || "Sin nombre"}</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
            Teléfono
          </p>
          <p className="text-sm">{initialPhone || "Sin teléfono"}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          Editar perfil
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="profile-name" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
          Nombre
        </label>
        <input
          id="profile-name"
          type="text"
          {...register("name")}
          className="w-full h-10 bg-muted px-3 text-sm outline-none focus:ring-1 focus:ring-primary transition-shadow"
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="profile-phone" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
          Teléfono <span className="normal-case tracking-normal">(opcional)</span>
        </label>
        <input
          id="profile-phone"
          type="tel"
          {...register("phone")}
          className="w-full h-10 bg-muted px-3 text-sm outline-none focus:ring-1 focus:ring-primary transition-shadow"
          placeholder="+54 11 1234-5678"
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting} size="sm">
          {isSubmitting ? "Guardando..." : "Guardar"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
