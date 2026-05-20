const tokenKey = "mk-admin-token";
const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const form = qs("[data-product-form]");
const deleteButton = qs("[data-delete-product]");

let products = [];

function token() {
  return sessionStorage.getItem(tokenKey);
}

function showToast(message) {
  const toast = qs("[data-admin-toast]");
  toast.textContent = message;
  toast.classList.remove("opacity-0", "translate-y-12");
  toast.classList.add("opacity-100", "translate-y-0");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-12");
    toast.classList.remove("opacity-100", "translate-y-0");
  }, 2600);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token()}`,
      ...(options.headers || {})
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Erreur serveur");
  return data;
}

function revealAdmin() {
  qs("[data-admin-app]").classList.remove("hidden");
  qs("[data-admin-status]").classList.remove("hidden");
  qs("[data-login-form]").classList.add("hidden");
}

function hideAdmin() {
  qs("[data-admin-app]").classList.add("hidden");
  qs("[data-admin-status]").classList.add("hidden");
  qs("[data-login-form]").classList.remove("hidden");
  qs("[data-login-form]")?.reset();
  setForm();
  products = [];
  qs("[data-products-list]").innerHTML = "";
}

function logoutAdmin() {
  sessionStorage.removeItem(tokenKey);
  hideAdmin();
  showToast("Déconnexion réussie");
}

function readForm() {
  const data = Object.fromEntries(new FormData(form));
  return {
    id: data.id ? Number(data.id) : undefined,
    category: data.category,
    name: data.name,
    price: Number(data.price),
    description: data.description,
    image: data.image
  };
}

function setForm(product) {
  form.elements.id.value = product?.id ?? "";
  form.elements.category.value = product?.category ?? "Viennoiseries";
  form.elements.name.value = product?.name ?? "";
  form.elements.price.value = product?.price ?? "";
  form.elements.description.value = product?.description ?? "";
  form.elements.image.value = product?.image ?? "";
  deleteButton.disabled = !product?.id;
}

function renderProducts() {
  const list = qs("[data-products-list]");
  list.innerHTML = products.map((product) => `
    <button class="grid grid-cols-[72px_1fr_auto] items-center gap-4 rounded-md border border-biscuit bg-cream p-3 text-left transition hover:border-caramel" data-edit-id="${product.id}" type="button">
      <img src="${product.image}" alt="" class="size-16 rounded object-cover">
      <span>
        <strong class="block font-display text-2xl text-espresso">${product.name}</strong>
        <span class="text-sm text-muted">${product.category} · ${Number(product.price).toLocaleString("fr-FR")} FCFA</span>
      </span>
      <span class="hidden text-xs font-bold uppercase tracking-[.14em] text-caramel sm:block">Modifier</span>
    </button>
  `).join("");

  qsa("[data-edit-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const product = products.find((item) => item.id === Number(button.dataset.editId));
      setForm(product);
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

async function loadProducts() {
  const data = await api("/api/admin/products");
  products = data.products;
  renderProducts();
}

qs("[data-login-form]")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = new FormData(event.currentTarget).get("password");
  try {
    const data = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password })
    }).then((response) => response.json().then((json) => ({ response, json })));

    if (!data.response.ok) throw new Error(data.json.message);
    sessionStorage.setItem(tokenKey, data.json.token);
    revealAdmin();
    await loadProducts();
    showToast("Connexion réussie");
  } catch (error) {
    showToast(error.message);
  }
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = readForm();
  const method = payload.id ? "PUT" : "POST";
  try {
    await api("/api/admin/products", { method, body: JSON.stringify(payload) });
    await loadProducts();
    setForm();
    showToast("Produit enregistré");
  } catch (error) {
    showToast(error.message);
  }
});

deleteButton?.addEventListener("click", async () => {
  const id = Number(form.elements.id.value);
  if (!id) return;
  try {
    await api("/api/admin/products", { method: "DELETE", body: JSON.stringify({ id }) });
    await loadProducts();
    setForm();
    showToast("Produit supprimé");
  } catch (error) {
    showToast(error.message);
  }
});

qs("[data-reset-form]")?.addEventListener("click", () => setForm());
qs("[data-logout]")?.addEventListener("click", logoutAdmin);

if (token()) {
  revealAdmin();
  loadProducts().catch(() => {
    sessionStorage.removeItem(tokenKey);
    hideAdmin();
  });
}
