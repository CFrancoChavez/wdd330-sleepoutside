import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import { loadHeaderFooter, getParam } from "./utils.mjs";

await loadHeaderFooter();

const category = getParam("category");

if (!category) {
  document.querySelector(".product-list").innerHTML =
    "<p>Please select a category.</p>";
} else {
  const dataSource = new ProductData(category);
  const listElement = document.querySelector(".product-list");

  const myList = new ProductList(category, dataSource, listElement);
  myList.init();

  // Update page title
  const pageTitle = document.querySelector("#page-title");
  const breadcrumbCategory = document.querySelector("#breadcrumb-category");
  if (pageTitle || breadcrumbCategory) {
    const categoryName = category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    if (pageTitle) pageTitle.textContent = `Top Products: ${categoryName}`;
    if (breadcrumbCategory) breadcrumbCategory.textContent = categoryName;
  }
}
