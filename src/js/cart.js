import {
  formatCurrency,
  getCartItems,
  groupCartItems,
  loadHeaderFooter,
  removeProductFromCart,
  renderListWithTemplate,
  updateCartCount,
  imageExists,          // ✅ FIXED
  setLocalStorage,       // ✅ FIXED
  updateProductQuantity
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
      <div class="cart-card__quantity-controls">
       <button class="btn-qty decrease" data-id="${item.Id}">-</button>
       <span class="cart-card__qty-num">${item.quantity}</span>
       <button class="btn-qty increase" data-id="${item.Id}">+</button>
      </div>
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
// cartListElement.addEventListener("click", (event) => {
//   const removeButton = event.target.closest(".cart-card__remove");

//   if (!removeButton) return;

//   removeProductFromCart(removeButton.dataset.id);
//   renderCartContents();
// });
// ✅ Nuevo Event Listener (Reemplaza al anterior)
cartListElement.addEventListener("click", (event) => {
  const target = event.target;

  // 1. Lógica para el botón "Remove" (Existente)
  const removeButton = target.closest(".cart-card__remove");
  if (removeButton) {
    removeProductFromCart(removeButton.dataset.id);
    renderCartContents();
    return; // Salimos para evitar ejecutar lo de abajo
  }

  // 2. Lógica para los botones de cantidad (+ / -)
  const qtyButton = target.closest(".btn-qty");
  if (qtyButton) {
    const id = qtyButton.dataset.id;
    const cartItems = getCartItems();
    const item = cartItems.find((i) => i.Id === id);

    if (item) {
      // Determinamos la nueva cantidad
      const newQty = qtyButton.classList.contains("increase")
        ? (item.quantity || 1) + 1
        : (item.quantity || 1) - 1;

      // Usamos la función que ya tenemos en utils.mjs
      // Si la cantidad llega a 0, updateProductQuantity llamará internamente a removeProductFromCart
      updateProductQuantity(id, newQty);
      renderCartContents();
    }
  }
});

// ✅ INITIAL LOAD (VERY IMPORTANT)
renderCartContents();
loadHeaderFooter();