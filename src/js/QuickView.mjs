import { formatCurrency } from "./utils.mjs";

export default class QuickView {
  constructor(dataSource, modalId = "quick-view-modal") {
    this.dataSource = dataSource;
    this.modalId = modalId;
    this.modal = document.getElementById(modalId);
    this.isLoading = false;
    this.hoverTimeout = null;
  }

  init() {
    // Set up event delegation for product card hovers
    document.addEventListener("mouseenter", (e) => {
      const productCard = e.target.closest(".product-card");
      if (productCard) {
        const productId = productCard.getAttribute("data-product-id");
        // Add a small delay before opening to prevent accidental opens
        this.hoverTimeout = setTimeout(() => {
          this.openQuickView(productId);
        }, 300);
      }
    }, true);

    // Close when mouse leaves the card
    document.addEventListener("mouseleave", (e) => {
      const productCard = e.target.closest(".product-card");
      if (productCard) {
        clearTimeout(this.hoverTimeout);
        // Add a small delay before closing to allow moving to modal
        setTimeout(() => {
          if (this.modal && !this.modal.matches(":hover")) {
            this.closeQuickView();
          }
        }, 200);
      }
    }, true);

    // Keep modal open while hovering over it
    if (this.modal) {
      this.modal.addEventListener("mouseenter", () => {
        clearTimeout(this.hoverTimeout);
      });

      this.modal.addEventListener("mouseleave", () => {
        this.closeQuickView();
      });
    }

    // Set up close button functionality
    const closeBtn = this.modal?.querySelector(".modal__close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeQuickView());
    }

    // Close modal when clicking outside of modal content
    if (this.modal) {
      this.modal.addEventListener("click", (e) => {
        if (e.target === this.modal) {
          this.closeQuickView();
        }
      });
    }

    // Close modal with Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.modal && !this.modal.hidden) {
        this.closeQuickView();
      }
    });
  }

  async openQuickView(productId) {
    if (this.isLoading || !this.modal) return;

    try {
      this.isLoading = true;

      // Show modal in loading state
      this.modal.hidden = false;
      const modalContent = this.modal.querySelector(".modal__content");
      if (modalContent) {
        modalContent.innerHTML = '<p class="quick-view__loading">Loading product details...</p>';
      }

      // Fetch product details
      const product = await this.dataSource.findProductById(productId);

      if (!product) {
        this.displayError("Product not found");
        return;
      }

      // Display product in modal
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
    if (!modalContent) return;

    // Calculate discount if applicable
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
              <p>${product.Description || "No description available"}</p>
            </div>
          </div>

          <a href="?product=${product.Id}" class="button-link quick-view__view-details">View Full Details</a>
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
    if (this.modal) {
      this.modal.hidden = true;
    }
    clearTimeout(this.hoverTimeout);
  }
}
