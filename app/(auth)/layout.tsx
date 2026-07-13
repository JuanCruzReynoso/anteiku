import { Logo } from "@/components/ui/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Brand */}
        <div className="flex justify-center">
          <Logo variant="color" size={48} priority />
        </div>

        {/* Auth card */}
        <div className="bg-card p-8 border border-border/50">
          {children}
        </div>
      </div>
    </div>
  );
}
