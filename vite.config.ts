import { defineConfig } from "vite";
import { resolve } from "path";
import { readFileSync } from "fs";

const storeRouteAliases = () => {
  const devRoutes: Record<string, string> = {
    "/store/menu": resolve(__dirname, "src/pages/store/home/home.html"),
    "/store/cart": resolve(__dirname, "src/pages/store/cart/cart.html"),
  };

  const previewRoutes: Record<string, string> = {
    "/store/menu": resolve(__dirname, "dist/src/pages/store/home/home.html"),
    "/store/cart": resolve(__dirname, "dist/src/pages/store/cart/cart.html"),
  };

  return {
    name: "store-route-aliases",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const route = request.url?.split("?")[0].replace(/\/$/, "") ?? "";
        const filePath = devRoutes[route];

        if (!filePath) {
          next();
          return;
        }

        const html = await server.transformIndexHtml(route, readFileSync(filePath, "utf-8"));
        response.statusCode = 200;
        response.setHeader("Content-Type", "text/html");
        response.end(html);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((request, response, next) => {
        const route = request.url?.split("?")[0].replace(/\/$/, "") ?? "";
        const filePath = previewRoutes[route];

        if (!filePath) {
          next();
          return;
        }

        response.statusCode = 200;
        response.setHeader("Content-Type", "text/html");
        response.end(readFileSync(filePath, "utf-8"));
      });
    },
  };
};

export default defineConfig({
  plugins: [storeRouteAliases()],
  build: {
    rollupOptions: {
      input: {
        //d:aplicaion/dist/
        index: resolve(__dirname, "index.html"),
        login: resolve(__dirname, "src/pages/auth/login/login.html"),
        registro: resolve(__dirname, "src/pages/auth/registro/registro.html"),
        adminHome: resolve(__dirname, "src/pages/admin/home/home.html"),
        clientHome: resolve(__dirname, "src/pages/client/home/home.html"),
        storeHome: resolve(__dirname, "src/pages/store/home/home.html"),
        storeCart: resolve(__dirname, "src/pages/store/cart/cart.html"),
      },
    },
  },
  base: "./",
});
