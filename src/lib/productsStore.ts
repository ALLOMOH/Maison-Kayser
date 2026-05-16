import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

export type Product = {
  id: number;
  category: string;
  name: string;
  price: number;
  description: string;
  image: string;
};

const productsPath = resolve(process.cwd(), "src/data/products.json");

export async function readProducts(): Promise<Product[]> {
  const content = await readFile(productsPath, "utf-8");
  return JSON.parse(content) as Product[];
}

export async function writeProducts(products: Product[]) {
  await writeFile(productsPath, `${JSON.stringify(products, null, 2)}\n`, "utf-8");
}

export function normalizeProduct(input: Partial<Product>, fallbackId?: number): Product {
  const price = Number(input.price);
  if (!input.category || !input.name || !input.description || !input.image || !Number.isFinite(price)) {
    throw new Error("Produit invalide");
  }

  return {
    id: Number(input.id ?? fallbackId),
    category: String(input.category).trim(),
    name: String(input.name).trim(),
    price,
    description: String(input.description).trim(),
    image: String(input.image).trim()
  };
}

// 