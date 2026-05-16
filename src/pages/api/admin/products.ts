import type { APIRoute } from "astro";
import { normalizeProduct, readProducts, writeProducts } from "@/lib/productsStore";
import { verifyToken } from "@/lib/adminAuth";

export const prerender = false;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" }
  });
}

function isAuthorized(request: Request) {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  return verifyToken(token);
}

export const GET: APIRoute = async ({ request }) => {
  if (!isAuthorized(request)) return json({ ok: false, message: "Non autorisé" }, 401);
  return json({ ok: true, products: await readProducts() });
};

export const POST: APIRoute = async ({ request }) => {
  if (!isAuthorized(request)) return json({ ok: false, message: "Non autorisé" }, 401);
  const products = await readProducts();
  const nextId = products.length ? Math.max(...products.map((product) => product.id)) + 1 : 1;
  const product = normalizeProduct(await request.json(), nextId);
  products.push(product);
  await writeProducts(products);
  return json({ ok: true, product }, 201);
};

export const PUT: APIRoute = async ({ request }) => {
  if (!isAuthorized(request)) return json({ ok: false, message: "Non autorisé" }, 401);
  const payload = await request.json();
  const products = await readProducts();
  const index = products.findIndex((product) => product.id === Number(payload.id));
  if (index === -1) return json({ ok: false, message: "Produit introuvable" }, 404);
  products[index] = normalizeProduct(payload);
  await writeProducts(products);
  return json({ ok: true, product: products[index] });
};

export const DELETE: APIRoute = async ({ request }) => {
  if (!isAuthorized(request)) return json({ ok: false, message: "Non autorisé" }, 401);
  const { id } = await request.json();
  const products = await readProducts();
  const nextProducts = products.filter((product) => product.id !== Number(id));
  if (nextProducts.length === products.length) return json({ ok: false, message: "Produit introuvable" }, 404);
  await writeProducts(nextProducts);
  return json({ ok: true });
};
