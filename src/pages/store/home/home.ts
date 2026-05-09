import "../../../style.css";
import { PRODUCTS, getCategories } from "../../../data/data";
import type { Product } from "../../../types/product";
import { addProductToCart, getCartQuantity } from "../../../utils/cart";

const productGrid = document.getElementById("productGrid") as HTMLDivElement;
const categoryList = document.getElementById("categoryList") as HTMLDivElement;
const searchInput = document.getElementById("searchInput") as HTMLInputElement;
const emptyMessage = document.getElementById("emptyMessage") as HTMLParagraphElement;
const activeFilter = document.getElementById("activeFilter") as HTMLParagraphElement;
const cartCount = document.getElementById("cartCount") as HTMLSpanElement;
const toast = document.getElementById("toast") as HTMLDivElement;

let selectedCategoryId = 0;
let searchTerm = "";
let toastTimer = 0;

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

function formatPrice(price: number): string {
  return currencyFormatter.format(price);
}

function updateCartCount(): void {
  cartCount.textContent = String(getCartQuantity());
}

function showToast(message: string): void {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 1800);
}

function getFilteredProducts(): Product[] {
  return PRODUCTS.filter((product) => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategoryId === 0 ||
      product.categorias.some((categoria) => categoria.id === selectedCategoryId);

    return !product.eliminado && matchesSearch && matchesCategory;
  });
}

function renderCategories(): void {
  const categories = getCategories();

  categoryList.innerHTML = "";

  const allButton = document.createElement("button");
  allButton.className = selectedCategoryId === 0 ? "category-button is-active" : "category-button";
  allButton.type = "button";
  allButton.textContent = "Todos";
  allButton.addEventListener("click", () => {
    selectedCategoryId = 0;
    renderPage();
  });
  categoryList.appendChild(allButton);

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.className =
      selectedCategoryId === category.id ? "category-button is-active" : "category-button";
    button.type = "button";
    button.textContent = category.nombre;
    button.addEventListener("click", () => {
      selectedCategoryId = category.id;
      renderPage();
    });
    categoryList.appendChild(button);
  });
}

function renderProducts(products: Product[]): void {
  productGrid.innerHTML = "";
  emptyMessage.hidden = products.length > 0;

  products.forEach((product) => {
    const categoryName = product.categorias[0]?.nombre ?? "Sin categoria";
    const card = document.createElement("article");
    card.className = "product-card";

    const badgeClass = product.disponible ? "stock-badge" : "stock-badge is-disabled";
    const buttonText = product.disponible ? "Agregar" : "Sin stock";

    card.innerHTML = `
      <div class="product-media" aria-hidden="true">
        <span>${categoryName.slice(0, 2).toUpperCase()}</span>
      </div>
      <div class="product-content">
        <div>
          <p class="product-category">${categoryName}</p>
          <h3>${product.nombre}</h3>
          <p>${product.descripcion}</p>
        </div>
        <div class="product-footer">
          <div>
            <strong>${formatPrice(product.precio)}</strong>
            <span class="${badgeClass}">${product.disponible ? `${product.stock} disponibles` : "No disponible"}</span>
          </div>
          <button class="primary-button" type="button" ${product.disponible ? "" : "disabled"} data-product-id="${product.id}">
            ${buttonText}
          </button>
        </div>
      </div>
    `;

    productGrid.appendChild(card);
  });

  productGrid.querySelectorAll<HTMLButtonElement>("[data-product-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = Number(button.dataset.productId);
      const product = PRODUCTS.find((item) => item.id === productId);

      if (!product) {
        return;
      }

      addProductToCart(product);
      updateCartCount();
      showToast(`${product.nombre} agregado al carrito`);
    });
  });
}

function renderActiveFilter(): void {
  const category = getCategories().find((item) => item.id === selectedCategoryId);
  const pieces = [
    category ? `Categoria: ${category.nombre}` : "Categoria: todas",
    searchTerm ? `Busqueda: "${searchTerm}"` : "",
  ].filter(Boolean);

  activeFilter.textContent = pieces.join(" | ");
}

function renderPage(): void {
  renderCategories();
  renderActiveFilter();
  renderProducts(getFilteredProducts());
}

searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value.trim();
  renderPage();
});

updateCartCount();
renderPage();
