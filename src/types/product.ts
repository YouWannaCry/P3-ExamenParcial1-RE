import type { ICategory } from "./category";

export interface Product {
  id: number;
  eliminado: boolean;
  createdAt: string;
  nombre: string;
  precio: number;
  descripcion: string;
  stock: number;
  imagen: string;
  disponible: boolean;
  categorias: ICategory[];
}

export interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  stock: number;
  imagen: string;
  categoria: string;
}
