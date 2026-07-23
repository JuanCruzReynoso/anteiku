"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, User, ShoppingBag, LayoutDashboard, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
  loading?: boolean;
  variant?: "dropdown" | "sheet";
  showBackToShop?: boolean;
}

const adminRoles = ["owner", "admin"];

function getInitials(
  name?: string | null,
  email?: string | null
): string {
  const nameInitial = name?.charAt(0);
  const emailPrefix = email?.split("@")[0];
  const emailInitial = emailPrefix?.charAt(0);

  if (nameInitial && emailInitial) {
    return `${nameInitial}${emailInitial}`.toUpperCase();
  }
  if (nameInitial) return nameInitial.toUpperCase();
  if (emailInitial) return emailInitial.toUpperCase();
  return "";
}

export function UserMenu({
  user,
  loading,
  variant = "dropdown",
  showBackToShop = false,
}: UserMenuProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="size-8 rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

  const initials = getInitials(user.name, user.email);
  const isAdmin = user.role && adminRoles.includes(user.role);

  // Mobile Sheet variant — avatar + name + action buttons
  if (variant === "sheet") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-4 py-3 bg-muted">
          <Avatar size="sm">
            {user.image && <AvatarImage src={user.image} alt={user.name || "User"} />}
            <AvatarFallback>
              {initials || <User className="size-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user.name || user.email?.split("@")[0]}
            </p>
            {user.email && (
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1 px-1">
          <Button variant="ghost" size="sm" render={<Link href="/account" />} className="justify-start">
            <User className="size-4 mr-2" />
            Mi cuenta
          </Button>
          <Button variant="ghost" size="sm" render={<Link href="/account/orders" />} className="justify-start">
            <ShoppingBag className="size-4 mr-2" />
            Mis pedidos
          </Button>
          {isAdmin && (
            <Button variant="ghost" size="sm" render={<Link href="/admin" />} className="justify-start">
              <LayoutDashboard className="size-4 mr-2" />
              Admin
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-muted-foreground"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="size-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </div>
    );
  }

  // Desktop / Sidebar Dropdown variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-lg" className="rounded-full" />}>
        <Avatar size="sm">
          {user.image && <AvatarImage src={user.image} alt={user.name || "User"} />}
          <AvatarFallback>
            {initials || <User className="size-4" />}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8}>
        {showBackToShop && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href="/shop" />}>
                <ArrowLeft />
                Volver a la tienda
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/account" />}>
            <User />
            Mi cuenta
          </DropdownMenuItem>
          {!showBackToShop && (
            <DropdownMenuItem render={<Link href="/account/orders" />}>
              <ShoppingBag />
              Mis pedidos
            </DropdownMenuItem>
          )}
          {!showBackToShop && isAdmin && (
            <DropdownMenuItem render={<Link href="/admin" />}>
              <LayoutDashboard />
              Admin
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
