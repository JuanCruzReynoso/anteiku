import { requireAdmin } from "@/features/admin/lib/actions";
import { AdminNav } from "@/features/admin/ui/admin-nav";
import { AdminLayoutShell } from "@/features/admin/ui/admin-layout-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  const userName =
    session.user.name || session.user.email?.split("@")[0] || "Admin";
  const userInitial = (
    session.user.name ||
    session.user.email ||
    "?"
  )[0].toUpperCase();
  const userRole = session.user.role;

  return (
    <AdminLayoutShell
      userInitial={userInitial}
      userName={userName}
      userRole={userRole}
      sidebar={
        <AdminNav
          userInitial={userInitial}
          userName={userName}
          userRole={userRole}
          userImage={session.user.image}
        />
      }
    >
      {children}
    </AdminLayoutShell>
  );
}
