"use server";

import { db } from "@/db";
import { inventoryMovements, variants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./actions";

export async function getInventoryMovements(variantId?: string) {
  await requireAdmin();
  if (variantId) {
    return db.query.inventoryMovements.findMany({
      where: eq(inventoryMovements.variantId, variantId),
      orderBy: (movements, { desc }) => [desc(movements.createdAt)],
    });
  }
  return db.query.inventoryMovements.findMany({
    orderBy: (movements, { desc }) => [desc(movements.createdAt)],
    with: { variant: true },
  });
}

export async function createInventoryMovement(data: {
  variantId: string;
  change: number;
  reason: string;
  notes?: string;
}) {
  await requireAdmin();

  // Create the movement record
  const [movement] = await db
    .insert(inventoryMovements)
    .values(data)
    .returning();

  // Update variant stock
  const variant = await db.query.variants.findFirst({
    where: eq(variants.id, data.variantId),
  });

  if (variant) {
    const newStock = variant.stock + data.change;
    await db
      .update(variants)
      .set({ stock: Math.max(0, newStock) })
      .where(eq(variants.id, data.variantId));
  }

  revalidatePath("/admin/products");
  return movement;
}
