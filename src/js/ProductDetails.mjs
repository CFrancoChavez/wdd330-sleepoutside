import { addProductToCart, formatCurrency, imageExists, updateCartCount } from "./utils.mjs";

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
    this.feedbackTimeout = null;
    this.selectedQuantity = 1;
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
    
    // Add quantity control listeners
    document
      .querySelector(".product-qty-minus")
      ?.addEventListener("click", this.decrementQuantity.bind(this));
    
    document
      .querySelector(".product-qty-plus")
      ?.addEventListener("click", this.incrementQuantity.bind(this));
  }

  addProductToCart() {
    // Add product with selected quantity to cart
    const cart = JSON.parse(localStorage.getItem("so-cart") || "[]");
    const existingItem = cart.find((item) => item.Id === this.product.Id);
    
    if (existingItem) {
      // Increment existing item's quantity
      existingItem.quantity = (existingItem.quantity || 1) + this.selectedQuantity;
      existingItem.lineTotal = existingItem.lineTotal + (Number(this.product.FinalPrice) * this.selectedQuantity);
    } else {
      // Add new item with selected quantity
      const newItem = {
        ...this.product,
        quantity: this.selectedQuantity,
        lineTotal: Number(this.product.FinalPrice) * this.selectedQuantity,
      };
      cart.push(newItem);
    }
    
    localStorage.setItem("so-cart", JSON.stringify(cart));
    updateCartCount();
    this.showAddedToCartFeedback();
    this.selectedQuantity = 1;
    this.updateQuantityDisplay();
  }

  incrementQuantity() {
    this.selectedQuantity += 1;
    this.updateQuantityDisplay();
  }

  decrementQuantity() {
    if (this.selectedQuantity > 1) {
      this.selectedQuantity -= 1;
      this.updateQuantityDisplay();
    }
  }

  updateQuantityDisplay() {
    const quantityDisplay = document.querySelector(".product-qty-display");
    if (quantityDisplay) {
      quantityDisplay.textContent = this.selectedQuantity;
    }
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
    
    // Calculate discount percentage
    let discountText = '';
    if (isDiscounted) {
      const discountAmount = this.product.SuggestedRetailPrice - this.product.FinalPrice;
      const discountPercent = Math.round((discountAmount / this.product.SuggestedRetailPrice) * 100);
      discountText = `${discountPercent}% OFF`;
    }

    productSection.innerHTML = `
      <h3>${this.product.Brand?.Name || "Unknown Brand"}</h3>
      <h2 class="divider">${this.product.NameWithoutBrand || this.product.Name}</h2>
      ${isDiscounted ? `<span class="product-card__discount">${discountText}</span>` : ''}
      <img
        class="divider"
        src="${this.product.Image}"
        alt="${this.product.Name}"
      />
      <p class="product-card__price">${formatCurrency(this.product.FinalPrice)}</p>
      ${isDiscounted ? `<p class="product__original-price"><s>${formatCurrency(this.product.SuggestedRetailPrice)}</s></p>` : ''}
      <p class="product__color">${(this.product.Colors && this.product.Colors[0]?.ColorName) || "Standard"}</p>
      <p class="product__description">${this.product.DescriptionHtmlSimple || ""}</p>
      <div class="product-detail__quantity">
        <label>Quantity:</label>
        <div class="product-qty-control">
          <button class="qty-btn product-qty-minus" type="button">−</button>
          <span class="product-qty-display">${this.selectedQuantity}</span>
          <button class="qty-btn product-qty-plus" type="button">+</button>
        </div>
      </div>
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