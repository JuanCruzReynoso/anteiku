"use server";

import { db } from "@/db";
import { addresses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./actions";

export async function getAddressesByUserId(userId: string) {
  await requireAdmin();
  return db.query.addresses.findMany({
    where: eq(addresses.userId, userId),
    orderBy: (addresses, { desc }) => [desc(addresses.isDefault)],
  });
}

export async function createAddress(data: {
  userId: string;
  name: string;
  street: string;
  streetNumber?: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  phone?: string;
  isDefault?: boolean;
}) {
  await requireAdmin();
  const [address] = await db.insert(addresses).values(data).returning();
  revalidatePath("/admin/customers");
  return address;
}

export async function updateAddress(
  id: string,
  data: {
    name?: string;
    street?: string;
    streetNumber?: string;
    apartment?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    phone?: string;
    isDefault?: boolean;
  }
) {
  await requireAdmin();
  const [address] = await db
    .update(addresses)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(addresses.id, id))
    .returning();
  revalidatePath("/admin/customers");
  return address;
}

export async function deleteAddress(id: string) {
  await requireAdmin();
  await db.delete(addresses).where(eq(addresses.id, id));
  revalidatePath("/admin/customers");
}
