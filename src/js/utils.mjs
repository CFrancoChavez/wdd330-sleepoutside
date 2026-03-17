// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
// or a more concise version if you are into that sort of thing:
// export const qs = (selector, parent = document) => parent.querySelector(selector);

// retrieve data from localstorage
export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}
// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
// set a listener for both touchend and click
export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}

export function getCartItems() {
  return getLocalStorage("so-cart") || [];
}

export function addProductToCart(product) {
  const cart = getCartItems();
  
  // Check if item already exists in cart
  const existingItem = cart.find((item) => item.Id === product.Id);
  
  if (existingItem) {
    // Item exists - increment quantity and update lineTotal
    existingItem.quantity = (existingItem.quantity || 1) + 1;
    existingItem.lineTotal = (existingItem.lineTotal || Number(existingItem.FinalPrice)) + Number(product.FinalPrice);
  } else {
    // Item doesn't exist - add with quantity 1
    const newItem = {
      ...product,
      quantity: 1,
      lineTotal: Number(product.FinalPrice),
    };
    cart.push(newItem);
  }
  
  setLocalStorage("so-cart", cart);
  return cart;
}

export function removeProductFromCart(productId) {
  const cart = getCartItems();
  const itemIndex = cart.findIndex((item) => item.Id === productId);

  if (itemIndex === -1) {
    return cart;
  }

  cart.splice(itemIndex, 1);
  setLocalStorage("so-cart", cart);
  return cart;
}

export function updateProductQuantity(productId, quantity) {
  const cart = getCartItems();
  const item = cart.find((cartItem) => cartItem.Id === productId);

  if (!item) {
    return cart;
  }

  if (quantity <= 0) {
    return removeProductFromCart(productId);
  }

  item.quantity = quantity;
  item.lineTotal = (item.FinalPrice || item.SuggestedRetailPrice) * quantity;
  setLocalStorage("so-cart", cart);
  return cart;
}

export function groupCartItems(cartItems) {
  return cartItems.reduce((groups, item) => {
    const existingItem = groups.find((group) => group.Id === item.Id);

    if (existingItem) {
      existingItem.quantity += item.quantity || 1;
      existingItem.lineTotal += item.lineTotal || Number(item.FinalPrice);
      return groups;
    }

    groups.push({
      ...item,
      quantity: item.quantity || 1,
      lineTotal: item.lineTotal || Number(item.FinalPrice),
    });
    return groups;
  }, []);
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function updateCartCount() {
  const count = getCartItems().length;
  const badge = document.querySelector(".cart-count");
  if (!badge) return;
  if (count === 0) {
    badge.hidden = true;
    badge.textContent = "";
  } else {
    badge.textContent = count;
    badge.hidden = false;
  }
}

export function imageExists(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = src;
  });
}

export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

function getSiteBasePath() {
  const modulePath = new URL(import.meta.url).pathname;
  const markers = ["/src/js/utils.mjs", "/js/utils.mjs", "/assets/"];

  for (const marker of markers) {
    const markerIndex = modulePath.indexOf(marker);
    if (markerIndex >= 0) {
      return modulePath.slice(0, markerIndex);
    }
  }

  return "";
}

function resolveTemplatePath(path) {
  if (!path.startsWith("/")) {
    return path;
  }

  const siteBasePath = getSiteBasePath();
  return `${siteBasePath}${path}`;
}

function normalizeAssetPaths(container) {
  const siteBasePath = getSiteBasePath();

  if (!siteBasePath) {
    return;
  }

  container.querySelectorAll("[href^='/'], [src^='/']").forEach((element) => {
    const attr = element.hasAttribute("href") ? "href" : "src";
    const value = element.getAttribute(attr);

    if (!value || value.startsWith("//")) {
      return;
    }

    element.setAttribute(attr, `${siteBasePath}${value}`);
  });
}

export async function loadTemplate(path) {
  const response = await fetch(resolveTemplatePath(path));

  if (!response.ok) {
    throw new Error(`Unable to load template: ${path}`);
  }

  return response.text();
}

export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  normalizeAssetPaths(parentElement);

  if (callback) {
    callback(data);
  }
}

export async function loadHeaderFooter() {
  const headerElement = document.querySelector("#main-header");
  const footerElement = document.querySelector("#main-footer");

  if (!headerElement && !footerElement) {
    return;
  }

  const [headerTemplate, footerTemplate] = await Promise.all([
    loadTemplate("/partials/header.html"),
    loadTemplate("/partials/footer.html"),
  ]);

  if (headerElement) {
    renderWithTemplate(headerTemplate, headerElement);
  }

  if (footerElement) {
    renderWithTemplate(footerTemplate, footerElement);
  }
}

export function renderListWithTemplate(
  templateFn,
  parentElement,
  list,
  position = "afterbegin",
  clear = false,
) {
  if (clear) {
    parentElement.innerHTML = "";
  }

  const htmlStrings = list.map(templateFn);
  parentElement.insertAdjacentHTML(position, htmlStrings.join(""));
}
