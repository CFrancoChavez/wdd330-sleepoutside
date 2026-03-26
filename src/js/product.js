import { getParam, loadHeaderFooter } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";
import ProductDetails from "./ProductDetails.mjs";
import QuickView from "./QuickView.mjs";

await loadHeaderFooter();

const productId = getParam("product");
const categoryParam = getParam("category") || "tents";
const dataSource = new ExternalServices(categoryParam);

const product = new ProductDetails(productId, dataSource);

// Initialize Quick View modal
const quickView = new QuickView(dataSource);
quickView.init();

// Update breadcrumb link to go back to the correct category
const breadcrumbBack = document.querySelector("#breadcrumb-back");
if (breadcrumbBack && categoryParam) {
  breadcrumbBack.href = `../../product_listing/index.html?category=${categoryParam}`;
  const categoryName = categoryParam
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  breadcrumbBack.textContent = categoryName;
}

// After product loads, update breadcrumb with product name
product.init().then(() => {
  const breadcrumbProduct = document.querySelector("#breadcrumb-product");
  const productSection = document.querySelector(".product-detail");
  const productName = productSection?.querySelector("h2")?.textContent;
  if (breadcrumbProduct && productName) {
    breadcrumbProduct.textContent = productName;
  }
});
