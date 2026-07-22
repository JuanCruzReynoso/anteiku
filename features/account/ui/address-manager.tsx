"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "./profile-form";
import { AddressForm } from "./address-form";
import {
  getAddresses,
  deleteAddress,
  setDefaultAddress,
  type AddressInput,
} from "@/features/account/lib/actions";

interface SavedAddress {
  id: string;
  name: string;
  street: string;
  streetNumber: string | null;
  apartment: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean | null;
}

interface AddressManagerProps {
  initialName: string;
  initialPhone: string | null;
}

export function AddressManager({ initialName, initialPhone }: AddressManagerProps) {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<(AddressInput & { id: string }) | null>(null);

  const loadAddresses = useCallback(async () => {
    setIsLoadingAddresses(true);
    try {
      const data = await getAddresses();
      setAddresses(data);
    } catch {
      toast.error("Error al cargar direcciones");
    } finally {
      setIsLoadingAddresses(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch
    loadAddresses();
  }, [loadAddresses]);

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta dirección?")) return;
    try {
      const result = await deleteAddress(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Dirección eliminada");
        loadAddresses();
      }
    } catch {
      toast.error("Error al eliminar");
    }
  }

  async function handleSetDefault(id: string) {
    try {
      const result = await setDefaultAddress(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Dirección predeterminada actualizada");
        loadAddresses();
      }
    } catch {
      toast.error("Error al establecer predeterminada");
    }
  }

  function handleFormSuccess() {
    setShowForm(false);
    setEditingAddress(null);
    loadAddresses();
  }

  function handleEdit(address: SavedAddress) {
    setEditingAddress({
      id: address.id,
      name: address.name,
      street: address.street,
      streetNumber: address.streetNumber || undefined,
      apartment: address.apartment || undefined,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone || undefined,
      isDefault: address.isDefault ?? false,
    });
    setShowForm(true);
  }

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <div>
        <h3 className="text-sm font-medium mb-4">Datos personales</h3>
        <ProfileForm
          initialName={initialName}
          initialPhone={initialPhone}
          onSaved={() => toast.success("Perfil actualizado")}
        />
      </div>

      {/* Addresses Section */}
      <div className="border-t border-border/50 pt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Direcciones guardadas</h3>
          {!showForm && (
            <Button variant="outline" size="sm" onClick={() => { setEditingAddress(null); setShowForm(true); }}>
              Nueva dirección
            </Button>
          )}
        </div>

        {showForm ? (
          <div className="bg-background p-4">
            <AddressForm
              initialData={editingAddress || undefined}
              onSuccess={handleFormSuccess}
              onCancel={() => { setShowForm(false); setEditingAddress(null); }}
            />
          </div>
        ) : isLoadingAddresses ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 bg-background animate-pulse" />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="bg-background p-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              No tenés direcciones guardadas.
            </p>
            <Button variant="outline" size="sm" onClick={() => { setEditingAddress(null); setShowForm(true); }}>
              Agregar dirección
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="bg-background p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{address.name}</p>
                    {address.isDefault && (
                      <span className="text-[10px] uppercase tracking-wider bg-foreground text-background px-2 py-0.5">
                        Predeterminada
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {address.street}
                    {address.streetNumber && ` ${address.streetNumber}`}
                    {address.apartment && `, ${address.apartment}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p className="text-sm text-muted-foreground">{address.country}</p>
                  {address.phone && (
                    <p className="text-xs text-muted-foreground mt-1">{address.phone}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!address.isDefault && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleSetDefault(address.id)}
                    >
                      Predeterminar
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleEdit(address)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="xs"
                    onClick={() => handleDelete(address.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
