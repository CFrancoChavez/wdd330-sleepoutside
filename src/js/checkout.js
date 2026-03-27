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
    // We tried to bring in data from the API, but if it fails (e.g. product not found), we fall back to the item data from LocalStorage.
    const fullProduct = await dataSource.findProductById(item.Id);
    
    const productData = fullProduct || item;

    // We ensure numeric values ​​are used to avoid the "undefined" error.
    const unitPrice = Number(productData.FinalPrice || productData.SuggestedRetailPrice || 0);
    const quantity = Number(item.quantity || 1);
    const lineTotal = unitPrice * quantity;
    
    total += lineTotal;

    // We create the element with the data we have (API or LocalStorage)
    const li = document.createElement("li");
    li.className = "cart-card";
    
    // If there's no image in the API, we try the item's image, otherwise a default one
    const imgUrl = productData.Image || "../images/no-image.png"; 

    li.innerHTML = `
      <img class="cart-card__image" src="${imgUrl}" alt="${productData.Name}" />
      <div>
        <h3>${productData.Brand?.Name || "Brand"}</h3>
        <p>${productData.NameWithoutBrand || productData.Name || "Product"}</p>
        ${productData.Colors?.[0] ? `<p class="product__color">${productData.Colors[0].ColorName}</p>` : ""}
        <p>Qty: ${quantity}</p>
      </div>
      <div class="cart-card__pricing">
        <span class="cart-card__price-each">${formatCurrency(unitPrice)} each</span>
        <span class="cart-card__price">${formatCurrency(lineTotal)}</span>
      </div>
    `;
    return li;

  } catch (e) {
    // The catch function now only catches catastrophic errors, not "product not found" errors.
    console.error("Error crítico en item:", e);
    const li = document.createElement("li");
    li.innerHTML = `<p>Error loading ${item.Name || "item"}</p>`;
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
