import "../../../style.css";
import {
  clearCart,
  getCart,
  getCartQuantity,
  getCartTotal,
  removeCartItem,
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
  const row = document.createElement("article");
  row.className = "cart-item";
  row.innerHTML = `
    <div class="cart-item-main">
      <div class="cart-thumb" aria-hidden="true">${item.categoria.slice(0, 2).toUpperCase()}</div>
      <div>
        <p class="product-category">${item.categoria}</p>
        <h2>${item.nombre}</h2>
        <p>${formatPrice(item.precio)} c/u</p>
      </div>
    </div>
    <div class="quantity-control" aria-label="Cantidad de ${item.nombre}">
      <button type="button" data-action="decrease" data-product-id="${item.id}">-</button>
      <span>${item.cantidad}</span>
      <button type="button" data-action="increase" data-product-id="${item.id}">+</button>
    </div>
    <strong>${formatPrice(item.precio * item.cantidad)}</strong>
    <button class="remove-button" type="button" data-action="remove" data-product-id="${item.id}">Quitar</button>
  `;

  return row;
}

function renderCart(): void {
  const cart = getCart();
  const isEmpty = cart.length === 0;

  cartItemsContainer.innerHTML = "";
  emptyCartMessage.hidden = !isEmpty;
  clearCartButton.disabled = isEmpty;
  cartCount.textContent = String(getCartQuantity(cart));
  cartTotal.textContent = formatPrice(getCartTotal(cart));

  cart.forEach((item) => {
    cartItemsContainer.appendChild(renderCartItem(item));
  });

  cartItemsContainer.querySelectorAll<HTMLButtonElement>("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = Number(button.dataset.productId);
      const action = button.dataset.action;
      const currentItem = getCart().find((item) => item.id === productId);

      if (action === "remove") {
        removeCartItem(productId);
      }

      if (currentItem && action === "increase") {
        updateCartItemQuantity(productId, currentItem.cantidad + 1);
      }

      if (currentItem && action === "decrease") {
        updateCartItemQuantity(productId, currentItem.cantidad - 1);
      }

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
