import { PRODUCTS, getCategories } from "../../../data/data";
import type { Product } from "../../../types/product";
import { addProductToCart, getCart } from "../../../utils/cart";
import { setupThemeToggle } from "../../../utils/theme";

const productGrid = document.getElementById("productGrid") as HTMLDivElement;
const categoryList = document.getElementById("categoryList") as HTMLDivElement;
const categoryMenuButton = document.getElementById("categoryMenuButton") as HTMLButtonElement;
const searchInput = document.getElementById("searchInput") as HTMLInputElement;
const emptyMessage = document.getElementById("emptyMessage") as HTMLParagraphElement;
const activeFilter = document.getElementById("activeFilter") as HTMLParagraphElement;
const cartTotalHeader = document.getElementById("cartTotalHeader") as HTMLSpanElement;
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

function updateCartSummary(): void {
  const trustedTotal = getCart().reduce((total, item) => {
    const product = PRODUCTS.find((product) => product.id === item.id);

    if (!product) {
      return total;
    }

    return total + product.precio * Math.min(item.cantidad, product.stock);
  }, 0);

  cartTotalHeader.textContent = formatPrice(trustedTotal);
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

function closeCategoryMenu(): void {
  categoryList.hidden = true;
  categoryMenuButton.setAttribute("aria-expanded", "false");
}

function toggleCategoryMenu(): void {
  const willOpen = categoryList.hidden;

  categoryList.hidden = !willOpen;
  categoryMenuButton.setAttribute("aria-expanded", String(willOpen));
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
    closeCategoryMenu();
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
      closeCategoryMenu();
      renderPage();
    });
    categoryList.appendChild(button);
  });
}

function createProductCard(product: Product): HTMLElement {
  const cart = getCart();
  const categoryName = product.categorias[0]?.nombre ?? "Sin categoria";
  const cartQuantity = cart.find((item) => item.id === product.id)?.cantidad ?? 0;
  const availableQuantity = Math.max(0, product.stock - cartQuantity);
  const canAddProduct = product.disponible && availableQuantity > 0;
  const card = document.createElement("article");
  card.className = "product-card";

  const badgeClass = canAddProduct ? "stock-badge" : "stock-badge is-disabled";
  const buttonText = canAddProduct ? "Agregar" : "Sin stock";
  const stockText = canAddProduct
    ? `${availableQuantity} disponibles`
    : product.disponible
      ? "Stock agregado"
      : "No disponible";

  card.innerHTML = `
    <div class="product-media">
      <img src="${product.imagen}" alt="${product.nombre}" loading="lazy" />
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
          <span class="${badgeClass}">${stockText}</span>
        </div>
        <div class="add-product-controls">
          <label for="quantity-${product.id}">Cantidad</label>
          <input
            id="quantity-${product.id}"
            type="number"
            min="1"
            max="${availableQuantity}"
            value="${canAddProduct ? 1 : 0}"
            ${canAddProduct ? "" : "disabled"}
            data-quantity-for="${product.id}"
          />
          <button class="primary-button" type="button" ${canAddProduct ? "" : "disabled"} data-product-id="${product.id}">
            ${buttonText}
          </button>
        </div>
      </div>
    </div>
  `;

  return card;
}

function renderProductSections(products: Product[]): void {
  productGrid.innerHTML = "";
  emptyMessage.hidden = products.length > 0;

  const categories = getCategories().filter(
    (category) => selectedCategoryId === 0 || category.id === selectedCategoryId
  );

  categories.forEach((category) => {
    const productsByCategory = products.filter((product) =>
      product.categorias.some((productCategory) => productCategory.id === category.id)
    );

    if (productsByCategory.length === 0) {
      return;
    }

    const section = document.createElement("section");
    section.className = "category-section";
    section.id = `category-${category.id}`;
    section.innerHTML = `
      <div class="category-section-heading">
        <div>
          <p class="eyebrow">${productsByCategory.length} productos</p>
          <h2>${category.nombre}</h2>
        </div>
        <p>${category.descripcion}</p>
      </div>
      <div class="product-grid"></div>
    `;

    const sectionGrid = section.querySelector(".product-grid") as HTMLDivElement;
    productsByCategory.forEach((product) => {
      sectionGrid.appendChild(createProductCard(product));
    });

    productGrid.appendChild(section);
  });

  productGrid.querySelectorAll<HTMLButtonElement>("[data-product-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = Number(button.dataset.productId);
      const product = PRODUCTS.find((item) => item.id === productId);

      if (!product) {
        return;
      }

      const quantityInput = productGrid.querySelector<HTMLInputElement>(
        `[data-quantity-for="${product.id}"]`
      );
      const currentQuantity = getCart().find((item) => item.id === product.id)?.cantidad ?? 0;
      const availableQuantity = Math.max(0, product.stock - currentQuantity);
      const inputQuantity = Number(quantityInput?.value ?? 1);
      const requestedQuantity = Number.isFinite(inputQuantity) ? Math.max(1, inputQuantity) : 1;
      const quantityToAdd = Math.min(requestedQuantity, availableQuantity);

      if (availableQuantity === 0) {
        showToast(`Ya agregaste todo el stock de ${product.nombre}`);
        renderPage();
        return;
      }

      addProductToCart(product, quantityToAdd);
      updateCartSummary();
      showToast(
        quantityToAdd === requestedQuantity
          ? `${quantityToAdd} ${product.nombre} agregado al carrito`
          : `Solo se agregaron ${quantityToAdd}; no hay mas stock`
      );
      renderPage();
    });
  });

  productGrid.querySelectorAll<HTMLImageElement>(".product-media img").forEach((image) => {
    image.addEventListener("error", () => {
      image.parentElement?.classList.add("is-fallback");
      image.remove();
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
  renderProductSections(getFilteredProducts());
}

categoryMenuButton.addEventListener("click", toggleCategoryMenu);

searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value.trim();
  renderPage();
});

updateCartSummary();
setupThemeToggle();
renderPage();
