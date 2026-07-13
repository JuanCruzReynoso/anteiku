"use server";

import { signIn, signOut, auth } from "@/auth";
import { redirect } from "next/navigation";

export async function signInWithGoogle(callbackUrl?: string) {
  await signIn("google", { redirectTo: callbackUrl || "/shop" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function getSession() {
  return await auth();
}
