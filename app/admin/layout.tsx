import { requireAdmin } from "@/features/admin/lib/actions";
import { AdminNav } from "@/features/admin/ui/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  const userName = session.user.name || session.user.email?.split("@")[0] || "Admin";
  const userInitial = (session.user.name || session.user.email || "?")[0].toUpperCase();
  const userRole = session.user.role;

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop: sidebar layout */}
      <div className="hidden lg:flex min-h-screen">
        <AdminNav userInitial={userInitial} userName={userName} userRole={userRole} />
        <main className="flex-1 min-w-0 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Mobile: header + content layout */}
      <div className="lg:hidden">
        <AdminNav userInitial={userInitial} userName={userName} userRole={userRole} />
        <main className="p-4 min-h-[calc(100dvh-4rem)] overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
