export type ProductCategory = "coffee" | "apparel" | "notebooks";

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
    name: "Tokyo Noir",
    slug: "tokyo-noir",
    description:
      "Dark roast with notes of dark chocolate and smoke. Dangerously smooth.",
    category: "coffee",
    images: ["/products/cafe-anteiku-black.png"],
    basePrice: 3800,
    variants: [
      {
        id: "v1",
        name: "250g",
        sku: "TN-250",
        price: 13500,
        stock: 50,
        options: { weight: "250g" },
      },
      {
        id: "v2",
        name: "500g",
        sku: "TN-500",
        price: 25000,
        stock: 30,
        options: { weight: "500g" },
      },
    ],
  },
  {
    id: "14",
    name: "Shibuya Red",
    slug: "shibuya-red",
    description:
      "Medium roast with bright acidity and red fruit notes. Bold but balanced.",
    category: "coffee",
    images: ["/products/cafe-anteiku-red.png"],
    basePrice: 3800,
    variants: [
      {
        id: "v30",
        name: "250g",
        sku: "SR-250",
        price: 13500,
        stock: 40,
        options: { weight: "250g" },
      },
      {
        id: "v31",
        name: "500g",
        sku: "SR-500",
        price: 25000,
        stock: 25,
        options: { weight: "500g" },
      },
    ],
  },
  {
    id: "9",
    name: "White Pony Chomba",
    slug: "whitepony-chomba",
    description:
      "Chomba negra con logo bordado. Crossover White Pony de Deftones x Polo. Premium.",
    category: "apparel",
    images: ["/products/whitepony-chomba.png"],
    basePrice: 35000,
    variants: [
      {
        id: "v16",
        name: "Negro / S",
        sku: "WPC-BLK-S",
        price: 35000,
        stock: 10,
        options: { color: "Negro", size: "S" },
      },
      {
        id: "v17",
        name: "Negro / M",
        sku: "WPC-BLK-M",
        price: 35000,
        stock: 15,
        options: { color: "Negro", size: "M" },
      },
      {
        id: "v18",
        name: "Negro / L",
        sku: "WPC-BLK-L",
        price: 35000,
        stock: 12,
        options: { color: "Negro", size: "L" },
      },
      {
        id: "v19",
        name: "Negro / XL",
        sku: "WPC-BLK-XL",
        price: 35000,
        stock: 8,
        options: { color: "Negro", size: "XL" },
      },
    ],
  },
  {
    id: "10",
    name: "Hisoka Almendra Remera",
    slug: "hisoka-almendra-remera",
    description:
      "Remera blanca con ilustración de Hisoka. Crossover Almendra de Spinetta x Hunter x Hunter. Algodón premium.",
    category: "apparel",
    images: ["/products/hisoka-almendra-remera.png"],
    basePrice: 22000,
    variants: [
      {
        id: "v20",
        name: "Blanco / S",
        sku: "HAR-WHT-S",
        price: 22000,
        stock: 12,
        options: { color: "Blanco", size: "S" },
      },
      {
        id: "v21",
        name: "Blanco / M",
        sku: "HAR-WHT-M",
        price: 22000,
        stock: 20,
        options: { color: "Blanco", size: "M" },
      },
      {
        id: "v22",
        name: "Blanco / L",
        sku: "HAR-WHT-L",
        price: 22000,
        stock: 18,
        options: { color: "Blanco", size: "L" },
      },
      {
        id: "v23",
        name: "Blanco / XL",
        sku: "HAR-WHT-XL",
        price: 22000,
        stock: 10,
        options: { color: "Blanco", size: "XL" },
      },
    ],
  },
  {
    id: "11",
    name: "Mr. Popo Igor Remera",
    slug: "mrpopo-igor-remera",
    description:
      "Remera rosa con Mr. Popo. Crossover IGOR de Tyler the Creator x Dragon Ball. Algodón premium, edición limitada.",
    category: "apparel",
    images: ["/products/mrpopo-igor-remera.png"],
    basePrice: 25000,
    variants: [
      {
        id: "v24",
        name: "Rosa / S",
        sku: "MPI-PNK-S",
        price: 25000,
        stock: 10,
        options: { color: "Rosa", size: "S" },
      },
      {
        id: "v25",
        name: "Rosa / M",
        sku: "MPI-PNK-M",
        price: 25000,
        stock: 15,
        options: { color: "Rosa", size: "M" },
      },
      {
        id: "v26",
        name: "Rosa / L",
        sku: "MPI-PNK-L",
        price: 25000,
        stock: 12,
        options: { color: "Rosa", size: "L" },
      },
      {
        id: "v27",
        name: "Rosa / XL",
        sku: "MPI-PNK-XL",
        price: 25000,
        stock: 8,
        options: { color: "Rosa", size: "XL" },
      },
    ],
  },
  {
    id: "12",
    name: "Death Note Cuaderno",
    slug: "deathnote-cuaderno",
    description:
      "Cuaderno premium con diseño Death Note. Tapa dura, 200 páginas rayadas. Si lo encontrás, no lo devuelvas.",
    category: "notebooks",
    images: ["/products/deathnote-cuaderno.png"],
    basePrice: 2800,
    variants: [
      {
        id: "v28",
        name: "Standard",
        sku: "DNC-STD",
        price: 2800,
        stock: 25,
        options: { edition: "Standard" },
      },
    ],
  },
  {
    id: "13",
    name: "Totoro Cuaderno",
    slug: "totoro-cuaderno",
    description:
      "Cuaderno suave con Totoro en la portada. 160 páginas cuadriculadas. Perfecto para dibujar.",
    category: "notebooks",
    images: ["/products/totoro-cuaderno.png"],
    basePrice: 2400,
    variants: [
      {
        id: "v29",
        name: "Standard",
        sku: "TTC-STD",
        price: 2400,
        stock: 30,
        options: { edition: "Standard" },
      },
    ],
  },
  {
    id: "15",
    name: "Gashbell Perversito Remera",
    slug: "gashbell-perversito-remera",
    description:
      "Remera celeste con Gashbell riendo. Crossover Gashbell x The Simpsons. Frase icónica de Gabo. Algodón premium.",
    category: "apparel",
    images: ["/products/gashbell-perversito-remera.png"],
    basePrice: 22000,
    variants: [
      {
        id: "v32",
        name: "Celeste / S",
        sku: "GPR-BLU-S",
        price: 22000,
        stock: 10,
        options: { color: "Celeste", size: "S" },
      },
      {
        id: "v33",
        name: "Celeste / M",
        sku: "GPR-BLU-M",
        price: 22000,
        stock: 15,
        options: { color: "Celeste", size: "M" },
      },
      {
        id: "v34",
        name: "Celeste / L",
        sku: "GPR-BLU-L",
        price: 22000,
        stock: 12,
        options: { color: "Celeste", size: "L" },
      },
      {
        id: "v35",
        name: "Celeste / XL",
        sku: "GPR-BLU-XL",
        price: 22000,
        stock: 8,
        options: { color: "Celeste", size: "XL" },
      },
    ],
  },
];
