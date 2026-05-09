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

export function addProductToCart(product: Product): CartItem[] {
  const cart = getCart();
  const itemIndex = cart.findIndex((item) => item.id === product.id);

  if (itemIndex >= 0) {
    cart[itemIndex].cantidad += 1;
  } else {
    cart.push({
      id: product.id,
      nombre: product.nombre,
      precio: product.precio,
      cantidad: 1,
      imagen: product.imagen,
      categoria: product.categorias[0]?.nombre ?? "Sin categoria",
    });
  }

  saveCart(cart);
  return cart;
}

export function updateCartItemQuantity(productId: number, quantity: number): CartItem[] {
  const cart = getCart();
  const nextCart = cart
    .map((item) =>
      item.id === productId ? { ...item, cantidad: Math.max(0, quantity) } : item
    )
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
