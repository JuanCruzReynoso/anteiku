import type { ProductCategory } from "./mock-data";

export interface CategoryDefinition {
  value: ProductCategory;
  label: string;
  description: string;
}

/** All product categories — single source of truth */
export const allCategories: CategoryDefinition[] = [
  {
    value: "coffee",
    label: "Café",
    description: "Tostados de especialidad para el culto al buen café",
  },
  {
    value: "apparel",
    label: "Indumentaria",
    description: "Streetwear que mezcla cultura anime y moda",
  },
  {
    value: "notebooks",
    label: "Cuadernos",
    description: "Tapas duras, diseño premium, páginas rayadas o cuadriculadas",
  },
];

/** Category value → label lookup */
export const categoryLabel: Record<ProductCategory, string> = Object.fromEntries(
  allCategories.map((c) => [c.value, c.label])
) as Record<ProductCategory, string>;
