import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Swiper from "swiper";
import { EffectCoverflow, Autoplay } from "swiper/modules";

gsap.registerPlugin(ScrollTrigger);

const products = JSON.parse(document.getElementById("products-json")?.textContent ?? "[]");
const whatsappNumber = window.MK_WHATSAPP_NUMBER ?? "2250700333444";
let cart = JSON.parse(localStorage.getItem("mk-cart") ?? "[]");

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const formatPrice = (value) => `${Number(value).toLocaleString("fr-FR")} FCFA`;

function saveCart() {
  localStorage.setItem("mk-cart", JSON.stringify(cart));
}

function showToast(message) {
  const toast = qs("[data-toast]");
  toast.textContent = message;
  toast.classList.remove("opacity-0", "translate-y-14");
  toast.classList.add("opacity-100", "translate-y-0");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-14");
    toast.classList.remove("opacity-100", "translate-y-0");
  }, 2300);
}

function cartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function cartCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function updateCart() {
  qsa("[data-cart-count]").forEach((el) => {
    el.textContent = String(cartCount());
  });
  qsa("[data-cart-total]").forEach((el) => {
    el.textContent = formatPrice(cartTotal());
  });

  const items = qs("[data-cart-items]");
  if (!items) return;

  if (!cart.length) {
    items.innerHTML = `
      <div class="grid h-full min-h-72 place-items-center text-center">
        <div>
          <div class="mx-auto grid size-16 place-items-center rounded-full bg-cream text-cocoa">
            <svg class="icon mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M7 9h10l-.7 10H7.7L7 9Z"/><path d="M9.5 9V7a2.5 2.5 0 0 1 5 0v2"/></svg>
          </div>
          <p class="mt-4 font-display text-2xl text-espresso">Votre panier est vide</p>
          <p class="mt-2 text-sm text-muted">Ajoutez une pâtisserie, un pain ou un brunch pour commencer.</p>
        </div>
      </div>
    `;
    return;
  }

  items.innerHTML = cart.map((item) => `
    <article class="mb-4 flex gap-4 rounded-md border border-biscuit bg-cream p-3">
      <img src="${item.image}" alt="" class="size-20 shrink-0 rounded object-cover" loading="lazy">
      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="font-display text-xl leading-6 text-espresso">${item.name}</h3>
            <p class="mt-1 text-sm text-caramel">${formatPrice(item.price * item.quantity)}</p>
          </div>
          <button class="text-muted transition hover:text-caramel" data-remove-product="${item.id}" aria-label="Supprimer ${item.name}">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 7h14M10 11v6M14 11v6M7 7l1 13h8l1-13M9 7V5h6v2"/></svg>
          </button>
        </div>
        <div class="mt-4 flex items-center gap-2">
          <button class="grid size-8 place-items-center rounded-full border border-biscuit bg-linen" data-qty-product="${item.id}" data-delta="-1" aria-label="Retirer une unité">-</button>
          <span class="min-w-8 text-center text-sm font-bold">${item.quantity}</span>
          <button class="grid size-8 place-items-center rounded-full border border-biscuit bg-linen" data-qty-product="${item.id}" data-delta="1" aria-label="Ajouter une unité">+</button>
        </div>
      </div>
    </article>
  `).join("");
}

function addToCart(id) {
  const product = products.find((item) => item.id === Number(id));
  if (!product) return;
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart();
  updateCart();
  showToast(`${product.name} ajouté au panier`);
}

function changeQuantity(id, delta) {
  const item = cart.find((cartItem) => cartItem.id === Number(id));
  if (!item) return;
  item.quantity += Number(delta);
  if (item.quantity <= 0) {
    cart = cart.filter((cartItem) => cartItem.id !== Number(id));
  }
  saveCart();
  updateCart();
}

function removeFromCart(id) {
  cart = cart.filter((cartItem) => cartItem.id !== Number(id));
  saveCart();
  updateCart();
}

function openCart() {
  qs("[data-cart-drawer]")?.classList.remove("translate-x-full");
  qs("[data-cart-backdrop]")?.classList.remove("hidden");
  document.body.classList.add("cart-open");
}

function closeCart() {
  qs("[data-cart-drawer]")?.classList.add("translate-x-full");
  qs("[data-cart-backdrop]")?.classList.add("hidden");
  document.body.classList.remove("cart-open");
}

function orderOnWhatsApp() {
  if (!cart.length) {
    showToast("Ajoutez d'abord un produit au panier");
    openCart();
    return;
  }

  const lines = cart.map((item) => `- ${item.quantity} ${item.name} (${formatPrice(item.price * item.quantity)})`).join("\n");
  const message = `Bonjour Maison Kayser,\n\nJe souhaite commander :\n\n${lines}\n\nTotal : ${formatPrice(cartTotal())}\n\nNom :\nTéléphone :\nAdresse de livraison :\n\nMerci.`;
  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
}

function bindCart() {
  document.addEventListener("click", (event) => {
    const target = event.target.closest("button, a");
    if (!target) return;

    if (target.matches("[data-add-product]")) addToCart(target.dataset.addProduct);
    if (target.matches("[data-cart-open]")) openCart();
    if (target.matches("[data-cart-close]") || target.matches("[data-cart-backdrop]")) closeCart();
    if (target.matches("[data-wa-order]")) orderOnWhatsApp();
    if (target.matches("[data-remove-product]")) removeFromCart(target.dataset.removeProduct);
    if (target.matches("[data-qty-product]")) changeQuantity(target.dataset.qtyProduct, target.dataset.delta);
  });
}

function bindFilters() {
  qsa("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.category;
      qsa("[data-category]").forEach((tab) => {
        tab.dataset.active = String(tab === button);
      });
      qsa("[data-product-card]").forEach((card) => {
        const visible = category === "Tous" || card.dataset.category === category;
        card.classList.toggle("hidden", !visible);
      });
      gsap.fromTo("[data-product-card]:not(.hidden)", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .45, stagger: .035, ease: "power2.out" });
    });
  });
}

function bindMenu() {
  const menu = qs("[data-mobile-menu]");
  const open = () => {
    menu?.classList.remove("translate-x-full");
    document.body.classList.add("menu-open");
  };
  const close = () => {
    menu?.classList.add("translate-x-full");
    document.body.classList.remove("menu-open");
  };
  qs("[data-menu-open]")?.addEventListener("click", open);
  qs("[data-menu-close]")?.addEventListener("click", close);
  qsa("[data-menu-link]").forEach((link) => link.addEventListener("click", close));
}

function initAnimations() {
  const loader = qs("#loader");
  gsap.to("#loader-bar", { x: "0%", duration: 1.1, ease: "power3.out" });
  window.addEventListener("load", () => {
    gsap.to(loader, { opacity: 0, duration: .65, delay: .45, onComplete: () => loader?.remove() });
  });

  gsap.from(".hero-piece", { y: 34, opacity: 0, duration: .9, stagger: .13, delay: .35, ease: "power3.out" });
  gsap.to("[data-parallax]", {
    yPercent: 10,
    ease: "none",
    scrollTrigger: {
      trigger: "#accueil",
      start: "top top",
      end: "bottom top",
      scrub: true
    }
  });

  qsa(".reveal").forEach((el) => {
    gsap.fromTo(el, { y: 38, opacity: 0 }, { y: 0, opacity: 1, duration: .75, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 84%" } });
  });
  qsa(".reveal-left").forEach((el) => {
    gsap.fromTo(el, { x: -42, opacity: 0 }, { x: 0, opacity: 1, duration: .8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 82%" } });
  });
  qsa(".reveal-right").forEach((el) => {
    gsap.fromTo(el, { x: 42, opacity: 0 }, { x: 0, opacity: 1, duration: .8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 82%" } });
  });
  qsa(".reveal-zoom").forEach((el) => {
    gsap.fromTo(el, { scale: .94, opacity: 0 }, { scale: 1, opacity: 1, duration: .8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 84%" } });
  });

  ScrollTrigger.create({
    start: 80,
    onUpdate: (self) => {
      const active = self.scroll() > 80;
      qs("#site-header")?.classList.toggle("bg-linen/95", active);
      qs("#site-header")?.classList.toggle("shadow-soft", active);
      qsa(".nav-link").forEach((link) => {
        link.className = `nav-link text-xs font-bold uppercase tracking-[.16em] transition ${active ? "text-muted hover:text-caramel" : "text-cream/78 hover:text-saffron"}`;
      });
      qs("[data-menu-open]")?.classList.toggle("text-cream", !active);
      qs("[data-menu-open]")?.classList.toggle("text-espresso", active);
      qs("[data-nav-logo]")?.classList.toggle("text-espresso", active);
      qs("[data-nav-logo]")?.classList.toggle("text-cream", !active);
    }
  });
}

function initSwiper() {
  new Swiper(".review-swiper", {
    modules: [EffectCoverflow, Autoplay],
    slidesPerView: 1.08,
    spaceBetween: 18,
    speed: 700,
    loop: true,
    autoplay: {
      delay: 2600,
      disableOnInteraction: false
    },
    breakpoints: {
      720: { slidesPerView: 2.15 },
      1080: { slidesPerView: 3.05 }
    }
  });
}

function bindNewsletter() {
  qs(".newsletter")?.addEventListener("submit", (event) => {
    event.preventDefault();
    event.currentTarget.reset();
    showToast("Inscription newsletter confirmée");
  });
}

bindCart();
bindFilters();
bindMenu();
bindNewsletter();
updateCart();
initAnimations();
initSwiper();
