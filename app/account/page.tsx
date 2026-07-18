import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AddressManager } from "@/features/account/ui/address-manager";

export default async function AccountPage() {
  const session = await auth();

  const [user] = await db
    .select({ name: users.name, phone: users.phone })
    .from(users)
    .where(eq(users.id, session!.user!.id!))
    .limit(1);

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Perfil</h2>

      <div className="bg-muted p-6 space-y-4">
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

      {/* Profile Edit */}
      <div className="bg-muted p-6">
        <AddressManager
          initialName={user?.name || session?.user?.name || ""}
          initialPhone={user?.phone || null}
        />
      </div>
    </div>
  );
}
