export type ProductCategory =
  | "coffee"
  | "figures"
  | "apparel"
  | "stickers"
  | "tamagotchis"
  | "accessories";

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number; // cents
  stock: number;
  options: Record<string, string>;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ProductCategory;
  images: string[];
  basePrice: number; // cents
  variants: ProductVariant[];
}

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Tokyo Ghoul Blend",
    slug: "tokyo-ghoul-blend",
    description:
      "Dark roast with notes of dark chocolate and smoke. Dangerously smooth.",
    category: "coffee",
    images: ["/placeholder-coffee-1.png"],
    basePrice: 1800,
    variants: [
      {
        id: "v1",
        name: "250g",
        sku: "TGB-250",
        price: 1800,
        stock: 50,
        options: { weight: "250g" },
      },
      {
        id: "v2",
        name: "500g",
        sku: "TGB-500",
        price: 3200,
        stock: 30,
        options: { weight: "500g" },
      },
    ],
  },
  {
    id: "2",
    name: "Re:Zero Espresso",
    slug: "re-zero-espresso",
    description:
      "Italian-style espresso blend. Returns you to perfect extraction every time.",
    category: "coffee",
    images: ["/placeholder-coffee-2.png"],
    basePrice: 2000,
    variants: [
      {
        id: "v3",
        name: "250g",
        sku: "RZE-250",
        price: 2000,
        stock: 40,
        options: { weight: "250g" },
      },
    ],
  },
  {
    id: "3",
    name: "Kaneki Mask Tee",
    slug: "kaneki-mask-tee",
    description:
      "Premium cotton tee featuring the iconic mask design. Minimal, bold, unmistakable.",
    category: "apparel",
    images: ["/placeholder-apparel-1.png"],
    basePrice: 3500,
    variants: [
      {
        id: "v4",
        name: "Black / S",
        sku: "KMT-BLK-S",
        price: 3500,
        stock: 15,
        options: { color: "Black", size: "S" },
      },
      {
        id: "v5",
        name: "Black / M",
        sku: "KMT-BLK-M",
        price: 3500,
        stock: 25,
        options: { color: "Black", size: "M" },
      },
      {
        id: "v6",
        name: "Black / L",
        sku: "KMT-BLK-L",
        price: 3500,
        stock: 20,
        options: { color: "Black", size: "L" },
      },
      {
        id: "v7",
        name: "Black / XL",
        sku: "KMT-BLK-XL",
        price: 3500,
        stock: 10,
        options: { color: "Black", size: "XL" },
      },
    ],
  },
  {
    id: "4",
    name: "Anteiku Logo Hoodie",
    slug: "anteiku-logo-hoodie",
    description:
      "Heavyweight fleece hoodie with embroidered logo. Premium streetwear essentials.",
    category: "apparel",
    images: ["/placeholder-apparel-2.png"],
    basePrice: 5500,
    variants: [
      {
        id: "v8",
        name: "Grey / M",
        sku: "ALH-GRY-M",
        price: 5500,
        stock: 12,
        options: { color: "Grey", size: "M" },
      },
      {
        id: "v9",
        name: "Grey / L",
        sku: "ALH-GRY-L",
        price: 5500,
        stock: 18,
        options: { color: "Grey", size: "L" },
      },
      {
        id: "v10",
        name: "Grey / XL",
        sku: "ALH-GRY-XL",
        price: 5500,
        stock: 8,
        options: { color: "Grey", size: "XL" },
      },
    ],
  },
  {
    id: "5",
    name: "Rize Figure",
    slug: "rize-figure",
    description:
      "Detailed PVC figure of Rize Kamishiro. 1/8 scale, approx. 20cm tall.",
    category: "figures",
    images: ["/placeholder-figure-1.png"],
    basePrice: 8500,
    variants: [
      {
        id: "v11",
        name: "Standard",
        sku: "RZF-STD",
        price: 8500,
        stock: 10,
        options: { edition: "Standard" },
      },
    ],
  },
  {
    id: "6",
    name: "Original Tamagotchi",
    slug: "original-tamagotchi",
    description:
      "90s classic re-released. Raise your own digital companion. Battery included.",
    category: "tamagotchis",
    images: ["/placeholder-tama-1.png"],
    basePrice: 4200,
    variants: [
      {
        id: "v12",
        name: "White",
        sku: "OTG-WHT",
        price: 4200,
        stock: 20,
        options: { color: "White" },
      },
      {
        id: "v13",
        name: "Black",
        sku: "OTG-BLK",
        price: 4200,
        stock: 20,
        options: { color: "Black" },
      },
    ],
  },
  {
    id: "7",
    name: "Anteiku Sticker Pack",
    slug: "anteiku-sticker-pack",
    description:
      "Set of 5 die-cut vinyl stickers. Waterproof, UV-resistant. Laptop, bottle, anywhere.",
    category: "stickers",
    images: ["/placeholder-sticker-1.png"],
    basePrice: 800,
    variants: [
      {
        id: "v14",
        name: "Pack of 5",
        sku: "ASP-5",
        price: 800,
        stock: 100,
        options: { quantity: "5" },
      },
    ],
  },
  {
    id: "8",
    name: "Tokyo Ghoul Pin Set",
    slug: "tokyo-ghoul-pin-set",
    description:
      "Enamel pin set featuring kakugan, mask, and coffee cup motifs. Gold-plated.",
    category: "accessories",
    images: ["/placeholder-accessory-1.png"],
    basePrice: 1500,
    variants: [
      {
        id: "v15",
        name: "Set of 3",
        sku: "TGPS-3",
        price: 1500,
        stock: 35,
        options: { quantity: "3" },
      },
    ],
  },
];
