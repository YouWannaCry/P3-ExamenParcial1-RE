import type { CartItem, Product } from "../types/product";

const CART_STORAGE_KEY = "foodStoreCart";

export function getCart(): CartItem[] {
  const cartSaved = localStorage.getItem(CART_STORAGE_KEY);

  if (!cartSaved) {
    return [];
  }

  try {
    return JSON.parse(cartSaved) as CartItem[];
  } catch {
    localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }
}

export function saveCart(cart: CartItem[]): void {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function clampQuantity(quantity: number, stock: number): number {
  if (!Number.isFinite(quantity)) {
    return stock > 0 ? 1 : 0;
  }

  return Math.min(Math.max(0, quantity), stock);
}

export function addProductToCart(product: Product, quantity = 1): CartItem[] {
  const cart = getCart();
  const itemIndex = cart.findIndex((item) => item.id === product.id);
  const safeQuantity = clampQuantity(quantity, product.stock);

  if (safeQuantity === 0) {
    return cart;
  }

  if (itemIndex >= 0) {
    cart[itemIndex].stock = product.stock;
    cart[itemIndex].cantidad = clampQuantity(cart[itemIndex].cantidad + safeQuantity, product.stock);
  } else {
    cart.push({
      id: product.id,
      nombre: product.nombre,
      precio: product.precio,
      cantidad: safeQuantity,
      stock: product.stock,
      imagen: product.imagen,
      categoria: product.categorias[0]?.nombre ?? "Sin categoria",
    });
  }

  saveCart(cart);
  return cart;
}

export function updateCartItemQuantity(productId: number, quantity: number, stock?: number): CartItem[] {
  const cart = getCart();
  const nextCart = cart
    .map((item) => {
      if (item.id !== productId) {
        return item;
      }

      const itemStock = stock ?? item.stock ?? quantity;

      return {
        ...item,
        stock: itemStock,
        cantidad: clampQuantity(quantity, itemStock),
      };
    })
    .filter((item) => item.cantidad > 0);

  saveCart(nextCart);
  return nextCart;
}

export function removeCartItem(productId: number): CartItem[] {
  const nextCart = getCart().filter((item) => item.id !== productId);
  saveCart(nextCart);
  return nextCart;
}

export function clearCart(): void {
  localStorage.removeItem(CART_STORAGE_KEY);
}

export function getCartTotal(cart: CartItem[]): number {
  return cart.reduce((total, item) => total + item.precio * item.cantidad, 0);
}

export function getCartQuantity(cart: CartItem[] = getCart()): number {
  return cart.reduce((total, item) => total + item.cantidad, 0);
}
