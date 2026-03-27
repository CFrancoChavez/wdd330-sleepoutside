import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import Alert from "./Alert.js";
import { loadHeaderFooter, updateCartCount } from "./utils.mjs";

await loadHeaderFooter();

const dataSource = new ProductData("tents");
const listElement = document.querySelector(".product-list");
const productList = new ProductList("tents", dataSource, listElement, 4); // Limit to 4 products
const alertList = new Alert();

void alertList.init();
productList.init();
updateCartCount();
