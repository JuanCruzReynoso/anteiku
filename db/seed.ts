import { db } from "./index";
import { categories, products, variants, shipmentMethods, subscriptionPlans } from "./schema";

// ─── Seed Data ──────────────────────────────────────────
// Mirrors features/product/lib/mock-data.ts exactly.
// Prices are ARS integers (no cents — ARS doesn't use decimal subdivision).

const seedCategories = [
  { name: "Café Especial", slug: "cafe", description: "Café de especialidad" },
  { name: "Apparel", slug: "apparel", description: "Ropa y accesorios" },
  { name: "Notebooks", slug: "notebooks", description: "Cuadernos y libretas" },
];

const seedShipmentMethods = [
  {
    name: "Retiro en local",
    description: "Retirá gratis en nuestro local",
    cost: 0,
    estimatedDays: 0,
    active: true,
  },
  {
    name: "Envío estándar",
    description: "Envío a todo el país por Andreani",
    cost: 2500,
    estimatedDays: 5,
    active: true,
  },
  {
    name: "Envío express",
    description: "Envío prioritario en 24-48hs",
    cost: 5000,
    estimatedDays: 2,
    active: true,
  },
];

const seedProducts = [
  {
    name: "Tokyo Noir",
    slug: "tokyo-noir",
    description:
      "Dark roast with notes of dark chocolate and smoke. Dangerously smooth.",
    categorySlug: "cafe",
    images: ["/products/cafe-anteiku-black.png"],
    basePrice: 3800,
    featured: true,
    variants: [
      {
        name: "250g",
        sku: "TN-250",
        price: 13500,
        stock: 50,
        options: { weight: "250g" },
      },
      {
        name: "500g",
        sku: "TN-500",
        price: 25000,
        stock: 30,
        options: { weight: "500g" },
      },
    ],
  },
  {
    name: "Shibuya Red",
    slug: "shibuya-red",
    description:
      "Medium roast with bright acidity and red fruit notes. Bold but balanced.",
    categorySlug: "cafe",
    images: ["/products/cafe-anteiku-red.png"],
    basePrice: 3800,
    featured: true,
    variants: [
      {
        name: "250g",
        sku: "SR-250",
        price: 13500,
        stock: 40,
        options: { weight: "250g" },
      },
      {
        name: "500g",
        sku: "SR-500",
        price: 25000,
        stock: 25,
        options: { weight: "500g" },
      },
    ],
  },
  {
    name: "White Pony Chomba",
    slug: "whitepony-chomba",
    description:
      "Chomba negra con logo bordado. Crossover White Pony de Deftones x Polo. Premium.",
    categorySlug: "apparel",
    images: ["/products/whitepony-chomba.png"],
    basePrice: 35000,
    featured: true,
    variants: [
      {
        name: "Negro / S",
        sku: "WPC-BLK-S",
        price: 35000,
        stock: 10,
        options: { color: "Negro", size: "S" },
      },
      {
        name: "Negro / M",
        sku: "WPC-BLK-M",
        price: 35000,
        stock: 15,
        options: { color: "Negro", size: "M" },
      },
      {
        name: "Negro / L",
        sku: "WPC-BLK-L",
        price: 35000,
        stock: 12,
        options: { color: "Negro", size: "L" },
      },
      {
        name: "Negro / XL",
        sku: "WPC-BLK-XL",
        price: 35000,
        stock: 8,
        options: { color: "Negro", size: "XL" },
      },
    ],
  },
  {
    name: "Hisoka Almendra Remera",
    slug: "hisoka-almendra-remera",
    description:
      "Remera blanca con ilustración de Hisoka. Crossover Almendra de Spinetta x Hunter x Hunter. Algodón premium.",
    categorySlug: "apparel",
    images: ["/products/hisoka-almendra-remera.png"],
    basePrice: 22000,
    variants: [
      {
        name: "Blanco / S",
        sku: "HAR-WHT-S",
        price: 22000,
        stock: 12,
        options: { color: "Blanco", size: "S" },
      },
      {
        name: "Blanco / M",
        sku: "HAR-WHT-M",
        price: 22000,
        stock: 20,
        options: { color: "Blanco", size: "M" },
      },
      {
        name: "Blanco / L",
        sku: "HAR-WHT-L",
        price: 22000,
        stock: 18,
        options: { color: "Blanco", size: "L" },
      },
      {
        name: "Blanco / XL",
        sku: "HAR-WHT-XL",
        price: 22000,
        stock: 10,
        options: { color: "Blanco", size: "XL" },
      },
    ],
  },
  {
    name: "Mr. Popo Igor Remera",
    slug: "mrpopo-igor-remera",
    description:
      "Remera rosa con Mr. Popo. Crossover IGOR de Tyler the Creator x Dragon Ball. Algodón premium, edición limitada.",
    categorySlug: "apparel",
    images: ["/products/mrpopo-igor-remera.png"],
    basePrice: 25000,
    variants: [
      {
        name: "Rosa / S",
        sku: "MPI-PNK-S",
        price: 25000,
        stock: 10,
        options: { color: "Rosa", size: "S" },
      },
      {
        name: "Rosa / M",
        sku: "MPI-PNK-M",
        price: 25000,
        stock: 15,
        options: { color: "Rosa", size: "M" },
      },
      {
        name: "Rosa / L",
        sku: "MPI-PNK-L",
        price: 25000,
        stock: 12,
        options: { color: "Rosa", size: "L" },
      },
      {
        name: "Rosa / XL",
        sku: "MPI-PNK-XL",
        price: 25000,
        stock: 8,
        options: { color: "Rosa", size: "XL" },
      },
    ],
  },
  {
    name: "Death Note Cuaderno",
    slug: "deathnote-cuaderno",
    description:
      "Cuaderno premium con diseño Death Note. Tapa dura, 200 páginas rayadas. Si lo encontrás, no lo devuelvas.",
    categorySlug: "notebooks",
    images: ["/products/deathnote-cuaderno.png"],
    basePrice: 2800,
    variants: [
      {
        name: "Standard",
        sku: "DNC-STD",
        price: 2800,
        stock: 25,
        options: { edition: "Standard" },
      },
    ],
  },
  {
    name: "Totoro Cuaderno",
    slug: "totoro-cuaderno",
    description:
      "Cuaderno suave con Totoro en la portada. 160 páginas cuadriculadas. Perfecto para dibujar.",
    categorySlug: "notebooks",
    images: ["/products/totoro-cuaderno.png"],
    basePrice: 2400,
    variants: [
      {
        name: "Standard",
        sku: "TTC-STD",
        price: 2400,
        stock: 30,
        options: { edition: "Standard" },
      },
    ],
  },
  {
    name: "Gashbell Perversito Remera",
    slug: "gashbell-perversito-remera",
    description:
      "Remera celeste con Gashbell riendo. Crossover Gashbell x The Simpsons. Frase icónica de Gabo. Algodón premium.",
    categorySlug: "apparel",
    images: ["/products/gashbell-perversito-remera.png"],
    basePrice: 22000,
    variants: [
      {
        name: "Celeste / S",
        sku: "GPR-BLU-S",
        price: 22000,
        stock: 10,
        options: { color: "Celeste", size: "S" },
      },
      {
        name: "Celeste / M",
        sku: "GPR-BLU-M",
        price: 22000,
        stock: 15,
        options: { color: "Celeste", size: "M" },
      },
      {
        name: "Celeste / L",
        sku: "GPR-BLU-L",
        price: 22000,
        stock: 12,
        options: { color: "Celeste", size: "L" },
      },
      {
        name: "Celeste / XL",
        sku: "GPR-BLU-XL",
        price: 22000,
        stock: 8,
        options: { color: "Celeste", size: "XL" },
      },
    ],
  },
];

// ─── Seed Function ──────────────────────────────────────

export async function seed() {
  console.log("🌱 Seeding database...");

  // 1. Seed categories
  const insertedCategories = await db
    .insert(categories)
    .values(seedCategories)
    .returning();

  // Build slug → id lookup
  const categoryIdBySlug = new Map(
    insertedCategories.map((c) => [c.slug, c.id])
  );

  // 2. Seed products with category IDs
  for (const product of seedProducts) {
    const { categorySlug, variants: productVariants, ...productData } = product;

    const [inserted] = await db
      .insert(products)
      .values({
        ...productData,
        categoryId: categoryIdBySlug.get(categorySlug) ?? null,
      })
      .returning({ id: products.id });

    if (productVariants.length > 0) {
      await db.insert(variants).values(
        productVariants.map((v) => ({
          productId: inserted.id,
          ...v,
        }))
      );
    }

    console.log(`  ✓ ${product.name}`);
  }

  // 3. Seed shipment methods
  await db.insert(shipmentMethods).values(seedShipmentMethods);
  console.log("  ✓ Métodos de envío");

  // 4. Seed subscription plans
  await db.insert(subscriptionPlans).values([
    {
      name: "Café Mensual",
      slug: "cafe-mensual",
      description: "Café de especialidad entregado todos los meses",
      price: 8500,
      interval: "monthly",
      features: [
        "250g de café de especialidad",
        "Notas de cata",
        "Acceso anticipado a nuevos lotes",
      ],
    },
    {
      name: "Café + Merch",
      slug: "cafe-plus-merch",
      description: "Café de especialidad + producto sorpresa cada mes",
      price: 15000,
      interval: "monthly",
      features: [
        "250g de café de especialidad",
        "Notas de cata",
        "Acceso anticipado a nuevos lotes",
        "Producto sorpresa mensual (remera, tote bag, etc.)",
        "Envío gratis",
      ],
    },
  ]);
  console.log("  ✓ Planes de suscripción");

  console.log("🌱 Seeding complete!");
}

// ─── Run Directly ───────────────────────────────────────

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
