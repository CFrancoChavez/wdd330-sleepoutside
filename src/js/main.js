import ExternalServices from "./ExternalServices.mjs";
import ProductList from "./ProductList.mjs";
import QuickView from "./QuickView.mjs";
import Alert from "./Alert.js";
import { loadHeaderFooter, updateCartCount } from "./utils.mjs";

await loadHeaderFooter();

const dataSource = new ExternalServices("tents");
const listElement = document.querySelector(".product-list");
const productList = new ProductList("tents", dataSource, listElement, 4); // Limit to 4 products
const alertList = new Alert();

void alertList.init();
await productList.init();

// Initialize Quick View for homepage products
const quickView = new QuickView(dataSource);
quickView.init();

updateCartCount();
