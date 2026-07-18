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

  // Wrap stock read+write in a transaction to prevent race conditions
  const movement = await db.transaction(async (tx) => {
    // Lock the variant row for update
    const [variant] = await tx
      .select()
      .from(variants)
      .where(eq(variants.id, data.variantId))
      .for("update");

    // Create the movement record
    const [movementRecord] = await tx
      .insert(inventoryMovements)
      .values(data)
      .returning();

    // Update variant stock atomically
    if (variant) {
      const newStock = variant.stock + data.change;
      await tx
        .update(variants)
        .set({ stock: Math.max(0, newStock) })
        .where(eq(variants.id, data.variantId));
    }

    return movementRecord;
  });

  revalidatePath("/admin/products");
  return movement;
}
