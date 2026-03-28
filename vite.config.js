import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  // Mantenemos el root en src para que Vite sepa dónde buscar el código fuente
  root: "src/",
  base: "/", 

  build: {
    // El outDir sale un nivel hacia arriba para que la carpeta dist quede fuera de src
    outDir: "../dist",
    rollupOptions: {
      input: {
        // CORRECCIÓN: Al estar el root en 'src/', 
        // resolve(__dirname, "src/...") es la forma correcta de apuntar 
        // físicamente al archivo desde el archivo de configuración.
        main: resolve(__dirname, "src/index.html"),
        cart: resolve(__dirname, "src/cart/index.html"),
        checkout: resolve(__dirname, "src/checkout/index.html"),
        success: resolve(__dirname, "src/checkout/success.html"),
        product: resolve(__dirname, "src/product_pages/index.html"),
        productListing: resolve(__dirname, "src/product_listing/index.html"),
      },
    },
  },
});