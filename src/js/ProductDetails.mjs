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
    // 1. Obtener datos del producto
    this.product = await this.dataSource.findProductById(this.productId);

    if (!this.product) {
      this.renderMissingProduct();
      return;
    }

    // 2. Verificar si la imagen existe (UX)
    const hasImage = await imageExists(this.product.Image);
    if (!hasImage) {
      this.renderMissingProduct();
      return;
    }

    // 3. Renderizar el HTML en el DOM
    this.renderProductDetails();
    
    // 4. Actualizar el contador del carrito al cargar
    updateCartCount();

    // 5. ASIGNAR EVENTOS (Debe ser después de renderizar)
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Botón principal de añadir al carrito
    const addToCartBtn = document.getElementById("addToCart");
    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", this.addToCartHandler.bind(this));
    }

    // Controles de cantidad
    document
      .querySelector(".product-qty-minus")
      ?.addEventListener("click", this.decrementQuantity.bind(this));

    document
      .querySelector(".product-qty-plus")
      ?.addEventListener("click", this.incrementQuantity.bind(this));
  }

  addToCartHandler() {
  const cart = JSON.parse(localStorage.getItem("so-cart") || "[]");
  const existingItem = cart.find((item) => item.Id === this.product.Id);
  
  const finalPrice = Number(this.product.FinalPrice || 0);

  if (existingItem) {
    existingItem.quantity = (Number(existingItem.quantity) || 1) + this.selectedQuantity;
    // Recalculamos el lineTotal para que sea persistente
    existingItem.lineTotal = existingItem.quantity * finalPrice;
  } else {
    // IMPORTANTE: Guardamos una copia de this.product para tener Name, Image, etc.
    const newItem = {
      ...this.product,
      quantity: this.selectedQuantity,
      lineTotal: finalPrice * this.selectedQuantity,
    };
    cart.push(newItem);
  }
    
    localStorage.setItem("so-cart", JSON.stringify(cart));
    
    // Actualizar UI
    updateCartCount();
    this.showAddedToCartFeedback();
    
    // Opcional: Resetear cantidad a 1 después de añadir
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

    feedback.textContent = `${this.product.NameWithoutBrand} added to cart!`;
    feedback.classList.add("cart-feedback--visible");

    window.clearTimeout(this.feedbackTimeout);
    this.feedbackTimeout = window.setTimeout(() => {
      feedback.classList.remove("cart-feedback--visible");
    }, 3000);
  }

  renderProductDetails() {
    const productSection = document.querySelector(".product-detail");
    if (!productSection) return;

    // --- LÓGICA DE DESCUENTO SEMANA 02 ---
    const retail = this.product.SuggestedRetailPrice;
    const final = this.product.FinalPrice;
    const isDiscounted = final < retail;
    const discountPercent = isDiscounted ? Math.round(((retail - final) / retail) * 100) : 0;

    productSection.innerHTML = `
      <h3>${this.product.Brand?.Name || "Unknown Brand"}</h3>
      <h2 class="divider">${this.product.NameWithoutBrand || this.product.Name}</h2>
      
      <div class="price-container">
        ${isDiscounted ? `<span class="product-card__discount">-${discountPercent}% OFF</span>` : ''}
        <p class="product-card__price">${formatCurrency(final)}</p>
        ${isDiscounted ? `<p class="product__original-price">MSRP: <s>${formatCurrency(retail)}</s></p>` : ''}
      </div>

      <img
        class="divider"
        src="${this.product.Image}"
        alt="${this.product.Name}"
      />
      
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
    if (productSection) {
      productSection.innerHTML = `
        <h2 class="divider">Product unavailable</h2>
        <p>Sorry, we couldn't load the product details at this time.</p>
        <p><a href="../index.html">Return to home</a></p>
      `;
    }
  }
}