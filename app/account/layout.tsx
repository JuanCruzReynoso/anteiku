import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const navItems = [
    { href: "/account", label: "Perfil" },
    { href: "/account/orders", label: "Pedidos" },
    { href: "/account/subscriptions", label: "Suscripciones" },
  ];

  return (
    <div className="container mx-auto px-6 md:px-8 py-12 md:py-20">
      <h1 className="text-4xl md:text-5xl font-bold tracking-[-0.03em] mb-12">
        Mi cuenta
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar nav */}
        <nav className="lg:col-span-1">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div className="lg:col-span-3">{children}</div>
      </div>
    </div>
  );
}
