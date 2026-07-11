import { db } from "./index";
import { products, variants } from "./schema";

// ─── Seed Data ──────────────────────────────────────────

const seedProducts = [
  {
    name: "Tokyo Noir",
    slug: "tokyo-noir",
    description:
      "Dark roast with notes of dark chocolate and smoke. Dangerously smooth.",
    category: "coffee" as const,
    images: ["/products/cafe-anteiku-black.png"],
    basePrice: 13500,
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
        sku: "TGB-500",
        price: 3200,
        stock: 30,
        options: { weight: "500g" },
      },
    ],
  },
  {
    name: "Re:Zero Espresso",
    slug: "re-zero-espresso",
    description:
      "Italian-style espresso blend. Returns you to perfect extraction every time.",
    category: "coffee" as const,
    images: ["/placeholder-coffee-2.png"],
    basePrice: 2000,
    variants: [
      {
        name: "250g",
        sku: "RZE-250",
        price: 2000,
        stock: 40,
        options: { weight: "250g" },
      },
    ],
  },
  {
    name: "Kaneki Mask Tee",
    slug: "kaneki-mask-tee",
    description:
      "Premium cotton tee featuring the iconic mask design. Minimal, bold, unmistakable.",
    category: "apparel" as const,
    images: ["/placeholder-apparel-1.png"],
    basePrice: 3500,
    variants: [
      {
        name: "Black / S",
        sku: "KMT-BLK-S",
        price: 3500,
        stock: 15,
        options: { color: "Black", size: "S" },
      },
      {
        name: "Black / M",
        sku: "KMT-BLK-M",
        price: 3500,
        stock: 25,
        options: { color: "Black", size: "M" },
      },
      {
        name: "Black / L",
        sku: "KMT-BLK-L",
        price: 3500,
        stock: 20,
        options: { color: "Black", size: "L" },
      },
      {
        name: "Black / XL",
        sku: "KMT-BLK-XL",
        price: 3500,
        stock: 10,
        options: { color: "Black", size: "XL" },
      },
    ],
  },
  {
    name: "Anteiku Logo Hoodie",
    slug: "anteiku-logo-hoodie",
    description:
      "Heavyweight fleece hoodie with embroidered logo. Premium streetwear essentials.",
    category: "apparel" as const,
    images: ["/placeholder-apparel-2.png"],
    basePrice: 5500,
    variants: [
      {
        name: "Grey / M",
        sku: "ALH-GRY-M",
        price: 5500,
        stock: 12,
        options: { color: "Grey", size: "M" },
      },
      {
        name: "Grey / L",
        sku: "ALH-GRY-L",
        price: 5500,
        stock: 18,
        options: { color: "Grey", size: "L" },
      },
      {
        name: "Grey / XL",
        sku: "ALH-GRY-XL",
        price: 5500,
        stock: 8,
        options: { color: "Grey", size: "XL" },
      },
    ],
  },
  {
    name: "Rize Figure",
    slug: "rize-figure",
    description:
      "Detailed PVC figure of Rize Kamishiro. 1/8 scale, approx. 20cm tall.",
    category: "figures" as const,
    images: ["/placeholder-figure-1.png"],
    basePrice: 8500,
    variants: [
      {
        name: "Standard",
        sku: "RZF-STD",
        price: 8500,
        stock: 10,
        options: { edition: "Standard" },
      },
    ],
  },
  {
    name: "Original Tamagotchi",
    slug: "original-tamagotchi",
    description:
      "90s classic re-released. Raise your own digital companion. Battery included.",
    category: "tamagotchis" as const,
    images: ["/placeholder-tama-1.png"],
    basePrice: 4200,
    variants: [
      {
        name: "White",
        sku: "OTG-WHT",
        price: 4200,
        stock: 20,
        options: { color: "White" },
      },
      {
        name: "Black",
        sku: "OTG-BLK",
        price: 4200,
        stock: 20,
        options: { color: "Black" },
      },
    ],
  },
  {
    name: "Anteiku Sticker Pack",
    slug: "anteiku-sticker-pack",
    description:
      "Set of 5 die-cut vinyl stickers. Waterproof, UV-resistant. Laptop, bottle, anywhere.",
    category: "stickers" as const,
    images: ["/placeholder-sticker-1.png"],
    basePrice: 800,
    variants: [
      {
        name: "Pack of 5",
        sku: "ASP-5",
        price: 800,
        stock: 100,
        options: { quantity: "5" },
      },
    ],
  },
  {
    name: "Tokyo Ghoul Pin Set",
    slug: "tokyo-ghoul-pin-set",
    description:
      "Enamel pin set featuring kakugan, mask, and coffee cup motifs. Gold-plated.",
    category: "accessories" as const,
    images: ["/placeholder-accessory-1.png"],
    basePrice: 1500,
    variants: [
      {
        name: "Set of 3",
        sku: "TGPS-3",
        price: 1500,
        stock: 35,
        options: { quantity: "3" },
      },
    ],
  },
];

// ─── Seed Function ──────────────────────────────────────

export async function seed() {
  console.log("🌱 Seeding database...");

  for (const product of seedProducts) {
    const { variants: productVariants, ...productData } = product;

    const [inserted] = await db
      .insert(products)
      .values(productData)
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

  console.log("🌱 Seeding complete!");
}

// ─── Run Directly ───────────────────────────────────────

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
