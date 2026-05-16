import type { APIRoute } from "astro";
import { issueToken, verifyPassword } from "@/lib/adminAuth";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const { password } = await request.json().catch(() => ({ password: "" }));

  if (!verifyPassword(String(password))) {
    return new Response(JSON.stringify({ ok: false, message: "Mot de passe incorrect" }), { status: 401 });
  }

  return new Response(JSON.stringify({ ok: true, token: issueToken() }), {
    headers: { "content-type": "application/json" }
  });
};
