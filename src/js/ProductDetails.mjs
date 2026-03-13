import { addProductToCart, formatCurrency, imageExists, updateCartCount } from "./utils.mjs";

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
    this.feedbackTimeout = null;
  }

  async init() {
    this.product = await this.dataSource.findProductById(this.productId);

    if (!this.product) {
      this.renderMissingProduct();
      return;
    }

    const hasImage = await imageExists(this.product.Image);

    if (!hasImage) {
      this.renderMissingProduct();
      return;
    }

    this.renderProductDetails();
    updateCartCount();

    document
      .getElementById("addToCart")
      .addEventListener("click", this.addProductToCart.bind(this));
  }

  addProductToCart() {
    addProductToCart(this.product);
    updateCartCount();
    this.showAddedToCartFeedback();
  }

  showAddedToCartFeedback() {
    let feedback = document.querySelector(".cart-feedback");

    if (!feedback) {
      feedback = document.createElement("div");
      feedback.className = "cart-feedback";
      feedback.setAttribute("role", "status");
      feedback.setAttribute("aria-live", "polite");
      document.body.append(feedback);
    }

    feedback.textContent = `${this.product.NameWithoutBrand} added to cart.`;
    feedback.classList.add("cart-feedback--visible");

    window.clearTimeout(this.feedbackTimeout);
    this.feedbackTimeout = window.setTimeout(() => {
      feedback.classList.remove("cart-feedback--visible");
    }, 2000);
  }

  renderProductDetails() {
    const productSection = document.querySelector(".product-detail");
    const isDiscounted = this.product.FinalPrice < this.product.SuggestedRetailPrice;

    productSection.innerHTML = `
      <h3>${this.product.Brand.Name}</h3>
      <h2 class="divider">${this.product.NameWithoutBrand}</h2>
      ${isDiscounted ? '<span class="product-card__discount">Sale</span>' : ''}
      <img
        class="divider"
        src="${this.product.Image}"
        alt="${this.product.Name}"
      />
      <p class="product-card__price">${formatCurrency(this.product.FinalPrice)}</p>
      <p class="product__color">${this.product.Colors[0].ColorName}</p>
      <p class="product__description">${this.product.DescriptionHtmlSimple}</p>
      <div class="product-detail__add">
        <button id="addToCart" data-id="${this.product.Id}">Add to Cart</button>
      </div>
    `;
  }

  renderMissingProduct() {
    const productSection = document.querySelector(".product-detail");
    productSection.innerHTML = `
      <h2 class="divider">Product unavailable</h2>
      <p>This product cannot be shown because its image is missing.</p>
      <p><a href="/index.html">Return to products</a></p>
    `;
  }
}