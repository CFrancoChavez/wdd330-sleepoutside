import {
  formatCurrency,
  getCartItems,
  groupCartItems,
  loadHeaderFooter,
  removeProductFromCart,
  renderListWithTemplate,
  updateCartCount,
} from "./utils.mjs";

const cartListElement = document.querySelector(".cart-list");
const cartEmptyElement = document.querySelector(".cart-empty");
const cartFooterElement = document.querySelector(".cart-footer");
const cartTotalElement = document.querySelector(".cart-total__amount");

function stripHtml(htmlString) {
  const content = document.createElement("div");
  content.innerHTML = htmlString;
  return content.textContent.trim();
}

function cartItemTemplate(item) {
  const description = stripHtml(item.DescriptionHtmlSimple);

  // ✅ Correct path logic (important fix)
  const detailsPath = window.location.pathname.includes("/cart/")
    ? `../product_pages/?product=${item.Id}`
    : `./product_pages/?product=${item.Id}`;

  return `<li class="cart-card divider">
    <a href="${detailsPath}" class="cart-card__image">
      <img src="${item.Image}" alt="${item.Name}" />
    </a>
    <div class="cart-card__details">
      <a href="${detailsPath}" class="cart-card__name-link">
        <h3 class="card__name">${item.NameWithoutBrand}</h3>
      </a>
      <p class="cart-card__brand">${item.Brand.Name}</p>
      <p class="cart-card__description">${description}</p>
      <p class="cart-card__color">Color: ${item.Colors[0].ColorName}</p>
    </div>
    <div class="cart-card__pricing">
      <p class="cart-card__price-each">${formatCurrency(item.FinalPrice)} each</p>
      <p class="cart-card__quantity-display">Qty: ${item.quantity}</p>
      <p class="cart-card__price">${formatCurrency(item.lineTotal)}</p>
    </div>
    <button class="cart-card__remove" type="button" data-id="${item.Id}" aria-label="Remove ${item.NameWithoutBrand} from cart">Remove</button>
  </li>`;
}

function updateCartSummary(groupedCartItems) {
  const total = groupedCartItems.reduce((sum, item) => sum + item.lineTotal, 0);
  cartTotalElement.textContent = formatCurrency(total);
  cartFooterElement.hidden = groupedCartItems.length === 0;
  cartEmptyElement.hidden = groupedCartItems.length !== 0;
  
  // Disable checkout button if cart is empty
  const checkoutLink = cartFooterElement?.querySelector("a.button-link");
  if (checkoutLink) {
    if (groupedCartItems.length === 0) {
      checkoutLink.classList.add("disabled");
      checkoutLink.style.cursor = "not-allowed";
      checkoutLink.setAttribute("aria-disabled", "true");
      checkoutLink.addEventListener("click", (e) => e.preventDefault(), true);
    } else {
      checkoutLink.classList.remove("disabled");
      checkoutLink.style.cursor = "pointer";
      checkoutLink.removeAttribute("aria-disabled");
    }
  }
}

async function renderCartContents() {
  const cartItems = getCartItems();

  const imageChecks = await Promise.all(
    cartItems.map(async (item) => ({
      item,
      hasImage: await imageExists(item.Image),
    }))
  );

  const filteredItems = imageChecks
    .filter((result) => result.hasImage)
    .map((result) => result.item);

  if (filteredItems.length !== cartItems.length) {
    setLocalStorage("so-cart", filteredItems);
  }

  const groupedCartItems = groupCartItems(filteredItems);

  renderListWithTemplate(
    cartItemTemplate,
    cartListElement,
    groupedCartItems,
    "afterbegin",
    true
  );

  updateCartSummary(groupedCartItems);
  updateCartCount();
}

// ✅ Event listener
cartListElement.addEventListener("click", (event) => {
  const removeButton = event.target.closest(".cart-card__remove");

  if (!removeButton) return;

  removeProductFromCart(removeButton.dataset.id);
  void renderCartContents();
});

// ✅ FIXED (removed the extra dot)
void renderCartContents();
  if (removeButton) {
    removeProductFromCart(removeButton.dataset.id);
    void renderCartContents();
  }
});

await loadHeaderFooter();
void renderCartContents();
