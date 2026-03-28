import { formatCurrency } from "./utils.mjs";

export default class QuickView {
  constructor(dataSource, modalId = "quick-view-modal", category = "tents") {
    this.dataSource = dataSource;
    this.modalId = modalId;
    this.modal = document.getElementById(modalId);
    this.isLoading = false;
    this.isOpen = false;
    this.hoverTimeout = null;
    this.category = category;
    
    if (!this.modal) {
      console.warn(`QuickView: Modal with id "${modalId}" not found. Quick view will not work.`);
    }
  }

  init() {
    if (!this.modal) {
      console.error("QuickView: Cannot initialize without modal element");
      return;
    }

    // 1. Abrir modal tras 1 segundo de hover en una tarjeta de producto
    document.addEventListener("mouseenter", (e) => {
      const productCard = e.target.closest(".product-card");
      if (productCard && !this.isLoading && !this.isOpen) {
        const productId = productCard.getAttribute("data-product-id");
        if (productId) {
          clearTimeout(this.hoverTimeout);
          this.hoverTimeout = setTimeout(() => {
            this.openQuickView(productId);
          }, 1000);
        }
      }
    }, true);

    // 2. Cancelar el timeout si el mouse sale de la tarjeta
    document.addEventListener("mouseleave", (e) => {
      const productCard = e.target.closest(".product-card");
      if (productCard) {
        clearTimeout(this.hoverTimeout);
      }
    }, true);

    // 3. DELEGACIÓN DE EVENTOS PARA CERRAR (X y Overlay)
    // Escuchamos clics en todo el contenedor del modal
    this.modal.addEventListener("click", (e) => {
      // Detecta si el clic fue en el botón de cerrar (o en la X dentro de él)
      const isCloseButton = e.target.closest(".modal__close");
      // Detecta si el clic fue en el fondo oscuro (overlay)
      const isOverlay = e.target.classList.contains("modal__overlay");

      if (isCloseButton || isOverlay) {
        this.closeQuickView();
      }
    });

    // 4. Cerrar con la tecla Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) {
        this.closeQuickView();
      }
    });
  }

  async openQuickView(productId) {
    if (this.isLoading || this.isOpen || !this.modal) {
      return;
    }

    try {
      this.isLoading = true;
      this.modal.hidden = false;
      this.isOpen = true;
      
      const modalContent = this.modal.querySelector(".modal__content");
      if (modalContent) {
        modalContent.innerHTML = '<p class="quick-view__loading">Loading product details...</p>';
      }

      const product = await this.dataSource.findProductById(productId);

      if (!product) {
        this.displayError("Product not found");
        return;
      }

      this.displayProduct(product);
    } catch (error) {
      console.error("Error loading product for quick view:", error);
      this.displayError("Error loading product details. Please try again.");
    } finally {
      this.isLoading = false;
    }
  }

  displayProduct(product) {
    const modalContent = this.modal?.querySelector(".modal__content");
    if (!modalContent) {
      return;
    }

    const retail = product.SuggestedRetailPrice || product.FinalPrice;
    const final = product.FinalPrice;
    const isDiscounted = final < retail;
    const discountPercent = isDiscounted ? Math.round(((retail - final) / retail) * 100) : 0;

    const colors = product.Colors && product.Colors.length > 0 
      ? product.Colors.map((c) => c.ColorName).join(", ")
      : "N/A";

    modalContent.innerHTML = `
      <div class="quick-view__container">
        <div class="quick-view__image-section">
          <img src="${product.Image}" alt="${product.Name}" class="quick-view__image">
          ${isDiscounted ? `<span class="product-card__discount">-${discountPercent}% OFF</span>` : ''}
        </div>
        <div class="quick-view__details-section">
          <h3 class="quick-view__brand">${product.Brand?.Name || "Brand"}</h3>
          <h2 class="quick-view__name">${product.NameWithoutBrand || product.Name}</h2>
          
          <div class="quick-view__price">
            ${isDiscounted ? `<span class="quick-view__original-price"><s>${formatCurrency(retail)}</s></span>` : ''}
            <span class="quick-view__final-price">${formatCurrency(final)}</span>
          </div>

          <div class="quick-view__info">
            <div class="quick-view__info-item">
              <strong>Colors:</strong>
              <p>${colors}</p>
            </div>
            <div class="quick-view__info-item">
              <strong>Description:</strong>
              <p>${product.DescriptionHtmlSimple || product.Description || "No description available"}</p>
            </div>
          </div>

          <a href="../../product_pages/index.html?product=${product.Id}&category=${this.category}" class="button-link quick-view__view-details">View Full Details</a>
        </div>
      </div>
    `;
  }

  displayError(message) {
    const modalContent = this.modal?.querySelector(".modal__content");
    if (modalContent) {
      modalContent.innerHTML = `<p class="quick-view__error">${message}</p>`;
    }
  }

  closeQuickView() {
    if (this.modal && this.isOpen) {
      this.modal.hidden = true;
      this.isOpen = false;
      clearTimeout(this.hoverTimeout);
    }
  }
}