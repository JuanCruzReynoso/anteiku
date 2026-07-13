"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  let session;
  try {
    session = await auth();
  } catch {
    redirect("/login?redirectedFrom=/admin");
  }
  
  if (!session?.user) {
    redirect("/login?redirectedFrom=/admin");
  }
  
  if (session.user.role !== "owner" && session.user.role !== "admin") {
    redirect("/"); // Not authorized
  }
  
  return session;
}

export async function getAdminUser() {
  const session = await requireAdmin();
  return session.user;
}
