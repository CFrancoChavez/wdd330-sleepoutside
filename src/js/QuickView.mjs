import { formatCurrency } from "./utils.mjs";

export default class QuickView {
  constructor(dataSource, modalId = "quick-view-modal") {
    this.dataSource = dataSource;
    this.modalId = modalId;
    this.modal = document.getElementById(modalId);
    this.isLoading = false;
    this.isOpen = false;
    this.hoverTimeout = null;
    this.currentProductCard = null;
    
    if (!this.modal) {
      console.warn(`QuickView: Modal with id "${modalId}" not found. Quick view will not work.`);
    }
  }

  init() {
    if (!this.modal) {
      console.error("QuickView: Cannot initialize without modal element");
      return;
    }

    console.log("QuickView: Initialization successful", this.modalId);

    // Track all product cards for hover events
    document.addEventListener("mouseenter", (e) => {
      const productCard = e.target.closest(".product-card");
      if (productCard && !this.isLoading && !this.isOpen) {
        this.currentProductCard = productCard;
        const productId = productCard.getAttribute("data-product-id");
        if (productId) {
          console.log("QuickView: Product card hovered, ID:", productId);
          this.hoverTimeout = setTimeout(() => {
            this.openQuickView(productId);
          }, 300);
        }
      }
    }, true);

    // Close when mouse leaves the card
    document.addEventListener("mouseleave", (e) => {
      const productCard = e.target.closest(".product-card");
      if (productCard && productCard === this.currentProductCard) {
        console.log("QuickView: Mouse left product card");
        clearTimeout(this.hoverTimeout);
        // Close if modal is open and mouse is not over modal
        setTimeout(() => {
          if (this.isOpen && this.modal) {
            this.closeQuickView();
          }
        }, 50);
      }
    }, true);

    // Keep modal open while hovering over it
    this.modal.addEventListener("mouseenter", () => {
      console.log("QuickView: Mouse entered modal, keeping open");
      clearTimeout(this.hoverTimeout);
    });

    // Close when mouse leaves modal
    this.modal.addEventListener("mouseleave", () => {
      console.log("QuickView: Mouse left modal");
      this.closeQuickView();
    });

    // Close when clicking on overlay
    const overlay = this.modal.querySelector(".modal__overlay");
    if (overlay) {
      overlay.addEventListener("click", () => {
        console.log("QuickView: Overlay clicked");
        this.closeQuickView();
      });
    }

    // Close with Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) {
        console.log("QuickView: Escape key pressed");
        this.closeQuickView();
      }
    });
  }

  async openQuickView(productId) {
    if (this.isLoading || this.isOpen || !this.modal) {
      console.log("QuickView: Cannot open - loading:", this.isLoading, "already open:", this.isOpen);
      return;
    }

    try {
      this.isLoading = true;
      console.log("QuickView: Opening modal for product ID:", productId);

      // Show modal in loading state
      this.modal.hidden = false;
      this.isOpen = true;
      
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
    console.log("QuickView: Closing modal, was open:", this.isOpen);
    if (this.modal && this.isOpen) {
      this.modal.hidden = true;
      this.isOpen = false;
      this.currentProductCard = null;
      clearTimeout(this.hoverTimeout);
      console.log("QuickView: Modal closed and reset");
    }
  }
}
