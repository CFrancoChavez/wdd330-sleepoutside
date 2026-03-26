import { formatCurrency } from "./utils.mjs";

export default class QuickView {
  constructor(dataSource, modalId = "quick-view-modal") {
    this.dataSource = dataSource;
    this.modalId = modalId;
    this.modal = document.getElementById(modalId);
    this.isLoading = false;
    this.hoverTimeout = null;
    
    // Log if modal is not found
    if (!this.modal) {
      console.warn(`QuickView: Modal with id "${modalId}" not found. Quick view will not work.`);
    }
  }

  init() {
    // Only initialize if modal exists
    if (!this.modal) {
      console.error("QuickView: Cannot initialize without modal element");
      return;
    }

    console.log("QuickView: Initialization successful", this.modalId);

    // Set up event delegation for product card hovers
    document.addEventListener("mouseover", (e) => {
      const productCard = e.target.closest(".product-card");
      if (productCard && !this.isLoading) {
        const productId = productCard.getAttribute("data-product-id");
        if (productId) {
          console.log("QuickView: Product card hovered, ID:", productId);
          this.hoverTimeout = setTimeout(() => {
            this.openQuickView(productId);
          }, 300);
        }
      }
    });

    // Close when mouse leaves the card
    document.addEventListener("mouseout", (e) => {
      const productCard = e.target.closest(".product-card");
      if (productCard) {
        console.log("QuickView: Mouse left product card");
        clearTimeout(this.hoverTimeout);
        setTimeout(() => {
          if (this.modal && !this.modal.matches(":hover")) {
            console.log("QuickView: Closing modal");
            this.closeQuickView();
          }
        }, 200);
      }
    });

    // Keep modal open while hovering over it
    this.modal.addEventListener("mouseenter", () => {
      console.log("QuickView: Modal hovered, keeping open");
      clearTimeout(this.hoverTimeout);
    });

    this.modal.addEventListener("mouseleave", () => {
      console.log("QuickView: Mouse left modal");
      this.closeQuickView();
    });

    // Set up close button functionality
    const closeBtn = this.modal.querySelector(".modal__close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeQuickView());
    }

    // Close modal when clicking outside of modal content
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.closeQuickView();
      }
    });

    // Close modal with Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !this.modal.hidden) {
        this.closeQuickView();
      }
    });
  }

  async openQuickView(productId) {
    if (this.isLoading || !this.modal) {
      console.log("QuickView: Cannot open - loading:", this.isLoading, "modal exists:", !!this.modal);
      return;
    }

    try {
      this.isLoading = true;
      console.log("QuickView: Opening modal for product ID:", productId);

      // Show modal in loading state
      this.modal.hidden = false;
      console.log("QuickView: Modal hidden attribute:", this.modal.hidden);
      
      const modalContent = this.modal.querySelector(".modal__content");
      if (modalContent) {
        modalContent.innerHTML = '<p class="quick-view__loading">Loading product details...</p>';
        console.log("QuickView: Loading content displayed");
      }

      // Fetch product details
      const product = await this.dataSource.findProductById(productId);

      if (!product) {
        console.log("QuickView: Product not found");
        this.displayError("Product not found");
        return;
      }

      console.log("QuickView: Product loaded successfully", product.Name);
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
    if (!modalContent) {
      console.log("QuickView: Modal content element not found");
      return;
    }

    console.log("QuickView: Displaying product", product.Name);

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
    console.log("QuickView: Closing modal");
    if (this.modal) {
      this.modal.hidden = true;
      console.log("QuickView: Modal hidden");
    }
    clearTimeout(this.hoverTimeout);
  }
}
