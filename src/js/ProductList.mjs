import { imageExists, renderListWithTemplate } from "./utils.mjs";

function getSiteBasePath() {
  const modulePath = new URL(import.meta.url).pathname;
  const markers = ["/src/js/ProductList.mjs", "/js/ProductList.mjs", "/assets/"];

  for (const marker of markers) {
    const markerIndex = modulePath.indexOf(marker);
    if (markerIndex >= 0) {
      return modulePath.slice(0, markerIndex);
    }
  }

  return "";
}

// function productCardTemplate(product) {
//   const isDiscounted = product.FinalPrice < product.SuggestedRetailPrice;
//   const siteBasePath = getSiteBasePath();
//   const productPageUrl = `${siteBasePath}/product_pages/index.html?product=${product.Id}`;
//   return `<li class="product-card">
//     <a href="${productPageUrl}">
//       <img src="${product.Image}" alt="${product.Name}">
//       ${isDiscounted ? '<span class="product-card__discount">Sale</span>' : ''}
//       <h3 class="card__brand">${product.Brand.Name}</h3>
//       <h2 class="card__name">${product.NameWithoutBrand}</h2>
//       <p class="product-card__price">$${product.FinalPrice}</p>
//     </a>
//   </li>`;
// }
function productCardTemplate(product, category) {
  // 1. Cálculo del descuento (MSRP vs FinalPrice)
  const retail = product.SuggestedRetailPrice;
  const final = product.FinalPrice;
  const savings = retail - final;
  const isDiscounted = savings > 0.01; // Verificamos si hay descuento real
  
  // 2. Calculamos el porcentaje de ahorro
  const discountPercent = isDiscounted ? Math.round((savings / retail) * 100) : 0;

  const siteBasePath = getSiteBasePath();
  const productPageUrl = `${siteBasePath}/product_pages/index.html?product=${product.Id}&category=${category}`;

  return `<li class="product-card" data-product-id="${product.Id}">
    <a href="${productPageUrl}">
      <img src="${product.Image}" alt="${product.Name}">
      
      ${isDiscounted ? `<span class="product-card__discount">-${discountPercent}% OFF</span>` : ''}
      
      <h3 class="card__brand">${product.Brand.Name}</h3>
      <h2 class="card__name">${product.NameWithoutBrand}</h2>
      
      <p class="product-card__price">
        ${isDiscounted ? `<span class="original-price"><s>$${retail.toFixed(2)}</s></span> ` : ''}
        $${final.toFixed(2)}
      </p>
    </a>
    <button type="button" class="product-card__quick-view" data-product-id="${product.Id}" aria-label="Quick view ${product.NameWithoutBrand}">Quick View</button>
  </li>`;
}

export default class ProductList {
  constructor(category, dataSource, listElement, limit = null) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
    this.limit = limit;
    this.allProducts = [];
    this.isExpanded = false;
  }

  async init() {
    const list = await this.dataSource.getData();
    const imageChecks = await Promise.all(
      list.map(async (product) => ({
        product,
        hasImage: await imageExists(product.Image),
      })),
    );

    const filteredList = imageChecks
      .filter((result) => result.hasImage)
      .map((result) => result.product);

    this.allProducts = filteredList;
    this.renderList(filteredList);
  }

  renderList(list) {
    // If limit is set and not expanded, only show limited items
    const displayList = this.limit && !this.isExpanded 
      ? list.slice(0, this.limit) 
      : list;
    
    // Create a wrapper template function that includes the category
    const templateWithCategory = (product) => productCardTemplate(product, this.category);
    renderListWithTemplate(templateWithCategory, this.listElement, displayList, "afterbegin", true);

    // Remove any existing "More Products" button
    const existingBtn = this.listElement.parentElement?.querySelector(".more-products-btn");
    if (existingBtn) {
      existingBtn.remove();
    }

    // Add "More Products" button if there are more items than limit AND not yet expanded
    if (this.limit && this.allProducts.length > this.limit && !this.isExpanded) {
      const moreButton = document.createElement("button");
      moreButton.className = "more-products-btn";
      moreButton.textContent = "More Products";
      moreButton.addEventListener("click", () => {
        this.isExpanded = true;
        this.renderList(this.allProducts);
      });
      this.listElement.parentElement.appendChild(moreButton);
    }
  }
}