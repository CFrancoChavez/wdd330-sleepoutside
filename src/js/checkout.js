import { loadHeaderFooter, updateCartCount, getCartItems, formatCurrency } from "./utils.mjs";
import ProductData from "./ProductData.mjs";

await loadHeaderFooter();

// Get cart items and display them on checkout page
const cartItems = getCartItems();
const checkoutItems = document.querySelector("#checkout-items");
const checkoutTotal = document.querySelector("#checkout-total");
const placeOrderBtn = document.querySelector("#place-order");

if (!cartItems || cartItems.length === 0) {
  if (checkoutItems) {
    checkoutItems.innerHTML = '<p>Your cart is empty. Add items before checking out.</p>';
  }
  if (placeOrderBtn) placeOrderBtn.disabled = true;
} else {
  // Display each cart item
  const dataSource = new ProductData("tents"); // Category doesn't matter for findProductById
  let total = 0;

  const itemPromises = cartItems.map(async (item) => {
    try {
      // Fetch full product details
      const fullProduct = await dataSource.findProductById(item.Id);
      
      if (!fullProduct) {
        return null;
      }

      const unitPrice = Number(item.FinalPrice || item.SuggestedRetailPrice || 0);
      const quantity = Number(item.quantity || 1);
      const lineTotal = unitPrice * quantity;
      total += lineTotal;

      // Create checkout item element
      const li = document.createElement("li");
      li.className = "cart-card";
      li.innerHTML = `
        <img class="cart-card__image" src="${fullProduct.Image}" alt="${fullProduct.Name}" />
        <div>
          <h3>${fullProduct.Brand?.Name || "Unknown Brand"}</h3>
          <p>${fullProduct.NameWithoutBrand || fullProduct.Name}</p>
          ${fullProduct.Colors && fullProduct.Colors[0] ? `<p class="product__color">${fullProduct.Colors[0].ColorName}</p>` : ""}
          <p>Qty: ${quantity}</p>
        </div>
        <div class="cart-card__pricing">
          <span class="cart-card__price-each">${formatCurrency(unitPrice)} each</span>
          <span class="cart-card__price">${formatCurrency(lineTotal)}</span>
        </div>
      `;
      return li;
    } catch (e) {
      console.error(`Error loading product ${item.Id}:`, e);
      
      // Fallback: show basic cart item
      const li = document.createElement("li");
      li.className = "cart-card";
      li.innerHTML = `
        <div>
          <h3>Product</h3>
          <p>${item.NameWithoutBrand || item.Name || "Unknown Product"}</p>
        </div>
        <div class="cart-card__pricing">
          <span class="cart-card__price-each">${formatCurrency(item.FinalPrice || item.SuggestedRetailPrice || 0)} each</span>
          <span class="cart-card__price">${formatCurrency((item.FinalPrice || item.SuggestedRetailPrice || 0) * (item.quantity || 1))}</span>
          <span>Qty: ${item.quantity || 1}</span>
        </div>
      `;

      total += Number(item.FinalPrice || item.SuggestedRetailPrice || 0) * Number(item.quantity || 1);
      return li;
    }
  });

  // Wait for all products to load
  const items = await Promise.all(itemPromises);
  const validItems = items.filter((item) => item !== null);

  if (checkoutItems) {
    validItems.forEach((item) => checkoutItems.appendChild(item));
  }

  // Update total
  if (checkoutTotal) {
    checkoutTotal.textContent = formatCurrency(total);
  }
}

// Handle place order button - show confirmation modal first
if (placeOrderBtn) {
  placeOrderBtn.addEventListener("click", () => {
    const confirmModal = document.querySelector("#confirm-order-modal");
    if (confirmModal) {
      confirmModal.hidden = false;
    }
  });
}

// Handle confirm checkout button
const confirmCheckoutBtn = document.querySelector("#confirm-checkout-btn");
if (confirmCheckoutBtn) {
  confirmCheckoutBtn.addEventListener("click", () => {
    // Clear cart
    localStorage.removeItem("so-cart");
    updateCartCount();
    
    // Hide confirmation modal
    const confirmModal = document.querySelector("#confirm-order-modal");
    if (confirmModal) {
      confirmModal.hidden = true;
    }
    
    // Show success modal
    const successModal = document.querySelector("#success-order-modal");
    if (successModal) {
      successModal.hidden = false;
    }
  });
}

// Handle continue shopping from confirmation modal
const continueFromConfirmBtn = document.querySelector("#continue-from-confirm-btn");
if (continueFromConfirmBtn) {
  continueFromConfirmBtn.addEventListener("click", () => {
    const confirmModal = document.querySelector("#confirm-order-modal");
    if (confirmModal) {
      confirmModal.hidden = true;
    }
  });
}

// Handle continue shopping from success modal
const continueFromSuccessBtn = document.querySelector("#continue-from-success-btn");
if (continueFromSuccessBtn) {
  continueFromSuccessBtn.addEventListener("click", () => {
    // Navigate to cart page (which will be empty)
    window.location.href = "../cart/";
  });
}
