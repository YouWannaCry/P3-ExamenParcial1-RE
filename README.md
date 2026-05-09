# Food Store - Evaluacion Programacion III

Aplicacion frontend desarrollada con Vite y TypeScript para la Evaluacion 1 de Programacion III. El proyecto extiende el repositorio base con un catalogo dinamico de productos, busqueda por nombre, filtro por categoria y carrito persistente con `localStorage`.

## Funcionalidades

- Catalogo de productos renderizado dinamicamente desde datos locales.
- Catalogo organizado por secciones de categorias.
- Menu hamburguesa con filtro de categoria de seleccion unica.
- Imagenes fijas y representativas por categoria de producto.
- Busqueda de productos por nombre.
- Filtro por categorias.
- Agregado de productos al carrito.
- Selector de cantidad en el catalogo con limite por stock disponible.
- Persistencia del carrito en `localStorage`.
- Vista de carrito con nombre, precio, cantidad, subtotales y total general.
- Controles para aumentar, disminuir, editar cantidades, quitar productos y vaciar el carrito.
- Validacion del carrito contra el catalogo para corregir precios o stock alterados en `localStorage`.
- Modo claro/oscuro persistente para catalogo y carrito.
- Redireccion de fallback para evitar bucles al ingresar a rutas incorrectas.

## Tecnologias

- HTML5
- CSS3
- JavaScript
- TypeScript
- Vite

## Instalacion y ejecucion

Instalar dependencias:

```bash
pnpm install
```

Levantar el servidor de desarrollo:

```bash
pnpm dev
```

La aplicacion estara disponible en:

```text
http://localhost:5173
```

Tambien se puede ingresar directamente a:

```text
http://localhost:5173/store/menu
http://localhost:5173/store/cart
```

## Build

Para generar la version de produccion:

```bash
pnpm build
```

Las paginas del parcial estan registradas en `vite.config.ts` dentro de `build.rollupOptions.input`. Los archivos se mantienen en `src/pages/store/` como pide la consigna, y Vite agrega aliases limpios para `/store/menu` y `/store/cart`.

## Estructura principal

```text
src/
├── data/
│   └── data.ts
├── pages/
│   └── store/
│       ├── home/
│       │   ├── home.html
│       │   └── home.ts
│       └── cart/
│           ├── cart.html
│           └── cart.ts
├── types/
│   ├── category.ts
│   └── product.ts
└── utils/
    └── cart.ts
```
