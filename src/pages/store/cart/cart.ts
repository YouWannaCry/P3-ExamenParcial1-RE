import "../../../style.css";
import { PRODUCTS } from "../../../data/data";
import {
  clearCart,
  getCart,
  getCartQuantity,
  getCartTotal,
  removeCartItem,
  saveCart,
  updateCartItemQuantity,
} from "../../../utils/cart";
import { setupThemeToggle } from "../../../utils/theme";
import type { CartItem } from "../../../types/product";

const cartItemsContainer = document.getElementById("cartItems") as HTMLDivElement;
const emptyCartMessage = document.getElementById("emptyCartMessage") as HTMLParagraphElement;
const cartTotal = document.getElementById("cartTotal") as HTMLElement;
const cartCount = document.getElementById("cartCount") as HTMLSpanElement;
const clearCartButton = document.getElementById("clearCartButton") as HTMLButtonElement;

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

function formatPrice(price: number): string {
  return currencyFormatter.format(price);
}

function renderCartItem(item: CartItem): HTMLElement {
  const product = PRODUCTS.find((product) => product.id === item.id);
  const stock = product?.stock ?? item.stock ?? item.cantidad;
  const row = document.createElement("article");
  row.className = "cart-item";
  row.innerHTML = `
    <div class="cart-item-main">
      <div class="cart-thumb">
        <img src="${item.imagen}" alt="${item.nombre}" loading="lazy" />
        <span>${item.categoria.slice(0, 2).toUpperCase()}</span>
      </div>
      <div>
        <p class="product-category">${item.categoria}</p>
        <h2>${item.nombre}</h2>
        <p>${formatPrice(item.precio)} c/u | Stock: ${stock}</p>
      </div>
    </div>
    <div class="quantity-control" aria-label="Cantidad de ${item.nombre}">
      <button type="button" data-action="decrease" data-product-id="${item.id}">-</button>
      <input
        type="number"
        min="1"
        max="${stock}"
        value="${Math.min(item.cantidad, stock)}"
        data-action="set-quantity"
        data-product-id="${item.id}"
        aria-label="Cantidad"
      />
      <button type="button" data-action="increase" data-product-id="${item.id}" ${item.cantidad >= stock ? "disabled" : ""}>+</button>
    </div>
    <strong>${formatPrice(item.precio * item.cantidad)}</strong>
    <button class="remove-button" type="button" data-action="remove" data-product-id="${item.id}">Quitar</button>
  `;

  return row;
}

function setupImageFallbacks(): void {
  cartItemsContainer.querySelectorAll<HTMLImageElement>(".cart-thumb img").forEach((image) => {
    image.addEventListener("error", () => {
      image.parentElement?.classList.add("is-fallback");
      image.remove();
    });
  });
}

function getCartWithValidStock(): CartItem[] {
  const cart = getCart();
  const validCart = cart
    .map((item) => {
      const product = PRODUCTS.find((product) => product.id === item.id);
      const stock = product?.stock ?? item.stock ?? item.cantidad;

      return {
        ...item,
        stock,
        cantidad: Math.min(item.cantidad, stock),
      };
    })
    .filter((item) => item.cantidad > 0);

  if (JSON.stringify(cart) !== JSON.stringify(validCart)) {
    saveCart(validCart);
  }

  return validCart;
}

function renderCart(): void {
  const cart = getCartWithValidStock();
  const isEmpty = cart.length === 0;

  cartItemsContainer.innerHTML = "";
  emptyCartMessage.hidden = !isEmpty;
  clearCartButton.disabled = isEmpty;
  cartCount.textContent = String(getCartQuantity(cart));
  cartTotal.textContent = formatPrice(getCartTotal(cart));

  cart.forEach((item) => {
    cartItemsContainer.appendChild(renderCartItem(item));
  });

  setupImageFallbacks();

  cartItemsContainer.querySelectorAll<HTMLButtonElement>("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = Number(button.dataset.productId);
      const action = button.dataset.action;
      const currentItem = getCart().find((item) => item.id === productId);
      const product = PRODUCTS.find((product) => product.id === productId);
      const stock = product?.stock ?? currentItem?.stock;

      if (action === "remove") {
        removeCartItem(productId);
      }

      if (currentItem && action === "increase") {
        updateCartItemQuantity(productId, currentItem.cantidad + 1, stock);
      }

      if (currentItem && action === "decrease") {
        updateCartItemQuantity(productId, currentItem.cantidad - 1, stock);
      }

      renderCart();
    });
  });

  cartItemsContainer
    .querySelectorAll<HTMLInputElement>('[data-action="set-quantity"]')
    .forEach((input) => {
      input.addEventListener("change", () => {
        const productId = Number(input.dataset.productId);
        const product = PRODUCTS.find((product) => product.id === productId);
        const currentItem = getCart().find((item) => item.id === productId);
        const stock = product?.stock ?? currentItem?.stock ?? Number(input.max);
        const quantity = Number(input.value);

        updateCartItemQuantity(productId, quantity, stock);
        renderCart();
      });
    });
}

clearCartButton.addEventListener("click", () => {
  clearCart();
  renderCart();
});

setupThemeToggle();
renderCart();
