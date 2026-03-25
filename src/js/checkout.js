import { loadHeaderFooter, updateCartCount, getCartItems, formatCurrency, alertMessage } from "./utils.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";

await loadHeaderFooter();

// Initialize checkout process
const checkout = new CheckoutProcess();
await checkout.init();

// Get DOM elements
const checkoutItems = document.querySelector("#checkout-items");
const checkoutForm = document.querySelector("#checkoutForm");

// Display cart items
if (checkout.list && checkout.list.length > 0) {
  const itemPromises = checkout.list.map(async (item) => {
    try {
      const li = document.createElement("li");
      li.className = "cart-card";
      
      const unitPrice = Number(item.FinalPrice || 0);
      const quantity = Number(item.quantity || 1);
      const lineTotal = unitPrice * quantity;
      
      const imgUrl = item.Image || "../images/no-image.png";

      li.innerHTML = `
        <img class="cart-card__image" src="${imgUrl}" alt="${item.Name}" />
        <div>
          <h3>${item.Brand?.Name || "Brand"}</h3>
          <p>${item.NameWithoutBrand || item.Name || "Product"}</p>
          ${item.Colors?.[0] ? `<p class="product__color">${item.Colors[0].ColorName}</p>` : ""}
          <p>Qty: ${quantity}</p>
        </div>
        <div class="cart-card__pricing">
          <span class="cart-card__price-each">${formatCurrency(unitPrice)} each</span>
          <span class="cart-card__price">${formatCurrency(lineTotal)}</span>
        </div>
      `;
      return li;
    } catch (e) {
      console.error("Error loading item:", e);
      const li = document.createElement("li");
      li.innerHTML = `<p>Error loading ${item.Name || "item"}</p>`;
      return li;
    }
  });

  const items = await Promise.all(itemPromises);
  if (checkoutItems) {
    items.forEach((item) => checkoutItems.appendChild(item));
  }
} else {
  if (checkoutItems) {
    checkoutItems.innerHTML = '<p>Your cart is empty. Add items before checking out.</p>';
  }
  if (checkoutForm) {
    checkoutForm.style.display = "none";
  }
}

// Update order summary
function updateOrderSummary() {
  document.querySelector("#summary-subtotal").textContent = formatCurrency(checkout.itemTotal);
  document.querySelector("#summary-tax").textContent = formatCurrency(checkout.tax);
  document.querySelector("#summary-shipping").textContent = formatCurrency(checkout.shipping);
  document.querySelector("#summary-total").textContent = formatCurrency(checkout.orderTotal);
}

updateOrderSummary();

// Handle form submission with validation
if (checkoutForm) {
  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Check form validity
    const isValid = checkoutForm.checkValidity();
    checkoutForm.reportValidity();
    
    if (!isValid) {
      alertMessage("Please fill in all required fields correctly.", true);
      return;
    }
    
    try {
      // Show confirmation modal
      const confirmModal = document.querySelector("#confirm-order-modal");
      if (confirmModal) {
        confirmModal.hidden = false;
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      alertMessage("An error occurred. Please try again.", true);
    }
  });
}

// Handle confirm checkout button
const confirmCheckoutBtn = document.querySelector("#confirm-checkout-btn");
if (confirmCheckoutBtn) {
  confirmCheckoutBtn.addEventListener("click", async () => {
    try {
      // Send order to server
      const result = await checkout.checkout(checkoutForm);
      
      console.log("Order placed successfully:", result);
      
      // Clear cart
      localStorage.removeItem("so-cart");
      updateCartCount();
      
      // Hide confirmation modal
      const confirmModal = document.querySelector("#confirm-order-modal");
      if (confirmModal) {
        confirmModal.hidden = true;
      }
      
      // Redirect to success page
      window.location.href = "./success.html";
    } catch (error) {
      console.error("Error placing order:", error);
      
      // Hide confirmation modal
      const confirmModal = document.querySelector("#confirm-order-modal");
      if (confirmModal) {
        confirmModal.hidden = true;
      }
      
      // Show error message
      let errorMessage = "There was an error placing your order. Please try again.";
      if (error && error.message) {
        if (typeof error.message === 'object') {
          errorMessage = JSON.stringify(error.message);
        } else {
          errorMessage = error.message;
        }
      }
      
      alertMessage(errorMessage, true);
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
