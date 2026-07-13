import { auth } from "@/auth";

export default async function AccountPage() {
  const session = await auth();

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Perfil</h2>

      <div className="bg-muted p-6 space-y-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
            Nombre
          </p>
          <p className="text-sm">{session?.user?.name || "Sin nombre"}</p>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
            Email
          </p>
          <p className="text-sm">{session?.user?.email}</p>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
            Rol
          </p>
          <p className="text-sm capitalize">{session?.user?.role || "customer"}</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Para modificar tu perfil, contactanos a soporte@anteiku.com
      </p>
    </div>
  );
}
